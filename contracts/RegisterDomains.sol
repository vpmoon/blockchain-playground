//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

struct DomainDetails {
    address domainOwner;
    uint deposit;
}

uint256 constant DEPOSIT_PRICE = 1 ether;

contract RegisterDomains {

    address public owner;
    mapping(string => DomainDetails) domains;
    address public user;

    constructor() {
        owner = payable(msg.sender);
    }

    function getDomainOwner(string memory domainName) external view returns (DomainDetails memory) {
        return domains[domainName];
    }

    function registerDomain(string memory domainName) external payable {
        require(msg.value >= DEPOSIT_PRICE, "Insufficient ETH sent");

        // check if already existing domain for user
        DomainDetails memory existingDomain = this.getDomainOwner(domainName);
        require(existingDomain.deposit == 0, "Domain is already reserved");

        DomainDetails memory domain = DomainDetails({
            domainOwner: msg.sender,
            deposit: msg.value
        });
        domains[domainName] = domain;
    }

    function unregisterDomain(string memory domainName) external payable {
        DomainDetails memory existingDomain = this.getDomainOwner(domainName);
        require(msg.sender == existingDomain.domainOwner, "Domain should be unregistered by the domain owner");

        delete domains[domainName];

        payable(msg.sender).transfer(DEPOSIT_PRICE);
    }
}