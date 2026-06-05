# Konzeptdokument: KoMMcreator (Cross-Platform NFT Creator App)

Dieses Dokument beschreibt das technische und konzeptionelle Design von **KoMMcreator**, einer modernen, plattformübergreifenden NFT-Erstellungsanwendung für Windows, Linux und Android. Die Anwendung ermöglicht es Kreativen, digitale Medien zu erstellen, zu verwalten, dezentral zu speichern und über einen eigenen, maßgeschneiderten Smart Contract auf der Blockchain als NFTs zu prägen (minten). Zudem bietet sie ein integriertes Konnektor-System für das nahtlose Cross-Listing auf Drittplattformen.

---

## 1. Systemarchitektur & Cross-Platform-Techstack

Um eine native Performance auf Desktop-Betriebssystemen (Windows, Linux) sowie eine hervorragende Benutzererfahrung auf Mobilgeräten (Android) aus einer einzigen Codebasis zu gewährleisten, wird ein hybrider, ressourceneffizienter Technologiestack gewählt [1].

### Der gewählte Techstack: **Tauri 2.x + Svelte / React + Rust**

Im Gegensatz zu klassischen Electron-Anwendungen, die für jede Plattform eine vollständige Chromium-Instanz und Node.js mitliefern (was zu App-Größen von >100 MB und hohem RAM-Verbrauch führt), nutzt **Tauri 2.x** die bereits im Betriebssystem integrierten Webviews (WebView2 unter Windows, WebKitGTK unter Linux und die native Android-System-WebView) [1].

| Komponente | Technologie | Zweck |
| :--- | :--- | :--- |
| **Frontend-Framework** | Svelte (oder React) + TypeScript | Hochperformantes, reaktives UI für die Medienverwaltung und Web3-Interaktion. |
| **Styling** | TailwindCSS | Modernes, responsives Design, das sich nahtlos an Desktop- und Mobil-Bildschirme anpasst. |
| **App-Runtime** | **Tauri 2.x (mit Mobile Support)** | Cross-Platform-Brücke mit nativem Kompilierungs-Support für Windows (`.exe`/`.msi`), Linux (`.deb`/`.AppImage`) und Android (`.apk`/`.aab`) [1]. |
| **Backend / Core** | **Rust** | Performance-kritische Aufgaben wie lokale Ver- und Entschlüsselung, lokale Medienkompression, Dateisystemzugriff und sichere API-Kommunikation. |
| **Web3-Schnittstelle** | Ethers.js / Viem | JavaScript-Bibliotheken zur Interaktion mit der Blockchain über RPC-Knoten [2]. |

---

## 2. Flexibles Medien-Engine & Kombinationen

**KoMMcreator** zeichnet sich durch eine flexible Medien-Engine aus. NFTs können nicht nur aus einzelnen Standarddateien bestehen, sondern auch aus dynamischen Kombinationen von Bild-, Video- und Audio-Assets.

### Unterstützte Medienformate & Kombinationen

Die Creator App bietet dem Nutzer ein intuitives "Studio-Interface", in dem er folgende Kombinationen erstellen kann:

1. **Nur Bild (Static Art):** PNG, JPG, WebP oder SVG (z. B. für digitale Illustrationen, Fotos oder Vektorgrafiken).
2. **Nur Video (Motion Art):** MP4, WebM oder GIF (z. B. für Animationen, 3D-Loops oder Kurzfilme).
3. **Nur Musik (Audio Only):** MP3, WAV, FLAC oder OGG (z. B. für Musiktitel, Podcasts oder Soundeffekte).
4. **Bild + Musik (Audio-Visualized Image):** 
   * Der Nutzer lädt ein statisches Bild (z. B. ein Album-Cover) und eine Audiodatei (z. B. einen Song) hoch.
   * **Technische Umsetzung:** Das Rust-Backend nutzt eine integrierte FFmpeg-Schnittstelle, um das statische Bild mit der Audiospur zu einem optimierten MP4/WebM-Video zu rendern. Alternativ kann die App das NFT mit zwei separaten Einträgen in den Metadaten anlegen (`image` für das Cover und `animation_url` für die Audiodatei), sodass Web3-Marktplätze das Bild anzeigen und die Musik im Hintergrund abspielen.
5. **Video + Musik (Custom Soundtrack Video):**
   * Der Nutzer lädt ein Video hoch und ersetzt oder untermalt dessen Tonspur mit einer separaten Audiodatei.
   * **Technische Umsetzung:** Die App führt die Video- und Audiospur lokal über FFmpeg (Rust-seitig) zusammen, synchronisiert die Längen (z. B. Looping des Videos, falls das Audio länger ist) und exportiert ein perfekt komprimiertes WebM/MP4-Endprodukt.

