# Everest Pasal — Order & Commerce Architecture

## 1. Physical Schemas & Tables (`ep_commerce`)

- `tb_ep_commerce_cart_shopping_cart_master` — Persistent customer cart header.
- `tb_ep_commerce_cart_shopping_cart_item` — Individual line items referencing `listing_variant_id`.
- `tb_ep_commerce_ord_order_master` — Customer purchase order header with accepted totals, currency, and lifecycle status.
- `tb_ep_commerce_ord_order_item_detail` — Immutable order line item snapshots preserving product name, SKU, price, variant, and quantity.
- `tb_ep_commerce_ord_order_charge_detail` — Detailed breakdown of shipping charges, tax, and applied discounts.
- `tb_ep_commerce_ord_order_status_history` — Append-only audit of all order status transitions.

---

## 2. Multi-Vendor Order Splitting

A single customer order can contain items from multiple independent merchants. The checkout pipeline handles this via:
1. **Parent Customer Order**: `tb_ep_commerce_ord_order_master` representing the buyer's single invoice.
2. **Merchant Fulfillment Units**: `tb_ep_fulfillment_unit_fulfillment_unit_master` grouping order items by merchant for independent packing, dispatch, and settlement.

---

## 3. Order Snapshot Immutability Invariant

Even if the catalog product changes its name, description, variant options, or price in the future, past orders NEVER change because:
- Accepted price, SKU, product title, and options are copied into `tb_ep_commerce_ord_order_item_detail` at the exact moment of order placement.
