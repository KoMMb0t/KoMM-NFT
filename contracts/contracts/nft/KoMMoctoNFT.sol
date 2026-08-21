// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract KoMMoctoNFT is ERC721, Ownable {
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;

    uint256 private _tokenIdCounter;

    struct LazyMintVoucher {
        uint256 tokenId;
        string uri;
        address creator;
        bytes signature;
    }

    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 startPrice;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool settled;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(address => bool) public approvedCreators;

    event LazyMinted(uint256 indexed tokenId, address indexed creator, string uri);
    event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 startPrice);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 finalPrice);

    constructor() ERC721("KoMMoctoNFT", "KMCT") Ownable(msg.sender) {}

    function lazyMint(LazyMintVoucher calldata voucher) external {
        require(_verifyVoucher(voucher), "Invalid voucher signature");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);

        emit LazyMinted(tokenId, voucher.creator, voucher.uri);
    }

    function createAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(startPrice > 0, "Invalid start price");
        require(duration > 0, "Invalid duration");

        uint256 auctionId = tokenId;
        auctions[auctionId] = Auction({
            seller: msg.sender,
            tokenId: tokenId,
            startPrice: startPrice,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            highestBid: startPrice,
            settled: false
        });

        emit AuctionCreated(auctionId, tokenId, startPrice);
    }

    function placeBid(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(!auction.settled, "Auction already settled");

        if (auction.highestBidder != address(0)) {
            (bool success, ) = auction.highestBidder.call{
                value: auction.highestBid
            }("");
            require(success, "Refund failed");
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function settleAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");
        require(msg.sender == auction.seller || msg.sender == auction.highestBidder, "Not authorized");

        auction.settled = true;

        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, auction.tokenId);

            (bool success, ) = auction.seller.call{value: auction.highestBid}("");
            require(success, "Payment failed");

            emit AuctionSettled(auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    function _verifyVoucher(LazyMintVoucher calldata voucher) internal view returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(voucher.tokenId, voucher.uri, voucher.creator)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(voucher.signature);

        return signer == voucher.creator || approvedCreators[signer];
    }

    function approveCreator(address creator) external onlyOwner {
        approvedCreators[creator] = true;
    }
}
