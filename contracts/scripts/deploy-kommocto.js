const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying KoMMoctoNFT to network:", hre.network.name);

  const KoMMoctoNFT = await hre.ethers.getContractFactory("KoMMoctoNFT");
  const kommNft = await KoMMoctoNFT.deploy();

  await kommNft.waitForDeployment();
  const address = await kommNft.getAddress();

  console.log(`✅ KoMMoctoNFT deployed to: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
