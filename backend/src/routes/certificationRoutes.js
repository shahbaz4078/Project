import { Router } from 'express';
import * as certs from '../controllers/certificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { certificationCreateSchema, certificationUpdateSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/', certs.listCertifications);
r.post('/', validateBody(certificationCreateSchema), certs.createCertification);
r.get('/:id', certs.getCertification);
r.patch('/:id', validateBody(certificationUpdateSchema), certs.updateCertification);
r.delete('/:id', certs.deleteCertification);

export default r;
