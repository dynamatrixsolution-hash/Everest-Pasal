import { Request, Response } from 'express';
import { KycRepository } from '../../repositories/kyc.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getMyKycCaseHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new KycRepository(companyCode);

    const subjectType = user.userType === 'VENDOR' ? 'MERCHANT' : 'INDIVIDUAL';
    const subject = await repo.findOrCreateSubject(subjectType, user.id, user.displayName);
    let kycCase = await repo.getCaseBySubjectId(subject.id);

    if (!kycCase) {
      kycCase = await repo.createCase(subject.id, subjectType === 'MERCHANT' ? 'KYB' : 'KYC');
    }

    const documents = await repo.getDocuments(kycCase.id);
    sendSuccess(res, { subject, case: kycCase, documents }, 'KYC Case retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_KYC_FAILED', error.message, 500);
  }
}

export async function uploadKycDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new KycRepository(companyCode);

    const subjectType = user.userType === 'VENDOR' ? 'MERCHANT' : 'INDIVIDUAL';
    const subject = await repo.findOrCreateSubject(subjectType, user.id, user.displayName);
    let kycCase = await repo.getCaseBySubjectId(subject.id);

    if (!kycCase) {
      kycCase = await repo.createCase(subject.id, subjectType === 'MERCHANT' ? 'KYB' : 'KYC');
    }

    const doc = await repo.uploadDocument(kycCase.id, req.body);
    sendSuccess(res, doc, 'KYC Document uploaded', 201);
  } catch (error: any) {
    sendError(res, 'UPLOAD_KYC_DOC_FAILED', error.message, 400);
  }
}

export async function submitKycCaseHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new KycRepository(companyCode);

    const subjectType = user.userType === 'VENDOR' ? 'MERCHANT' : 'INDIVIDUAL';
    const subject = await repo.findOrCreateSubject(subjectType, user.id, user.displayName);
    const kycCase = await repo.getCaseBySubjectId(subject.id);

    if (!kycCase) {
      sendError(res, 'CASE_NOT_FOUND', 'No active KYC case found', 404);
      return;
    }

    const submitted = await repo.submitCase(kycCase.id);
    sendSuccess(res, submitted, 'KYC case submitted for verification', 200);
  } catch (error: any) {
    sendError(res, 'SUBMIT_KYC_FAILED', error.message, 400);
  }
}

export async function getAdminPendingKycCasesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new KycRepository(companyCode);
    const pendingCases = await repo.getPendingCases();
    sendSuccess(res, pendingCases, 'Pending KYC cases retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PENDING_KYC_FAILED', error.message, 500);
  }
}

export async function recordKycDecisionHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const caseId = (req.params.caseId || req.params.id) as string;
    const { decision, remarks } = req.body;

    if (!['APPROVED', 'REJECTED', 'REVERIFICATION_REQUESTED'].includes(decision)) {
      sendError(res, 'INVALID_DECISION', 'Decision must be APPROVED, REJECTED, or REVERIFICATION_REQUESTED', 400);
      return;
    }

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new KycRepository(companyCode);

    const history = await repo.recordDecision(caseId, user.id, decision, remarks);
    sendSuccess(res, history, `KYC decision recorded: ${decision}`, 200);
  } catch (error: any) {
    sendError(res, 'RECORD_KYC_DECISION_FAILED', error.message, 400);
  }
}
