//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./DomainParserLibrary.sol";

contract DomainRegistryV2 is Initializable, OwnableUpgradeable {
    using EnumerableMap for EnumerableMap.UintToUintMap;

    EnumerableMap.UintToUintMap private domainLevelPrices;

    mapping(string => address) domains;

    event DomainRegistered(address indexed controller, string domainName);
    event DomainReleased(address indexed controller, string domainName);

    uint256 public constant REWARD_PERCENT_OWNER = 10;

    function reinitialize() public reinitializer(2) {
        __Ownable_init(msg.sender);
    }

    function getDomainPrice(string memory domainName) public view returns (uint256) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        uint8 level = DomainParserLibrary.getDomainLevel(rootDomain);

        return domainLevelPrices.get(level);
    }

    function setDomainLevelPrice(uint256 level, uint256 price) public onlyOwner {
        domainLevelPrices.set(level, price);
    }

    modifier checkSufficientEtn(string memory domainName) {
        uint256 price = getDomainPrice(domainName);

        require(msg.value >= price, "Insufficient ETH sent");
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

    function getDomain(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        return domains[rootDomain];
    }

    function registerDomain(string memory domainName) external payable
        checkDomainLength(domainName)
        checkDomainParent(domainName)
        checkDomainAvailability(domainName)
        checkSufficientEtn(domainName)
    {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);

        uint256 price = getDomainPrice(domainName);
        uint256 parentReward = price * REWARD_PERCENT_OWNER / 100;
        uint256 ownerReward = price - parentReward;

        payable(owner()).transfer(ownerReward);
        payable(domains[parentDomain]).transfer(parentReward);

        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        domains[rootDomain] = msg.sender;
        emit DomainRegistered(msg.sender, rootDomain);
    }

    function unregisterDomain(string memory domainName) external
        checkDomainLength(domainName)
        checkDomainReleasing(domainName)
    {
        delete domains[domainName];

        emit DomainReleased(msg.sender, domainName);
    }
}