const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

const undefinedAddress = "0x0000000000000000000000000000000000000000";

describe("RegisterDomains contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatToken = await ethers.deployContract("RegisterDomains");

        await hardhatToken.waitForDeployment();

        const ether = ethers.parseEther("1");

        return { hardhatToken, owner, addr1, addr2, ether };
    }

    describe("Deployment", function () {
        it("Should register domain", async function () {
            const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

            expect(await hardhatToken.owner()).to.equal(owner.address);

            const etherToSend = ethers.parseEther("1");

            await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value:  etherToSend });
            const domainDetails = await hardhatToken.getDomainOwner('com');

            expect(domainDetails.domainOwner).to.equal(addr1.address);
            expect(domainDetails.deposit).to.equal(etherToSend);
        });

        it("Should fail if not enough etn for registering domain", async function () {
            const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

            expect(await hardhatToken.owner()).to.equal(owner.address);

            const etherToSend = ethers.parseEther("0.1");

            await expect(hardhatToken.connect(addr1)
                .registerDomain('com', { from: addr1, value: etherToSend }))
                .to.be.revertedWith("Insufficient ETH sent");
        });

        it("Should take deposit as 1 ether when assign domain", async function () {
            const { hardhatToken, addr1, ether } = await loadFixture(deployTokenFixture);

            const tx = await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value: ether });

            await expect(tx).to.changeEtherBalances([addr1, hardhatToken], [-ether, ether]);
        });

        it("Should fail if unregistering by not owner", async function () {
            const { hardhatToken, addr1, addr2, ether } = await loadFixture(deployTokenFixture);

            await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value:  ether });

            await expect(hardhatToken.connect(addr2)
                .unregisterDomain('com', { from: addr2, value: ether }))
                .to.be.revertedWith("Domain should be unregistered by the domain owner");
        });

        it("Should unregister domain and return deposit", async function () {
            const { hardhatToken, addr1, ether } = await loadFixture(deployTokenFixture);

            await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value:  ether });
            const tx = await hardhatToken.connect(addr1).unregisterDomain('com');

            const domainDetails = await hardhatToken.getDomainOwner('com');

            expect(domainDetails.domainOwner).to.equal(undefinedAddress)
            await expect(tx).to.changeEtherBalances([addr1, hardhatToken], [ether, -ether]);
        });
    });

});