import assert from "assert";

(async () => {
    const ContractV2 = await ethers.getContractFactory("DomainRegistry");
    const address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    const upgradedToContractV2 = await upgrades.upgradeProxy(address, ContractV2);
    console.log("SimpleStorageV2 upgraded\n");

    console.log("address:", address);
    console.log("upgradedToContractV2 address:", await upgradedToContractV2.getAddress());

    console.log("\nAddresses are the same!")

    assert(await upgradedToContractV2.getAddress() === address);
})();
