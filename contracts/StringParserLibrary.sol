// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Error for when startIndex and endIndex are out of bounds
/// @param startIndex The start index that is out of bounds
/// @param endIndex The end index that is out of bounds
error StringParserIndexOutOfBound(uint8 startIndex, uint8 endIndex);

/// Error for when a symbol of length is not 1
/// @param length The length of the provided symbol
error StringParserOnlySymbolSupported(uint256 length);

/// @author Vika Petrenko
/// @title Library for working for strings using Solidity
library StringParserLibrary {
    uint8 private constant NOT_EXISTING_VALUE = type(uint8).max;

    /// @notice Extract a substring from a given string
    /// @param str The input string
    /// @param startIndex The start index of the substring
    /// @param endIndex The end index of the substring
    /// @return The extracted substring
    function substring(string memory str, uint8 startIndex, uint8 endIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (!(startIndex <= endIndex && endIndex <= strBytes.length)) {
            revert StringParserIndexOutOfBound({ startIndex: startIndex, endIndex: endIndex });
        }

        bytes memory result = new bytes(endIndex - startIndex);
        for (uint8 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    /// @notice Extract a substring from a given string starting from the provided index
    /// @param str The input string
    /// @param startIndex The start index of the substring
    /// @return The extracted substring
    function substring(string memory str, uint8 startIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);

        return substring(str, uint8(startIndex), uint8(strBytes.length));
    }

    /// @notice Strip everything in the input string after a provided symbol
    /// @param url The input string
    /// @param symbol The symbol to search for
    /// @return The string after the symbol
    function stripAfter(string memory url, string memory symbol) public pure returns (string memory) {
        uint8 symbolIndex = indexOf(url, symbol);

        if (symbolIndex == NOT_EXISTING_VALUE) {
            return url;
        }

        bytes memory symbolBytes = bytes(symbol);
        uint8 symbolBytesLength = uint8(symbolBytes.length);
        return substring(url, symbolIndex + symbolBytesLength);
    }

    /// @notice Find the index of the first occurrence of a substring in a string
    /// @param str The input string
    /// @param substr The substring to search for
    /// @return The index of the first occurrence, or NOT_EXISTING_VALUE if not found
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

    /// @notice Count the number of occurrences of a symbol in a string
    /// @param input The input string
    /// @param symbol The symbol to count
    /// @return The count of symbol occurrences
    function countSymbolOccurrences(string memory input, string memory symbol) public pure returns (uint8) {
        bytes memory symbolBytes = bytes(symbol);
        if (symbolBytes.length != 1) {
            revert StringParserOnlySymbolSupported({ length: symbolBytes.length });
        }

        bytes memory inputBytes = bytes(input);
        uint8 count = 0;

        for (uint8 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == symbolBytes[0]) {
                count++;
            }
        }

        return count;
    }

    /// @notice Split a string into an array of substrings based on a symbol
    /// @param str The input string
    /// @param symbol The symbol used for splitting
    /// @return An array of substrings
    function split(string memory str, string memory symbol) public pure returns (string[] memory) {
        bytes memory symbolBytes = bytes(symbol);
        if (symbolBytes.length != 1) {
            revert StringParserOnlySymbolSupported({ length: symbolBytes.length });
        }

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
