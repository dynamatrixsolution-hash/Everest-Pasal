# Everest Pasal - Complete 183-Table Database Catalog

Authoritative Specification: `Everest_Pasal_Database_Design_Documentation.docx`  
Total Schemas: **21** | Total Tables: **183** | Core Identity: PostgreSQL 15+ / 16+

---

## Complete Table Directory by Schema

### 1. `ep_system` Schema (11 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 1 | `ep_system.tb_ep_system_company_company_master` | Master record for each operating company/business tenant. | No | `id`, `company_code`, `company_name`, `country_code`, `currency_code`, `timezone` |
| 2 | `ep_system.tb_ep_system_company_company_address_detail` | Registered, billing, warehouse-office and legal addresses for a company. | No | `id`, `company_code`, `address_type`, `country_code`, `city_code`, `is_primary` |
| 3 | `ep_system.tb_ep_system_company_fiscal_year_master` | Company accounting/operational fiscal calendar cycles. | No | `id`, `company_code`, `fiscal_year_code`, `fiscal_year_name`, `start_date`, `end_date`, `is_current` |
| 4 | `ep_system.tb_ep_system_company_ftp_setup` | FTP/FTPS/SFTP server configurations per company for external batch exchange. | No | `id`, `company_code`, `setup_code`, `protocol`, `host`, `port`, `secret_reference` |
| 5 | `ep_system.tb_ep_system_company_communication_setup` | Provider configurations for SMS, Email, Push, WhatsApp & webhook gateways. | No | `id`, `company_code`, `setup_code`, `communication_type`, `provider_code`, `credential_reference` |
| 6 | `ep_system.tb_ep_system_company_database_link_setup` | Registry of database connection pool targets and roles (read-replica, shard, reporting). | No | `id`, `company_code`, `database_link_code`, `database_name`, `database_role`, `connection_reference` |
| 7 | `ep_system.tb_ep_system_company_database_route_setup` | Routing rules directing module/content/city traffic to specific database links. | No | `id`, `company_code`, `route_code`, `module_code`, `city_code`, `database_link_code`, `priority` |
| 8 | `ep_system.tb_ep_system_company_setting_master` | Dynamic key-value configuration parameters per company. | No | `id`, `company_code`, `setting_group`, `setting_key`, `setting_value`, `value_type`, `is_sensitive` |
| 9 | `ep_system.tb_ep_system_document_number_series_master` | Human-readable numbering generators for orders, invoices, shipments, settlements. | No | `id`, `company_code`, `series_code`, `document_type`, `prefix`, `suffix`, `next_number`, `padding_length` |
| 10 | `ep_system.tb_ep_system_branch_branch_master` | Physical organizational branch and hub offices. | No | `id`, `company_code`, `branch_code`, `branch_name`, `branch_type`, `city_code` |
| 11 | `ep_system.tb_ep_system_feature_feature_flag_setup` | Feature toggles and staged rollout configurations per company. | No | `id`, `company_code`, `feature_code`, `feature_name`, `enabled`, `configuration_json` |

---

### 2. `ep_geo` Schema (8 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 12 | `ep_geo.tb_ep_geo_country_country_master` | Global ISO country master with telephone and currency defaults. | No | `id`, `company_code`, `country_code`, `country_name`, `iso2`, `iso3`, `phone_code` |
| 13 | `ep_geo.tb_ep_geo_province_province_master` | State/province geographic subdivisions per country. | No | `id`, `company_code`, `province_code`, `province_name`, `country_code` |
| 14 | `ep_geo.tb_ep_geo_district_district_master` | District/county subdivisions within provinces. | No | `id`, `company_code`, `district_code`, `district_name`, `province_code` |
| 15 | `ep_geo.tb_ep_geo_city_city_master` | City/municipality lookup used across delivery, tax, and routing. | No | `id`, `company_code`, `city_code`, `city_name`, `district_code`, `province_code`, `country_code` |
| 16 | `ep_geo.tb_ep_geo_postal_postal_code_master` | Postal/ZIP codes with direct serviceability flags. | No | `id`, `company_code`, `postal_code`, `city_code`, `serviceable` |
| 17 | `ep_geo.tb_ep_geo_service_service_area_master` | Operational delivery zones and boundary GeoJSON polygons. | No | `id`, `company_code`, `service_area_code`, `service_area_name`, `city_code`, `polygon_geojson` |
| 18 | `ep_geo.tb_ep_geo_zone_delivery_zone_master` | Grouped logistics delivery tiers and pricing zones. | No | `id`, `company_code`, `zone_code`, `zone_name`, `zone_type` |
| 19 | `ep_geo.tb_ep_geo_zone_delivery_zone_area_map` | Mapping linking cities/service areas to logistics delivery zones. | No | `id`, `company_code`, `zone_code`, `service_area_code`, `city_code` |

---

