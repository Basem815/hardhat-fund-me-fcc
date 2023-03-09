//imports

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/Verify");
/* Above is an easier way of writing 
const helperConfig = require("../helper-hardhat-config")
const networkConfig - helperConfig.networkConfig   */

//main function
//calling of main function
/*With hard-hat deploy, we no longer need to write a main function or call the main function.
    Hardhat deploy will actually call a function that we specify in this script */

/* This is one way to do it:

function deployFunc(hre) {
  console.log("Test");
}

module.exports.default = deployFunc; // Gives an error if we run it with () i.e. deployFunc() instead of deployFunc
*/

/* But we will instead use an async function and wrap it around in module.exports
This method is nearly identical to the method above except we don't have a name for the function */

/*
module.exports = async (hre) => {
  // From hre we will use two variables (it's similar to how we would import values from require("hardhat") previously)
  const { getNamedAccounts, deployments } = hre;
  // Pulling these variables out with the syntax above means we no longer have to use hre.getNamedAccounts() or hre.deployments() all the time
};
*/

// An even more compact way of doing the above"
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // When working with ethers we can get the accounts using this function
  const chainId = network.config.chainId;

  // With this it should work with every chain that has been defined in helper-hardhat-config.js
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator"); // Could also add const {get} = deployments above and use get() directly
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // What if we want the pricefeed of a network that doesn't have a pricefeed online (z.b. hardhat)?
  // We want to use a mock contract: the idea behind it is that if a chain doesn't exist, we deploy a minimal version of it for our local testing

  // When going for a localhost or a hardhat network, we want to use a Mock
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //Verify
    await verify(fundMe.address, args);
  }
  log("------------------------");
};

module.exports.tags = ["all", "fundme"];
