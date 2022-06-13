const { networks, network } = require("hardhat");
const { verify } = require("../hardhat.config");
const { networkConfig, deployHardHat } = require("../helper-hardhat.config");
const deployFundMe = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;
  if (deployHardHat.includes(network.name)) {
    const ethAggregator = await deployments.get("MockV3Aggregator");
    console.log("Hardhhat copy");
    ethUsdPriceFeedAddress = ethAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations
  });
  //Verify The Contract
  if (!deployHardHat.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }
};

module.exports = deployFundMe;

module.exports.tags = ["all", "fundme"];
