// ==============================================================================
// EVEREST PASAL - FULFILLMENT REPOSITORY (ep_fulfillment)
// ==============================================================================

import { query, execute } from '../db.js';

export class FulfillmentRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async createFulfillmentOrder(data: {
    orderId: string;
    merchantOrderId: string;
    warehouseId: string;
    status?: string;
    items: {
      orderItemId: string;
      listingVariantId: string;
      quantity: number;
    }[];
  }): Promise<any> {
    const fulfillmentNumber = `FUL_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master (
        id, company_code, fulfillment_number, order_id, merchant_order_id,
        warehouse_id, status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, $5::uuid, $6, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        fulfillmentNumber,
        data.orderId,
        data.merchantOrderId,
        data.warehouseId,
        data.status || 'UNASSIGNED',
      ]
    );

    const fulfillment = rows[0];

    for (const item of data.items) {
      await execute(
        `INSERT INTO ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_item_detail (
          id, company_code, fulfillment_id, order_item_id, listing_variant_id,
          quantity_requested, quantity_fulfilled, status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4::uuid, $5, 0, 'PENDING', true, false
        );`,
        [this.companyCode, fulfillment.id, item.orderItemId, item.listingVariantId, item.quantity]
      );
    }

    return fulfillment;
  }

  async createPackage(data: {
    fulfillmentId: string;
    weightKg?: number;
    items: {
      fulfillmentItemId: string;
      quantity: number;
    }[];
  }): Promise<any> {
    const packageNumber = `PKG_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_fulfillment.tb_ep_fulfillment_pkg_package_master (
        id, company_code, package_number, fulfillment_id, weight_kg, status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4, 'PACKED', true, false
      ) RETURNING *;`,
      [this.companyCode, packageNumber, data.fulfillmentId, data.weightKg || 1.0]
    );

    const pkg = rows[0];

    for (const item of data.items) {
      await execute(
        `INSERT INTO ep_fulfillment.tb_ep_fulfillment_pkg_package_item_detail (
          id, company_code, package_id, fulfillment_item_id, quantity, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, true, false
        );`,
        [this.companyCode, pkg.id, item.fulfillmentItemId, item.quantity]
      );
    }

    // Update fulfillment status
    await execute(
      `UPDATE ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master 
       SET status = 'PACKED', updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [data.fulfillmentId]
    );

    return pkg;
  }

  async getFulfillments(merchantOrderId?: string): Promise<any[]> {
    let sql = `SELECT * FROM ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master WHERE company_code = $1 AND active = true`;
    const params: any[] = [this.companyCode];

    if (merchantOrderId) {
      sql += ` AND merchant_order_id = $2::uuid`;
      params.push(merchantOrderId);
    }

    sql += ` ORDER BY created_at DESC;`;
    return await query(sql, params);
  }
}
