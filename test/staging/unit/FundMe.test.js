const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
describe("Fund Me", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  let sendValue = ethers.utils.parseEther("1");
  beforeEach(async function () {
    //Deploy fund me contract
    //If you want to get free account based on the network
    //const accounts = await ethers.getSigners()
    deployer = (await getNamedAccounts("")).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("Constructor", async () => {
    it("Sets the aggregator address correctly", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("Fund", async () => {
    it("Fails if you do not send enough eths", async () => {
      await expect(fundMe.fund()).to.be.reverted;
    });
    it("Updates The amount funded", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Check if deployer is added to the array", async () => {
      await fundMe.fund({ value: sendValue });
      const fundArray = await fundMe.funders(0);
      assert.equal(fundArray, deployer);
    });
  });
  describe("WithDraw", async () => {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });
    it("Withdraw from a single founder", async () => {
      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      //Act
      const transacRes = await fundMe.withdraw();
      const transactionReceipt = await transacRes.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const endDeployerBalance = await fundMe.provider.getBalance(deployer);
      //Assert
      assert.equal(endFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endDeployerBalance.add(gasCost).toString()
      );
    });
  });
});
