require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: 'https://ropsten.infura.io/v3/2bdf1c37b60147b598123edc3e903793',
      accounts: [process.env.pk], //please set your private key here
      //gas: 2100000,
      //gasPrice: 80000000
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/2bdf1c37b60147b598123edc3e903793',
      accounts: [process.env.pk] //please set your private key here
    }
  }
};
