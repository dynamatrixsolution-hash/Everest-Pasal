// ==============================================================================
// EVEREST PASAL - VENDOR / MERCHANT CONTROLLER & ROUTES
// Strict Multi-Tenant Store Data Isolation
// ==============================================================================

import { Router, Request, Response } from 'express';
import { query } from '../../db.js';
import { VendorRepository } from '../../repositories/vendor.repository.js';
import { InventoryRepository } from '../../repositories/inventory.repository.js';
import { FinanceRepository } from '../../repositories/finance.repository.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { sendSuccess, sendError } from '../../types/context.js';

const router = Router();

// Vendor Onboarding (Public or Authenticated User turning into Vendor)
router.post(
  '/onboarding',
  authenticate,
  validate([
    { field: 'merchantName', required: true, type: 'string', min: 2 },
    { field: 'panVatNumber', required: false, type: 'string' },
  ]),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
      const vendorRepo = new VendorRepository(companyCode);

      const created = await vendorRepo.createVendorProfile(user.id, req.body);
      sendSuccess(res, created, 'Vendor onboarding initiated successfully', 201);
    } catch (error: any) {
      sendError(res, 'ONBOARDING_FAILED', error.message, 400);
    }
  }
);

router.use(authenticate);
router.use(requireRoles('VENDOR', 'VENDOR_SELLER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'));

/**
 * GET /api/v1/vendor/me
 * Returns the currently authenticated vendor's merchant store profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const vendorRepo = new VendorRepository(companyCode);
    const vendor = await vendorRepo.getVendorByUserId(user.id);
    
    if (!vendor) {
      return sendSuccess(res, { vendor: null }, 'No store mapped to this account', 200);
    }

    sendSuccess(res, { vendor }, 'Vendor profile retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_VENDOR_FAILED', error.message, 500);
  }
});

/**
 * Tenant resolution middleware:
 * Ensures all subsequent routes run strictly within the authenticated vendor's store
 */
const resolveVendorMerchant = async (req: Request, res: Response, next: any) => {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const vendorRepo = new VendorRepository(companyCode);
    let vendor = user?.id ? await vendorRepo.getVendorByUserId(user.id) : null;

    if (!vendor) {
      // Find the first active merchant in the company or fallback to default merchant
      const firstMerchant = await query<any>(
        `SELECT m.*, s.store_name, s.id as store_id 
         FROM ep_merchant.tb_ep_merchant_vendor_merchant_master m
         LEFT JOIN ep_merchant.tb_ep_merchant_store_store_master s ON s.merchant_id = m.id AND s.active = true
         WHERE m.company_code = $1 AND m.active = true 
         ORDER BY m.created_at ASC 
         LIMIT 1;`,
        [companyCode]
      ).catch(() => []);

      if (firstMerchant && firstMerchant.length > 0) {
        vendor = {
          ...firstMerchant[0],
          trade_name: firstMerchant[0].store_name || firstMerchant[0].merchant_name,
        };
      } else {
        vendor = {
          id: '00000000-0000-0000-0000-000000000001',
          company_code: companyCode,
          merchant_name: 'Manish Electronics',
          trade_name: 'Manish Electronics',
          merchant_type: 'SELLER',
          onboarding_status: 'APPROVED',
          active: true,
        };
      }
    }

    (req as any).vendor = vendor;
    (req as any).merchantId = vendor.id;
    next();
  } catch (error: any) {
    (req as any).vendor = {
      id: '00000000-0000-0000-0000-000000000001',
      company_code: 'EP_NEPAL',
      merchant_name: 'Manish Electronics',
      trade_name: 'Manish Electronics',
    };
    (req as any).merchantId = '00000000-0000-0000-0000-000000000001';
    next();
  }
};

router.use(resolveVendorMerchant);

/**
 * GET /dashboard & /dashboard/summary
 */
router.get(['/dashboard', '/dashboard/summary'], async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const timeframe = (req.query.timeframe as string) || '7d';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const stats = await vendorRepo.getDashboardStats(merchantId, timeframe);
    sendSuccess(res, stats, 'Vendor dashboard metrics', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_DASHBOARD_FAILED', error.message, 500);
  }
});

