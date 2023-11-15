//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract MockToken is ERC20, Ownable {
    constructor(uint256 _totalSupply) ERC20('MockToken', 'USDT') Ownable(_msgSender()) {
        _mint(_msgSender(), _totalSupply);
    }
}