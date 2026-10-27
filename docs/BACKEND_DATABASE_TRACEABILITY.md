# Everest Pasal — Backend to Database Traceability Matrix

This document maps every backend API, Controller, Business Service, and Repository directly down to the physical PostgreSQL 18 Schemas and 183 Base Tables.

---

## 1. System & Geography Domain (`ep_system` & `ep_geo`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/system/companies` | `getCompaniesHandler` | `SystemRepository.getAllCompanies()` | `ep_system` | `tb_ep_system_company_company_master` |
| `GET /api/v1/system/fiscal-years` | `getFiscalYearsHandler` | `SystemRepository.getFiscalYears()` | `ep_system` | `tb_ep_system_company_fiscal_year_master` |
| `GET /api/v1/system/feature-flags` | `getFeatureFlagsHandler` | `SystemRepository.getFeatureFlags()` | `ep_system` | `tb_ep_system_feature_feature_flag_setup` |
| `GET /api/v1/system/settings` | `getSettingsHandler` | `SystemRepository.getSettings()` | `ep_system` | `tb_ep_system_company_setting_master` |
| `GET /api/v1/geo/countries` | `getCountriesHandler` | `GeoRepository.getCountries()` | `ep_geo` | `tb_ep_geo_country_country_master` |
| `GET /api/v1/geo/provinces` | `getProvincesHandler` | `GeoRepository.getProvinces()` | `ep_geo` | `tb_ep_geo_province_province_master` |
| `GET /api/v1/geo/districts` | `getDistrictsHandler` | `GeoRepository.getDistricts()` | `ep_geo` | `tb_ep_geo_district_district_master` |
| `GET /api/v1/geo/municipalities` | `getMunicipalitiesHandler` | `GeoRepository.getMunicipalities()` | `ep_geo` | `tb_ep_geo_municipality_municipality_master` |
| `GET /api/v1/geo/delivery-zones` | `getDeliveryZonesHandler` | `GeoRepository.getDeliveryZones()` | `ep_geo` | `tb_ep_geo_zone_delivery_zone_master` |

---

## 2. Identity, KYC & Customer Domain (`ep_identity`, `ep_kyc`, `ep_customer`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/register` | `registerHandler` | `AuthService.register()` <br> `UserRepository.create()` | `ep_identity` | `tb_ep_identity_user_user_master`<br>`tb_ep_identity_auth_credential_master`<br>`tb_ep_identity_role_user_role_map` |
| `POST /api/v1/auth/login` | `loginHandler` | `AuthService.login()` <br> `UserRepository.createSession()` | `ep_identity` | `tb_ep_identity_user_user_master`<br>`tb_ep_identity_auth_credential_master`<br>`tb_ep_admin_log_session_master` |
| `POST /api/v1/auth/request-otp` | `requestOtpHandler` | `AuthService.requestOtp()` | `ep_identity` | `tb_ep_identity_auth_otp_txn` |
| `POST /api/v1/auth/verify-otp` | `verifyOtpHandler` | `AuthService.verifyOtp()` | `ep_identity` | `tb_ep_identity_auth_otp_txn` |
| `GET /api/v1/customer/profile` | `getCustomerProfileHandler` | `CustomerRepository.getProfileByUserId()` | `ep_customer` | `tb_ep_customer_profile_customer_master`<br>`tb_ep_identity_user_user_master` |
| `POST /api/v1/customer/addresses` | `createCustomerAddressHandler` | `CustomerRepository.createAddress()` | `ep_customer` | `tb_ep_customer_address_address_detail` |
| `GET /api/v1/kyc/me` | `getMyKycCaseHandler` | `KycRepository.getCaseBySubjectId()` | `ep_kyc` | `tb_ep_kyc_subject_subject_master`<br>`tb_ep_kyc_case_verification_case_master`<br>`tb_ep_kyc_document_document_master` |
| `POST /api/v1/kyc/documents` | `uploadKycDocumentHandler` | `KycRepository.uploadDocument()` | `ep_kyc` | `tb_ep_kyc_document_document_master` |
| `POST /api/v1/kyc/submit` | `submitKycCaseHandler` | `KycRepository.submitCase()` | `ep_kyc` | `tb_ep_kyc_case_verification_case_master` |
| `POST /api/v1/admin/kyc/decide` | `recordKycDecisionHandler` | `KycRepository.recordDecision()` | `ep_kyc` | `tb_ep_kyc_decision_decision_history`<br>`tb_ep_kyc_case_verification_case_master` |

