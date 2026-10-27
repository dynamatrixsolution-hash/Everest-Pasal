import { Request, Response } from 'express';
import { ReturnsRepository } from '../../repositories/returns.repository.js';
import { CustomerRepository } from '../../repositories/customer.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getReturnReasonsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new ReturnsRepository(companyCode);
    const reasons = await repo.getReturnReasons();
    sendSuccess(res, reasons, 'Return reasons retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RETURN_REASONS_FAILED', error.message, 500);
  }
}

export async function createReturnRequestHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const custRepo = new CustomerRepository(companyCode);
    const returnRepo = new ReturnsRepository(companyCode);

    const profile = await custRepo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }

    const returnReq = await returnRepo.createReturnRequest({
      ...req.body,
      customerId: profile.id,
    });
    sendSuccess(res, returnReq, 'Return request submitted successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_RETURN_FAILED', error.message, 400);
  }
}

export async function recordReturnInspectionHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new ReturnsRepository(companyCode);

    const inspection = await repo.recordInspection({
      ...req.body,
      inspectorId: user.id,
    });
    sendSuccess(res, inspection, 'Return inspection recorded', 201);
  } catch (error: any) {
    sendError(res, 'RECORD_INSPECTION_FAILED', error.message, 400);
  }
}

export async function getMyReturnsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const custRepo = new CustomerRepository(companyCode);
    const returnRepo = new ReturnsRepository(companyCode);

    const profile = await custRepo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }

    const returns = await returnRepo.getCustomerReturns(profile.id);
    sendSuccess(res, returns, 'Customer returns retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RETURNS_FAILED', error.message, 500);
  }
}
