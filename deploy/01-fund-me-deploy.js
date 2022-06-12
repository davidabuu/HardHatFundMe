const { networks } = require("hardhat");

const deployFundMe = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = networks.config().chainId;
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [""],
    log: true,
  });
};

module.exports = deployFundMe;