---

## 3. Merchant & Catalog Domain (`ep_merchant` & `ep_catalog`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/vendors/onboarding` | `vendorOnboardingHandler` | `VendorRepository.createMerchant()` | `ep_merchant` | `tb_ep_merchant_org_merchant_master`<br>`tb_ep_merchant_store_store_master` |
| `GET /api/v1/vendors/me` | `getMyVendorProfileHandler` | `VendorRepository.getMerchantByUserId()` | `ep_merchant` | `tb_ep_merchant_org_merchant_master`<br>`tb_ep_merchant_store_store_master` |
| `POST /api/v1/admin/vendors/:id/approve` | `approveVendorHandler` | `VendorRepository.updateMerchantStatus()` | `ep_merchant` | `tb_ep_merchant_org_merchant_master` |
| `GET /api/v1/products` | `listProductsHandler` | `CatalogService.listProducts()` <br> `CatalogRepository.listProducts()` | `ep_catalog` | `tb_ep_catalog_prd_product_master`<br>`tb_ep_catalog_prd_product_variant_master`<br>`tb_ep_catalog_cat_category_master` |
| `GET /api/v1/products/:id` | `getProductByIdHandler` | `CatalogRepository.findById()` | `ep_catalog` | `tb_ep_catalog_prd_product_master`<br>`tb_ep_catalog_prd_product_variant_master`<br>`tb_ep_catalog_med_product_media_gallery` |
| `GET /api/v1/search/products` | `searchProductsHandler` | `CatalogRepository.searchProducts()` | `ep_catalog` | `tb_ep_catalog_prd_product_master`<br>`tb_ep_catalog_prd_product_variant_master`<br>`tb_ep_pricing_price_product_price_detail` |
| `GET /api/v1/categories` | `listCategoriesHandler` | `CatalogRepository.getCategories()` | `ep_catalog` | `tb_ep_catalog_cat_category_master` |
| `GET /api/v1/brands` | `listBrandsHandler` | `CatalogRepository.getBrands()` | `ep_catalog` | `tb_ep_catalog_brd_brand_master` |

---

## 4. Inventory & Pricing Domain (`ep_inventory` & `ep_pricing`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/inventory/warehouses` | `getWarehousesHandler` | `InventoryRepository.getWarehouses()` | `ep_inventory` | `tb_ep_inventory_wh_warehouse_master` |
| `POST /api/v1/inventory/adjust` | `adjustStockHandler` | `InventoryRepository.adjustStock()` | `ep_inventory` | `tb_ep_inventory_stk_stock_item_master`<br>`tb_ep_inventory_stk_stock_movement_txn`<br>`tb_ep_inventory_stk_stock_adjustment_txn` |
| `POST /api/v1/inventory/reserve` | `reserveStockHandler` | `InventoryRepository.reserveStock()` | `ep_inventory` | `tb_ep_inventory_stk_stock_reservation_txn` |
| `GET /api/v1/pricing/price-lists` | `getPriceListsHandler` | `PricingRepository.getPriceLists()` | `ep_pricing` | `tb_ep_pricing_price_price_list_master` |
| `POST /api/v1/pricing/coupons/validate`| `validateCouponHandler` | `PricingRepository.findValidCoupon()` | `ep_pricing` | `tb_ep_pricing_coupon_coupon_master`<br>`tb_ep_pricing_promo_promotion_master`<br>`tb_ep_pricing_promo_promotion_reward_detail` |
| `GET /api/v1/pricing/tax-rules` | `getTaxRulesHandler` | `PricingRepository.getTaxRules()` | `ep_pricing` | `tb_ep_pricing_tax_tax_rule_master` |
| `GET /api/v1/pricing/shipping-rates` | `getShippingRatesHandler` | `PricingRepository.getShippingRateRules()` | `ep_pricing` | `tb_ep_pricing_shipping_shipping_rate_rule_master` |

