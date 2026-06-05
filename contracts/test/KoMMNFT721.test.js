import hre from "hardhat";
import { expect } from "chai";

describe("KoMMNFT721", function () {
  let ethers;
  let nft;
  let owner, creator, buyer, other;

  before(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
  });

  beforeEach(async function () {
    [owner, creator, buyer, other] = await ethers.getSigners();
    const KoMMNFT721 = await ethers.getContractFactory("KoMMNFT721");
    nft = await KoMMNFT721.deploy("KoMM NFT", "KOMM");
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sollte den korrekten Namen und Symbol haben", async function () {
      expect(await nft.name()).to.equal("KoMM NFT");
      expect(await nft.symbol()).to.equal("KOMM");
    });

    it("sollte totalSupply 0 nach Deployment sein", async function () {
      expect(Number(await nft.totalSupply())).to.equal(0);
    });

    it("sollte den Deployer als Owner setzen", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Direktes Minting (KOSTENLOS)", function () {
    it("sollte ein NFT kostenlos minten können", async function () {
      const tx = await nft.connect(creator).mint("ipfs://QmTest123", 500);
      await tx.wait();

      expect(Number(await nft.totalSupply())).to.equal(1);
      expect(await nft.ownerOf(1)).to.equal(creator.address);
      expect(await nft.tokenURI(1)).to.equal("ipfs://QmTest123");
    });

    it("sollte den Creator korrekt speichern", async function () {
      await nft.connect(creator).mint("ipfs://QmTest", 500);
      expect(await nft.creators(1)).to.equal(creator.address);
    });

    it("sollte Royalty korrekt setzen (EIP-2981)", async function () {
      await nft.connect(creator).mint("ipfs://QmTest", 500); // 5%
      const [receiver, amount] = await nft.royaltyInfo(1, ethers.parseEther("1"));
      expect(receiver).to.equal(creator.address);
      expect(amount).to.equal(ethers.parseEther("0.05"));
    });

    it("sollte Royalty über 50% ablehnen", async function () {
      let reverted = false;
      try {
        await nft.connect(creator).mint("ipfs://QmTest", 5001);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Royalty too high");
      }
      expect(reverted).to.be.true;
    });

    it("sollte Token-IDs inkrementell vergeben", async function () {
      await nft.connect(creator).mint("ipfs://QmTest1", 500);
      await nft.connect(creator).mint("ipfs://QmTest2", 500);
      await nft.connect(other).mint("ipfs://QmTest3", 1000);

      expect(Number(await nft.totalSupply())).to.equal(3);
      expect(await nft.ownerOf(1)).to.equal(creator.address);
      expect(await nft.ownerOf(2)).to.equal(creator.address);
      expect(await nft.ownerOf(3)).to.equal(other.address);
    });
  });

  describe("Batch Minting (KOSTENLOS)", function () {
    it("sollte mehrere NFTs auf einmal minten", async function () {
      const uris = ["ipfs://Qm1", "ipfs://Qm2", "ipfs://Qm3"];
      const tx = await nft.connect(creator).batchMint(uris, 250);
      await tx.wait();

      expect(Number(await nft.totalSupply())).to.equal(3);
      expect(await nft.tokenURI(1)).to.equal("ipfs://Qm1");
      expect(await nft.tokenURI(2)).to.equal("ipfs://Qm2");
      expect(await nft.tokenURI(3)).to.equal("ipfs://Qm3");
    });

    it("sollte maximal 50 pro Batch erlauben", async function () {
      const uris = Array(51).fill("ipfs://QmTooMany");
      let reverted = false;
      try {
        await nft.connect(creator).batchMint(uris, 500);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Max 50 per batch");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Transfer (KOSTENLOS)", function () {
    it("sollte NFTs kostenlos transferieren können", async function () {
      await nft.connect(creator).mint("ipfs://QmTest", 500);
      await nft.connect(creator).transferFrom(creator.address, buyer.address, 1);
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });

    it("sollte safeTransferFrom unterstützen", async function () {
      await nft.connect(creator).mint("ipfs://QmTest", 500);
      await nft.connect(creator)["safeTransferFrom(address,address,uint256)"](
        creator.address, buyer.address, 1
      );
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });
  });

  describe("Lazy Minting (KOSTENLOS für Creator)", function () {
    it("sollte einen gültigen Voucher einlösen können", async function () {
      const contractAddress = await nft.getAddress();
      const network = await ethers.provider.getNetwork();
      const chainId = network.chainId;

      const domain = {
        name: "KoMMNFT721",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        LazyMint: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const voucher = {
        creator: creator.address,
        tokenURI: "ipfs://QmLazyMint",
        royaltyBps: 500,
        price: 0,
        currency: "0x0000000000000000000000000000000000000000",
        nonce: 1,
      };

      const signature = await creator.signTypedData(domain, types, voucher);

      const tx = await nft.connect(buyer).lazyMint({
        ...voucher,
        signature: signature,
      });
      await tx.wait();

      expect(await nft.ownerOf(1)).to.equal(buyer.address);
      expect(await nft.tokenURI(1)).to.equal("ipfs://QmLazyMint");
      expect(await nft.creators(1)).to.equal(creator.address);
    });

    it("sollte ungültige Signaturen ablehnen", async function () {
      const contractAddress = await nft.getAddress();
      const network = await ethers.provider.getNetwork();
      const chainId = network.chainId;

      const domain = {
        name: "KoMMNFT721",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        LazyMint: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const voucher = {
        creator: creator.address,
        tokenURI: "ipfs://QmFake",
        royaltyBps: 500,
        price: 0,
        currency: "0x0000000000000000000000000000000000000000",
        nonce: 1,
      };

      const signature = await other.signTypedData(domain, types, voucher);

      let reverted = false;
      try {
        await nft.connect(buyer).lazyMint({ ...voucher, signature });
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Invalid signature");
      }
      expect(reverted).to.be.true;
    });

    it("sollte doppeltes Einlösen verhindern", async function () {
      const contractAddress = await nft.getAddress();
      const network = await ethers.provider.getNetwork();
      const chainId = network.chainId;

      const domain = {
        name: "KoMMNFT721",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        LazyMint: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const voucher = {
        creator: creator.address,
        tokenURI: "ipfs://QmOnce",
        royaltyBps: 500,
        price: 0,
        currency: "0x0000000000000000000000000000000000000000",
        nonce: 42,
      };

      const signature = await creator.signTypedData(domain, types, voucher);

      await nft.connect(buyer).lazyMint({ ...voucher, signature });

      let reverted = false;
      try {
        await nft.connect(other).lazyMint({ ...voucher, signature });
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Voucher already redeemed");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("ERC-165 Interface Support", function () {
    it("sollte ERC-721 unterstützen", async function () {
      expect(await nft.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("sollte ERC-2981 (Royalty) unterstützen", async function () {
      expect(await nft.supportsInterface("0x2a55205a")).to.be.true;
    });
  });
});
