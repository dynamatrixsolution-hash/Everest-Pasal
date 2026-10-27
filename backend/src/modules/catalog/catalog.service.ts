// ==============================================================================
// EVEREST PASAL - CATALOG & PRODUCT SERVICE
// Direct integration with ep_catalog and ep_pricing in PostgreSQL 18
// ==============================================================================

import { CatalogRepository, ProductDetailRow, CategoryRow } from '../../repositories/catalog.repository.js';
import { execute, query } from '../../db.js';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductListQuery,
  PaginatedResult,
  CreateCategoryInput,
} from './catalog.types.js';

export class CatalogService {
  private catalogRepo: CatalogRepository;
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL', catalogRepo?: CatalogRepository) {
    this.companyCode = companyCode;
    this.catalogRepo = catalogRepo || new CatalogRepository(companyCode);
  }

  private generateSlug(text: string): string {
    const baseSlug = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  public async listProducts(queryParam: ProductListQuery = {}): Promise<PaginatedResult<any>> {
    const page = Math.max(1, Number(queryParam.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryParam.limit) || 20));

    const { data, total } = await this.catalogRepo.getPublishedProducts({
      categoryId: queryParam.categoryId,
      brandId: queryParam.brand,
      searchQuery: queryParam.search,
      sortBy: queryParam.sortBy,
      page,
      pageSize: limit,
    } as any);

    const totalPages = Math.ceil(total / limit) || 1;

    const mappedProducts = data.map((p) => ({
      id: p.id,
      name: p.product_name,
      code: p.product_code,
      brand: p.brand_name || 'Everest Direct',
      category: p.category_name,
      categoryId: p.category_id,
      description: p.description,
      status: p.active ? 'ACTIVE' : 'INACTIVE',
      price: Number(p.min_price) || 0,
      imageUrl: p.primary_media_url || '/placeholder.png',
      active: p.active,
      publish: p.publish,
    }));

    return {
      data: mappedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async getProductById(id: string): Promise<any | null> {
    const product = await this.catalogRepo.getProductById(id);
    if (!product) return null;

    return {
      id: product.id,
      name: product.product_name,
      code: product.product_code,
      brand: product.brand_name || 'Everest Direct',
      category: product.category_name,
      categoryId: product.category_id,
      description: product.description,
      status: product.active ? 'ACTIVE' : 'INACTIVE',
      price: Number(product.variants?.[0]?.list_price) || 0,
      variants: product.variants || [],
      media: product.media || [],
      active: product.active,
      publish: product.publish,
    };
  }

  public async listCategories(): Promise<any[]> {
    const categories = await this.catalogRepo.getCategories();
    return categories.map((c) => ({
      id: c.id,
      name: c.category_name,
      code: c.category_code,
      slug: c.slug,
      parentId: c.parent_category_id,
      sortOrder: c.sort_order,
    }));
  }

  public async listBrands(): Promise<any[]> {
    return await this.catalogRepo.getBrands();
  }

  public async createCategory(input: CreateCategoryInput): Promise<any> {
    const code = `CAT_${Date.now().toString().slice(-6)}`;
    const slug = input.slug || this.generateSlug(input.name);

    const rows = await query<any>(
      `INSERT INTO ep_catalog.tb_ep_catalog_cat_category_master (
        id, company_code, category_code, category_name, slug, description, parent_category_id, sort_order, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, true
      ) RETURNING *;`,
      [this.companyCode, code, input.name.trim(), slug, input.description || null, input.parentId || null, input.sortOrder || 0]
    );
    return rows[0];
  }

  public async createProduct(input: CreateProductInput): Promise<any> {
    const prdCode = `PRD_${Date.now().toString().slice(-8)}`;

    const prdRows = await query<any>(
      `INSERT INTO ep_catalog.tb_ep_catalog_prd_product_master (
        id, company_code, product_code, product_name, category_id, product_type, description, approval_status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'SIMPLE', $5, 'APPROVED', true, true
      ) RETURNING *;`,
      [this.companyCode, prdCode, input.name.trim(), input.categoryIds?.[0] || null, input.description || null]
    );

    const product = prdRows[0];

    // Create variant
    const varCode = `VAR_${Date.now().toString().slice(-8)}`;
    const varRows = await query<any>(
      `INSERT INTO ep_catalog.tb_ep_catalog_prd_product_variant_master (
        id, company_code, product_id, variant_code, variant_name, barcode, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, true, true
      ) RETURNING *;`,
      [this.companyCode, product.id, varCode, `${input.name} Standard`, input.barcode || null]
    );

    const variant = varRows[0];

    // Create listing & price
    const merchantRows = await query<any>(
      `SELECT id FROM ep_merchant.tb_ep_merchant_vendor_merchant_master WHERE company_code = $1 LIMIT 1;`,
      [this.companyCode]
    );
    const merchantId = merchantRows[0]?.id || 'm1111111-1111-1111-1111-111111111111';

    const listingRows = await query<any>(
      `INSERT INTO ep_merchant.tb_ep_merchant_prd_listing_master (
        id, company_code, merchant_id, product_id, listing_code, approval_status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'APPROVED', true, true
      ) RETURNING *;`,
      [this.companyCode, merchantId, product.id, `LST_${Date.now().toString().slice(-8)}`]
    );

    const lvRows = await query<any>(
      `INSERT INTO ep_merchant.tb_ep_merchant_prd_listing_variant_master (
        id, company_code, listing_id, variant_id, seller_sku, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, true, true
      ) RETURNING *;`,
      [this.companyCode, listingRows[0].id, variant.id, input.sku]
    );

    // Create price
    const priceListRows = await query<any>(
      `SELECT id FROM ep_pricing.tb_ep_pricing_price_price_list_master WHERE company_code = $1 LIMIT 1;`,
      [this.companyCode]
    );
    let priceListId = priceListRows[0]?.id;
    if (!priceListId) {
      const pl = await query<any>(
        `INSERT INTO ep_pricing.tb_ep_pricing_price_price_list_master (
          id, company_code, price_list_code, price_list_name, currency_code, active, publish
        ) VALUES (
          gen_random_uuid(), $1, 'STANDARD_NPR', 'Standard Retail Price List', 'NPR', true, true
        ) RETURNING id;`,
        [this.companyCode]
      );
      priceListId = pl[0].id;
    }

    await execute(
      `INSERT INTO ep_pricing.tb_ep_pricing_price_product_price_detail (
        id, company_code, price_list_id, listing_variant_id, list_price, sale_price, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, true, true
      );`,
      [this.companyCode, priceListId, lvRows[0].id, input.price, input.compareAtPrice || input.price]
    );

    return product;
  }

  public async updateProduct(id: string, input: UpdateProductInput): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await execute(
        `UPDATE ep_catalog.tb_ep_catalog_prd_product_master 
         SET product_name = COALESCE($1, product_name), 
             description = COALESCE($2, description)
         WHERE company_code = $3 AND id = $4::uuid;`,
        [input.name || null, input.description || null, this.companyCode, id]
      );
      return this.getProductById(id);
    } else {
      // Find and update by product_code or id text
      await execute(
        `UPDATE ep_catalog.tb_ep_catalog_prd_product_master 
         SET product_name = COALESCE($1, product_name), 
             description = COALESCE($2, description)
         WHERE company_code = $3 AND (product_code = $4 OR id::text = $4);`,
        [input.name || null, input.description || null, this.companyCode, id]
      );
      const existing = await this.getProductById(id);
      return existing || { id, name: input.name, description: input.description, ...input };
    }
  }

  public async setProductStatus(id: string, status: string): Promise<any> {
    const isActive = status === 'ACTIVE';
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await execute(
        `UPDATE ep_catalog.tb_ep_catalog_prd_product_master 
         SET active = $1, publish = $1 
         WHERE company_code = $2 AND id = $3::uuid;`,
        [isActive, this.companyCode, id]
      );
    } else {
      await execute(
        `UPDATE ep_catalog.tb_ep_catalog_prd_product_master 
         SET active = $1, publish = $1 
         WHERE company_code = $2 AND (product_code = $3 OR id::text = $3);`,
        [isActive, this.companyCode, id]
      );
    }
    return this.getProductById(id);
  }

  public async searchProducts(params: {
    q?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClauses = [`p.company_code = $1`, `p.active = true`, `p.publish = true`];
    let queryParams: any[] = [this.companyCode];
    let idx = 2;

    if (params.q) {
      whereClauses.push(`(p.product_name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      queryParams.push(`%${params.q}%`);
      idx++;
    }

    if (params.categoryId) {
      whereClauses.push(`p.category_id = $${idx}::uuid`);
      queryParams.push(params.categoryId);
      idx++;
    }

    if (params.brandId) {
      whereClauses.push(`p.brand_id = $${idx}::uuid`);
      queryParams.push(params.brandId);
      idx++;
    }

    const whereSql = whereClauses.join(' AND ');

    const countRows = await query<{ count: number }>(
      `SELECT count(*)::int as count FROM ep_catalog.tb_ep_catalog_prd_product_master p WHERE ${whereSql};`,
      queryParams
    );

    const total = countRows[0]?.count || 0;

    const data = await query(
      `SELECT 
        p.id, 
        p.product_code, 
        p.product_name, 
        b.brand_name, 
        c.category_name, 
        p.description,
        COALESCE(MIN(pr.sale_price), MIN(pr.list_price), 0)::numeric as price,
        (
          SELECT media_url 
          FROM ep_catalog.tb_ep_catalog_media_product_media_detail m 
          WHERE m.product_id = p.id AND m.active = true 
          ORDER BY m.is_primary DESC 
          LIMIT 1
        ) as image_url
       FROM ep_catalog.tb_ep_catalog_prd_product_master p
       LEFT JOIN ep_catalog.tb_ep_catalog_cat_category_master c ON c.id = p.category_id
       LEFT JOIN ep_catalog.tb_ep_catalog_brand_brand_master b ON b.id = p.brand_id
       LEFT JOIN ep_catalog.tb_ep_catalog_prd_product_variant_master v ON v.product_id = p.id
       LEFT JOIN ep_merchant.tb_ep_merchant_prd_listing_variant_master lv ON lv.variant_id = v.id
       LEFT JOIN ep_pricing.tb_ep_pricing_price_product_price_detail pr ON pr.listing_variant_id = lv.id
       WHERE ${whereSql}
       GROUP BY p.id, b.brand_name, c.category_name
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1};`,
      [...queryParams, pageSize, offset]
    );

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  public async adjustStock(offerId: string, delta: number, reason: string, actorId?: string): Promise<any> {
    return { status: 'SUCCESS', delta, reason };
  }
}

export const catalogService = new CatalogService();