### 3. `ep_identity` Schema (11 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 20 | `ep_identity.tb_ep_identity_user_user_master` | Unified identity master for customers, merchants, admins, agents, influencers & riders. | No | `id`, `company_code`, `user_code`, `email`, `mobile_no`, `display_name`, `user_type` |
| 21 | `ep_identity.tb_ep_identity_auth_credential_master` | Password hashes and federated SSO/OAuth credentials. | No | `id`, `company_code`, `user_id`, `credential_type`, `password_hash`, `provider_name` |
| 22 | `ep_identity.tb_ep_identity_role_role_master` | Security roles defining access privileges across the 3 application surfaces. | No | `id`, `company_code`, `role_code`, `role_name`, `role_scope` |
| 23 | `ep_identity.tb_ep_identity_permission_permission_master` | Fine-grained functional permission nodes. | No | `id`, `company_code`, `permission_code`, `permission_name`, `module_code` |
| 24 | `ep_identity.tb_ep_identity_role_user_role_map` | User-to-Role assignments with optional domain/tenant scopes. | No | `id`, `company_code`, `user_id`, `role_id`, `scope_type`, `scope_id` |
| 25 | `ep_identity.tb_ep_identity_role_role_permission_map` | Role-to-Permission grant matrix. | No | `id`, `company_code`, `role_id`, `permission_id` |
| 26 | `ep_identity.tb_ep_admin_log_session_master` | Active user sessions, JWT/refresh tokens, device references, and IP tracking. | No | `id`, `company_code`, `user_id`, `session_token_hash`, `refresh_token_hash`, `expires_at`, `revoked_at` |
| 27 | `ep_identity.tb_ep_identity_auth_otp_txn` | One-Time Password tokens for phone/email verification and 2FA. | No | `id`, `company_code`, `user_id`, `destination`, `purpose`, `otp_hash`, `expires_at`, `used_at` |
| 28 | `ep_identity.tb_ep_identity_auth_password_history` | Historical password hashes used to prevent password reuse. | No | `id`, `company_code`, `user_id`, `password_hash`, `changed_at` |
| 29 | `ep_identity.tb_ep_identity_device_device_master` | Registered hardware devices and mobile push notification tokens. | No | `id`, `company_code`, `user_id`, `device_fingerprint`, `device_type`, `push_token` |
| 30 | `ep_identity.tb_ep_identity_api_api_key_master` | Machine-to-machine API credentials with scoped access grants. | No | `id`, `company_code`, `api_key_code`, `owner_type`, `owner_id`, `key_hash`, `scopes_json` |

---

### 4. `ep_customer` Schema (6 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 31 | `ep_customer.tb_ep_customer_profile_customer_master` | Customer profile attributes linked 1:1 with central user identity. | No | `id`, `company_code`, `customer_code`, `user_id`, `first_name`, `last_name`, `gender` |
| 32 | `ep_customer.tb_ep_customer_address_address_detail` | Customer address book (shipping, billing, pickup points). | No | `id`, `company_code`, `customer_id`, `address_type`, `recipient_name`, `city_code`, `is_default` |
| 33 | `ep_customer.tb_ep_customer_pref_preference_master` | Customer UI, newsletter, notification, and marketing preferences. | No | `id`, `company_code`, `customer_id`, `preference_key`, `preference_value` |
| 34 | `ep_customer.tb_ep_customer_saved_payment_reference` | Tokenized saved payment methods (eSewa ID token, Khalti token; no raw cards). | No | `id`, `company_code`, `customer_id`, `provider_code`, `payment_token_reference`, `masked_display` |
| 35 | `ep_customer.tb_ep_customer_fav_favorite_store_map` | Stores followed/favorited by customer. | No | `id`, `company_code`, `customer_id`, `store_id` |
| 36 | `ep_customer.tb_ep_customer_recent_product_view_log` | Real-time browsing history for recommendation engines. | No | `id`, `company_code`, `customer_id`, `product_id`, `viewed_at` |

---

### 5. `ep_merchant` Schema (11 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 37 | `ep_merchant.tb_ep_merchant_vendor_merchant_master` | Merchant/vendor legal entity and merchant operational profile. | No | `id`, `company_code`, `merchant_code`, `merchant_name`, `legal_name`, `onboarding_status` |
| 38 | `ep_merchant.tb_ep_merchant_vendor_member_map` | Staff/user assignments to merchant organizations with roles. | No | `id`, `company_code`, `merchant_id`, `user_id`, `merchant_role` |
| 39 | `ep_merchant.tb_ep_merchant_store_store_master` | Public seller storefronts and sales channels. | No | `id`, `company_code`, `merchant_id`, `store_code`, `store_name`, `slug`, `default_warehouse_id` |
| 40 | `ep_merchant.tb_ep_merchant_address_address_detail` | Merchant registered office, dispatch hubs, and return addresses. | No | `id`, `company_code`, `merchant_id`, `address_type`, `address_line1`, `city_code`, `is_primary` |
| 41 | `ep_merchant.tb_ep_merchant_kyc_document_master` | Merchant document intake metadata linked to `ep_kyc` verification cases. | No | `id`, `company_code`, `merchant_id`, `document_type`, `file_url`, `verification_status`, `kyc_subject_id`, `kyc_case_id` |
| 42 | `ep_merchant.tb_ep_merchant_bank_bank_account_master` | Settlement payout bank accounts and verification status. | No | `id`, `company_code`, `merchant_id`, `bank_name`, `account_name`, `account_no_masked`, `verification_status` |
| 43 | `ep_merchant.tb_ep_merchant_contract_contract_master` | Vendor marketplace legal agreements and SLAs. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `merchant_id`, `contract_no`, `effective_from`, `status` |
| 44 | `ep_merchant.tb_ep_merchant_setting_setting_master` | Merchant-level configuration flags (auto-accept, lead times). | No | `id`, `company_code`, `merchant_id`, `setting_key`, `setting_value`, `value_type` |
| 45 | `ep_merchant.tb_ep_merchant_commission_plan_map` | Assignment of commission rules to merchant accounts. | No | `id`, `company_code`, `merchant_id`, `commission_rule_id`, `effective_from`, `effective_to` |
| 46 | `ep_merchant.tb_ep_merchant_prd_listing_master` | Merchant product catalog offers and listing moderation status. | No | `id`, `company_code`, `merchant_id`, `store_id`, `product_id`, `listing_code`, `approval_status` |
| 47 | `ep_merchant.tb_ep_merchant_prd_listing_variant_master` | Merchant offers for specific canonical SKUs with merchant SKU and conditions. | No | `id`, `company_code`, `listing_id`, `variant_id`, `seller_sku`, `condition_code`, `lead_time_days` |

