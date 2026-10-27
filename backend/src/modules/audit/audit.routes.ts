import { Router } from 'express';
import { getActivityLogsHandler } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', requireRoles('ADMIN', 'SUPER_ADMIN', 'AUDITOR'), getActivityLogsHandler);

export default router;
