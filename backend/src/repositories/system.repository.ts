// ==============================================================================
// EVEREST PASAL - SYSTEM REPOSITORY (ep_system)
// ==============================================================================

import { query, execute } from '../db.js';

export interface CompanyRow {
  id: string;
  company_code: string;
  legal_name: string;
  trade_name: string;
  pan_vat_number: string | null;
  base_currency: string;
  default_language: string;
  status: string;
  active: boolean;
  publish: boolean;
  created_at: Date;
}

export interface FiscalYearRow {
  id: string;
  company_code: string;
  fiscal_year_code: string;
  fiscal_year_name: string;
  start_date_bs: string | null;
  end_date_bs: string | null;
  start_date_ad: Date;
  end_date_ad: Date;
  is_closed: boolean;
  active: boolean;
}

export class SystemRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getAllCompanies(): Promise<CompanyRow[]> {
    return await query<CompanyRow>(
      `SELECT * FROM ep_system.tb_ep_system_company_company_master 
       WHERE active = true 
       ORDER BY company_code ASC;`
    );
  }

  async getCompanyByCode(code: string): Promise<CompanyRow | null> {
    const rows = await query<CompanyRow>(
      `SELECT * FROM ep_system.tb_ep_system_company_company_master 
       WHERE company_code = $1 AND active = true 
       LIMIT 1;`,
      [code]
    );
    return rows[0] || null;
  }

  async getFiscalYears(): Promise<FiscalYearRow[]> {
    return await query<FiscalYearRow>(
      `SELECT * FROM ep_system.tb_ep_system_company_fiscal_year_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY start_date DESC;`,
      [this.companyCode]
    );
  }

  async getActiveFiscalYear(): Promise<FiscalYearRow | null> {
    const rows = await query<FiscalYearRow>(
      `SELECT * FROM ep_system.tb_ep_system_company_fiscal_year_master 
       WHERE company_code = $1 AND active = true AND is_closed = false 
       ORDER BY start_date DESC 
       LIMIT 1;`,
      [this.companyCode]
    );
    return rows[0] || null;
  }

  async getFeatureFlags(): Promise<any[]> {
    return await query<any>(
      `SELECT * FROM ep_system.tb_ep_system_feature_feature_flag_setup 
       WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );
  }

  async getSettings(): Promise<any[]> {
    return await query<any>(
      `SELECT * FROM ep_system.tb_ep_system_company_setting_master 
       WHERE company_code = $1 AND active = true;`,
      [this.companyCode]
    );
  }

  async getNextDocumentNumber(seriesCode: string): Promise<string> {
    const rows = await query<{ next_number: number; prefix: string; suffix: string }>(
      `UPDATE ep_system.tb_ep_system_document_number_series_master 
       SET next_number = next_number + 1, updated_at = clock_timestamp() 
       WHERE company_code = $1 AND series_code = $2 AND active = true 
       RETURNING next_number, prefix, suffix;`,
      [this.companyCode, seriesCode]
    );
    if (!rows[0]) {
      return `${seriesCode}-${Date.now()}`;
    }
    const { next_number, prefix, suffix } = rows[0];
    return `${prefix || ''}${next_number}${suffix || ''}`;
  }
}