### Lokale Medienaufbereitung im Rust-Core
Bevor Dateien hochgeladen werden, führt die App eine automatische, verlustfreie oder minimal verlustbehaftete Komprimierung durch, um Bandbreite und Speicherplatz zu sparen:
* **Bilder:** Konvertierung und Optimierung zu WebP (für statische Bilder) bzw. WebM/APNG (für Animationen).
* **Videos:** Transkodierung mittels einer leichtgewichtigen, in Rust eingebetteten FFmpeg-Bibliothek in das h.264/h.265- oder AV1-Format im WebM-Container, um maximale Kompatibilität bei geringer Dateigröße zu sichern.
* **Musik / Audio:** Komprimierung zu OGG Vorbis oder AAC bei 320 kbps.

### Dezentrale Speicherung via IPFS & Arweave
Mediendateien dürfen niemals direkt auf einer EVM-Blockchain gespeichert werden, da die Speicherkosten ("Gas Fees") astronomisch hoch wären. Die Creator App integriert daher zwei dezentrale Speicherlösungen:

1. **IPFS (InterPlanetary File System) via Pinata / NFT.Storage:**
   * Die Datei wird lokal gehasht (Content Identifier - CID) [3].
   * Sie wird über eine API an einen Pinning-Dienst (z. B. Pinata) übertragen, der die dauerhafte Verfügbarkeit im IPFS-Netzwerk garantiert [4].
2. **Arweave (Permanenter Speicher):**
   * Für Ersteller, die eine garantierte, lebenslange Speicherung wünschen (Einmalzahlung statt monatlicher Pinning-Gebühren) [5].
   * Die Metadaten und Medien werden direkt im Arweave-Netzwerk abgelegt.

---

## 3. Eigener Smart Contract (ERC-721 vs. ERC-1155)

Die App bietet dem Nutzer beim Erstellen einer neuen Kollektion die Auswahl zwischen zwei etablierten Token-Standards der Ethereum Virtual Machine (EVM) [6]. Der Smart Contract wird in **Solidity** geschrieben und über die App individuell für den Nutzer bereitgestellt ("Custom Deploy") [7].

### Vergleich der Standards in der App

| Feature | **ERC-721 (Einzigartige NFTs)** | **ERC-1155 (Multi-Token Standard)** |
| :--- | :--- | :--- |
| **Eignung** | Einzigartige Kunstwerke, exklusive 1-of-1 Videos oder Musiktitel [6]. | Kollektionen mit Auflagen (z. B. 100 Kopien eines Songs oder Album-Covers) [8]. |
| **Gas-Effizienz** | Höherer Gasverbrauch beim Erstellen mehrerer Token [6]. | Extrem gas-effizient, da mehrere Token-IDs in einer einzigen Transaktion verwaltet werden können [8]. |
| **Metadaten** | Jeder Token hat eine eigene, eindeutige URI [6]. | Unterstützt parametrisierte URIs (z. B. `{id}.json`) für ganze Kollektionen [8]. |

### Integrierte Features des Smart Contracts
* **EIP-2981 (NFT Royalty Standard):** Direkt im Smart Contract verankerte Lizenzgebühren [9]. Jedes Mal, wenn das NFT auf einem Marktplatz (auch auf Drittplattformen) weiterverkauft wird, erhält der Ersteller automatisch einen Prozentsatz (z. B. 5% oder 10%) des Verkaufspreises direkt auf seine Wallet [10].
* **Ownable & Access Control:** Nur die Wallet des Erstellers (der Deployer) hat das Recht, neue NFTs in diesem Contract zu prägen (minten) oder administrative Einstellungen zu ändern.
* **Pausierbarkeit (Pausable):** Sicherheitsfeature, um im Falle eines Exploits oder Fehlers das Minting oder Übertragungen temporär einzufrieren.

---

## 4. Der Minting-Prozess: On-Chain vs. Lazy Minting

Muss man ein NFT sofort minten? **Nein.** Die App bietet zwei unterschiedliche Wege an, um maximale Flexibilität bei den Transaktionskosten (Gas Fees) zu gewährleisten [11].

