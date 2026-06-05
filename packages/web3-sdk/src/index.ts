/**
 * @komm-nft/web3-sdk
 *
 * KoMM-NFT Web3 SDK – Multi-Chain Auto-Detection, Wallet-Integration
 * und Contract-Interaktion für KoMMcreator und KoMM Portal.
 *
 * Features:
 * - Automatische Chain-Erkennung (kein manuelles Netzwerk-Switching)
 * - Universelle Wallet-Integration (alle EIP-6963 Wallets + WalletConnect)
 * - Kostenloses Lazy Minting (EIP-712 Signaturen)
 * - Typsichere Contract-Interaktion
 *
 * Gebührenmodell:
 * - Minting:   KOSTENLOS
 * - Transfer:  KOSTENLOS
 * - Verkauf:   2.5% Plattformgebühr + Creator Royalty
 */

// Chain-Konfiguration & Auto-Detection
export {
  SUPPORTED_CHAINS,
  TESTNET_CHAINS,
  CHAIN_META,
  CONTRACT_ADDRESSES,
  isChainSupported,
  getContracts,
  getDeployedChains,
  type SupportedChainId,
  type ChainMeta,
  type DeployedContracts,
} from "./chains";

// Wallet-Integration
export {
  createKoMMConfig,
  buildWalletState,
  INITIAL_WALLET_STATE,
  SUPPORTED_WALLETS,
  type KoMMWalletConfig,
  type WalletState,
} from "./wallet";

// Contract ABIs & Interaction
export {
  KoMMNFT721_ABI,
  KoMMNFT1155_ABI,
  KoMMMarketplace_ABI,
} from "./contracts";

// Lazy Minting (KOSTENLOS)
export {
  createLazyMintVoucher721,
  createLazyMintVoucher1155,
  generateNonce,
  EIP712_DOMAIN_721,
  EIP712_DOMAIN_1155,
  LAZY_MINT_721_TYPES,
  LAZY_MINT_1155_TYPES,
  type LazyMintVoucher721,
  type LazyMintVoucher1155,
} from "./lazy-mint";
