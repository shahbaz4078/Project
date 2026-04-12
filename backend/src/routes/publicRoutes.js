import { Router } from 'express';
import * as pub from '../controllers/publicController.js';

const r = Router();

r.get('/products', pub.listProducts);
r.get('/products/:id', pub.getProduct);
r.get('/batches', pub.listBatches);
r.get('/trace/:productId', pub.getTrace);

export default r;
