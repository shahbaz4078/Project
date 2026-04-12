import { Router } from 'express';
import * as tx from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';

const r = Router();

r.use(authenticate);
r.get('/', tx.listTransactions);

export default r;
