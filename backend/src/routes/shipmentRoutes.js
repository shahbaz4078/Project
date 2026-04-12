import { Router } from 'express';
import * as shipments from '../controllers/shipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { shipmentCreateSchema, shipmentUpdateSchema, locationSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/', shipments.listShipments);
r.post('/', validateBody(shipmentCreateSchema), shipments.createShipment);
r.get('/:id', shipments.getShipment);
r.patch('/:id', validateBody(shipmentUpdateSchema), shipments.updateShipment);
r.post('/:id/location', validateBody(locationSchema), shipments.appendLocation);
r.get('/:id/audit', shipments.getAuditTrail);

export default r;
