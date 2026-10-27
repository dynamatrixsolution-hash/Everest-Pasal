// ==============================================================================
// EVEREST PASAL - CART REPOSITORY
// Direct data access for ep_commerce shopping cart sessions in PostgreSQL 18
// ==============================================================================

import { query, execute } from '../db.js';

export interface CartItemRow {
  id: string;
  cart_id: string;
  listing_variant_id: string;
  quantity: number;
  unit_price_snapshot: number | null;
  product_name: string;
  seller_sku: string;
  price: number;
  image_url: string | null;
}

export class CartRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getOrCreateCart(customerId?: string, sessionKey?: string): Promise<any> {
    let cart: any = null;

    if (customerId) {
      const rows = await query<any>(
        `SELECT * FROM ep_commerce.tb_ep_commerce_cart_cart_master 
         WHERE company_code = $1 AND customer_id = $2::uuid AND active = true 
         ORDER BY created_at DESC LIMIT 1;`,
        [this.companyCode, customerId]
      );
      cart = rows[0];
    } else if (sessionKey) {
      const rows = await query<any>(
        `SELECT * FROM ep_commerce.tb_ep_commerce_cart_cart_master 
         WHERE company_code = $1 AND session_key = $2 AND active = true 
         ORDER BY created_at DESC LIMIT 1;`,
        [this.companyCode, sessionKey]
      );
      cart = rows[0];
    }

    if (!cart) {
      const newCartRows = await query<any>(
        `INSERT INTO ep_commerce.tb_ep_commerce_cart_cart_master (
          id, company_code, customer_id, session_key, currency_code, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3, 'NPR', true, false
        ) RETURNING *;`,
        [this.companyCode, customerId || null, sessionKey || null]
      );
      cart = newCartRows[0];
    }

    // Fetch cart items
    const items = await query<CartItemRow>(
      `SELECT 
        ci.id,
        ci.cart_id,
        ci.listing_variant_id,
        ci.quantity::numeric as quantity,
        ci.unit_price_snapshot,
        p.product_name,
        lv.seller_sku,
        COALESCE(pr.sale_price, pr.list_price, ci.unit_price_snapshot, 0)::numeric as price,
        (
          SELECT media_url 
          FROM ep_catalog.tb_ep_catalog_media_product_media_detail m 
          WHERE m.product_id = p.id AND m.active = true 
          ORDER BY m.is_primary DESC 
          LIMIT 1
        ) as primary_media_url
       FROM ep_commerce.tb_ep_commerce_cart_cart_item_detail ci
       JOIN ep_merchant.tb_ep_merchant_prd_listing_variant_master lv ON lv.id = ci.listing_variant_id
       JOIN ep_merchant.tb_ep_merchant_prd_listing_master l ON l.id = lv.listing_id
       JOIN ep_catalog.tb_ep_catalog_prd_product_master p ON p.id = l.product_id
       LEFT JOIN ep_pricing.tb_ep_pricing_price_product_price_detail pr ON pr.listing_variant_id = lv.id AND pr.active = true
       WHERE ci.company_code = $1 AND ci.cart_id = $2::uuid AND ci.active = true;`,
      [this.companyCode, cart.id]
    );

    const subtotal = items.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);

    return {
      ...cart,
      items: items.map((it) => ({ ...it, image_url: (it as any).primary_media_url })),
      subtotal,
      itemCount: items.reduce((acc, item) => acc + Number(item.quantity), 0),
    };
  }

  async addItem(cartId: string, listingVariantId: string, quantity: number): Promise<void> {
    // Check if item already exists in cart
    const existing = await query<any>(
      `SELECT id, quantity FROM ep_commerce.tb_ep_commerce_cart_cart_item_detail 
       WHERE company_code = $1 AND cart_id = $2::uuid AND listing_variant_id = $3::uuid AND active = true;`,
      [this.companyCode, cartId, listingVariantId]
    );

    if (existing.length > 0) {
      const newQty = Number(existing[0].quantity) + Number(quantity);
      await execute(
        `UPDATE ep_commerce.tb_ep_commerce_cart_cart_item_detail 
         SET quantity = $1, updated_at = clock_timestamp() 
         WHERE id = $2::uuid;`,
        [newQty, existing[0].id]
      );
    } else {
      await execute(
        `INSERT INTO ep_commerce.tb_ep_commerce_cart_cart_item_detail (
          id, company_code, cart_id, listing_variant_id, quantity, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, true, false
        );`,
        [this.companyCode, cartId, listingVariantId, quantity]
      );
    }
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(itemId);
    } else {
      await execute(
        `UPDATE ep_commerce.tb_ep_commerce_cart_cart_item_detail 
         SET quantity = $1, updated_at = clock_timestamp() 
         WHERE company_code = $2 AND id = $3::uuid;`,
        [quantity, this.companyCode, itemId]
      );
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await execute(
      `UPDATE ep_commerce.tb_ep_commerce_cart_cart_item_detail 
       SET active = false 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [this.companyCode, itemId]
    );
  }

  async clearCart(cartId: string): Promise<void> {
    await execute(
      `UPDATE ep_commerce.tb_ep_commerce_cart_cart_item_detail 
       SET active = false 
       WHERE company_code = $1 AND cart_id = $2::uuid;`,
      [this.companyCode, cartId]
    );
  }
}
