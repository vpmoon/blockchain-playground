const { ethers } = require('ethers');
const { config } = require('./config');

console.log(config.jsonRpcUrl);
console.log(config.contractAddress);
console.log(config.contractAbi);
console.log(config.mnemonic);

function getContract() {
    const { rpcUrl, address, abi, mnemonic } = config;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    return new ethers.Contract(address, abi, wallet);
}

async function withdrawEtn() {
    const contract = getContract();

    await contract.withdraw({ gasLimit: 30000000 });
}

async function withdrawUsdt() {
    console.log(config)
    return 'usdt return'
}

module.exports = { withdrawEtn, withdrawUsdt }