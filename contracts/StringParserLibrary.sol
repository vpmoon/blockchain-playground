// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library StringParserLibrary {

    function substring(string memory str, uint8 startIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str); // TODO try modifier
        require(startIndex < strBytes.length, "Start index out of bounds");

        bytes memory result = new bytes(strBytes.length - startIndex);
        for (uint8 i = startIndex; i < strBytes.length; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    function stripAfter(string memory url, string memory symbol) public pure returns (string memory) {
        uint8 protocolIndex = indexOf(url, symbol);

        if (protocolIndex == type(uint8).max) {
            return url;
        }

        bytes memory symbolBytes = bytes(symbol);
        uint8 symbolBytesLength = uint8(symbolBytes.length);
        return substring(url, protocolIndex + symbolBytesLength);
    }

    function indexOf(string memory str, string memory substr) public pure returns (uint8) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);

        // TODO try to search starting from substring
        for (uint8 i = 0; i < strBytes.length - substrBytes.length + 1; i++) {
            bool found = true;
            for (uint8 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return i;
            }
        }
        return type(uint8).max;
    }
}