// ==============================================================================
// EVEREST PASAL - ORDER & FULFILLMENT ROUTES
// Endpoints for customer orders, vendor-isolated fulfillment, and admin control
// ==============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { requireIdempotency } from '../../middleware/idempotency.middleware.js';
import {
  checkoutHandler,
  getCustomerOrdersHandler,
  getOrderByIdHandler,
  getVendorFulfillmentUnitsHandler,
  updateVendorFulfillmentStatusHandler,
  getAdminOrdersHandler,
  cancelOrderHandler,
} from './order.controller.js';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

// Customer Checkout & My Orders
router.post('/checkout', requireIdempotency(300), checkoutHandler);
router.get('/my-orders', getCustomerOrdersHandler);
router.get('/', getCustomerOrdersHandler);

// Vendor Seller Center Fulfillment
router.get('/vendor/fulfillment-units', requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'), getVendorFulfillmentUnitsHandler);
router.patch('/vendor/fulfillment-units/:unitId/status', requireRoles('VENDOR', 'VENDOR_SELLER', 'ADMIN', 'SUPER_ADMIN'), updateVendorFulfillmentStatusHandler);

// Admin Control Center Global Orders
router.get('/admin/all', requireRoles('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT'), getAdminOrdersHandler);

// Single Order Details & Actions
router.get('/:id', getOrderByIdHandler);
router.post('/:id/cancel', cancelOrderHandler);

export default router;
