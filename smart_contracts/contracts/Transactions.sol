//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Transactions {
    event Transfer(address from, address receiver, uint amount, uint256 timestamp);
    function sendTransaction(address payable receiver, uint amount) public {
        emit Transfer(msg.sender, receiver, amount, block.timestamp);
    }
}
