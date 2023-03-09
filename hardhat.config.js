require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/Bb1vDq6uoI5I0m2K8oDjtUMIlupXG_Sx";
/* In order to be able to pull the sepolia rpc url from the .env file we must run yarn add --dev dotenv first
Then include the second require statement above*/
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "cae6586fff22dc97ff75a7084f5b828efe92ebbf1e20e374bc465fb72a779825";
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "DC1T8KP12E9YQ3XN84E4NUCZ68HIV9NNSV";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111, // Retrieved via sepolia etherscan
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      // We can also mention what account number it'll be on different chains. z.b. on hardhat we could say 31337: 1
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    // Generates a nice report when yarn hardhat test is run
    enabled: true, // Installed via yarn add hardhat-gas-reporter --dev
    outputFile: "gas-report.txt",
    noColors: true, // When we output ot a file the colors get messy
    currency: "USD", // In order to get the currecy we will ne to make an API call to a place like coinMarketCap
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
};
