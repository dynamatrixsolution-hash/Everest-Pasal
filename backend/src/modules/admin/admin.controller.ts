// ==============================================================================
// EVEREST PASAL - ADMIN CONTROL CENTER CONTROLLER
// Express handlers for Platform metrics, Vendor governance, Customer mgmt & Audits
// ==============================================================================

import { Request, Response } from 'express';
import { adminService } from './admin.service.js';
import { sendSuccess, sendError } from '../../types/context.js';
import { query, execute } from '../../db.js';

export async function getPlatformMetricsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getPlatformMetrics();
    sendSuccess(res, data, 'Platform metrics retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_METRICS_FAILED', err.message, 500);
  }
}

export async function listVendorsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.listVendors({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: status as string,
    });
    sendSuccess(res, result, 'Vendors retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_VENDORS_FAILED', err.message, 500);
  }
}

export async function createVendorAdminHandler(req: Request, res: Response): Promise<void> {
  try {
    const newVendor = await adminService.createVendor(req.body);
    sendSuccess(res, newVendor, 'Vendor created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_VENDOR_FAILED', err.message, 400);
  }
}

export async function updateVendorStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actorId = (req as any).user?.id || 'SYSTEM_ADMIN';
    const updated = await adminService.updateVendorStatus(String(id), String(status), actorId);
    sendSuccess(res, updated, `Vendor status updated to ${status}`, 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_VENDOR_STATUS_FAILED', err.message, 400);
  }
}

export async function listVendorApplicationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.listVendorApplications({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: status as string,
    });
    sendSuccess(res, result, 'Vendor applications retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_VENDOR_APPLICATIONS_FAILED', err.message, 500);
  }
}

export async function getVendorApplicationDetailHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await adminService.getVendorApplicationDetail(String(id));
    if (!result) {
      sendError(res, 'APPLICATION_NOT_FOUND', 'Vendor application not found', 404);
      return;
    }
    sendSuccess(res, result, 'Vendor application detail retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_APPLICATION_DETAIL_FAILED', err.message, 500);
  }
}

export async function reviewVendorApplicationHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { action, message } = req.body;
    const reviewer = (req as any).user?.fullName || 'Rajesh Sharma';
    const result = await adminService.reviewVendorApplication(String(id), String(action), message, reviewer);
    sendSuccess(res, result, `Application action ${action} executed successfully`, 200);
  } catch (err: any) {
    sendError(res, 'REVIEW_APPLICATION_FAILED', err.message, 400);
  }
}

export async function getPendingVendorsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const rows = await query(
      `SELECT * FROM ep_merchant.tb_ep_merchant_vendor_merchant_master 
       WHERE company_code = $1 AND approval_status = 'PENDING_VERIFICATION' AND active = true 
       ORDER BY created_at ASC;`,
      [companyCode]
    );
    sendSuccess(res, rows, 'Pending vendors retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_PENDING_VENDORS_FAILED', err.message, 500);
  }
}

export async function approveVendorHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';

    await execute(
      `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
       SET approval_status = 'APPROVED', publish = true, updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [companyCode, id]
    );
    sendSuccess(res, { id, status: 'APPROVED' }, 'Vendor approved successfully', 200);
  } catch (err: any) {
    sendError(res, 'APPROVE_VENDOR_FAILED', err.message, 400);
  }
}

export async function rejectVendorHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';

    await execute(
      `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
       SET approval_status = 'REJECTED', publish = false, updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [companyCode, id]
    );
    sendSuccess(res, { id, status: 'REJECTED' }, 'Vendor rejected', 200);
  } catch (err: any) {
    sendError(res, 'REJECT_VENDOR_FAILED', err.message, 400);
  }
}

