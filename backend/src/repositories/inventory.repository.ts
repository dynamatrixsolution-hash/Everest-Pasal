// ==============================================================================
// EVEREST PASAL - INVENTORY REPOSITORY (ep_inventory)
// Strict Movement Audit & Reservation Invariant Enforcement
// ==============================================================================

import { query, execute } from '../db.js';

export class InventoryRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getWarehouses(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_inventory.tb_ep_inventory_wh_warehouse_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY warehouse_name ASC;`,
      [this.companyCode]
    );
  }

  async getStockItems(params: { warehouseId?: string; variantId?: string; listingVariantId?: string; page?: number; pageSize?: number } = {}): Promise<{ data: any[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClauses = [`s.company_code = $1`, `s.active = true`];
    let queryParams: any[] = [this.companyCode];
    let idx = 2;

    if (params.warehouseId) {
      whereClauses.push(`s.warehouse_id = $${idx}::uuid`);
      queryParams.push(params.warehouseId);
      idx++;
    }

    const varId = params.variantId || params.listingVariantId;
    if (varId) {
      whereClauses.push(`s.variant_id = $${idx}::uuid`);
      queryParams.push(varId);
      idx++;
    }

    const whereSql = whereClauses.join(' AND ');

    const countRows = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_inventory.tb_ep_inventory_stk_stock_item_master s WHERE ${whereSql};`,
      queryParams
    );

    const total = countRows[0]?.count || 0;

    const data = await query(
      `SELECT s.*, w.warehouse_name, w.warehouse_code, p.product_name, v.variant_name, v.sku as variant_sku,
              COALESCE((SELECT SUM(m.quantity) FROM ep_inventory.tb_ep_inventory_stk_stock_movement_txn m WHERE m.stock_item_id = s.id AND m.active = true), 0) as quantity_on_hand,
              COALESCE((SELECT SUM(r.quantity) FROM ep_inventory.tb_ep_inventory_stk_stock_reservation_txn r WHERE r.stock_item_id = s.id AND r.released_at IS NULL AND (r.expires_at IS NULL OR r.expires_at > clock_timestamp()) AND r.active = true), 0) as quantity_reserved
       FROM ep_inventory.tb_ep_inventory_stk_stock_item_master s
       JOIN ep_inventory.tb_ep_inventory_wh_warehouse_master w ON w.id = s.warehouse_id
       LEFT JOIN ep_catalog.tb_ep_catalog_prd_product_variant_master v ON v.id = s.variant_id
       LEFT JOIN ep_catalog.tb_ep_catalog_prd_product_master p ON p.id = v.product_id
       WHERE ${whereSql}
       ORDER BY s.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1};`,
      [...queryParams, pageSize, offset]
    );

    return { data, total };
  }

  async adjustStock(data: {
    warehouseId: string;
    variantId?: string;
    listingVariantId?: string;
    quantityDelta: number;
    movementType?: string;
    referenceType?: string;
    referenceId?: string;
    reasonCode?: string;
    performedByUserId?: string;
  }): Promise<{ stockItem: any; movement: any }> {
    const variantId = data.variantId || data.listingVariantId;
    if (!variantId) {
      throw new Error('variantId or listingVariantId is required');
    }

    // 1. Find or create stock item
    let stockRows = await query(
      `SELECT * FROM ep_inventory.tb_ep_inventory_stk_stock_item_master 
       WHERE company_code = $1 AND warehouse_id = $2::uuid AND variant_id = $3::uuid 
       FOR UPDATE;`,
      [this.companyCode, data.warehouseId, variantId]
    );

    let stockItem: any;
    if (!stockRows[0]) {
      const created = await query(
        `INSERT INTO ep_inventory.tb_ep_inventory_stk_stock_item_master (
          id, company_code, warehouse_id, variant_id, sku, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, true, false
        ) RETURNING *;`,
        [this.companyCode, data.warehouseId, variantId, `SKU-${Date.now()}`]
      );
      stockItem = created[0];
    } else {
      stockItem = stockRows[0];
    }

    // Calculate current balance
    const balRows = await query<{ sum: number }>(
      `SELECT COALESCE(SUM(quantity), 0) as sum 
       FROM ep_inventory.tb_ep_inventory_stk_stock_movement_txn 
       WHERE stock_item_id = $1::uuid AND active = true;`,
      [stockItem.id]
    );
    const previousOnHand = Number(balRows[0]?.sum || 0);
    const newOnHand = previousOnHand + data.quantityDelta;

    if (newOnHand < 0) {
      throw new Error(`Insufficient stock: Cannot reduce quantity by ${Math.abs(data.quantityDelta)}. On hand is ${previousOnHand}.`);
    }

    // Insert stock adjustment audit record
    await query(
      `INSERT INTO ep_inventory.tb_ep_inventory_stk_stock_adjustment_txn (
        id, company_code, fiscal_year_code, stock_item_id, adjustment_reason, quantity_delta, approved_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2::uuid, $3, $4, clock_timestamp(), true, false
      );`,
      [this.companyCode, stockItem.id, data.reasonCode || 'MANUAL_COUNT', data.quantityDelta]
    );

    // Insert mandatory movement transaction (Audit Trail)
    const movementRows = await query(
      `INSERT INTO ep_inventory.tb_ep_inventory_stk_stock_movement_txn (
        id, company_code, fiscal_year_code, stock_item_id, movement_type,
        quantity, reference_type, reference_id, occurred_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'FY8182', $2::uuid, $3, $4, $5, $6, clock_timestamp(), true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        stockItem.id,
        data.movementType || (data.quantityDelta > 0 ? 'PURCHASE_RECEIPT' : 'SALES_ISSUE'),
        data.quantityDelta,
        data.referenceType || 'MANUAL_ADJUSTMENT',
        data.referenceId || null,
      ]
    );

    return { stockItem: { ...stockItem, quantity_on_hand: newOnHand }, movement: movementRows[0] };
  }

  async reserveStock(data: {
    warehouseId: string;
    variantId?: string;
    listingVariantId?: string;
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    expiresAt?: Date;
  }): Promise<any> {
    const variantId = data.variantId || data.listingVariantId;
    const stockRows = await query(
      `SELECT * FROM ep_inventory.tb_ep_inventory_stk_stock_item_master 
       WHERE company_code = $1 AND warehouse_id = $2::uuid AND variant_id = $3::uuid 
       FOR UPDATE;`,
      [this.companyCode, data.warehouseId, variantId]
    );

    if (!stockRows[0]) {
      throw new Error('Stock item not found for reservation');
    }

    const item = stockRows[0];

    // Insert reservation txn
    const res = await query(
      `INSERT INTO ep_inventory.tb_ep_inventory_stk_stock_reservation_txn (
        id, company_code, stock_item_id, reservation_type, reference_id,
        quantity, reserved_at, expires_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5, clock_timestamp(), $6, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        item.id,
        data.referenceType || 'CHECKOUT_HOLD',
        data.referenceId || null,
        data.quantity,
        data.expiresAt || new Date(Date.now() + 30 * 60 * 1000), // default 30 min expiration
      ]
    );

    return res[0];
  }

  async releaseReservation(reservationId: string): Promise<void> {
    await execute(
      `UPDATE ep_inventory.tb_ep_inventory_stk_stock_reservation_txn 
       SET released_at = clock_timestamp(), updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid AND released_at IS NULL;`,
      [this.companyCode, reservationId]
    );
  }
}
