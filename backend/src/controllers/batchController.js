import { Batch } from '../models/Batch.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

async function assertProductAccess(user, productId) {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (user.role === 'farmer' && product.farmerId.toString() !== user.id) {
    throw new AppError('Forbidden', 403);
  }
  return product;
}

export async function listBatches(req, res, next) {
  try {
    const { productId } = req.query;
    const q = {};
    if (productId) q.productId = productId;
    const batches = await Batch.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(batches);
  } catch (e) {
    next(e);
  }
}

export async function createBatch(req, res, next) {
  try {
    const { productId, batchCode, harvestDate, quantity, unit } = req.validatedBody;
    await assertProductAccess(req.user, productId);
    const batch = await Batch.create({
      productId,
      batchCode,
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      quantity,
      unit: unit || 'kg',
    });
    res.status(201).json(batch);
  } catch (e) {
    if (e.code === 11000) next(new AppError('Batch code already exists for this product', 409));
    else next(e);
  }
}

export async function getBatch(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id).populate('productId');
    if (!batch) throw new AppError('Not found', 404);
    const farmerId = batch.productId?.farmerId?.toString();
    if (req.user.role === 'farmer' && farmerId !== req.user.id) throw new AppError('Forbidden', 403);
    res.json(batch);
  } catch (e) {
    next(e);
  }
}
