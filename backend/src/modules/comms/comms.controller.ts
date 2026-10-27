import { Request, Response } from 'express';
import { CommsRepository } from '../../repositories/comms.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getUserNotificationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CommsRepository(companyCode);

    const notifications = await repo.getUserNotifications(user.id);
    sendSuccess(res, notifications, 'Notifications retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_NOTIFICATIONS_FAILED', error.message, 500);
  }
}

export async function markNotificationReadHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const notificationId = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CommsRepository(companyCode);

    await repo.markNotificationRead(notificationId, user.id);
    sendSuccess(res, { read: true }, 'Notification marked as read', 200);
  } catch (error: any) {
    sendError(res, 'MARK_READ_FAILED', error.message, 400);
  }
}

export async function markAllNotificationsReadHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CommsRepository(companyCode);

    await repo.markAllNotificationsRead(user.id);
    sendSuccess(res, { readAll: true }, 'All notifications marked as read', 200);
  } catch (error: any) {
    sendError(res, 'MARK_ALL_READ_FAILED', error.message, 400);
  }
}
