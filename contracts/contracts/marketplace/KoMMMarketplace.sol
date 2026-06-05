// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoMMMarketplace
 * @notice Dezentraler NFT-Marktplatz mit Direktverkauf, Auktionen und Angeboten.
 *
 * GEBÜHRENMODELL:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Aktion              │ Gebühr                            │
 * ├─────────────────────┼───────────────────────────────────┤
 * │ Minting             │ KOSTENLOS                         │
 * │ Transfer/Senden     │ KOSTENLOS                         │
 * │ Listing erstellen   │ KOSTENLOS                         │
 * │ Listing abbrechen   │ KOSTENLOS                         │
 * │ VERKAUF             │ Plattformgebühr (z.B. 2.5%)      │
 * └─────────────────────────────────────────────────────────┘
 *
 * Bei einem Verkauf wird automatisch:
 * 1. Plattformgebühr abgezogen → Treasury
 * 2. Creator-Royalty abgezogen → Creator (EIP-2981)
 * 3. Rest → Verkäufer
 */
contract KoMMMarketplace is Ownable, ReentrancyGuard {

    // ─── Konfiguration ───────────────────────────────────────────────────────────

    uint256 public platformFeeBps = 250; // 2.5% (250 Basispunkte)
    uint256 public constant MAX_FEE_BPS = 1000; // Max 10%
    address public treasury;

    // ─── Datenstrukturen ─────────────────────────────────────────────────────────

    enum ListingType { FixedPrice, Auction }
    enum TokenStandard { ERC721, ERC1155 }

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 amount;          // 1 für ERC721, >1 für ERC1155
        uint256 price;           // Festpreis oder Mindestgebot
        uint256 endTime;         // 0 = kein Zeitlimit (nur FixedPrice)
        ListingType listingType;
        TokenStandard tokenStandard;
        bool active;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // Listing-ID Counter
    uint256 public nextListingId = 1;

    // Listings
    mapping(uint256 => Listing) public listings;

    // Höchstes Gebot pro Listing
    mapping(uint256 => Bid) public highestBids;

    // Rückzahlbare Gebote (überbotene Bieter)
    mapping(address => uint256) public pendingWithdrawals;

    // ─── Events ──────────────────────────────────────────────────────────────────

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        ListingType listingType
    );

    event Sale(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyAmount
    );

    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 amount
    );

    event ListingCancelled(uint256 indexed listingId);
    event AuctionSettled(uint256 indexed listingId, address indexed winner, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(address treasury_) Ownable(msg.sender) {
        require(treasury_ != address(0), "Invalid treasury");
        treasury = treasury_;
    }

    // ─── Listing erstellen (KOSTENLOS) ───────────────────────────────────────────

    /**
     * @notice Erstelle ein Listing (Festpreis oder Auktion). KOSTENLOS.
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        uint256 duration,
        ListingType listingType,
        TokenStandard tokenStandard
    ) external returns (uint256) {
        require(price > 0, "Price must be > 0");

        // Prüfe Besitz und Freigabe
        if (tokenStandard == TokenStandard.ERC721) {
            require(amount == 1, "ERC721: amount must be 1");
            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
            require(
                nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
                "Not approved"
            );
        } else {
            IERC1155 nft = IERC1155(nftContract);
            require(nft.balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
            require(nft.isApprovedForAll(msg.sender, address(this)), "Not approved");
        }

        uint256 endTime = 0;
        if (listingType == ListingType.Auction) {
            require(duration > 0, "Auction needs duration");
            endTime = block.timestamp + duration;
        }

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: price,
            endTime: endTime,
            listingType: listingType,
            tokenStandard: tokenStandard,
            active: true
        });

        emit Listed(listingId, msg.sender, nftContract, tokenId, price, listingType);

        return listingId;
    }

    // ─── Direktkauf (Gebühr NUR hier) ────────────────────────────────────────────

    /**
     * @notice Kaufe ein NFT zum Festpreis. Plattformgebühr + Royalty werden abgezogen.
     */
    function buy(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.FixedPrice, "Not fixed price");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        listing.active = false;

        // Gebühren berechnen und verteilen
        (uint256 platformFee, uint256 royaltyAmount, uint256 sellerProceeds) =
            _calculateFees(listing.nftContract, listing.tokenId, listing.price);

        // NFT transferieren
        _transferNFT(listing, msg.sender);

        // Zahlungen verteilen
        _distributeFunds(listing.seller, listing.nftContract, listing.tokenId, platformFee, royaltyAmount, sellerProceeds);

        // Überzahlung zurückgeben
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit Sale(listingId, msg.sender, listing.seller, listing.price, platformFee, royaltyAmount);
    }

    // ─── Auktionen ───────────────────────────────────────────────────────────────

    /**
     * @notice Gebot abgeben (Kapital wird gesperrt).
     */
    function placeBid(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp < listing.endTime, "Auction ended");
        require(msg.value >= listing.price, "Below minimum price");
        require(msg.sender != listing.seller, "Cannot bid on own listing");

        Bid storage currentHighest = highestBids[listingId];

        if (currentHighest.bidder != address(0)) {
            require(msg.value > currentHighest.amount, "Bid too low");
            // Vorheriges Gebot rückzahlbar machen
            pendingWithdrawals[currentHighest.bidder] += currentHighest.amount;
        }

        highestBids[listingId] = Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        });

        emit BidPlaced(listingId, msg.sender, msg.value);
    }

    /**
     * @notice Auktion abschließen (kann von jedem nach Ablauf aufgerufen werden).
     * Gebühr wird NUR hier beim erfolgreichen Verkauf erhoben.
     */
    function settleAuction(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp >= listing.endTime, "Auction not ended");

        listing.active = false;

        Bid storage winningBid = highestBids[listingId];

        if (winningBid.bidder == address(0)) {
            // Keine Gebote – NFT bleibt beim Verkäufer, KEINE Gebühren
            emit ListingCancelled(listingId);
            return;
        }

        // Gebühren berechnen
        (uint256 platformFee, uint256 royaltyAmount, uint256 sellerProceeds) =
            _calculateFees(listing.nftContract, listing.tokenId, winningBid.amount);

        // NFT an Gewinner transferieren
        _transferNFT(listing, winningBid.bidder);

        // Zahlungen verteilen
        _distributeFunds(listing.seller, listing.nftContract, listing.tokenId, platformFee, royaltyAmount, sellerProceeds);

        emit AuctionSettled(listingId, winningBid.bidder, winningBid.amount);
    }

    // ─── Listing abbrechen (KOSTENLOS) ───────────────────────────────────────────

    /**
     * @notice Listing abbrechen. KOSTENLOS, keine Gebühren.
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");

        // Bei Auktionen: nur wenn keine Gebote
        if (listing.listingType == ListingType.Auction) {
            require(highestBids[listingId].bidder == address(0), "Has bids, cannot cancel");
        }

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    // ─── Überbotene Gebote abholen ───────────────────────────────────────────────

    /**
     * @notice Überbotene Bieter können ihr Kapital zurückholen. KOSTENLOS.
     */
    function withdrawBid() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // ─── Admin-Funktionen ────────────────────────────────────────────────────────

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasury = newTreasury;
    }

    // ─── Interne Funktionen ──────────────────────────────────────────────────────

    function _calculateFees(
        address nftContract,
        uint256 tokenId,
        uint256 salePrice
    ) internal view returns (uint256 platformFee, uint256 royaltyAmount, uint256 sellerProceeds) {
        // Plattformgebühr
        platformFee = (salePrice * platformFeeBps) / 10000;

        // Royalty (EIP-2981)
        royaltyAmount = 0;
        try IERC2981(nftContract).royaltyInfo(tokenId, salePrice) returns (
            address, uint256 royalty
        ) {
            royaltyAmount = royalty;
        } catch {}

        // Verkäufer bekommt den Rest
        sellerProceeds = salePrice - platformFee - royaltyAmount;
    }

    function _distributeFunds(
        address seller,
        address nftContract,
        uint256 tokenId,
        uint256 platformFee,
        uint256 royaltyAmount,
        uint256 sellerProceeds
    ) internal {
        // Plattformgebühr an Treasury
        if (platformFee > 0) {
            payable(treasury).transfer(platformFee);
        }

        // Royalty an Creator
        if (royaltyAmount > 0) {
            (address royaltyReceiver, ) = IERC2981(nftContract).royaltyInfo(tokenId, 0);
            payable(royaltyReceiver).transfer(royaltyAmount);
        }

        // Rest an Verkäufer
        if (sellerProceeds > 0) {
            payable(seller).transfer(sellerProceeds);
        }
    }

    function _transferNFT(Listing storage listing, address to) internal {
        if (listing.tokenStandard == TokenStandard.ERC721) {
            IERC721(listing.nftContract).safeTransferFrom(listing.seller, to, listing.tokenId);
        } else {
            IERC1155(listing.nftContract).safeTransferFrom(
                listing.seller, to, listing.tokenId, listing.amount, ""
            );
        }
    }
}
