// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StringParserLibrary } from "./StringParserLibrary.sol";

/// @author Vika Petrenko
/// @title Library for domain parsing
library DomainParserLibrary {
    /// Constant representing the separator used in domain names
    string public constant DOMAIN_SEPARATOR = ".";

    /// @notice Extract the root domain from a given string
    /// @param str The input string containing a domain
    /// @return The root domain extracted from the input
    function getRootDomain(string memory str) public pure returns (string memory) {
        return StringParserLibrary.stripAfter(str, "//");
    }

    /// @notice Extract the parent domain from a given string
    /// @param str The input string containing a domain
    /// @return The parent domain extracted from the input
    function getParentDomain(string memory str) public pure returns (string memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.stripAfter(rootDomain, DOMAIN_SEPARATOR);
    }

    /// @notice Determine the level of a domain within a hierarchical structure
    /// @param str The input string containing a domain
    /// @return The level of the domain within the hierarchy
    function getDomainLevel(string memory str) public pure returns (uint8) {
        return StringParserLibrary.countSymbolOccurrences(str, DOMAIN_SEPARATOR) + uint8(1);
    }

    /// @notice Split a domain string into its component parts
    /// @param str The input string containing a domain
    /// @return An array of strings representing the domain parts
    function splitDomain(string memory str) public pure returns (string[] memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.split(rootDomain, DOMAIN_SEPARATOR);
    }
}
