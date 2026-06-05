export function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Einstellungen</h1>

      <div className="space-y-6">
        {/* IPFS Provider */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="font-medium mb-3">Dezentrale Speicherung</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" name="storage" defaultChecked className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">IPFS (Pinata)</p>
                <p className="text-xs text-gray-500">Standard – schnell und zuverlässig</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="storage" className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Arweave</p>
                <p className="text-xs text-gray-500">Permanente Speicherung (einmalige Zahlung)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Default Royalty */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="font-medium mb-3">Standard-Royalty</h3>
          <p className="text-sm text-gray-400 mb-3">
            Standard-Lizenzgebühr für neue NFTs (kann pro NFT geändert werden)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="50"
              defaultValue="5"
              className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center"
            />
            <span className="text-gray-400">%</span>
          </div>
        </div>

        {/* Cross-Listing Defaults */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="font-medium mb-3">Konnektor-Einstellungen</h3>
          <p className="text-sm text-gray-400 mb-3">
            Standard-Plattformen für Cross-Listing (alles eingebettet – du bleibst immer hier)
          </p>
          <div className="space-y-2">
            {["OpenSea", "Rarible", "LooksRare", "Magic Eden", "Blur"].map((platform) => (
              <label key={platform} className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">{platform}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
