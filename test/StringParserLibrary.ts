const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("StringParserLibrary contract", function () {
    let stringParserLibrary: ethers.Contract;
    
    async function deployTokenFixture(): Promise<ethers.Contract> {
        return ethers.deployContract("contracts/StringParserLibrary.sol:StringParserLibrary");
    }

    beforeEach(async () => {
        stringParserLibrary = await loadFixture(deployTokenFixture);
    });

    it("substring", async function () {
        const res = await stringParserLibrary.substring('https://stg0.gov.ua', 8);

        expect(res).to.equal('stg0.gov.ua');
    });


});