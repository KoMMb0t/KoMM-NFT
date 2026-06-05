# KoMM-NFT

**KoMM-NFT** ist ein umfassendes NFT-Ökosystem bestehend aus zwei eigenständigen Anwendungen: **KoMMcreator** (NFT Creator App) und **KoMM Portal** (Web3 NFT Handelsplattform). Beide Projekte setzen auf eigene Smart Contracts, dezentrale Speicherung und universelle Wallet-Integration.

---

## Projektstruktur

```
KoMM-NFT/
├── docs/                          # Konzeptdokumentation
│   ├── KoMMcreator_Konzept.md     # Technisches Konzept der Creator App
│   └── KoMM_Portal_Konzept.md     # Technisches Konzept der Handelsplattform
├── contracts/                     # Solidity Smart Contracts
│   ├── nft/                       # ERC-721 & ERC-1155 NFT Contracts
│   └── marketplace/               # Marketplace Trading Contract
├── apps/
│   ├── kommcreator/               # Tauri 2.x Cross-Platform Creator App
│   └── komm-portal/               # Next.js Web-App + Tauri Desktop/Mobile
├── packages/
│   ├── shared-ui/                 # Gemeinsame UI-Komponenten
│   ├── web3-sdk/                  # Wallet-Integration & Contract-Interaktion
│   └── connectors/                # Konnektor-System (OpenSea, Rarible, etc.)
└── README.md
```

---

## KoMMcreator (NFT Creator App)

Eine Cross-Platform-Anwendung für **Windows, Linux und Android**, mit der Kreative ihre digitalen Medien als NFTs erstellen und minten können.

### Features
- **Flexible Medien-Engine:** Nur Bilder, nur Videos, nur Musik sowie Kombinationen (Bild + Musik, Video + Musik)
- **Eigener Smart Contract:** ERC-721 (Unikate) oder ERC-1155 (Editionen) mit automatischen Royalties (EIP-2981)
- **Dualer Minting-Prozess:** Direktes On-Chain Minting oder gasfreies Lazy Minting
- **Dezentrale Speicherung:** IPFS (Pinata) und Arweave
- **Universelle Wallet-Integration:** Alle bekannten Wallets via WalletConnect AppKit + EIP-6963
- **Eingebettetes Cross-Listing:** NFTs direkt aus der App auf OpenSea, Rarible etc. listen (ohne die App zu verlassen)

### Techstack
| Komponente | Technologie |
| :--- | :--- |
| Runtime | Tauri 2.x (Rust) |
| Frontend | Svelte/React + TypeScript + TailwindCSS |
| Medien-Engine | Rust + FFmpeg |
| Web3 | Ethers.js / Viem + WalletConnect AppKit |
| Speicherung | IPFS (Pinata) + Arweave |

---

## KoMM Portal (Web3 NFT Handelsplattform)

Eine vollständig eigene, dezentrale Handelsplattform als **Web-App, Desktop-App (Windows, Linux) und Android-App**.

### Features
- **Eigener Marketplace-Contract:** Direktverkauf, zeitgesteuerte Auktionen und Angebote
- **Automatische Royalty-Auszahlung:** EIP-2981 bei jedem Weiterverkauf
- **Echtzeit-Updates:** Live-Gebote und Preisänderungen via WebSockets
- **Eingebettetes Konnektor-System:** OpenSea, Rarible und weitere Plattformen direkt im KoMM Portal integriert (Nutzer verlässt niemals die Oberfläche)
- **Lazy-Minting-Support:** Gasfreie NFTs werden erst beim Kauf on-chain geprägt
- **Universelle Wallet-Integration:** Alle bekannten Wallets + Social Login (ERC-4337)

### Techstack
| Komponente | Technologie |
| :--- | :--- |
| Web-Frontend | Next.js + React + TailwindCSS |
| Desktop/Mobile | Tauri 2.x |
| Backend | NestJS (TypeScript) |
| Datenbank | PostgreSQL + Redis |
| Echtzeit | Socket.io (WebSockets) |
| Blockchain Indexer | The Graph / Subgraph |
| Web3 | Wagmi + Viem + WalletConnect AppKit |

---

## Smart Contracts

Alle Smart Contracts werden in **Solidity** geschrieben und mit **Hardhat** entwickelt, getestet und deployed.

| Contract | Standard | Funktion |
| :--- | :--- | :--- |
| `KoMMNFT721.sol` | ERC-721 + EIP-2981 | Einzigartige NFTs mit Royalties |
| `KoMMNFT1155.sol` | ERC-1155 + EIP-2981 | Editions/Kollektionen mit Royalties |
| `KoMMMarketplace.sol` | Custom | Handel, Auktionen, Angebote |
| `KoMMLazyMint.sol` | EIP-712 | Lazy Minting mit Signatur-Verifikation |

---

## Konnektor-System

Das Konnektor-System ermöglicht die nahtlose Integration externer NFT-Plattformen direkt in das KoMM-Ökosystem:

| Plattform | Protokoll/API | Funktion |
| :--- | :--- | :--- |
| **OpenSea** | Seaport Protocol + OpenSea API | Cross-Listing & Fulfillment |
| **Rarible** | Rarible Multichain SDK | Cross-Listing & Aggregation |
| **LooksRare** | LooksRare API | Cross-Listing |
| **Magic Eden** | Magic Eden API | Cross-Listing (Solana & EVM) |
| **Blur** | Blur API | Cross-Listing & Aggregation |

---

## Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).

---

## Status

> Dieses Projekt befindet sich in der **Konzeptphase**. Die Dokumentation beschreibt die geplante Architektur und den Techstack. Die Implementierung folgt in den kommenden Phasen.
