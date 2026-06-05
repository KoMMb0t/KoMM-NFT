import { useState } from "react";

/**
 * KoMM Portal – Marktplatz-Hauptseite
 *
 * Zeigt alle verfügbaren NFTs an:
 * - Eigene Listings (KoMM Marketplace Contract)
 * - Aggregierte Listings von OpenSea, Rarible etc. (Konnektor-System)
 *
 * Alles eingebettet – der Nutzer verlässt niemals die Oberfläche.
 */

type ListingSource = "all" | "komm" | "opensea" | "rarible" | "blur";
type SortBy = "recent" | "price-asc" | "price-desc" | "ending-soon";

interface NFTListing {
  id: string;
  tokenId: number;
  name: string;
  image: string;
  price: string;
  currency: string;
  seller: string;
  source: ListingSource;
  endTime?: number;
  isAuction: boolean;
}

export function MarketplacePage() {
  const [source, setSource] = useState<ListingSource>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder listings
  const listings: NFTListing[] = [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marktplatz</h1>
          <p className="text-gray-400 mt-1">
            Kaufe und verkaufe NFTs – alles an einem Ort.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Source Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[
            { value: "all" as const, label: "Alle" },
            { value: "komm" as const, label: "KoMM" },
            { value: "opensea" as const, label: "OpenSea" },
            { value: "rarible" as const, label: "Rarible" },
            { value: "blur" as const, label: "Blur" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setSource(item.value)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                source === item.value
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="NFTs suchen..."
          className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
        >
          <option value="recent">Neueste</option>
          <option value="price-asc">Preis: Niedrig → Hoch</option>
          <option value="price-desc">Preis: Hoch → Niedrig</option>
          <option value="ending-soon">Endet bald</option>
        </select>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          <strong>Eingebetteter Marktplatz:</strong> Du siehst hier Listings von KoMM Portal,
          OpenSea, Rarible und Blur – alles an einem Ort. Kaufen und Verkaufen funktioniert
          direkt hier, ohne die Seite zu verlassen.
        </p>
      </div>

      {/* NFT Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl">
          <p className="text-gray-500 text-lg">Noch keine Listings vorhanden</p>
          <p className="text-gray-600 text-sm mt-2">
            Erstelle dein erstes NFT mit KoMMcreator und liste es hier zum Verkauf.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <NFTCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function NFTCard({ listing }: { listing: NFTListing }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-colors cursor-pointer">
      <div className="aspect-square bg-gray-700">
        <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <p className="font-medium truncate">{listing.name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-purple-400 font-mono">
            {listing.price} {listing.currency}
          </span>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
            {listing.source}
          </span>
        </div>
        {listing.isAuction && listing.endTime && (
          <p className="text-xs text-yellow-400 mt-2">Auktion endet bald</p>
        )}
      </div>
    </div>
  );
}
