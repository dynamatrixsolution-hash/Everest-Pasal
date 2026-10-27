import { Request, Response } from 'express';
import { SystemRepository } from '../../repositories/system.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getCompaniesHandler(req: Request, res: Response): Promise<void> {
  try {
    const repo = new SystemRepository();
    const companies = await repo.getAllCompanies();
    sendSuccess(res, companies, 'Companies retrieved successfully', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_COMPANIES_FAILED', error.message, 500);
  }
}

export async function getFiscalYearsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SystemRepository(companyCode);
    const fiscalYears = await repo.getFiscalYears();
    sendSuccess(res, fiscalYears, 'Fiscal years retrieved successfully', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FISCAL_YEARS_FAILED', error.message, 500);
  }
}

export async function getFeatureFlagsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SystemRepository(companyCode);
    const flags = await repo.getFeatureFlags();
    sendSuccess(res, flags, 'Feature flags retrieved successfully', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FEATURE_FLAGS_FAILED', error.message, 500);
  }
}
