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

console.log('abi', contractArtifact.abi)

export const getContract = () => {
    return new ethers.Contract(
        env.REACT_APP_CONTRACT_URL,
        contractArtifact.abi,
        wallet,
    );
}

export const getDomainPrice = async (contract, domain, currency) => {
    return contract.getDomainPrice(domain, currency);
}

export const getDomainAddress = async (contract, domain) => {
    return contract.getDomain(domain);
}

export const getControllerShares = async (contract, address, currency) => {
    return contract.getControllerShares(address, currency);
}

export const registerDomain = async (contract, domain, price, currency) => {
    return contract.registerDomain(domain, currency, { value: price })
}

export const releaseDomain = async (contract, domain) => {
    return contract.unregisterDomain(domain);
}

export const withdraw = async (contract, currency) => {
    const tx = await contract.withdraw(currency, { gasLimit: 30000000 })
    await tx.wait();
    return tx;
}

export const getEventsList = async () => {
    const account = await getAccount();

    const items = JSON.parse(localStorage.getItem(account)) || [];

    return items;
}

export const subscribe = async () => {
    const contract = await getContract();
    const items = await getEventsList();
    const account = await getAccount();

    contract.on("DomainRegistered", (from, domainName) => {
        console.log("DomainRegistered event", domainName);

        items.push({
            from,
            domainName,
            date: new Date(),
        });
        localStorage.setItem(account, JSON.stringify(items));
    });

    contract.on("DomainReleased", (from, domainName) => {
        console.log("DomainReleased event", domainName);

        const filteredItems = items.filter((item) => item.domainName !== domainName);

        localStorage.setItem(account, JSON.stringify(filteredItems));
    });
}