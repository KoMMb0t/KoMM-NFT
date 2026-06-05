export function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">
          Willkommen bei{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            KoMMcreator
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Erstelle NFTs aus deinen Bildern, Videos und Musik – komplett kostenlos.
          Gebühren fallen nur beim Verkauf an.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-400 mt-1">Erstellte NFTs</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-400 mt-1">Verkaufte NFTs</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-3xl font-bold text-green-400">0 ETH</p>
          <p className="text-sm text-gray-400 mt-1">Verdient (Royalties)</p>
        </div>
      </div>

      {/* Supported Media */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Unterstützte Medientypen</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Nur Bild", desc: "PNG, JPG, GIF, SVG" },
            { label: "Nur Video", desc: "MP4, WEBM, MOV" },
            { label: "Nur Musik", desc: "MP3, WAV, FLAC" },
            { label: "Bild + Musik", desc: "Cover + Song" },
            { label: "Video + Musik", desc: "Clip + Soundtrack" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3">Gebührenmodell</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">GRATIS</p>
            <p className="text-sm text-gray-400">Minting</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">GRATIS</p>
            <p className="text-sm text-gray-400">Transfer/Senden</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">2.5%</p>
            <p className="text-sm text-gray-400">Nur bei Verkauf</p>
          </div>
        </div>
      </div>
    </div>
  );
}
