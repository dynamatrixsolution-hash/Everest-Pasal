import { Request, Response } from 'express';
import { FinanceRepository } from '../../repositories/finance.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getLedgerAccountsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FinanceRepository(companyCode);
    const data = await repo.getLedgerAccounts();
    sendSuccess(res, data, 'Ledger accounts retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ACCOUNTS_FAILED', error.message, 500);
  }
}

export async function createJournalHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FinanceRepository(companyCode);

    const journal = await repo.createBalancedJournal({
      ...req.body,
      createdBy: user.id,
    });
    sendSuccess(res, journal, 'Balanced journal posted successfully', 201);
  } catch (error: any) {
    sendError(res, 'JOURNAL_CREATION_FAILED', error.message, 400);
  }
}

export async function createSettlementHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FinanceRepository(companyCode);

    const settlement = await repo.createMerchantSettlement(req.body);
    sendSuccess(res, settlement, 'Merchant settlement created', 201);
  } catch (error: any) {
    sendError(res, 'SETTLEMENT_CREATION_FAILED', error.message, 400);
  }
}

export async function getVendorSettlementsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const vendorId = req.params.vendorId || user.vendorId || user.id;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FinanceRepository(companyCode);

    const settlements = await repo.getVendorSettlements(vendorId);
    sendSuccess(res, settlements, 'Vendor settlements retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_SETTLEMENTS_FAILED', error.message, 500);
  }
}

export async function createPayoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new FinanceRepository(companyCode);

    const payout = await repo.createMerchantPayout({
      ...req.body,
      initiatedBy: user.id,
    });
    sendSuccess(res, payout, 'Payout processing initiated', 201);
  } catch (error: any) {
    sendError(res, 'PAYOUT_CREATION_FAILED', error.message, 400);
  }
}
