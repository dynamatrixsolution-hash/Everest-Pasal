// ==============================================================================
// EVEREST PASAL - KYC & KYB REPOSITORY (ep_kyc)
// ==============================================================================

import { query, execute } from '../db.js';
import crypto from 'crypto';

export class KycRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async findOrCreateSubject(subjectType: string, userId: string, legalName: string): Promise<any> {
    const existing = await query(
      `SELECT * FROM ep_kyc.tb_ep_kyc_subject_subject_master 
       WHERE company_code = $1 AND user_id = $2::uuid AND active = true 
       LIMIT 1;`,
      [this.companyCode, userId]
    );

    if (existing[0]) return existing[0];

    const created = await query(
      `INSERT INTO ep_kyc.tb_ep_kyc_subject_subject_master (
        id, company_code, subject_type, user_id, subject_kind, legal_name, country_code, current_status, current_risk_level, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, 'INDIVIDUAL', $4, 'NPL', 'DRAFT', 'LOW', true, false
      ) RETURNING *;`,
      [this.companyCode, subjectType, userId, legalName || 'Everest User']
    );
    return created[0];
  }

  async getCaseBySubjectId(subjectId: string): Promise<any | null> {
    const rows = await query(
      `SELECT * FROM ep_kyc.tb_ep_kyc_case_verification_case_master 
       WHERE company_code = $1 AND subject_id = $2::uuid AND active = true 
       ORDER BY created_at DESC 
       LIMIT 1;`,
      [this.companyCode, subjectId]
    );
    return rows[0] || null;
  }

  async createCase(subjectId: string, caseType: string, riskLevel: string = 'LOW', sourceChannel: string = 'WEB'): Promise<any> {
    const caseNo = `CASE_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_kyc.tb_ep_kyc_case_verification_case_master (
        id, company_code, case_no, subject_id, case_type, status, source_channel, risk_level, initiated_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4, 'DRAFT', $5, $6, clock_timestamp(), true, false
      ) RETURNING *;`,
      [this.companyCode, caseNo, subjectId, caseType, sourceChannel, riskLevel]
    );
    return rows[0];
  }

  async uploadDocument(caseId: string, doc: {
    documentType: string;
    documentNumber?: string;
    fileUrl?: string;
    fileReference?: string;
    fileName?: string;
    storageProvider?: string;
    issueDate?: Date;
    expiryDate?: Date;
  }): Promise<any> {
    const fileRef = doc.fileReference || doc.fileUrl || '/uploads/kyc_doc.pdf';
    const checksum = crypto.createHash('sha256').update(fileRef + Date.now()).digest('hex');
    const rows = await query(
      `INSERT INTO ep_kyc.tb_ep_kyc_document_document_master (
        id, company_code, case_id, document_type, document_no_masked, storage_provider,
        file_reference, checksum_sha256, issued_on, expires_on, verification_status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, 'PENDING', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        caseId,
        doc.documentType,
        doc.documentNumber ? `***${doc.documentNumber.slice(-4)}` : null,
        doc.storageProvider || 'LOCAL',
        fileRef,
        checksum,
        doc.issueDate || null,
        doc.expiryDate || null,
      ]
    );
    return rows[0];
  }

  async getDocuments(caseId: string): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_kyc.tb_ep_kyc_document_document_master 
       WHERE company_code = $1 AND case_id = $2::uuid AND active = true 
       ORDER BY created_at ASC;`,
      [this.companyCode, caseId]
    );
  }

  async submitCase(caseId: string): Promise<any> {
    const rows = await query(
      `UPDATE ep_kyc.tb_ep_kyc_case_verification_case_master 
       SET status = 'SUBMITTED', submitted_at = clock_timestamp(), updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid AND active = true 
       RETURNING *;`,
      [this.companyCode, caseId]
    );
    return rows[0];
  }

  async recordDecision(caseId: string, deciderId: string, decision: 'APPROVED' | 'REJECTED' | 'REVERIFICATION_REQUESTED', remarks?: string): Promise<any> {
    // 1. Update case status
    await execute(
      `UPDATE ep_kyc.tb_ep_kyc_case_verification_case_master 
       SET status = $3, decision_at = clock_timestamp(), updated_at = clock_timestamp() 
       WHERE company_code = $1 AND id = $2::uuid;`,
      [this.companyCode, caseId, decision]
    );

    // 2. Insert decision history
    const history = await query(
      `INSERT INTO ep_kyc.tb_ep_kyc_decision_decision_history (
        id, company_code, case_id, decision, decision_reason_code, decision_note, decided_by, decided_at, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, 'STANDARD_REVIEW', $4, $5::uuid, clock_timestamp(), true, false
      ) RETURNING *;`,
      [this.companyCode, caseId, decision, remarks || null, deciderId]
    );
    return history[0];
  }

  async getPendingCases(): Promise<any[]> {
    return await query(
      `SELECT c.*, s.subject_type, s.legal_name, s.user_id, s.merchant_id 
       FROM ep_kyc.tb_ep_kyc_case_verification_case_master c
       JOIN ep_kyc.tb_ep_kyc_subject_subject_master s ON s.id = c.subject_id
       WHERE c.company_code = $1 AND c.status = 'SUBMITTED' AND c.active = true 
       ORDER BY c.submitted_at ASC;`,
      [this.companyCode]
    );
  }
}
