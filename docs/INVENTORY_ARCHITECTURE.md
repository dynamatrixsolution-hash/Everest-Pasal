# Everest Pasal — Inventory & Stock Movement Architecture

## 1. Physical Schemas & Tables (`ep_inventory`)

- `tb_ep_inventory_wh_warehouse_master` — Central and regional fulfillment centers.
- `tb_ep_inventory_stk_stock_item_master` — Master SKU/variant inventory records per warehouse.
- `tb_ep_inventory_stk_stock_movement_txn` — Double-entry stock transaction ledger recording all quantity adjustments, receipts, sales issues, scrap, and transfers.
- `tb_ep_inventory_stk_stock_reservation_txn` — Temporary stock reservation holds during checkout.
- `tb_ep_inventory_stk_stock_adjustment_txn` — Audited stock adjustment approvals.

---

## 2. The Absolute Movement Invariant

**CRITICAL RULE**: Physical stock quantity on hand is never silently mutated. Every modification MUST create a corresponding row in `tb_ep_inventory_stk_stock_movement_txn`:

```sql
INSERT INTO ep_inventory.tb_ep_inventory_stk_stock_movement_txn (
  id, company_code, fiscal_year_code, stock_item_id, movement_type,
  quantity, reference_type, reference_id, occurred_at, active, publish
) VALUES (
  gen_random_uuid(), 'EP_NEPAL', 'FY8182', $1, 'PURCHASE_RECEIPT', 50, 'PO', $2, clock_timestamp(), true, false
);
```

Available on-hand stock is calculated as:
$$\text{Available Stock} = \sum(\text{Movement Quantity}) - \sum(\text{Active Unreleased Reservations})$$
