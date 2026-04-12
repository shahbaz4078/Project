import { getRedis } from '../config/redis.js';
import { Shipment } from '../models/Shipment.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const CACHE_KEY = 'analytics:summary:v1';
const CACHE_TTL_SEC = 60;

export async function getSummary(req, res, next) {
  try {
    const redis = getRedis();
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch {
      /* Redis optional at read */
    }

    const [shipmentsByStatus, productCount, userCount] = await Promise.all([
      Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.countDocuments(),
      User.countDocuments(),
    ]);

    const payload = {
      generatedAt: new Date().toISOString(),
      shipmentsByStatus: shipmentsByStatus.reduce((acc, r) => {
        acc[r._id] = r.count;
        return acc;
      }, {}),
      productCount,
      userCount,
    };

    try {
      await redis.setex(CACHE_KEY, CACHE_TTL_SEC, JSON.stringify(payload));
    } catch {
      /* ignore cache write */
    }

    res.json(payload);
  } catch (e) {
    next(e);
  }
}
