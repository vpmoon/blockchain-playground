//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./DomainParserLibrary.sol";

uint256 constant DEPOSIT_PRICE = 1 ether;

contract DomainRegistry {
    address payable public owner;
    mapping(string => address) domains;

    event DomainRegistered(address indexed controller, string domainName);
    event DomainReleased(address indexed controller, string domainName);

    modifier registerIfNotExists(string memory domainName) {
        require(msg.value >= DEPOSIT_PRICE, "Insufficient ETH sent");

        require(domains[domainName] == address(0), "Domain is already reserved");
        _;
    }

    modifier unregisterOwnerCheck(string memory domainName) {
        require(domains[domainName] != address(0), "Domain is not registered yet");
        require(domains[domainName] == msg.sender, "Domain should be unregistered by the domain owner");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getDomain(string memory domainName) public view returns (address) {
        return domains[domainName];
    }

    function registerDomain(string memory domainName) external payable registerIfNotExists(domainName) {
        domains[domainName] = msg.sender;
        emit DomainRegistered(msg.sender, domainName);
    }

    function unregisterDomain(string memory domainName) external payable unregisterOwnerCheck(domainName) {
        delete domains[domainName];

        payable(msg.sender).transfer(DEPOSIT_PRICE);
        emit DomainReleased(msg.sender, domainName);
    }

    function calculateSqrt(uint y) external view returns (uint) {
        return DomainParserLibrary.getBalance();
    }
}