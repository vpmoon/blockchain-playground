//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { DomainParserLibrary } from "./DomainParserLibrary.sol";

/// Error for insufficient ETN sent during domain registration
/// @param domainName The domain name for which ETN is insufficient
error DomainRegistryNoSufficientEtn(string domainName);

/// Error for non-existent parent domain during domain registration
/// @param domainName The domain name with a missing parent domain
error DomainRegistryParentDomainNotExists(string domainName);

/// Error for attempting to register an already reserved domain
/// @param domainName The domain name that is already reserved
error DomainRegistryDomainIsAlreadyReserved(string domainName);

/// Error for invalid domain name length during registration
/// @param domainName The domain name with an invalid length
error DomainRegistryDomainNameLengthIsNotValid(string domainName);

/// @notice Error when passed etn is not the same as domain price
error WithdrawNoBalanceAvailable();

/// @notice Sets the price for registering a domain at a specific level
/// @dev This function can only be called by the owner of the contract
/// @param domainName The domain name with an invalid length
error DomainRegistryOnlyDomainOwnerAllowed(string domainName);

/// @notice Error for attempting to release an unregistered domain
/// @param domainName The domain name that is not registered
error DomainRegistryDomainIsNotRegistered(string domainName);

/// @author Vika Petrenko
/// @title Contract for domain registration (Version 1)
contract DomainRegistry is Initializable, OwnableUpgradeable {
    mapping(address => uint256) private shares;
    mapping(uint256 => uint256) public domainLevelPrices;
    mapping(string => address) private domains;

    /// @notice Event emitted when a domain is successfully registered
    /// @param controller The address registering the domain
    /// @param domainName The registered domain name
    event DomainRegistered(address indexed controller, string domainName);

    /// @notice Event emitted when a domain is successfully released
    /// @param controller The address releasing the domain
    /// @param domainName The released domain name
    event DomainReleased(address indexed controller, string domainName);

    uint256 public constant REWARD_PERCENT_OWNER = 10;

    /// @notice Reinitializes the contract and sets domain level prices
    function reinitialize() public reinitializer(2) {
        __Ownable_init(msg.sender);

        setDomainLevelPrice(1, 0.75 ether);
        setDomainLevelPrice(2, 0.5 ether);
        setDomainLevelPrice(3, 0.25 ether);
        setDomainLevelPrice(4, 0.15 ether);
        setDomainLevelPrice(5, 0.1 ether);
    }

    /// @notice Retrieves the price for registering a domain
    /// @param domainName The domain name to check the price for
    /// @return The price in ether for registering the domain
    function getDomainPrice(string memory domainName) public view returns (uint256) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);

        return domainLevelPrices[level];
    }

    /// @notice Sets the price for registering a domain at a specific level
    /// @dev This function can only be called by the owner of the contract
    /// @param level The domain level to set the price for
    /// @param price The price in ether to set
    function setDomainLevelPrice(uint256 level, uint256 price) public onlyOwner {
        domainLevelPrices[level] = price;
    }

    /// @notice Modifier to check if the sender sent sufficient ETN (Ether) to register a domain
    /// @param domainName The domain name to check ETN for
    modifier checkSufficientEtn(string memory domainName) {
        uint256 price = getDomainPrice(domainName);

        if (msg.value != price) {
            revert DomainRegistryNoSufficientEtn({ domainName: domainName });
        }
        _;
    }

    /// @notice Modifier to check if the parent domain exists
    /// @param domainName The domain name to check for a parent domain
    modifier checkDomainParent(string memory domainName) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);
        if (level != uint256(1)) {
            string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
            if (domains[parentDomain] == address(0)) {
                revert DomainRegistryParentDomainNotExists({ domainName: domainName });
            }
        }
        _;
    }

    /// @notice Modifier to check if a domain is available for registration
    /// @param domainName The domain name to check for availability
    modifier checkDomainAvailability(string memory domainName) {
        if (domains[domainName] != address(0)) {
            revert DomainRegistryDomainIsAlreadyReserved({ domainName: domainName });
        }
        _;
    }

    /// @notice Modifier to check if the length of the domain name is valid
    /// @param domainName The domain name to check the length for
    modifier checkDomainLength(string memory domainName) {
        bytes memory domainNameBytes = bytes(domainName);

        if (domainNameBytes.length < 2 || domainNameBytes.length > 253) {
            revert DomainRegistryDomainNameLengthIsNotValid({ domainName: domainName });
        }
        _;
    }

    /// @notice Modifier to check if the sender is the owner of the domain when releasing it
    /// @param domainName The domain name to check ownership for
    modifier checkDomainReleasing(string memory domainName) {
        if (domains[domainName] == address(0)) {
            revert DomainRegistryDomainIsNotRegistered({ domainName: domainName });
        }
        if (domains[domainName] != msg.sender) {
            revert DomainRegistryOnlyDomainOwnerAllowed({ domainName: domainName });
        }
        _;
    }

    /// @notice Retrieves the owner of a domain
    /// @param domainName The domain name to query the owner for
    /// @return The owner's address of the domain
    function getDomain(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        return domains[rootDomain];
    }

    /// @notice Validates domain registration by checking availability, parent existence, and ETN sent
    /// @param domainName The domain name to validate registration for
    function validateDomainRegistration(
        string memory domainName
    ) internal checkDomainParent(domainName) checkDomainAvailability(domainName) checkSufficientEtn(domainName) {
        return;
    }

    /// @notice Allows an owner to withdraw their accumulated rewards
    function withdraw() external {
        uint256 share = shares[msg.sender];
        if (share == 0) {
            revert WithdrawNoBalanceAvailable();
        }
        shares[msg.sender] = 0;
        payable(msg.sender).transfer(share);
    }

    /// @notice Registers a domain, transferring ownership to the sender and rewarding the parent domain owner
    /// @param domainName The domain name to register
    function registerDomain(string memory domainName) external payable checkDomainLength(domainName) {
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
        emit DomainRegistered(msg.sender, rootDomain);
    }

    /// @notice Unregisters a domain, revoking ownership from the sender
    /// @param domainName The domain name to unregister
    function unregisterDomain(
        string memory domainName
    ) external checkDomainLength(domainName) checkDomainReleasing(domainName) {
        delete domains[domainName];

        emit DomainReleased(msg.sender, domainName);
    }
}
