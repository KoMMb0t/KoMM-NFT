import { useWalletStore } from "../hooks/useWalletStore";

export function WalletButton() {
  const { isConnected, address, connect, disconnect } = useWalletStore();

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 font-mono">{shortAddress}</span>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Trennen
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all"
    >
      Wallet verbinden
    </button>
  );
}
