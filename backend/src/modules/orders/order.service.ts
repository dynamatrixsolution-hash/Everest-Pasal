// ==============================================================================
// EVEREST PASAL - ORDER & FULFILLMENT SERVICE
// Direct integration with ep_commerce schema in PostgreSQL 18
// ==============================================================================

import { OrderRepository } from '../../repositories/order.repository.js';
import { CartRepository } from '../../repositories/cart.repository.js';
import { query } from '../../db.js';

export class OrderService {
  private orderRepo: OrderRepository;
  private cartRepo: CartRepository;
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL', orderRepo?: OrderRepository, cartRepo?: CartRepository) {
    this.companyCode = companyCode;
    this.orderRepo = orderRepo || new OrderRepository(companyCode);
    this.cartRepo = cartRepo || new CartRepository(companyCode);
  }

  public async checkout(accountId: string, idempotencyKey: string, options: any): Promise<any> {
    const custRows = await query<any>(
      `SELECT id, first_name FROM ep_customer.tb_ep_customer_profile_customer_master 
       WHERE company_code = $1 AND user_id = $2::uuid AND active = true LIMIT 1;`,
      [this.companyCode, accountId]
    );
    const customerId = custRows[0]?.id || accountId;
    const recipientName = custRows[0]?.first_name || options.recipientName || 'Everest Customer';

    // Get cart
    const cart = await this.cartRepo.getOrCreateCart(customerId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }

    const order = await this.orderRepo.createOrderFromCart({
      customerId,
      cartId: cart.id,
      recipientName: options.recipientName || recipientName,
      recipientPhone: options.recipientPhone || '9800000000',
      addressLine1: options.addressLine1 || 'Kathmandu Central, Ward 3',
      cityName: options.cityName || 'Kathmandu',
      paymentMethod: options.paymentGateway || 'COD',
    });

    return {
      id: order.id,
      orderNumber: order.order_no,
      status: order.order_status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      subtotalAmount: Number(order.subtotal_amount),
      shippingAmount: Number(order.shipping_amount),
      grandTotal: Number(order.grand_total),
      placedAt: order.placed_at,
    };
  }

  public async getCustomerOrders(accountId: string): Promise<any[]> {
    const custRows = await query<any>(
      `SELECT id FROM ep_customer.tb_ep_customer_profile_customer_master 
       WHERE company_code = $1 AND user_id = $2::uuid AND active = true LIMIT 1;`,
      [this.companyCode, accountId]
    );
    const customerId = custRows[0]?.id || accountId;

    const orders = await this.orderRepo.getCustomerOrders(customerId);
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_no,
      status: o.order_status,
      paymentStatus: o.payment_status,
      fulfillmentStatus: o.fulfillment_status,
      subtotalAmount: Number(o.subtotal_amount),
      shippingAmount: Number(o.shipping_amount),
      grandTotal: Number(o.grand_total),
      createdAt: o.placed_at,
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        productName: it.product_name_snapshot,
        sku: it.sku_snapshot,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
        lineTotal: Number(it.line_total),
      })),
    }));
  }

  public async getOrderById(orderId: string, accountId?: string): Promise<any | null> {
    let customerId: string | undefined;
    if (accountId) {
      const custRows = await query<any>(
        `SELECT id FROM ep_customer.tb_ep_customer_profile_customer_master 
         WHERE company_code = $1 AND user_id = $2::uuid AND active = true LIMIT 1;`,
        [this.companyCode, accountId]
      );
      customerId = custRows[0]?.id || accountId;
    }

    const order = await this.orderRepo.getOrderById(orderId, customerId);
    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.order_no,
      status: order.order_status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      subtotalAmount: Number(order.subtotal_amount),
      shippingAmount: Number(order.shipping_amount),
      grandTotal: Number(order.grand_total),
      createdAt: order.placed_at,
      items: (order.items || []).map((it: any) => ({
        id: it.id,
        productName: it.product_name_snapshot,
        sku: it.sku_snapshot,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
        lineTotal: Number(it.line_total),
      })),
      address: order.address
        ? {
            recipientName: order.address.recipient_name,
            recipientPhone: order.address.recipient_phone,
            addressLine1: order.address.address_line1,
            cityName: order.address.city_name,
          }
        : null,
    };
  }

  public async getVendorFulfillmentUnits(orgId: string, status?: string): Promise<any[]> {
    return this.orderRepo.getVendorFulfillmentUnits(orgId, status);
  }

  public async updateFulfillmentUnitStatus(unitId: string, orgId: string, status: string, details?: any, actorId?: string): Promise<any> {
    return this.orderRepo.updateVendorFulfillmentStatus(unitId, orgId, status);
  }

  public async getAdminOrders(params: any): Promise<any> {
    return this.orderRepo.getAdminOrders(params);
  }

  public async cancelOrder(orderId: string, accountId: string, reason: string, isStaff: boolean = false): Promise<any> {
    await this.orderRepo.cancelOrder(orderId, accountId, reason);
    return { id: orderId, status: 'CANCELLED' };
  }
}

export const orderService = new OrderService();
