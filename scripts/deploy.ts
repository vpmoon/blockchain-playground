import { ethers } from "hardhat";

async function main() {
  const stringParserLibrary = await ethers.deployContract("contracts/StringParserLibrary.sol:StringParserLibrary");
  const domainParserLibrary = await ethers.deployContract("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
    libraries: {
      StringParserLibrary: stringParserLibrary
    }
  });

  const contract = await ethers.deployContract("DomainRegistry", {
    libraries: {
      DomainParserLibrary: domainParserLibrary
    }
  });

  await contract.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
