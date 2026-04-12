import { BlockchainRecord } from '../models/BlockchainRecord.js';

export async function listTransactions(req, res, next) {
  try {
    const { shipmentId } = req.query;
    const q = {};
    if (shipmentId) q.shipmentId = shipmentId;
    const records = await BlockchainRecord.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(records);
  } catch (e) {
    next(e);
  }
}
