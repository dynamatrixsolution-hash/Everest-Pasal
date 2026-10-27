import { Request, Response } from 'express';
import { FulfillmentRepository } from '../../repositories/fulfillment.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function createFulfillmentOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FulfillmentRepository(companyCode);

    const fulfillment = await repo.createFulfillmentOrder(req.body);
    sendSuccess(res, fulfillment, 'Fulfillment order created', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_FULFILLMENT_FAILED', error.message, 400);
  }
}

export async function createPackageHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FulfillmentRepository(companyCode);

    const pkg = await repo.createPackage(req.body);
    sendSuccess(res, pkg, 'Package packed successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_PACKAGE_FAILED', error.message, 400);
  }
}

export async function getFulfillmentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FulfillmentRepository(companyCode);
    const merchantOrderId = req.query.merchantOrderId as string;

    const data = await repo.getFulfillments(merchantOrderId);
    sendSuccess(res, data, 'Fulfillments retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FULFILLMENTS_FAILED', error.message, 500);
  }
}
