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
    const { page, limit, search } = req.query;
    const result = await adminService.listVendors({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
    });
    sendSuccess(res, result.data, 'Vendors retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_VENDORS_FAILED', err.message, 500);
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
    const { page, limit, search } = req.query;
    const result = await adminService.listCustomers({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
    });
    sendSuccess(res, result.data, 'Customers retrieved', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_CUSTOMERS_FAILED', err.message, 500);
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
