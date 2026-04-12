import { Router } from 'express';
import * as users from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { adminCreateUserSchema } from '../validators/schemas.js';

const r = Router();

r.get('/me', authenticate, users.getMe);
r.get('/', authenticate, requireRoles('admin'), users.listUsers);
r.post('/', authenticate, requireRoles('admin'), validateBody(adminCreateUserSchema), users.createUser);

export default r;
