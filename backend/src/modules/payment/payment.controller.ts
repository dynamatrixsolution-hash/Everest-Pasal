import { Request, Response } from 'express';
import { PaymentRepository } from '../../repositories/payment.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getPaymentProvidersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PaymentRepository(companyCode);
    const data = await repo.getProviders();
    sendSuccess(res, data, 'Payment providers retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PAYMENT_PROVIDERS_FAILED', error.message, 500);
  }
}

export async function createPaymentIntentHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PaymentRepository(companyCode);

    const intent = await repo.createPaymentIntent({
      ...req.body,
      customerId: user ? user.id : req.body.customerId,
    });
    sendSuccess(res, intent, 'Payment intent created', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_INTENT_FAILED', error.message, 400);
  }
}

export async function recordPaymentTransactionHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PaymentRepository(companyCode);

    const txn = await repo.recordTransaction(req.body);
    sendSuccess(res, txn, 'Payment transaction recorded', 201);
  } catch (error: any) {
    sendError(res, 'RECORD_TXN_FAILED', error.message, 400);
  }
}

export async function paymentWebhookHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PaymentRepository(companyCode);
    const providerCode = req.params.providerCode || req.body.providerCode || 'GENERIC';
    const externalEventId = req.headers['x-event-id'] as string || req.body.eventId || req.body.id;

    const { isDuplicate, event } = await repo.recordWebhookEvent({
      providerCode,
      eventType: req.body.eventType || req.body.type || 'PAYMENT_NOTIFICATION',
      externalEventId,
      payload: req.body,
      signature: req.headers['x-signature'] as string,
    });

    if (isDuplicate) {
      res.setHeader('X-Webhook-Duplicate', 'true');
      sendSuccess(res, { processed: true, duplicate: true }, 'Webhook event already processed (idempotent)', 200);
      return;
    }

    // Process event outcome
    sendSuccess(res, { processed: true, eventId: event.id }, 'Webhook processed successfully', 200);
  } catch (error: any) {
    sendError(res, 'WEBHOOK_FAILED', error.message, 500);
  }
}

export async function createRefundHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new PaymentRepository(companyCode);

    const refund = await repo.createRefund({
      ...req.body,
      initiatedBy: user.id,
    });
    sendSuccess(res, refund, 'Refund initiated successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_REFUND_FAILED', error.message, 400);
  }
}
