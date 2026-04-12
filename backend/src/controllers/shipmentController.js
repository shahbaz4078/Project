import { Shipment } from '../models/Shipment.js';
import { Batch } from '../models/Batch.js';
import { Product } from '../models/Product.js';
import { BlockchainRecord } from '../models/BlockchainRecord.js';
import { recordShipmentAudit } from '../services/blockchain.service.js';
import { AppError } from '../utils/AppError.js';

async function canAccessShipment(user, shipment) {
  const batch = await Batch.findById(shipment.batchId).populate('productId');
  if (!batch) return false;
  const farmerId = batch.productId?.farmerId?.toString();
  if (user.role === 'admin' || user.role === 'processor' || user.role === 'retailer') return true;
  if (user.role === 'farmer' && farmerId === user.id) return true;
  return false;
}

function emitShipment(io, event, payload) {
  if (io) io.emit(event, payload);
}

export async function listShipments(req, res, next) {
  try {
    const { batchId, productId } = req.query;
    const q = {};
    if (batchId) {
      q.batchId = batchId;
    } else if (productId) {
      const batches = await Batch.find({ productId }).select('_id');
      q.batchId = { $in: batches.map((b) => b._id) };
    }
    const shipments = await Shipment.find(q).sort({ updatedAt: -1 }).limit(500);
    res.json(shipments);
  } catch (e) {
    next(e);
  }
}

export async function createShipment(req, res, next) {
  try {
    const io = req.app.get('io');
    const { batchId, status, eta, origin, destination, rfidTags } = req.validatedBody;
    const batch = await Batch.findById(batchId).populate('productId');
    if (!batch) throw new AppError('Batch not found', 404);
    const farmerId = batch.productId?.farmerId?.toString();
    if (req.user.role === 'farmer' && farmerId !== req.user.id) throw new AppError('Forbidden', 403);

    const shipment = await Shipment.create({
      batchId,
      status: status || 'draft',
      eta: eta ? new Date(eta) : undefined,
      origin,
      destination,
      rfidTags: rfidTags || [],
      createdBy: req.user.id,
    });

    await recordShipmentAudit({
      shipmentId: shipment._id,
      eventType: 'created',
      payload: { status: shipment.status, batchId: String(batchId) },
    }).catch(() => {});

    emitShipment(io, 'shipment:updated', {
      shipmentId: shipment._id.toString(),
      status: shipment.status,
      eta: shipment.eta,
    });

    res.status(201).json(shipment);
  } catch (e) {
    next(e);
  }
}

export async function getShipment(req, res, next) {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Not found', 404);
    if (!(await canAccessShipment(req.user, shipment))) throw new AppError('Forbidden', 403);
    res.json(shipment);
  } catch (e) {
    next(e);
  }
}

export async function updateShipment(req, res, next) {
  try {
    const io = req.app.get('io');
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Not found', 404);
    if (!(await canAccessShipment(req.user, shipment))) throw new AppError('Forbidden', 403);

    const prev = { status: shipment.status, eta: shipment.eta };
    Object.assign(shipment, req.validatedBody);
    if (req.validatedBody.eta) shipment.eta = new Date(req.validatedBody.eta);
    await shipment.save();

    await recordShipmentAudit({
      shipmentId: shipment._id,
      eventType: 'updated',
      payload: {
        previous: prev,
        current: { status: shipment.status, eta: shipment.eta },
      },
    }).catch(() => {});

    emitShipment(io, 'shipment:updated', {
      shipmentId: shipment._id.toString(),
      status: shipment.status,
      eta: shipment.eta,
    });

    res.json(shipment);
  } catch (e) {
    next(e);
  }
}

export async function appendLocation(req, res, next) {
  try {
    const io = req.app.get('io');
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Not found', 404);
    if (!(await canAccessShipment(req.user, shipment))) throw new AppError('Forbidden', 403);

    const { lat, lng, source } = req.validatedBody;
    const point = { lat, lng, recordedAt: new Date(), source: source || 'gps' };
    shipment.gpsHistory.push(point);
    shipment.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
    await shipment.save();

    emitShipment(io, 'shipment:location', {
      shipmentId: shipment._id.toString(),
      lat,
      lng,
      recordedAt: point.recordedAt,
    });

    res.json(shipment);
  } catch (e) {
    next(e);
  }
}

export async function getAuditTrail(req, res, next) {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Not found', 404);
    if (!(await canAccessShipment(req.user, shipment))) throw new AppError('Forbidden', 403);

    const records = await BlockchainRecord.find({ shipmentId: shipment._id }).sort({ createdAt: 1 });
    res.json({ shipmentId: shipment._id, records });
  } catch (e) {
    next(e);
  }
}
