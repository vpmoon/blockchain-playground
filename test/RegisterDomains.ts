const { expect, assert } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

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
            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

            expect(await hardhatToken.owner()).to.equal(owner.address);

            const etherToSend = ethers.parseEther("0.1");

            // await expect(lock.withdraw()).to.be.revertedWith( //TODO try this
            //     "You can't withdraw yet"
            // );

            try {
                await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value: etherToSend });
                // If the transaction succeeds, it's an error
                assert.fail("Transaction should have failed");
            } catch (error) {
                // Check if the error message matches the expected message
                assert.include(error.message, "Insufficient ETH sent");
            }
        });

        it("Should take deposit as 1 ether when assign domain", async function () {
            const { hardhatToken, addr1, ether } = await loadFixture(deployTokenFixture);

            const tx = await hardhatToken.connect(addr1).registerDomain('com', { from: addr1, value: ether });

            await expect(tx).to.changeEtherBalances([addr1, hardhatToken], [-ether, ether]);
        });

        // it("Should unregister domain", async function () {
        //     const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
        //
        //     const etherToSend = ethers.parseEther("1");
        //
        //     await hardhatToken.connect(addr1).unregisterDomain('com');
        //     const domainDetails = await hardhatToken.getDomainOwner('com');
        //
        //     expect(domainDetails.domainOwner).to.equal(addr1.address);
        // });
    });

});