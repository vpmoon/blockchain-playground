// deployProxyWithLibraries.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Deploy Library2
    const Library2 = await ethers.getContractFactory("contracts/StringParserLibrary.sol:StringParserLibrary");
    const library2 = await Library2.deploy();
    console.log("Library2 deployed to:", library2.address);

    // Deploy Library1 with the address of Library2
    const Library1 = await ethers.getContractFactory("contracts/DomainParserLibrary.sol:DomainParserLibrary",  {
        libraries: {
            StringParserLibrary: library2
        }
    });
    const library1 = await Library1.deploy();
    console.log("Library1 deployed to:", library1.address);

    // Deploy MainContract with the address of Library1
    const MainContract = await ethers.getContractFactory("DomainRegistry", {
        libraries: {
            DomainParserLibrary: library1
        }
    });
    console.log(upgrades)
    const mainContract = await upgrades.deployProxy(MainContract, [100], {
        initializer: "initialize",
    });
    console.log("MainContract deployed to:", mainContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
