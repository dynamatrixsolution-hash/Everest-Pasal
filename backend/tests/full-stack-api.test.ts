// ==============================================================================
// EVEREST PASAL - FULL-STACK INTEGRATION TEST SUITE
// Automated verification of 183-table database, auth, catalog, cart, checkout, vendor & admin
// ==============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { query } from '../src/db.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { catalogService } from '../src/modules/catalog/catalog.service.js';
import { cartService } from '../src/modules/cart/cart.service.js';
import { orderService } from '../src/modules/orders/order.service.js';
import { adminService } from '../src/modules/admin/admin.service.js';

describe('Everest Pasal 183-Table Full-Stack System Verification', () => {
  let customerUser: any;
  let customerSessionToken: string;
  let adminUser: any;
  let adminSessionToken: string;
  let vendorUser: any;
  let vendorSessionToken: string;

  beforeAll(async () => {
    // 1. Authenticate Seeded Super Admin
    const adminLogin = await authService.login({
      identifier: 'admin@everestpasal.com',
      password: 'Password@123',
    });
    adminUser = adminLogin.account;
    adminSessionToken = adminLogin.session.token;

    // 2. Authenticate Seeded Vendor
    const vendorLogin = await authService.login({
      identifier: 'vendor@everestpasal.com',
      password: 'Password@123',
    });
    vendorUser = vendorLogin.account;
    vendorSessionToken = vendorLogin.session.token;

    // 3. Authenticate Seeded Customer
    const custLogin = await authService.login({
      identifier: 'customer@everestpasal.com',
      password: 'Password@123',
    });
    customerUser = custLogin.account;
    customerSessionToken = custLogin.session.token;
  });

  describe('1. 21-Schema / 183-Table Database Integrity', () => {
    it('should verify live PostgreSQL 18 with 21 schemas and all 183 tables', async () => {
      const schemas = await query<any>(
        `SELECT count(DISTINCT table_schema)::int as schema_count, count(*)::int as table_count 
         FROM information_schema.tables WHERE table_schema LIKE 'ep_%';`
      );
      expect(schemas[0].schema_count).toBe(21);
      expect(schemas[0].table_count).toBe(183);
    });

    it('should enforce CompanyCode architecture across operating entities', async () => {
      const companies = await query<any>(
        `SELECT company_code FROM ep_system.tb_ep_system_company_company_master WHERE company_code = 'EP_NEPAL';`
      );
      expect(companies.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Authentication & Session Layer', () => {
    it('should register a new customer into ep_identity and ep_customer', async () => {
      const uniqueEmail = `test.user.${Date.now()}@nepalmail.np`;
      const regResult = await authService.register({
        email: uniqueEmail,
        password: 'SecurePass@2026',
        fullName: 'Bikram Adhikari',
        role: 'CUSTOMER' as any,
      });

      expect(regResult.account.email).toBe(uniqueEmail);
      expect(regResult.session.token).toBeDefined();

      // Verify DB record in ep_identity and ep_customer
      const dbUser = await query<any>(
        `SELECT * FROM ep_identity.tb_ep_identity_user_user_master WHERE email = $1;`,
        [uniqueEmail]
      );
      expect(dbUser.length).toBe(1);
      expect(dbUser[0].user_type).toBe('CUSTOMER');

      const dbProfile = await query<any>(
        `SELECT * FROM ep_customer.tb_ep_customer_profile_customer_master WHERE user_id = $1::uuid;`,
        [dbUser[0].id]
      );
      expect(dbProfile.length).toBe(1);
      expect(dbProfile[0].first_name).toBe('Bikram Adhikari');
    });

    it('should validate customer session with Bearer token', async () => {
      const validated = await authService.validateSession(customerSessionToken);
      expect(validated).not.toBeNull();
      expect(validated?.email).toBe('customer@everestpasal.com');
    });

    it('should reject login with incorrect credentials', async () => {
      await expect(
        authService.login({
          identifier: 'customer@everestpasal.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow('Invalid credentials.');
    });
  });

  describe('3. Canonical Catalog & Search', () => {
    it('should list published products from ep_catalog', async () => {
      const result = await catalogService.listProducts({ page: 1, limit: 10 });
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);

      const sample = result.data[0];
      expect(sample.id).toBeDefined();
      expect(sample.name).toBeDefined();
      expect(sample.price).toBeGreaterThan(0);
    });

    it('should retrieve full product details with variants and media', async () => {
      const products = await catalogService.listProducts({ limit: 1 });
      const prdId = products.data[0].id;

      const details = await catalogService.getProductById(prdId);
      expect(details).not.toBeNull();
      expect(details.id).toBe(prdId);
      expect(details.variants.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve canonical categories from ep_catalog', async () => {
      const categories = await catalogService.listCategories();
      expect(categories.length).toBeGreaterThanOrEqual(6);
      expect(categories.some((c) => c.code === 'CAT_ELEC')).toBe(true);
    });
  });

  describe('4. Shopping Basket & Multi-Vendor Checkout Flow', () => {
    let activeCart: any;

    it('should add products to customer basket in ep_commerce', async () => {
      const products = await catalogService.listProducts({ limit: 2 });
      const firstProduct = products.data[0];

      activeCart = await cartService.addItem(customerUser.id, firstProduct.id, 2);
      expect(activeCart.items.length).toBeGreaterThanOrEqual(1);
      expect(activeCart.subtotal).toBeGreaterThan(0);
    });

    it('should update cart item quantity', async () => {
      const itemId = activeCart.items[0].id;
      const updated = await cartService.updateItemQuantity(customerUser.id, itemId, 3);
      const item = updated.items.find((it: any) => it.id === itemId);
      expect(item.quantity).toBe(3);
    });

    it('should execute transactional checkout and split into merchant orders', async () => {
      const order = await orderService.checkout(customerUser.id, `chk_test_${Date.now()}`, {
        recipientName: 'Aarav Sharma',
        recipientPhone: '9841000003',
        addressLine1: 'Baneshwor Height, Ward 10',
        cityName: 'Kathmandu',
        paymentGateway: 'COD',
      });

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD-/);
      expect(order.status).toBe('CONFIRMED');
      expect(order.grandTotal).toBeGreaterThan(0);

      // Verify multi-vendor split sub-orders in DB
      const subOrders = await query<any>(
        `SELECT * FROM ep_commerce.tb_ep_commerce_ord_merchant_order_master WHERE order_id = $1::uuid;`,
        [order.id]
      );
      expect(subOrders.length).toBeGreaterThanOrEqual(1);

      // Verify immutable line-item snapshots in DB
      const items = await query<any>(
        `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_item_detail WHERE order_id = $1::uuid;`,
        [order.id]
      );
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].product_name_snapshot).toBeDefined();
    });

    it('should list past customer orders', async () => {
      const myOrders = await orderService.getCustomerOrders(customerUser.id);
      expect(myOrders.length).toBeGreaterThanOrEqual(1);
      expect(myOrders[0].items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Vendor Seller Center Operations', () => {
    it('should list fulfillment units assigned to merchant in ep_commerce', async () => {
      const merchantRows = await query<any>(
        `SELECT id FROM ep_merchant.tb_ep_merchant_vendor_merchant_master WHERE merchant_code = 'MCH_EVEREST_DIRECT';`
      );
      const merchantId = merchantRows[0].id;

      const units = await orderService.getVendorFulfillmentUnits(merchantId);
      expect(Array.isArray(units)).toBe(true);
    });
  });

  describe('6. Admin Governance & Audit Logging', () => {
    it('should retrieve platform metrics and audit events from ep_audit', async () => {
      const metrics = await adminService.getPlatformMetrics();
      expect(metrics.metrics.totalProducts).toBeGreaterThanOrEqual(8);
      expect(metrics.metrics.totalVendors).toBeGreaterThanOrEqual(4);
      expect(metrics.recentEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should list merchants for compliance & approval in ep_merchant', async () => {
      const vendorList = await adminService.listVendors();
      expect(vendorList.vendors.length).toBeGreaterThanOrEqual(4);
      expect(vendorList.vendors.some((v: any) => v.status === 'APPROVED')).toBe(true);
    });

    it('should list customer directory from ep_customer', async () => {
      const custList = await adminService.listCustomers();
      expect(custList.customers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
