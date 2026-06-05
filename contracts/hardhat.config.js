import dotenv from "dotenv";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  plugins: [
    hardhatEthers,
    hardhatVerify,
    hardhatMocha,
  ],
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    ethereum: {
      type: "http",
      url: process.env.ETHEREUM_RPC || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      type: "http",
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      chainId: 137,
      accounts: [PRIVATE_KEY],
    },
    polygonAmoy: {
      type: "http",
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [PRIVATE_KEY],
    },
    base: {
      type: "http",
      url: process.env.BASE_RPC || "https://mainnet.base.org",
      chainId: 8453,
      accounts: [PRIVATE_KEY],
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      chainId: 84532,
      accounts: [PRIVATE_KEY],
    },
    arbitrum: {
      type: "http",
      url: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: [PRIVATE_KEY],
    },
    arbitrumSepolia: {
      type: "http",
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [PRIVATE_KEY],
    },
    optimism: {
      type: "http",
      url: process.env.OPTIMISM_RPC || "https://mainnet.optimism.io",
      chainId: 10,
      accounts: [PRIVATE_KEY],
    },
    bsc: {
      type: "http",
      url: process.env.BSC_RPC || "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: [PRIVATE_KEY],
    },
    avalanche: {
      type: "http",
      url: process.env.AVALANCHE_RPC || "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
    },
  },
};

export default config;
