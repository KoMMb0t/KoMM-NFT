/**
 * KoMM-NFT Lazy Minting Module
 *
 * Ermöglicht KOSTENLOSES Minting:
 * 1. Creator signiert off-chain (EIP-712) → keine Gas-Kosten
 * 2. Voucher wird in der Datenbank gespeichert
 * 3. Käufer löst den Voucher on-chain ein → Käufer zahlt Gas
 *
 * Der Creator zahlt NIEMALS für das Minting.
 */

import type { WalletClient } from "viem";

// ─── EIP-712 Domain & Types ──────────────────────────────────────────────────

export const EIP712_DOMAIN_721 = {
  name: "KoMMNFT721",
  version: "1",
} as const;

export const EIP712_DOMAIN_1155 = {
  name: "KoMMNFT1155",
  version: "1",
} as const;

export const LAZY_MINT_721_TYPES = {
  LazyMint: [
    { name: "creator", type: "address" },
    { name: "tokenURI", type: "string" },
    { name: "royaltyBps", type: "uint96" },
    { name: "price", type: "uint256" },
    { name: "currency", type: "address" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export const LAZY_MINT_1155_TYPES = {
  LazyMint1155: [
    { name: "creator", type: "address" },
    { name: "tokenURI", type: "string" },
    { name: "amount", type: "uint256" },
    { name: "maxEditions", type: "uint256" },
    { name: "royaltyBps", type: "uint96" },
    { name: "price", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

// ─── Voucher-Typen ───────────────────────────────────────────────────────────

export interface LazyMintVoucher721 {
  creator: `0x${string}`;
  tokenURI: string;
  royaltyBps: number;
  price: bigint;
  currency: `0x${string}`;
  nonce: bigint;
  signature: `0x${string}`;
}

export interface LazyMintVoucher1155 {
  creator: `0x${string}`;
  tokenURI: string;
  amount: bigint;
  maxEditions: bigint;
  royaltyBps: number;
  price: bigint;
  nonce: bigint;
  signature: `0x${string}`;
}

// ─── Signatur-Erstellung (KOSTENLOS für Creator) ─────────────────────────────

/**
 * Erstellt einen signierten Lazy-Mint-Voucher für ERC-721.
 * KOSTENLOS – nur eine Wallet-Signatur, keine Transaktion.
 */
export async function createLazyMintVoucher721(
  walletClient: WalletClient,
  params: {
    contractAddress: `0x${string}`;
    chainId: number;
    tokenURI: string;
    royaltyBps: number;
    price: bigint;
    currency?: `0x${string}`;
  }
): Promise<LazyMintVoucher721> {
  const account = walletClient.account;
  if (!account) throw new Error("Wallet nicht verbunden");

  const nonce = BigInt(Date.now()); // Einfacher Nonce basierend auf Timestamp
  const currency = params.currency ?? "0x0000000000000000000000000000000000000000";

  const message = {
    creator: account.address,
    tokenURI: params.tokenURI,
    royaltyBps: params.royaltyBps,
    price: params.price,
    currency,
    nonce,
  };

  // EIP-712 Signatur – KOSTENLOS, keine Gas-Kosten
  const signature = await walletClient.signTypedData({
    account,
    domain: {
      ...EIP712_DOMAIN_721,
      chainId: params.chainId,
      verifyingContract: params.contractAddress,
    },
    types: LAZY_MINT_721_TYPES,
    primaryType: "LazyMint",
    message,
  });

  return {
    creator: account.address,
    tokenURI: params.tokenURI,
    royaltyBps: params.royaltyBps,
    price: params.price,
    currency,
    nonce,
    signature,
  };
}

/**
 * Erstellt einen signierten Lazy-Mint-Voucher für ERC-1155 Editionen.
 * KOSTENLOS – nur eine Wallet-Signatur, keine Transaktion.
 */
export async function createLazyMintVoucher1155(
  walletClient: WalletClient,
  params: {
    contractAddress: `0x${string}`;
    chainId: number;
    tokenURI: string;
    amount: bigint;
    maxEditions: bigint;
    royaltyBps: number;
    price: bigint;
  }
): Promise<LazyMintVoucher1155> {
  const account = walletClient.account;
  if (!account) throw new Error("Wallet nicht verbunden");

  const nonce = BigInt(Date.now());

  const message = {
    creator: account.address,
    tokenURI: params.tokenURI,
    amount: params.amount,
    maxEditions: params.maxEditions,
    royaltyBps: params.royaltyBps,
    price: params.price,
    nonce,
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: {
      ...EIP712_DOMAIN_1155,
      chainId: params.chainId,
      verifyingContract: params.contractAddress,
    },
    types: LAZY_MINT_1155_TYPES,
    primaryType: "LazyMint1155",
    message,
  });

  return {
    creator: account.address,
    tokenURI: params.tokenURI,
    amount: params.amount,
    maxEditions: params.maxEditions,
    royaltyBps: params.royaltyBps,
    price: params.price,
    nonce,
    signature,
  };
}

// ─── Nonce-Generierung ───────────────────────────────────────────────────────

let nonceCounter = 0;

/**
 * Generiert einen einzigartigen Nonce für Voucher.
 * Kombination aus Timestamp und Counter verhindert Duplikate.
 */
export function generateNonce(): bigint {
  nonceCounter++;
  return BigInt(Date.now()) * BigInt(1000) + BigInt(nonceCounter);
}
