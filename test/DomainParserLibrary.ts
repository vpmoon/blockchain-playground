import { DomainParserLibraryFixture } from "./DomainParserLibraryFixture.types";

const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("DomainParserLibrary contract", function () {
    let contractState: DomainParserLibraryFixture;

    async function deployTokenFixture(): Promise<DomainParserLibraryFixture> {
        const domainParserLibrary = await ethers.deployContract("contracts/DomainParserLibrary.sol:DomainParserLibrary");

        return { domainParserLibrary };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe('Tracking events', function () {
        it("substring", async function () {
            const { domainParserLibrary } = contractState;
            const res = await domainParserLibrary.substring('https://stg0.gov.ua', 8);

            expect(res).to.equal('stg0.gov.ua');
        });

        it("getRootDomain", async function () {
            const { domainParserLibrary } = contractState;

            const res1 = await domainParserLibrary.getRootDomain('https://stg0.gov.ua');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await domainParserLibrary.getRootDomain('stg0.gov.ua');
            expect(res2).to.equal('stg0.gov.ua');
        });

        it("getParentDomain", async function () {
            const { domainParserLibrary } = contractState;

            const res1 = await domainParserLibrary.getParentDomain('https://demo.stg0.gov.ua');
            expect(res1).to.equal('stg0.gov.ua');

            const res2 = await domainParserLibrary.getParentDomain('demo.stg0.gov.ua');
            expect(res2).to.equal('stg0.gov.ua');
        });
    });
});