import { Router } from 'express';
import {
  getOutboxQueueHandler,
  processOutboxEventHandler,
  createImportJobHandler,
  createExportJobHandler,
} from './integration.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/outbox', requireRoles('ADMIN', 'SUPER_ADMIN', 'INTEGRATION_WORKER'), getOutboxQueueHandler);
router.patch('/outbox/:id', requireRoles('ADMIN', 'SUPER_ADMIN', 'INTEGRATION_WORKER'), processOutboxEventHandler);

router.post(
  '/import',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'VENDOR'),
  validate([
    { field: 'jobType', required: true, type: 'string' },
    { field: 'fileUrl', required: true, type: 'string' },
  ]),
  createImportJobHandler
);

router.post(
  '/export',
  requireRoles('ADMIN', 'SUPER_ADMIN', 'VENDOR'),
  validate([
    { field: 'jobType', required: true, type: 'string' },
  ]),
  createExportJobHandler
);

export default router;
