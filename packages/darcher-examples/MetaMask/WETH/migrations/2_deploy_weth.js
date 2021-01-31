let contract = artifacts.require("WETH9");


module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(contract);
};