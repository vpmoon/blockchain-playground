const contractArtifact = require("../../../artifacts/contracts/DomainRegistry.sol/DomainRegistry.json");

require('dotenv').config()

module.exports.config = {
  rpcUrl: process.env.RPC_URL,
  address: process.env.CONTRACT_ADDRESS,
  abi: contractArtifact.abi,
  mnemonic: process.env.MNEMONIC,
}
