/** We'll use hardhat deploy to generate our tests so that both functions in the deploy folder will be run
 *
 */

const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip // Skip if we're not on a development chain
  : // For the entire contract
    describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); // Same as 1000000000000000000
      beforeEach(async function () {
        // const accounts = ethers.getSigner(); // List of accouuuuuuunts
        // const accountZero = accounts[0]

        deployer = (await getNamedAccounts()).deployer;

        await deployments.fixture(["all"]); // fixture allows us to run our deploy function with as many tags as we want

        fundMe = await ethers.getContract("FundMe", deployer);

        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      // For the constructor
      describe("constructor", async function () {
        it("Sets the aggregator correctly: ", async function () {
          const response = await fundMe.getPriceFeed();
          // console.log(response);
          // console.log(mockV3Aggregator.address);
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", async function () {
        it("Fails if you don't send enough eth", async function () {
          // running the following would lead to the test working correctly
          // await fundMe.fund();
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", async function () {
        // Before we call withdraw, it would be nice for the contract to already have some cash money in it. So we can have anotehr beforeEach for this
        // section
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("Withdraw ETH from a single funder", async function () {
          // We could also use ethers.provider. Same thing. We're just interested in teh getBalance function
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Get the balance of the contract
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Get the balance of the deployer

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // We wait so that we can see that the entire contract balanace has been added to the funders balance

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          // Just having startingDeployerBalance.add(startingFundMeBalance), endingDeployerBalance) below wouldn't be correct because the deployer uses
          // some gas
          // To get gasCost we can debug above (after transactionReceipt) to see how much gas was used
          const { gasUsed, effectiveGasPrice } = transactionReceipt; // The curly braces notation lets us pull out values conveniently
          const gasCost = gasUsed.mul(effectiveGasPrice);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("Allows us to withdraw with multiple funders", async function () {
          // First we can create a bunch of accounts

          // FORGOT await!!
          const accounts = await ethers.getSigners();
          // console.log(accounts);
          for (i = 1; i < 6; i++) {
            // 1 because we want to ignore the deployer)
            // The deployer is the one controlling the contract so we want to create a new object each time to interact with the contract
            /* Above we had called the fund me contract by the deployer. So the FUndMe function is connected to the deployers accoun  t */

            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            // console.log(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Get the balance of the contract
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Get the balance of the deployer
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt; // The curly braces notation lets us pull out values conveniently
          const gasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${gasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // This should revert because we want all accounts to be rremoved
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1]; // The first account will be some random attacker
          const attackerConnectedContract = await fundMe.connect(attacker);
          // The attacker should not be able to withdraw
          // await expect(attackerConnectedContract.withdraw()).to.be.reverted;
          /** For some reason it works without the await keyword but not otherwise */
          expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });
        it("Cheaper withdraw....", async function () {
          // First we can create a bunch of accounts

          // FORGOT await!!
          const accounts = await ethers.getSigners();
          // console.log(accounts);
          for (i = 1; i < 6; i++) {
            // 1 because we want to ignore the deployer)
            // The deployer is the one controlling the contract so we want to create a new object each time to interact with the contract
            /* Above we had called the fund me contract by the deployer. So the FUndMe function is connected to the deployers accoun  t */

            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            // console.log(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Get the balance of the contract
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Get the balance of the deployer
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt; // The curly braces notation lets us pull out values conveniently
          const gasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${gasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // This should revert because we want all accounts to be rremoved
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("Cheaper Single withdraw..", async function () {
          // We could also use ethers.provider. Same thing. We're just interested in teh getBalance function
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Get the balance of the contract
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Get the balance of the deployer

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // We wait so that we can see that the entire contract balanace has been added to the funders balance

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          // Just having startingDeployerBalance.add(startingFundMeBalance), endingDeployerBalance) below wouldn't be correct because the deployer uses
          // some gas
          // To get gasCost we can debug above (after transactionReceipt) to see how much gas was used
          const { gasUsed, effectiveGasPrice } = transactionReceipt; // The curly braces notation lets us pull out values conveniently
          const gasCost = gasUsed.mul(effectiveGasPrice);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
      });
    });
