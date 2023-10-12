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
        const stringParserLibrary = await ethers.deployContract("contracts/StringParserLibrary.sol:StringParserLibrary");

        const domainParserLibrary = await ethers.deployContract("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
            libraries: {
                StringParserLibrary: stringParserLibrary
            }
        });

        const [owner, addr1] = await ethers.getSigners();
        const domainsContract = await ethers.deployContract("DomainRegistry", {
            libraries: {
                DomainParserLibrary: domainParserLibrary
            }
        });

        await domainsContract.waitForDeployment();

        return { domainsContract, owner, addr1 };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe("Deployment", function () {
        describe.skip('Initialization', function () {
            it("Should set owner correctly", async function () {
                const { domainsContract, owner } = contractState;

                expect(await domainsContract.owner()).to.equal(owner.address);
            });
        });

        describe.skip('Tracking events', function () {
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
            it("Should set and get price", async function () {
                const { domainsContract } = contractState;

                await domainsContract.setDomainLevelPrice(1, ethers.parseEther("2.75"));
                await domainsContract.setDomainLevelPrice(2, ethers.parseEther("2.5"));
                await domainsContract.setDomainLevelPrice(3, ethers.parseEther("2.25"));
                await domainsContract.setDomainLevelPrice(4, ethers.parseEther("2"));

                const level1 = await domainsContract.getDomainPrice('ua');
                const level2 = await domainsContract.getDomainPrice('shop.ua');
                const level3 = await domainsContract.getDomainPrice('demo.shop.ua');
                const level4 = await domainsContract.getDomainPrice('stg0.demo.shop.ua');

                expect(level1).to.equal(ethers.parseEther("2.75"));
                expect(level2).to.equal(ethers.parseEther("2.5"));
                expect(level3).to.equal(ethers.parseEther("2.25"));
                expect(level4).to.equal(ethers.parseEther("2"));
            });

            it("Should register domain and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                await domainsContract.connect(addr1).registerDomain('com', { value:  ether });

                const address = await domainsContract.getDomain('com');

                expect(address).to.equal(addr1.address);
            });

            it(`Should fail if domain is already reserved`, async function () {
                const { domainsContract } = contractState;

                domainsContract.registerDomain('com', { value: ether })

                await expect(domainsContract.registerDomain('com', { value: ether }))
                    .to.be.revertedWith("Domain is already reserved");
            });

            it(`Should fail if domain length is not valid`, async function () {
                const { domainsContract } = contractState;

                await expect(domainsContract.registerDomain('c', { value: ether }))
                    .to.be.revertedWith("Domain length should be between 2 and 253");
            });

            it("Should fail if not enough etn for registering domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const etherToSend = ethers.parseEther("0.1");

                await expect(domainsContract.connect(addr1).registerDomain('com', { value: etherToSend }))
                    .to.be.revertedWith("Insufficient ETH sent");
            });

            ['google.com', 'http://new.business.com', 'https://stg0.new.com.ua', 'demo.stg0.new.com.ua'].forEach((domain) => {
                it(`Should not allow to register ${domain} if parent domain doesn't exists`, async function () {
                    const { domainsContract } = contractState;

                    domainsContract.registerDomain(domain, { value: ether })

                    await expect(domainsContract.registerDomain(domain, { value: ether }))
                        .to.be.revertedWith("Parent domain doesn't exist");
                });
            });

            [
                { domain: 'google.com', parents: ['com'] },
                { domain: 'http://new.business.no', parents: ['no', 'business.no'] },
                { domain: 'https://stg0.new.net.ua', parents: ['ua', 'net.ua', 'new.net.ua'] },
                { domain: 'demo.stg0.new.com.pl', parents: ['pl', 'com.pl', 'new.com.pl', 'stg0.new.com.pl'] },
            ].forEach(({ domain, parents }) => {
                it(`Should allow to register ${domain} domain if parents exist`, async function () {
                    const { domainsContract, owner } = contractState;

                    for (const parent of parents) {
                        await domainsContract.registerDomain(parent, { value: ether });
                    }
                    await domainsContract.registerDomain(domain, { value: ether });

                    const address = await domainsContract.getDomain(domain);

                    expect(address).to.equal(owner.address);
                });
            });

            it("Should take deposit as 1 ether when assign domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const tx = await domainsContract.connect(addr1).registerDomain('com', { value: ether });

                await expect(tx).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);
            });
        });

        describe.skip('Domain releasing', function () {
            it("Should unregister domain, return deposit and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                const tx1 = await domainsContract.connect(addr1).registerDomain('com', { value:  ether });
                await expect(tx1).to.changeEtherBalances([addr1, domainsContract], [-ether, ether]);

                const tx2 = await domainsContract.connect(addr1).unregisterDomain('com');
                await expect(tx2).to.changeEtherBalances([addr1, domainsContract], [ether, -ether]);

                const address = await domainsContract.getDomain('com');
                expect(address).to.equal(AddressZero);


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