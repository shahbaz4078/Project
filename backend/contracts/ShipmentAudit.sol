// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal on-chain audit log for supply-chain milestones (event-only storage).
contract ShipmentAudit {
    event AuditRecorded(bytes32 indexed shipmentId, bytes32 payloadHash, uint256 timestamp);

    function recordAudit(bytes32 shipmentId, bytes32 payloadHash) external {
        emit AuditRecorded(shipmentId, payloadHash, block.timestamp);
    }
}