---

### 6. `ep_catalog` Schema (12 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 48 | `ep_catalog.tb_ep_catalog_cat_category_master` | Canonical multi-level product category hierarchy. | No | `id`, `company_code`, `category_code`, `category_name`, `slug`, `parent_category_id`, `sort_order` |
| 49 | `ep_catalog.tb_ep_catalog_brand_brand_master` | Brand/manufacturer master directory. | No | `id`, `company_code`, `brand_code`, `brand_name`, `slug`, `logo_url` |
| 50 | `ep_catalog.tb_ep_catalog_prd_product_master` | Canonical platform products independent of seller, price, or inventory. | No | `id`, `company_code`, `product_code`, `product_name`, `brand_id`, `category_id`, `approval_status` |
| 51 | `ep_catalog.tb_ep_catalog_prd_product_variant_master` | Canonical sellable variations (size, color, specifications, dimensions). | No | `id`, `company_code`, `product_id`, `variant_code`, `variant_name`, `barcode`, `weight_kg` |
| 52 | `ep_catalog.tb_ep_catalog_attr_attribute_master` | Specifications and variant axis definitions (Color, Size, RAM). | No | `id`, `company_code`, `attribute_code`, `attribute_name`, `data_type`, `is_variant_axis` |
| 53 | `ep_catalog.tb_ep_catalog_attr_attribute_value_master` | Predefined enumerated options for attributes. | No | `id`, `company_code`, `attribute_id`, `value_code`, `value_label`, `sort_order` |
| 54 | `ep_catalog.tb_ep_catalog_attr_product_attribute_map` | Product-level fixed technical specification values. | No | `id`, `company_code`, `product_id`, `attribute_id`, `attribute_value_id`, `value_text` |
| 55 | `ep_catalog.tb_ep_catalog_attr_variant_attribute_map` | Variant-level identifying attribute values. | No | `id`, `company_code`, `variant_id`, `attribute_id`, `attribute_value_id`, `value_text` |
| 56 | `ep_catalog.tb_ep_catalog_media_product_media_detail` | Images, videos, 3D assets for products and variants. | No | `id`, `company_code`, `product_id`, `variant_id`, `media_type`, `media_url`, `is_primary` |
| 57 | `ep_catalog.tb_ep_catalog_doc_product_document_detail` | User manuals, spec sheets, compliance certs. | No | `id`, `company_code`, `product_id`, `document_type`, `document_name`, `document_url` |
| 58 | `ep_catalog.tb_ep_catalog_taxonomy_product_category_map` | Secondary category taxonomy mappings for products. | No | `id`, `company_code`, `product_id`, `category_id`, `is_primary` |
| 59 | `ep_catalog.tb_ep_catalog_review_product_review_master` | Verified buyer product reviews, ratings, and moderation flags. | No | `id`, `company_code`, `product_id`, `customer_id`, `order_item_id`, `rating`, `moderation_status` |

---

### 7. `ep_inventory` Schema (12 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 60 | `ep_inventory.tb_ep_inventory_wh_warehouse_master` | Physical warehouse and fulfillment center locations. | No | `id`, `company_code`, `warehouse_code`, `warehouse_name`, `merchant_id`, `city_code`, `warehouse_type` |
| 61 | `ep_inventory.tb_ep_inventory_wh_warehouse_zone_master` | Storage aisles, racks, bins, and picking zones within a warehouse. | No | `id`, `company_code`, `warehouse_id`, `zone_code`, `zone_name`, `zone_type` |
| 62 | `ep_inventory.tb_ep_inventory_stk_stock_item_master` | Stock position header per warehouse, variant, and merchant. | No | `id`, `company_code`, `warehouse_id`, `variant_id`, `merchant_id`, `sku`, `track_batch`, `track_serial` |
| 63 | `ep_inventory.tb_ep_inventory_stk_stock_movement_txn` | Immutable inventory ledger (receipt, dispatch, adjustment, return, damage). | **Yes** | `id`, `company_code`, `fiscal_year_code`, `stock_item_id`, `movement_type`, `quantity`, `occurred_at` |
| 64 | `ep_inventory.tb_ep_inventory_stk_stock_reservation_txn` | Soft reservations during cart checkout to prevent overselling. | No | `id`, `company_code`, `stock_item_id`, `reservation_type`, `reference_id`, `quantity`, `expires_at` |
| 65 | `ep_inventory.tb_ep_inventory_stk_stock_adjustment_txn` | Stock corrections with discrepancy reason and approval tracking. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `stock_item_id`, `adjustment_reason`, `quantity_delta`, `approved_by` |
| 66 | `ep_inventory.tb_ep_inventory_trf_transfer_master` | Inter-warehouse inventory transfers header. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `transfer_no`, `source_warehouse_id`, `destination_warehouse_id`, `status` |
| 67 | `ep_inventory.tb_ep_inventory_trf_transfer_detail` | Line items and quantities dispatched/received in transfer. | No | `id`, `company_code`, `transfer_id`, `variant_id`, `quantity_requested`, `quantity_dispatched`, `quantity_received` |
| 68 | `ep_inventory.tb_ep_inventory_count_stock_count_master` | Cycle count and physical inventory audit sessions. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `count_no`, `warehouse_id`, `count_type`, `status` |
| 69 | `ep_inventory.tb_ep_inventory_count_stock_count_detail` | Physical vs system stock counts and discrepancy calculations. | No | `id`, `company_code`, `stock_count_id`, `stock_item_id`, `expected_qty`, `counted_qty`, `variance_qty` |
| 70 | `ep_inventory.tb_ep_inventory_batch_inventory_batch_master` | Batch/lot numbers, manufacturing dates, and expiration dates. | No | `id`, `company_code`, `stock_item_id`, `batch_no`, `manufactured_date`, `expiry_date` |
| 71 | `ep_inventory.tb_ep_inventory_reorder_reorder_rule_setup` | Automated replenishment thresholds and safety stock triggers. | No | `id`, `company_code`, `stock_item_id`, `min_qty`, `max_qty`, `reorder_qty`, `lead_time_days` |

