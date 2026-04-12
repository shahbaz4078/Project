import { z } from 'zod';
import { ROLES } from '../models/User.js';
import { SHIPMENT_STATUSES as SH_STATUSES } from '../models/Shipment.js';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  orgId: z.string().optional(),
  role: z.enum(['farmer', 'processor', 'retailer', 'consumer']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const adminCreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  orgId: z.string().optional(),
  role: z.enum(ROLES),
});

export const productCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const batchCreateSchema = z.object({
  productId: z.string().min(1),
  batchCode: z.string().min(1),
  harvestDate: z.string().optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().optional(),
});

export const shipmentCreateSchema = z.object({
  batchId: z.string().min(1),
  status: z.enum(SH_STATUSES).optional(),
  eta: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  rfidTags: z.array(z.string()).optional(),
});

export const shipmentUpdateSchema = z
  .object({
    status: z.enum(SH_STATUSES).optional(),
    eta: z.string().optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
    rfidTags: z.array(z.string()).optional(),
  })
  .partial();

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  source: z.enum(['gps', 'manual', 'rfid']).optional(),
});

export const certificationCreateSchema = z.object({
  type: z.enum(['organic', 'fair_trade', 'other']),
  title: z.string().optional(),
  issuer: z.string().min(1),
  validUntil: z.string().optional(),
  documentUrl: z.string().optional(),
  productId: z.string().optional(),
  batchId: z.string().optional(),
});

export const certificationUpdateSchema = certificationCreateSchema.partial();
