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

    describe('getRootDomain', function () {
        it("returns root domain if provided url with protocol", async function () {
            const result = await domainParserLibrary.getRootDomain('https://stg0.gov.ua');
            expect(result).to.equal('stg0.gov.ua');
        });

        it("returns root domain if provided url without protocol", async function () {
            const result = await domainParserLibrary.getRootDomain('stg0.gov.ua');
            expect(result).to.equal('stg0.gov.ua');
        });

        it("returns initial string if provided wrong url", async function () {
            const result = await domainParserLibrary.getRootDomain('stg0govua');
            expect(result).to.equal('stg0govua');
        });

        it("returns initial string if provided top-level domain", async function () {
            const result = await domainParserLibrary.getRootDomain('http://ua');
            expect(result).to.equal('ua');
        });
    });

    describe('getParentDomain', function () {
        it("returns parent domain if provided url with protocol", async function () {
            const result = await domainParserLibrary.getParentDomain('https://demo.stg0.gov.ua');
            expect(result).to.equal('stg0.gov.ua');
        });

        it("returns parent domain if provided url without protocol", async function () {
            const result = await domainParserLibrary.getParentDomain('demo.stg0.gov.ua');
            expect(result).to.equal('stg0.gov.ua');
        });

        it("returns initial string if provided wrong url", async function () {
            const result = await domainParserLibrary.getParentDomain('stg0govua');
            expect(result).to.equal('stg0govua');
        });
    });

    describe('getDomainLevel ', function () {
        it("returns level if url is top domain", async function () {
            const result = await domainParserLibrary.getDomainLevel('ua');

            expect(result).to.equal(1);
        });

        it("returns level if url is not a top domain", async function () {
            const result = await domainParserLibrary.getDomainLevel("https://stg0.new.net.ua");

            expect(result).to.equal(4);
        });
    });
});