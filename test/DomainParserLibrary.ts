import { DomainParserLibraryFixture } from "./DomainParserLibraryFixture.types";

const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
import { AddressZero } from "@ethersproject/constants";

describe("DomainParserLibrary contract", function () {
    let contractState: DomainParserLibraryFixture;

    async function deployTokenFixture(): Promise<DomainParserLibraryFixture> {
        const domainParserLibrary = await ethers.deployContract("contracts/DomainParserLibrary.sol:DomainParserLibrary");

        return { domainParserLibrary };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe("Deployment", function () {
        describe('Tracking events', function () {
            it("Should catch events when register and release", async function () {
                const { domainParserLibrary } = contractState;
                const res = await domainParserLibrary.sqrt(5);
                expect(res).to.equal(25)
            });
        });
    });

});