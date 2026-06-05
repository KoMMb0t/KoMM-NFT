export function MyNFTsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Meine NFTs</h1>
      <p className="text-gray-400 mb-8">
        Hier siehst du alle NFTs, die du erstellt hast – auf allen Chains.
      </p>

      {/* Empty State */}
      <div className="text-center py-16 border border-dashed border-gray-700 rounded-xl">
        <p className="text-gray-500 text-lg">Noch keine NFTs erstellt</p>
        <p className="text-gray-600 text-sm mt-2">
          Verbinde deine Wallet und erstelle dein erstes NFT – kostenlos!
        </p>
      </div>
    </div>
  );
}
