const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // When working with ethers we can get the accounts using this function
  // console.log(deployer);
  const chainId = network.config.chainId;
  // Pr we could do .includes(network.name)
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks..");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mock deployed!");
    log("-------------------------------------------");
  }
};
// To run only the mock script we can use the tags feature as follows: yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];
