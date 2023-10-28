const { ethers } = require("hardhat");

async function main() {
    const stringParserLibrary = await ethers.getContractFactory("contracts/StringParserLibrary.sol:StringParserLibrary");
    const stringParserLibraryDeployed = await stringParserLibrary.deploy();

    const domainParserLibrary = await ethers.getContractFactory("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
        libraries: {
            StringParserLibrary: stringParserLibraryDeployed,
        },
    });
    const domainParserLibraryContract = await domainParserLibrary.deploy();

    const domainRegistry = await ethers.getContractFactory("DomainRegistry", {
        libraries: {
            DomainParserLibrary: domainParserLibraryContract,
        },
    });
    const proxyContract = await upgrades.deployProxy(domainRegistry, {
        initializer: "initialize",
        unsafeAllowLinkedLibraries: true,
    });
    const [account] = await ethers.getSigners();

    console.log("DomainRegistryV1 deployed to:", await proxyContract.getAddress());
    console.log("stringParserLibraryDeployed deployed to:", await stringParserLibraryDeployed.getAddress());
    console.log("domainParserLibraryContract deployed to:", await domainParserLibraryContract.getAddress());
    console.log("Signer is:", await account.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});