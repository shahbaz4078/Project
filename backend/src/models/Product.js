import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, trim: true, default: 'crop' },
    price: { type: Number, default: null },
    priceUnit: { type: String, default: 'per kg' },
  },
  { timestamps: true }
);

productSchema.index({ farmerId: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
