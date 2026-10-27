import { Router } from 'express';
import {
  getWarehousesHandler,
  getStockItemsHandler,
  adjustStockHandler,
  reserveStockHandler,
  releaseStockHandler,
} from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/warehouses', getWarehousesHandler);
router.get('/stock', getStockItemsHandler);

router.post(
  '/adjust',
  requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'),
  validate([
    { field: 'warehouseId', required: true, type: 'uuid' },
    { field: 'listingVariantId', required: true, type: 'uuid' },
    { field: 'quantityDelta', required: true, type: 'number' },
    { field: 'movementType', required: true, type: 'string' },
  ]),
  adjustStockHandler
);

router.post(
  '/reserve',
  validate([
    { field: 'warehouseId', required: true, type: 'uuid' },
    { field: 'listingVariantId', required: true, type: 'uuid' },
    { field: 'quantity', required: true, type: 'number', min: 1 },
    { field: 'referenceType', required: true, type: 'string' },
    { field: 'referenceId', required: true, type: 'string' },
  ]),
  reserveStockHandler
);

router.post(
  '/release',
  validate([{ field: 'reservationId', required: true, type: 'uuid' }]),
  releaseStockHandler
);

export default router;
