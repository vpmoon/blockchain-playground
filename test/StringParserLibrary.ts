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

    describe('substring', () => {
        it("returns substring by starting index", async function () {
            const res = await stringParserLibrary.substring('https://stg0.gov.ua', 8);

            expect(res).to.equal('stg0.gov.ua');
        });
    });

    describe('stripAfter', () => {
        it("returns substring after the phrase if exists", async function () {
            const res1 = await stringParserLibrary.stripAfter('https://stg0.gov.ua', '://');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await stringParserLibrary.stripAfter('https://stg0.gov.ua', '.');
            expect(res2).to.equal('gov.ua');
        });

        it("returns initial string if not found", async function () {
            const res = await stringParserLibrary.stripAfter('https://stg0.gov.ua', 'hi');

            expect(res).to.equal('https://stg0.gov.ua');
        });
    });

    describe('indexOf', () => {
        it("return index of substring if exists", async function () {
            const res = await stringParserLibrary.indexOf('https://stg0.gov.ua', '://');

            expect(res).to.equal(5);
        });

        it("return max number value if not exists", async function () {
            const res = await stringParserLibrary.indexOf('https://stg0.gov.ua', 'hello');

            expect(res).to.equal(255);
        });
    });

    describe('countSymbolOccurrences', () => {
        it("returns count of symbol occurrences", async function () {
            const res1 = await stringParserLibrary.countSymbolOccurrences('ua', '.');
            expect(res1).to.equal(0);

            const res2 = await stringParserLibrary.countSymbolOccurrences('test.ua', '.');
            expect(res2).to.equal(1);

            const res3 = await stringParserLibrary.countSymbolOccurrences('sub.stg0.gov.ua', '.');
            expect(res3).to.equal(3);
        });

        it("throws error if symbol has length > 1", async function () {
            await expect(stringParserLibrary.countSymbolOccurrences('test.ua', 'str'))
                .to.be.revertedWith("Method to find occurrences supports only one symbol string");
        });
    });

    describe('split', () => {
        it("throws error if symbol has length > 1", async function () {
            await expect(stringParserLibrary.split('test.ua', 'str'))
                .to.be.revertedWith("Method to find occurrences supports only one symbol string");
        });

        it("returns array of substring split by symbol", async function () {
            const res = await stringParserLibrary.split('sub.stg0.gov.ua', '.');

            expect(res).to.deep.equal(['sub', 'stg0', 'gov', 'ua']);
        });
    });
});