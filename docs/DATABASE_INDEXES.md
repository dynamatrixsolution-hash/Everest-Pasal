# Everest Pasal - Database Indexing Strategy & Performance Architecture

Authoritative Specification: `Everest_Pasal_Database_Design_Documentation.docx`

---

## 1. Indexing Principles

1. **Tenant Prefixing**: In a multi-company SaaS architecture, compound indexes on operational tables begin with `company_code` to allow optimal btree scans when filtered by tenant.
2. **Foreign Key Indexing**: Every high-throughput foreign key has a supporting index to avoid table scans during joins and referential integrity checks.
3. **Partial Indexes for Active / Published Records**: Tables with large volumes of soft-deleted or historical records utilize partial indexes (`WHERE active = true AND publish = true`) to minimize index tree depth.
4. **GIN Indexes for Semi-Structured JSONB**: Dynamic JSONB payloads (`configuration_json`, `pricing_snapshot_json`, `evidence_json`, `utm_json`, `details_json`) are indexed with PostgreSQL GIN `jsonb_path_ops` for fast key/value queries.

---

## 2. Comprehensive Index Registry

### 2.1 Multi-Tenant & Routing Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_system` | `tb_ep_system_company_database_route_setup` | `idx_ep_sys_db_route_lookup` | `(company_code, module_code, content_type, city_code, priority)` | BTREE |
| `ep_geo` | `tb_ep_geo_postal_postal_code_master` | `idx_ep_geo_postal_lookup` | `(company_code, postal_code)` | BTREE |
| `ep_geo` | `tb_ep_geo_service_service_area_master` | `idx_ep_geo_service_city` | `(company_code, city_code)` | BTREE |
| `ep_geo` | `tb_ep_geo_service_service_area_master` | `idx_ep_geo_service_polygon` | `(polygon_geojson)` | GIN |

### 2.2 Identity & Security Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_identity` | `tb_ep_identity_user_user_master` | `idx_ep_id_user_email` | `(company_code, email)` | BTREE (Unique, `WHERE email IS NOT NULL`) |
| `ep_identity` | `tb_ep_identity_user_user_master` | `idx_ep_id_user_mobile` | `(company_code, mobile_no)` | BTREE (Unique, `WHERE mobile_no IS NOT NULL`) |
| `ep_identity` | `tb_ep_admin_log_session_master` | `idx_ep_admin_session_user` | `(company_code, user_id, expires_at)` | BTREE (`WHERE revoked_at IS NULL`) |
| `ep_identity` | `tb_ep_admin_log_session_master` | `idx_ep_admin_session_token` | `(session_token_hash)` | BTREE (Hash lookup) |
| `ep_identity` | `tb_ep_identity_auth_otp_txn` | `idx_ep_id_otp_lookup` | `(company_code, destination, purpose, expires_at)` | BTREE (`WHERE used_at IS NULL`) |

### 2.3 Catalog & Search Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_catalog` | `tb_ep_catalog_prd_product_master` | `idx_ep_cat_prod_cat_brand` | `(company_code, category_id, brand_id)` | BTREE (`WHERE active = true AND publish = true`) |
| `ep_catalog` | `tb_ep_catalog_prd_product_variant_master` | `idx_ep_cat_var_barcode` | `(company_code, barcode)` | BTREE (`WHERE barcode IS NOT NULL`) |
| `ep_catalog` | `tb_ep_catalog_review_product_review_master` | `idx_ep_cat_review_prod` | `(company_code, product_id, rating)` | BTREE (`WHERE moderation_status = 'APPROVED'`) |
| `ep_merchant` | `tb_ep_merchant_prd_listing_master` | `idx_ep_merch_list_store_prod` | `(company_code, store_id, product_id)` | BTREE |
| `ep_merchant` | `tb_ep_merchant_prd_listing_variant_master` | `idx_ep_merch_list_var_sku` | `(company_code, seller_sku)` | BTREE |

