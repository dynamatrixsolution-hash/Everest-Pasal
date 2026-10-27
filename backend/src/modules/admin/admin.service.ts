// ==============================================================================
// EVEREST PASAL - ADMIN SERVICE
// Direct integration with ep_system, ep_merchant, ep_customer, ep_audit schemas
// ==============================================================================

import { AdminRepository } from '../../repositories/admin.repository.js';
import { execute, query } from '../../db.js';

export class AdminService {
  private adminRepo: AdminRepository;

  constructor(adminRepo?: AdminRepository) {
    this.adminRepo = adminRepo || new AdminRepository('EP_NEPAL');
  }

  public async getPlatformMetrics(): Promise<any> {
    const stats = await this.adminRepo.getPlatformStats();
    const recentEvents = await this.adminRepo.getAuditLogs(10);

    const formattedEvents = recentEvents.map((ev: any) => ({
      id: ev.id,
      eventType: ev.activity_type,
      actorType: ev.module_code,
      actorId: ev.user_id,
      actorName: ev.actor_name || ev.actor_email || 'System Admin',
      createdAt: ev.activity_at,
    }));

    return {
      metrics: {
        totalOrders: Number(stats.totalOrders) || 0,
        totalCustomers: Number(stats.totalCustomers) || 0,
        totalVendors: Number(stats.totalVendors) || 0,
        totalProducts: Number(stats.totalProducts) || 0,
        activeProducts: Number(stats.totalProducts) || 0,
        totalGMV: Number(stats.grossMarketplaceVolume) || 0,
        grossMarketplaceVolume: Number(stats.grossMarketplaceVolume) || 0,
        currency: 'NPR',
      },
      recentEvents: formattedEvents,
      recentAudits: formattedEvents,
      recentOrders: [],
    };
  }

  public async listVendors(queryParam: any = {}): Promise<any> {
    const vendors = await this.adminRepo.getAllVendors();
    return {
      vendors: vendors.map((v: any) => ({
        id: v.id,
        name: v.merchant_name,
        legalName: v.legal_name,
        tradeName: v.merchant_name,
        status: v.onboarding_status || 'PENDING',
        taxIdentifier: v.pan_no || 'PAN-UNASSIGNED',
        createdAt: v.created_at,
        owner: {
          email: v.owner_email,
          fullName: v.owner_name,
        },
      })),
      pagination: {
        total: vendors.length,
        page: 1,
        limit: 50,
      },
    };
  }

  public async updateVendorStatus(id: string, status: string, actorId?: string): Promise<any> {
    if (status === 'APPROVED' || status === 'ACTIVE') {
      await this.adminRepo.approveVendor(id, actorId || 'SYSTEM_ADMIN');
    } else {
      await execute(
        `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
         SET onboarding_status = $1, updated_at = clock_timestamp() 
         WHERE company_code = 'EP_NEPAL' AND id = $2::uuid;`,
        [status, id]
      );
    }
    return { id, status };
  }

  public async listCustomers(queryParam: any = {}): Promise<any> {
    const customers = await this.adminRepo.getAllCustomers();
    return {
      customers: customers.map((c: any) => ({
        id: c.id,
        email: c.email,
        phone: c.mobile_no,
        fullName: c.display_name || c.first_name,
        status: c.active ? 'ACTIVE' : 'INACTIVE',
        lastLoginAt: c.last_login_at,
        createdAt: c.created_at,
      })),
      pagination: {
        total: customers.length,
        page: 1,
        limit: 50,
      },
    };
  }

  public async listAuditEvents(queryParam: any = {}): Promise<any> {
    const logs = await this.adminRepo.getAuditLogs(100);
    return {
      events: logs.map((ev: any) => ({
        id: ev.id,
        eventType: ev.activity_type,
        actorType: ev.module_code,
        actorId: ev.user_id,
        actorName: ev.actor_name || ev.actor_email || 'System',
        createdAt: ev.activity_at,
      })),
      pagination: {
        total: logs.length,
        page: 1,
        limit: 100,
      },
    };
  }
}

export const adminService = new AdminService();
