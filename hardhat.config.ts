import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.INFURA_API_KEY,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/3d5806bda8dd4886989d2fcb4ef71e2f',
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },
  },
};

export default config;
