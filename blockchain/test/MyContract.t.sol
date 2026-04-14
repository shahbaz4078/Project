// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract public myContract;
    address public owner = address(this);

    function setUp() public {
        myContract = new MyContract("Hello, World!");
    }

    function test_InitialMessage() public view {
        assertEq(myContract.message(), "Hello, World!");
    }

    function test_Owner() public view {
        assertEq(myContract.owner(), address(this));
    }

    function test_SetMessage() public {
        myContract.setMessage("New Message");
        assertEq(myContract.message(), "New Message");
    }

    function test_SetMessage_EmitEvent() public {
        vm.expectEmit(false, false, false, true);
        emit MyContract.MessageUpdated("New Message");
        myContract.setMessage("New Message");
    }

    function test_RevertIf_NotOwner() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert("Not owner");
        myContract.setMessage("Hack attempt");
    }
}