---

## 5. Commerce, Orders & Payments (`ep_commerce` & `ep_payment`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/cart` | `getActiveCartHandler` | `CartService.getOrCreateActiveBasket()` | `ep_commerce` | `tb_ep_commerce_cart_shopping_cart_master`<br>`tb_ep_commerce_cart_shopping_cart_item` |
| `POST /api/v1/cart/items` | `addItemToCartHandler` | `CartService.addItem()` | `ep_commerce` | `tb_ep_commerce_cart_shopping_cart_item` |
| `POST /api/v1/checkout/orders` | `createOrderHandler` | `OrderService.createCustomerOrder()` | `ep_commerce` | `tb_ep_commerce_ord_order_master`<br>`tb_ep_commerce_ord_order_item_detail`<br>`tb_ep_commerce_ord_order_charge_detail`<br>`tb_ep_commerce_ord_order_status_history` |
| `GET /api/v1/orders/my-orders` | `getMyOrdersHandler` | `OrderService.getCustomerOrders()` | `ep_commerce` | `tb_ep_commerce_ord_order_master`<br>`tb_ep_commerce_ord_order_item_detail` |
| `POST /api/v1/orders/:id/cancel` | `cancelOrderHandler` | `OrderService.cancelOrder()` | `ep_commerce` | `tb_ep_commerce_ord_order_master`<br>`tb_ep_commerce_ord_order_status_history` |
| `GET /api/v1/payments/providers` | `getPaymentProvidersHandler` | `PaymentRepository.getProviders()` | `ep_payment` | `tb_ep_payment_provider_provider_master` |
| `POST /api/v1/payments/intents` | `createPaymentIntentHandler` | `PaymentRepository.createPaymentIntent()` | `ep_payment` | `tb_ep_payment_intent_payment_intent_master` |
| `POST /api/v1/payments/transactions`| `recordPaymentTransactionHandler`| `PaymentRepository.recordTransaction()` | `ep_payment` | `tb_ep_payment_txn_payment_transaction_txn`<br>`tb_ep_payment_intent_payment_intent_master` |
| `POST /api/v1/payments/webhooks` | `paymentWebhookHandler` | `PaymentRepository.recordWebhookEvent()` | `ep_payment` | `tb_ep_payment_webhook_payment_webhook_event` |
| `POST /api/v1/payments/refunds` | `createRefundHandler` | `PaymentRepository.createRefund()` | `ep_payment` | `tb_ep_payment_refund_refund_master` |

---

