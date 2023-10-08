// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library DomainParserLibrary {
    function sqrt(uint y) public pure returns (uint z) {
        return y * y;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