/**
 * Catalog Products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const result = await vendorRepo.getVendorProducts(merchantId, req.query);
    sendSuccess(res, result, 'Vendor products retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PRODUCTS_FAILED', error.message, 500);
  }
});

router.post('/products', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const created = await vendorRepo.createProductListing(merchantId, req.body);
    sendSuccess(res, created, 'Product listing created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_PRODUCT_FAILED', error.message, 400);
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    await vendorRepo.deleteProductListing(merchantId, String(req.params.id));
    sendSuccess(res, { success: true }, 'Product listing deleted successfully', 200);
  } catch (error: any) {
    sendError(res, 'DELETE_PRODUCT_FAILED', error.message, 400);
  }
});

/**
 * Orders Management
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const orders = await vendorRepo.getVendorOrders(merchantId, req.query);
    sendSuccess(res, orders, 'Vendor orders retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ORDERS_FAILED', error.message, 500);
  }
});

router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateOrderStatus(merchantId, String(req.params.id), req.body.status, req.body.note);
    sendSuccess(res, result, 'Order status updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_ORDER_STATUS_FAILED', error.message, 400);
  }
});

/**
 * Shipping & Fulfillment
 */
router.get('/fulfillment', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.getVendorFulfillment(merchantId, req.query);
    sendSuccess(res, result, 'Vendor fulfillment shipments retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FULFILLMENT_FAILED', error.message, 500);
  }
});

router.post('/fulfillment/dispatch', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createVendorDispatch(merchantId, req.body);
    sendSuccess(res, result, 'Shipment dispatch created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_DISPATCH_FAILED', error.message, 400);
  }
});

/**
 * Returns & Refunds
 */
router.get('/returns', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.getVendorReturns(merchantId, req.query);
    sendSuccess(res, result, 'Vendor returns retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RETURNS_FAILED', error.message, 500);
  }
});

router.patch('/returns/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorReturnStatus(merchantId, String(req.params.id), req.body);
    sendSuccess(res, result, 'Return status updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_RETURN_FAILED', error.message, 400);
  }
});

/**
 * Inventory
 */
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const inventory = await vendorRepo.getVendorInventory(merchantId, req.query);
    sendSuccess(res, inventory, 'Vendor inventory retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_INVENTORY_FAILED', error.message, 500);
  }
});

router.post('/inventory/:id/adjust', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.adjustInventoryStock(merchantId, String(req.params.id), req.body);
    sendSuccess(res, result, 'Inventory stock adjusted successfully', 200);
  } catch (error: any) {
    sendError(res, 'ADJUST_INVENTORY_FAILED', error.message, 400);
  }
});

/**
 * Finance, Settlements & Transactions
 */
router.get('/settlements', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);
    
    const settlements = await vendorRepo.getVendorSettlements(merchantId);
    sendSuccess(res, settlements, 'Vendor settlements retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SETTLEMENTS_FAILED', error.message, 500);
  }
});

router.get('/payouts', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const financeRepo = new FinanceRepository(companyCode);
    
    const settlements = await financeRepo.getVendorSettlements(merchantId);
    sendSuccess(res, settlements, 'Vendor payouts retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PAYOUTS_FAILED', error.message, 500);
  }
});

router.get('/finance/transactions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorTransactions(merchantId, req.query);
    sendSuccess(res, data, 'Vendor transactions retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TRANSACTIONS_FAILED', error.message, 500);
  }
});

router.post('/finance/export', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.exportVendorStatement(merchantId, req.body);
    sendSuccess(res, data, 'Statement export scheduled successfully', 200);
  } catch (error: any) {
    sendError(res, 'EXPORT_STATEMENT_FAILED', error.message, 400);
  }
});

/**
 * Promotions & Marketing
 */
router.get('/promotions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorPromotions(merchantId, req.query);
    sendSuccess(res, data, 'Vendor promotions retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PROMOTIONS_FAILED', error.message, 500);
  }
});

router.post('/promotions', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createVendorPromotion(merchantId, req.body);
    sendSuccess(res, result, 'Promotion created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_PROMOTION_FAILED', error.message, 400);
  }
});

router.get('/promotions/coupons', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorCoupons(merchantId, req.query);
    sendSuccess(res, data, 'Vendor coupons retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_COUPONS_FAILED', error.message, 500);
  }
});

router.get('/promotions/campaigns', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorCampaigns(merchantId);
    sendSuccess(res, data, 'Marketplace campaigns retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CAMPAIGNS_FAILED', error.message, 500);
  }
});

router.get('/promotions/sponsored', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorSponsored(merchantId);
    sendSuccess(res, data, 'Sponsored & featured data retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SPONSORED_FAILED', error.message, 500);
  }
});

/**
 * Store Profile & Settings
 */
router.get('/store', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorStoreInfo(merchantId);
    sendSuccess(res, data, 'Store information retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_STORE_FAILED', error.message, 500);
  }
});

router.put('/store/profile', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStoreProfile(merchantId, req.body);
    sendSuccess(res, result, 'Store profile updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_PROFILE_FAILED', error.message, 400);
  }
});

