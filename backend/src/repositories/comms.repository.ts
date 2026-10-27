// ==============================================================================
// EVEREST PASAL - COMMUNICATIONS & NOTIFICATIONS REPOSITORY (ep_comms)
// ==============================================================================

import { query, execute } from '../db.js';

export class CommsRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getTemplate(templateCode: string): Promise<any | null> {
    const rows = await query(
      `SELECT * FROM ep_comms.tb_ep_comms_template_template_master 
       WHERE company_code = $1 AND template_code = $2 AND active = true 
       LIMIT 1;`,
      [this.companyCode, templateCode]
    );
    return rows[0] || null;
  }

  async createNotification(data: {
    templateId?: string;
    notificationType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'SYSTEM_ALERT';
    title: string;
    body: string;
    referenceType?: string;
    referenceId?: string;
    recipients: {
      userId?: string;
      recipientAddress?: string;
      communicationType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    }[];
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_comms.tb_ep_comms_notify_notification_master (
        id, company_code, template_id, notification_type, reference_type,
        reference_id, title, body, status, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5::uuid, $6, $7, 'PENDING', true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        data.templateId || null,
        data.notificationType,
        data.referenceType || null,
        data.referenceId || null,
        data.title,
        data.body,
      ]
    );

    const notification = rows[0];

    for (const r of data.recipients) {
      await execute(
        `INSERT INTO ep_comms.tb_ep_comms_notify_notification_recipient_detail (
          id, company_code, notification_id, user_id, recipient_address,
          communication_type, status, active, publish
        ) VALUES (
          gen_random_uuid(), $1, $2::uuid, $3::uuid, $4, $5, 'PENDING', true, false
        );`,
        [this.companyCode, notification.id, r.userId || null, r.recipientAddress || null, r.communicationType]
      );
    }

    return notification;
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    return await query(
      `SELECT n.id, n.notification_type, n.title, n.body, n.created_at, r.status as delivery_status
       FROM ep_comms.tb_ep_comms_notify_notification_master n
       JOIN ep_comms.tb_ep_comms_notify_notification_recipient_detail r ON r.notification_id = n.id
       WHERE n.company_code = $1 AND r.user_id = $2::uuid AND n.active = true 
       ORDER BY n.created_at DESC 
       LIMIT 50;`,
      [this.companyCode, userId]
    );
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await execute(
      `UPDATE ep_comms.tb_ep_comms_notify_notification_recipient_detail 
       SET status = 'READ', updated_at = clock_timestamp() 
       WHERE company_code = $1 AND notification_id = $2::uuid AND user_id = $3::uuid;`,
      [this.companyCode, notificationId, userId]
    );
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await execute(
      `UPDATE ep_comms.tb_ep_comms_notify_notification_recipient_detail 
       SET status = 'READ', updated_at = clock_timestamp() 
       WHERE company_code = $1 AND user_id = $2::uuid AND status != 'READ';`,
      [this.companyCode, userId]
    );
  }
}
