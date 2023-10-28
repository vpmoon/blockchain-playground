//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./DomainParserLibrary.sol";

contract DomainRegistry is Initializable, OwnableUpgradeable {
    mapping(address => uint) private shares;
    mapping(uint => uint) public domainLevelPrices;
    mapping(string => address) domains;

    event DomainRegistered(address indexed controller, string domainName);
    event DomainReleased(address indexed controller, string domainName);

    uint256 public constant REWARD_PERCENT_OWNER = 10;

    function reinitialize() public reinitializer(2) {
        __Ownable_init(msg.sender);

        setDomainLevelPrice(1, 0.75 ether);
        setDomainLevelPrice(2, 0.5 ether);
        setDomainLevelPrice(3, 0.25 ether);
        setDomainLevelPrice(4, 0.15 ether);
        setDomainLevelPrice(5, 0.1 ether);
    }

    function getDomainPrice(string memory domainName) public view returns (uint256) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);

        return domainLevelPrices[level];
    }

    function setDomainLevelPrice(uint256 level, uint256 price) public onlyOwner {
        domainLevelPrices[level] = price;
    }

    modifier checkSufficientEtn(string memory domainName) {
        uint256 price = getDomainPrice(domainName);

        require(msg.value >= price, "Insufficient ETH sent");
        _;
    }

    modifier checkDomainParent(string memory domainName) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);
        if (level != uint256(1)) {
            string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
            require(domains[parentDomain] != address(0), "Parent domain doesn't exist");
        }
        _;
    }

    modifier checkDomainAvailability(string memory domainName) {
        require(domains[domainName] == address(0), "Domain is already reserved");
        _;
    }

    modifier checkDomainLength(string memory domainName) {
        bytes memory domainNameBytes = bytes(domainName);

        require(domainNameBytes.length >= 2 && domainNameBytes.length <= 253, "Domain length should be between 2 and 253");
        _;
    }

    modifier checkDomainReleasing(string memory domainName) {
        require(domains[domainName] != address(0), "Domain is not registered yet");
        require(domains[domainName] == msg.sender, "Domain should be unregistered by the domain owner");
        _;
    }

    function getDomain(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        return domains[rootDomain];
    }

    function validateDomainRegistration(string memory domainName) internal
        checkDomainParent(domainName)
        checkDomainAvailability(domainName)
        checkSufficientEtn(domainName)
    {
    }

    function withdraw() external {
        uint share = shares[msg.sender];
        shares[msg.sender] = 0;
        payable(msg.sender).transfer(share);
    }

    function registerDomain(string memory domainName) external payable
        checkDomainLength(domainName)
    {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        validateDomainRegistration(rootDomain);
        string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
        address parentDomainOwner = domains[parentDomain];
        uint256 price = getDomainPrice(rootDomain);

        // parent domain reward
        uint256 parentReward;
        if (parentDomainOwner == address(0)) {
            parentReward = 0;
        } else {
            parentReward = price * REWARD_PERCENT_OWNER / 100;
        }
        shares[parentDomainOwner] = parentReward;

        // contract owner
        uint256 ownerReward = price - parentReward;
        shares[owner()] += ownerReward;

        domains[rootDomain] = msg.sender;

        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
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