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

        domainsContract.on("DomainRegistered", (address, domainDetails) => {
            console.log('DomainRegistered')
            console.log("address: ", address);
            console.log("domainDetails: ", domainDetails);
        });
        domainsContract.on("DomainReleased", (address, domainDetails) => {
            console.log(DomainReleased)
            console.log("address: ", address);
            console.log("domainDetails: ", domainDetails);
        });

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
            it("Should register domain and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                const etherToSend = ethers.parseEther("1");

                const tx = await domainsContract.connect(addr1).registerDomain('com', { value:  etherToSend });

                const domainDetails = await domainsContract.getDomain('com');

                expect(domainDetails.deposit).to.equal(etherToSend);

                const events = await domainsContract.queryFilter(
                    domainsContract.filters.DomainRegistered(addr1.address)
                );
                expect(events.length).to.equal(1, 'Only one event is emitted when registering domain');
                expect(events[0].fragment.name).to.equal('DomainRegistered');
            });

            it("Should fail if not enough etn for registering domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const etherToSend = ethers.parseEther("0.1");

                await expect(domainsContract.connect(addr1).registerDomain('com', { value: etherToSend }))
                    .to.be.revertedWith("Insufficient ETH sent");
            });

            it("Should take deposit as 1 ether when assign domain", async function () {
                const { domainsContract, addr1, ether } = contractState;

                const tx = await domainsContract.connect(addr1).registerDomain('com', { value: ether });

                await expect(tx).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);
            });
        });

        describe('Domain releasing', function () {
            it("Should unregister domain, return deposit and emit event", async function () {
                const { domainsContract, addr1, ether } = contractState;

                const tx1 = await domainsContract.connect(addr1).registerDomain('com', { value:  ether });
                await expect(tx1).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);

                const tx2 = await domainsContract.connect(addr1).unregisterDomain('com');
                await expect(tx2).to.changeEtherBalances([addr1, domainsContract], [ether, -ether]);

                const domainDetails = await domainsContract.getDomain('com');
                const events = await domainsContract.queryFilter(
                    domainsContract.filters.DomainReleased(addr1.address)
                );

                expect(domainDetails.controller).to.equal(AddressZero);
                expect(events.length).to.equal(1, 'Only one event is emitted when unregistering domain');
                expect(events[0].fragment.name).to.equal('DomainReleased');
            });

            it("Should fail if unregistering by not domain owner", async function () {
                const { domainsContract, ether, addr1 } = contractState;

                await domainsContract.registerDomain('com', { value:  ether });

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('com', { value: ether }))
                    .to.be.revertedWith("Domain should be unregistered by the domain owner");
            });

            it("Should fail if unregistering free domain", async function () {
                const { domainsContract, ether, addr1 } = contractState;

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('ua', { value: ether }))
                    .to.be.revertedWith("Domain is not registered yet");
            });
        });
    });

});