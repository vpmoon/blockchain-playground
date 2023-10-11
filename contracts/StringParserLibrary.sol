// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library StringParserLibrary {
    uint8 constant NOT_EXISTING_VALUE = type(uint8).max;

    function substring(string memory str, uint8 startIndex, uint8 endIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(startIndex <= endIndex && endIndex <= strBytes.length, "Indexes are out of bounds");

        bytes memory result = new bytes(endIndex - startIndex);
        for (uint8 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    function substring(string memory str, uint8 startIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);

        return substring(str, uint8(startIndex), uint8(strBytes.length));
    }

    function stripAfter(string memory url, string memory symbol) public pure returns (string memory) {
        uint8 symbolIndex = indexOf(url, symbol);

        if (symbolIndex == NOT_EXISTING_VALUE) {
            return url;
        }

        bytes memory symbolBytes = bytes(symbol);
        uint8 symbolBytesLength = uint8(symbolBytes.length);
        return substring(url, symbolIndex + symbolBytesLength);
    }

    function indexOf(string memory str, string memory substr) public pure returns (uint8) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);

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
        return NOT_EXISTING_VALUE;
    }

    function countSymbolOccurrences(string memory input, string memory symbol) public pure returns (uint8) {
        bytes memory symbolBytes = bytes(symbol);
        require(symbolBytes.length == 1, "Method to find occurrences supports only one symbol string");

        bytes memory inputBytes = bytes(input);
        uint8 count = 0;

        for (uint8 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == symbolBytes[0]) {
                count++;
            }
        }

        return count;
    }

    function split(string memory str, string memory symbol) public pure returns (string[] memory) {
        bytes memory symbolBytes = bytes(symbol);
        require(symbolBytes.length == 1, "Method to find occurrences supports only one symbol string");

        bytes memory strBytes = bytes(str);
        uint8 count = countSymbolOccurrences(str, symbol);
        string[] memory parts = new string[](count + 1);

        uint8 startIndex = 0;
        uint8 partIndex = 0;

        for (uint8 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == symbolBytes[0]) {
                parts[partIndex] = substring(str, startIndex, i);
                partIndex++;
                startIndex = i + 1;
            }
        }
        parts[partIndex] = substring(str, startIndex, uint8(strBytes.length));

        return parts;
    }
}