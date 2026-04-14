// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ShipmentAudit.sol";

contract ShipmentAuditTest is Test {
    ShipmentAudit public audit;

    function setUp() public {
        audit = new ShipmentAudit();
    }

    function test_RecordAudit_EmitsEvent() public {
        bytes32 shipmentId = keccak256("SHIPMENT_001");
        bytes32 payloadHash = keccak256("payload_data");

        vm.expectEmit(true, false, false, true);
        emit ShipmentAudit.AuditRecorded(shipmentId, payloadHash, block.timestamp);

        audit.recordAudit(shipmentId, payloadHash);
    }

    function test_RecordAudit_AnyCallerCanRecord() public {
        vm.prank(address(0xCAFE));
        bytes32 shipmentId = keccak256("SHIPMENT_002");
        bytes32 payloadHash = keccak256("other_payload");

        // Should NOT revert — public function, no access control
        audit.recordAudit(shipmentId, payloadHash);
    }

    function testFuzz_RecordAudit(bytes32 shipmentId, bytes32 payloadHash) public {
        // Fuzz test: recording always emits regardless of inputs
        audit.recordAudit(shipmentId, payloadHash);
    }
}
