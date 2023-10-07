import { DomainRegistryFixture } from "./DomainRegistry.types";

const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
import { AddressZero } from "@ethersproject/constants";

describe("DomainRegistry contract", function () {
    let contractState: DomainRegistryFixture;
    const ether = ethers.parseEther("1");

    async function deployTokenFixture(): Promise<DomainRegistryFixture> {
        const [owner, addr1] = await ethers.getSigners();
        const domainsContract = await ethers.deployContract("DomainRegistry");

        await domainsContract.waitForDeployment();

        return { domainsContract, owner, addr1 };
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

        describe('Tracking events', function () {
            it("Should catch events when register and release", async function () {
                const { domainsContract, owner } = contractState;
                await expect(domainsContract.registerDomain('com', { value:  ether }))
                    .to.emit(domainsContract, 'DomainRegistered')
                    .withArgs(owner.address, 'com');

                await expect(domainsContract.unregisterDomain('com'))
                    .to.emit(domainsContract, 'DomainReleased')
                    .withArgs(owner.address, 'com');

            });
        });

        describe('Domain registration', function () {
            it("Should register domain and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                await domainsContract.connect(addr1).registerDomain('com', { value:  ether });

                const domainDetails = await domainsContract.getDomain('com');

                expect(domainDetails.controller).to.equal(addr1.address);
            });

            it("Should fail if not enough etn for registering domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const etherToSend = ethers.parseEther("0.1");

                await expect(domainsContract.connect(addr1).registerDomain('com', { value: etherToSend }))
                    .to.be.revertedWith("Insufficient ETH sent");
            });

            it("Should take deposit as 1 ether when assign domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const tx = await domainsContract.connect(addr1).registerDomain('com', { value: ether });

                await expect(tx).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);
            });
        });

        describe('Domain releasing', function () {
            it("Should unregister domain, return deposit and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                const tx1 = await domainsContract.connect(addr1).registerDomain('com', { value:  ether });
                await expect(tx1).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);

                const tx2 = await domainsContract.connect(addr1).unregisterDomain('com');
                await expect(tx2).to.changeEtherBalances([addr1, domainsContract], [ether, -ether]);

                const domainDetails = await domainsContract.getDomain('com');
                expect(domainDetails.controller).to.equal(AddressZero);


            });

            it("Should fail if unregistering by not domain owner", async function () {
                const { domainsContract, addr1 } = contractState;

                await domainsContract.registerDomain('com', { value:  ether });

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('com', { value: ether }))
                    .to.be.revertedWith("Domain should be unregistered by the domain owner");
            });

            it("Should fail if unregistering free domain", async function () {
                const { domainsContract, addr1 } = contractState;

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('ua', { value: ether }))
                    .to.be.revertedWith("Domain is not registered yet");
            });
        });
    });

});