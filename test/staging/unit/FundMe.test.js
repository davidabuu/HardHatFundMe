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
    it('Allows us to withdraw with multiple funders', async () => {
       const accounts = await ethers.getSigners()
       for(let i = 1; i < 6; i++){
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({value: sendValue})
       }
       const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      const transacRes = await fundMe.withdraw();
      const transactionReceipt = await transacRes.wait(1);
     // const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      //Assert
      const endFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const endDeployerBalance = await fundMe.provider.getBalance(deployer);
      //Assert
      assert.equal(endFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endDeployerBalance.add(gasCost).toString()
      );
      await expect(fundMe.funders[0]).to.be.reverted
       for(let i = 1; i < 6; i++){
        assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
       }
    })
    it('Only allows the ownert', async () => {
      const accounts = ethers.getSigners()
      const attacker = accounts[1]
      const attacks = await fundMe.connect(attacker)
      await expect(attacks.withdraw()).to.be.reverted
    })
  });
});
 