```
[ Medieneingabe ] ──> [ Lokale Kompression (Rust) ] ──> [ Upload zu IPFS/Arweave ]
                                                                 │
                                     ┌───────────────────────────┴───────────────────────────┐
                                     ▼                                                       ▼
                          [ 1. Direktes On-Chain Minting ]                        [ 2. Lazy Minting (Gasless) ]
                                     │                                                       │
                       Ersteller zahlt sofort Gas-Gebühr                        Ersteller signiert die Metadaten lokal
                                     │                                                       │
                       NFT existiert sofort auf der Chain                       Metadaten & Signatur auf Plattform gespeichert
                                                                                             │
                                                                                Käufer zahlt Gas-Gebühr beim Kauf
                                                                                             │
                                                                                NFT wird im selben Moment geprägt (minted)
```

### Option A: Direktes On-Chain Minting (Klassisch)
1. Die Medien (Bild/Video/Audio) werden auf IPFS/Arweave hochgeladen [3].
2. Die JSON-Metadaten (Name, Beschreibung, Eigenschaften, Link zum Medium) werden generiert und ebenfalls hochgeladen.
3. Die App initiiert eine Transaktion an den eigenen Smart Contract des Nutzers [12].
4. Der Ersteller bestätigt die Transaktion in seiner Wallet und zahlt die Netzwerk-Gebühr (Gas Fee) [12].
5. Das NFT wird direkt auf der Blockchain erzeugt und an die Wallet des Erstellers übertragen.

### Option B: Lazy Minting (Gasless / Off-Chain)
Um Künstlern die Erstellung von NFTs ohne finanzielle Vorleistungen zu ermöglichen, wird **Lazy Minting** implementiert [11]:
1. Medien und JSON-Metadaten werden auf IPFS hochgeladen [11].
2. Die App generiert eine kryptografische Signatur (EIP-712) mit dem privaten Schlüssel der Ersteller-Wallet. Diese Signatur autorisiert das spätere Minting dieses spezifischen NFTs zu einem festgelegten Preis [11].
3. Das NFT existiert zu diesem Zeitpunkt **noch nicht auf der Blockchain**, sondern nur als signierter Datensatz in der Datenbank von **KoMM Portal** [11].
4. **Der Clou:** Erst wenn ein Käufer das NFT auf der Handelsplattform erwirbt, sendet die Plattform die Signatur des Erstellers zusammen mit der Zahlung des Käufers an den Smart Contract. Der Contract verifiziert die Signatur, prägt (minted) das NFT und überträgt es direkt an den Käufer [11]. **Die Gas-Gebühr für das Minting wird somit vollständig vom Käufer getragen** [11].

---

## 5. Universelle Wallet-Integration (Alle bekannten Wallets)

Damit die App eine breite Masse an Nutzern anspricht, darf sie nicht auf eine einzige Wallet beschränkt sein. Es wird eine umfassende Multi-Wallet-Integration realisiert [13].

### Technische Umsetzung: **WalletConnect AppKit (ehemals Web3Modal) + EIP-6963**

Durch die Implementierung von **WalletConnect AppKit** und dem modernen Ethereum-Standard **EIP-6963** (Multi-Injected Provider Discovery) kann die App nahtlos mit praktisch jeder existierenden Krypto-Wallet kommunizieren [13] [14].

#### Unterstützte Wallet-Typen & Verbindungsmethoden:

1. **Browser-Extensions & Injected Wallets (Desktop):**
   * Automatische Erkennung installierter Wallets über EIP-6963 [14].
   * Direkte Unterstützung für: **MetaMask**, **Coinbase Wallet**, **Trust Wallet**, **Brave Wallet**, **Rabby Wallet**, **Phantom** (für EVM & Solana) [13] [14].
2. **Mobile Wallets (Android & Desktop-to-Mobile via QR-Code):**
   * **WalletConnect-Protokoll:** Erzeugt einen sicheren, verschlüsselten WebSocket-Kanal zwischen der App und der mobilen Wallet [15].
   * Auf dem Desktop scannt der Nutzer einen QR-Code mit seiner mobilen Wallet (z. B. MetaMask Mobile, Trust Wallet, Ledger Live, SafePal) [15].
   * Auf Android wird ein **Deep Link** genutzt: Ein Klick auf "Verbinden" öffnet direkt die installierte Wallet-App auf dem Smartphone zur Bestätigung.
3. **Hardware-Wallets:**
   * Unterstützung für **Ledger** und **Trezor** (entweder direkt über USB/Bluetooth im Rust-Backend oder indirekt über die Verbindung mit MetaMask/Ledger Live).

---

## 6. Eingebettetes Konnektor-System (Cross-Listing)

