import hre from "hardhat";
import { expect } from "chai";

describe("KoMMMarketplace", function () {
  let ethers;
  let marketplace, nft721;
  let owner, seller, buyer, treasury;

  before(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
  });

  beforeEach(async function () {
    [owner, seller, buyer, treasury] = await ethers.getSigners();

    // Deploy NFT Contract
    const KoMMNFT721 = await ethers.getContractFactory("KoMMNFT721");
    nft721 = await KoMMNFT721.deploy("KoMM NFT", "KOMM");
    await nft721.waitForDeployment();

    // Deploy Marketplace
    const KoMMMarketplace = await ethers.getContractFactory("KoMMMarketplace");
    marketplace = await KoMMMarketplace.deploy(treasury.address);
    await marketplace.waitForDeployment();

    // Seller mintet ein NFT (KOSTENLOS)
    await nft721.connect(seller).mint("ipfs://QmSellMe", 500);
    // Seller genehmigt Marketplace
    await nft721.connect(seller).approve(await marketplace.getAddress(), 1);
  });

  describe("Deployment", function () {
    it("sollte die korrekte Plattformgebühr haben (2.5%)", async function () {
      const fee = await marketplace.platformFeeBps();
      expect(Number(fee)).to.equal(250);
    });

    it("sollte die Treasury-Adresse korrekt setzen", async function () {
      expect(await marketplace.treasury()).to.equal(treasury.address);
    });
  });

  describe("Listing erstellen", function () {
    it("sollte ein Festpreis-Listing erstellen können", async function () {
      const price = ethers.parseEther("1");
      const duration = 7 * 24 * 60 * 60;

      const tx = await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, price, duration, 0, 0
      );
      await tx.wait();

      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("sollte ein Auktions-Listing erstellen können", async function () {
      const startPrice = ethers.parseEther("0.5");
      const duration = 3 * 24 * 60 * 60;

      await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, startPrice, duration, 1, 0
      );

      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.active).to.be.true;
    });
  });

  describe("Kauf (Gebühr NUR hier)", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, price, 7 * 24 * 60 * 60, 0, 0
      );
    });

    it("sollte ein NFT kaufen können mit korrekter Gebührenverteilung", async function () {
      const price = ethers.parseEther("1");
      const treasuryBefore = await ethers.provider.getBalance(treasury.address);
      const sellerBefore = await ethers.provider.getBalance(seller.address);

      await marketplace.connect(buyer).buy(1, { value: price });

      const treasuryAfter = await ethers.provider.getBalance(treasury.address);
      const sellerAfter = await ethers.provider.getBalance(seller.address);

      // Treasury bekommt 2.5% = 0.025 ETH
      const platformFee = ethers.parseEther("0.025");
      expect(treasuryAfter - treasuryBefore).to.equal(platformFee);

      // NFT gehört jetzt dem Buyer
      expect(await nft721.ownerOf(1)).to.equal(buyer.address);

      // Listing ist nicht mehr aktiv
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("sollte zu wenig ETH ablehnen", async function () {
      const tooLow = ethers.parseEther("0.5");
      let reverted = false;
      try {
        await marketplace.connect(buyer).buy(1, { value: tooLow });
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Insufficient payment");
      }
      expect(reverted).to.be.true;
    });

    it("sollte inaktive Listings ablehnen", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(buyer).buy(1, { value: price });

      let reverted = false;
      try {
        await marketplace.connect(buyer).buy(1, { value: price });
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Listing not active");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Listing stornieren", function () {
    it("sollte der Seller sein Listing stornieren können", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, price, 7 * 24 * 60 * 60, 0, 0
      );

      await marketplace.connect(seller).cancelListing(1);

      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("sollte Nicht-Seller das Stornieren verweigern", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, price, 7 * 24 * 60 * 60, 0, 0
      );

      let reverted = false;
      try {
        await marketplace.connect(buyer).cancelListing(1);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Not seller");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Auktionen", function () {
    beforeEach(async function () {
      const startPrice = ethers.parseEther("0.5");
      await marketplace.connect(seller).createListing(
        await nft721.getAddress(),
        1, 1, startPrice, 3 * 24 * 60 * 60, 1, 0
      );
    });

    it("sollte ein Gebot abgeben können", async function () {
      const bid = ethers.parseEther("0.6");
      await marketplace.connect(buyer).placeBid(1, { value: bid });

      // Gebot wird in highestBids gespeichert, nicht in listing.price
      const highestBid = await marketplace.highestBids(1);
      expect(highestBid.amount).to.equal(bid);
      expect(highestBid.bidder).to.equal(buyer.address);
    });

    it("sollte zu niedrige Gebote ablehnen", async function () {
      const bid = ethers.parseEther("0.6");
      await marketplace.connect(buyer).placeBid(1, { value: bid });

      const lowBid = ethers.parseEther("0.5");
      let reverted = false;
      try {
        await marketplace.connect(treasury).placeBid(1, { value: lowBid });
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Bid too low");
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Gebühren-Management (nur Owner)", function () {
    it("sollte die Plattformgebühr ändern können (nur Owner)", async function () {
      await marketplace.connect(owner).setPlatformFee(300);
      expect(Number(await marketplace.platformFeeBps())).to.equal(300);
    });

    it("sollte Nicht-Owner das Ändern verweigern", async function () {
      let reverted = false;
      try {
        await marketplace.connect(seller).setPlatformFee(300);
      } catch (e) {
        reverted = true;
      }
      expect(reverted).to.be.true;
    });

    it("sollte Gebühren über 10% ablehnen", async function () {
      let reverted = false;
      try {
        await marketplace.connect(owner).setPlatformFee(1001);
      } catch (e) {
        reverted = true;
        expect(e.message).to.include("Fee too high");
      }
      expect(reverted).to.be.true;
    });
  });
});
