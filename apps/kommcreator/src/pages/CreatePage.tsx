import { useState } from "react";

/**
 * NFT Erstellen – Hauptseite
 *
 * Unterstützte Medientypen:
 * - Nur Bild (PNG, JPG, GIF, SVG, WEBP)
 * - Nur Video (MP4, WEBM, MOV)
 * - Nur Musik/Audio (MP3, WAV, FLAC, OGG)
 * - Bild + Musik (Album-Cover mit Song)
 * - Video + Musik (Video mit separater Tonspur)
 *
 * Minting: KOSTENLOS (Lazy Minting)
 */

type MediaType = "image" | "video" | "audio" | "image+audio" | "video+audio";
type TokenStandard = "erc721" | "erc1155";

interface NFTFormData {
  name: string;
  description: string;
  mediaType: MediaType;
  primaryFile: File | null;
  secondaryFile: File | null; // Audio-Datei bei Kombinationen
  tokenStandard: TokenStandard;
  editions: number; // 1 = Unikat (ERC-721), >1 = Edition (ERC-1155)
  royaltyPercent: number;
  price: string;
  crossList: {
    opensea: boolean;
    rarible: boolean;
    looksrare: boolean;
  };
}

const MEDIA_TYPES: { value: MediaType; label: string; description: string }[] = [
  { value: "image", label: "Nur Bild", description: "PNG, JPG, GIF, SVG, WEBP" },
  { value: "video", label: "Nur Video", description: "MP4, WEBM, MOV" },
  { value: "audio", label: "Nur Musik", description: "MP3, WAV, FLAC, OGG" },
  { value: "image+audio", label: "Bild + Musik", description: "Album-Cover mit Song" },
  { value: "video+audio", label: "Video + Musik", description: "Video mit separater Tonspur" },
];

export function CreatePage() {
  const [form, setForm] = useState<NFTFormData>({
    name: "",
    description: "",
    mediaType: "image",
    primaryFile: null,
    secondaryFile: null,
    tokenStandard: "erc721",
    editions: 1,
    royaltyPercent: 5,
    price: "0",
    crossList: { opensea: false, rarible: false, looksrare: false },
  });

  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    // 1. Medien auf IPFS hochladen
    // 2. Metadaten-JSON erstellen und auf IPFS hochladen
    // 3. Lazy-Mint-Voucher signieren (KOSTENLOS)
    // 4. Voucher in Datenbank speichern
    // 5. Optional: Cross-Listing auf externen Plattformen
    console.log("Creating NFT (KOSTENLOS):", form);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">NFT Erstellen</h1>
      <p className="text-gray-400 mb-8">
        Erstelle dein NFT komplett kostenlos. Gebühren fallen nur beim Verkauf an.
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {["Medien", "Details", "Einstellungen", "Veröffentlichen"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1
                  ? "bg-green-600"
                  : step === i + 1
                  ? "bg-purple-600"
                  : "bg-gray-700"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? "text-white" : "text-gray-500"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Medientyp & Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Medientyp wählen
            </label>
            <div className="grid grid-cols-1 gap-3">
              {MEDIA_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, mediaType: type.value })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    form.mediaType === type.value
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-gray-400 ml-2">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer">
            <p className="text-gray-400">
              Datei hierher ziehen oder klicken zum Auswählen
            </p>
            <p className="text-xs text-gray-600 mt-2">Max. 100 MB</p>
          </div>

          {/* Secondary file for combinations */}
          {(form.mediaType === "image+audio" || form.mediaType === "video+audio") && (
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-pink-500 transition-colors cursor-pointer">
              <p className="text-gray-400">
                Audio-Datei hierher ziehen (MP3, WAV, FLAC)
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Step 2: NFT Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Name deines NFTs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none h-32"
              placeholder="Beschreibe dein NFT..."
            />
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-700 rounded-lg">
              Zurück
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-purple-600 rounded-lg">
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Einstellungen */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Token-Standard</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ ...form, tokenStandard: "erc721", editions: 1 })}
                className={`p-4 rounded-lg border ${
                  form.tokenStandard === "erc721" ? "border-purple-500 bg-purple-900/20" : "border-gray-700"
                }`}
              >
                <p className="font-medium">ERC-721 (Unikat)</p>
                <p className="text-xs text-gray-400 mt-1">Einzigartiges 1/1 NFT</p>
              </button>
              <button
                onClick={() => setForm({ ...form, tokenStandard: "erc1155", editions: 10 })}
                className={`p-4 rounded-lg border ${
                  form.tokenStandard === "erc1155" ? "border-purple-500 bg-purple-900/20" : "border-gray-700"
                }`}
              >
                <p className="font-medium">ERC-1155 (Edition)</p>
                <p className="text-xs text-gray-400 mt-1">Limitierte Auflage</p>
              </button>
            </div>
          </div>

          {form.tokenStandard === "erc1155" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anzahl Editionen
              </label>
              <input
                type="number"
                min="2"
                max="10000"
                value={form.editions}
                onChange={(e) => setForm({ ...form, editions: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Royalty (Lizenzgebühr bei Weiterverkauf): {form.royaltyPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={form.royaltyPercent}
              onChange={(e) => setForm({ ...form, royaltyPercent: Number(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Du erhältst {form.royaltyPercent}% bei jedem Weiterverkauf automatisch.
            </p>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-700 rounded-lg">
              Zurück
            </button>
            <button onClick={() => setStep(4)} className="flex-1 py-3 bg-purple-600 rounded-lg">
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Veröffentlichen */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 font-medium">Minting ist KOSTENLOS</p>
            <p className="text-sm text-green-300/70 mt-1">
              Du signierst nur mit deiner Wallet. Keine Gas-Gebühren.
              Gebühren (2.5%) fallen erst beim Verkauf an.
            </p>
          </div>

          {/* Cross-Listing Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Auch listen auf (optional):
            </label>
            <div className="space-y-2">
              {[
                { key: "opensea" as const, label: "OpenSea" },
                { key: "rarible" as const, label: "Rarible" },
                { key: "looksrare" as const, label: "LooksRare" },
              ].map((platform) => (
                <label key={platform.key} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.crossList[platform.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        crossList: { ...form.crossList, [platform.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{platform.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">Eingebettet – du bleibst hier</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-gray-700 rounded-lg">
              Zurück
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all"
            >
              NFT Erstellen (Kostenlos signieren)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
