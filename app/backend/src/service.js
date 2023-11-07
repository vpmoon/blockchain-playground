const { ethers } = require('ethers');
const { config } = require('./config');

function getContract() {
    const { rpcUrl, address, abi, mnemonic } = config;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    return new ethers.Contract(address, abi, wallet);
}

async function withdraw(currency) {
    const contract = getContract();

    await contract.withdraw(currency, { gasLimit: 30000000 });
}

async function balance(address, currency) {
    const contract = getContract();

    return contract.getControllerShares(address, currency);
}

module.exports = { withdraw, balance }