### 2.4 Inventory & Stock Movement Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_inventory` | `tb_ep_inventory_stk_stock_item_master` | `idx_ep_inv_stk_lookup` | `(company_code, warehouse_id, variant_id)` | BTREE |
| `ep_inventory` | `tb_ep_inventory_stk_stock_movement_txn` | `idx_ep_inv_mov_occurred` | `(company_code, stock_item_id, occurred_at DESC)` | BTREE |
| `ep_inventory` | `tb_ep_inventory_stk_stock_reservation_txn` | `idx_ep_inv_res_active` | `(company_code, stock_item_id, expires_at)` | BTREE (`WHERE released_at IS NULL`) |

### 2.5 Commerce, Orders & Settlement Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_commerce` | `tb_ep_commerce_ord_order_master` | `idx_ep_comm_ord_cust_placed` | `(company_code, customer_id, placed_at DESC)` | BTREE |
| `ep_commerce` | `tb_ep_commerce_ord_merchant_order_master` | `idx_ep_comm_merch_ord_status` | `(company_code, merchant_id, status, created_at DESC)` | BTREE |
| `ep_commerce` | `tb_ep_commerce_ord_order_item_detail` | `idx_ep_comm_ord_item_ord` | `(company_code, order_id, merchant_order_id)` | BTREE |
| `ep_finance` | `tb_ep_finance_journal_journal_master` | `idx_ep_fin_jrnl_date` | `(company_code, journal_date DESC, status)` | BTREE |
| `ep_finance` | `tb_ep_finance_journal_journal_line_detail` | `idx_ep_fin_jrnl_line_acct` | `(company_code, account_id, created_at DESC)` | BTREE |
| `ep_finance` | `tb_ep_finance_settlement_merchant_settlement_master` | `idx_ep_fin_settle_merchant` | `(company_code, merchant_id, period_to DESC)` | BTREE |

### 2.6 Logistics & Tracking Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_logistics` | `tb_ep_logistics_shp_shipment_master` | `idx_ep_log_shp_tracking` | `(company_code, tracking_no)` | BTREE |
| `ep_logistics` | `tb_ep_logistics_shp_shipment_master` | `idx_ep_log_shp_status` | `(company_code, carrier_id, status)` | BTREE |
| `ep_logistics` | `tb_ep_logistics_track_tracking_event_txn` | `idx_ep_log_track_shp_time` | `(company_code, shipment_id, event_time DESC)` | BTREE |
| `ep_logistics` | `tb_ep_logistics_rider_rider_assignment_txn` | `idx_ep_log_rider_active_assign` | `(company_code, rider_id, status)` | BTREE |

### 2.7 Integration & Async Processing Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_integration` | `tb_ep_integration_outbox_outbox_event_queue` | `idx_ep_int_outbox_poll` | `(company_code, published_at, occurred_at)` | BTREE (`WHERE published_at IS NULL`) |
| `ep_integration` | `tb_ep_integration_webhook_webhook_delivery_queue` | `idx_ep_int_webhook_retry` | `(company_code, next_attempt_at, delivered_at)` | BTREE (`WHERE delivered_at IS NULL`) |

### 2.8 Audit & KYC Indexes
| Schema | Table Name | Index Name | Columns | Type / Predicate |
|---|---|---|---|---|
| `ep_audit` | `tb_ep_audit_activity_activity_log` | `idx_ep_audit_act_time` | `(company_code, activity_at DESC, module_code)` | BTREE |
| `ep_audit` | `tb_ep_audit_entity_entity_change_log` | `idx_ep_audit_cdc_entity` | `(company_code, entity_schema, entity_table, entity_id)` | BTREE |
| `ep_kyc` | `tb_ep_kyc_case_verification_case_master` | `idx_ep_kyc_case_status` | `(company_code, status, risk_level)` | BTREE |
| `ep_kyc` | `tb_ep_kyc_check_verification_check_txn` | `idx_ep_kyc_check_case` | `(company_code, case_id, status)` | BTREE |
