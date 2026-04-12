/** ABI for contracts/ShipmentAudit.sol — deploy then set SHIPMENT_AUDIT_CONTRACT */
export default [
  {
    inputs: [
      { internalType: 'bytes32', name: 'shipmentId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'payloadHash', type: 'bytes32' },
    ],
    name: 'recordAudit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'shipmentId', type: 'bytes32' },
      { indexed: false, internalType: 'bytes32', name: 'payloadHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AuditRecorded',
    type: 'event',
  },
];
