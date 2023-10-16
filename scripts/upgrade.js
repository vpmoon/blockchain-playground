const assert = require("assert");

(async () => {
    const stringParserLibraryFactory = await ethers.getContractFactory("contracts/StringParserLibrary.sol:StringParserLibrary");
    const stringParserLibrary = await stringParserLibraryFactory.deploy();

    const domainParserLibraryFactory = await ethers.getContractFactory("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
        libraries: {
            StringParserLibrary: stringParserLibrary
        }
    });
    const domainParserLibrary = await domainParserLibraryFactory.deploy();

    const domainRegistry = await ethers.getContractFactory("DomainRegistry", {
        libraries: {
            DomainParserLibrary: domainParserLibrary,
        }
    });
    const domainsProxy = await upgrades.deployProxy(domainRegistry, {
        initializer: "initialize",
        unsafeAllowLinkedLibraries: true,
    });
    const address = await domainsProxy.getAddress();

    const domainRegistryV2 = await ethers.getContractFactory("DomainRegistryV2", {
        libraries: {
            DomainParserLibrary: domainParserLibrary,
        }
    });
    const domainsContractV2 = await upgrades.upgradeProxy(address, domainRegistryV2, {
        unsafeAllowLinkedLibraries: true,
    });

    console.log("DomainsContractV2 upgraded");
    console.log("address:", address);
    console.log("upgradedToContractV2 address:", await domainsContractV2.getAddress());
    console.log("Addresses are the same!")

    assert(await domainsContractV2.getAddress() === address);
})();
