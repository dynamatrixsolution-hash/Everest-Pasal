import { Request, Response } from 'express';
import { GeoRepository } from '../../repositories/geo.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getCountriesHandler(req: Request, res: Response): Promise<void> {
  try {
    const repo = new GeoRepository();
    const data = await repo.getCountries();
    sendSuccess(res, data, 'Countries retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_COUNTRIES_FAILED', error.message, 500);
  }
}

export async function getProvincesHandler(req: Request, res: Response): Promise<void> {
  try {
    const repo = new GeoRepository();
    const data = await repo.getProvinces();
    sendSuccess(res, data, 'Provinces retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PROVINCES_FAILED', error.message, 500);
  }
}

export async function getDistrictsHandler(req: Request, res: Response): Promise<void> {
  try {
    const provinceId = req.query.provinceId as string;
    const repo = new GeoRepository();
    const data = await repo.getDistricts(provinceId);
    sendSuccess(res, data, 'Districts retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_DISTRICTS_FAILED', error.message, 500);
  }
}

export async function getCitiesHandler(req: Request, res: Response): Promise<void> {
  try {
    const districtId = req.query.districtId as string;
    const repo = new GeoRepository();
    const data = await repo.getCities(districtId);
    sendSuccess(res, data, 'Cities retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CITIES_FAILED', error.message, 500);
  }
}

export async function getDeliveryZonesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new GeoRepository(companyCode);
    const data = await repo.getDeliveryZones();
    sendSuccess(res, data, 'Delivery zones retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_DELIVERY_ZONES_FAILED', error.message, 500);
  }
}
