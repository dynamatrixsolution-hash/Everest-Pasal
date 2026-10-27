// ==============================================================================
// EVEREST PASAL - GEOGRAPHY REPOSITORY (ep_geo)
// ==============================================================================

import { query } from '../db.js';

export class GeoRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getCountries(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_geo.tb_ep_geo_country_country_master 
       WHERE active = true 
       ORDER BY country_name ASC;`
    );
  }

  async getProvinces(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_geo.tb_ep_geo_province_province_master 
       WHERE active = true 
       ORDER BY province_code ASC;`
    );
  }

  async getDistricts(provinceId?: string): Promise<any[]> {
    let sql = `SELECT * FROM ep_geo.tb_ep_geo_district_district_master WHERE active = true`;
    const params: any[] = [];
    if (provinceId) {
      sql += ` AND province_id = $1::uuid`;
      params.push(provinceId);
    }
    sql += ` ORDER BY district_name ASC;`;
    return await query(sql, params);
  }

  async getCities(districtId?: string): Promise<any[]> {
    let sql = `SELECT * FROM ep_geo.tb_ep_geo_city_city_master WHERE active = true`;
    const params: any[] = [];
    if (districtId) {
      sql += ` AND district_id = $1::uuid`;
      params.push(districtId);
    }
    sql += ` ORDER BY city_name ASC;`;
    return await query(sql, params);
  }

  async getPostalCodes(cityId?: string): Promise<any[]> {
    let sql = `SELECT * FROM ep_geo.tb_ep_geo_postal_postal_code_master WHERE active = true`;
    const params: any[] = [];
    if (cityId) {
      sql += ` AND city_id = $1::uuid`;
      params.push(cityId);
    }
    sql += ` ORDER BY postal_code ASC;`;
    return await query(sql, params);
  }

  async getDeliveryZones(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_geo.tb_ep_geo_zone_delivery_zone_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY zone_name ASC;`,
      [this.companyCode]
    );
  }

  async getServiceAreas(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_geo.tb_ep_geo_service_service_area_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY area_name ASC;`,
      [this.companyCode]
    );
  }
}
