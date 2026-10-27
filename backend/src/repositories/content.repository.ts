// ==============================================================================
// EVEREST PASAL - CMS & CONTENT REPOSITORY (ep_content)
// Full dynamic support for Hero Banners & CMS managed by Super Admin
// ==============================================================================

import { query, execute } from '../db.js';

export class ContentRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
    this.ensureBannerColumns().catch(() => {});
  }

  /**
   * Ensure necessary banner presentation columns exist in PostgreSQL
   */
  async ensureBannerColumns(): Promise<void> {
    try {
      await execute(`
        ALTER TABLE ep_content.tb_ep_content_banner_banner_master 
        ADD COLUMN IF NOT EXISTS bg_color character varying(30) DEFAULT '#DC2626',
        ADD COLUMN IF NOT EXISTS subtitle text,
        ADD COLUMN IF NOT EXISTS button_text character varying(50) DEFAULT 'Shop Now';
      `);
    } catch {
      // safe fallback if already exists or permission
    }
  }

  /**
   * Get active published banners for storefront (public)
   */
  async getBanners(placement?: string): Promise<any[]> {
    await this.ensureBannerColumns();
    let sql = `SELECT * FROM ep_content.tb_ep_content_banner_banner_master WHERE company_code = $1 AND active = true AND publish = true`;
    const params: any[] = [this.companyCode];
    if (placement) {
      sql += ` AND placement_code = $2`;
      params.push(placement);
    }
    sql += ` ORDER BY sort_order ASC, created_at DESC;`;
    let rows = await query(sql, params);

    // Auto-seed default banners if none exist
    if (rows.length === 0) {
      await this.seedDefaultBanners();
      rows = await query(sql, params);
    }

    return rows;
  }

  /**
   * Get all banners for Admin panel (including drafts & inactive)
   */
  async getAllBanners(): Promise<any[]> {
    await this.ensureBannerColumns();
    const sql = `SELECT * FROM ep_content.tb_ep_content_banner_banner_master WHERE company_code = $1 ORDER BY sort_order ASC, created_at DESC;`;
    let rows = await query(sql, [this.companyCode]);

    if (rows.length === 0) {
      await this.seedDefaultBanners();
      rows = await query(sql, [this.companyCode]);
    }

    return rows;
  }

  /**
   * Create a new Hero Banner (Super Admin)
   */
  async createBanner(data: {
    banner_code?: string;
    banner_name: string;
    subtitle?: string;
    button_text?: string;
    placement_code?: string;
    image_url: string;
    target_url?: string;
    bg_color?: string;
    sort_order?: number;
    active?: boolean;
    publish?: boolean;
  }): Promise<any> {
    await this.ensureBannerColumns();
    const code = data.banner_code || `BNR_${Date.now()}`;
    const placement = data.placement_code || 'HERO_SLIDER';
    const sortOrder = data.sort_order ?? 0;
    const active = data.active ?? true;
    const publish = data.publish ?? true;
    const bgColor = data.bg_color || '#DC2626';
    const subtitle = data.subtitle || '';
    const buttonText = data.button_text || 'Shop Now';

    const sql = `
      INSERT INTO ep_content.tb_ep_content_banner_banner_master
      (company_code, banner_code, banner_name, placement_code, image_url, target_url, bg_color, subtitle, button_text, sort_order, active, publish)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const rows = await query(sql, [
      this.companyCode,
      code,
      data.banner_name,
      placement,
      data.image_url,
      data.target_url || '/',
      bgColor,
      subtitle,
      buttonText,
      sortOrder,
      active,
      publish,
    ]);
    return rows[0];
  }

  /**
   * Update an existing banner (Super Admin)
   */
  async updateBanner(id: string, data: Partial<{
    banner_name: string;
    subtitle: string;
    button_text: string;
    placement_code: string;
    image_url: string;
    target_url: string;
    bg_color: string;
    sort_order: number;
    active: boolean;
    publish: boolean;
  }>): Promise<any> {
    await this.ensureBannerColumns();
    const fields: string[] = [];
    const params: any[] = [id, this.companyCode];
    let idx = 3;

    if (data.banner_name !== undefined) {
      fields.push(`banner_name = $${idx++}`);
      params.push(data.banner_name);
    }
    if (data.subtitle !== undefined) {
      fields.push(`subtitle = $${idx++}`);
      params.push(data.subtitle);
    }
    if (data.button_text !== undefined) {
      fields.push(`button_text = $${idx++}`);
      params.push(data.button_text);
    }
    if (data.placement_code !== undefined) {
      fields.push(`placement_code = $${idx++}`);
      params.push(data.placement_code);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      params.push(data.image_url);
    }
    if (data.target_url !== undefined) {
      fields.push(`target_url = $${idx++}`);
      params.push(data.target_url);
    }
    if (data.bg_color !== undefined) {
      fields.push(`bg_color = $${idx++}`);
      params.push(data.bg_color);
    }
    if (data.sort_order !== undefined) {
      fields.push(`sort_order = $${idx++}`);
      params.push(data.sort_order);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${idx++}`);
      params.push(data.active);
    }
    if (data.publish !== undefined) {
      fields.push(`publish = $${idx++}`);
      params.push(data.publish);
    }

    if (fields.length === 0) return null;
    fields.push(`updated_at = clock_timestamp()`);

    const sql = `
      UPDATE ep_content.tb_ep_content_banner_banner_master
      SET ${fields.join(', ')}
      WHERE id = $1 AND company_code = $2
      RETURNING *;
    `;
    const rows = await query(sql, params);
    return rows[0] || null;
  }

  /**
   * Delete a banner (Super Admin)
   */
  async deleteBanner(id: string): Promise<boolean> {
    const sql = `DELETE FROM ep_content.tb_ep_content_banner_banner_master WHERE id = $1 AND company_code = $2;`;
    await execute(sql, [id, this.companyCode]);
    return true;
  }

  /**
   * Seed default 4 Hero Slides into PostgreSQL
   */
  async seedDefaultBanners(): Promise<void> {
    await this.ensureBannerColumns();
    const defaults = [
      {
        banner_code: 'HERO_SLIDE_1_SALE',
        banner_name: '60% OFF - Summer Mega Sale',
        subtitle: 'Exclusive discounts on streetwear, t-shirts, active wear and sneakers',
        button_text: 'Shop Now',
        image_url: '/images/hero_sale_banner.jpg',
        target_url: '/products?sale=flash',
        bg_color: '#DC2626',
        sort_order: 1,
      },
      {
        banner_code: 'HERO_SLIDE_2_PASHMINA',
        banner_name: 'Authentic Cashmere & Pashmina Collection',
        subtitle: 'Pure authentic handwoven luxury straight from Himalayan artisans',
        button_text: 'Explore Shawls',
        image_url: '/images/hero_pashmina.jpg',
        target_url: '/products?category=apparel',
        bg_color: '#F7F4F0',
        sort_order: 2,
      },
      {
        banner_code: 'HERO_SLIDE_3_TECH',
        banner_name: 'Next-Gen Smartwatches & Fitness Trackers',
        subtitle: 'Real-time health telemetry, sports modes, and long battery life',
        button_text: 'Discover Tech',
        image_url: '/images/hero_smartwatch.jpg',
        target_url: '/products?category=electronics',
        bg_color: '#F3F6F9',
        sort_order: 3,
      },
      {
        banner_code: 'HERO_SLIDE_4_HONEY',
        banner_name: 'Pure Himalayan Wild Honey & Herbal Teas',
        subtitle: 'Sustainably harvested from wild cliff bees in high-altitude valleys',
        button_text: 'Shop Organic',
        image_url: '/images/hero_honey.jpg',
        target_url: '/products?category=groceries',
        bg_color: '#F9F6F0',
        sort_order: 4,
      },
    ];

    for (const d of defaults) {
      await execute(
        `INSERT INTO ep_content.tb_ep_content_banner_banner_master
         (company_code, banner_code, banner_name, placement_code, image_url, target_url, bg_color, subtitle, button_text, sort_order, active, publish)
         VALUES ($1, $2, $3, 'HERO_SLIDER', $4, $5, $6, $7, $8, $9, true, true)
         ON CONFLICT (id) DO NOTHING;`,
        [
          this.companyCode,
          d.banner_code,
          d.banner_name,
          d.image_url,
          d.target_url,
          d.bg_color,
          d.subtitle,
          d.button_text,
          d.sort_order,
        ]
      );
    }
  }

  async getPageBySlug(slug: string): Promise<any | null> {
    const rows = await query(
      `SELECT * FROM ep_content.tb_ep_content_page_page_master 
       WHERE company_code = $1 AND slug = $2 AND active = true AND publish = true 
       LIMIT 1;`,
      [this.companyCode, slug]
    );
    return rows[0] || null;
  }

  async getMenus(menuCode?: string): Promise<any[]> {
    let sql = `
      SELECT m.id, m.menu_code, m.menu_name, m.channel_code,
             i.id as item_id, i.label, i.target_type, i.target_value, i.parent_item_id, i.sort_order
      FROM ep_content.tb_ep_content_menu_menu_master m
      LEFT JOIN ep_content.tb_ep_content_menu_menu_item_detail i ON i.menu_id = m.id AND i.active = true
      WHERE m.company_code = $1 AND m.active = true AND m.publish = true
    `;
    const params: any[] = [this.companyCode];

    if (menuCode) {
      sql += ` AND m.menu_code = $2`;
      params.push(menuCode);
    }

    sql += ` ORDER BY m.menu_code, i.sort_order ASC;`;
    return await query(sql, params);
  }

  async getFaqs(category?: string): Promise<any[]> {
    let sql = `SELECT * FROM ep_content.tb_ep_content_faq_faq_master WHERE company_code = $1 AND active = true AND publish = true`;
    const params: any[] = [this.companyCode];
    if (category) {
      sql += ` AND category = $2`;
      params.push(category);
    }
    sql += ` ORDER BY sort_order ASC;`;
    return await query(sql, params);
  }
}
