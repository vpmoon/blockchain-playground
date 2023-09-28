//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

struct DomainDetails {
    address controller;
    uint deposit;
}

uint256 constant DEPOSIT_PRICE = 1 ether;

contract RegisterDomains {
    address payable public owner;
    mapping(string => DomainDetails) domains;

    constructor() {
        owner = payable(msg.sender);
    }

    function getDomain(string memory domainName) external view returns (DomainDetails memory) {
        return domains[domainName];
    }

    function createDomain(string memory domainName) internal {
        DomainDetails memory domain = DomainDetails({
            controller: msg.sender,
            deposit: msg.value
        });
        domains[domainName] = domain;
    }

    function deleteDomain(string memory domainName) internal {
        delete domains[domainName];
    }

    function registerDomain(string memory domainName) external payable {
        require(msg.value >= DEPOSIT_PRICE, "Insufficient ETH sent");

        DomainDetails memory existingDomain = this.getDomain(domainName);
        require(existingDomain.deposit == 0, "Domain is already reserved");

        createDomain(domainName);
    }

    function unregisterDomain(string memory domainName) external payable {
        DomainDetails memory existingDomain = this.getDomain(domainName);

        require(existingDomain.deposit != 0, "Domain is not registered yet");
        require(msg.sender == existingDomain.controller, "Domain should be unregistered by the domain owner");

        deleteDomain(domainName);

        payable(msg.sender).transfer(DEPOSIT_PRICE);
    }
}