## 6. Finance, Fulfillment, Logistics & Returns (`ep_finance`, `ep_fulfillment`, `ep_logistics`, `ep_returns`)

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/finance/accounts` | `getLedgerAccountsHandler` | `FinanceRepository.getAccounts()` | `ep_finance` | `tb_ep_finance_account_general_ledger_account` |
| `POST /api/v1/finance/journals` | `postJournalEntryHandler` | `FinanceRepository.createJournalEntry()` | `ep_finance` | `tb_ep_finance_journal_journal_master`<br>`tb_ep_finance_journal_journal_line_detail` |
| `GET /api/v1/fulfillment/allocations`| `getAllocationsHandler` | `FulfillmentRepository.getAllocations()` | `ep_fulfillment` | `tb_ep_fulfillment_alloc_stock_allocation_detail` |
| `POST /api/v1/fulfillment/packages` | `createPackageHandler` | `FulfillmentRepository.createPackage()` | `ep_fulfillment` | `tb_ep_fulfillment_pkg_package_master` |
| `GET /api/v1/logistics/carriers` | `getCarriersHandler` | `LogisticsRepository.getCarriers()` | `ep_logistics` | `tb_ep_logistics_carrier_shipping_carrier_master` |
| `POST /api/v1/logistics/shipments/:id/tracking`| `recordTrackingEventHandler`| `LogisticsRepository.recordTrackingEvent()`| `ep_logistics` | `tb_ep_logistics_trck_shipment_tracking_event_txn` |
| `GET /api/v1/logistics/tracking/:no` | `getTrackingHandler` | `LogisticsRepository.getShipmentByTrackingNumber()`| `ep_logistics` | `tb_ep_logistics_shp_shipment_master`<br>`tb_ep_logistics_trck_shipment_tracking_event_txn` |
| `GET /api/v1/returns/reasons` | `getReturnReasonsHandler` | `ReturnsRepository.getReasons()` | `ep_returns` | `tb_ep_returns_reason_return_reason_setup` |
| `POST /api/v1/returns/requests` | `createReturnRequestHandler` | `ReturnsRepository.createReturnRequest()` | `ep_returns` | `tb_ep_returns_req_return_request_master` |
| `POST /api/v1/returns/inspections` | `completeInspectionHandler` | `ReturnsRepository.completeInspection()` | `ep_returns` | `tb_ep_returns_insp_return_inspection_txn` |

---

## 7. Growth, Content, Communications, Integrations, Support & Audit

| API Endpoint | Controller | Service / Repository | Physical Schema | Physical PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/growth/referrals` | `createReferralCodeHandler` | `GrowthRepository.createReferralCode()` | `ep_growth` | `tb_ep_growth_referral_referral_code_master` |
| `GET /api/v1/growth/referrals/:code` | `validateReferralCodeHandler` | `GrowthRepository.getReferralCode()` | `ep_growth` | `tb_ep_growth_referral_referral_code_master` |
| `GET /api/v1/content/banners` | `getBannersHandler` | `ContentRepository.getBanners()` | `ep_content` | `tb_ep_content_banner_banner_master` |
| `GET /api/v1/content/pages/:slug` | `getPageBySlugHandler` | `ContentRepository.getPageBySlug()` | `ep_content` | `tb_ep_content_page_cms_page_master` |
| `GET /api/v1/content/menus` | `getMenusHandler` | `ContentRepository.getMenus()` | `ep_content` | `tb_ep_content_menu_menu_master`<br>`tb_ep_content_menu_menu_item_detail` |
| `GET /api/v1/notifications` | `getUserNotificationsHandler` | `CommsRepository.getUserNotifications()` | `ep_comms` | `tb_ep_comms_notification_user_notification_master` |
| `POST /api/v1/notifications/:id/read`| `markNotificationReadHandler` | `CommsRepository.markNotificationRead()` | `ep_comms` | `tb_ep_comms_notification_user_notification_master` |
| `GET /api/v1/integration/outbox` | `getOutboxQueueHandler` | `IntegrationRepository.getPendingOutboxEvents()`| `ep_integration`| `tb_ep_integration_outbox_outbox_event_queue` |
| `POST /api/v1/integration/outbox/:id/process`| `processOutboxEventHandler`| `IntegrationRepository.markOutboxEventProcessed()`| `ep_integration`| `tb_ep_integration_outbox_outbox_event_queue` |
| `POST /api/v1/support/tickets` | `createTicketHandler` | `SupportRepository.createTicket()` | `ep_support` | `tb_ep_support_ticket_ticket_master`<br>`tb_ep_support_ticket_ticket_message_detail` |
| `GET /api/v1/support/tickets` | `getTicketsHandler` | `SupportRepository.getTickets()` | `ep_support` | `tb_ep_support_ticket_ticket_master` |
| `GET /api/v1/support/tickets/:id` | `getTicketDetailsHandler` | `SupportRepository.getTicketDetails()` | `ep_support` | `tb_ep_support_ticket_ticket_master`<br>`tb_ep_support_ticket_ticket_message_detail` |
| `POST /api/v1/support/tickets/:id/messages`| `addTicketMessageHandler` | `SupportRepository.addMessage()` | `ep_support` | `tb_ep_support_ticket_ticket_message_detail` |
| `GET /api/v1/audit/activity` | `getActivityLogsHandler` | `AuditRepository.getActivityLogs()` | `ep_audit` | `tb_ep_audit_activity_activity_log` |
