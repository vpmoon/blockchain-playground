const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("StringParserAssemblyLibrary contract", function () {
    let stringParserAssemblyLibrary: ethers.Contract;
    
    async function deployTokenFixture(): Promise<ethers.Contract> {
        return ethers.deployContract("contracts/StringParserAssemblyLibrary.sol:StringParserAssemblyLibrary");
    }

    beforeEach(async () => {
        stringParserAssemblyLibrary = await loadFixture(deployTokenFixture);
    });

    describe('stripAfter', () => {
        it("returns substring after the phrase if exists", async function () {
            const res1 = await stringParserAssemblyLibrary.stripAfter('https://stg0.gov.ua', '://');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await stringParserAssemblyLibrary.stripAfter('https://stg0.gov.ua', '.');
            expect(res2).to.equal('gov.ua');
        });

        it("returns initial string if not found", async function () {
            const res = await stringParserAssemblyLibrary.stripAfter('https://stg0.gov.ua', 'hi');

            expect(res).to.equal('https://stg0.gov.ua');
        });
    });
});