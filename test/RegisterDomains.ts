const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

const undefinedAddress = "0x0000000000000000000000000000000000000000";

describe("RegisterDomains contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1] = await ethers.getSigners();
        const hardhatToken = await ethers.deployContract("RegisterDomains");
        const ether = ethers.parseEther("1");

        await hardhatToken.waitForDeployment();

        return { hardhatToken, owner, addr1, ether };
    }

    describe("Deployment", function () {
        it("Should set owner correctly", async function () {
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

            expect(await hardhatToken.owner()).to.equal(owner.address);
        });

        it("Should register domain", async function () {
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

            const etherToSend = ethers.parseEther("1");

            await hardhatToken.registerDomain('com', { value:  etherToSend });

            const domainDetails = await hardhatToken.getDomain('com');

            expect(domainDetails.domainOwner).to.equal(owner.address);
            expect(domainDetails.deposit).to.equal(etherToSend);
        });

        it("Should fail if not enough etn for registering domain", async function () {
            const { hardhatToken } = await loadFixture(deployTokenFixture);

            const etherToSend = ethers.parseEther("0.1");

            await expect(hardhatToken.registerDomain('com', { value: etherToSend }))
                .to.be.revertedWith("Insufficient ETH sent");
        });

        it("Should take deposit as 1 ether when assign domain", async function () {
            const { hardhatToken, owner, ether } = await loadFixture(deployTokenFixture);

            const tx = await hardhatToken.registerDomain('com', { value: ether });

            await expect(tx).to.changeEtherBalances([owner, hardhatToken], [-ether, ether]);
        });

        it("Should fail if unregistering by not owner", async function () {
            const { hardhatToken, addr1, ether } = await loadFixture(deployTokenFixture);

            await hardhatToken.registerDomain('com', { value:  ether });

            await expect(hardhatToken.connect(addr1)
                .unregisterDomain('com', { value: ether }))
                .to.be.revertedWith("Domain should be unregistered by the domain owner");
        });

        it("Should fail if unregistering free domain", async function () {
            const { hardhatToken, ether } = await loadFixture(deployTokenFixture);

            await expect(hardhatToken
                .unregisterDomain('ua', { value: ether }))
                .to.be.revertedWith("Domain is not registered yet");
        });

        it("Should unregister domain and return deposit", async function () {
            const { hardhatToken, owner, ether } = await loadFixture(deployTokenFixture);

            await hardhatToken.registerDomain('com', { value:  ether });
            const tx = await hardhatToken.unregisterDomain('com');

            const domainDetails = await hardhatToken.getDomain('com');

            expect(domainDetails.domainOwner).to.equal(undefinedAddress)
            await expect(tx).to.changeEtherBalances([owner, hardhatToken], [ether, -ether]);
        });
    });

});