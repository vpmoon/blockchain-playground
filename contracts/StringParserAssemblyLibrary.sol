// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library StringParserAssemblyLibrary {

    function stripAfter(string memory input, string memory symbol) public pure returns (string memory) {
        // Get the length of the input string
        uint256 inputLength;
        assembly {
            inputLength := mload(input)
        }

        // Get the length of the symbol
        uint256 symbolLength;
        assembly {
            symbolLength := mload(symbol)
        }

        // Search for the symbol in the input string
        uint256 symbolIndex = inputLength; // Initialize with input's length to indicate not found
        for (uint256 i = 0; i <= inputLength - symbolLength; i++) {
            bool found = true;
            for (uint256 j = 0; j < symbolLength; j++) {
                uint256 inputChar;
                uint256 symbolChar;
                assembly {
                    inputChar := byte(j, mload(add(input, add(i, 0x20))))
                    symbolChar := byte(j, mload(add(symbol, add(0, 0x20))))
                }
                if (inputChar != symbolChar) {
                    found = false;
                    break;
                }
            }
            if (found) {
                symbolIndex = i;
                break;
            }
        }

        // If the symbol is not found, return the entire input string
        if (symbolIndex == inputLength) {
            return input;
        }

        // Calculate the length of the substring after the symbol
        uint256 substringLength = inputLength - symbolIndex - symbolLength;

        // Create a new string for the substring
        string memory substring = new string(substringLength);
        bytes memory substringBytes = bytes(substring);

        // Copy the substring into the new string
        for (uint256 k = 0; k < substringLength; k++) {
            uint256 inputChar;
            assembly {
                inputChar := byte(add(symbolIndex, add(symbolLength, k)), mload(add(input, 0x20)))
            }
            substringBytes[k] = bytes1(uint8(inputChar));
        }

        return substring;
    }

}