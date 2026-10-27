import { query } from '../db.js';

async function main() {
  const companies = await query('SELECT count(*)::int as count FROM ep_system.tb_ep_system_company_company_master');
  const products = await query('SELECT count(*)::int as count FROM ep_catalog.tb_ep_catalog_prd_product_master');
  const categories = await query('SELECT count(*)::int as count FROM ep_catalog.tb_ep_catalog_cat_category_master');
  const brands = await query('SELECT count(*)::int as count FROM ep_catalog.tb_ep_catalog_brand_brand_master');
  const users = await query('SELECT count(*)::int as count FROM ep_identity.tb_ep_identity_user_user_master');
  const customers = await query('SELECT count(*)::int as count FROM ep_customer.tb_ep_customer_profile_customer_master');
  const merchants = await query('SELECT count(*)::int as count FROM ep_merchant.tb_ep_merchant_vendor_merchant_master');
  const orders = await query('SELECT count(*)::int as count FROM ep_commerce.tb_ep_commerce_ord_order_master');
  const auditLogs = await query('SELECT count(*)::int as count FROM ep_audit.tb_ep_audit_activity_activity_log');

  console.log('=== 183-TABLE DATABASE DATA AUDIT ===');
  console.log('Operating Companies:', companies[0]?.count);
  console.log('Categories:', categories[0]?.count);
  console.log('Brands:', brands[0]?.count);
  console.log('Products:', products[0]?.count);
  console.log('Identity Users:', users[0]?.count);
  console.log('Customer Profiles:', customers[0]?.count);
  console.log('Merchants/Vendors:', merchants[0]?.count);
  console.log('Commerce Orders:', orders[0]?.count);
  console.log('Audit Log Events:', auditLogs[0]?.count);
  process.exit(0);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
