import * as ethers from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/src/signers";

export type RegisterDomainsFixture = {
    domainsContract: ethers.Contract,
    owner: HardhatEthersSigner,
    addr1: HardhatEthersSigner,
    ether: bigint,
}