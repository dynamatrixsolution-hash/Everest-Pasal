// ==============================================================================
// EVEREST PASAL - ADMIN CONTROL CENTER ROUTES
// ==============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import {
  getPlatformMetricsHandler,
  listVendorsHandler,
  getPendingVendorsHandler,
  approveVendorHandler,
  rejectVendorHandler,
  suspendVendorHandler,
  listCustomersHandler,
  listAuditEventsHandler,
} from './admin.controller.js';
import {
  getAllBannersAdminHandler,
  createBannerHandler,
  updateBannerHandler,
  deleteBannerHandler,
  seedBannersHandler,
} from '../content/content.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'OPERATOR'));

router.get('/metrics', getPlatformMetricsHandler);
router.get('/vendors', listVendorsHandler);
router.get('/vendors/pending', getPendingVendorsHandler);
router.post('/vendors/:id/approve', approveVendorHandler);
router.post('/vendors/:id/reject', rejectVendorHandler);
router.post('/vendors/:id/suspend', suspendVendorHandler);

router.get('/customers', listCustomersHandler);
router.get('/audits', listAuditEventsHandler);

// Super Admin Dynamic Hero Banner Management
router.get('/banners', getAllBannersAdminHandler);
router.post('/banners', createBannerHandler);
router.put('/banners/:id', updateBannerHandler);
router.delete('/banners/:id', deleteBannerHandler);
router.post('/banners/seed', seedBannersHandler);

export default router;
