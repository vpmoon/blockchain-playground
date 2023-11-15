const { ethers } = require("hardhat");
const {address} = require("hardhat/internal/core/config/config-validation");

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

    const domainTokenFactory = await ethers.getContractFactory("contracts/DomainToken.sol:DomainToken");
    const domainTokenContract = await domainTokenFactory.deploy('DomainToken', 'USDT', BigInt(4 * (10 ** 40)), );

    const proxyContract = await upgrades.deployProxy(domainRegistry, [
        '0x694AA1769357215DE4FAC081bf1f309aDC325306',
        await domainTokenContract.getAddress(),
    ], {
        initializer: "initialize",
        unsafeAllowLinkedLibraries: true,
    });
    console.log("DomainRegistryV1 deployed to:", await proxyContract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});