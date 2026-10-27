import { Request, Response } from 'express';
import { AuditRepository } from '../../repositories/audit.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getActivityLogsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new AuditRepository(companyCode);

    const actorUserId = (req.query.actorUserId || req.query.userId) as string;
    const entityType = req.query.entityType as string;
    const actionType = (req.query.actionType || req.query.activityType) as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await repo.getActivityLogs({ userId: actorUserId, activityType: actionType, page, pageSize });
    sendSuccess(res, result.data, 'Activity audit logs retrieved', 200, {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error: any) {
    sendError(res, 'FETCH_AUDIT_LOGS_FAILED', error.message, 500);
  }
}
