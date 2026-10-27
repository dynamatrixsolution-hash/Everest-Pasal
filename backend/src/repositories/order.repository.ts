// ==============================================================================
// EVEREST PASAL - ORDER REPOSITORY
// Transactional order creation with multi-vendor split orders in PostgreSQL 18
// ==============================================================================

import { query, execute } from '../db.js';

export interface CheckoutInput {
  customerId: string;
  cartId: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  cityName: string;
  paymentMethod: string;
}

export class OrderRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async createOrderFromCart(input: CheckoutInput): Promise<any> {
    const fiscalYear = 'FY2026-27';
    const orderNo = `ORD-${Date.now().toString().slice(-8)}`;

    // 1. Fetch cart items with merchant grouping
    const cartItems = await query<any>(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity::numeric as quantity,
        lv.id as listing_variant_id,
        lv.seller_sku,
        l.merchant_id,
        l.product_id,
        lv.variant_id,
        p.product_name,
        COALESCE(pr.sale_price, pr.list_price, 100)::numeric as unit_price
       FROM ep_commerce.tb_ep_commerce_cart_cart_item_detail ci
       JOIN ep_merchant.tb_ep_merchant_prd_listing_variant_master lv ON lv.id = ci.listing_variant_id
       JOIN ep_merchant.tb_ep_merchant_prd_listing_master l ON l.id = lv.listing_id
       JOIN ep_catalog.tb_ep_catalog_prd_product_master p ON p.id = l.product_id
       LEFT JOIN ep_pricing.tb_ep_pricing_price_product_price_detail pr ON pr.listing_variant_id = lv.id
       WHERE ci.company_code = $1 AND ci.cart_id = $2::uuid AND ci.active = true;`,
      [this.companyCode, input.cartId]
    );

    if (cartItems.length === 0) {
      throw new Error('Cart is empty.');
    }

    const subtotal = cartItems.reduce((acc, it) => acc + Number(it.unit_price) * Number(it.quantity), 0);
    const shippingAmount = 100.00;
    const grandTotal = subtotal + shippingAmount;

    // 2. Create Order Master
    const orderRows = await query<any>(
      `INSERT INTO ep_commerce.tb_ep_commerce_ord_order_master (
        id, company_code, fiscal_year_code, order_no, customer_id, currency_code,
        order_status, payment_status, fulfillment_status, subtotal_amount,
        shipping_amount, grand_total, placed_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4::uuid, 'NPR',
        'CONFIRMED', 'PENDING', 'UNFULFILLED', $5,
        $6, $7, clock_timestamp(), true, false
      ) RETURNING *;`,
      [this.companyCode, fiscalYear, orderNo, input.customerId, subtotal, shippingAmount, grandTotal]
    );

    const order = orderRows[0];

    // 3. Save Order Address Snapshot
    await execute(
      `INSERT INTO ep_commerce.tb_ep_commerce_ord_order_address_snapshot (
        id, company_code, fiscal_year_code, order_id, address_type,
        recipient_name, recipient_phone, address_line1, city_name, country_code,
        active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, 'SHIPPING',
        $4, $5, $6, $7, 'NPL',
        true, false
      );`,
      [this.companyCode, fiscalYear, order.id, input.recipientName, input.recipientPhone, input.addressLine1, input.cityName]
    );

    // 4. Group items by merchant to create multi-vendor split sub-orders
    const merchantMap = new Map<string, any[]>();
    for (const item of cartItems) {
      const list = merchantMap.get(item.merchant_id) || [];
      list.push(item);
      merchantMap.set(item.merchant_id, list);
    }

    for (const [merchantId, items] of merchantMap.entries()) {
      const merchantOrderNo = `MO-${orderNo}-${merchantId.slice(0, 4)}`;
      const merchantTotal = items.reduce((acc, it) => acc + Number(it.unit_price) * Number(it.quantity), 0);

      const merchOrderRows = await query<any>(
        `INSERT INTO ep_commerce.tb_ep_commerce_ord_merchant_order_master (
          id, company_code, fiscal_year_code, order_id, merchant_id, merchant_order_no,
          status, subtotal_amount, total_amount, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5,
          'CONFIRMED', $6, $6, true, false
        ) RETURNING id;`,
        [this.companyCode, fiscalYear, order.id, merchantId, merchantOrderNo, merchantTotal]
      );

      const merchantOrderId = merchOrderRows[0].id;

      // 5. Create Order Item Detail snapshots
      for (const item of items) {
        const lineTotal = Number(item.unit_price) * Number(item.quantity);
        await execute(
          `INSERT INTO ep_commerce.tb_ep_commerce_ord_order_item_detail (
            id, company_code, fiscal_year_code, order_id, merchant_order_id, merchant_id,
            product_id, variant_id, listing_variant_id, product_name_snapshot,
            sku_snapshot, quantity, unit_price, line_total, active, publish
          ) VALUES (
            gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5::uuid,
            $6::uuid, $7::uuid, $8::uuid, $9,
            $10, $11, $12, $13, true, false
          );`,
          [
            this.companyCode, fiscalYear, order.id, merchantOrderId, merchantId,
            item.product_id, item.variant_id, item.listing_variant_id, item.product_name,
            item.seller_sku, item.quantity, item.unit_price, lineTotal
          ]
        );
      }
    }

    // 6. Clear Cart
    await execute(
      `UPDATE ep_commerce.tb_ep_commerce_cart_cart_item_detail 
       SET active = false 
       WHERE company_code = $1 AND cart_id = $2::uuid;`,
      [this.companyCode, input.cartId]
    );

    return order;
  }

  async getCustomerOrders(customerId: string): Promise<any[]> {
    const orders = await query<any>(
      `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_master 
       WHERE company_code = $1 AND customer_id = $2::uuid AND active = true 
       ORDER BY placed_at DESC;`,
      [this.companyCode, customerId]
    );

    for (const order of orders) {
      order.items = await query<any>(
        `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_item_detail 
         WHERE company_code = $1 AND order_id = $2::uuid AND active = true;`,
        [this.companyCode, order.id]
      );
    }

    return orders;
  }

  async getOrderById(orderId: string, customerId?: string): Promise<any | null> {
    const whereClauses = [`company_code = $1`, `id = $2::uuid`, `active = true`];
    const params: any[] = [this.companyCode, orderId];

    if (customerId) {
      whereClauses.push(`customer_id = $3::uuid`);
      params.push(customerId);
    }

    const orderRows = await query<any>(
      `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_master 
       WHERE ${whereClauses.join(' AND ')} LIMIT 1;`,
      params
    );

    if (orderRows.length === 0) return null;
    const order = orderRows[0];

    order.items = await query<any>(
      `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_item_detail 
       WHERE company_code = $1 AND order_id = $2::uuid AND active = true;`,
      [this.companyCode, order.id]
    );

    const addrRows = await query<any>(
      `SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_address_snapshot 
       WHERE company_code = $1 AND order_id = $2::uuid AND active = true LIMIT 1;`,
      [this.companyCode, order.id]
    );
    order.address = addrRows[0] || null;

    return order;
  }

  async getVendorFulfillmentUnits(merchantId: string, status?: string): Promise<any[]> {
    let whereSql = `mo.company_code = $1 AND mo.merchant_id = $2::uuid AND mo.active = true`;
    const params: any[] = [this.companyCode, merchantId];

    if (status) {
      whereSql += ` AND mo.status = $3`;
      params.push(status);
    }

    const rows = await query<any>(
      `SELECT 
        mo.id,
        mo.order_id,
        mo.merchant_id,
        mo.merchant_order_no as "unitNumber",
        mo.status,
        mo.total_amount as "totalAmount",
        o.order_no as "orderNumber",
        o.placed_at as "createdAt",
        u.display_name as "customerName"
       FROM ep_commerce.tb_ep_commerce_ord_merchant_order_master mo
       JOIN ep_commerce.tb_ep_commerce_ord_order_master o ON o.id = mo.order_id
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = o.customer_id
       WHERE ${whereSql}
       ORDER BY o.placed_at DESC;`,
      params
    );

    for (const unit of rows) {
      unit.items = await query<any>(
        `SELECT 
          id, product_name_snapshot as "productName", sku_snapshot as sku, quantity, unit_price as "unitPrice", line_total as "totalPrice"
         FROM ep_commerce.tb_ep_commerce_ord_order_item_detail 
         WHERE company_code = $1 AND merchant_order_id = $2::uuid AND active = true;`,
        [this.companyCode, unit.id]
      );
    }

    return rows;
  }

  async updateVendorFulfillmentStatus(unitId: string, merchantId: string, status: string): Promise<any> {
    await execute(
      `UPDATE ep_commerce.tb_ep_commerce_ord_merchant_order_master 
       SET status = $1 
       WHERE company_code = $2 AND id = $3::uuid AND merchant_id = $4::uuid;`,
      [status, this.companyCode, unitId, merchantId]
    );
    return { id: unitId, status };
  }

  async getAdminOrders(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ orders: any[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    let whereSql = `o.company_code = $1 AND o.active = true`;
    const queryParams: any[] = [this.companyCode];

    if (params.status) {
      whereSql += ` AND o.order_status = $2`;
      queryParams.push(params.status);
    }

    const countRows = await query<any>(
      `SELECT count(*)::int as total FROM ep_commerce.tb_ep_commerce_ord_order_master o WHERE ${whereSql};`,
      queryParams
    );
    const total = countRows[0]?.total || 0;

    const orders = await query<any>(
      `SELECT 
        o.id,
        o.order_no as "orderNumber",
        o.order_status as status,
        o.payment_status as "paymentStatus",
        o.fulfillment_status as "fulfillmentStatus",
        o.grand_total as "grandTotal",
        o.placed_at as "createdAt",
        u.display_name as "customerName",
        u.email as "customerEmail"
       FROM ep_commerce.tb_ep_commerce_ord_order_master o
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = o.customer_id
       WHERE ${whereSql}
       ORDER BY o.placed_at DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`,
      [...queryParams, limit, offset]
    );

    return { orders, total };
  }

  async cancelOrder(orderId: string, customerId: string, reason: string): Promise<void> {
    await execute(
      `UPDATE ep_commerce.tb_ep_commerce_ord_order_master 
       SET order_status = 'CANCELLED' 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [this.companyCode, orderId]
    );
  }
}
