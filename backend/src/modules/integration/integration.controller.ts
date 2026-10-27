import { Request, Response } from 'express';
import { IntegrationRepository } from '../../repositories/integration.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getOutboxQueueHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new IntegrationRepository(companyCode);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const events = await repo.getPendingOutboxEvents(limit);
    sendSuccess(res, events, 'Pending outbox events retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_OUTBOX_FAILED', error.message, 500);
  }
}

export async function processOutboxEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const eventId = req.params.id as string;
    const { status, errorMessage } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new IntegrationRepository(companyCode);

    if (status === 'PROCESSED') {
      await repo.markOutboxEventProcessed(eventId);
    } else {
      await repo.markOutboxEventFailed(eventId, errorMessage || 'Processing failed');
    }

    sendSuccess(res, { updated: true, eventId, status }, 'Outbox event updated', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_OUTBOX_FAILED', error.message, 400);
  }
}

export async function createImportJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { jobType, fileUrl } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new IntegrationRepository(companyCode);

    const job = await repo.createImportJob(jobType, fileUrl, user.id);
    sendSuccess(res, job, 'Import job queued successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_IMPORT_JOB_FAILED', error.message, 400);
  }
}

export async function createExportJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { jobType, parameters } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new IntegrationRepository(companyCode);

    const job = await repo.createExportJob(jobType, parameters || {}, user.id);
    sendSuccess(res, job, 'Export job queued successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_EXPORT_JOB_FAILED', error.message, 400);
  }
}
