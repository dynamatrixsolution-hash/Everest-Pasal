import { Router } from 'express';
import {
  getReturnReasonsHandler,
  createReturnRequestHandler,
  recordReturnInspectionHandler,
  getMyReturnsHandler,
} from './returns.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.get('/reasons', getReturnReasonsHandler);

router.use(authenticate);

router.get('/me', getMyReturnsHandler);

router.post(
  '/request',
  validate([
    { field: 'orderId', required: true, type: 'uuid' },
    { field: 'reasonId', required: true, type: 'uuid' },
    { field: 'items', required: true, type: 'array' },
  ]),
  createReturnRequestHandler
);

router.post(
  '/inspect',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_OPERATOR'),
  validate([
    { field: 'returnItemId', required: true, type: 'uuid' },
    { field: 'conditionGrade', required: true, type: 'string' },
    { field: 'passedInspection', required: true, type: 'boolean' },
  ]),
  recordReturnInspectionHandler
);

export default router;
