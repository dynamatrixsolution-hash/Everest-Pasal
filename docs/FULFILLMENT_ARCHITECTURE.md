# Everest Pasal — Fulfillment & Logistics Architecture

## 1. Physical Schemas & Tables (`ep_fulfillment` & `ep_logistics`)

- `tb_ep_fulfillment_alloc_stock_allocation_detail` — Stock reservations bound to specific order items.
- `tb_ep_fulfillment_pkg_package_master` — Physical package boxes with tracking barcodes and weight.
- `tb_ep_fulfillment_pick_pick_task_detail` — Warehouse picking route optimizations.
- `tb_ep_logistics_carrier_shipping_carrier_master` — Logistics providers (`EVEREST_EXPRESS`, `NEPAL_POST`, `SUNDAR_COURIER`).
- `tb_ep_logistics_shp_shipment_master` — Shipment lifecycle records (`CREATED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`).
- `tb_ep_logistics_trck_shipment_tracking_event_txn` — Append-only chronological timeline of tracking scans.
- `tb_ep_logistics_rider_rider_master` — Last-mile delivery agents.

---

## 2. Fulfillment Lifecycle State Machine

1. **Order Placed**: Fulfillment unit created in `PENDING` state.
2. **Stock Allocated**: Stock allocated in warehouse via `tb_ep_fulfillment_alloc_stock_allocation_detail`.
3. **Pick & Pack**: Items picked and boxed into `tb_ep_fulfillment_pkg_package_master`.
4. **Shipment Manifest**: Package handed over to carrier or rider; tracking number assigned in `tb_ep_logistics_shp_shipment_master`.
5. **In-Transit Scans**: Scans recorded in append-only table `tb_ep_logistics_trck_shipment_tracking_event_txn`.
6. **Delivered**: Proof of delivery recorded and payout trigger issued.
