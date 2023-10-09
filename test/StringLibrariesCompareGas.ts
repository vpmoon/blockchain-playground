const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

export type StringLibrariesCompareGas = {
    stringParserLibrary: ethers.Contract,
    stringParserAssemblyLibrary: ethers.Contract,
}

describe("LibrariesRegistryGas gas testing", function () {
    let contractState: StringLibrariesCompareGas;

    async function deployTokenFixture(): Promise<StringLibrariesCompareGas> {
        const stringParserLibrary = await ethers.deployContract("contracts/StringParserLibrary.sol:StringParserLibrary");
        const stringParserAssemblyLibrary = await ethers.deployContract("contracts/StringParserAssemblyLibrary.sol:StringParserAssemblyLibrary");

        return { stringParserLibrary, stringParserAssemblyLibrary };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe("Libraries gas", function () {
        it("StringParserLibrary - should show gas", async function () {
            const { stringParserLibrary } = contractState;

            await stringParserLibrary.stripAfter('https://stg0.gov.ua', '://');
        });

        it("StringParserAssemblyLibrary - should show gas", async function () {
            const { stringParserAssemblyLibrary } = contractState;

            await stringParserAssemblyLibrary.stripAfter('https://stg0.gov.ua', '://');
        });
    });
});