import { Router } from 'express';
import {
  getCarriersHandler,
  createShipmentHandler,
  recordTrackingEventHandler,
  getTrackingHandler,
  getRidersHandler,
} from './logistics.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

// Public tracking lookup
router.get('/tracking/:trackingNumber', getTrackingHandler);

// Protected logistics
router.get('/carriers', authenticate, getCarriersHandler);
router.get('/riders', authenticate, getRidersHandler);

router.post(
  '/shipments',
  authenticate,
  requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'carrierId', required: true, type: 'uuid' },
    { field: 'packageId', required: true, type: 'uuid' },
  ]),
  createShipmentHandler
);

router.post(
  '/shipments/:id/status',
  authenticate,
  requireRoles('RIDER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'eventType', required: true, type: 'string' },
    { field: 'description', required: true, type: 'string' },
  ]),
  recordTrackingEventHandler
);

export default router;
