# Konzeptdokument: KoMM Portal (Web3 NFT Handelsplattform)

Dieses Dokument beschreibt das technische und konzeptionelle Design von **KoMM Portal**, einer dezentralen NFT-Handelsplattform (Marktplatz). Die Plattform wird als Web-Applikation (Frontend im Browser), als Desktop-Applikation (Windows, Linux) und als mobile Anwendung (Android) bereitgestellt. Sie dient als Gegenstück zu **KoMMcreator** und ermöglicht den dezentralen Handel, Auktionen und den Transfer von NFTs über eigene Smart Contracts sowie die nahtlose, eingebettete Integration von Drittplattformen wie OpenSea und Rarible [1].

---

## 1. Systemarchitektur & Multi-Platform-Techstack

**KoMM Portal** muss extrem reaktiv sein, Echtzeit-Updates für Gebote und Preise verarbeiten und gleichzeitig auf allen Endgeräten perfekt funktionieren [2].

### Der gewählte Techstack: **Next.js (Web) + Tauri 2.x (Desktop/Mobile) + NestJS (Backend) + PostgreSQL / Redis**

Um maximale Reichweite und Wartbarkeit zu garantieren, teilen sich die Web-App und die Desktop-/Mobil-Apps die gleiche Frontend-Logik.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│   ┌────────────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│   │   Web-App (Next.js)    │  │ Desktop (Tauri)  │  │ Android App  │   │
│   └────────────────────────┘  └──────────────────┘  └──────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            BACKEND SERVICES                            │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ NestJS API Gateway (Validierung, Metadaten-Cache, Auth)        │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │
│         ┌─────────────────────────┼─────────────────────────┐
│         ▼                         ▼                         ▼
│   ┌───────────┐             ┌───────────┐             ┌───────────┐
│   │ PostgreSQL│             │   Redis   │             │ Blockchain│
│   │ (DB)      │             │  (Cache)  │             │ (Indexer) │
│   └───────────┘             └───────────┘             └───────────┘
└────────────────────────────────────────────────────────────────────────┘
```

| Schicht | Technologie | Beschreibung |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js + TailwindCSS | Bietet Server-Side Rendering (SSR) für exzellente SEO der Web-App sowie ein schnelles, responsives UI [3]. |
| **Desktop / Mobile Wrapper** | **Tauri 2.x** | Verpackt das React-Frontend in native Desktop-Anwendungen (Windows, Linux) und eine Android-App [4]. |
| **Zentrales Backend** | NestJS (TypeScript) / Node.js | Verwaltet Off-Chain-Daten (Benutzerprofile, Gebote, Aktivitäten-Historie, Lazy-Minting-Signaturen) [3]. |
| **Echtzeit-Kommunikation** | Socket.io (WebSockets) | Ermöglicht Live-Updates für Auktionen, Gebote und Preisänderungen ohne Page-Reload. |
| **Datenbanken** | PostgreSQL + Redis | PostgreSQL speichert strukturierte Daten. Redis dient als Cache und für die Echtzeit-Auktionslogik. |
| **Blockchain Indexer** | The Graph / Subgraph | Indiziert Smart-Contract-Events (Verkäufe, Transfers) direkt von der Blockchain, um eine blitzschnelle Suche zu ermöglichen [5]. |

---

## 2. Eigene Smart Contracts für den Handel (Marketplace Contract)

Der Handel läuft über einen dedizierten, auditierbaren **Marketplace Smart Contract** (geschrieben in Solidity) [6]. Dieser Contract interagiert direkt mit den NFT-Contracts der Ersteller (aus **KoMMcreator**) [7].

### Core-Funktionen des Handels-Contracts:

1. **Direktverkauf (Fixed Price):**
   * Der Verkäufer hinterlegt das NFT im Handels-Contract (oder gibt eine Verkaufsfreigabe via `setApprovalForAll`) und setzt einen Preis fest [8].
   * Ein Käufer sendet den geforderten Betrag (z. B. ETH, MATIC oder einen Stablecoin wie USDC) an den Contract [8].
   * Der Contract transferiert das NFT sofort an den Käufer und leitet den Kaufpreis (abzüglich Plattformgebühr und Ersteller-Royalty) an den Verkäufer weiter [8].
2. **Klassische Auktionen (Timed Auctions):**
   * Der Verkäufer startet eine Auktion mit Mindestpreis und Endzeitpunkt [9].
   * Bieter hinterlegen ihre Gebote im Contract (ihr Kapital wird im Contract gesperrt) [9].
   * Nach Ablauf der Zeit kann jeder die "Auszahlung" triggern: Der Höchstbietende erhält das NFT, der Verkäufer den Erlös, und die überbotenen Bieter erhalten ihr Kapital zurück [9].
3. **Angebote machen (Offers):**
   * Käufer können Angebote für beliebige NFTs auf der Plattform abgeben (auch wenn diese nicht aktiv zum Verkauf stehen). Das Angebot wird durch gesperrtes Kapital im Contract abgesichert.
4. **Automatische Royalty-Auszahlung (EIP-2981):**
   * Bei jedem Verkauf (Direktverkauf oder Auktion) fragt der Marketplace-Contract über die Funktion `royaltyInfo()` des NFT-Contracts ab, ob Lizenzgebühren anfallen [10].
   * Falls ja, berechnet der Contract den Royalty-Betrag automatisch, zieht ihn vom Erlös ab und sendet ihn direkt an die Wallet des Künstlers [10].

---

## 3. Web3-Features & Universelle Wallet-Integration

**KoMM Portal** setzt auf eine nahtlose, barrierefreie Wallet-Anbindung für alle bekannten Wallets [11].

### Technische Umsetzung: **WalletConnect AppKit + Wagmi + Viem**

Diese Kombination gilt als Industriestandard für moderne Web3-Plattformen [12].

* **EIP-6963 Integration:** Garantiert, dass mehrere im Browser installierte Extensions (z. B. MetaMask und Rabby gleichzeitig) sich nicht gegenseitig blockieren und korrekt erkannt werden [13].
* **QR-Code-Verbindung:** Desktop-Nutzer ohne Browser-Extension können sich über einen WalletConnect-QR-Code mit ihrer mobilen Wallet (z. B. Trust Wallet, Coinbase Wallet, SafePal) verbinden [11].
* **Mobile Deep Linking:** Auf Android öffnet ein Klick auf "Wallet verbinden" direkt die installierte Wallet-App zur Signatur [11].
* **Social Logins (Web3Auth / ERC-4337):** Optional können sich Krypto-Neulinge über E-Mail oder Social Media registrieren. Im Hintergrund wird über Account Abstraction (ERC-4337) eine "Smart Wallet" für sie erstellt, um die Einstiegshürde zu minimieren.

---

## 4. Off-Chain-Datenhaltung & Lazy-Minting-Support

Nicht alle Daten müssen on-chain gespeichert werden. Um Gas-Gebühren zu sparen und die Plattform extrem schnell zu machen, nutzen wir ein hybrides Modell [14].

### Hybrid-Modell: Was ist On-Chain, was ist Off-Chain?

| Daten-Typ | **On-Chain (Blockchain)** | **Off-Chain (PostgreSQL/IPFS)** |
| :--- | :--- | :--- |
| **NFT-Besitz** | Ja (Verifiziert durch die Blockchain) [15]. | Nein (Nur als gecachter Zustand in der DB). |
| **NFT-Medien** | Nein (Zu teuer). | Ja (Gespeichert auf dezentralem IPFS/Arweave) [14]. |
| **Lazy-Minting-NFTs** | Nein (Existieren noch nicht auf der Chain) [16]. | Ja (Metadaten + EIP-712 Signatur in PostgreSQL) [16]. |
| **Aktive Gebote** | Ja (Für On-Chain-Auktionen gesichert) [9]. | Ja (Für unverbindliche Angebote/Anfragen). |
| **Benutzerprofile** | Nein. | Ja (Username, Biografie, Profilbild-URL, E-Mail). |

### Lazy-Minting-Kaufprozess auf der Plattform:
1. Ein Käufer findet ein "Lazy Minted" NFT auf der Plattform.
2. Er klickt auf "Kaufen" und verbindet seine Wallet [11].
3. Die Plattform ruft die off-chain gespeicherte kryptografische Signatur des Erstellers aus der PostgreSQL-Datenbank ab [16].
4. Die App initiiert eine Transaktion an den Smart Contract des Erstellers und übergibt die Signatur sowie den Kaufpreis [16].
5. Der Smart Contract prüft die Signatur on-chain. Ist sie gültig, prägt (minted) er das NFT direkt in die Wallet des Käufers und transferiert die Kryptowährung an den Ersteller [16].

---

## 5. Eingebettetes Konnektor-System (Plattform-Aggregation)

Um die Liquidität und Sichtbarkeit der NFTs zu maximieren, verfügt **KoMM Portal** über ein hochentwickeltes, eingebettetes Konnektor-System. Dieses System ermöglicht es, externe NFT-Plattformen direkt in das eigene Interface zu integrieren, **ohne dass der Benutzer jemals auf die Webseiten von Drittanbietern wechseln muss**.

### Kernfunktionen des Konnektor-Systems:

```
                  ┌──────────────────────────────────────────┐
                  │          KoMM Portal Interface           │
                  │   (Nutzer bleibt immer auf KoMM Portal)  │
                  └────────────────────┬─────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                ▼                      ▼                      ▼
     ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
     │  Eigener Contract  │ │  OpenSea Konnektor │ │ Rarible Konnektor  │
     │  (KoMM Marketplace)│ │ (Seaport Protocol) │ │   (Rarible SDK)    │
     └────────────────────┘ └────────────────────┘ └────────────────────┘
