//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

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

    modifier checkDomainParent(string memory domainName) {
        bool isTopLevel = DomainParserLibrary.isTopLevelDomain(domainName);
        if (!isTopLevel) {
            string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
            require(domains[parentDomain] != address(0), "Parent domain doesn't exist");
        }
        _;
    }

    modifier checkDomainAvailability(string memory domainName) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        require(domains[rootDomain] == address(0), "Domain is already reserved");
        _;
    }

    modifier checkDomainLength(string memory domainName) {
        bytes memory domainNameBytes = bytes(domainName);

        require(domainNameBytes.length >= 2 && domainNameBytes.length <= 253, "Domain length should be between 2 and 253");
        _;
    }

    modifier checkDomainReleasing(string memory domainName) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        require(domains[domainName] != address(0), "Domain is not registered yet");
        require(domains[domainName] == msg.sender, "Domain should be unregistered by the domain owner");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getDomain(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        return domains[rootDomain];
    }

    function registerDomain(string memory domainName) external payable checkDomainLength(domainName) checkDomainParent(domainName) checkDomainAvailability(domainName) checkSufficientEtn()
    {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        domains[rootDomain] = msg.sender;
        emit DomainRegistered(msg.sender, rootDomain);
    }

    function unregisterDomain(string memory domainName) external payable checkDomainLength(domainName) checkDomainReleasing(domainName) {
        delete domains[domainName];

        payable(msg.sender).transfer(DEPOSIT_PRICE);
        emit DomainReleased(msg.sender, domainName);
    }
}