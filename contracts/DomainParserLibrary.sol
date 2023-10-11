// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StringParserLibrary.sol";

library DomainParserLibrary {
    function getRootDomain(string memory str) public pure returns (string memory) {
        return StringParserLibrary.stripAfter(str, "//");
    }

    function getParentDomain(string memory str) public pure returns (string memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.stripAfter(rootDomain, ".");
    }

    function getDomainLevel(string memory str) public pure returns (uint8) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.countSymbolOccurrences(str, ".") + uint8(1);
    }

    function splitDomain(string memory str) public pure returns (string[] memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.split(str, ".");
    }
}