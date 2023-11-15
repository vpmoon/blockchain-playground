//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { DomainParserLibrary } from "./DomainParserLibrary.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// Error for insufficient ETN sent during domain registration
/// @param domainName The domain name for which ETN is insufficient
error DomainRegistryNoSufficientEtn(string domainName);

/// Error for insufficient Tokens sent during domain registration
/// @param domainName The domain name for which Tokens is insufficient
error DomainRegistryNoSufficientTokens(string domainName);

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

/// @notice Error when payment not sent
/// @param controller The controller address of caller
error DomainRegistryPaymentEtnReverted(address controller);

/// @notice Error when payment not sent
/// @param controller The controller address of caller
error DomainRegistryPaymentTokensReverted(address controller);

/// @notice Error when payment not sent with reason
/// @param controller The controller address of caller
/// @param reason The reason string
error DomainRegistryPaymentTokensRevertedWithReason(address controller, string reason);

/// @notice Error when payment not sent with unknown
/// @param controller The controller address of caller
error DomainRegistryPaymentTokensRevertedUnknown(address controller);

/// @author Vika Petrenko
/// @title Contract for domain registration (Version 1)
contract DomainRegistry is OwnableUpgradeable {
    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _tokens;
    mapping(uint256 => uint256) public domainLevelPrices;
    mapping(string => address) private _domains;

    /// @notice Event emitted when a domain is successfully registered
    /// @param controller The address registering the domain
    /// @param domainName The registered domain name
    event DomainRegistered(address indexed controller, string domainName);

    /// @notice Event emitted when a domain is successfully released
    /// @param controller The address releasing the domain
    /// @param domainName The released domain name
    event DomainReleased(address indexed controller, string domainName);

    uint256 public constant REWARD_PERCENT_OWNER = 10;
    IERC20 public token;
    AggregatorV3Interface internal _priceFeed;

    /// @notice Reinitializes the contract and sets domain level prices
    function initialize(address _priceFeedAddress, address _tokenAddress) initializer public {
        __Ownable_init(msg.sender);

        _priceFeed = AggregatorV3Interface(_priceFeedAddress);
        token = IERC20(_tokenAddress);

        setDomainLevelPrice(1, 0.000000005 ether);
        setDomainLevelPrice(2, 0.000000004 ether);
        setDomainLevelPrice(3, 0.000000003 ether);
        setDomainLevelPrice(4, 0.000000002 ether);
        setDomainLevelPrice(5, 0.000000001 ether);
    }

    /// @notice Retrieves the price for registering a domain
    /// @param domainName The domain name to check the price for
    /// @return The price in ether for registering the domain
    function getDomainPrice(string memory domainName, bool isEtn) public view returns (uint256) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);
        if (isEtn) {
            return domainLevelPrices[level];
        } else {
            (, int256 price, , , ) = _priceFeed.latestRoundData();
            uint8 decimals = _priceFeed.decimals();
            return (domainLevelPrices[level]) * (uint256(price)) / ( 10 ** decimals);
        }
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
    modifier checkSufficientEtn(string memory domainName, bool isEtn) {
        uint256 price = getDomainPrice(domainName, isEtn);
        if (isEtn) {
            if (msg.value != price) {
                revert DomainRegistryNoSufficientEtn({ domainName: domainName });
            }
        } else {
            if (token.balanceOf(msg.sender) < price) {
                revert DomainRegistryNoSufficientTokens({ domainName: domainName });
            }
        }
        _;
    }

    /// @notice Modifier to check if the parent domain exists
    /// @param domainName The domain name to check for a parent domain
    modifier checkDomainParent(string memory domainName) {
        uint256 level = DomainParserLibrary.getDomainLevel(domainName);
        if (level != uint256(1)) {
            string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
            if (_domains[parentDomain] == address(0)) {
                revert DomainRegistryParentDomainNotExists({ domainName: domainName });
            }
        }
        _;
    }

    /// @notice Modifier to check if a domain is available for registration
    /// @param domainName The domain name to check for availability
    modifier checkDomainAvailability(string memory domainName) {
        if (_domains[domainName] != address(0)) {
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
        if (_domains[domainName] == address(0)) {
            revert DomainRegistryDomainIsNotRegistered({ domainName: domainName });
        }
        if (_domains[domainName] != msg.sender) {
            revert DomainRegistryOnlyDomainOwnerAllowed({ domainName: domainName });
        }
        _;
    }

    /// @notice Retrieves the owner of a domain
    /// @param domainName The domain name to query the owner for
    /// @return The owner's address of the domain
    function getDomain(string memory domainName) public view returns (address) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);

        return _domains[rootDomain];
    }

    /// @notice Retrieves the domain controller shares
    /// @return The controller's address who control domain
    function getControllerShares(address controller, bool isEtn) public view returns (uint256) {
        if (isEtn) {
            return _shares[controller];
        } else {
            return _tokens[controller];
        }
    }

    /// @notice Validates domain registration by checking availability, parent existence, and ETN sent
    /// @param domainName The domain name to validate registration for
    function validateDomainRegistration(
        string memory domainName,
        bool isEtn
    ) internal checkDomainParent(domainName) checkDomainAvailability(domainName) checkSufficientEtn(domainName, isEtn) {
        return;
    }

    /// @notice Allows an owner to withdraw their accumulated rewards
    function withdraw(bool isEtn) external {
        if (isEtn) {
            uint256 share = _shares[msg.sender];
            if (share == 0) {
                revert WithdrawNoBalanceAvailable();
            }
            _shares[msg.sender] = 0;
            (bool success, ) = msg.sender.call{value: share}("");
            if (!success) {
                revert DomainRegistryPaymentEtnReverted({ controller: msg.sender });
            }
        } else {
            uint256 share = _tokens[msg.sender];
            if (share == 0) {
                revert WithdrawNoBalanceAvailable();
            }
            _tokens[msg.sender] = 0;
            try IERC20(token).transfer(msg.sender, share) returns (bool success) {
                if (!success) {
                    revert DomainRegistryPaymentTokensReverted(msg.sender);
                }
            } catch Error(string memory revertReason) {
                revert DomainRegistryPaymentTokensRevertedWithReason(msg.sender, revertReason);
            } catch {
                revert DomainRegistryPaymentTokensRevertedUnknown(msg.sender);
            }
        }
    }

    /// @notice Registers a domain, store balance into shares so can be withdrown later
    /// @param domainName The domain name to register
    function registerDomain(string memory domainName, bool isEtn) external payable checkDomainLength(domainName) {
        string memory rootDomain = DomainParserLibrary.getRootDomain(domainName);
        validateDomainRegistration(rootDomain, isEtn);
        string memory parentDomain = DomainParserLibrary.getParentDomain(domainName);
        address parentDomainOwner = _domains[parentDomain];
        uint256 price = getDomainPrice(rootDomain, isEtn);

        // parent domain reward
        uint256 parentReward;
        if (parentDomainOwner == address(0)) {
            parentReward = 0;
        } else {
            parentReward = (price * REWARD_PERCENT_OWNER) / 100;
        }
        if (isEtn) {
            _shares[parentDomainOwner] += parentReward;
        } else {
            _tokens[parentDomainOwner] += parentReward;
            IERC20(token).transferFrom(msg.sender, address(parentDomainOwner) , parentReward);
        }

        // contract owner
        uint256 ownerReward = price - parentReward;
        if (isEtn) {
            _shares[owner()] += ownerReward;
        } else {
            _tokens[owner()] += ownerReward;
            IERC20(token).transferFrom(msg.sender, address(owner()) , ownerReward);
        }

        _domains[rootDomain] = msg.sender;
        emit DomainRegistered(msg.sender, rootDomain);
    }

    /// @notice Unregisters a domain, revoking ownership from the sender
    /// @param domainName The domain name to unregister
    function unregisterDomain(
        string memory domainName
    ) external checkDomainLength(domainName) checkDomainReleasing(domainName) {
        delete _domains[domainName];

        emit DomainReleased(msg.sender, domainName);
    }
}
