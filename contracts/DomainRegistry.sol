//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./DomainParserLibrary.sol";

uint256 constant DEPOSIT_PRICE = 1 ether;

contract DomainRegistry {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    // Declare the map
    EnumerableMap.UintToUintMap private domainLevelPrices;

    address payable public owner;
    mapping(string => address) domains;

    event DomainRegistered(address indexed controller, string domainName);
    event DomainReleased(address indexed controller, string domainName);

    function getDomainLevelPrice(uint256 level) public view returns (uint256) {
        return domainLevelPrices.get(level);
    }

    function setDomainLevelPrice(uint256 level, uint256 price) public {
        domainLevelPrices.set(level, price);
    }

    modifier checkSufficientEtn() {
        require(msg.value >= DEPOSIT_PRICE, "Insufficient ETH sent");
        _;
    }

    modifier checkDomainParent(string memory domainName) {
        uint8 level = DomainParserLibrary.getDomainLevel(domainName);
        if (level != uint8(1)) {
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

    function getPrice(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        uint8 level = DomainParserLibrary.getDomainLevel(domainName);

        return domains[rootDomain];
    }

    function registerDomain(string memory domainName) external payable checkDomainLength(domainName) checkDomainParent(domainName) checkDomainAvailability(domainName) checkSufficientEtn()
    {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        uint8 level = DomainParserLibrary.getDomainLevel(rootDomain);

        domains[rootDomain] = msg.sender;
        emit DomainRegistered(msg.sender, rootDomain);
    }

    function unregisterDomain(string memory domainName) external payable checkDomainLength(domainName) checkDomainReleasing(domainName) {
        delete domains[domainName];

        payable(msg.sender).transfer(DEPOSIT_PRICE);
        emit DomainReleased(msg.sender, domainName);
    }
}