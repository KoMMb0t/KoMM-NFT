/**
 * KoMM-NFT Multi-Chain Konfiguration
 *
 * Unterstützte Chains mit automatischer Erkennung.
 * Der Nutzer muss kein Netzwerk manuell wählen – die App erkennt
 * automatisch die Chain der verbundenen Wallet.
 */

import {
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
  avalanche,
  sepolia,
  polygonAmoy,
  baseSepolia,
  arbitrumSepolia,
} from "viem/chains";
import type { Chain } from "viem";

// ─── Unterstützte Chains ─────────────────────────────────────────────────────

export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
  avalanche,
] as const;

export const TESTNET_CHAINS = [
  sepolia,
  polygonAmoy,
  baseSepolia,
  arbitrumSepolia,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

// ─── Chain-Metadaten für UI ──────────────────────────────────────────────────

export interface ChainMeta {
  id: number;
  name: string;
  nativeCurrency: string;
  icon: string;
  explorerUrl: string;
  rpcUrl: string;
}

export const CHAIN_META: Record<number, ChainMeta> = {
  1: {
    id: 1,
    name: "Ethereum",
    nativeCurrency: "ETH",
    icon: "/chains/ethereum.svg",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://eth.llamarpc.com",
  },
  137: {
    id: 137,
    name: "Polygon",
    nativeCurrency: "MATIC",
    icon: "/chains/polygon.svg",
    explorerUrl: "https://polygonscan.com",
    rpcUrl: "https://polygon-rpc.com",
  },
  8453: {
    id: 8453,
    name: "Base",
    nativeCurrency: "ETH",
    icon: "/chains/base.svg",
    explorerUrl: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org",
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    nativeCurrency: "ETH",
    icon: "/chains/arbitrum.svg",
    explorerUrl: "https://arbiscan.io",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  10: {
    id: 10,
    name: "Optimism",
    nativeCurrency: "ETH",
    icon: "/chains/optimism.svg",
    explorerUrl: "https://optimistic.etherscan.io",
    rpcUrl: "https://mainnet.optimism.io",
  },
  56: {
    id: 56,
    name: "BNB Chain",
    nativeCurrency: "BNB",
    icon: "/chains/bsc.svg",
    explorerUrl: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org",
  },
  43114: {
    id: 43114,
    name: "Avalanche",
    nativeCurrency: "AVAX",
    icon: "/chains/avalanche.svg",
    explorerUrl: "https://snowtrace.io",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  },
};

// ─── Contract-Adressen pro Chain ─────────────────────────────────────────────

export interface DeployedContracts {
  KoMMNFT721: `0x${string}`;
  KoMMNFT1155: `0x${string}`;
  KoMMMarketplace: `0x${string}`;
}

/**
 * Contract-Adressen werden nach Deployment hier eingetragen.
 * Format: chainId => Contract-Adressen
 */
export const CONTRACT_ADDRESSES: Partial<Record<number, DeployedContracts>> = {
  // Wird nach Deployment befüllt, z.B.:
  // 137: {
  //   KoMMNFT721: "0x...",
  //   KoMMNFT1155: "0x...",
  //   KoMMMarketplace: "0x...",
  // },
};

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

/**
 * Prüft ob eine Chain unterstützt wird.
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAIN_META;
}

/**
 * Gibt die Contract-Adressen für eine Chain zurück.
 * Wirft einen Fehler wenn die Chain nicht unterstützt oder nicht deployed ist.
 */
export function getContracts(chainId: number): DeployedContracts {
  const contracts = CONTRACT_ADDRESSES[chainId];
  if (!contracts) {
    throw new Error(
      `KoMM-NFT ist auf Chain ${chainId} (${CHAIN_META[chainId]?.name ?? "unbekannt"}) noch nicht deployed.`
    );
  }
  return contracts;
}

/**
 * Gibt alle Chains zurück, auf denen KoMM-NFT deployed ist.
 */
export function getDeployedChains(): ChainMeta[] {
  return Object.keys(CONTRACT_ADDRESSES)
    .map((id) => CHAIN_META[Number(id)])
    .filter(Boolean);
}