export async function suspendVendorHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';

    await execute(
      `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
       SET approval_status = 'SUSPENDED', publish = false, updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [companyCode, id]
    );
    sendSuccess(res, { id, status: 'SUSPENDED' }, 'Vendor suspended', 200);
  } catch (err: any) {
    sendError(res, 'SUSPEND_VENDOR_FAILED', err.message, 400);
  }
}

export async function listCustomersHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, search, status, timeframe } = req.query;
    const result = await adminService.listCustomers({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: status as string,
      timeframe: timeframe as string,
    });
    sendSuccess(res, result, 'Customers retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_CUSTOMERS_FAILED', err.message, 500);
  }
}

export async function createCustomerHandler(req: Request, res: Response): Promise<void> {
  try {
    const newCust = await adminService.createCustomer(req.body);
    sendSuccess(res, newCust, 'Customer created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_CUSTOMER_FAILED', err.message, 400);
  }
}

export async function updateCustomerStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await adminService.updateCustomerStatus(String(id), String(status));
    sendSuccess(res, updated, `Customer status updated to ${status}`, 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_CUSTOMER_STATUS_FAILED', err.message, 400);
  }
}

export async function listAuditEventsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, eventType } = req.query;
    const result = await adminService.listAuditEvents({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      eventType: eventType as string,
    });
    sendSuccess(res, result.data, 'Audit events retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_AUDIT_EVENTS_FAILED', err.message, 500);
  }
}

// ==============================================================================
// SYSTEM ADMIN DASHBOARD HANDLERS (Sequential Screens 1 - 6)
// ==============================================================================

export async function getDashboardOverviewHandler(req: Request, res: Response): Promise<void> {
  try {
    const timeframe = (req.query.timeframe as string) || '30_days';
    const data = await adminService.getOverviewData(timeframe);
    sendSuccess(res, data, 'Admin overview telemetry retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_OVERVIEW_FAILED', err.message, 500);
  }
}

export async function getDashboardSalesSummaryHandler(req: Request, res: Response): Promise<void> {
  try {
    const timeframe = (req.query.timeframe as string) || 'monthly';
    const data = await adminService.getSalesSummaryData(timeframe);
    sendSuccess(res, data, 'Sales summary telemetry retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_SALES_SUMMARY_FAILED', err.message, 500);
  }
}

export async function getDashboardOrdersSummaryHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getOrdersSummaryData(req.query);
    sendSuccess(res, data, 'Orders summary telemetry retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_ORDERS_SUMMARY_FAILED', err.message, 500);
  }
}

export async function getDashboardRevenueSummaryHandler(req: Request, res: Response): Promise<void> {
  try {
    const timeframe = (req.query.timeframe as string) || 'all_time';
    const data = await adminService.getRevenueSummaryData(timeframe);
    sendSuccess(res, data, 'Revenue summary telemetry retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_REVENUE_SUMMARY_FAILED', err.message, 500);
  }
}

export async function getDashboardPendingApprovalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const type = (req.query.type as string) || 'all';
    const search = (req.query.search as string) || '';
    const data = await adminService.getPendingApprovalsData(type, search);
    sendSuccess(res, data, 'Pending approvals retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_PENDING_APPROVALS_FAILED', err.message, 500);
  }
}

export async function approveDashboardPendingHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const actorId = (req as any).user?.id || 'SUPER_ADMIN';
    const result = await adminService.approvePendingRequest(id, actorId);
    sendSuccess(res, result, 'Request approved successfully', 200);
  } catch (err: any) {
    sendError(res, 'APPROVE_REQUEST_FAILED', err.message, 400);
  }
}

export async function rejectDashboardPendingHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { reason } = req.body;
    const actorId = (req as any).user?.id || 'SUPER_ADMIN';
    const result = await adminService.rejectPendingRequest(id, reason, actorId);
    sendSuccess(res, result, 'Request rejected', 200);
  } catch (err: any) {
    sendError(res, 'REJECT_REQUEST_FAILED', err.message, 400);
  }
}

export async function batchApproveDashboardPendingHandler(req: Request, res: Response): Promise<void> {
  try {
    const { ids } = req.body;
    const actorId = (req as any).user?.id || 'SUPER_ADMIN';
    const result = await adminService.batchApprovePendingRequests(ids || [], actorId);
    sendSuccess(res, result, 'Selected requests approved', 200);
  } catch (err: any) {
    sendError(res, 'BATCH_APPROVE_FAILED', err.message, 400);
  }
}

export async function getDashboardAlertsHandler(req: Request, res: Response): Promise<void> {
  try {
    const channel = (req.query.channel as string) || 'all';
    const type = (req.query.type as string) || 'all';
    const search = (req.query.search as string) || '';
    const data = await adminService.getAlertsNotificationsData(channel, type, search);
    sendSuccess(res, data, 'Alerts & notifications retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_ALERTS_FAILED', err.message, 500);
  }
}

export async function markAlertReadHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const result = await adminService.markAlertRead(id);
    sendSuccess(res, result, 'Alert marked as read', 200);
  } catch (err: any) {
    sendError(res, 'MARK_ALERT_READ_FAILED', err.message, 400);
  }
}

export async function snoozeAlertHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { duration } = req.body;
    const result = await adminService.snoozeAlert(id, duration);
    sendSuccess(res, result, 'Alert snoozed', 200);
  } catch (err: any) {
    sendError(res, 'SNOOZE_ALERT_FAILED', err.message, 400);
  }
}

export async function markAllAlertsReadHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.markAllAlertsRead();
    sendSuccess(res, result, 'All alerts marked as read', 200);
  } catch (err: any) {
    sendError(res, 'MARK_ALL_ALERTS_READ_FAILED', err.message, 400);
  }
}

// ==============================================================================
// PRODUCT & CATALOG MANAGEMENT CONTROLLERS
// ==============================================================================

export async function listCatalogProductsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, search, status, category, isApprovalsOnly } = req.query;
    const result = await adminService.listCatalogProducts({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: status as string,
      category: category as string,
      isApprovalsOnly: isApprovalsOnly === 'true' || isApprovalsOnly === '1',
    });
    sendSuccess(res, result, 'Catalog products retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_CATALOG_PRODUCTS_FAILED', err.message, 500);
  }
}

export async function createCatalogProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const prod = await adminService.createCatalogProduct(req.body);
    sendSuccess(res, prod, 'Product created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_PRODUCT_FAILED', err.message, 400);
  }
}

export async function updateCatalogProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const sku = String(req.params.sku || req.params.id);
    const prod = await adminService.updateCatalogProduct(sku, req.body);
    sendSuccess(res, prod, 'Product updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_PRODUCT_FAILED', err.message, 400);
  }
}

export async function reviewCatalogProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const sku = String(req.params.sku || req.params.id);
    const { decision, note } = req.body;
    const prod = await adminService.reviewCatalogProduct(sku, decision, note);
    sendSuccess(res, prod, `Product ${decision} processed successfully`, 200);
  } catch (err: any) {
    sendError(res, 'REVIEW_PRODUCT_FAILED', err.message, 400);
  }
}

export async function listCategoriesHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.listCategories(req.query);
    sendSuccess(res, result, 'Categories retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_CATEGORIES_FAILED', err.message, 500);
  }
}

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const cat = await adminService.createCategory(req.body);
    sendSuccess(res, cat, 'Category created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_CATEGORY_FAILED', err.message, 400);
  }
}

export async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const cat = await adminService.updateCategory(id, req.body);
    sendSuccess(res, cat, 'Category updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_CATEGORY_FAILED', err.message, 400);
  }
}

export async function listBrandsHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.listBrands(req.query);
    sendSuccess(res, result, 'Brands retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_BRANDS_FAILED', err.message, 500);
  }
}

export async function createBrandHandler(req: Request, res: Response): Promise<void> {
  try {
    const brand = await adminService.createBrand(req.body);
    sendSuccess(res, brand, 'Brand created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_BRAND_FAILED', err.message, 400);
  }
}

export async function updateBrandHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const brand = await adminService.updateBrand(id, req.body);
    sendSuccess(res, brand, 'Brand updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_BRAND_FAILED', err.message, 400);
  }
}

export async function listAttributesHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.listAttributes(req.query);
    sendSuccess(res, result, 'Attributes retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_ATTRIBUTES_FAILED', err.message, 500);
  }
}

export async function createAttributeHandler(req: Request, res: Response): Promise<void> {
  try {
    const attr = await adminService.createAttribute(req.body);
    sendSuccess(res, attr, 'Attribute created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_ATTRIBUTE_FAILED', err.message, 400);
  }
}

export async function updateAttributeHandler(req: Request, res: Response): Promise<void> {
  try {
    const code = String(req.params.code || req.params.id);
    const attr = await adminService.updateAttribute(code, req.body);
    sendSuccess(res, attr, 'Attribute updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_ATTRIBUTE_FAILED', err.message, 400);
  }
}

// ==============================================================================
// INVENTORY CONTROLLER HANDLERS
// ==============================================================================
export async function getInventoryOverviewHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getInventoryOverview(req.query);
    sendSuccess(res, data, 'Inventory overview retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_INVENTORY_OVERVIEW_FAILED', err.message, 500);
  }
}

export async function getStockAvailabilityHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getStockAvailability(req.query);
    sendSuccess(res, data, 'Stock availability retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_STOCK_AVAILABILITY_FAILED', err.message, 500);
  }
}

export async function getStockAdjustmentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getStockAdjustments(req.query);
    sendSuccess(res, data, 'Stock adjustments retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_STOCK_ADJUSTMENTS_FAILED', err.message, 500);
  }
}

export async function createStockAdjustmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.createStockAdjustment(req.body);
    sendSuccess(res, data, 'Stock adjustment created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_STOCK_ADJUSTMENT_FAILED', err.message, 400);
  }
}

export async function reviewStockAdjustmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const decision = req.body.decision || 'APPROVE';
    const data = await adminService.reviewStockAdjustment(id, decision);
    sendSuccess(res, data, `Stock adjustment ${decision} successfully`, 200);
  } catch (err: any) {
    sendError(res, 'REVIEW_STOCK_ADJUSTMENT_FAILED', err.message, 400);
  }
}

export async function getStockReservationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getStockReservations(req.query);
    sendSuccess(res, data, 'Stock reservations retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_STOCK_RESERVATIONS_FAILED', err.message, 500);
  }
}

export async function getLowStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getLowStockItems(req.query);
    sendSuccess(res, data, 'Low stock items retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_LOW_STOCK_FAILED', err.message, 500);
  }
}

export async function getOutOfStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getOutOfStockItems(req.query);
    sendSuccess(res, data, 'Out of stock items retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_OUT_OF_STOCK_FAILED', err.message, 500);
  }
}

export async function getDamagedStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getDamagedStockItems(req.query);
    sendSuccess(res, data, 'Damaged stock items retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_DAMAGED_STOCK_FAILED', err.message, 500);
  }
}

export async function disposeDamagedStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const sku = String(req.params.sku);
    const data = await adminService.disposeDamagedStock(sku, req.body);
    sendSuccess(res, data, 'Damaged stock disposition processed', 200);
  } catch (err: any) {
    sendError(res, 'DISPOSE_DAMAGED_STOCK_FAILED', err.message, 400);
  }
}

// ==============================================================================
// ORDER MANAGEMENT HANDLERS (Screens 23 & 24)
// ==============================================================================

export async function listAdminOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.listAdminOrders(req.query);
    sendSuccess(res, data, 'Admin orders retrieved', 200);
  } catch (err: any) {
    sendError(res, 'LIST_ADMIN_ORDERS_FAILED', err.message, 500);
  }
}

export async function createAdminOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.createAdminOrder(req.body);
    sendSuccess(res, data, 'Order created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_ADMIN_ORDER_FAILED', err.message, 400);
  }
}

export async function listOrderExceptionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.listOrderExceptions(req.query);
    sendSuccess(res, data, 'Order exceptions retrieved', 200);
  } catch (err: any) {
    sendError(res, 'LIST_ORDER_EXCEPTIONS_FAILED', err.message, 500);
  }
}

export async function createOrderExceptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.createOrderException(req.body);
    sendSuccess(res, data, 'Order exception recorded', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_ORDER_EXCEPTION_FAILED', err.message, 400);
  }
}

export async function resolveOrderRefundHandler(req: Request, res: Response): Promise<void> {
  try {
    const orderId = String(req.params.id);
    const data = await adminService.resolveOrderRefund(orderId, req.body);
    sendSuccess(res, data, 'Order refund processed', 200);
  } catch (err: any) {
    sendError(res, 'RESOLVE_ORDER_REFUND_FAILED', err.message, 400);
  }
}

export async function resolveOrderPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    const orderId = String(req.params.id);
    const data = await adminService.resolveOrderPayment(orderId, req.body);
    sendSuccess(res, data, 'Order payment verified and updated', 200);
  } catch (err: any) {
    sendError(res, 'RESOLVE_ORDER_PAYMENT_FAILED', err.message, 400);
  }
}

// ==============================================================================
// PAYMENT MANAGEMENT HANDLERS (Screens 25, 26, 27)
// ==============================================================================

export async function listPaymentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.listPayments(req.query);
    sendSuccess(res, data, 'Payments retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'LIST_PAYMENTS_FAILED', err.message, 500);
  }
}

export async function recordPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.recordPayment(req.body);
    sendSuccess(res, data, 'Payment recorded successfully', 201);
  } catch (err: any) {
    sendError(res, 'RECORD_PAYMENT_FAILED', err.message, 400);
  }
}

export async function getPaymentReconciliationHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getPaymentReconciliation(req.query);
    sendSuccess(res, data, 'Payment reconciliation telemetry retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_PAYMENT_RECONCILIATION_FAILED', err.message, 500);
  }
}

export async function importBankStatementHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.importBankStatement(req.body);
    sendSuccess(res, data, 'Bank statement imported successfully', 200);
  } catch (err: any) {
    sendError(res, 'IMPORT_BANK_STATEMENT_FAILED', err.message, 400);
  }
}

export async function listPaymentGatewaysHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.listPaymentGateways(req.query);
    sendSuccess(res, data, 'Payment gateways retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'LIST_PAYMENT_GATEWAYS_FAILED', err.message, 500);
  }
}

export async function configurePaymentGatewayHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.configurePaymentGateway(id, req.body);
    sendSuccess(res, data, 'Payment gateway configured successfully', 200);
  } catch (err: any) {
    sendError(res, 'CONFIGURE_PAYMENT_GATEWAY_FAILED', err.message, 400);
  }
}

// ==============================================================================
// DELIVERY & LOGISTICS HANDLERS (Screen 28: Delivery Dashboard)
// ==============================================================================
export async function getDeliveryDashboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getDeliveryDashboard(req.query);
    sendSuccess(res, data, 'Delivery & logistics dashboard data retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_DELIVERY_DASHBOARD_FAILED', err.message, 500);
  }
}

export async function assignShipmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.assignShipment(req.body);
    sendSuccess(res, data, 'Shipment assigned successfully', 201);
  } catch (err: any) {
    sendError(res, 'ASSIGN_SHIPMENT_FAILED', err.message, 400);
  }
}

export async function updateShipmentStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.updateShipmentStatus(id, req.body);
    sendSuccess(res, data, 'Shipment status updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_SHIPMENT_STATUS_FAILED', err.message, 400);
  }
}

// ==============================================================================
// RETURNS & REFUNDS HANDLERS (Screens 29, 30, 31, 32, 33, 34)
// ==============================================================================
export async function getReturnRequestsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getReturnRequests(req.query);
    sendSuccess(res, data, 'Return requests retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'GET_RETURN_REQUESTS_FAILED', err.message, 500);
  }
}

export async function createReturnRequestHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.createReturnRequest(req.body);
    sendSuccess(res, data, 'Return request created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_RETURN_REQUEST_FAILED', err.message, 400);
  }
}

export async function getReturnApprovalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getReturnApprovals(req.query);
    sendSuccess(res, data, 'Return approvals queue retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_RETURN_APPROVALS_FAILED', err.message, 500);
  }
}

export async function approveReturnHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.approveReturn(id, req.body);
    sendSuccess(res, data, 'Return approved successfully', 200);
  } catch (err: any) {
    sendError(res, 'APPROVE_RETURN_FAILED', err.message, 400);
  }
}

export async function rejectReturnHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.rejectReturn(id, req.body);
    sendSuccess(res, data, 'Return rejected', 200);
  } catch (err: any) {
    sendError(res, 'REJECT_RETURN_FAILED', err.message, 400);
  }
}

export async function getReturnInspectionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getReturnInspections(req.query);
    sendSuccess(res, data, 'Return inspections retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_RETURN_INSPECTIONS_FAILED', err.message, 500);
  }
}

export async function submitInspectionHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.submitInspection(id, req.body);
    sendSuccess(res, data, 'Inspection decision recorded', 200);
  } catch (err: any) {
    sendError(res, 'SUBMIT_INSPECTION_FAILED', err.message, 400);
  }
}

export async function getRefundRequestsHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getRefundRequests(req.query);
    sendSuccess(res, data, 'Refund authorization queue retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_REFUND_REQUESTS_FAILED', err.message, 500);
  }
}

export async function authorizeRefundHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.authorizeRefund(id, req.body);
    sendSuccess(res, data, 'Refund authorized successfully', 200);
  } catch (err: any) {
    sendError(res, 'AUTHORIZE_REFUND_FAILED', err.message, 400);
  }
}

export async function getRefundProcessingHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getRefundProcessing(req.query);
    sendSuccess(res, data, 'Refund payout monitor retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_REFUND_PROCESSING_FAILED', err.message, 500);
  }
}

export async function reconcilePayoutJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const data = await adminService.reconcilePayoutJob(id, req.body);
    sendSuccess(res, data, 'Payout job reconciled', 200);
  } catch (err: any) {
    sendError(res, 'RECONCILE_PAYOUT_JOB_FAILED', err.message, 400);
  }
}

export async function getRefundHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getRefundHistory(req.query);
    sendSuccess(res, data, 'Refund history ledger retrieved', 200);
  } catch (err: any) {
    sendError(res, 'GET_REFUND_HISTORY_FAILED', err.message, 500);
  }
}
