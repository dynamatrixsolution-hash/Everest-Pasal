// ==============================================================================
// EVEREST PASAL - CATALOG & PRODUCT REPOSITORY
// Direct data access for ep_catalog and ep_pricing schemas
// ==============================================================================

import { query, execute } from '../db.js';

export interface ProductDetailRow {
  id: string;
  company_code: string;
  product_code: string;
  product_name: string;
  brand_name: string | null;
  category_name: string;
  category_id: string;
  product_type: string;
  description: string | null;
  approval_status: string;
  active: boolean;
  publish: boolean;
  min_price: number | null;
  primary_media_url: string | null;
}

export interface CategoryRow {
  id: string;
  company_code: string;
  category_code: string;
  category_name: string;
  slug: string | null;
  parent_category_id: string | null;
  sort_order: number;
}

export class CatalogRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getPublishedProducts(params: {
    categoryId?: string;
    brandId?: string;
    searchQuery?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ data: ProductDetailRow[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClauses = [`p.company_code = $1`, `p.active = true`, `p.publish = true`];
    let queryParams: any[] = [this.companyCode];
    let paramIndex = 2;

    if (params.categoryId && params.categoryId !== 'all') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.categoryId);
      if (isUuid) {
        whereClauses.push(`p.category_id = $${paramIndex}::uuid`);
        queryParams.push(params.categoryId);
      } else {
        whereClauses.push(`(c.slug ILIKE $${paramIndex} OR c.category_code ILIKE $${paramIndex} OR c.category_name ILIKE $${paramIndex})`);
        queryParams.push(`%${params.categoryId}%`);
      }
      paramIndex++;
    }

    if (params.brandId && params.brandId !== 'all') {
      whereClauses.push(`p.brand_id = $${paramIndex}::uuid`);
      queryParams.push(params.brandId);
      paramIndex++;
    }

    if (params.searchQuery) {
      whereClauses.push(`(p.product_name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      queryParams.push(`%${params.searchQuery}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.join(' AND ');

    // Total count
    const countRows = await query<{ count: number }>(
      `SELECT count(DISTINCT p.id)::int as count 
       FROM ep_catalog.tb_ep_catalog_prd_product_master p 
       LEFT JOIN ep_catalog.tb_ep_catalog_cat_category_master c ON c.id = p.category_id
       WHERE ${whereSql};`,
      queryParams
    );

    const total = countRows[0]?.count || 0;

    let orderBySql = 'ORDER BY p.created_at DESC';
    if ((params as any).sortBy === 'price-low') {
      orderBySql = 'ORDER BY min_price ASC, p.created_at DESC';
    } else if ((params as any).sortBy === 'price-high') {
      orderBySql = 'ORDER BY min_price DESC, p.created_at DESC';
    }

    // Fetch products
    const data = await query<ProductDetailRow>(
      `SELECT 
        p.id, 
        p.company_code, 
        p.product_code, 
        p.product_name, 
        b.brand_name, 
        c.category_name, 
        p.category_id, 
        p.product_type, 
        p.description, 
        p.approval_status, 
        p.active, 
        p.publish,
        COALESCE(MIN(pr.sale_price), MIN(pr.list_price), 0)::numeric as min_price,
        (
          SELECT media_url 
          FROM ep_catalog.tb_ep_catalog_media_product_media_detail m 
          WHERE m.product_id = p.id AND m.active = true 
          ORDER BY m.is_primary DESC, m.sort_order ASC 
          LIMIT 1
        ) as primary_media_url
       FROM ep_catalog.tb_ep_catalog_prd_product_master p
       LEFT JOIN ep_catalog.tb_ep_catalog_cat_category_master c ON c.id = p.category_id
       LEFT JOIN ep_catalog.tb_ep_catalog_brand_brand_master b ON b.id = p.brand_id
       LEFT JOIN ep_catalog.tb_ep_catalog_prd_product_variant_master v ON v.product_id = p.id
       LEFT JOIN ep_merchant.tb_ep_merchant_prd_listing_variant_master lv ON lv.variant_id = v.id
       LEFT JOIN ep_pricing.tb_ep_pricing_price_product_price_detail pr ON pr.listing_variant_id = lv.id
       WHERE ${whereSql}
       GROUP BY p.id, b.brand_name, c.category_name
       ${orderBySql}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1};`,
      [...queryParams, pageSize, offset]
    );

    return { data, total };
  }

  async getProductById(productId: string): Promise<any | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    const whereIdClause = isUuid ? `p.id = $2::uuid` : `(p.product_code = $2 OR p.id::text = $2)`;

    const productRows = await query<any>(
      `SELECT 
        p.*, 
        b.brand_name, 
        c.category_name
       FROM ep_catalog.tb_ep_catalog_prd_product_master p
       LEFT JOIN ep_catalog.tb_ep_catalog_cat_category_master c ON c.id = p.category_id
       LEFT JOIN ep_catalog.tb_ep_catalog_brand_brand_master b ON b.id = p.brand_id
       WHERE p.company_code = $1 AND ${whereIdClause} AND p.active = true
       LIMIT 1;`,
      [this.companyCode, productId]
    );

    if (!productRows.length) return null;
    const product = productRows[0];

    // Get variants
    const varWhereClause = isUuid ? `v.product_id = $2::uuid` : `v.product_id = $2::uuid`;
    let variants: any[] = [];
    let media: any[] = [];

    try {
      variants = await query<any>(
        `SELECT v.*, lv.id as listing_variant_id, lv.seller_sku, pr.list_price, pr.sale_price
         FROM ep_catalog.tb_ep_catalog_prd_product_variant_master v
         LEFT JOIN ep_merchant.tb_ep_merchant_prd_listing_variant_master lv ON lv.variant_id = v.id AND lv.active = true
         LEFT JOIN ep_pricing.tb_ep_pricing_price_product_price_detail pr ON pr.listing_variant_id = lv.id AND pr.active = true
         WHERE v.company_code = $1 AND v.product_id = $2::uuid AND v.active = true;`,
        [this.companyCode, product.id]
      );
    } catch {
      variants = [];
    }

    try {
      media = await query<any>(
        `SELECT * FROM ep_catalog.tb_ep_catalog_media_product_media_detail 
         WHERE company_code = $1 AND product_id = $2::uuid AND active = true 
         ORDER BY is_primary DESC, sort_order ASC;`,
        [this.companyCode, product.id]
      );
    } catch {
      media = [];
    }

    return {
      ...product,
      variants,
      media,
    };
  }

  async getCategories(): Promise<CategoryRow[]> {
    return await query<CategoryRow>(
      `SELECT * FROM ep_catalog.tb_ep_catalog_cat_category_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY sort_order ASC, category_name ASC;`,
      [this.companyCode]
    );
  }

  async getBrands(): Promise<any[]> {
    return await query<any>(
      `SELECT * FROM ep_catalog.tb_ep_catalog_brand_brand_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY brand_name ASC;`,
      [this.companyCode]
    );
  }
}
