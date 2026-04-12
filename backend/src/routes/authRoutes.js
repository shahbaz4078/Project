import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../validators/schemas.js';

const r = Router();

r.post('/register', validateBody(registerSchema), auth.register);
r.post('/login', validateBody(loginSchema), auth.login);
r.post('/refresh', validateBody(refreshSchema), auth.refresh);
r.post('/logout', validateBody(logoutSchema), auth.logout);

export default r;
