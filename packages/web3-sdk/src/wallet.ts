/**
 * KoMM-NFT Wallet Integration
 *
 * Universelle Wallet-Anbindung mit automatischer Chain-Erkennung.
 * Unterstützt alle EIP-6963 kompatiblen Wallets + WalletConnect.
 *
 * Der Nutzer verbindet einfach seine Wallet – kein manuelles
 * Netzwerk-Switching nötig. Die App erkennt automatisch die Chain.
 */

import { createConfig, http } from "@wagmi/core";
import {
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
  avalanche,
} from "viem/chains";
import { SUPPORTED_CHAINS, isChainSupported, CHAIN_META } from "./chains";

// ─── Wagmi Config mit allen unterstützten Chains ─────────────────────────────

export interface KoMMWalletConfig {
  walletConnectProjectId: string;
  appName?: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
}

/**
 * Erstellt die Wagmi-Konfiguration für KoMM-NFT.
 * Alle unterstützten Chains werden automatisch konfiguriert.
 */
export function createKoMMConfig(options: KoMMWalletConfig) {
  const config = createConfig({
    chains: [mainnet, polygon, base, arbitrum, optimism, bsc, avalanche],
    transports: {
      [mainnet.id]: http("https://eth.llamarpc.com"),
      [polygon.id]: http("https://polygon-rpc.com"),
      [base.id]: http("https://mainnet.base.org"),
      [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
      [optimism.id]: http("https://mainnet.optimism.io"),
      [bsc.id]: http("https://bsc-dataseed.binance.org"),
      [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
    },
  });

  return config;
}

// ─── Wallet-Status-Typen ─────────────────────────────────────────────────────

export interface WalletState {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  chainName: string | null;
  chainSupported: boolean;
  balance: bigint | null;
}

export const INITIAL_WALLET_STATE: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  chainName: null,
  chainSupported: false,
  balance: null,
};

/**
 * Erstellt den Wallet-State aus den aktuellen Wagmi-Daten.
 * Erkennt automatisch die Chain ohne manuelles Switching.
 */
export function buildWalletState(
  address: `0x${string}` | undefined,
  chainId: number | undefined,
  balance?: bigint
): WalletState {
  if (!address || !chainId) {
    return INITIAL_WALLET_STATE;
  }

  const meta = CHAIN_META[chainId];

  return {
    isConnected: true,
    address,
    chainId,
    chainName: meta?.name ?? `Chain ${chainId}`,
    chainSupported: isChainSupported(chainId),
    balance: balance ?? null,
  };
}

// ─── Unterstützte Wallet-Typen ───────────────────────────────────────────────

export const SUPPORTED_WALLETS = [
  { id: "metamask", name: "MetaMask", icon: "/wallets/metamask.svg" },
  { id: "trust", name: "Trust Wallet", icon: "/wallets/trust.svg" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "/wallets/coinbase.svg" },
  { id: "phantom", name: "Phantom", icon: "/wallets/phantom.svg" },
  { id: "rabby", name: "Rabby", icon: "/wallets/rabby.svg" },
  { id: "rainbow", name: "Rainbow", icon: "/wallets/rainbow.svg" },
  { id: "ledger", name: "Ledger", icon: "/wallets/ledger.svg" },
  { id: "safe", name: "Safe (Gnosis)", icon: "/wallets/safe.svg" },
  { id: "walletconnect", name: "WalletConnect (QR)", icon: "/wallets/walletconnect.svg" },
] as const;
