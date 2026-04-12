import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export async function listProducts(req, res, next) {
  try {
    const q = {};
    if (req.user.role === 'farmer') q.farmerId = req.user.id;
    const products = await Product.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(products);
  } catch (e) {
    next(e);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { sku, name, description, category } = req.validatedBody;
    const product = await Product.create({
      sku,
      name,
      description: description || '',
      category: category || 'crop',
      farmerId: req.user.id,
    });
    res.status(201).json(product);
  } catch (e) {
    if (e.code === 11000) next(new AppError('SKU already exists', 409));
    else next(e);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Not found', 404);
    if (req.user.role === 'farmer' && product.farmerId.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }
    res.json(product);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Not found', 404);
    if (req.user.role === 'farmer' && product.farmerId.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }
    Object.assign(product, req.validatedBody);
    await product.save();
    res.json(product);
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Not found', 404);
    if (req.user.role !== 'admin' && product.farmerId.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }
    await product.deleteOne();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