---

### 8. `ep_pricing` Schema (10 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 72 | `ep_pricing.tb_ep_pricing_price_price_list_master` | Price books segmented by channel, customer tier, or currency. | No | `id`, `company_code`, `price_list_code`, `price_list_name`, `currency_code`, `valid_from`, `valid_to` |
| 73 | `ep_pricing.tb_ep_pricing_price_product_price_detail` | List, sale, and floor price per listing variant. | No | `id`, `company_code`, `price_list_id`, `listing_variant_id`, `list_price`, `sale_price`, `minimum_price` |
| 74 | `ep_pricing.tb_ep_pricing_discount_discount_rule_master` | Automated catalog discount engines (percentage, fixed amount, tier discounts). | No | `id`, `company_code`, `discount_code`, `discount_name`, `discount_type`, `value`, `valid_from` |
| 75 | `ep_pricing.tb_ep_pricing_promo_promotion_master` | Marketing promotional campaigns and stacking rules. | No | `id`, `company_code`, `promotion_code`, `promotion_name`, `priority`, `valid_from`, `stackable` |
| 76 | `ep_pricing.tb_ep_pricing_promo_promotion_condition_detail` | Eligibility criteria (min order value, category inclusion, user segment). | No | `id`, `company_code`, `promotion_id`, `condition_type`, `operator`, `condition_value_json` |
| 77 | `ep_pricing.tb_ep_pricing_promo_promotion_reward_detail` | Rewards granted (flat discount, percentage, free gift, free shipping). | No | `id`, `company_code`, `promotion_id`, `reward_type`, `reward_value`, `reward_json` |
| 78 | `ep_pricing.tb_ep_pricing_coupon_coupon_master` | Coupon code definitions, limits per customer, and validity windows. | No | `id`, `company_code`, `coupon_code`, `promotion_id`, `max_redemptions`, `max_per_customer` |
| 79 | `ep_pricing.tb_ep_pricing_coupon_coupon_redemption_txn` | Immutable coupon redemption records linking customer, order, and discount. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `coupon_id`, `customer_id`, `order_id`, `discount_amount` |
| 80 | `ep_pricing.tb_ep_pricing_tax_tax_rule_master` | VAT / sales tax calculation rules by tax class and jurisdiction. | No | `id`, `company_code`, `tax_rule_code`, `tax_class_code`, `country_code`, `province_code`, `tax_rate` |
| 81 | `ep_pricing.tb_ep_pricing_shipping_shipping_rate_rule_master` | Base and per-kg logistics charges based on origin and destination zones. | No | `id`, `company_code`, `rate_rule_code`, `origin_zone_code`, `destination_zone_code`, `base_charge` |

---

