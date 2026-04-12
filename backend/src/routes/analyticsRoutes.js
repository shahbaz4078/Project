import { Router } from 'express';
import * as analytics from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const r = Router();

r.use(authenticate);
r.get('/summary', analytics.getSummary);

export default r;
