import { Certification } from '../models/Certification.js';
import { AppError } from '../utils/AppError.js';

export async function listCertifications(req, res, next) {
  try {
    const { batchId, productId } = req.query;
    const q = {};
    if (batchId) q.batchId = batchId;
    if (productId) q.productId = productId;
    const items = await Certification.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function createCertification(req, res, next) {
  try {
    const b = req.validatedBody;
    const doc = await Certification.create({
      ...b,
      validUntil: b.validUntil ? new Date(b.validUntil) : undefined,
      createdBy: req.user.id,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function getCertification(req, res, next) {
  try {
    const doc = await Certification.findById(req.params.id);
    if (!doc) throw new AppError('Not found', 404);
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function updateCertification(req, res, next) {
  try {
    const doc = await Certification.findById(req.params.id);
    if (!doc) throw new AppError('Not found', 404);
    const b = req.validatedBody;
    Object.assign(doc, b);
    if (b.validUntil !== undefined) doc.validUntil = b.validUntil ? new Date(b.validUntil) : undefined;
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function deleteCertification(req, res, next) {
  try {
    const doc = await Certification.findById(req.params.id);
    if (!doc) throw new AppError('Not found', 404);
    await doc.deleteOne();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
