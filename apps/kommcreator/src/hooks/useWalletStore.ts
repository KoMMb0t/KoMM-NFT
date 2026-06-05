import { create } from "zustand";

/**
 * Globaler Wallet-State mit Zustand.
 * Automatische Chain-Erkennung – kein manuelles Switching.
 */

interface WalletStore {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  chainName: string | null;
  chainSupported: boolean;
  balance: bigint | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  setWalletState: (state: Partial<WalletStore>) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  isConnected: false,
  address: null,
  chainId: null,
  chainName: null,
  chainSupported: false,
  balance: null,

  connect: () => {
    // WalletConnect Modal öffnen (wird in der App-Konfiguration initialisiert)
    // Die tatsächliche Implementierung nutzt @web3modal/wagmi
    console.log("Opening wallet connect modal...");
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      chainId: null,
      chainName: null,
      chainSupported: false,
      balance: null,
    });
  },

  setWalletState: (state) => set(state),
}));