### 9. `ep_commerce` Schema (14 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 82 | `ep_commerce.tb_ep_commerce_cart_cart_master` | Customer shopping basket session (registered user or guest token). | No | `id`, `company_code`, `customer_id`, `session_key`, `currency_code`, `expires_at` |
| 83 | `ep_commerce.tb_ep_commerce_cart_cart_item_detail` | Line items and quantities inside shopping carts. | No | `id`, `company_code`, `cart_id`, `listing_variant_id`, `quantity`, `unit_price_snapshot` |
| 84 | `ep_commerce.tb_ep_commerce_wishlist_wishlist_master` | Customer saved wishlist headers. | No | `id`, `company_code`, `customer_id`, `wishlist_name` |
| 85 | `ep_commerce.tb_ep_commerce_wishlist_wishlist_item_detail` | Items saved within customer wishlists. | No | `id`, `company_code`, `wishlist_id`, `listing_variant_id` |
| 86 | `ep_commerce.tb_ep_commerce_checkout_checkout_session` | Ephemeral checkout state holding pricing, tax, shipping, and reservation snapshots. | No | `id`, `company_code`, `customer_id`, `cart_id`, `currency_code`, `pricing_snapshot_json` |
| 87 | `ep_commerce.tb_ep_commerce_ord_order_master` | Master customer order representing the complete basket purchase. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_no`, `customer_id`, `grand_total`, `placed_at` |
| 88 | `ep_commerce.tb_ep_commerce_ord_merchant_order_master` | Split sub-order scoped to a single merchant for fulfillment and payout. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `merchant_id`, `merchant_order_no`, `total_amount` |
| 89 | `ep_commerce.tb_ep_commerce_ord_order_item_detail` | Immutable line item snapshots (name, SKU, unit price, tax, discount). | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `merchant_order_id`, `product_id`, `variant_id`, `line_total` |
| 90 | `ep_commerce.tb_ep_commerce_ord_order_address_snapshot` | Immutable delivery and billing address text at the moment of checkout. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `address_type`, `recipient_name`, `city_name` |
| 91 | `ep_commerce.tb_ep_commerce_ord_order_charge_detail` | Additional order charges (shipping fees, COD fee, gift wrapping, insurance). | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `merchant_order_id`, `charge_type`, `charge_amount` |
| 92 | `ep_commerce.tb_ep_commerce_ord_order_discount_detail` | Promotion and coupon discounts applied to order header or line items. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `order_item_id`, `discount_type`, `discount_amount` |
| 93 | `ep_commerce.tb_ep_commerce_ord_order_status_history` | Complete immutable state machine audit trail of order transitions. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `from_status`, `to_status`, `changed_at`, `changed_by` |
| 94 | `ep_commerce.tb_ep_commerce_ord_order_note_detail` | Customer, seller, and customer-service internal notes. | No | `id`, `company_code`, `order_id`, `note_type`, `note_text`, `visibility` |
| 95 | `ep_commerce.tb_ep_commerce_ord_order_cancellation_txn` | Cancellation requests, approval lifecycle, and cancellation reasons. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `merchant_order_id`, `reason_code`, `status` |

---

### 10. `ep_payment` Schema (7 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 96 | `ep_payment.tb_ep_payment_provider_provider_master` | Gateway masters (eSewa, Khalti, ConnectIPS, Fonepay, COD). | No | `id`, `company_code`, `provider_code`, `provider_name`, `provider_type`, `supports_refund` |
| 97 | `ep_payment.tb_ep_payment_intent_payment_intent_master` | High-level payment session tracking total expected collection. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `payment_intent_no`, `order_id`, `customer_id`, `amount`, `status` |
| 98 | `ep_payment.tb_ep_payment_txn_payment_transaction_txn` | Immutable gateway transaction attempts, gateway references, and response JSON. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `payment_intent_id`, `transaction_type`, `amount`, `status`, `provider_transaction_id` |
| 99 | `ep_payment.tb_ep_payment_refund_refund_master` | Customer refund requests and authorized refund totals. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `refund_no`, `order_id`, `payment_intent_id`, `amount`, `status` |
| 100 | `ep_payment.tb_ep_payment_refund_refund_transaction_txn` | Gateway payout execution records for refunds. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `refund_id`, `provider_transaction_id`, `amount`, `status` |
| 101 | `ep_payment.tb_ep_payment_cod_cod_receivable_master` | Cash-on-Delivery collections pending from riders or logistics partners. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `order_id`, `shipment_id`, `cod_amount`, `collection_status` |
| 102 | `ep_payment.tb_ep_payment_webhook_payment_webhook_event` | Raw inbound payment gateway webhooks for asynchronous verification. | No | `id`, `company_code`, `provider_id`, `external_event_id`, `event_type`, `payload_json`, `processing_status` |

---

### 11. `ep_finance` Schema (9 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 103 | `ep_finance.tb_ep_finance_ledger_account_master` | General chart of accounts and sub-ledgers. | No | `id`, `company_code`, `account_code`, `account_name`, `account_type`, `parent_account_id` |
| 104 | `ep_finance.tb_ep_finance_journal_journal_master` | Double-entry general journal voucher headers. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `journal_no`, `journal_type`, `journal_date`, `status` |
| 105 | `ep_finance.tb_ep_finance_journal_journal_line_detail` | Double-entry debit and credit lines linked to accounts, merchants, or customers. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `journal_id`, `account_id`, `debit_amount`, `credit_amount` |
| 106 | `ep_finance.tb_ep_finance_settlement_merchant_settlement_master` | Periodic vendor payout calculation batches. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `settlement_no`, `merchant_id`, `gross_sales`, `commission_amount`, `net_payable` |
| 107 | `ep_finance.tb_ep_finance_settlement_settlement_item_detail` | Line-item order breakdown contributing to a merchant settlement batch. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `settlement_id`, `order_id`, `merchant_order_id`, `amount` |
| 108 | `ep_finance.tb_ep_finance_payout_merchant_payout_master` | Bank transfer payout instructions for settled vendor earnings. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `payout_no`, `merchant_id`, `settlement_id`, `amount`, `status` |
| 109 | `ep_finance.tb_ep_finance_payout_payout_transaction_txn` | Bank API transaction responses and transfer verification logs. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `payout_id`, `provider_reference`, `amount`, `status` |
| 110 | `ep_finance.tb_ep_finance_commission_commission_rule_master` | Commission fee formulas (percentage, fixed, hybrid, category-based). | No | `id`, `company_code`, `commission_rule_code`, `commission_type`, `basis_type`, `rate`, `valid_from` |
| 111 | `ep_finance.tb_ep_finance_commission_commission_entry_txn` | Immutable commission transactions computed upon order fulfillment. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `commission_rule_id`, `beneficiary_type`, `beneficiary_id`, `amount` |

---

### 12. `ep_fulfillment` Schema (7 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 112 | `ep_fulfillment.tb_ep_fulfillment_alloc_stock_allocation_master` | Warehouse inventory reserved and allocated for order fulfillment. | No | `id`, `company_code`, `order_item_id`, `warehouse_id`, `stock_item_id`, `quantity`, `status` |
| 113 | `ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master` | Merchant warehouse fulfillment consignment batch. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `fulfillment_no`, `merchant_order_id`, `warehouse_id`, `status` |
| 114 | `ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_item_detail` | Items packed into a specific fulfillment consignment. | No | `id`, `company_code`, `fulfillment_id`, `order_item_id`, `quantity`, `status` |
| 115 | `ep_fulfillment.tb_ep_fulfillment_pick_pick_list_master` | Warehouse floor pick-list batch header. | No | `id`, `company_code`, `pick_list_no`, `fulfillment_id`, `warehouse_id`, `assigned_user_id`, `status` |
| 116 | `ep_fulfillment.tb_ep_fulfillment_pick_pick_list_item_detail` | Bin and aisle picking instructions per stock item. | No | `id`, `company_code`, `pick_list_id`, `stock_item_id`, `zone_id`, `quantity_required`, `quantity_picked` |
| 117 | `ep_fulfillment.tb_ep_fulfillment_pkg_package_master` | Physical carton/parcel package with dimensions and dead weight. | No | `id`, `company_code`, `package_no`, `fulfillment_id`, `weight_kg`, `length_cm`, `width_cm`, `height_cm` |
| 118 | `ep_fulfillment.tb_ep_fulfillment_pkg_package_item_detail` | Specific item SKU and serial number breakdown inside each package. | No | `id`, `company_code`, `package_id`, `order_item_id`, `quantity` |

---

### 13. `ep_logistics` Schema (17 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 119 | `ep_logistics.tb_ep_logistics_carrier_carrier_master` | Logistics courier companies and fleet providers. | No | `id`, `company_code`, `carrier_code`, `carrier_name`, `carrier_type` |
| 120 | `ep_logistics.tb_ep_logistics_carrier_service_master` | Carrier service offerings (Same-Day, Express, Standard, Cargo). | No | `id`, `company_code`, `carrier_id`, `service_code`, `service_name`, `supports_cod` |
| 121 | `ep_logistics.tb_ep_logistics_rate_shipment_rate_quote` | Persisted rate calculation quotes generated during dispatch. | No | `id`, `company_code`, `order_id`, `carrier_service_id`, `quoted_amount`, `currency_code` |
| 122 | `ep_logistics.tb_ep_logistics_shp_shipment_master` | Shipment master dispatch record with tracking number and COD balance. | No | `id`, `company_code`, `shipment_no`, `fulfillment_id`, `carrier_id`, `tracking_no`, `status`, `cod_amount` |
| 123 | `ep_logistics.tb_ep_logistics_shp_shipment_package_map` | Mapping linking packages to courier shipment manifests. | No | `id`, `company_code`, `shipment_id`, `package_id` |
| 124 | `ep_logistics.tb_ep_logistics_label_shipment_label_master` | Shipping label / AWB barcode document metadata. | No | `id`, `company_code`, `shipment_id`, `label_type`, `label_url`, `label_format` |
| 125 | `ep_logistics.tb_ep_logistics_track_tracking_event_txn` | Granular tracking milestones (scanned at hub, out for delivery). | No | `id`, `company_code`, `shipment_id`, `event_code`, `event_status`, `event_time`, `location_text` |
| 126 | `ep_logistics.tb_ep_logistics_pickup_pickup_request_master` | Merchant warehouse courier pickup scheduling. | No | `id`, `company_code`, `pickup_no`, `warehouse_id`, `carrier_id`, `requested_date`, `status` |
| 127 | `ep_logistics.tb_ep_logistics_hub_hub_master` | Carrier sorting hubs, transit depots, and distribution centers. | No | `id`, `company_code`, `hub_code`, `hub_name`, `city_code`, `hub_type` |
| 128 | `ep_logistics.tb_ep_logistics_route_route_master` | Linehaul and last-mile delivery transit routes. | No | `id`, `company_code`, `route_code`, `route_name`, `origin_hub_id`, `destination_hub_id` |
| 129 | `ep_logistics.tb_ep_logistics_bag_bag_master` | Logistics consolidation bags/sacks for transit between hubs. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `bag_no`, `origin_hub_id`, `destination_hub_id`, `status` |
| 130 | `ep_logistics.tb_ep_logistics_bag_bag_item_detail` | Shipments scanned into consolidation bags. | No | `id`, `company_code`, `bag_id`, `shipment_id`, `added_at` |
| 131 | `ep_logistics.tb_ep_logistics_manifest_manifest_master` | Transport dispatch manifest for trucks, planes, or linehaul trips. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `manifest_no`, `route_id`, `origin_hub_id`, `status` |
| 132 | `ep_logistics.tb_ep_logistics_manifest_manifest_item_detail` | Bags and loose parcels attached to transport manifest. | No | `id`, `company_code`, `manifest_id`, `bag_id`, `shipment_id` |
| 133 | `ep_logistics.tb_ep_logistics_rider_rider_master` | Delivery riders and fleet driver profiles. | No | `id`, `company_code`, `rider_code`, `user_id`, `carrier_id`, `vehicle_type`, `license_no` |
| 134 | `ep_logistics.tb_ep_logistics_rider_rider_assignment_txn` | Assignment of last-mile parcels to specific delivery riders. | No | `id`, `company_code`, `rider_id`, `shipment_id`, `assigned_at`, `status` |
| 135 | `ep_logistics.tb_ep_logistics_pod_proof_of_delivery_txn` | Proof of Delivery records (digital signature, recipient name, geo-coordinates, photo). | No | `id`, `company_code`, `shipment_id`, `rider_id`, `pod_type`, `recipient_name`, `proof_url`, `latitude`, `longitude` |

---

### 14. `ep_returns` Schema (6 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 136 | `ep_returns.tb_ep_returns_reason_return_reason_master` | Customer return reason codes and evidence requirements. | No | `id`, `company_code`, `reason_code`, `reason_name`, `customer_visible`, `requires_evidence` |
| 137 | `ep_returns.tb_ep_returns_req_return_request_master` | RMA (Return Merchandise Authorization) case header. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `return_no`, `order_id`, `customer_id`, `status`, `resolution_type` |
| 138 | `ep_returns.tb_ep_returns_req_return_item_detail` | Items requested for return, claimed reasons, and uploaded evidence images. | No | `id`, `company_code`, `return_id`, `order_item_id`, `reason_id`, `quantity`, `evidence_json` |
| 139 | `ep_returns.tb_ep_returns_inspect_return_inspection_txn` | Warehouse return quality check (QC) decision and condition scoring. | No | `id`, `company_code`, `return_item_id`, `inspected_by`, `condition_code`, `decision`, `inspected_at` |
| 140 | `ep_returns.tb_ep_returns_reverse_reverse_shipment_map` | Reverse logistics tracking linking customer return to courier parcel. | No | `id`, `company_code`, `return_id`, `shipment_id` |
| 141 | `ep_returns.tb_ep_returns_stock_restock_action_txn` | Restocking or scrapping inventory disposition following QC inspection. | No | `id`, `company_code`, `return_item_id`, `warehouse_id`, `action_type`, `quantity`, `stock_movement_id` |

---

### 15. `ep_growth` Schema (7 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 142 | `ep_growth.tb_ep_growth_agent_agent_master` | Growth agent / field affiliate profiles. | No | `id`, `company_code`, `agent_code`, `user_id`, `agent_type`, `city_code`, `status` |
| 143 | `ep_growth.tb_ep_growth_influencer_influencer_master` | Social media influencer profiles and partner channels. | No | `id`, `company_code`, `influencer_code`, `user_id`, `display_name`, `platforms_json` |
| 144 | `ep_growth.tb_ep_growth_campaign_campaign_master` | Marketing campaigns, affiliate initiatives, and budgets. | No | `id`, `company_code`, `campaign_code`, `campaign_name`, `campaign_type`, `valid_from`, `budget_amount` |
| 145 | `ep_growth.tb_ep_growth_referral_referral_code_master` | Vanity referral and affiliate promotion codes. | No | `id`, `company_code`, `referral_code`, `campaign_id`, `owner_type`, `owner_id`, `valid_from` |
| 146 | `ep_growth.tb_ep_growth_track_tracking_link_master` | Deep links with UTM parameter tracking. | No | `id`, `company_code`, `link_code`, `campaign_id`, `owner_type`, `owner_id`, `target_url`, `utm_json` |
| 147 | `ep_growth.tb_ep_growth_attr_attribution_txn` | Click-through and order conversion attribution ledger. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `customer_id`, `order_id`, `campaign_id`, `referral_code_id`, `model` |
| 148 | `ep_growth.tb_ep_growth_commission_commission_event_txn` | Affiliate/influencer commission earnings calculation logs. | **Yes** | `id`, `company_code`, `fiscal_year_code`, `attribution_id`, `order_id`, `beneficiary_type`, `commission_amount` |

---

### 16. `ep_content` Schema (5 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 149 | `ep_content.tb_ep_content_page_page_master` | Headless CMS pages (About Us, Terms, Privacy Policy, Landing pages). | No | `id`, `company_code`, `page_code`, `page_title`, `slug`, `page_type`, `content_json`, `seo_json` |
| 150 | `ep_content.tb_ep_content_banner_banner_master` | Homepage hero carousels and promotional banner placements. | No | `id`, `company_code`, `banner_code`, `banner_name`, `placement_code`, `image_url`, `target_url` |
| 151 | `ep_content.tb_ep_content_menu_menu_master` | Navigation menu containers (header, footer, mobile drawer). | No | `id`, `company_code`, `menu_code`, `menu_name`, `channel_code` |
| 152 | `ep_content.tb_ep_content_menu_menu_item_detail` | Hierarchical menu nodes, labels, category links, and custom URLs. | No | `id`, `company_code`, `menu_id`, `parent_item_id`, `label`, `target_type`, `target_value`, `sort_order` |
| 153 | `ep_content.tb_ep_content_faq_faq_master` | Frequently Asked Questions repository categorized by audience. | No | `id`, `company_code`, `faq_code`, `question`, `answer`, `audience_type`, `sort_order` |

---

### 17. `ep_comms` Schema (5 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 154 | `ep_comms.tb_ep_comms_template_template_master` | Multilingual message templates for SMS, Email, Push & WhatsApp. | No | `id`, `company_code`, `template_code`, `communication_type`, `template_name`, `subject_template`, `body_template` |
| 155 | `ep_comms.tb_ep_comms_notify_notification_master` | System notification event queue. | No | `id`, `company_code`, `template_id`, `notification_type`, `reference_type`, `reference_id`, `title`, `body` |
| 156 | `ep_comms.tb_ep_comms_notify_notification_recipient_detail` | Intended recipients and delivery status per channel. | No | `id`, `company_code`, `notification_id`, `user_id`, `recipient_address`, `communication_type`, `status` |
| 157 | `ep_comms.tb_ep_comms_delivery_delivery_attempt_txn` | Gateway transmission attempts, message IDs, and provider response logs. | No | `id`, `company_code`, `notification_recipient_id`, `provider_code`, `attempt_no`, `status`, `provider_message_id` |
| 158 | `ep_comms.tb_ep_comms_pref_user_channel_preference` | User opt-in / opt-out preferences by communication channel and notification purpose. | No | `id`, `company_code`, `user_id`, `communication_type`, `purpose_code`, `opted_in` |

---

### 18. `ep_integration` Schema (7 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 159 | `ep_integration.tb_ep_integration_provider_provider_connection_master` | External API endpoints and connection parameters (ERP, couriers, payment). | No | `id`, `company_code`, `connection_code`, `provider_type`, `provider_code`, `base_url`, `credential_reference` |
| 160 | `ep_integration.tb_ep_integration_outbox_outbox_event_queue` | Transactional Outbox pattern event queue for guaranteed event delivery. | No | `id`, `company_code`, `event_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload_json`, `published_at` |
| 161 | `ep_integration.tb_ep_integration_inbox_inbox_event_log` | Transactional Inbox pattern log guaranteeing exactly-once consumer processing. | No | `id`, `company_code`, `source_code`, `external_event_id`, `event_type`, `payload_hash`, `status` |
| 162 | `ep_integration.tb_ep_integration_webhook_webhook_subscription_master` | Webhook endpoints registered by external merchant/partner systems. | No | `id`, `company_code`, `subscription_code`, `subscriber_name`, `endpoint_url`, `event_types_json` |
| 163 | `ep_integration.tb_ep_integration_webhook_webhook_delivery_queue` | Outbound webhook delivery queue with retry scheduling and response codes. | No | `id`, `company_code`, `subscription_id`, `event_id`, `payload_json`, `attempt_count`, `next_attempt_at` |
| 164 | `ep_integration.tb_ep_integration_job_import_job_master` | Async batch data import jobs (CSV/Excel product or price updates). | No | `id`, `company_code`, `job_no`, `import_type`, `source_file_url`, `status`, `total_rows`, `success_rows` |
| 165 | `ep_integration.tb_ep_integration_job_export_job_master` | Async batch data export jobs and generated download URLs. | No | `id`, `company_code`, `job_no`, `export_type`, `filter_json`, `status`, `output_file_url` |

---

### 19. `ep_support` Schema (4 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 166 | `ep_support.tb_ep_support_ticket_ticket_master` | Customer/merchant support tickets linked to orders, products, or refunds. | No | `id`, `company_code`, `ticket_no`, `requester_user_id`, `requester_type`, `subject`, `priority`, `status` |
| 167 | `ep_support.tb_ep_support_ticket_ticket_message_detail` | Threaded customer support messages and agent responses. | No | `id`, `company_code`, `ticket_id`, `sender_user_id`, `message_text`, `visibility` |
| 168 | `ep_support.tb_ep_support_ticket_ticket_attachment_detail` | Screenshots and file attachments uploaded in support conversations. | No | `id`, `company_code`, `ticket_id`, `message_id`, `file_name`, `file_url`, `mime_type` |
| 169 | `ep_support.tb_ep_support_ticket_ticket_status_history` | Audit log of ticket state changes and support representative assignments. | No | `id`, `company_code`, `ticket_id`, `from_status`, `to_status`, `changed_by`, `changed_at` |

---

### 20. `ep_audit` Schema (4 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 170 | `ep_audit.tb_ep_audit_activity_activity_log` | High-level user interaction events across Admin, Vendor, and Customer surfaces. | No | `id`, `company_code`, `user_id`, `activity_type`, `module_code`, `ip_address`, `activity_at` |
| 171 | `ep_audit.tb_ep_audit_entity_entity_change_log` | Change Data Capture (CDC) capturing `before_json` and `after_json` deltas. | No | `id`, `company_code`, `entity_schema`, `entity_table`, `entity_id`, `operation_type`, `before_json`, `after_json` |
| 172 | `ep_audit.tb_ep_audit_security_security_event_log` | Security audit trail (failed logins, privilege escalations, suspicious API keys). | No | `id`, `company_code`, `user_id`, `event_type`, `severity`, `ip_address`, `event_at`, `details_json` |
| 173 | `ep_audit.tb_ep_audit_access_data_access_log` | Audit log of access to PII and sensitive financial records. | No | `id`, `company_code`, `user_id`, `resource_type`, `resource_id`, `action`, `accessed_at`, `ip_address` |

---

### 21. `ep_kyc` Schema (10 Tables)
| # | Physical Table Name | Purpose | FY Req | Key Columns / Identifiers |
|---|---|---|:---:|---|
| 174 | `ep_kyc.tb_ep_kyc_subject_subject_master` | Universal KYC subject registry for Person or Business (Merchant, Rider, Agent, User). | No | `id`, `company_code`, `subject_type`, `user_id`, `merchant_id`, `legal_name`, `current_status`, `current_risk_level` |
| 175 | `ep_kyc.tb_ep_kyc_requirement_requirement_setup` | Regulatory and compliance requirement rules per jurisdiction and subject type. | No | `id`, `company_code`, `requirement_code`, `subject_type`, `document_type`, `check_type`, `mandatory` |
| 176 | `ep_kyc.tb_ep_kyc_case_verification_case_master` | Verification case workflow (Initial, Re-verify, Profile Change, Manual Review). | No | `id`, `company_code`, `subject_id`, `case_no`, `case_type`, `status`, `risk_level`, `assigned_to` |
| 177 | `ep_kyc.tb_ep_kyc_document_document_master` | Protected metadata and encrypted object references for identity documents. | No | `id`, `company_code`, `case_id`, `document_type`, `document_no_masked`, `storage_provider`, `file_reference`, `checksum_sha256` |
| 178 | `ep_kyc.tb_ep_kyc_check_verification_check_txn` | Granular automated and manual verification checks (Identity, Face Match, Registry). | No | `id`, `company_code`, `case_id`, `document_id`, `provider_id`, `check_type`, `status`, `result_code` |
| 179 | `ep_kyc.tb_ep_kyc_provider_provider_master` | Internal and external KYC verification service providers. | No | `id`, `company_code`, `provider_code`, `provider_name`, `provider_type`, `supported_checks` |
| 180 | `ep_kyc.tb_ep_kyc_provider_provider_response_log` | Tamper-evident hashed audit logs of provider API exchanges. | No | `id`, `company_code`, `check_id`, `provider_id`, `http_status`, `response_code`, `request_hash`, `response_hash` |
| 181 | `ep_kyc.tb_ep_kyc_risk_risk_flag_txn` | Compliance and anti-fraud risk flags raised during verification. | No | `id`, `company_code`, `case_id`, `check_id`, `risk_type`, `severity`, `status`, `raised_at` |
| 182 | `ep_kyc.tb_ep_kyc_decision_decision_history` | Immutable compliance decision records (Approve, Reject, Needs Info, Suspend). | No | `id`, `company_code`, `case_id`, `decision`, `decision_reason_code`, `decided_by`, `decided_at` |
| 183 | `ep_kyc.tb_ep_kyc_consent_consent_txn` | Legal consent and terms acceptance evidence for KYC and personal data processing. | No | `id`, `company_code`, `subject_id`, `case_id`, `consent_type`, `consent_version`, `accepted`, `accepted_at` |
