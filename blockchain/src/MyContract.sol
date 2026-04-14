// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    address public owner;
    string public message;

    event MessageUpdated(string newMessage);

    constructor(string memory _message) {
        owner = msg.sender;
        message = _message;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setMessage(string memory _message) external onlyOwner {
        message = _message;
        emit MessageUpdated(_message);
    }
}
