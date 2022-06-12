const { network } = require("hardhat");
const {
  deployHardHat,
  DECIMAL,
  INITAL_ANSWER,
} = require("../helper-hardhat.config");

const deployMockContract = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  if (deployHardHat.includes(network.name)) {
    log("Waiting To Deploy");
    await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMAL, INITAL_ANSWER],
      log: true,
    });
  }
};

module.exports = deployMockContract;
module.exports.tags = ["all", "mock"];
