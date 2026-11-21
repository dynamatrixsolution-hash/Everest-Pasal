// ==============================================================================
// EVEREST PASAL - ADMIN CONTROL CENTER ROUTES
// ==============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import {
  getPlatformMetricsHandler,
  listVendorsHandler,
  createVendorAdminHandler,
  updateVendorStatusHandler,
  listVendorApplicationsHandler,
  getVendorApplicationDetailHandler,
  reviewVendorApplicationHandler,
  getPendingVendorsHandler,
  approveVendorHandler,
  rejectVendorHandler,
  suspendVendorHandler,
  listCustomersHandler,
  createCustomerHandler,
  updateCustomerStatusHandler,
  listAuditEventsHandler,
  getDashboardOverviewHandler,
  getDashboardSalesSummaryHandler,
  getDashboardOrdersSummaryHandler,
  getDashboardRevenueSummaryHandler,
  getDashboardPendingApprovalsHandler,
  approveDashboardPendingHandler,
  rejectDashboardPendingHandler,
  batchApproveDashboardPendingHandler,
  getDashboardAlertsHandler,
  markAlertReadHandler,
  snoozeAlertHandler,
  markAllAlertsReadHandler,
  listCatalogProductsHandler,
  createCatalogProductHandler,
  updateCatalogProductHandler,
  reviewCatalogProductHandler,
  listCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  listBrandsHandler,
  createBrandHandler,
  updateBrandHandler,
  listAttributesHandler,
  createAttributeHandler,
  updateAttributeHandler,
  getInventoryOverviewHandler,
  getStockAvailabilityHandler,
  getStockAdjustmentsHandler,
  createStockAdjustmentHandler,
  reviewStockAdjustmentHandler,
  getStockReservationsHandler,
  getLowStockHandler,
  getOutOfStockHandler,
  getDamagedStockHandler,
  disposeDamagedStockHandler,
  listAdminOrdersHandler,
  createAdminOrderHandler,
  listOrderExceptionsHandler,
  createOrderExceptionHandler,
  resolveOrderRefundHandler,
  resolveOrderPaymentHandler,
  listPaymentsHandler,
  recordPaymentHandler,
  getPaymentReconciliationHandler,
  importBankStatementHandler,
  listPaymentGatewaysHandler,
  configurePaymentGatewayHandler,
  getDeliveryDashboardHandler,
  assignShipmentHandler,
  updateShipmentStatusHandler,
  getReturnRequestsHandler,
  createReturnRequestHandler,
  getReturnApprovalsHandler,
  approveReturnHandler,
  rejectReturnHandler,
  getReturnInspectionsHandler,
  submitInspectionHandler,
  getRefundRequestsHandler,
  authorizeRefundHandler,
  getRefundProcessingHandler,
  reconcilePayoutJobHandler,
  getRefundHistoryHandler,
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
router.post('/vendors', createVendorAdminHandler);
router.put('/vendors/:id/status', updateVendorStatusHandler);
router.patch('/vendors/:id/status', updateVendorStatusHandler);
router.get('/vendors/pending', getPendingVendorsHandler);
router.post('/vendors/:id/approve', approveVendorHandler);
router.post('/vendors/:id/reject', rejectVendorHandler);
router.post('/vendors/:id/suspend', suspendVendorHandler);

// Vendor Applications
router.get('/vendor-applications', listVendorApplicationsHandler);
router.get('/vendor-applications/:id', getVendorApplicationDetailHandler);
router.post('/vendor-applications/:id/review', reviewVendorApplicationHandler);
router.get('/vendors/applications', listVendorApplicationsHandler);
router.get('/vendors/applications/:id', getVendorApplicationDetailHandler);
router.post('/vendors/applications/:id/review', reviewVendorApplicationHandler);

router.get('/customers', listCustomersHandler);
router.post('/customers', createCustomerHandler);
router.put('/customers/:id/status', updateCustomerStatusHandler);
router.patch('/customers/:id/status', updateCustomerStatusHandler);
router.get('/audits', listAuditEventsHandler);

// ==============================================================================
// Dashboard Sequential Screen Routes (Screens 1 to 6)
// ==============================================================================
router.get('/dashboard/overview', getDashboardOverviewHandler);
router.get('/dashboard/sales-summary', getDashboardSalesSummaryHandler);
router.get('/dashboard/orders-summary', getDashboardOrdersSummaryHandler);
router.get('/dashboard/revenue-summary', getDashboardRevenueSummaryHandler);
router.get('/dashboard/pending-approvals', getDashboardPendingApprovalsHandler);
router.post('/dashboard/approvals/:id/approve', approveDashboardPendingHandler);
router.post('/dashboard/approvals/:id/reject', rejectDashboardPendingHandler);
router.post('/dashboard/approvals/batch-approve', batchApproveDashboardPendingHandler);
router.get('/dashboard/alerts-notifications', getDashboardAlertsHandler);
router.post('/dashboard/alerts/:id/read', markAlertReadHandler);
router.post('/dashboard/alerts/:id/snooze', snoozeAlertHandler);
router.post('/dashboard/alerts/mark-all-read', markAllAlertsReadHandler);

