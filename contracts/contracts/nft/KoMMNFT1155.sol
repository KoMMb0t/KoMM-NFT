// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title KoMMNFT1155
 * @notice ERC-1155 Multi-Token Contract für Editionen/Kollektionen.
 *
 * Gebührenmodell:
 * - Minting: KOSTENLOS (Lazy Minting oder direktes Minting)
 * - Transfer/Senden: KOSTENLOS
 * - Verkauf: Gebühren NUR im Marketplace-Contract
 */
contract KoMMNFT1155 is ERC1155, ERC2981, Ownable, EIP712 {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;

    string public name;
    string public symbol;

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalSupply;
    mapping(bytes32 => bool) public signatureUsed;

    bytes32 public constant LAZY_MINT_TYPEHASH = keccak256(
        "LazyMint1155(address creator,string tokenURI,uint256 amount,uint256 maxEditions,uint96 royaltyBps,uint256 price,uint256 nonce)"
    );

    struct LazyMintVoucher {
        address creator;
        string tokenURI;
        uint256 amount;
        uint256 maxEditions;
        uint96 royaltyBps;
        uint256 price;
        uint256 nonce;
        bytes signature;
    }

    event EditionCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 maxEditions,
        string tokenURI
    );

    event LazyMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed buyer,
        uint256 amount
    );

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC1155("") EIP712("KoMMNFT1155", "1") Ownable(msg.sender) {
        name = name_;
        symbol = symbol_;
        _nextTokenId = 1;
    }

    /**
     * @notice Erstelle eine neue Edition (kostenlos für Creator).
     */
    function createEdition(
        string calldata tokenURI_,
        uint256 amount,
        uint256 maxEditions,
        uint96 royaltyBps
    ) external returns (uint256) {
        require(royaltyBps <= 5000, "Royalty too high (max 50%)");
        require(maxEditions == 0 || amount <= maxEditions, "Amount exceeds max editions");

        uint256 tokenId = _nextTokenId++;

        _tokenURIs[tokenId] = tokenURI_;
        creators[tokenId] = msg.sender;
        maxSupply[tokenId] = maxEditions;

        if (amount > 0) {
            _mint(msg.sender, tokenId, amount, "");
            totalSupply[tokenId] = amount;
        }

        _setTokenRoyalty(tokenId, msg.sender, royaltyBps);

        emit EditionCreated(tokenId, msg.sender, maxEditions, tokenURI_);
        return tokenId;
    }

    /**
     * @notice Lazy Minting für Editionen – Käufer mintet, Creator zahlt nichts.
     */
    function lazyMint(LazyMintVoucher calldata voucher) external payable returns (uint256) {
        bytes32 structHash = keccak256(abi.encode(
            LAZY_MINT_TYPEHASH,
            voucher.creator,
            keccak256(bytes(voucher.tokenURI)),
            voucher.amount,
            voucher.maxEditions,
            voucher.royaltyBps,
            voucher.price,
            voucher.nonce
        ));
        bytes32 digest = _hashTypedDataV4(structHash);

        require(!signatureUsed[keccak256(voucher.signature)], "Voucher already redeemed");

        address signer = ECDSA.recover(digest, voucher.signature);
        require(signer == voucher.creator, "Invalid signature");

        signatureUsed[keccak256(voucher.signature)] = true;

        uint256 tokenId = _nextTokenId++;

        _tokenURIs[tokenId] = voucher.tokenURI;
        creators[tokenId] = voucher.creator;
        maxSupply[tokenId] = voucher.maxEditions;

        _mint(msg.sender, tokenId, voucher.amount, "");
        totalSupply[tokenId] += voucher.amount;

        _setTokenRoyalty(tokenId, voucher.creator, voucher.royaltyBps);

        emit LazyMinted(tokenId, voucher.creator, msg.sender, voucher.amount);
        return tokenId;
    }

    /**
     * @notice Zusätzliche Kopien einer bestehenden Edition minten (nur Creator).
     */
    function mintMore(uint256 tokenId, uint256 amount) external {
        require(creators[tokenId] == msg.sender, "Only creator can mint more");
        require(
            maxSupply[tokenId] == 0 || totalSupply[tokenId] + amount <= maxSupply[tokenId],
            "Exceeds max supply"
        );

        _mint(msg.sender, tokenId, amount, "");
        totalSupply[tokenId] += amount;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
