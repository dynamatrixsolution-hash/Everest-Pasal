// ==============================================================================
// EVEREST PASAL - LOGISTICS & SHIPMENT REPOSITORY (ep_logistics)
// ==============================================================================

import { query, execute } from '../db.js';

export class LogisticsRepository {
  private companyCode: string;

  constructor(companyCode: string = 'EP_NEPAL') {
    this.companyCode = companyCode;
  }

  async getCarriers(): Promise<any[]> {
    return await query(
      `SELECT * FROM ep_logistics.tb_ep_logistics_carrier_carrier_master 
       WHERE company_code = $1 AND active = true 
       ORDER BY carrier_name ASC;`,
      [this.companyCode]
    );
  }

  async createShipment(data: {
    carrierId: string;
    carrierServiceId?: string;
    packageId: string;
    originHubId?: string;
    destinationHubId?: string;
  }): Promise<any> {
    const trackingNumber = `TRK_${Date.now().toString().slice(-8)}`;
    const rows = await query(
      `INSERT INTO ep_logistics.tb_ep_logistics_shp_shipment_master (
        id, company_code, tracking_number, carrier_id, carrier_service_id,
        current_status, origin_hub_id, destination_hub_id, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2, $3::uuid, $4::uuid, 'CREATED', $5::uuid, $6::uuid, true, false
      ) RETURNING *;`,
      [
        this.companyCode,
        trackingNumber,
        data.carrierId,
        data.carrierServiceId || null,
        data.originHubId || null,
        data.destinationHubId || null,
      ]
    );

    const shipment = rows[0];

    await execute(
      `INSERT INTO ep_logistics.tb_ep_logistics_shp_shipment_package_map (
        id, company_code, shipment_id, package_id, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3::uuid, true, false
      );`,
      [this.companyCode, shipment.id, data.packageId]
    );

    await this.recordTrackingEvent(shipment.id, 'SHIPMENT_CREATED', 'Shipment record created in system');

    return shipment;
  }

  async recordTrackingEvent(shipmentId: string, eventType: string, description: string, location?: string, actorId?: string): Promise<any> {
    const rows = await query(
      `INSERT INTO ep_logistics.tb_ep_logistics_track_tracking_event_txn (
        id, company_code, shipment_id, event_type, event_description,
        location, event_timestamp, created_by, active, publish
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid, $3, $4, $5, clock_timestamp(), $6::uuid, true, false
      ) RETURNING *;`,
      [this.companyCode, shipmentId, eventType, description, location || null, actorId || null]
    );

    await execute(
      `UPDATE ep_logistics.tb_ep_logistics_shp_shipment_master 
       SET current_status = $2, updated_at = clock_timestamp() 
       WHERE id = $1::uuid;`,
      [shipmentId, eventType]
    );

    return rows[0];
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<any | null> {
    const rows = await query(
      `SELECT s.*, c.carrier_name, c.carrier_code
       FROM ep_logistics.tb_ep_logistics_shp_shipment_master s
       JOIN ep_logistics.tb_ep_logistics_carrier_carrier_master c ON c.id = s.carrier_id
       WHERE s.company_code = $1 AND s.tracking_number = $2 AND s.active = true 
       LIMIT 1;`,
      [this.companyCode, trackingNumber]
    );
    if (!rows[0]) return null;

    const events = await query(
      `SELECT * FROM ep_logistics.tb_ep_logistics_track_tracking_event_txn 
       WHERE company_code = $1 AND shipment_id = $2::uuid 
       ORDER BY event_timestamp ASC;`,
      [this.companyCode, rows[0].id]
    );

    return { ...rows[0], trackingEvents: events };
  }

  async getRiders(): Promise<any[]> {
    return await query(
      `SELECT r.*, u.display_name as full_name, u.email, u.mobile_no 
       FROM ep_logistics.tb_ep_logistics_rider_rider_master r
       LEFT JOIN ep_identity.tb_ep_identity_user_user_master u ON u.id = r.user_id
       WHERE r.company_code = $1 AND r.active = true 
       ORDER BY r.created_at ASC;`,
      [this.companyCode]
    );
  }
}