// ==============================================================================
// Product & Catalog Management Suite Routes
// ==============================================================================
router.get('/catalog/products', listCatalogProductsHandler);
router.post('/catalog/products', createCatalogProductHandler);
router.put('/catalog/products/:id', updateCatalogProductHandler);
router.post('/catalog/products/:id/review', reviewCatalogProductHandler);

router.get('/catalog/categories', listCategoriesHandler);
router.post('/catalog/categories', createCategoryHandler);
router.put('/catalog/categories/:id', updateCategoryHandler);

router.get('/catalog/brands', listBrandsHandler);
router.post('/catalog/brands', createBrandHandler);
router.put('/catalog/brands/:id', updateBrandHandler);

router.get('/catalog/attributes', listAttributesHandler);
router.post('/catalog/attributes', createAttributeHandler);
router.put('/catalog/attributes/:id', updateAttributeHandler);

// ==============================================================================
// Inventory Management Suite Routes
// ==============================================================================
router.get('/inventory/overview', getInventoryOverviewHandler);
router.get('/inventory/availability', getStockAvailabilityHandler);
router.get('/inventory/adjustments', getStockAdjustmentsHandler);
router.post('/inventory/adjustments', createStockAdjustmentHandler);
router.post('/inventory/adjustments/:id/review', reviewStockAdjustmentHandler);
router.get('/inventory/reservations', getStockReservationsHandler);
router.get('/inventory/low-stock', getLowStockHandler);
router.get('/inventory/out-of-stock', getOutOfStockHandler);
router.get('/inventory/damaged', getDamagedStockHandler);
router.post('/inventory/damaged/:sku/disposition', disposeDamagedStockHandler);

// ==============================================================================
// Order Management Suite Routes (Screens 23 & 24)
// ==============================================================================
router.get('/orders', listAdminOrdersHandler);
router.post('/orders', createAdminOrderHandler);
router.get('/orders/exceptions', listOrderExceptionsHandler);
router.post('/orders/exceptions', createOrderExceptionHandler);
router.post('/orders/:id/refund', resolveOrderRefundHandler);
router.post('/orders/:id/payment', resolveOrderPaymentHandler);

// ==============================================================================
// Payment Management Suite Routes (Screens 25, 26, 27)
// ==============================================================================
router.get('/payments', listPaymentsHandler);
router.post('/payments', recordPaymentHandler);
router.get('/payments/reconciliation', getPaymentReconciliationHandler);
router.post('/payments/reconciliation/import', importBankStatementHandler);
router.get('/payments/gateways', listPaymentGatewaysHandler);
router.post('/payments/gateways/:id/configure', configurePaymentGatewayHandler);

// ==============================================================================
// Delivery & Logistics Suite Routes (Screen 28: Delivery Dashboard)
// ==============================================================================
router.get('/delivery/dashboard', getDeliveryDashboardHandler);
router.post('/delivery/assign', assignShipmentHandler);
router.put('/delivery/shipments/:id/status', updateShipmentStatusHandler);

// ==============================================================================
// Returns & Refunds Suite Routes (Screens 29, 30, 31, 32, 33, 34)
// ==============================================================================
router.get('/returns/requests', getReturnRequestsHandler);
router.post('/returns/requests', createReturnRequestHandler);
router.get('/returns/approvals', getReturnApprovalsHandler);
router.post('/returns/approvals/:id/approve', approveReturnHandler);
router.post('/returns/approvals/:id/reject', rejectReturnHandler);
router.get('/returns/inspections', getReturnInspectionsHandler);
router.post('/returns/inspections/:id', submitInspectionHandler);
router.get('/returns/refund-requests', getRefundRequestsHandler);
router.post('/returns/refund-requests/:id/authorize', authorizeRefundHandler);
router.get('/returns/processing', getRefundProcessingHandler);
router.post('/returns/processing/:id/reconcile', reconcilePayoutJobHandler);
router.get('/returns/refund-history', getRefundHistoryHandler);

// Super Admin Dynamic Hero Banner Management
router.get('/banners', getAllBannersAdminHandler);
router.post('/banners', createBannerHandler);
router.put('/banners/:id', updateBannerHandler);
router.delete('/banners/:id', deleteBannerHandler);
router.post('/banners/seed', seedBannersHandler);

export default router;