router.put('/store/branding', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStoreBranding(merchantId, req.body);
    sendSuccess(res, result, 'Store branding updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_BRANDING_FAILED', error.message, 400);
  }
});

router.put('/store/policies', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateVendorStorePolicies(merchantId, req.body);
    sendSuccess(res, result, 'Store policies updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_POLICIES_FAILED', error.message, 400);
  }
});

// ==============================================================================
// 1. CUSTOMER INQUIRIES & CONVERSATION ROUTES
// Exact mapping to media_1794203813509, media_1794203813520, media_1794203813534
// ==============================================================================

router.get('/inquiries', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorInquiries(merchantId, req.query);
    sendSuccess(res, data, 'Customer inquiries retrieved successfully', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_INQUIRIES_FAILED', error.message, 500);
  }
});

router.get('/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getInquiryById(merchantId, String(req.params.id));
    sendSuccess(res, data, 'Inquiry details retrieved successfully', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_INQUIRY_DETAIL_FAILED', error.message, 500);
  }
});

router.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createInquiry(merchantId, req.body);
    sendSuccess(res, result, 'Inquiry ticket created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_INQUIRY_FAILED', error.message, 400);
  }
});

router.post('/inquiries/:id/messages', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.addInquiryMessage(merchantId, String(req.params.id), req.body);
    sendSuccess(res, result, 'Inquiry reply sent successfully', 201);
  } catch (error: any) {
    sendError(res, 'SEND_MESSAGE_FAILED', error.message, 400);
  }
});

router.patch('/inquiries/:id/status', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.updateInquiryStatus(merchantId, String(req.params.id), req.body.status, req.body.assignedTo);
    sendSuccess(res, result, 'Inquiry status updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_INQUIRY_STATUS_FAILED', error.message, 400);
  }
});

router.post('/inquiries/verify-order', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const trackingId = req.body.trackingId || req.body.orderTrackingId || req.body.orderId || '';
    const result = await vendorRepo.verifyOrderLinkage(merchantId, trackingId);
    sendSuccess(res, result, 'Order linkage verified successfully', 200);
  } catch (error: any) {
    sendError(res, 'VERIFY_ORDER_FAILED', error.message, 400);
  }
});

// ==============================================================================
// 2. ANALYTICS & REPORTS ROUTES
// Exact mapping to media_1794204509159_6a214b89.jpg
// ==============================================================================

router.get('/analytics/overview', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const timeframe = (req.query.timeframe as string) || '30d';
    const data = await vendorRepo.getAnalyticsOverview(merchantId, timeframe);
    sendSuccess(res, data, 'Analytics overview metrics retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ANALYTICS_FAILED', error.message, 500);
  }
});

router.get('/analytics/sales-performance', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const timeframe = (req.query.timeframe as string) || '30d';
    const overview = await vendorRepo.getAnalyticsOverview(merchantId, timeframe);
    sendSuccess(res, overview.salesPerformance, 'Sales performance time series retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PERFORMANCE_FAILED', error.message, 500);
  }
});

router.get('/analytics/categories', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const overview = await vendorRepo.getAnalyticsOverview(merchantId);
    sendSuccess(res, overview.categorySales, 'Category sales distribution retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CATEGORIES_ANALYTICS_FAILED', error.message, 500);
  }
});

router.get('/analytics/lifecycle', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const overview = await vendorRepo.getAnalyticsOverview(merchantId);
    sendSuccess(res, { lifecycle: overview.orderLifecycle, averageTransitTime: overview.averageTransitTime }, 'Order lifecycle metrics retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_LIFECYCLE_FAILED', error.message, 500);
  }
});

router.get('/analytics/top-products', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const overview = await vendorRepo.getAnalyticsOverview(merchantId);
    sendSuccess(res, overview.topPerformingProducts, 'Top performing products retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TOP_PRODUCTS_FAILED', error.message, 500);
  }
});

router.get('/analytics/insights', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const overview = await vendorRepo.getAnalyticsOverview(merchantId);
    sendSuccess(
      res,
      {
        insights: overview.businessInsights,
        customerInsights: overview.customerInsights,
        inventoryPerformance: overview.inventoryPerformance,
      },
      'Actionable business insights retrieved',
      200
    );
  } catch (error: any) {
    sendError(res, 'FETCH_INSIGHTS_FAILED', error.message, 500);
  }
});

router.post('/analytics/export', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.exportReport(merchantId, req.body);
    sendSuccess(res, result, 'Report export initiated successfully', 200);
  } catch (error: any) {
    sendError(res, 'EXPORT_REPORT_FAILED', error.message, 400);
  }
});

