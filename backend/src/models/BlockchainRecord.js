import mongoose from 'mongoose';

const blockchainRecordSchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    eventType: { type: String, required: true, trim: true },
    payloadHash: { type: String, required: true },
    /** Canonical JSON string hashed off-chain */
    payloadSnapshot: { type: String },
    txHash: { type: String, index: true, sparse: true },
    blockNumber: { type: Number },
    chainId: { type: Number },
    fromAddress: { type: String },
    confirmed: { type: Boolean, default: false },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

blockchainRecordSchema.index({ shipmentId: 1, createdAt: -1 });

export const BlockchainRecord = mongoose.model('BlockchainRecord', blockchainRecordSchema);
