/**
 * KoMM-NFT Contract Interaction Layer
 *
 * Typsichere Interaktion mit den KoMM Smart Contracts.
 * Gebührenmodell:
 * - Minting: KOSTENLOS
 * - Transfer: KOSTENLOS
 * - Verkauf: 2.5% Plattformgebühr (nur im Marketplace)
 */

// ─── Contract ABIs (minimale Interfaces) ─────────────────────────────────────

export const KoMMNFT721_ABI = [
  // Lazy Mint
  {
    name: "lazyMint",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "voucher",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Direct Mint (kostenlos)
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenURI_", type: "string" },
      { name: "royaltyBps", type: "uint96" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Batch Mint (kostenlos)
  {
    name: "batchMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenURIs", type: "string[]" },
      { name: "royaltyBps", type: "uint96" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  // View functions
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "creators",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "royaltyInfo",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "salePrice", type: "uint256" },
    ],
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" },
    ],
  },
] as const;

export const KoMMNFT1155_ABI = [
  {
    name: "createEdition",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenURI_", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "maxEditions", type: "uint256" },
      { name: "royaltyBps", type: "uint96" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "lazyMint",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "voucher",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "maxEditions", type: "uint256" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mintMore",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const KoMMMarketplace_ABI = [
  {
    name: "createListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "listingType", type: "uint8" },
      { name: "tokenStandard", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "placeBid",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "settleAuction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdrawBid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "platformFeeBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "listings",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [
      { name: "seller", type: "address" },
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "listingType", type: "uint8" },
      { name: "tokenStandard", type: "uint8" },
      { name: "active", type: "bool" },
    ],
  },
] as const;
