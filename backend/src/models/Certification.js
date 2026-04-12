import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['organic', 'fair_trade', 'other'], required: true },
    title: { type: String, trim: true, default: '' },
    issuer: { type: String, trim: true, required: true },
    validUntil: { type: Date },
    documentUrl: { type: String, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

certificationSchema.index({ batchId: 1, type: 1 });

export const Certification = mongoose.model('Certification', certificationSchema);
