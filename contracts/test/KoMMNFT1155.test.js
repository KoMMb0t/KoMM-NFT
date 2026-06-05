import hre from "hardhat";
import { expect } from "chai";

describe("KoMMNFT1155", function () {
  let ethers;
  let nft;
  let owner, creator, buyer, other;

  before(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
  });

  beforeEach(async function () {
    [owner, creator, buyer, other] = await ethers.getSigners();
    const KoMMNFT1155 = await ethers.getContractFactory("KoMMNFT1155");
    nft = await KoMMNFT1155.deploy("KoMM Editions", "KOMME");
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sollte den korrekten Namen und Symbol haben", async function () {
      expect(await nft.name()).to.equal("KoMM Editions");
      expect(await nft.symbol()).to.equal("KOMME");
    });
  });

  describe("Edition erstellen (KOSTENLOS)", function () {
    it("sollte eine Edition mit initialer Menge erstellen", async function () {
      const tx = await nft.connect(creator).createEdition(
        "ipfs://QmEdition1", 10, 100, 500
      );
      await tx.wait();

      expect(Number(await nft.balanceOf(creator.address, 1))).to.equal(10);
      expect(Number(await nft.totalSupply(1))).to.equal(10);
      expect(Number(await nft.maxSupply(1))).to.equal(100);
      expect(await nft.creators(1)).to.equal(creator.address);
      expect(await nft.uri(1)).to.equal("ipfs://QmEdition1");
    });

    it("sollte eine Edition ohne initiale Menge erstellen (Lazy)", async function () {
      await nft.connect(creator).createEdition("ipfs://QmLazy", 0, 50, 250);

      expect(Number(await nft.balanceOf(creator.address, 1))).to.equal(0);
      expect(Number(await nft.totalSupply(1))).to.equal(0);
      expect(Number(await nft.maxSupply(1))).to.equal(50);
    });

    it("sollte unlimitierte Editionen erlauben (maxEditions = 0)", async function () {
      await nft.connect(creator).createEdition("ipfs://QmUnlimited", 100, 0, 500);

      expect(Number(await nft.balanceOf(creator.address, 1))).to.equal(100);
      expect(Number(await nft.maxSupply(1))).to.equal(0);
    });

    it("sollte Royalty über 50% ablehnen", async function () {
      let reverted = false;
      try {
        await nft.connect(creator).createEdition("ipfs://QmFail", 10, 100, 5001);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Royalty too high");
      }
      expect(reverted).to.be.true;
    });

    it("sollte Amount > maxEditions ablehnen", async function () {
      let reverted = false;
      try {
        await nft.connect(creator).createEdition("ipfs://QmFail", 101, 100, 500);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Amount exceeds max editions");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Mehr minten (KOSTENLOS für Creator)", function () {
    beforeEach(async function () {
      await nft.connect(creator).createEdition("ipfs://QmEdition", 10, 100, 500);
    });

    it("sollte der Creator mehr minten können", async function () {
      await nft.connect(creator).mintMore(1, 20);

      expect(Number(await nft.balanceOf(creator.address, 1))).to.equal(30);
      expect(Number(await nft.totalSupply(1))).to.equal(30);
    });

    it("sollte Nicht-Creator das Minten verweigern", async function () {
      let reverted = false;
      try {
        await nft.connect(other).mintMore(1, 5);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Only creator can mint more");
      }
      expect(reverted).to.be.true;
    });

    it("sollte maxSupply respektieren", async function () {
      let reverted = false;
      try {
        await nft.connect(creator).mintMore(1, 91);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Exceeds max supply");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Transfer (KOSTENLOS)", function () {
    it("sollte Tokens kostenlos transferieren können", async function () {
      await nft.connect(creator).createEdition("ipfs://QmTransfer", 10, 100, 500);

      await nft.connect(creator).safeTransferFrom(
        creator.address, buyer.address, 1, 5, "0x"
      );

      expect(Number(await nft.balanceOf(creator.address, 1))).to.equal(5);
      expect(Number(await nft.balanceOf(buyer.address, 1))).to.equal(5);
    });

    it("sollte Batch-Transfer unterstützen", async function () {
      await nft.connect(creator).createEdition("ipfs://Qm1", 10, 100, 500);
      await nft.connect(creator).createEdition("ipfs://Qm2", 20, 200, 500);

      await nft.connect(creator).safeBatchTransferFrom(
        creator.address, buyer.address, [1, 2], [3, 7], "0x"
      );

      expect(Number(await nft.balanceOf(buyer.address, 1))).to.equal(3);
      expect(Number(await nft.balanceOf(buyer.address, 2))).to.equal(7);
    });
  });

  describe("Lazy Minting (KOSTENLOS für Creator)", function () {
    it("sollte einen gültigen Voucher einlösen können", async function () {
      const contractAddress = await nft.getAddress();
      const network = await ethers.provider.getNetwork();
      const chainId = network.chainId;

      const domain = {
        name: "KoMMNFT1155",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        LazyMint1155: [
          { name: "creator", type: "address" },
          { name: "tokenURI", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "maxEditions", type: "uint256" },
          { name: "royaltyBps", type: "uint96" },
          { name: "price", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const voucher = {
        creator: creator.address,
        tokenURI: "ipfs://QmLazyEdition",
        amount: 5,
        maxEditions: 50,
        royaltyBps: 500,
        price: 0,
        nonce: 1,
      };

      const signature = await creator.signTypedData(domain, types, voucher);

      await nft.connect(buyer).lazyMint({ ...voucher, signature });

      expect(Number(await nft.balanceOf(buyer.address, 1))).to.equal(5);
      expect(await nft.creators(1)).to.equal(creator.address);
      expect(await nft.uri(1)).to.equal("ipfs://QmLazyEdition");
    });
  });

  describe("ERC-165 Interface Support", function () {
    it("sollte ERC-1155 unterstützen", async function () {
      expect(await nft.supportsInterface("0xd9b67a26")).to.be.true;
    });

    it("sollte ERC-2981 (Royalty) unterstützen", async function () {
      expect(await nft.supportsInterface("0x2a55205a")).to.be.true;
    });
  });
});
