import mongoose from 'mongoose';

export const SHIPMENT_STATUSES = [
  'draft',
  'scheduled',
  'in_transit',
  'at_processor',
  'at_retailer',
  'delivered',
  'exception',
];

const gpsPointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['gps', 'manual', 'rfid'], default: 'gps' },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    status: { type: String, enum: SHIPMENT_STATUSES, default: 'draft', index: true },
    eta: { type: Date },
    origin: { type: String, trim: true },
    destination: { type: String, trim: true },
    rfidTags: [{ type: String, trim: true }],
    gpsHistory: [gpsPointSchema],
    /** GeoJSON Point for optional geospatial queries */
    currentLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

shipmentSchema.index({ currentLocation: '2dsphere' });
shipmentSchema.index({ status: 1, updatedAt: -1 });

export const Shipment = mongoose.model('Shipment', shipmentSchema);
