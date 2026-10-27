import { Request, Response } from 'express';
import { LogisticsRepository } from '../../repositories/logistics.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getCarriersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new LogisticsRepository(companyCode);
    const data = await repo.getCarriers();
    sendSuccess(res, data, 'Carriers retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CARRIERS_FAILED', error.message, 500);
  }
}

export async function createShipmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new LogisticsRepository(companyCode);

    const shipment = await repo.createShipment(req.body);
    sendSuccess(res, shipment, 'Shipment created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_SHIPMENT_FAILED', error.message, 400);
  }
}

export async function recordTrackingEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const shipmentId = req.params.id as string;
    const { eventType, description, location } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new LogisticsRepository(companyCode);

    const event = await repo.recordTrackingEvent(shipmentId, eventType, description, location, user?.id);
    sendSuccess(res, event, 'Tracking event recorded', 201);
  } catch (error: any) {
    sendError(res, 'RECORD_TRACKING_FAILED', error.message, 400);
  }
}

export async function getTrackingHandler(req: Request, res: Response): Promise<void> {
  try {
    const trackingNumber = (req.params.trackingNumber || req.query.trackingNumber) as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new LogisticsRepository(companyCode);

    const data = await repo.getShipmentByTrackingNumber(trackingNumber);
    if (!data) {
      sendError(res, 'SHIPMENT_NOT_FOUND', 'Shipment tracking details not found', 404);
      return;
    }
    sendSuccess(res, data, 'Tracking details retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TRACKING_FAILED', error.message, 500);
  }
}

export async function getRidersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new LogisticsRepository(companyCode);
    const data = await repo.getRiders();
    sendSuccess(res, data, 'Riders retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_RIDERS_FAILED', error.message, 500);
  }
}
