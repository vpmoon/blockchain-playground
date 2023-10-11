// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library StringParserAssemblyLibrary {

    function stripAfter(string memory input, string memory symbol) public pure returns (string memory) {
        uint256 inputLength;
        assembly {
            inputLength := mload(input)
        }
        uint256 symbolLength;
        assembly {
            symbolLength := mload(symbol)
        }
        uint256 symbolIndex = inputLength;
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
        if (symbolIndex == inputLength) {
            return input;
        }
        uint256 substringLength = inputLength - symbolIndex - symbolLength;
        string memory substring = new string(substringLength);
        bytes memory substringBytes = bytes(substring);

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