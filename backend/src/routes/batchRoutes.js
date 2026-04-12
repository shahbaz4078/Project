import { Router } from 'express';
import * as batches from '../controllers/batchController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { batchCreateSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/', batches.listBatches);
r.post('/', validateBody(batchCreateSchema), batches.createBatch);
r.get('/:id', batches.getBatch);

export default r;
