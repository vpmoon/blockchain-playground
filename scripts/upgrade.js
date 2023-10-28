const assert = require("assert");
const path = require('path');
const fs = require('fs');

const address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

(async () => {
    const stringParserLibraryFactory = await ethers.getContractFactory("contracts/StringParserLibrary.sol:StringParserLibrary");
    const stringParserLibrary = await stringParserLibraryFactory.deploy();

    const domainParserLibraryFactory = await ethers.getContractFactory("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
        libraries: {
            StringParserLibrary: stringParserLibrary
        }
    });
    const domainParserLibrary = await domainParserLibraryFactory.deploy();
    const artifactsPath = path.resolve(__dirname, '../artifacts/contracts/DomainRegistry.sol/DomainRegistry.json');
    const contractABI = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));

    const oldContract = new ethers.Contract(address, contractABI.abi);

    const domainRegistryV2 = await ethers.getContractFactory("DomainRegistry", {
        libraries: {
            DomainParserLibrary: domainParserLibrary,
        }
    });
    const domainsContractV2 = await upgrades.upgradeProxy(oldContract, domainRegistryV2, {
        call: {
            fn: "reinitialize"
        },
        unsafeAllowLinkedLibraries: true,
    });

    console.log("DomainsContract V2 upgraded");
    const value = await domainsContractV2.REWARD_PERCENT_OWNER();
    console.log("DomainsContract V2 contains new functionality reward_percent=", value);
    assert(BigInt(value) === BigInt(10));

    console.log("address:", address);
    console.log("upgradedToContractV2 address:", await domainsContractV2.getAddress());

    console.log("Addresses are the same!")
    assert(await domainsContractV2.getAddress() === address);
})();
