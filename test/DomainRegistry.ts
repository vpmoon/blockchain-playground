import { DomainRegistryFixture } from "./DomainRegistry.types";
require("@openzeppelin/hardhat-upgrades");

const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
import { AddressZero } from "@ethersproject/constants";

describe("DomainRegistry contract", function () {
    let contractState: DomainRegistryFixture;
    const ether = ethers.parseEther("1");
    const priceLevel1Domain = ethers.parseEther("0.75");
    const priceLevel2Domain = ethers.parseEther("0.5");
    const priceLevel3Domain = ethers.parseEther("0.25");
    const priceLevel4Domain = ethers.parseEther("0.15");
    const priceLevel5Domain = ethers.parseEther("0.1");

    async function deployTokenFixture(): Promise<DomainRegistryFixture> {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const stringParserLibraryFactory = await ethers.getContractFactory("contracts/StringParserLibrary.sol:StringParserLibrary");
        const stringParserLibrary = await stringParserLibraryFactory.deploy();

        const domainParserLibraryFactory = await ethers.getContractFactory("contracts/DomainParserLibrary.sol:DomainParserLibrary", {
            libraries: {
                StringParserLibrary: stringParserLibrary
            }
        });
        const domainParserLibrary = await domainParserLibraryFactory.deploy();

        const domainRegistry = await ethers.getContractFactory("DomainRegistry", {
            libraries: {
                DomainParserLibrary: domainParserLibrary,
            }
        });
        const domainsContract = await domainRegistry.deploy();
        await domainsContract.reinitialize();

        return { domainsContract, owner, addr1, addr2 };
    }

    beforeEach(async () => {
        contractState = await loadFixture(deployTokenFixture);
    });

    describe("Deployment V2", function () {
        describe('Initialization', function () {
            it("Should set owner correctly", async function () {
                const { domainsContract, owner } = contractState;

                expect(await domainsContract.owner()).to.equal(owner.address);
            });
        });

        describe('Tracking events', function () {
            it("Should catch events when register and release", async function () {
                const { domainsContract, owner } = contractState;
                await expect(domainsContract.registerDomain('com', { value:  priceLevel1Domain }))
                    .to.emit(domainsContract, 'DomainRegistered')
                    .withArgs(owner.address, 'com');

                await expect(domainsContract.unregisterDomain('com'))
                    .to.emit(domainsContract, 'DomainReleased')
                    .withArgs(owner.address, 'com');

            });
        });

        describe('Price management', function () {
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

            it("throws if set price not by owner", async function () {
                const { domainsContract, addr1 } = contractState;

                await expect(domainsContract.connect(addr1).setDomainLevelPrice(6, ethers.parseEther("2")))
                    .to.be.revertedWithCustomError(domainsContract, 'OwnableUnauthorizedAccount');
            });
        });

        describe('Domain registration', function () {
            it("Should register domain and emit event", async function () {
                const { domainsContract, addr1 } = contractState;

                await domainsContract.connect(addr1).registerDomain('com', { value:  priceLevel1Domain });

                const address = await domainsContract.getDomain('com');

                expect(address).to.equal(addr1.address);
            });

            it(`Should fail if domain is already reserved`, async function () {
                const { domainsContract } = contractState;

                domainsContract.registerDomain('com', { value: priceLevel1Domain })

                await expect(domainsContract.registerDomain('com', { value: priceLevel1Domain }))
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'DomainRegistryDomainIsAlreadyReserved'
                    );
            });

            it(`Should fail if domain length is not valid`, async function () {
                const { domainsContract } = contractState;

                await expect(domainsContract.registerDomain('c', { value: priceLevel1Domain }))
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'DomainRegistryDomainNameLengthIsNotValid'
                    );
            });

            it("Should fail if not enough etn for registering domain", async function () {
                const { domainsContract, addr1 } = contractState;

                const etherToSend = ethers.parseEther("0.1");

                await expect(domainsContract.connect(addr1).registerDomain('com', { value: etherToSend }))
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'DomainRegistryNoSufficientEtn'
                    );
            });

            ['google.com', 'http://new.business.com', 'https://stg0.new.com.ua', 'demo.stg0.new.com.ua'].forEach((domain, i) => {
                it(`Should not allow to register ${domain} if parent domain doesn't exists`, async function () {
                    const { domainsContract } = contractState;

                    domainsContract.registerDomain(domain, { value: eval(`priceLevel${i + 1}Domain`) })

                    await expect(domainsContract.registerDomain(domain, { value: ether }))
                        .to.be.revertedWithCustomError(
                            domainsContract,
                            'DomainRegistryParentDomainNotExists'
                        );
                });
            });

            [
                { domain: 'google.com', parents: ['com'] },
                { domain: 'http://new.business.no', parents: ['no', 'business.no'] },
                { domain: 'https://stg0.new.net.ua', parents: ['ua', 'net.ua', 'new.net.ua'] },
                { domain: 'demo.stg0.new.com.pl', parents: ['pl', 'com.pl', 'new.com.pl', 'stg0.new.com.pl'] },
            ].forEach(({ domain, parents }, i) => {
                it(`Should allow to register ${domain} domain if parents exist`, async function () {
                    const { domainsContract, owner } = contractState;

                    for (const [j, parent] of parents.entries()) {
                        await domainsContract.registerDomain(parent, { value: eval(`priceLevel${j + 1}Domain`) });
                    }
                    await domainsContract.registerDomain(domain, { value: eval(`priceLevel${i + 2}Domain`) });

                    const address = await domainsContract.getDomain(domain);

                    expect(address).to.equal(owner.address);
                });
            });

            it("Should take domain price in ether when assign domain 1 level", async function () {
                const { domainsContract, addr1, owner } = contractState;

                const tx1 = await domainsContract.connect(addr1).registerDomain('com', { value: priceLevel1Domain });
                await expect(tx1).to.changeEtherBalances(
                    [addr1],
                    [-priceLevel1Domain]
                );

                const tx2 = await domainsContract.connect(owner).withdraw();
                await expect(tx2).to.changeEtherBalances(
                    [owner],
                    [priceLevel1Domain]
                );
            });

            it("Should reward parent domain owner when assign domain 2 level", async function () {
                const { domainsContract, addr1, addr2, owner } = contractState;

                await domainsContract.connect(addr1).registerDomain('com', { value: priceLevel1Domain });
                const tx = await domainsContract.connect(addr2).registerDomain('test.com', { value: priceLevel2Domain });
                await expect(tx).to.changeEtherBalances(
                    [addr2],
                    [-priceLevel2Domain]
                );

                const tx2 = await domainsContract.connect(addr1).withdraw();
                await expect(tx2).to.changeEtherBalances(
                    [addr1],
                    [priceLevel2Domain * BigInt(10) / BigInt(100)]
                );

                const tx3 = await domainsContract.connect(owner).withdraw();
                await expect(tx3).to.changeEtherBalances(
                    [owner],
                    [priceLevel1Domain + priceLevel2Domain - priceLevel2Domain * BigInt(10) / BigInt(100)]
                );
            });

            it("Throws if no balance to withdraw", async () => {
                const { domainsContract } = contractState;

                await expect(domainsContract
                    .withdraw())
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'WithdrawNoBalanceAvailable'
                    );
            })
        });

        describe('Domain releasing', function () {
            it("Should unregister domain without balance change", async function () {
                const { domainsContract, addr1, owner } = contractState;

                await domainsContract.connect(addr1).registerDomain('com', { value:  priceLevel1Domain });
                const tx2 = await domainsContract.connect(addr1).unregisterDomain('com');
                await expect(tx2).to.changeEtherBalances([addr1, owner], [0, 0]);

                const address = await domainsContract.getDomain('com');
                expect(address).to.equal(AddressZero);
            });

            it("Should fail if unregistering by not domain owner", async function () {
                const { domainsContract, addr1 } = contractState;

                await domainsContract.registerDomain('com', { value:  priceLevel1Domain });

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('com'))
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'DomainRegistryOnlyDomainOwnerAllowed'
                    );
            });

            it("Should fail if unregistering already free domain", async function () {
                const { domainsContract, addr1 } = contractState;

                await expect(domainsContract
                    .connect(addr1)
                    .unregisterDomain('ua'))
                    .to.be.revertedWithCustomError(
                        domainsContract,
                        'DomainRegistryDomainIsNotRegistered'
                    );
            });
        });

    });

});