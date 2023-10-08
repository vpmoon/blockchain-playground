const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("DomainParserLibrary contract", function () {
    let domainParserLibrary: ethers.Contract;

    async function deployTokenFixture(): Promise<ethers.Contract> {
        const stringParserLibrary = await ethers.deployContract("contracts/StringParserLibrary.sol:StringParserLibrary");

        return ethers.deployContract("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
            libraries: {
                StringParserLibrary: stringParserLibrary
            }
        });
    }

    beforeEach(async () => {
        domainParserLibrary = await loadFixture(deployTokenFixture);
    });

    describe('Tracking events', function () {

        it("getRootDomain", async function () {
            const res1 = await domainParserLibrary.getRootDomain('https://stg0.gov.ua');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await domainParserLibrary.getRootDomain('stg0.gov.ua');
            expect(res2).to.equal('stg0.gov.ua');
        });

        it("getParentDomain", async function () {
            const res1 = await domainParserLibrary.getParentDomain('https://demo.stg0.gov.ua');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await domainParserLibrary.getParentDomain('demo.stg0.gov.ua');
            expect(res2).to.equal('stg0.gov.ua');
        });
    });
});