```

1. **Eingebettetes Cross-Listing (Ausgehend):**
   * Wenn ein Nutzer ein NFT auf KoMM Portal zum Verkauf anbietet, kann er per Checkbox auswählen, ob dieses NFT zeitgleich auch auf **OpenSea**, **Rarible** oder **LooksRare** gelistet werden soll.
   * **Technische Umsetzung:** KoMM Portal generiert im Hintergrund die für die jeweilige Plattform erforderlichen Auftragsdaten (z. B. eine Seaport-Order für OpenSea [18]). Der Nutzer signiert diese Order einmalig in seiner Wallet. Das Portal übermittelt die Signatur per API an den Drittanbieter [18]. Das NFT ist sofort dort gelistet, ohne dass der Nutzer OpenSea öffnen musste.
2. **Aggregierter Marktplatz-Feed (Eingehend):**
   * KoMM Portal fungiert als Aggregator. Es importiert über die APIs von Rarible [17] und OpenSea alle Listings von NFTs, die zu den auf KoMM Portal unterstützten Kollektionen gehören.
   * Ein Nutzer kann somit auf KoMM Portal ein NFT sehen, das eigentlich auf OpenSea gelistet ist, und es direkt über das KoMM Portal-Interface kaufen.
3. **Eingebettete Transaktionsausführung (Fulfillment):**
   * Kauft ein Nutzer ein externes NFT über KoMM Portal, generiert das Backend die entsprechende Kauf-Transaktion für das zugrunde liegende Protokoll (z. B. direkter Aufruf des Seaport-Contracts auf der Blockchain).
   * Die Wallet des Nutzers öffnet sich auf KoMM Portal, er bestätigt die Transaktion, und der Kauf wird direkt on-chain abgewickelt. Der Nutzer sieht eine Erfolgsmeldung auf KoMM Portal, während die Abwicklung dezentral über das Drittprotokoll lief.

---

## 6. Monetarisierung der Plattform

Die Handelsplattform finanziert sich durch ein transparentes Gebührenmodell, das direkt im Marketplace-Smart-Contract codiert ist:

1. **Plattform-Transaktionsgebühr (Marktplatz-Fee):**
   * Bei jedem erfolgreichen Verkauf behält die Plattform eine prozentuale Gebühr ein (z. B. 2,0% oder 2,5%).
   * *Beispiel:* Ein NFT wird für 100 MATIC verkauft. Der Contract sendet 97.5 MATIC an den Verkäufer (bzw. abzüglich Royalties) und transferiert automatisch 2.5 MATIC auf die Treasury-Wallet der Plattform.
2. **Lazy-Minting-Gebühr:**
   * Da die Plattform den Speicherplatz und die Metadaten für noch nicht geprägte NFTs hostet, kann beim ersten On-Chain-Minting eine minimale Service-Gebühr erhoben werden.
3. **Hervorgehobene Platzierungen (Featured Listings):**
   * Künstler können gegen eine Gebühr ihre NFTs auf der Startseite oder in Newslettern bewerben lassen.

---

## 7. Entwicklungsplan für die Handelsplattform

```
┌──────────────────────────────┐     ┌──────────────────────────────┐     ┌──────────────────────────────┐
│  Phase 1: Backend & Contracts│ ──> │    Phase 2: Web Frontend     │ ──> │ Phase 3: Desktop & Android   │
│  - Solidity Marketplace-Contract  │  - Next.js Web-App           │     │  - Tauri Desktop-Kompilierung│
│  - NestJS API & PostgreSQL DB│     │  - WalletConnect & Wagmi     │     │  - Android App Optimierung   │
│  - Blockchain Indexer (The Graph) │  - Echtzeit-Gebote (WebSockets) │  - Play Store & App-Builds   │
└──────────────────────────────┘     └──────────────────────────────┘     └──────────────────────────────┘
```

---
## Referenzen

[1] [How To Build A Profitable NFT Marketplace In 2025](https://oqtacore.com/blog/how-to-build-a-nft-marketplace-in-2025-guide/)  
[2] [The Essential Tech Stack for Building an NFT Marketplace from Scratch](https://www.linkedin.com/pulse/essential-tech-stack-building-nft-marketplace-from-scratch-shah-ooqbc)  
[3] [A Blockchain based NFT Marketplace for Secure and Efficient Transactions](https://ieeexplore.ieee.org/document/11069920/)  
[4] [Tauri vs Electron 2026: The Definitive Desktop Framework Comparison](https://tech-insider.org/tauri-vs-electron-2026/)  
[5] [Web3 App Development in 2025: Tech Stack, Tools & Best Practices](https://www.syncrasytech.com/blogs/web3-app-development-tech-stack-tools-guide)  
[6] [NFT Marketplace Smart Contract Development](https://shellboxes.com/services/blockchain-development/nft-marketplace-smart-contract-development/)  
[7] [How To Build an NFT Marketplace](https://chain.link/tutorials/how-to-build-an-nft-marketplace-with-hardhat-and-solidity)  
[8] [What Is an NFT Smart Contract?](https://hedera.com/learning/nft-smart-contract/)  
[9] [Building an NFT auction smart contract in Solidity](https://ututuv.medium.com/building-an-nft-auction-smart-contract-in-solidity-d55efcdbf783)  
[10] [EIP-2981: Implementing NFT Royalties On-Chain](https://goldrush.dev/guides/eip-2981-implementing-nft-royalties-on-chain/)  
[11] [Web3 Wallet Integration Tutorial for React Web Apps](https://starlordwrites.medium.com/web3-wallet-integration-tutorial-for-react-web-apps-809c508aa864)  
[12] [Complete Guide to Integrating WalletConnect and MetaMask in React DApps](https://medium.com/@ancilartech/complete-guide-to-integrating-walletconnect-and-metamask-in-react-dapps-833a8a1d2d31)  
[13] [Which multi-wallet connect to use in 2024?](https://ethereum.stackexchange.com/questions/165555/which-multi-wallet-connect-to-use-in-2024)  
[14] [NFT Metadata: IPFS & Decentralized Storage Explained for Beginners](https://www.youtube.com/watch?v=sT-yuxh4kYE)  
[15] [How to Mint an NFT (Simple Step-by-Step Guide)](https://chain.link/tutorials/how-to-mint-an-nft)  
[16] [Lazy Minting: A Complete Guide To Free NFT Minting](https://zipmex.com/blog/free-nft-minting/)  
[17] [Rarible Multichain SDK - NFT tools](https://www.alchemy.com/dapps/rarible-multichain-sdk)  
[18] [Introducing Seaport Protocol](https://opensea.io/blog/articles/introducing-seaport-protocol)
