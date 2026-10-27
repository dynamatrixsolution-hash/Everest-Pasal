// ==============================================================================
// EVEREST PASAL - INTEGRATION & OUTBOX REPOSITORY (ep_integration)
// ==============================================================================

import { query, execute } from '../db.js';

export class IntegrationRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async enqueueOutboxEvent(data: {
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: any;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_integration.tb_ep_integration_outbox_outbox_event_queue (
        id, company_code, event_id, aggregate_type, aggregate_id, event_type, payload_json,
        occurred_at, attempt_count, active, publish
      ) VALUES (
        gen_random_uuid(), $1, gen_random_uuid(), $2, $3::uuid, $4, $5, clock_timestamp(), 0, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.aggregateType,
        data.aggregateId,
        data.eventType,
        JSON.stringify(data.payload),
      ]
    );
    return rows[0];
  }

  async getPendingOutboxEvents(limit: number = 20): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_integration.tb_ep_integration_outbox_outbox_event_queue 
       WHERE company_code = $1 AND published_at IS NULL AND active = true 
       ORDER BY occurred_at ASC 
       LIMIT $2 
       FOR UPDATE SKIP LOCKED;`,
      [this.companyCode, limit]
    );
  }

  async markOutboxEventProcessed(eventId: string): Promise<void> {
    await execute(
      `UPDATE ep_integration.tb_ep_integration_outbox_outbox_event_queue 
       SET published_at = clock_timestamp(), updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [eventId]
    );
  }

  async markOutboxEventFailed(eventId: string, errorMessage: string): Promise<void> {
    await execute(
      `UPDATE ep_integration.tb_ep_integration_outbox_outbox_event_queue 
       SET attempt_count = attempt_count + 1, last_error = $2, updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [eventId, errorMessage]
    );
  }

  async createImportJob(jobType: string, fileUrl: string, initiatedBy: string): Promise<any> {
    const jobNumber = `IMP_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_integration.tb_ep_integration_job_import_job_master (
        id, company_code, job_number, job_type, file_url, status,
        initiated_by, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'QUEUED', $5::uuid, true, false
      ) RETURNING *;`,
      [this.companyCode, jobNumber, jobType, fileUrl, initiatedBy]
    );
    return rows[0];
  }

  async createExportJob(jobType: string, parameters: any, initiatedBy: string): Promise<any> {
    const jobNumber = `EXP_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_integration.tb_ep_integration_job_export_job_master (
        id, company_code, job_number, job_type, export_parameters, status,
        initiated_by, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'QUEUED', $5::uuid, true, false
      ) RETURNING *;`,
      [this.companyCode, jobNumber, jobType, JSON.stringify(parameters), initiatedBy]
    );
    return rows[0];
  }
}
