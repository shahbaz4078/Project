import { Router } from 'express';
import * as products from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { productCreateSchema, productUpdateSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/', products.listProducts);
r.post('/', requireRoles('farmer', 'admin'), validateBody(productCreateSchema), products.createProduct);
r.get('/:id', products.getProduct);
r.patch('/:id', validateBody(productUpdateSchema), products.updateProduct);
r.delete('/:id', products.deleteProduct);

export default r;
