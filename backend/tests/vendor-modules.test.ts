// ==============================================================================
// EVEREST PASAL - VENDOR MODULES TEST SUITE
// Unit & Integration tests for:
// 1. Customer Inquiries & Conversations
// 2. Analytics & Reports
// 3. Earnings & Payouts (IRD Section 89 Compliance)
// 4. Customer Directory & Multi-Tenant Store Privacy Enforcement
// 5. Catalog Categories & Attributes Management
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { VendorRepository } from '../src/repositories/vendor.repository.js';

describe('Vendor Modules Backend Architecture', () => {
  const repo = new VendorRepository('EP_NEPAL');
  const merchantId = 'a0000000-0000-0000-0000-000000000001';

  // 1. Customer Inquiries & Conversations
  describe('Inquiries & Conversations Domain', () => {
    it('should retrieve inquiries list with metrics and status breakdown', async () => {
      const res = await repo.getVendorInquiries(merchantId, { status: 'ALL' });
      expect(res).toBeDefined();
      expect(res.metrics).toBeDefined();
      expect(res.metrics.totalInquiries).toBe(156);
      expect(res.metrics.open).toBe(42);
      expect(res.metrics.awaitingReply).toBe(8);
      expect(res.metrics.inProgress).toBe(14);
      expect(res.metrics.resolved).toBe(92);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].ticketId).toBe('#TKT-2024001');
    });

    it('should retrieve full inquiry details with message history and route tracking', async () => {
      const detail = await repo.getInquiryById(merchantId, 'inq-1');
      expect(detail).toBeDefined();
      expect(detail.ticket).toBeDefined();
      expect(detail.ticket.ticketId).toBe('#TKT-2024001');
      expect(detail.messages.length).toBeGreaterThanOrEqual(5);
      expect(detail.relatedOrderDetails.trackingStatus).toBe('IN TRANSIT');
      expect(detail.relatedOrderDetails.fulfillmentRoute.length).toBe(3);
    });

    it('should create a new inquiry ticket with SLA and routing', async () => {
      const created = await repo.createInquiry(merchantId, {
        customerName: 'Aaradhya Shrestha',
        customerEmail: 'aaradhya@example.com',
        customerPhone: '+977 9841234567',
        subject: 'Delayed Delivery – Order #EP-02408 (Lalitpur Hub Transit)',
        category: 'Shipping & Delivery',
        priority: 'High',
        orderTrackingId: 'EP-02408',
        statement: 'Package stranded at Lalitpur hub for 48 hours.',
      });
      expect(created.success).toBe(true);
      expect(created.ticket.ticketId).toMatch(/^#TKT-/);
      expect(created.ticket.priority).toBe('High');
    });

    it('should verify order linkage and buyer identity', async () => {
      const verified = await repo.verifyOrderLinkage(merchantId, 'EP-02408');
      expect(verified.verified).toBe(true);
      expect(verified.orderTrackingId).toBe('#EP-02408');
      expect(verified.customer.name).toBe('Aaradhya Shrestha');
      expect(verified.fulfillment.currentHub).toBe('Lalitpur Hub');
    });

    it('should append a customer reply and internal staff note', async () => {
      const reply = await repo.addInquiryMessage(merchantId, 'inq-1', {
        body: 'Courier partner has dispatched package with rider Ram.',
        isInternal: false,
      });
      expect(reply.success).toBe(true);
      expect(reply.message.isInternal).toBe(false);
      expect(reply.updatedStatus).toBe('Awaiting Reply');

      const internalNote = await repo.addInquiryMessage(merchantId, 'inq-1', {
        body: 'Internal note: Follow up with Lalitpur hub lead at 4 PM.',
        isInternal: true,
      });
      expect(internalNote.success).toBe(true);
      expect(internalNote.message.isInternal).toBe(true);
      expect(internalNote.updatedStatus).toBe('In Progress');
    });
  });

  // 2. Analytics & Reports
  describe('Analytics & Reports Domain', () => {
    it('should compute 6 financial overview KPIs with festival peak annotations', async () => {
      const analytics = await repo.getAnalyticsOverview(merchantId, '30d');
      expect(analytics.kpis.totalSales.value).toBe(1842650);
      expect(analytics.kpis.totalOrders.value).toBe(1428);
      expect(analytics.kpis.avgOrderValue.value).toBe(1280);
      expect(analytics.kpis.grossProfit.value).toBe(468200);
      expect(analytics.kpis.netMargin.value).toBe(392150);
      expect(analytics.kpis.salesGrowth.value).toBe(14.8);
      expect(analytics.salesPerformance.festivePeak.salesAmount).toBe(53400);
    });

    it('should generate sales by category donut and order lifecycle', async () => {
      const analytics = await repo.getAnalyticsOverview(merchantId, '30d');
      expect(analytics.categorySales.length).toBe(4);
      const topCat = analytics.categorySales[0];
      expect(topCat.name).toBe('Consumer Electronics');
      expect(topCat.percentage).toBe(41);

      expect(analytics.orderLifecycle.length).toBe(5);
      expect(analytics.orderLifecycle[0].status).toBe('Delivered & Settled');
      expect(analytics.orderLifecycle[0].percentage).toBe(82.6);
    });

    it('should rank top performing products and surface actionable insights', async () => {
      const analytics = await repo.getAnalyticsOverview(merchantId, '30d');
      expect(analytics.topPerformingProducts.length).toBe(5);
      expect(analytics.topPerformingProducts[0].rank).toBe(1);
      expect(analytics.topPerformingProducts[0].sku).toBe('EP-TV-SAM-43');
      expect(analytics.businessInsights.length).toBe(4);
      expect(analytics.inventoryPerformance.formattedValuation).toBe('NPR 4.12M');
    });

    it('should initiate report export jobs for CSV and PDF formats', async () => {
      const exportJob = await repo.exportReport(merchantId, { reportType: 'sales-report', format: 'csv' });
      expect(exportJob.success).toBe(true);
      expect(exportJob.downloadUrl).toContain('.csv');
      expect(exportJob.fileName).toContain('sales-report');
    });
  });

  // 3. Earnings & Payouts (IRD Nepal Section 89 Compliance)
  describe('Earnings & Payouts Domain', () => {
    it('should balance the 5-step earnings reconciliation equation exactly', async () => {
      const finance = await repo.getEarningsFinanceOverview(merchantId, '30d');
      const eq = finance.reconciliationEquation;
      expect(eq.taxReference).toBe('IRD Nepal Section 89');

      // Gross Sales + Discounts + Platform Fee + TDS == Net Vendor Pool
      const computedNet = eq.grossSales + eq.discountsAndReturns + eq.platformFeeAmount + eq.withholdingTdsAmount;
      expect(computedNet).toBe(eq.netVendorPool);
      expect(eq.netVendorPool).toBe(1652820);
    });

    it('should validate minimum payout threshold (NPR 1,000) and initiate payout', async () => {
      await expect(repo.requestPayout(merchantId, { amount: 500 })).rejects.toThrow('Minimum payout threshold');

      const validPayout = await repo.requestPayout(merchantId, { amount: 284500 });
      expect(validPayout.success).toBe(true);
      expect(validPayout.payout.payoutId).toMatch(/^#PO-/);
      expect(validPayout.payout.bankRefUtr).toMatch(/^NCHL/);
      expect(validPayout.payout.paymentMethod).toBe('NCHL-IPS Direct');
    });

    it('should generate official payout receipt voucher with IRD tax withholding details', async () => {
      const voucher = await repo.getPayoutReceipt(merchantId, '#PO-9842');
      expect(voucher.success).toBe(true);
      expect(voucher.receipt.payoutId).toBe('#PO-9842');
      expect(voucher.receipt.recipient.bank).toBe('Nabil Bank Limited');
      expect(voucher.receipt.taxWithholding.tdsRate).toBe('1.5%');
    });

    it('should provide granular line-item adjustment ledger with transaction types', async () => {
      const finance = await repo.getEarningsFinanceOverview(merchantId, '30d');
      expect(finance.adjustmentLedger.length).toBeGreaterThan(0);
      const firstEntry = finance.adjustmentLedger[0];
      expect(firstEntry.txnId).toBe('#TXN-8814');
      expect(firstEntry.relatedOrder).toBe('#EP-02408');
      expect(firstEntry.status).toBe('Holding (7d)');
    });
  });

  // 4. Customer Management & Multi-Tenant Store Privacy
  describe('Customer Management & Store Privacy Enforcement', () => {
    it('should mask customer contact details when customer has 0 orders with this store', async () => {
      const res = await repo.getVendorCustomers(merchantId);
      expect(res.customers.length).toBeGreaterThan(0);

      // Verified customer with orders
      const verifiedCust = res.customers.find((c: any) => c.ordersCount > 0);
      expect(verifiedCust.isMasked).toBe(false);
      expect(verifiedCust.email).not.toContain('****');
      expect(verifiedCust.phone).not.toContain('****');

      // Unordered prospect customer
      const prospectCust = res.customers.find((c: any) => c.ordersCount === 0);
      expect(prospectCust).toBeDefined();
      expect(prospectCust.isMasked).toBe(true);
      expect(prospectCust.email).toContain('****');
      expect(prospectCust.phone).toContain('****');
    });

    it('should strictly redact full profile when customer has 0 store orders', async () => {
      // Customer with orders -> full profile
      const fullProfile = await repo.getCustomerProfile(merchantId, 'cust-1');
      expect(fullProfile.hasStoreOrders).toBe(true);
      expect(fullProfile.isProtected).toBe(false);
      expect(fullProfile.metrics.lifetimeOrders).toBe(12);
      expect(fullProfile.recentOrders.length).toBe(3);
      expect(fullProfile.defaultAddress.street).toContain('Boudha, Kathmandu');

      // Customer without orders -> protected view
      const protectedProfile = await repo.getCustomerProfile(merchantId, 'cust-5');
      expect(protectedProfile.hasStoreOrders).toBe(false);
      expect(protectedProfile.isProtected).toBe(true);
      expect(protectedProfile.privacyNotice).toBeDefined();
      expect(protectedProfile.orders.length).toBe(0);
      expect(protectedProfile.timeline.length).toBe(0);
    });

    it('should allow adding private internal team notes for store customer', async () => {
      const noteRes = await repo.addCustomerInternalNote(
        merchantId,
        'cust-1',
        'Customer requested phone confirmation prior to shipping.',
        'Manish'
      );
      expect(noteRes.success).toBe(true);
      expect(noteRes.note.author).toBe('Manish');
      expect(noteRes.note.text).toBe('Customer requested phone confirmation prior to shipping.');
    });
  });

  // 5. Catalog Categories & Attributes
  describe('Catalog Categories & Attributes Domain', () => {
    it('should retrieve category hierarchy with stats and consistency notices', async () => {
      const catalog = await repo.getCatalogCategoriesWithStats(merchantId);
      expect(catalog.metrics.totalCategories).toBe(18);
      expect(catalog.metrics.activeCategories).toBe(16);
      expect(catalog.metrics.attributeGroups).toBe(12);
      expect(catalog.consistencyNotice.title).toBe('Keep product details consistent');
      expect(catalog.categories.length).toBeGreaterThan(0);
    });

    it('should retrieve attribute groups and allow toggling On/Off switch', async () => {
      const attrs = await repo.getCatalogAttributeGroups(merchantId, 'cat-1');
      expect(attrs.selectedCategory.name).toBe('Food & Pantry');
      expect(attrs.attributeGroups.length).toBe(4);
      expect(attrs.attributeGroups[0].name).toBe('Flavor Profile');

      const toggleRes = await repo.toggleAttributeGroup(merchantId, 'flavorProfile', false);
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.enabled).toBe(false);
    });

    it('should create new category and attribute group', async () => {
      const cat = await repo.createCategory(merchantId, {
        name: 'Organic Teas & Herbs',
        description: 'Authentic high-altitude Ilam orthodox teas and Himalayan botanicals.',
      });
      expect(cat.success).toBe(true);
      expect(cat.category.slug).toBe('organic-teas-herbs');

      const attr = await repo.createAttributeGroup(merchantId, {
        name: 'Brewing Temperature',
        requirement: 'Required',
        options: ['80°C Gentle', '90°C Medium', '100°C Rolling Boil'],
      });
      expect(attr.success).toBe(true);
      expect(attr.attributeGroup.valuesCount).toBe(3);
    });
  });
});

