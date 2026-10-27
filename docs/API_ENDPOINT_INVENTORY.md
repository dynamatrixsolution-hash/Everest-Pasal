# Everest Pasal — Authoritative API Endpoint Inventory

| Method | Endpoint | Domain Module | Schema | Authentication | Permission Required | Tenant Scoped | Transactional | Idempotent | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | System | `ep_system` | Public | None | No | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/health/db` | System | 21 Schemas | Public | None | No | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/system/companies` | System | `ep_system` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/system/fiscal-years` | System | `ep_system` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/system/feature-flags` | System | `ep_system` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/system/settings` | System | `ep_system` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/geo/countries` | Geography | `ep_geo` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/geo/provinces` | Geography | `ep_geo` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/geo/districts` | Geography | `ep_geo` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/geo/municipalities` | Geography | `ep_geo` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/geo/delivery-zones` | Geography | `ep_geo` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/register` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/login` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/logout` | Identity | `ep_identity` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/auth/me` | Identity | `ep_identity` | Bearer Token | Authenticated | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/refresh` | Identity | `ep_identity` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/forgot-password` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/reset-password` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/request-otp` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/auth/verify-otp` | Identity | `ep_identity` | Public | None | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/customer/profile` | Customer | `ep_customer` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `PATCH` | `/api/v1/customer/profile` | Customer | `ep_customer` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/customer/addresses` | Customer | `ep_customer` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/customer/addresses` | Customer | `ep_customer` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `DELETE` | `/api/v1/customer/addresses/:id` | Customer | `ep_customer` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/vendors/onboarding` | Merchant | `ep_merchant` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/vendors/me` | Merchant | `ep_merchant` | Bearer Token | Vendor | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `PATCH` | `/api/v1/vendors/me` | Merchant | `ep_merchant` | Bearer Token | Vendor | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/admin/vendors` | Merchant | `ep_merchant` | Bearer Token | Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/admin/vendors/:id/approve` | Merchant | `ep_merchant` | Bearer Token | Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/kyc/me` | KYC/KYB | `ep_kyc` | Bearer Token | Authenticated | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/kyc/documents` | KYC/KYB | `ep_kyc` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/kyc/submit` | KYC/KYB | `ep_kyc` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/admin/kyc/cases` | KYC/KYB | `ep_kyc` | Bearer Token | Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/admin/kyc/decide` | KYC/KYB | `ep_kyc` | Bearer Token | Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/products` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/products/:id` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/products/slug/:slug` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/products` | Catalog | `ep_catalog` | Bearer Token | Vendor / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `PATCH` | `/api/v1/products/:id` | Catalog | `ep_catalog` | Bearer Token | Vendor / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/categories` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/categories/:id` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/brands` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/brands/:id` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/search/products` | Catalog | `ep_catalog` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/inventory/warehouses` | Inventory | `ep_inventory` | Bearer Token | Vendor / Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/inventory/stock-items` | Inventory | `ep_inventory` | Bearer Token | Vendor / Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/inventory/adjust` | Inventory | `ep_inventory` | Bearer Token | Vendor / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/inventory/reserve` | Inventory | `ep_inventory` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/inventory/release` | Inventory | `ep_inventory` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/pricing/price-lists` | Pricing | `ep_pricing` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/pricing/coupons/validate` | Pricing | `ep_pricing` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/pricing/promotions` | Pricing | `ep_pricing` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/pricing/tax-rules` | Pricing | `ep_pricing` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/pricing/shipping-rates` | Pricing | `ep_pricing` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/cart` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/cart/items` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `PATCH` | `/api/v1/cart/items/:itemId` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `DELETE` | `/api/v1/cart/items/:itemId` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `DELETE` | `/api/v1/cart/clear` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/checkout/validate` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/checkout/preview` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/checkout/orders` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/orders/my-orders` | Commerce | `ep_commerce` | Bearer Token | Customer | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/orders/:id` | Commerce | `ep_commerce` | Bearer Token | Permitted Scope | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/orders/:id/cancel` | Commerce | `ep_commerce` | Bearer Token | Customer / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/vendor/orders` | Commerce | `ep_commerce` | Bearer Token | Vendor | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/admin/orders` | Commerce | `ep_commerce` | Bearer Token | Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/payments/providers` | Payment | `ep_payment` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/payments/intents` | Payment | `ep_payment` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/payments/transactions` | Payment | `ep_payment` | Bearer Token | Customer / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/payments/webhooks` | Payment | `ep_payment` | Header Signature | Webhook Provider | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/payments/refunds` | Payment | `ep_payment` | Bearer Token | Admin / Operator | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/finance/accounts` | Finance | `ep_finance` | Bearer Token | Finance Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/finance/journals` | Finance | `ep_finance` | Bearer Token | Finance Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/finance/settlements/pending` | Finance | `ep_finance` | Bearer Token | Finance Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/finance/payouts` | Finance | `ep_finance` | Bearer Token | Finance Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/fulfillment/allocations` | Fulfillment | `ep_fulfillment` | Bearer Token | Vendor / Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/fulfillment/packages` | Fulfillment | `ep_fulfillment` | Bearer Token | Vendor / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/logistics/carriers` | Logistics | `ep_logistics` | Bearer Token | Vendor / Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/logistics/shipments` | Logistics | `ep_logistics` | Bearer Token | Vendor / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/logistics/shipments/:id/tracking` | Logistics | `ep_logistics` | Bearer Token | Carrier / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/logistics/tracking/:trackingNumber` | Logistics | `ep_logistics` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/logistics/riders` | Logistics | `ep_logistics` | Bearer Token | Carrier / Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/returns/reasons` | Returns | `ep_returns` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/returns/requests` | Returns | `ep_returns` | Bearer Token | Customer | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/returns/inspections` | Returns | `ep_returns` | Bearer Token | QA / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/growth/referrals` | Growth | `ep_growth` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/growth/referrals/:code` | Growth | `ep_growth` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/growth/campaigns` | Growth | `ep_growth` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/content/banners` | Content | `ep_content` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/content/pages/:slug` | Content | `ep_content` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/content/menus` | Content | `ep_content` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/content/faqs` | Content | `ep_content` | Public | None | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/notifications` | Communications | `ep_comms` | Bearer Token | Authenticated | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/notifications/:id/read` | Communications | `ep_comms` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/notifications/read-all` | Communications | `ep_comms` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/integration/outbox` | Integration | `ep_integration` | Bearer Token | Admin / Worker | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/integration/outbox/:id/process` | Integration | `ep_integration` | Bearer Token | Admin / Worker | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/integration/jobs/import` | Integration | `ep_integration` | Bearer Token | Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/support/tickets` | Support | `ep_support` | Bearer Token | Authenticated | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/support/tickets` | Support | `ep_support` | Bearer Token | Authenticated | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/support/tickets/:id` | Support | `ep_support` | Bearer Token | Requester/Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
| `POST` | `/api/v1/support/tickets/:id/messages` | Support | `ep_support` | Bearer Token | Requester/Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `PATCH` | `/api/v1/support/tickets/:id/status` | Support | `ep_support` | Bearer Token | Staff / Admin | Yes | Yes | Yes | **ACTIVE & VERIFIED** |
| `GET` | `/api/v1/audit/activity` | Audit | `ep_audit` | Bearer Token | Admin | Yes | No | Yes | **ACTIVE & VERIFIED** |
