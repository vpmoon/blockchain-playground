//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract MockPriceFeed is AggregatorV3Interface {
    int256 private _latestAnswer;
    uint8 private _decimals;

    constructor(int256 answer, uint8 decimals) {
        _latestAnswer = answer;
        _decimals = decimals;
    }

    function setLatestAnswer(int256 newAnswer) external {
        _latestAnswer = newAnswer;
    }

    function latestRoundData() external view override returns (
        uint80,
        int256 answer,
        uint256,
        uint256,
        uint80
    ) {
        return (0, _latestAnswer, 0, block.timestamp, 0);
    }

    function getLatestPrice() public view returns (int256) {
        return _latestAnswer;
    }

    function version() external view returns (uint256){
        return 1;
    }

    function getRoundData(uint80) external view returns (uint80, int256, uint256, uint256, uint80){
        return (1, _latestAnswer, 1, 1, 1);
    }

    function description() external view returns (string memory){
        return 'mock price feed';
    }

    function decimals() external view returns (uint8){
        return _decimals;
    }
}
