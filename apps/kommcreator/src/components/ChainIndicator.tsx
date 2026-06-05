import { useWalletStore } from "../hooks/useWalletStore";

/**
 * Zeigt die automatisch erkannte Chain an.
 * Kein manuelles Switching nötig – die App erkennt die Chain der Wallet.
 */
export function ChainIndicator() {
  const { isConnected, chainId, chainName, chainSupported } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="text-xs text-gray-500">
        Keine Wallet verbunden
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          chainSupported ? "bg-green-400" : "bg-yellow-400"
        }`}
      />
      <div className="text-xs">
        <span className={chainSupported ? "text-green-400" : "text-yellow-400"}>
          {chainName ?? `Chain ${chainId}`}
        </span>
        {!chainSupported && (
          <p className="text-yellow-500 mt-0.5">Chain nicht unterstützt</p>
        )}
      </div>
    </div>
  );
}
