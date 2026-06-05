// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title KoMMNFT721
 * @notice ERC-721 NFT Contract mit kostenlosem Lazy Minting und EIP-2981 Royalties.
 *
 * Gebührenmodell:
 * - Minting: KOSTENLOS (Lazy Minting via EIP-712 Signatur)
 * - Transfer/Senden: KOSTENLOS (keine Gebühren)
 * - Verkauf: Gebühren werden NUR im Marketplace-Contract erhoben
 */
contract KoMMNFT721 is ERC721, ERC721URIStorage, ERC2981, Ownable, EIP712 {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;

    // Mapping: Signatur-Hash => bereits eingelöst
    mapping(bytes32 => bool) public signatureUsed;

    // Mapping: tokenId => ursprünglicher Creator
    mapping(uint256 => address) public creators;

    // EIP-712 Typed Data für Lazy Minting
    bytes32 public constant LAZY_MINT_TYPEHASH = keccak256(
        "LazyMint(address creator,string tokenURI,uint96 royaltyBps,uint256 price,address currency,uint256 nonce)"
    );

    // Struct für Lazy-Mint-Voucher
    struct LazyMintVoucher {
        address creator;
        string tokenURI;
        uint96 royaltyBps;
        uint256 price;
        address currency;
        uint256 nonce;
        bytes signature;
    }

    event LazyMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed buyer,
        string tokenURI
    );

    event DirectMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI
    );

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) EIP712("KoMMNFT721", "1") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @notice Kostenloses Lazy Minting – Creator signiert off-chain, Käufer mintet on-chain.
     */
    function lazyMint(LazyMintVoucher calldata voucher) external payable returns (uint256) {
        bytes32 structHash = keccak256(abi.encode(
            LAZY_MINT_TYPEHASH,
            voucher.creator,
            keccak256(bytes(voucher.tokenURI)),
            voucher.royaltyBps,
            voucher.price,
            voucher.currency,
            voucher.nonce
        ));
        bytes32 digest = _hashTypedDataV4(structHash);

        require(!signatureUsed[keccak256(voucher.signature)], "Voucher already redeemed");

        address signer = ECDSA.recover(digest, voucher.signature);
        require(signer == voucher.creator, "Invalid signature");

        signatureUsed[keccak256(voucher.signature)] = true;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, voucher.tokenURI);
        _setTokenRoyalty(tokenId, voucher.creator, voucher.royaltyBps);
        creators[tokenId] = voucher.creator;

        emit LazyMinted(tokenId, voucher.creator, msg.sender, voucher.tokenURI);
        return tokenId;
    }

    /**
     * @notice Direktes kostenloses Minting für den Creator selbst.
     */
    function mint(string calldata tokenURI_, uint96 royaltyBps) external returns (uint256) {
        require(royaltyBps <= 5000, "Royalty too high (max 50%)");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _setTokenRoyalty(tokenId, msg.sender, royaltyBps);
        creators[tokenId] = msg.sender;

        emit DirectMinted(tokenId, msg.sender, tokenURI_);
        return tokenId;
    }

    /**
     * @notice Batch-Mint für Kollektionen (kostenlos für Creator).
     */
    function batchMint(
        string[] calldata tokenURIs,
        uint96 royaltyBps
    ) external returns (uint256[] memory) {
        require(tokenURIs.length <= 50, "Max 50 per batch");
        require(royaltyBps <= 5000, "Royalty too high");

        uint256[] memory tokenIds = new uint256[](tokenURIs.length);

        for (uint256 i = 0; i < tokenURIs.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            _setTokenRoyalty(tokenId, msg.sender, royaltyBps);
            creators[tokenId] = msg.sender;
            tokenIds[i] = tokenId;
        }

        return tokenIds;
    }

    /**
     * @notice Gibt die Gesamtzahl geminteter NFTs zurück.
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ─── Overrides ───────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
