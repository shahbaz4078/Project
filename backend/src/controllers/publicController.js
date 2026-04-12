import { Product } from '../models/Product.js';
import { Batch } from '../models/Batch.js';
import { Shipment } from '../models/Shipment.js';
import { BlockchainRecord } from '../models/BlockchainRecord.js';
import { AppError } from '../utils/AppError.js';

export async function listProducts(req, res, next) {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('farmerId', 'name email');
    res.json(products);
  } catch (e) {
    next(e);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('farmerId', 'name email');
    if (!product) throw new AppError('Not found', 404);
    res.json(product);
  } catch (e) {
    next(e);
  }
}

/** Consumer traceability: product + batches + shipments + on-chain audit records */
export async function listBatches(req, res, next) {
  try {
    const { productId } = req.query;
    if (!productId) throw new AppError('productId query required', 400);
    const batches = await Batch.find({ productId }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (e) {
    next(e);
  }
}

export async function getTrace(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId).populate('farmerId', 'name email');
    if (!product) throw new AppError('Not found', 404);

    const batches = await Batch.find({ productId: product._id }).sort({ createdAt: -1 });
    const batchIds = batches.map((b) => b._id);
    const shipments = await Shipment.find({ batchId: { $in: batchIds } })
      .sort({ updatedAt: -1 })
      .limit(100);
    const shipmentIds = shipments.map((s) => s._id);
    const chainRecords = await BlockchainRecord.find({ shipmentId: { $in: shipmentIds } }).sort({
      createdAt: 1,
    });

    res.json({
      product,
      batches,
      shipments,
      chainRecords,
    });
  } catch (e) {
    next(e);
  }
}
