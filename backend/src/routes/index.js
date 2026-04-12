import { Router } from 'express';
import publicRoutes from './publicRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import batchRoutes from './batchRoutes.js';
import shipmentRoutes from './shipmentRoutes.js';
import certificationRoutes from './certificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import transactionRoutes from './transactionRoutes.js';

const api = Router();

api.use('/public', publicRoutes);
api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/products', productRoutes);
api.use('/batches', batchRoutes);
api.use('/shipments', shipmentRoutes);
api.use('/certifications', certificationRoutes);
api.use('/analytics', analyticsRoutes);
api.use('/transactions', transactionRoutes);

export default api;
