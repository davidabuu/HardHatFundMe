const { assert } = require('chai');
const { getNamedAccounts, ethers, network} = require("hardhat");
const {deployHardHat} = require('../../helper-hardhat.config')
deployHardHat.includes(network.name) ? describe.skip :
describe("FundMe", async () => {
  let fundMe;
  let deployer;
  const sendValue = ethers.utils.parseInt("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    fundMe = await ethers.getContract("FundMe", deployer);
  });
  it('Allows people to fund and withdraw', async () => {
    await fundMe.fund({value: sendValue})
    await fundMe.withdraw()
     const endingBalance = await fundMe.provider.getBalance(fundMe.address)
     assert.equal(endingBalance.toString(), '0')
  })
});
