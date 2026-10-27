# Everest Pasal - Database Constraints & Integrity Rules

Authoritative Specification: `Everest_Pasal_Database_Design_Documentation.docx`

---

## 1. Global Constraint Standards

### 1.1 Primary Key Rule
Every table MUST have a UUID primary key named `id`:
```sql
CONSTRAINT pk_<schema>_<table_short_name> PRIMARY KEY (id)
```

### 1.2 Multi-Tenant Reference Consistency
Every table contains `company_code varchar(20) NOT NULL`. All business entities that define unique natural keys must enforce uniqueness **scoped to `company_code`**.

### 1.3 Soft Delete & Visibility Invariant Check
When a record is soft-deleted (`active = false`), it MUST NOT remain publicly visible (`publish = false`):
```sql
CONSTRAINT chk_<schema>_<table_short_name>_active_publish 
CHECK (NOT (active = false AND publish = true))
```

---

## 2. Complete Unique Constraints Directory

| # | Physical Table Name | Unique Constraint Name | Columns Included | Condition / Notes |
|---|---|---|---|---|
| 1 | `ep_system.tb_ep_system_company_company_master` | `uq_ep_system_company_code` | `(company_code)` | Top-level tenant key |
| 2 | `ep_system.tb_ep_system_company_fiscal_year_master` | `uq_ep_system_fy_code` | `(company_code, fiscal_year_code)` | Unique per company |
| 3 | `ep_system.tb_ep_system_company_ftp_setup` | `uq_ep_system_ftp_code` | `(company_code, setup_code)` | Unique per company |
| 4 | `ep_system.tb_ep_system_company_communication_setup` | `uq_ep_system_comm_code` | `(company_code, setup_code)` | Unique per company |
| 5 | `ep_system.tb_ep_system_company_database_link_setup` | `uq_ep_system_dblink_code` | `(company_code, database_link_code)` | Unique per company |
| 6 | `ep_system.tb_ep_system_company_setting_master` | `uq_ep_system_setting_key` | `(company_code, setting_group, setting_key)` | Unique setting key |
| 7 | `ep_system.tb_ep_system_document_number_series_master` | `uq_ep_system_doc_series` | `(company_code, series_code)` | Unique per series |
| 8 | `ep_system.tb_ep_system_branch_branch_master` | `uq_ep_system_branch_code` | `(company_code, branch_code)` | Unique per company |
| 9 | `ep_system.tb_ep_system_feature_feature_flag_setup` | `uq_ep_system_feature_code` | `(company_code, feature_code)` | Unique per feature |
| 10 | `ep_geo.tb_ep_geo_country_country_master` | `uq_ep_geo_country_code` | `(company_code, country_code)` | Unique ISO country |
| 11 | `ep_geo.tb_ep_geo_province_province_master` | `uq_ep_geo_province_code` | `(company_code, country_code, province_code)` | Unique province per country |
| 12 | `ep_geo.tb_ep_geo_district_district_master` | `uq_ep_geo_district_code` | `(company_code, province_code, district_code)` | Unique district per province |
| 13 | `ep_geo.tb_ep_geo_city_city_master` | `uq_ep_geo_city_code` | `(company_code, country_code, city_code)` | Unique city per country |
| 14 | `ep_geo.tb_ep_geo_service_service_area_master` | `uq_ep_geo_service_area` | `(company_code, service_area_code)` | Unique area |
| 15 | `ep_geo.tb_ep_geo_zone_delivery_zone_master` | `uq_ep_geo_zone_code` | `(company_code, zone_code)` | Unique zone |
| 16 | `ep_geo.tb_ep_geo_zone_delivery_zone_area_map` | `uq_ep_geo_zone_area_map` | `(company_code, zone_code, service_area_code, city_code)` | Unique zone mapping |
| 17 | `ep_identity.tb_ep_identity_user_user_master` | `uq_ep_identity_user_code` | `(company_code, user_code)` | Unique user code |
| 18 | `ep_identity.tb_ep_identity_user_user_master` | `uq_ep_identity_user_email` | `(company_code, email)` | Partial: `WHERE email IS NOT NULL` |
| 19 | `ep_identity.tb_ep_identity_user_user_master` | `uq_ep_identity_user_mobile` | `(company_code, mobile_no)` | Partial: `WHERE mobile_no IS NOT NULL` |
| 20 | `ep_identity.tb_ep_identity_role_role_master` | `uq_ep_identity_role_code` | `(company_code, role_code)` | Unique role |
| 21 | `ep_identity.tb_ep_identity_permission_permission_master` | `uq_ep_identity_perm_code` | `(company_code, permission_code)` | Unique permission |
| 22 | `ep_identity.tb_ep_identity_role_user_role_map` | `uq_ep_identity_user_role_scope` | `(company_code, user_id, role_id, scope_type, scope_id)` | Unique grant per scope |
| 23 | `ep_identity.tb_ep_identity_role_role_permission_map` | `uq_ep_identity_role_perm` | `(company_code, role_id, permission_id)` | Unique role permission grant |
| 24 | `ep_identity.tb_ep_identity_api_api_key_master` | `uq_ep_identity_api_key` | `(company_code, api_key_code)` | Unique API key code |
| 25 | `ep_customer.tb_ep_customer_profile_customer_master` | `uq_ep_customer_code` | `(company_code, customer_code)` | Unique customer code |
| 26 | `ep_customer.tb_ep_customer_profile_customer_master` | `uq_ep_customer_user_id` | `(company_code, user_id)` | 1:1 Customer-to-User map |
| 27 | `ep_customer.tb_ep_customer_pref_preference_master` | `uq_ep_customer_pref_key` | `(company_code, customer_id, preference_key)` | Unique preference key |
| 28 | `ep_customer.tb_ep_customer_fav_favorite_store_map` | `uq_ep_customer_fav_store` | `(company_code, customer_id, store_id)` | Unique favorite store |
| 29 | `ep_merchant.tb_ep_merchant_vendor_merchant_master` | `uq_ep_merchant_code` | `(company_code, merchant_code)` | Unique merchant code |
| 30 | `ep_merchant.tb_ep_merchant_vendor_member_map` | `uq_ep_merchant_user_member` | `(company_code, merchant_id, user_id)` | Unique staff membership |
| 31 | `ep_merchant.tb_ep_merchant_store_store_master` | `uq_ep_merchant_store_code` | `(company_code, store_code)` | Unique store code |
| 32 | `ep_merchant.tb_ep_merchant_store_store_master` | `uq_ep_merchant_store_slug` | `(company_code, slug)` | Partial: `WHERE slug IS NOT NULL` |
| 33 | `ep_merchant.tb_ep_merchant_contract_contract_master` | `uq_ep_merchant_contract_no` | `(company_code, contract_no)` | Unique contract no |
| 34 | `ep_merchant.tb_ep_merchant_setting_setting_master` | `uq_ep_merchant_setting_key` | `(company_code, merchant_id, setting_key)` | Unique merchant setting |
| 35 | `ep_merchant.tb_ep_merchant_prd_listing_master` | `uq_ep_merchant_listing_code` | `(company_code, listing_code)` | Unique listing offer code |
| 36 | `ep_merchant.tb_ep_merchant_prd_listing_variant_master` | `uq_ep_merchant_listing_var` | `(company_code, listing_id, variant_id)` | Unique listing variant mapping |
| 37 | `ep_merchant.tb_ep_merchant_prd_listing_variant_master` | `uq_ep_merchant_seller_sku` | `(company_code, seller_sku)` | Unique seller SKU |
| 38 | `ep_catalog.tb_ep_catalog_cat_category_master` | `uq_ep_catalog_category_code` | `(company_code, category_code)` | Unique category code |
| 39 | `ep_catalog.tb_ep_catalog_brand_brand_master` | `uq_ep_catalog_brand_code` | `(company_code, brand_code)` | Unique brand code |
| 40 | `ep_catalog.tb_ep_catalog_prd_product_master` | `uq_ep_catalog_product_code` | `(company_code, product_code)` | Unique canonical product |
| 41 | `ep_catalog.tb_ep_catalog_prd_product_variant_master` | `uq_ep_catalog_variant_code` | `(company_code, variant_code)` | Unique canonical SKU |
| 42 | `ep_catalog.tb_ep_catalog_attr_attribute_master` | `uq_ep_catalog_attr_code` | `(company_code, attribute_code)` | Unique attribute code |
| 43 | `ep_catalog.tb_ep_catalog_attr_attribute_value_master` | `uq_ep_catalog_attr_val_code` | `(company_code, attribute_id, value_code)` | Unique option value per attribute |
| 44 | `ep_catalog.tb_ep_catalog_taxonomy_product_category_map` | `uq_ep_catalog_prod_cat_map` | `(company_code, product_id, category_id)` | Unique secondary category link |
| 45 | `ep_inventory.tb_ep_inventory_wh_warehouse_master` | `uq_ep_inventory_wh_code` | `(company_code, warehouse_code)` | Unique warehouse |
| 46 | `ep_inventory.tb_ep_inventory_wh_warehouse_zone_master` | `uq_ep_inventory_zone_code` | `(company_code, warehouse_id, zone_code)` | Unique zone per warehouse |
| 47 | `ep_inventory.tb_ep_inventory_stk_stock_item_master` | `uq_ep_inventory_stock_pos` | `(company_code, warehouse_id, variant_id, merchant_id)` | Unique physical stock item record |
| 48 | `ep_inventory.tb_ep_inventory_trf_transfer_master` | `uq_ep_inventory_trf_no` | `(company_code, transfer_no)` | Unique transfer number |
| 49 | `ep_inventory.tb_ep_inventory_count_stock_count_master` | `uq_ep_inventory_count_no` | `(company_code, count_no)` | Unique count audit number |
| 50 | `ep_inventory.tb_ep_inventory_batch_inventory_batch_master` | `uq_ep_inventory_batch_no` | `(company_code, stock_item_id, batch_no)` | Unique batch per stock item |
| 51 | `ep_inventory.tb_ep_inventory_reorder_reorder_rule_setup` | `uq_ep_inventory_reorder_rule` | `(company_code, stock_item_id)` | Unique reorder rule |
| 52 | `ep_pricing.tb_ep_pricing_price_price_list_master` | `uq_ep_pricing_price_list` | `(company_code, price_list_code)` | Unique price list |
| 53 | `ep_pricing.tb_ep_pricing_discount_discount_rule_master` | `uq_ep_pricing_discount_code` | `(company_code, discount_code)` | Unique discount engine rule |
| 54 | `ep_pricing.tb_ep_pricing_promo_promotion_master` | `uq_ep_pricing_promo_code` | `(company_code, promotion_code)` | Unique promo code |
| 55 | `ep_pricing.tb_ep_pricing_coupon_coupon_master` | `uq_ep_pricing_coupon_code` | `(company_code, coupon_code)` | Unique coupon code |
| 56 | `ep_pricing.tb_ep_pricing_tax_tax_rule_master` | `uq_ep_pricing_tax_rule` | `(company_code, tax_rule_code)` | Unique tax rule |
| 57 | `ep_pricing.tb_ep_pricing_shipping_shipping_rate_rule_master` | `uq_ep_pricing_ship_rule` | `(company_code, rate_rule_code)` | Unique shipping rule |
| 58 | `ep_commerce.tb_ep_commerce_wishlist_wishlist_item_detail` | `uq_ep_commerce_wishlist_item` | `(company_code, wishlist_id, listing_variant_id)` | Unique wishlist item |
| 59 | `ep_commerce.tb_ep_commerce_ord_order_master` | `uq_ep_commerce_order_no` | `(company_code, order_no)` | Unique customer order number |
| 60 | `ep_commerce.tb_ep_commerce_ord_merchant_order_master` | `uq_ep_commerce_merch_ord_no` | `(company_code, merchant_order_no)` | Unique merchant order number |
| 61 | `ep_payment.tb_ep_payment_provider_provider_master` | `uq_ep_payment_provider_code` | `(company_code, provider_code)` | Unique gateway code |
| 62 | `ep_payment.tb_ep_payment_intent_payment_intent_master` | `uq_ep_payment_intent_no` | `(company_code, payment_intent_no)` | Unique payment intent no |
| 63 | `ep_payment.tb_ep_payment_refund_refund_master` | `uq_ep_payment_refund_no` | `(company_code, refund_no)` | Unique refund request no |
| 64 | `ep_payment.tb_ep_payment_webhook_payment_webhook_event` | `uq_ep_payment_webhook_evt` | `(company_code, provider_id, external_event_id)` | Idempotent webhook receipt |
| 65 | `ep_finance.tb_ep_finance_ledger_account_master` | `uq_ep_finance_account_code` | `(company_code, account_code)` | Unique general ledger code |
| 66 | `ep_finance.tb_ep_finance_journal_journal_master` | `uq_ep_finance_journal_no` | `(company_code, journal_no)` | Unique accounting journal voucher |
| 67 | `ep_finance.tb_ep_finance_settlement_merchant_settlement_master` | `uq_ep_finance_settle_no` | `(company_code, settlement_no)` | Unique merchant settlement batch |
| 68 | `ep_finance.tb_ep_finance_payout_merchant_payout_master` | `uq_ep_finance_payout_no` | `(company_code, payout_no)` | Unique payout instruction no |
| 69 | `ep_finance.tb_ep_finance_commission_commission_rule_master` | `uq_ep_finance_comm_rule` | `(company_code, commission_rule_code)` | Unique commission rule |
| 70 | `ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master` | `uq_ep_fulfillment_ful_no` | `(company_code, fulfillment_no)` | Unique fulfillment consignment |
| 71 | `ep_fulfillment.tb_ep_fulfillment_pick_pick_list_master` | `uq_ep_fulfillment_pick_no` | `(company_code, pick_list_no)` | Unique pick list number |
| 72 | `ep_fulfillment.tb_ep_fulfillment_pkg_package_master` | `uq_ep_fulfillment_pkg_no` | `(company_code, package_no)` | Unique carton/package identifier |
| 73 | `ep_logistics.tb_ep_logistics_carrier_carrier_master` | `uq_ep_logistics_carrier_code` | `(company_code, carrier_code)` | Unique carrier identifier |
| 74 | `ep_logistics.tb_ep_logistics_carrier_service_master` | `uq_ep_logistics_carrier_svc` | `(company_code, carrier_id, service_code)` | Unique service code per carrier |
| 75 | `ep_logistics.tb_ep_logistics_shp_shipment_master` | `uq_ep_logistics_shipment_no` | `(company_code, shipment_no)` | Unique shipment number |
| 76 | `ep_logistics.tb_ep_logistics_shp_shipment_package_map` | `uq_ep_logistics_shp_pkg` | `(company_code, shipment_id, package_id)` | Unique package attachment |
| 77 | `ep_logistics.tb_ep_logistics_pickup_pickup_request_master` | `uq_ep_logistics_pickup_no` | `(company_code, pickup_no)` | Unique pickup request |
| 78 | `ep_logistics.tb_ep_logistics_hub_hub_master` | `uq_ep_logistics_hub_code` | `(company_code, hub_code)` | Unique hub identifier |
| 79 | `ep_logistics.tb_ep_logistics_route_route_master` | `uq_ep_logistics_route_code` | `(company_code, route_code)` | Unique transit route |
| 80 | `ep_logistics.tb_ep_logistics_bag_bag_master` | `uq_ep_logistics_bag_no` | `(company_code, bag_no)` | Unique logistics consolidation bag |
| 81 | `ep_logistics.tb_ep_logistics_manifest_manifest_master` | `uq_ep_logistics_manifest_no` | `(company_code, manifest_no)` | Unique manifest document no |
| 82 | `ep_logistics.tb_ep_logistics_rider_rider_master` | `uq_ep_logistics_rider_code` | `(company_code, rider_code)` | Unique rider identifier |
| 83 | `ep_returns.tb_ep_returns_reason_return_reason_master` | `uq_ep_returns_reason_code` | `(company_code, reason_code)` | Unique return reason |
| 84 | `ep_returns.tb_ep_returns_req_return_request_master` | `uq_ep_returns_return_no` | `(company_code, return_no)` | Unique RMA number |
| 85 | `ep_returns.tb_ep_returns_reverse_reverse_shipment_map` | `uq_ep_returns_rev_shp_map` | `(company_code, return_id, shipment_id)` | Unique reverse parcel mapping |
| 86 | `ep_growth.tb_ep_growth_agent_agent_master` | `uq_ep_growth_agent_code` | `(company_code, agent_code)` | Unique agent code |
| 87 | `ep_growth.tb_ep_growth_influencer_influencer_master` | `uq_ep_growth_influencer_code` | `(company_code, influencer_code)` | Unique influencer code |
| 88 | `ep_growth.tb_ep_growth_campaign_campaign_master` | `uq_ep_growth_camp_code` | `(company_code, campaign_code)` | Unique campaign code |
| 89 | `ep_growth.tb_ep_growth_referral_referral_code_master` | `uq_ep_growth_ref_code` | `(company_code, referral_code)` | Unique vanity referral code |
| 90 | `ep_growth.tb_ep_growth_track_tracking_link_master` | `uq_ep_growth_link_code` | `(company_code, link_code)` | Unique deep link code |
| 91 | `ep_content.tb_ep_content_page_page_master` | `uq_ep_content_page_code` | `(company_code, page_code)` | Unique page code |
| 92 | `ep_content.tb_ep_content_page_page_master` | `uq_ep_content_page_slug` | `(company_code, slug)` | Unique page URL slug |
| 93 | `ep_content.tb_ep_content_banner_banner_master` | `uq_ep_content_banner_code` | `(company_code, banner_code)` | Unique banner slot code |
| 94 | `ep_content.tb_ep_content_menu_menu_master` | `uq_ep_content_menu_code` | `(company_code, menu_code)` | Unique menu identifier |
| 95 | `ep_content.tb_ep_content_faq_faq_master` | `uq_ep_content_faq_code` | `(company_code, faq_code)` | Unique FAQ identifier |
| 96 | `ep_comms.tb_ep_comms_template_template_master` | `uq_ep_comms_template_code` | `(company_code, template_code)` | Unique comms template code |
| 97 | `ep_comms.tb_ep_comms_pref_user_channel_preference` | `uq_ep_comms_user_pref` | `(company_code, user_id, communication_type, purpose_code)` | Unique channel opt-in per purpose |
| 98 | `ep_integration.tb_ep_integration_provider_provider_connection_master` | `uq_ep_integration_conn_code` | `(company_code, connection_code)` | Unique external connection code |
| 99 | `ep_integration.tb_ep_integration_outbox_outbox_event_queue` | `uq_ep_integration_outbox_evt` | `(company_code, event_id)` | Exactly-once outbox message |
| 100 | `ep_integration.tb_ep_integration_inbox_inbox_event_log` | `uq_ep_integration_inbox_evt` | `(company_code, source_code, external_event_id)` | Idempotent inbox message |
| 101 | `ep_integration.tb_ep_integration_webhook_webhook_subscription_master` | `uq_ep_integration_sub_code` | `(company_code, subscription_code)` | Unique webhook subscription code |
| 102 | `ep_integration.tb_ep_integration_job_import_job_master` | `uq_ep_integration_import_job` | `(company_code, job_no)` | Unique import job no |
| 103 | `ep_integration.tb_ep_integration_job_export_job_master` | `uq_ep_integration_export_job` | `(company_code, job_no)` | Unique export job no |
| 104 | `ep_support.tb_ep_support_ticket_ticket_master` | `uq_ep_support_ticket_no` | `(company_code, ticket_no)` | Unique support case number |
