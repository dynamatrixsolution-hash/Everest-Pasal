// ==============================================================================
// EVEREST PASAL - 183-TABLE ENTERPRISE SEED SCRIPT
// Populates canonical catalog, merchants, stores, pricing, inventory, and users
// ==============================================================================

import bcrypt from 'bcrypt';
import { execute, query } from '../db.js';

const COMPANY_CODE = 'EP_NEPAL';
const BCRYPT_SALT_ROUNDS = 10;

async function seed() {
  console.log('[SEED] Starting enterprise seed for 183-table database...');

  // 1. Verify Company
  const companies = await query<any>(
    `SELECT id FROM ep_system.tb_ep_system_company_company_master WHERE company_code = $1;`,
    [COMPANY_CODE]
  );
  if (companies.length === 0) {
    await execute(
      `INSERT INTO ep_system.tb_ep_system_company_company_master (
        id, company_code, company_name, country_code, currency_code, timezone, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'Everest Pasal Pvt. Ltd.', 'NPL', 'NPR', 'Asia/Kathmandu', true, true
      );`,
      [COMPANY_CODE]
    );
  }

  // 2. Seed Roles
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', scope: 'GLOBAL' },
    { code: 'PLATFORM_ADMIN', name: 'Platform Administrator', scope: 'GLOBAL' },
    { code: 'FINANCE_ADMIN', name: 'Finance Administrator', scope: 'GLOBAL' },
    { code: 'SUPPORT_AGENT', name: 'Customer Support Agent', scope: 'GLOBAL' },
    { code: 'VENDOR_SELLER', name: 'Vendor Store Owner', scope: 'TENANT' },
    { code: 'VENDOR_STAFF', name: 'Vendor Staff Member', scope: 'TENANT' },
    { code: 'CUSTOMER', name: 'Registered Customer', scope: 'GLOBAL' },
  ];

  for (const r of roles) {
    const existing = await query<any>(
      `SELECT id FROM ep_identity.tb_ep_identity_role_role_master WHERE company_code = $1 AND role_code = $2;`,
      [COMPANY_CODE, r.code]
    );
    if (existing.length === 0) {
      await execute(
        `INSERT INTO ep_identity.tb_ep_identity_role_role_master (
          id, company_code, role_code, role_name, role_scope, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, true, false
        );`,
        [COMPANY_CODE, r.code, r.name, r.scope]
      );
    }
  }

  // 3. Seed Price List
  let priceListId: string;
  const plRows = await query<any>(
    `SELECT id FROM ep_pricing.tb_ep_pricing_price_price_list_master WHERE company_code = $1 LIMIT 1;`,
    [COMPANY_CODE]
  );
  if (plRows.length === 0) {
    const pl = await query<any>(
      `INSERT INTO ep_pricing.tb_ep_pricing_price_price_list_master (
        id, company_code, price_list_code, price_list_name, currency_code, valid_from, active, publish
      ) VALUES (
        gen_random_uuid(), $1, 'STANDARD_NPR', 'Standard Retail Price List', 'NPR', clock_timestamp(), true, true
      ) RETURNING id;`,
      [COMPANY_CODE]
    );
    priceListId = pl[0].id;
  } else {
    priceListId = plRows[0].id;
  }

  // 4. Seed Categories
  const categoriesData = [
    { code: 'CAT_ELEC', name: 'Electronics & Gadgets', slug: 'electronics-gadgets', sort: 1 },
    { code: 'CAT_FASH', name: 'Fashion & Apparel', slug: 'fashion-apparel', sort: 2 },
    { code: 'CAT_HOME', name: 'Home & Kitchen', slug: 'home-kitchen', sort: 3 },
    { code: 'CAT_BEAU', name: 'Beauty & Personal Care', slug: 'beauty-personal-care', sort: 4 },
    { code: 'CAT_HAND', name: 'Authentic Nepali Handicrafts', slug: 'nepali-handicrafts', sort: 5 },
    { code: 'CAT_FOOD', name: 'Himalayan Organic Groceries', slug: 'himalayan-groceries', sort: 6 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    let catId: string;
    const existing = await query<any>(
      `SELECT id FROM ep_catalog.tb_ep_catalog_cat_category_master WHERE company_code = $1 AND category_code = $2;`,
      [COMPANY_CODE, cat.code]
    );
    if (existing.length === 0) {
      const created = await query<any>(
        `INSERT INTO ep_catalog.tb_ep_catalog_cat_category_master (
          id, company_code, category_code, category_name, slug, sort_order, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, true, true
        ) RETURNING id;`,
        [COMPANY_CODE, cat.code, cat.name, cat.slug, cat.sort]
      );
      catId = created[0].id;
    } else {
      catId = existing[0].id;
    }
    categoryMap.set(cat.code, catId);
  }

  // 5. Seed Brands
  const brandsData = [
    { code: 'BND_EVEREST', name: 'Everest Direct' },
    { code: 'BND_HIMALAYA', name: 'Himalayan Herbal' },
    { code: 'BND_SHERPA', name: 'Sherpa Gear Nepal' },
    { code: 'BND_PASHMINA', name: 'Kathmandu Pashmina Co' },
    { code: 'BND_SAMSUNG', name: 'Samsung Nepal' },
    { code: 'BND_APPLE', name: 'Apple Authorized' },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    let bId: string;
    const existing = await query<any>(
      `SELECT id FROM ep_catalog.tb_ep_catalog_brand_brand_master WHERE company_code = $1 AND brand_code = $2;`,
      [COMPANY_CODE, b.code]
    );
    if (existing.length === 0) {
      const created = await query<any>(
        `INSERT INTO ep_catalog.tb_ep_catalog_brand_brand_master (
          id, company_code, brand_code, brand_name, slug, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, true, true
        ) RETURNING id;`,
        [COMPANY_CODE, b.code, b.name, b.code.toLowerCase().replace('_', '-')]
      );
      bId = created[0].id;
    } else {
      bId = existing[0].id;
    }
    brandMap.set(b.code, bId);
  }

  // 6. Seed Merchants & Stores
  const merchantsData = [
    {
      code: 'MCH_EVEREST_DIRECT',
      name: 'Everest Official Store',
      legalName: 'Everest Pasal Retail Pvt Ltd',
      status: 'APPROVED',
      pan: '109847281',
    },
    {
      code: 'MCH_HIMALAYAN_HERBS',
      name: 'Himalayan Organic Traders',
      legalName: 'Himalayan Naturals Nepal LLC',
      status: 'APPROVED',
      pan: '302948192',
    },
    {
      code: 'MCH_SHERPA_OUTDOORS',
      name: 'Sherpa Adventure Outfitters',
      legalName: 'Sherpa Gear & Trekking Supplies',
      status: 'APPROVED',
      pan: '892019482',
    },
    {
      code: 'MCH_KTM_CRAFTS',
      name: 'Patan Heritage Crafts',
      legalName: 'Kathmandu Valley Artisans Co-op',
      status: 'PENDING',
      pan: '492019283',
    },
  ];

  const merchantMap = new Map<string, string>();
  const storeMap = new Map<string, string>();

  for (const m of merchantsData) {
    let mId: string;
    const existing = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_vendor_merchant_master WHERE company_code = $1 AND merchant_code = $2;`,
      [COMPANY_CODE, m.code]
    );
    if (existing.length === 0) {
      const created = await query<any>(
        `INSERT INTO ep_merchant.tb_ep_merchant_vendor_merchant_master (
          id, company_code, merchant_code, merchant_name, legal_name, merchant_type, onboarding_status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 'SELLER', $5, true, true
        ) RETURNING id;`,
        [COMPANY_CODE, m.code, m.name, m.legalName, m.status]
      );
      mId = created[0].id;
    } else {
      mId = existing[0].id;
    }
    merchantMap.set(m.code, mId);

    // Ensure store exists for merchant
    const sRows = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_store_store_master WHERE company_code = $1 AND merchant_id = $2::uuid;`,
      [COMPANY_CODE, mId]
    );
    let storeId: string;
    if (sRows.length === 0) {
      const s = await query<any>(
        `INSERT INTO ep_merchant.tb_ep_merchant_store_store_master (
          id, company_code, merchant_id, store_code, store_name, store_type, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3, $4, 'ONLINE', true, true
        ) RETURNING id;`,
        [COMPANY_CODE, mId, `STR_${m.code}`, `${m.name} Online Store`]
      );
      storeId = s[0].id;
    } else {
      storeId = sRows[0].id;
    }
    storeMap.set(m.code, storeId);
  }

  // 7. Seed Sample Products with Variants, Listings, Media, and Prices
  const sampleProducts = [
    {
      code: 'PRD_PASHMINA_SHIRTS',
      name: 'Authentic 100% Cashmere Pashmina Shawl',
      category: 'CAT_HAND',
      brand: 'BND_PASHMINA',
      merchant: 'MCH_EVEREST_DIRECT',
      price: 6500,
      comparePrice: 8500,
      sku: 'KTM-PASH-001',
      description: 'Hand-woven luxury authentic Himalayan Chyangra pashmina shawl, ultralight and exceptionally warm.',
      mediaUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_SHERPA_JACKET',
      name: 'Sherpa Alpine Summit Windproof Down Jacket',
      category: 'CAT_FASH',
      brand: 'BND_SHERPA',
      merchant: 'MCH_SHERPA_OUTDOORS',
      price: 14500,
      comparePrice: 18000,
      sku: 'SHERPA-DWN-800',
      description: 'Engineered for extreme high-altitude mountain conditions with 850 fill power water-repellent down insulation.',
      mediaUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_HIMALAYAN_TEA',
      name: 'Ilam First Flush Organic Golden Orthodox Tea (250g)',
      category: 'CAT_FOOD',
      brand: 'BND_HIMALAYA',
      merchant: 'MCH_HIMALAYAN_HERBS',
      price: 1250,
      comparePrice: 1500,
      sku: 'ILAM-TEA-0250',
      description: 'High-altitude organic orthodox hand-picked tea leaves grown in the pristine hills of Ilam, Eastern Nepal.',
      mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_SINGING_BOWL',
      name: 'Handmade 7-Metals Tibetan Meditation Singing Bowl (8 Inch)',
      category: 'CAT_HAND',
      brand: 'BND_EVEREST',
      merchant: 'MCH_EVEREST_DIRECT',
      price: 4200,
      comparePrice: 5500,
      sku: 'BOWL-7MET-008',
      description: 'Traditional full-moon hand-hammered 7-metal alloy singing bowl tuned to resonant healing frequencies.',
      mediaUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_ORGANIC_HONEY',
      name: 'Wild Cliff Honey of Mustang (500g Glass Jar)',
      category: 'CAT_FOOD',
      brand: 'BND_HIMALAYA',
      merchant: 'MCH_HIMALAYAN_HERBS',
      price: 3200,
      comparePrice: 3800,
      sku: 'MUSTANG-HNY-500',
      description: 'Raw, unpasteurized natural honey harvested sustainably from high altitude Himalayan cliffs.',
      mediaUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_GALAXY_S24',
      name: 'Samsung Galaxy S24 Ultra (12GB RAM, 512GB Titanium Gray)',
      category: 'CAT_ELEC',
      brand: 'BND_SAMSUNG',
      merchant: 'MCH_EVEREST_DIRECT',
      price: 184999,
      comparePrice: 199999,
      sku: 'SAM-S24U-512',
      description: 'Flagship smartphone featuring Galaxy AI, Snapdragon 8 Gen 3, Titanium frame, and 200MP Quad Telephoto Camera.',
      mediaUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_MACBOOK_PRO',
      name: 'Apple MacBook Pro 16" (M3 Max 36GB, 1TB SSD Space Black)',
      category: 'CAT_ELEC',
      brand: 'BND_APPLE',
      merchant: 'MCH_EVEREST_DIRECT',
      price: 465000,
      comparePrice: 485000,
      sku: 'APL-MBP16-M3M',
      description: 'Uncompromising powerhouse with Liquid Retina XDR display, up to 22 hours battery life, and pro connectivity.',
      mediaUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      code: 'PRD_HEMP_BACKPACK',
      name: 'Handcrafted Eco Pure Himalayan Hemp Backpack',
      category: 'CAT_FASH',
      brand: 'BND_SHERPA',
      merchant: 'MCH_SHERPA_OUTDOORS',
      price: 2450,
      comparePrice: 3200,
      sku: 'HEMP-BP-001',
      description: '100% natural organic wild hemp durable travel backpack featuring padded laptop sleeve and YKK metal zippers.',
      mediaUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    },
  ];

  for (const p of sampleProducts) {
    const existing = await query<any>(
      `SELECT id FROM ep_catalog.tb_ep_catalog_prd_product_master WHERE company_code = $1 AND product_code = $2;`,
      [COMPANY_CODE, p.code]
    );

    let productId: string;
    if (existing.length === 0) {
      const created = await query<any>(
        `INSERT INTO ep_catalog.tb_ep_catalog_prd_product_master (
          id, company_code, product_code, product_name, category_id, brand_id, product_type, description, approval_status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4::uuid, $5::uuid, 'SIMPLE', $6, 'APPROVED', true, true
        ) RETURNING id;`,
        [COMPANY_CODE, p.code, p.name, categoryMap.get(p.category), brandMap.get(p.brand), p.description]
      );
      productId = created[0].id;
    } else {
      productId = existing[0].id;
    }

    // Variant
    let variantId: string;
    const vRows = await query<any>(
      `SELECT id FROM ep_catalog.tb_ep_catalog_prd_product_variant_master WHERE company_code = $1 AND product_id = $2::uuid;`,
      [COMPANY_CODE, productId]
    );
    if (vRows.length === 0) {
      const v = await query<any>(
        `INSERT INTO ep_catalog.tb_ep_catalog_prd_product_variant_master (
          id, company_code, product_id, variant_code, variant_name, barcode, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3, $4, $5, true, true
        ) RETURNING id;`,
        [COMPANY_CODE, productId, `${p.code}_V1`, `${p.name} Standard`, p.sku]
      );
      variantId = v[0].id;
    } else {
      variantId = vRows[0].id;
    }

    // Media
    const mRows = await query<any>(
      `SELECT id FROM ep_catalog.tb_ep_catalog_media_product_media_detail WHERE company_code = $1 AND product_id = $2::uuid;`,
      [COMPANY_CODE, productId]
    );
    if (mRows.length === 0) {
      await execute(
        `INSERT INTO ep_catalog.tb_ep_catalog_media_product_media_detail (
          id, company_code, product_id, variant_id, media_type, media_url, is_primary, sort_order, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, 'IMAGE', $4, true, 1, true, true
        );`,
        [COMPANY_CODE, productId, variantId, p.mediaUrl]
      );
    }

    // Merchant Listing
    const merchantId = merchantMap.get(p.merchant) || merchantMap.get('MCH_EVEREST_DIRECT')!;
    const storeId = storeMap.get(p.merchant) || storeMap.get('MCH_EVEREST_DIRECT')!;

    let listingId: string;
    const lRows = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_prd_listing_master WHERE company_code = $1 AND product_id = $2::uuid AND merchant_id = $3::uuid;`,
      [COMPANY_CODE, productId, merchantId]
    );
    if (lRows.length === 0) {
      const l = await query<any>(
        `INSERT INTO ep_merchant.tb_ep_merchant_prd_listing_master (
          id, company_code, merchant_id, store_id, product_id, listing_code, approval_status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4::uuid, $5, 'APPROVED', true, true
        ) RETURNING id;`,
        [COMPANY_CODE, merchantId, storeId, productId, `LST_${p.code}`]
      );
      listingId = l[0].id;
    } else {
      listingId = lRows[0].id;
    }

    // Listing Variant
    let listingVariantId: string;
    const lvRows = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_prd_listing_variant_master WHERE company_code = $1 AND listing_id = $2::uuid AND variant_id = $3::uuid;`,
      [COMPANY_CODE, listingId, variantId]
    );
    if (lvRows.length === 0) {
      const lv = await query<any>(
        `INSERT INTO ep_merchant.tb_ep_merchant_prd_listing_variant_master (
          id, company_code, listing_id, variant_id, seller_sku, condition_code, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, 'NEW', true, true
        ) RETURNING id;`,
        [COMPANY_CODE, listingId, variantId, p.sku]
      );
      listingVariantId = lv[0].id;
    } else {
      listingVariantId = lvRows[0].id;
    }

    // Product Price Detail
    const prRows = await query<any>(
      `SELECT id FROM ep_pricing.tb_ep_pricing_price_product_price_detail WHERE company_code = $1 AND price_list_id = $2::uuid AND listing_variant_id = $3::uuid;`,
      [COMPANY_CODE, priceListId, listingVariantId]
    );
    if (prRows.length === 0) {
      await execute(
        `INSERT INTO ep_pricing.tb_ep_pricing_price_product_price_detail (
          id, company_code, price_list_id, listing_variant_id, list_price, sale_price, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, $5, true, true
        );`,
        [COMPANY_CODE, priceListId, listingVariantId, p.comparePrice, p.price]
      );
    }
  }

  // 8. Seed Default Platform Users (Admin, Vendor, Customer)
  const defaultPassword = 'Password@123';
  const passwordHash = await bcrypt.hash(defaultPassword, BCRYPT_SALT_ROUNDS);

  const usersToSeed = [
    {
      code: 'USR_ADMIN_01',
      email: 'admin@everestpasal.com',
      mobile: '9841000001',
      name: 'Platform Super Admin',
      type: 'ADMIN',
      role: 'SUPER_ADMIN',
    },
    {
      code: 'USR_VENDOR_01',
      email: 'vendor@everestpasal.com',
      mobile: '9841000002',
      name: 'Everest Direct Store Manager',
      type: 'VENDOR',
      role: 'VENDOR_SELLER',
      merchantCode: 'MCH_EVEREST_DIRECT',
    },
    {
      code: 'USR_CUST_01',
      email: 'customer@everestpasal.com',
      mobile: '9841000003',
      name: 'Aarav Sharma',
      type: 'CUSTOMER',
      role: 'CUSTOMER',
    },
  ];

  for (const u of usersToSeed) {
    const existing = await query<any>(
      `SELECT id FROM ep_identity.tb_ep_identity_user_user_master WHERE company_code = $1 AND email = $2;`,
      [COMPANY_CODE, u.email]
    );

    let userId: string;
    if (existing.length === 0) {
      const created = await query<any>(
        `INSERT INTO ep_identity.tb_ep_identity_user_user_master (
          id, company_code, user_code, email, mobile_no, display_name, user_type, email_verified, mobile_verified, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, true, true, false
        ) RETURNING id;`,
        [COMPANY_CODE, u.code, u.email, u.mobile, u.name, u.type]
      );
      userId = created[0].id;

      // Password
      await execute(
        `INSERT INTO ep_identity.tb_ep_identity_auth_credential_master (
          id, company_code, user_id, credential_type, password_hash, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, 'PASSWORD', $3, true, false
        );`,
        [COMPANY_CODE, userId, passwordHash]
      );

      // Role map
      const roleRow = await query<any>(
        `SELECT id FROM ep_identity.tb_ep_identity_role_role_master WHERE company_code = $1 AND role_code = $2;`,
        [COMPANY_CODE, u.role]
      );
      if (roleRow[0]) {
        await execute(
          `INSERT INTO ep_identity.tb_ep_identity_role_user_role_map (
            id, company_code, user_id, role_id, active, publish
          ) VALUES (
            gen_random_uuid(), $1, $2::uuid, $3::uuid, true, false
          );`,
          [COMPANY_CODE, userId, roleRow[0].id]
        );
      }

      // Customer Profile or Merchant Member
      if (u.type === 'CUSTOMER') {
        await execute(
          `INSERT INTO ep_customer.tb_ep_customer_profile_customer_master (
            id, company_code, customer_code, user_id, first_name, active, publish
          ) VALUES (
            gen_random_uuid(), $1, $2, $3::uuid, $4, true, false
          );`,
          [COMPANY_CODE, `CUST_${Date.now().toString().slice(-6)}`, userId, u.name]
        );
      } else if (u.type === 'VENDOR' && u.merchantCode) {
        const merchantId = merchantMap.get(u.merchantCode);
        if (merchantId) {
          await execute(
            `INSERT INTO ep_merchant.tb_ep_merchant_vendor_member_map (
              id, company_code, merchant_id, user_id, merchant_role, active, publish
            ) VALUES (
              gen_random_uuid(), $1, $2::uuid, $3::uuid, 'OWNER', true, false
            );`,
            [COMPANY_CODE, merchantId, userId]
          );
        }
      }
    }
  }

  console.log('[SEED] Successfully seeded categories, brands, merchants, products, listings, pricing, and users!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED-ERROR]', err);
  process.exit(1);
});
