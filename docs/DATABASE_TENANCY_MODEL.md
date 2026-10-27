# Everest Pasal - Database Tenancy & Multi-Company Architecture

Authoritative Specification: `Everest_Pasal_Database_Design_Documentation.docx`

---

## 1. Multi-Company Tenancy Model

Everest Pasal is designed as a multi-company, multi-tenant e-commerce platform.

### 1.1 The `company_code` Tenant Anchor
Every table in the database includes:
```sql
company_code varchar(20) NOT NULL
```

- **Tenancy Boundary**: Every company operating on the platform (e.g. `EP_NEPAL`, `EP_GLOBAL`) is partitioned logically by `company_code`.
- **Database Routing**: The platform supports sharding/routing specific companies, modules, or geographical regions to distinct physical database links via `ep_system.tb_ep_system_company_database_route_setup`.
- **Compound Scoping**: All unique constraints across all schemas incorporate `company_code` to allow multi-tenant coexistence without key collision.

---

## 2. Fiscal Year Temporal Scoping

Tables marked **Fiscal Year Required = Yes** capture temporal accounting and transactional cycles.

### Rules:
1. **Mandatory Column**: Contains `fiscal_year_code varchar(20) NOT NULL`.
2. **Historical Immutability**: The `fiscal_year_code` is stamped permanently onto the transaction record at creation time and is **never updated or recomputed historically**.
3. **Closing Cycles**: When a fiscal year is closed via `ep_system.tb_ep_system_company_fiscal_year_master` (`is_closed = true`), new transactional postings to that fiscal year are rejected at the application and trigger layer.

### Fiscal-Year Scoped Tables Directory:
- `ep_merchant.tb_ep_merchant_contract_contract_master`
- `ep_inventory.tb_ep_inventory_stk_stock_movement_txn`
- `ep_inventory.tb_ep_inventory_stk_stock_adjustment_txn`
- `ep_inventory.tb_ep_inventory_trf_transfer_master`
- `ep_inventory.tb_ep_inventory_count_stock_count_master`
- `ep_pricing.tb_ep_pricing_coupon_coupon_redemption_txn`
- `ep_commerce.tb_ep_commerce_ord_order_master`
- `ep_commerce.tb_ep_commerce_ord_merchant_order_master`
- `ep_commerce.tb_ep_commerce_ord_order_item_detail`
- `ep_commerce.tb_ep_commerce_ord_order_address_snapshot`
- `ep_commerce.tb_ep_commerce_ord_order_charge_detail`
- `ep_commerce.tb_ep_commerce_ord_order_discount_detail`
- `ep_commerce.tb_ep_commerce_ord_order_status_history`
- `ep_commerce.tb_ep_commerce_ord_order_cancellation_txn`
- `ep_payment.tb_ep_payment_intent_payment_intent_master`
- `ep_payment.tb_ep_payment_txn_payment_transaction_txn`
- `ep_payment.tb_ep_payment_refund_refund_master`
- `ep_payment.tb_ep_payment_refund_refund_transaction_txn`
- `ep_payment.tb_ep_payment_cod_cod_receivable_master`
- `ep_finance.tb_ep_finance_journal_journal_master`
- `ep_finance.tb_ep_finance_journal_journal_line_detail`
- `ep_finance.tb_ep_finance_settlement_merchant_settlement_master`
- `ep_finance.tb_ep_finance_settlement_settlement_item_detail`
- `ep_finance.tb_ep_finance_payout_merchant_payout_master`
- `ep_finance.tb_ep_finance_payout_payout_transaction_txn`
- `ep_finance.tb_ep_finance_commission_commission_entry_txn`
- `ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master`
- `ep_logistics.tb_ep_logistics_bag_bag_master`
- `ep_logistics.tb_ep_logistics_manifest_manifest_master`
- `ep_returns.tb_ep_returns_req_return_request_master`
- `ep_growth.tb_ep_growth_attr_attribution_txn`
- `ep_growth.tb_ep_growth_commission_commission_event_txn`

---

## 3. Merchant Multi-Tenancy (Seller Isolation)

Within each `company_code`, marketplace merchants are logically isolated:

1. **Merchant Identity Anchor**: `ep_merchant.tb_ep_merchant_vendor_merchant_master`.
2. **Staff Authorization**: `tb_ep_merchant_vendor_member_map` connects central identity users (`user_id`) to merchant organizations (`merchant_id`).
3. **Data Scoping Rules**:
   - **Catalog Listings**: Merchants can only view, create, and edit listings where `merchant_id` matches their own organization.
   - **Inventory Positions**: Warehouses and stock positions (`tb_ep_inventory_stk_stock_item_master`) are partitioned per merchant.
   - **Split Sub-Orders**: Orders containing products from multiple sellers are split into `tb_ep_commerce_ord_merchant_order_master`. Sellers only have read/write access to their own sub-orders and associated fulfillment packages.
   - **Financial Settlements**: Merchant settlements, commission statements, and bank payout records are strictly filtered by `merchant_id`.

---

## 4. Lifecycle & Soft-Deletion Architecture

To maintain regulatory compliance, accounting ledger integrity, and tracking history, physical database deletes (`DELETE FROM ...`) are prohibited on business entities.

### Deactivation Protocol:
1. Setting `active = false` designates logical deactivation / soft-delete.
2. The system automatically records:
   - `deactivated_at = clock_timestamp()`
   - `deactivated_by = current_user_uuid`
   - `deactivation_reason = text`
3. Setting `active = false` forces `publish = false`.
4. Operational queries filter by `WHERE active = true`. Historical, reporting, and audit queries read active and deactivated rows seamlessly.
