import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { ChainIndicator } from "./ChainIndicator";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/", label: "Start", icon: "🏠" },
  { path: "/create", label: "NFT Erstellen", icon: "✨" },
  { path: "/my-nfts", label: "Meine NFTs", icon: "🖼️" },
  { path: "/settings", label: "Einstellungen", icon: "⚙️" },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            KoMMcreator
          </h1>
          <p className="text-xs text-gray-500 mt-1">NFT Creator App</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-purple-900/50 text-purple-300"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <ChainIndicator />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 flex items-center justify-end px-6">
          <WalletButton />
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
