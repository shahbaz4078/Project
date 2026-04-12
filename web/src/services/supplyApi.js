import axios from 'axios';
import { API_BASE } from '../config.js';
import { http } from './http.js';

/** Normalize Mongo/API product for UI components that expect legacy mock shape */
export function toDisplayProduct(p) {
  if (!p) return null;
  const id = p._id ?? p.id ?? p.productId;
  const farmerName =
    typeof p.farmerId === 'object' && p.farmerId?.name
      ? p.farmerId.name
      : p.farmer || 'Farmer';
  return {
    ...p,
    productId: id,
    farmer: farmerName,
    status: p.status || 'Registered',
    predictedPrice: p.predictedPrice ?? p.quantity ?? 0,
    timestamp: p.createdAt || p.timestamp,
    transactionHash: p.transactionHash || p.txHash,
  };
}

function mapShipmentStatus(s) {
  const map = {
    draft: 'processing',
    scheduled: 'processing',
    in_transit: 'shipped',
    at_processor: 'processing',
    at_retailer: 'shipped',
    delivered: 'delivered',
    exception: 'processing',
  };
  return map[s] || 'processing';
}

export const supplyApi = {
  async getAllProducts() {
    const { data } = await axios.get(`${API_BASE}/public/products`);
    return data.map(toDisplayProduct);
  },

  async getProduct(id) {
    const { data } = await axios.get(`${API_BASE}/public/products/${id}`);
    return toDisplayProduct(data);
  },

  async getTrace(productId) {
    const { data } = await axios.get(`${API_BASE}/public/trace/${productId}`);
    return data;
  },

  /** Timeline + blockchain audit events for product detail pages */
  async getTimelineUpdates(productId) {
    try {
      const trace = await this.getTrace(productId);
      const events = [];

      const { shipments = [], chainRecords = [] } = trace;
      shipments.forEach((s) => {
        events.push({
          id: `sh-${s._id}`,
          title: `Shipment status: ${s.status}`,
          timestamp: s.updatedAt || s.createdAt,
          status: mapShipmentStatus(s.status),
          description: [s.origin, s.destination].filter(Boolean).join(' → ') || 'Logistics update',
        });
      });
      chainRecords.forEach((r) => {
        events.push({
          id: `ch-${r._id}`,
          title: `Audit: ${r.eventType}`,
          timestamp: r.createdAt,
          status: r.txHash ? 'completed' : 'processing',
          description: r.txHash
            ? `Tx ${String(r.txHash).slice(0, 18)}…`
            : r.errorMessage || 'Recorded (off-chain or pending)',
        });
      });

      return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
    } catch {
      return [];
    }
  },

  /** Farmer: requires JWT (farmer role). Creates product + batch, returns UI-shaped result */
  async registerProduct(productData) {
    const sku = `SKU-${Date.now()}`;
    const { data: product } = await http.post('/products', {
      sku,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'crop',
    });

    const batchCode = `B-${Date.now()}`;
    const { data: batch } = await http.post('/batches', {
      productId: product._id,
      batchCode,
      harvestDate: productData.harvestDate || undefined,
      quantity: undefined,
      unit: 'kg',
    });

    const display = toDisplayProduct(product);
    return {
      success: true,
      productId: display.productId,
      batchId: batch._id,
      qrPayload: batch.qrPayload,
      transactionHash: null,
      aiAnalysis: {
        predictedPrice: `₹${50 + Math.floor(Math.random() * 50)}`,
        priceTrend: 'stable',
        demandLevel: 'moderate',
        riskLevel: 'minimal',
      },
    };
  },

  async getAnalyticsSummary() {
    const { data } = await http.get('/analytics/summary');
    return data;
  },

  async createShipment(payload) {
    const { data } = await http.post('/shipments', payload);
    return data;
  },

  async updateShipment(id, payload) {
    const { data } = await http.patch(`/shipments/${id}`, payload);
    return data;
  },

  async listShipmentsByProduct(productId) {
    const { data } = await http.get('/shipments', { params: { productId } });
    return data;
  },

  async listBatchesPublic(productId) {
    const { data } = await axios.get(`${API_BASE}/public/batches`, { params: { productId } });
    return data;
  },
};
