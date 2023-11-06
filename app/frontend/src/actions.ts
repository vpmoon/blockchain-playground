import { ethers } from 'ethers'
import contractArtifact from '../../../artifacts/contracts/DomainRegistry.sol/DomainRegistry.json';

const provider = ethers.getDefaultProvider(env.REACT_APP_RPC_URL, {
    infura: {
      projectId: env.REACT_APP_PROJECT_ID,
      projectSecret: env.REACT_APP_PROJECT_SECRET,
    },
});
const wallet = new ethers.Wallet(env.REACT_APP_PRIVATE_KEY, provider);

export const isMetamaskInstalled = () => {
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
}

export const getAccount = async () => {
    const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
    });
    return accounts[0];
}

export const getContract = () => {
    console.log('abi', contractArtifact.abi)
    const contract = new ethers.Contract(
        env.REACT_APP_CONTRACT_URL,
        contractArtifact.abi,
        wallet,
    );
    console.log('contract=', contract)
    return contract;
}

export const getDomainPrice = async (contract, domain) => {
    return contract.getDomainPrice(domain);
}

export const getController = async (contract, domain) => {
    return contract.getDomain(domain);
}

export const getDomainAddress = async (contract, domain) => {
    return contract.getDomain(domain);
}

export const getControllerShares = async (contract, address) => {
    return contract.getControllerShares(address);
}

export const registerDomain = async (contract, domain, price, currency) => {
    return contract.registerDomain(domain, currency, { value: price })
}

export const releaseDomain = async (contract, domain) => {
    return contract.unregisterDomain(domain);
}

export const withdraw = async (contract, currency) => {
    return contract.withdraw(currency)
}