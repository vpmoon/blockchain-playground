//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./DomainParserLibrary.sol";

uint256 constant DEPOSIT_PRICE = 1 ether;

contract DomainRegistry {
    address payable public owner;
    mapping(string => address) domains;

    event DomainRegistered(address indexed controller, string domainName);
    event DomainReleased(address indexed controller, string domainName);

    modifier checkSufficientEtn() {
        require(msg.value >= DEPOSIT_PRICE, "Insufficient ETH sent");
        _;
    }

    modifier registerIfNotExists(string memory domainName) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        bool isTopLevel = DomainParserLibrary.isTopLevelDomain(rootDomain);
        if (!isTopLevel) {
            string memory parentDomain = DomainParserLibrary.getParentDomain(rootDomain);
            require(domains[parentDomain] != address(0), "Parent domain should be reserved before registering subdomains");
        }

        require(domains[rootDomain] == address(0), "Domain is already reserved");
        _;
    }

    modifier unregisterOwnerCheck(string memory domainName) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        require(domains[rootDomain] != address(0), "Domain is not registered yet");
        require(domains[rootDomain] == msg.sender, "Domain should be unregistered by the domain owner");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getDomain(string memory domainName) public view returns (address) {
        return domains[domainName];
    }

    function registerDomain(string memory domainName) external payable registerIfNotExists(domainName) checkSufficientEtn() {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        domains[rootDomain] = msg.sender;
        emit DomainRegistered(msg.sender, rootDomain);
    }

    function unregisterDomain(string memory domainName) external payable unregisterOwnerCheck(domainName) checkSufficientEtn() {
        delete domains[domainName];

        payable(msg.sender).transfer(DEPOSIT_PRICE);
        emit DomainReleased(msg.sender, domainName);
    }
}