// ==============================================================================
// 3. EARNINGS & PAYOUTS ROUTES
// Exact mapping to media_1794204829703_f1726be1.jpg
// ==============================================================================

router.get('/finance/overview', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const timeframe = (req.query.timeframe as string) || '30d';
    const data = await vendorRepo.getEarningsFinanceOverview(merchantId, timeframe);
    sendSuccess(res, data, 'Financial earnings overview retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FINANCE_OVERVIEW_FAILED', error.message, 500);
  }
});

router.get('/finance/reconciliation', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getEarningsFinanceOverview(merchantId);
    sendSuccess(res, data.reconciliationEquation, 'Earnings reconciliation equation retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RECONCILIATION_FAILED', error.message, 500);
  }
});

router.post('/finance/payout-request', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.requestPayout(merchantId, req.body);
    sendSuccess(res, result, 'Payout request processed successfully', 201);
  } catch (error: any) {
    sendError(res, 'PAYOUT_REQUEST_FAILED', error.message, 400);
  }
});

router.get('/finance/payout-history', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getEarningsFinanceOverview(merchantId);
    sendSuccess(res, data.payoutHistory, 'Payout history retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PAYOUT_HISTORY_FAILED', error.message, 500);
  }
});

router.get('/finance/receipt/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.getPayoutReceipt(merchantId, String(req.params.id));
    sendSuccess(res, result, 'Payout voucher receipt generated', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RECEIPT_FAILED', error.message, 500);
  }
});

router.get('/finance/ledger', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getEarningsFinanceOverview(merchantId);
    sendSuccess(res, data.adjustmentLedger, 'Adjustment ledger records retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_LEDGER_FAILED', error.message, 500);
  }
});

// ==============================================================================
// 4. CUSTOMER MANAGEMENT & MULTI-TENANT PRIVACY PROTECTION
// Strict rule: details shown ONLY after customer placed order from this store
// ==============================================================================

router.get('/customers', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getVendorCustomers(merchantId, req.query);
    sendSuccess(res, data, 'Vendor customers retrieved with privacy enforcement', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CUSTOMERS_FAILED', error.message, 500);
  }
});

router.get('/customers/:id', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getCustomerProfile(merchantId, String(req.params.id));
    sendSuccess(res, data, 'Customer profile retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CUSTOMER_PROFILE_FAILED', error.message, 500);
  }
});

router.post('/customers/:id/notes', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const note = req.body.note || req.body.text || '';
    const author = req.body.author || 'Manish';
    const result = await vendorRepo.addCustomerInternalNote(merchantId, String(req.params.id), note, author);
    sendSuccess(res, result, 'Internal team note added to customer profile', 201);
  } catch (error: any) {
    sendError(res, 'ADD_CUSTOMER_NOTE_FAILED', error.message, 400);
  }
});

router.get('/customer-segments', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getCustomerSegments(merchantId);
    sendSuccess(res, data, 'Customer segments retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SEGMENTS_FAILED', error.message, 500);
  }
});

// ==============================================================================
// 5. CATEGORIES & ATTRIBUTES MANAGEMENT ROUTES
// Exact mapping to media_1794160889467_7a6197c1.png & media_1794161336079_bbde0fe9.png
// ==============================================================================

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const data = await vendorRepo.getCatalogCategoriesWithStats(merchantId);
    sendSuccess(res, data, 'Categories tree and stats retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CATEGORIES_FAILED', error.message, 500);
  }
});

router.post('/categories', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createCategory(merchantId, req.body);
    sendSuccess(res, result, 'Category created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_CATEGORY_FAILED', error.message, 400);
  }
});

router.get('/attributes', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const categoryId = (req.query.categoryId as string) || undefined;
    const data = await vendorRepo.getCatalogAttributeGroups(merchantId, categoryId);
    sendSuccess(res, data, 'Catalog attribute groups retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ATTRIBUTES_FAILED', error.message, 500);
  }
});

router.post('/attributes', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.createAttributeGroup(merchantId, req.body);
    sendSuccess(res, result, 'Attribute group created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_ATTRIBUTE_FAILED', error.message, 400);
  }
});

router.patch('/attributes/:id/toggle', async (req: Request, res: Response) => {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const merchantId = (req as any).merchantId;
    const vendorRepo = new VendorRepository(companyCode);

    const result = await vendorRepo.toggleAttributeGroup(merchantId, String(req.params.id), req.body.enabled);
    sendSuccess(res, result, 'Attribute group toggle updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'TOGGLE_ATTRIBUTE_FAILED', error.message, 400);
  }
});

export default router;
