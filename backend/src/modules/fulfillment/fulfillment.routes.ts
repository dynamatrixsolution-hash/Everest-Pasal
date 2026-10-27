import { Router } from 'express';
import {
  createFulfillmentOrderHandler,
  createPackageHandler,
  getFulfillmentsHandler,
} from './fulfillment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getFulfillmentsHandler);

router.post(
  '/process',
  requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'orderId', required: true, type: 'uuid' },
    { field: 'merchantOrderId', required: true, type: 'uuid' },
    { field: 'warehouseId', required: true, type: 'uuid' },
    { field: 'items', required: true, type: 'array' },
  ]),
  createFulfillmentOrderHandler
);

router.post(
  '/pack',
  requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'fulfillmentId', required: true, type: 'uuid' },
    { field: 'items', required: true, type: 'array' },
  ]),
  createPackageHandler
);

export default router;
