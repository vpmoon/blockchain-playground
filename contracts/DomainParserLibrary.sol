// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./StringParserLibrary.sol";

library DomainParserLibrary {
    function getRootDomain(string memory str) public pure returns (string memory) {
        return StringParserLibrary.stripProtocol(str, "://");
    }

    function getParentDomain(string memory str) public pure returns (string memory) {
        string memory rootDomain = getRootDomain(str);

        return StringParserLibrary.stripProtocol(rootDomain, ".");
    }
}