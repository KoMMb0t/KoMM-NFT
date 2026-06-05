import hre from "hardhat";
import fs from "fs";

/**
 * KoMM-NFT Multi-Chain Deployment Script
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network polygon
 *   npx hardhat run scripts/deploy.js --network base
 *   npx hardhat run scripts/deploy.js --network arbitrum
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  KoMM-NFT Deployment");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Network:  ${network}`);
  console.log(`  Chain ID: ${chainId}`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Balance:  ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Deploy KoMMNFT721
  console.log("1/3 Deploying KoMMNFT721...");
  const KoMMNFT721 = await hre.ethers.getContractFactory("KoMMNFT721");
  const nft721 = await KoMMNFT721.deploy("KoMM NFT", "KOMM");
  await nft721.waitForDeployment();
  const nft721Address = await nft721.getAddress();
  console.log(`    ✓ KoMMNFT721 deployed: ${nft721Address}\n`);

  // 2. Deploy KoMMNFT1155
  console.log("2/3 Deploying KoMMNFT1155...");
  const KoMMNFT1155 = await hre.ethers.getContractFactory("KoMMNFT1155");
  const nft1155 = await KoMMNFT1155.deploy("KoMM Editions", "KOMME");
  await nft1155.waitForDeployment();
  const nft1155Address = await nft1155.getAddress();
  console.log(`    ✓ KoMMNFT1155 deployed: ${nft1155Address}\n`);

  // 3. Deploy KoMMMarketplace
  console.log("3/3 Deploying KoMMMarketplace...");
  const KoMMMarketplace = await hre.ethers.getContractFactory("KoMMMarketplace");
  const marketplace = await KoMMMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`    ✓ KoMMMarketplace deployed: ${marketplaceAddress}\n`);

  // Summary
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  KoMMNFT721:       ${nft721Address}`);
  console.log(`  KoMMNFT1155:      ${nft1155Address}`);
  console.log(`  KoMMMarketplace:  ${marketplaceAddress}`);
  console.log(`  Treasury:         ${deployer.address}`);
  console.log(`  Platform Fee:     2.5%`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n  Gebührenmodell:");
  console.log("  • Minting:        KOSTENLOS");
  console.log("  • Transfer:       KOSTENLOS");
  console.log("  • Verkauf:        2.5% Plattformgebühr + Creator Royalty");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Save deployment addresses
  const deployments = {
    network,
    chainId: Number(chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      KoMMNFT721: nft721Address,
      KoMMNFT1155: nft1155Address,
      KoMMMarketplace: marketplaceAddress,
    },
    treasury: deployer.address,
    platformFeeBps: 250,
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    `${deploymentsDir}/${network}-${chainId}.json`,
    JSON.stringify(deployments, null, 2)
  );
  console.log(`  Deployment saved to: deployments/${network}-${chainId}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
