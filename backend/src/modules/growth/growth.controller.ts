import { Request, Response } from 'express';
import { GrowthRepository } from '../../repositories/growth.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function validateReferralCodeHandler(req: Request, res: Response): Promise<void> {
  try {
    const code = (req.params.code || req.query.code) as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new GrowthRepository(companyCode);

    const ref = await repo.getReferralCode(code);
    if (!ref) {
      sendError(res, 'REFERRAL_NOT_FOUND', 'Invalid or inactive referral code', 404);
      return;
    }

    sendSuccess(
      res,
      {
        valid: true,
        referralCode: ref.referral_code,
        discountPercentage: ref.discount_percentage,
      },
      'Referral code valid',
      200
    );
  } catch (error: any) {
    sendError(res, 'VALIDATE_REFERRAL_FAILED', error.message, 500);
  }
}

export async function createReferralCodeHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new GrowthRepository(companyCode);

    const created = await repo.createReferralCode(user.id, req.body.code, req.body.discountPercent, req.body.commissionPercent);
    sendSuccess(res, created, 'Referral code generated successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_REFERRAL_FAILED', error.message, 400);
  }
}

export async function getCampaignsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new GrowthRepository(companyCode);
    const data = await repo.getCampaigns();
    sendSuccess(res, data, 'Campaigns retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_CAMPAIGNS_FAILED', error.message, 500);
  }
}
