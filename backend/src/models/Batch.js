import mongoose from 'mongoose';
import crypto from 'crypto';

const batchSchema = new mongoose.Schema(
  {
    batchCode: { type: String, required: true, trim: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    harvestDate: { type: Date },
    quantity: { type: Number, min: 0 },
    unit: { type: String, default: 'kg' },
    /** Deterministic QR payload (product + batch + secret from env optional) */
    qrPayload: { type: String, trim: true },
  },
  { timestamps: true }
);

batchSchema.index({ productId: 1, batchCode: 1 }, { unique: true });

batchSchema.pre('save', function preSave(next) {
  if (!this.qrPayload) {
    const raw = `${this.productId.toString()}:${this.batchCode}:${this._id.toString()}`;
    this.qrPayload = crypto.createHash('sha256').update(raw).digest('hex');
  }
  next();
});

export const Batch = mongoose.model('Batch', batchSchema);
