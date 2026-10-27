import { Router } from 'express';
import {
  getMyKycCaseHandler,
  uploadKycDocumentHandler,
  submitKycCaseHandler,
  getAdminPendingKycCasesHandler,
  recordKycDecisionHandler,
} from './kyc.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

// User KYC
router.get('/me', getMyKycCaseHandler);
router.post(
  '/documents',
  validate([
    { field: 'documentType', required: true, type: 'string' },
    { field: 'fileUrl', required: true, type: 'string' },
    { field: 'fileName', required: true, type: 'string' },
  ]),
  uploadKycDocumentHandler
);
router.post('/submit', submitKycCaseHandler);

// Admin KYC verification
router.get('/admin/pending', requireRoles('SUPER_ADMIN', 'ADMIN'), getAdminPendingKycCasesHandler);
router.post(
  '/admin/decision/:caseId',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  validate([
    { field: 'decision', required: true, type: 'string', enum: ['APPROVED', 'REJECTED', 'REVERIFICATION_REQUESTED'] },
  ]),
  recordKycDecisionHandler
);

export default router;