Ein Kernfeature von **KoMMcreator** ist das eingebettete Konnektor-System. Es ermöglicht Erstellern, ihre NFTs mit einem einzigen Klick direkt aus der App heraus auf mehreren bekannten Marktplätzen zu listen, **ohne jemals die Benutzeroberfläche von KoMMcreator zu verlassen**.

### Funktionsweise des Konnektors im Hintergrund:

* **Schnittstellen-Integration:** Die App nutzt standardisierte APIs und Protokolle wie das **Rarible Multichain SDK** [17] und das OpenSea-eigene **Seaport-Protokoll** [18], um Listings direkt aus der App heraus zu signieren und zu übertragen.
* **Plattformunabhängige Signaturen:** Der Ersteller signiert ein strukturiertes Listing-Dokument (z. B. eine Seaport-Order) lokal in der App mit seiner Wallet [18]. Diese Signatur wird dann im Hintergrund per API an OpenSea oder andere Plattformen übermittelt, wo das Listing sofort aktiv wird.
* **Echtzeit-Synchronisation:** Die App synchronisiert den Verkaufsstatus. Wird das NFT auf einer Plattform verkauft, stornieren die Konnektoren die Listings auf den anderen Plattformen automatisch (sofern on-chain oder über kompatible Off-Chain-Auftragsbücher möglich).

---

## 7. Vorgeschlagener Entwicklungsplan (Phasen)

```
┌──────────────────────────────┐     ┌──────────────────────────────┐     ┌──────────────────────────────┐
│  Phase 1: Core & Contracts   │ ──> │  Phase 2: UI & Integration   │ ──> │   Phase 3: Multi-Platform    │
│  - Solidity Smart Contracts  │     │  - Tauri App Setup           │     │  - Windows & Linux Builds    │
│  - Rust Medien-Kompression   │     │  - WalletConnect AppKit      │     │  - Android APK Optimierung   │
│  - IPFS/Arweave API-Anbindung│     │  - On-Chain & Lazy Minting   │     │  - Google Play Store Release │
└──────────────────────────────┘     └──────────────────────────────┘     └──────────────────────────────┘
```

---
## Referenzen

[1] [Tauri vs Electron 2026: The Definitive Desktop Framework Comparison](https://tech-insider.org/tauri-vs-electron-2026/)  
[2] [Web3 App Development in 2025: Tech Stack, Tools & Best Practices](https://www.syncrasytech.com/blogs/web3-app-development-tech-stack-tools-guide)  
[3] [NFT Metadata: IPFS & Decentralized Storage Explained for Beginners](https://www.youtube.com/watch?v=sT-yuxh4kYE)  
[4] [Pinata - NFT storage on IPFS Plugin](https://bubble.io/plugin/pinata---nft-storage-on-ipfs-1649072598456x110658113044480000)  
[5] [Can you store NFTs on Arweave?](https://ardrive.io/can-you-store-nfts-on-arweave)  
[6] [ERC-721 Non-Fungible Token Standard](https://ethereum.org/developers/docs/standards/tokens/erc-721/)  
[7] [Deploy an ERC-721 Using Hardhat](https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-hardhat/)  
[8] [ERC1155](https://docs.openzeppelin.com/contracts/3.x/erc1155)  
[9] [ERC-2981: NFT Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)  
[10] [EIP-2981: Implementing NFT Royalties On-Chain](https://goldrush.dev/guides/eip-2981-implementing-nft-royalties-on-chain/)  
[11] [Lazy Minting: A Complete Guide To Free NFT Minting](https://zipmex.com/blog/free-nft-minting/)  
[12] [How to Mint an NFT (Simple Step-by-Step Guide)](https://chain.link/tutorials/how-to-mint-an-nft)  
[13] [Complete Guide to Integrating WalletConnect and MetaMask in React DApps](https://medium.com/@ancilartech/complete-guide-to-integrating-walletconnect-and-metamask-in-react-dapps-833a8a1d2d31)  
[14] [Which multi-wallet connect to use in 2024?](https://ethereum.stackexchange.com/questions/165555/which-multi-wallet-connect-to-use-in-2024)  
[15] [Web3 Wallet Integration Tutorial for React Web Apps](https://starlordwrites.medium.com/web3-wallet-integration-tutorial-for-react-web-apps-809c508aa864)  
[16] [Rarible Multichain SDK - NFT tools](https://www.alchemy.com/dapps/rarible-multichain-sdk)  
[17] [Introducing Seaport Protocol](https://opensea.io/blog/articles/introducing-seaport-protocol)
