// ==============================================================================
// EVEREST PASAL - CART SERVICE
// Direct integration with ep_commerce schema in PostgreSQL 18
// ==============================================================================

import { CartRepository } from '../../repositories/cart.repository.js';
import { query } from '../../db.js';

export class CartService {
  private cartRepo: CartRepository;

  constructor(cartRepo?: CartRepository) {
    this.cartRepo = cartRepo || new CartRepository('EP_NEPAL');
  }

  private async getOrCreateCustomerId(userId: string): Promise<string> {
    const custRows = await query<any>(
      `SELECT id FROM ep_customer.tb_ep_customer_profile_customer_master 
       WHERE company_code = 'EP_NEPAL' AND user_id = $1::uuid AND active = true LIMIT 1;`,
      [userId]
    );

    if (custRows[0]) {
      return custRows[0].id;
    }

    // Lookup user display name
    const uRows = await query<any>(
      `SELECT display_name FROM ep_identity.tb_ep_identity_user_user_master WHERE id = $1::uuid LIMIT 1;`,
      [userId]
    );
    const displayName = uRows[0]?.display_name || 'Customer';

    // Auto-create customer profile
    const customerCode = `CUST_${Date.now().toString().slice(-8)}`;
    const newCust = await query<any>(
      `INSERT INTO ep_customer.tb_ep_customer_profile_customer_master (
        id, company_code, customer_code, user_id, first_name, active, publish
      ) VALUES (
        gen_random_uuid(), 'EP_NEPAL', $1, $2::uuid, $3, true, false
      ) RETURNING id;`,
      [customerCode, userId, displayName]
    );

    return newCust[0].id;
  }

  public async getOrCreateActiveBasket(accountId: string): Promise<any> {
    const customerId = await this.getOrCreateCustomerId(accountId);
    const cart = await this.cartRepo.getOrCreateCart(customerId);
    
    // Map items to standard format expected by frontend
    const mappedItems = (cart.items || []).map((item: any) => ({
      id: item.id,
      offerId: item.listing_variant_id,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.price) || 0,
      totalPrice: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      productName: item.product_name || 'Everest Item',
      sku: item.seller_sku,
      imageUrl: item.image_url || '/placeholder.png',
      offer: {
        id: item.listing_variant_id,
        price: Number(item.price) || 0,
        sku: item.seller_sku,
        product: {
          name: item.product_name,
        },
      },
    }));

    const totalAmount = mappedItems.reduce((acc: number, it: any) => acc + it.totalPrice, 0);

    return {
      id: cart.id,
      customerId: cart.customer_id,
      items: mappedItems,
      subtotal: totalAmount,
      total: totalAmount,
      currency: cart.currency_code || 'NPR',
      itemCount: mappedItems.reduce((acc: number, it: any) => acc + it.quantity, 0),
    };
  }

  public async addItem(accountId: string, offerId: string, quantity: number): Promise<any> {
    const customerId = await this.getOrCreateCustomerId(accountId);

    // Resolve offerId to listing_variant_id
    let listingVariantId = offerId;
    const lvRows = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_prd_listing_variant_master 
       WHERE company_code = 'EP_NEPAL' AND (id = $1::uuid OR variant_id = $1::uuid) AND active = true LIMIT 1;`,
      [offerId]
    );
    if (lvRows[0]) {
      listingVariantId = lvRows[0].id;
    } else {
      // Fallback: check if offerId is a product id, find its first listing variant
      const prdLv = await query<any>(
        `SELECT lv.id 
         FROM ep_merchant.tb_ep_merchant_prd_listing_variant_master lv
         JOIN ep_catalog.tb_ep_catalog_prd_product_variant_master v ON v.id = lv.variant_id
         WHERE lv.company_code = 'EP_NEPAL' AND v.product_id = $1::uuid AND lv.active = true LIMIT 1;`,
        [offerId]
      );
      if (prdLv[0]) {
        listingVariantId = prdLv[0].id;
      }
    }

    const cart = await this.cartRepo.getOrCreateCart(customerId);
    await this.cartRepo.addItem(cart.id, listingVariantId, quantity);
    return this.getOrCreateActiveBasket(accountId);
  }

  public async updateItemQuantity(accountId: string, itemId: string, quantity: number): Promise<any> {
    await this.cartRepo.updateItemQuantity(itemId, quantity);
    return this.getOrCreateActiveBasket(accountId);
  }

  public async removeItem(accountId: string, itemId: string): Promise<any> {
    await this.cartRepo.removeItem(itemId);
    return this.getOrCreateActiveBasket(accountId);
  }

  public async clearCart(accountId: string): Promise<void> {
    const customerId = await this.getOrCreateCustomerId(accountId);
    const cart = await this.cartRepo.getOrCreateCart(customerId);
    await this.cartRepo.clearCart(cart.id);
  }
}

export const cartService = new CartService();
