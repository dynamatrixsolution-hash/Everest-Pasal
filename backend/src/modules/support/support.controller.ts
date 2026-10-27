import { Request, Response } from 'express';
import { SupportRepository } from '../../repositories/support.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function createTicketHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SupportRepository(companyCode);

    const ticket = await repo.createTicket({
      ...req.body,
      userId: user.id,
    });
    sendSuccess(res, ticket, 'Support ticket created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_TICKET_FAILED', error.message, 400);
  }
}

export async function getTicketsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SupportRepository(companyCode);

    // If customer/vendor, restrict to own tickets unless admin
    const userIdFilter = user.userType === 'ADMIN' ? (req.query.userId as string) : user.id;
    const status = req.query.status as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await repo.getTickets({ userId: userIdFilter, status, page, pageSize });
    sendSuccess(res, result.data, 'Tickets retrieved', 200, {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error: any) {
    sendError(res, 'FETCH_TICKETS_FAILED', error.message, 500);
  }
}

export async function getTicketDetailsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const ticketId = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SupportRepository(companyCode);

    const ticket = await repo.getTicketDetails(ticketId);
    if (!ticket) {
      sendError(res, 'TICKET_NOT_FOUND', 'Support ticket not found', 404);
      return;
    }

    // Ownership check
    if (user.userType !== 'ADMIN' && ticket.requester_user_id !== user.id) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to view this ticket', 403);
      return;
    }

    sendSuccess(res, ticket, 'Ticket details retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_TICKET_DETAILS_FAILED', error.message, 500);
  }
}

export async function addTicketMessageHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const ticketId = req.params.id as string;
    const { messageBody, isInternal } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SupportRepository(companyCode);

    const message = await repo.addMessage(ticketId, user.id, messageBody, Boolean(isInternal && user.userType === 'ADMIN'));
    sendSuccess(res, message, 'Message added to ticket', 201);
  } catch (error: any) {
    sendError(res, 'ADD_MESSAGE_FAILED', error.message, 400);
  }
}

export async function updateTicketStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const ticketId = req.params.id as string;
    const { status, reason } = req.body;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new SupportRepository(companyCode);

    await repo.updateTicketStatus(ticketId, status, user.id, reason);
    sendSuccess(res, { updated: true, status }, 'Ticket status updated', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_STATUS_FAILED', error.message, 400);
  }
}
