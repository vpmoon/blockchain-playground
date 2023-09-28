import { RegisterDomainsFixture } from "./RegisterDomains.types";

const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
import { AddressZero } from "@ethersproject/constants";

describe("RegisterDomains contract", function () {
    let contractState: RegisterDomainsFixture;

    async function deployTokenFixture(): Promise<RegisterDomainsFixture> {
        const [owner, addr1] = await ethers.getSigners();
        const domainsContract = await ethers.deployContract("RegisterDomains");
        const ether = ethers.parseEther("1");

        await domainsContract.waitForDeployment();

        return { domainsContract, owner, addr1, ether };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe("Deployment", function () {
        describe('Initialization', function () {
            it("Should set owner correctly", async function () {
                const { domainsContract, owner } = contractState;

                expect(await domainsContract.owner()).to.equal(owner.address);
            });
        });

        describe('Domain registration', function () {
            it("Should register domain", async function () {
                const { domainsContract, owner } = contractState;

                const etherToSend = ethers.parseEther("1");

                await domainsContract.registerDomain('com', { value:  etherToSend });

                const domainDetails = await domainsContract.getDomain('com');

                expect(domainDetails.controller).to.equal(owner.address);
                expect(domainDetails.deposit).to.equal(etherToSend);
            });

            it("Should fail if not enough etn for registering domain", async function () {
                const { domainsContract } = contractState;

                const etherToSend = ethers.parseEther("0.1");

                await expect(domainsContract.registerDomain('com', { value: etherToSend }))
                    .to.be.revertedWith("Insufficient ETH sent");
            });

            it("Should take deposit as 1 ether when assign domain", async function () {
                const { domainsContract, owner, ether } = contractState;

                const tx = await domainsContract.registerDomain('com', { value: ether });

                await expect(tx).to.changeEtherBalances([owner, domainsContract], [-ether, ether]);
            });
        });

        describe('Domain releasing', function () {
            it("Should unregister domain and return deposit", async function () {
                const { domainsContract, owner, ether } = contractState;

                await domainsContract.registerDomain('com', { value:  ether });
                const tx = await domainsContract.unregisterDomain('com');

                const domainDetails = await domainsContract.getDomain('com');

                expect(domainDetails.controller).to.equal(AddressZero)
                await expect(tx).to.changeEtherBalances([owner, domainsContract], [ether, -ether]);
            });

            it("Should fail if unregistering by not owner", async function () {
                const { domainsContract, addr1, ether } = contractState;

                await domainsContract.registerDomain('com', { value:  ether });

                await expect(domainsContract.connect(addr1)
                    .unregisterDomain('com', { value: ether }))
                    .to.be.revertedWith("Domain should be unregistered by the domain owner");
            });

            it("Should fail if unregistering free domain", async function () {
                const { domainsContract, ether } = contractState;

                await expect(domainsContract
                    .unregisterDomain('ua', { value: ether }))
                    .to.be.revertedWith("Domain is not registered yet");
            });
        });
    });

});