Solhint
A convieninet tool that checks to see if best practices are followed by you while writing your solidity code - yarn solhint \*.sol - Specifies any errors/warnings that exist with your code

In remix the import function for @chainlink/contracts worked without issues. but with hardhat, we will need to first download it and install it before
it can be used by our projects. - It should then show up in our node_modules as @chainlinks - yarn hardhat compule should work now

Rather than creating a deploy.js each time, we can use the hardhat-deploy for an easier approach - yarn add -dev hardhat-deploy - Add it to your config file

By using hardhat-deploy-ethers we can run 'yarn hardhat deploy' to run all the files in our deploy folder

Deploying to a test-net can be slow so should be done towards the end. At first use local blockchains

When we are to run our own blockchain node, hardhat deploy will automatically run through each of our files in the deploy folder and add them to our node

Testing - Unit tests are done locally
-local hardhat network - forked network - Staging tests can be done on the testnet

Javascript debug console for using breakpoints and debugging code (on lhs above extensions)
