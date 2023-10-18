// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./StringParserLibrary.sol";

library DomainParserLibrary {
    function getRootDomain(string memory str) public pure returns (string memory) {
        return StringParserLibrary.stripAfter(str, "//");
    }

    function getParentDomain(string memory str) public pure returns (string memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.stripAfter(rootDomain, ".");
    }

    function isTopLevelDomain(string memory str) public pure returns (bool) {
        string memory rootDomain = getRootDomain(str);
        string memory parentDomain = getParentDomain(str);

        return keccak256(bytes(rootDomain)) == keccak256(bytes(parentDomain));
    }
}