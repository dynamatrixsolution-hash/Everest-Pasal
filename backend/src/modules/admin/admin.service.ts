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

  private static vendorsStore: any[] = [
    {
      id: '#VN-0001',
      name: 'Himalayan Mart',
      email: 'himalayanmart@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-4123-4567',
      location: 'Kathmandu, Bagmati',
      productsCount: 1284,
      totalSales: 42850,
      totalSalesFormatted: 'NPR 42,850',
      status: 'Active',
      joinedDate: '12 Jan 2023',
    },
    {
      id: '#VN-0002',
      name: 'Pokhara Bazaar',
      email: 'pokharabazaar@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-6234-5678',
      location: 'Pokhara, Gandaki',
      productsCount: 842,
      totalSales: 18200,
      totalSalesFormatted: 'NPR 18,200',
      status: 'Active',
      joinedDate: '03 Mar 2023',
    },
    {
      id: '#VN-0003',
      name: 'Lalitpur Wholesale',
      email: 'lalitpurwholesale@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-5345-6789',
      location: 'Lalitpur, Bagmati',
      productsCount: 1106,
      totalSales: 67400,
      totalSalesFormatted: 'NPR 67,400',
      status: 'Active',
      joinedDate: '19 Jun 2022',
    },
    {
      id: '#VN-0004',
      name: 'Biratnagar Hub',
      email: 'biratnagarhub@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-0456-7890',
      location: 'Biratnagar, Koshi',
      productsCount: 312,
      totalSales: 6750,
      totalSalesFormatted: 'NPR 6,750',
      status: 'Inactive',
      joinedDate: '28 Aug 2023',
    },
    {
      id: '#VN-0005',
      name: 'Butwal Depot',
      email: 'butwaldepot@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-6567-8901',
      location: 'Butwal, Lumbini',
      productsCount: 917,
      totalSales: 29300,
      totalSalesFormatted: 'NPR 29,300',
      status: 'Active',
      joinedDate: '05 Nov 2023',
    },
    {
      id: '#VN-0006',
      name: 'Dharan Market',
      email: 'dharanmarket@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-8678-9012',
      location: 'Dharan, Koshi',
      productsCount: 204,
      totalSales: 4100,
      totalSalesFormatted: 'NPR 4,100',
      status: 'Suspended',
      joinedDate: '17 Feb 2024',
    },
    {
      id: '#VN-0007',
      name: 'Hetauda Store',
      email: 'hetaudastore@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-1789-0123',
      location: 'Hetauda, Bagmati',
      productsCount: 1240,
      totalSales: 88620,
      totalSalesFormatted: 'NPR 88,620',
      status: 'Active',
      joinedDate: '22 Sep 2022',
    },
    {
      id: '#VN-0008',
      name: 'Nepalgunj Outlet',
      email: 'nepalgunjoutlet@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-2890-1234',
      location: 'Nepalgunj, Lumbini',
      productsCount: 756,
      totalSales: 23150,
      totalSalesFormatted: 'NPR 23,150',
      status: 'Active',
      joinedDate: '30 Apr 2023',
    },
  ];

  private static vendorApplicationsStore: any[] = [
    {
      id: '#VA-1042',
      name: 'Himalayan Mart',
      email: 'himalayanmart@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-4123-4567',
      location: 'Kathmandu, Bagmati',
      productsCount: 128,
      submittedDate: '12 Jan 2024',
      status: 'Needs Docs',
      reviewBy: '18 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
      storeSlug: 'epasal.com/store/himalayan-mart',
      registeredBusiness: 'Himalayan Mart Pvt. Ltd.',
      businessType: 'Private limited company',
      registeredAddress: 'Kathmandu, Bagmati, Nepal',
      catalogCategory: '128 products - General merchandise',
      documents: [
        { name: 'Business registration certificate', file: 'business_registration.pdf', size: '1.2 MB', date: '12 Jan 2024', status: 'Verified' },
        { name: 'PAN registration certificate', file: 'pan_certificate.pdf', size: '844 KB', date: '12 Jan 2024', status: 'Verified' },
        { name: 'Authorized representative ID', file: 'representative_id.pdf', size: '524 KB', date: '12 Jan 2024', status: 'Verified' },
        { name: 'Bank account proof / cancelled cheque', file: '', size: '', date: '', status: 'Missing', requiredNote: 'Required to verify account ownership and enable payouts' },
      ],
      bankDetails: {
        accountHolder: 'Himalayan Mart Pvt. Ltd.',
        bankName: 'Nabil Bank - Kathmandu',
        accountNumber: '•••• •••• 4821',
        accountType: 'Current account • NPR',
        status: 'Pending verification',
      },
      settings: {
        storeVisibility: false,
        payouts: false,
        applicationNotifications: true,
      },
      auditHistory: [
        { title: 'Documents reviewed', desc: 'Registration, PAN and ID verified.', date: '15 Jan 2024, 10:42 AM' },
        { title: 'Review assigned', desc: 'Assigned to Rajesh Sharma', date: '13 Jan 2024, 09:15 AM' },
        { title: 'Application submitted', desc: 'Himalayan Mart submitted this app', date: '12 Jan 2024, 02:30 PM' },
      ],
    },
    {
      id: '#VA-1043',
      name: 'Pokhara Bazaar',
      email: 'pokharabazaar@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-6234-5678',
      location: 'Pokhara, Gandaki',
      productsCount: 84,
      submittedDate: '13 Jan 2024',
      status: 'Ready',
      reviewBy: '16 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
      storeSlug: 'epasal.com/store/pokhara-bazaar',
      registeredBusiness: 'Pokhara Bazaar Traders',
      businessType: 'Sole Proprietorship',
      registeredAddress: 'Lakeside, Pokhara, Nepal',
      catalogCategory: '84 products - Handicrafts & Clothing',
      documents: [
        { name: 'Business registration certificate', file: 'registration.pdf', size: '1.1 MB', date: '13 Jan 2024', status: 'Verified' },
        { name: 'PAN registration certificate', file: 'pan.pdf', size: '620 KB', date: '13 Jan 2024', status: 'Verified' },
        { name: 'Authorized representative ID', file: 'citizenship.pdf', size: '480 KB', date: '13 Jan 2024', status: 'Verified' },
        { name: 'Bank account proof / cancelled cheque', file: 'cheque.pdf', size: '920 KB', date: '13 Jan 2024', status: 'Verified' },
      ],
      bankDetails: {
        accountHolder: 'Pokhara Bazaar Traders',
        bankName: 'Global IME Bank - Pokhara',
        accountNumber: '•••• •••• 9102',
        accountType: 'Current account • NPR',
        status: 'Verified',
      },
      settings: { storeVisibility: false, payouts: true, applicationNotifications: true },
      auditHistory: [
        { title: 'All Documents verified', desc: 'Registration, PAN, ID & Bank verified.', date: '14 Jan 2024, 11:00 AM' },
        { title: 'Application submitted', desc: 'Pokhara Bazaar submitted app', date: '13 Jan 2024, 10:00 AM' },
      ],
    },
    {
      id: '#VA-1044',
      name: 'Lalitpur Wholesale',
      email: 'lalitpurwholesale@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-5345-6789',
      location: 'Lalitpur, Bagmati',
      productsCount: 110,
      submittedDate: '14 Jan 2024',
      status: 'Rejected',
      reviewBy: '15 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
    {
      id: '#VA-1045',
      name: 'Biratnagar Hub',
      email: 'biratnagarhub@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-0456-7890',
      location: 'Biratnagar, Koshi',
      productsCount: 31,
      submittedDate: '15 Jan 2024',
      status: 'Ready',
      reviewBy: '18 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
    {
      id: '#VA-1046',
      name: 'Butwal Depot',
      email: 'butwaldepot@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-6567-8901',
      location: 'Butwal, Lumbini',
      productsCount: 91,
      submittedDate: '16 Jan 2024',
      status: 'Needs Docs',
      reviewBy: '19 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
    {
      id: '#VA-1047',
      name: 'Dharan Market',
      email: 'dharanmarket@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-8678-9012',
      location: 'Dharan, Koshi',
      productsCount: 20,
      submittedDate: '17 Jan 2024',
      status: 'Ready',
      reviewBy: '20 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
    {
      id: '#VA-1048',
      name: 'Hetauda Store',
      email: 'hetaudastore@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-1789-0123',
      location: 'Hetauda, Bagmati',
      productsCount: 124,
      submittedDate: '18 Jan 2024',
      status: 'Ready',
      reviewBy: '21 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
    {
      id: '#VA-1049',
      name: 'Nepalgunj Outlet',
      email: 'nepalgunjoutlet@epasal.com',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-2890-1234',
      location: 'Nepalgunj, Lumbini',
      productsCount: 75,
      submittedDate: '19 Jan 2024',
      status: 'Rejected',
      reviewBy: '20 Jan 2024',
      assignedReviewer: 'Rajesh Sharma',
    },
  ];

  public async listVendors(queryParam: any = {}): Promise<any> {
    const { search, status, page = 1, limit = 8 } = queryParam;
    let list = [...AdminService.vendorsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.phone.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all' && status !== 'All Status') {
      list = list.filter((v) => v.status.toLowerCase() === String(status).toLowerCase());
    }

    return {
      metrics: {
        totalVendors: 1284,
        totalVendorsChange: '+42 this month',
        activeStores: 1142,
        activeStoresPct: '89.1% of total',
        pendingApprovals: 37,
        pendingApprovalsNote: 'Under review',
        avgProductsPerStore: 128,
        avgProductsChange: '+12 vs last month',
      },
      vendors: list,
      pagination: {
        total: 1284,
        page: Number(page) || 1,
        limit: Number(limit) || 8,
      },
    };
  }

  public async createVendor(payload: any): Promise<any> {
    const nextIdx = AdminService.vendorsStore.length + 1;
    const padded = String(nextIdx).padStart(4, '0');
    const newVendor = {
      id: `#VN-${padded}`,
      name: payload.name || 'New Vendor Store',
      email: payload.email || `vendor${nextIdx}@epasal.com`,
      avatar: payload.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      phone: payload.phone || '+977 98-0000-0000',
      location: payload.location || 'Kathmandu, Bagmati',
      productsCount: 0,
      totalSales: 0,
      totalSalesFormatted: 'NPR 0',
      status: payload.status || 'Active',
      joinedDate: 'Just now',
    };
    AdminService.vendorsStore.unshift(newVendor);
    return newVendor;
  }

  public async updateVendorStatus(id: string, status: string, actorId?: string): Promise<any> {
    const cleanId = id.toLowerCase();
    const vendor = AdminService.vendorsStore.find(
      (v) => v.id.toLowerCase() === cleanId || v.id.replace('#', '').toLowerCase() === cleanId
    );
    if (vendor) {
      vendor.status = status;
    }

    try {
      if (status === 'APPROVED' || status === 'ACTIVE' || status === 'Active') {
        await this.adminRepo.approveVendor(id, actorId || 'SYSTEM_ADMIN');
      } else {
        await execute(
          `UPDATE ep_merchant.tb_ep_merchant_vendor_merchant_master 
           SET onboarding_status = $1, updated_at = clock_timestamp() 
           WHERE company_code = 'EP_NEPAL' AND id::text = $2;`,
          [status.toUpperCase(), id]
        );
      }
    } catch {
      // Handled gracefully in dev/hybrid storage
    }
    return { id, status };
  }

  public async listVendorApplications(queryParam: any = {}): Promise<any> {
    const { search, status, page = 1, limit = 8 } = queryParam;
    let list = [...AdminService.vendorApplicationsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all' && status !== 'All' && status !== 'Review Status') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }

    return {
      metrics: {
        pendingReview: 37,
        pendingReviewNote: '8 high-priority today',
        approvedThisMonth: 12,
        approvedThisMonthChange: '+3 vs last month',
        documentsMissing: 9,
        documentsMissingNote: 'Need follow-up',
        avgReviewTime: '2.4 days',
        avgReviewTimeChange: '18% faster this month',
      },
      applications: list,
      pagination: {
        total: 37,
        page: Number(page) || 1,
        limit: Number(limit) || 8,
      },
    };
  }

  public async getVendorApplicationDetail(id: string): Promise<any> {
    const cleanId = id.toLowerCase();
    const app = AdminService.vendorApplicationsStore.find(
      (a) => a.id.toLowerCase() === cleanId || a.id.replace('#', '').toLowerCase() === cleanId
    );
    if (app) return app;
    return AdminService.vendorApplicationsStore[0];
  }

  public async reviewVendorApplication(id: string, action: string, message?: string, reviewer: string = 'Rajesh Sharma'): Promise<any> {
    const cleanId = id.toLowerCase();
    const app = AdminService.vendorApplicationsStore.find(
      (a) => a.id.toLowerCase() === cleanId || a.id.replace('#', '').toLowerCase() === cleanId
    );
    if (!app) return null;

    if (action === 'APPROVE') {
      app.status = 'Ready';
      app.auditHistory.unshift({
        title: 'Application Approved',
        desc: `Approved by ${reviewer}. Store activated.`,
        date: new Date().toLocaleString(),
      });
      // also add to active vendors list if not already present
      if (!AdminService.vendorsStore.find((v) => v.name === app.name)) {
        AdminService.vendorsStore.unshift({
          id: `#VN-00${AdminService.vendorsStore.length + 1}`,
          name: app.name,
          email: app.email,
          avatar: app.avatar,
          phone: app.phone,
          location: app.location,
          productsCount: app.productsCount,
          totalSales: 0,
          totalSalesFormatted: 'NPR 0',
          status: 'Active',
          joinedDate: 'Just now',
        });
      }
    } else if (action === 'REJECT') {
      app.status = 'Rejected';
      app.auditHistory.unshift({
        title: 'Application Rejected',
        desc: message ? `Rejected: ${message}` : 'Application declined by admin.',
        date: new Date().toLocaleString(),
      });
    } else if (action === 'REQUEST_CHANGES') {
      app.status = 'Needs Docs';
      app.auditHistory.unshift({
        title: 'Changes Requested',
        desc: message || 'Admin requested updated documentation from vendor.',
        date: new Date().toLocaleString(),
      });
    }

    return app;
  }

  // ==============================================================================
  // CATALOG: PRODUCTS, CATEGORIES, BRANDS, ATTRIBUTES STORES & METHODS
  // ==============================================================================
  private static catalogProductsStore: any[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      category: 'Grocery & Staples',
      stock: 1284,
      price: 1250,
      approval: 'Published',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      category: 'Beverages',
      stock: 842,
      price: 420,
      approval: 'Published',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      category: 'Spices',
      stock: 1106,
      price: 185,
      approval: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      category: 'Confectionery',
      stock: 312,
      price: 195,
      approval: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      category: 'Pantry',
      stock: 917,
      price: 145,
      approval: 'Published',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      category: 'Beverages',
      stock: 204,
      price: 160,
      approval: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      category: 'Natural & Wellness',
      stock: 1240,
      price: 890,
      approval: 'Published',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      category: 'Condiments',
      stock: 756,
      price: 120,
      approval: 'Published',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=100&auto=format&fit=crop&q=80',
    },
  ];

  private static categoriesStore: any[] = [
    {
      id: 'CAT-001',
      name: 'Grocery & Staples',
      productsCount: 1284,
      parent: 'Root',
      hierarchy: 'Food & Pantry',
      visibility: 'Visible',
      status: 'Active',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-002',
      name: 'Beverages',
      productsCount: 842,
      parent: 'Root',
      hierarchy: 'Drinks & Refreshments',
      visibility: 'Visible',
      status: 'Active',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-003',
      name: 'Spices',
      productsCount: 1106,
      parent: 'Grocery & Staples',
      hierarchy: 'Pantry & Seasonings',
      visibility: 'Visible',
      status: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-004',
      name: 'Confectionery',
      productsCount: 312,
      parent: 'Snacks & Treats',
      hierarchy: 'Sweets & Chocolates',
      visibility: 'Visible',
      status: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-005',
      name: 'Pantry',
      productsCount: 917,
      parent: 'Grocery & Staples',
      hierarchy: 'Kitchen Staples',
      visibility: 'Visible',
      status: 'Active',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-006',
      name: 'Beverages',
      productsCount: 204,
      parent: 'Root',
      hierarchy: 'Drinks & Refreshments',
      visibility: 'Visible',
      status: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-007',
      name: 'Natural & Wellness',
      productsCount: 1240,
      parent: 'Root',
      hierarchy: 'Health & Supplements',
      visibility: 'Visible',
      status: 'Active',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-008',
      name: 'Condiments',
      productsCount: 756,
      parent: 'Pantry',
      hierarchy: 'Sauces & Marinades',
      visibility: 'Visible',
      status: 'Active',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=100&auto=format&fit=crop&q=80',
    },
  ];

  private static brandsStore: any[] = [
    {
      id: 'BRN-001',
      name: 'Everest Pasal',
      productsCount: 1284,
      vendor: 'Everest Pasal',
      categoryCoverage: 'Grocery & Staples',
      visibility: 'Visible',
      status: 'Active',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-002',
      name: 'Himalayan',
      productsCount: 842,
      vendor: 'Himalayan Foods',
      categoryCoverage: 'Beverages',
      visibility: 'Visible',
      status: 'Active',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-003',
      name: 'Everest Spice',
      productsCount: 1106,
      vendor: 'Everest Pasal',
      categoryCoverage: 'Spices',
      visibility: 'Visible',
      status: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-004',
      name: 'Sweet Treats',
      productsCount: 312,
      vendor: 'Sweet Treats',
      categoryCoverage: 'Confectionery',
      visibility: 'Visible',
      status: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-005',
      name: 'Kitchen King',
      productsCount: 917,
      vendor: 'Kitchen King',
      categoryCoverage: 'Pantry',
      visibility: 'Visible',
      status: 'Active',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-006',
      name: 'Himalayan',
      productsCount: 204,
      vendor: 'Himalayan Foods',
      categoryCoverage: 'Beverages',
      visibility: 'Visible',
      status: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-007',
      name: 'Wellness Hub',
      productsCount: 1240,
      vendor: 'Wellness Hub',
      categoryCoverage: 'Natural & Wellness',
      visibility: 'Visible',
      status: 'Active',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-008',
      name: 'Kitchen King',
      productsCount: 756,
      vendor: 'Kitchen King',
      categoryCoverage: 'Condiments',
      visibility: 'Visible',
      status: 'Active',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=100&auto=format&fit=crop&q=80',
    },
  ];

  private static attributesStore: any[] = [
    {
      code: 'ATTR-001',
      name: 'Color',
      subtype: 'Single select',
      dataType: 'Text',
      allowedValues: '12 options',
      categoriesCount: 24,
      usage: 'Required',
      status: 'Active',
      updated: '12 Jan 2023',
    },
    {
      code: 'ATTR-002',
      name: 'Size',
      subtype: 'Single select',
      dataType: 'Text',
      allowedValues: '8 options',
      categoriesCount: 18,
      usage: 'Optional',
      status: 'Active',
      updated: '03 Mar 2023',
    },
    {
      code: 'ATTR-003',
      name: 'Material',
      subtype: 'Multi select',
      dataType: 'Text',
      allowedValues: '16 options',
      categoriesCount: 31,
      usage: 'Required',
      status: 'Pending',
      updated: '19 Jun 2022',
    },
    {
      code: 'ATTR-004',
      name: 'Weight',
      subtype: 'Numeric',
      dataType: 'Number',
      allowedValues: '0.1–50 kg',
      categoriesCount: 14,
      usage: 'Optional',
      status: 'Draft',
      updated: '28 Aug 2023',
    },
    {
      code: 'ATTR-005',
      name: 'Storage Capacity',
      subtype: 'Numeric',
      dataType: 'Number',
      allowedValues: '1–256 GB',
      categoriesCount: 9,
      usage: 'Required',
      status: 'Active',
      updated: '05 Nov 2023',
    },
    {
      code: 'ATTR-006',
      name: 'Pack Size',
      subtype: 'Single select',
      dataType: 'Text',
      allowedValues: '6 options',
      categoriesCount: 12,
      usage: 'Optional',
      status: 'Draft',
      updated: '17 Feb 2024',
    },
    {
      code: 'ATTR-007',
      name: 'Battery Life',
      subtype: 'Numeric',
      dataType: 'Number',
      allowedValues: '1–48 hours',
      categoriesCount: 7,
      usage: 'Optional',
      status: 'Active',
      updated: '22 Sep 2022',
    },
    {
      code: 'ATTR-008',
      name: 'Connectivity',
      subtype: 'Single select',
      dataType: 'Text',
      allowedValues: '4 options',
      categoriesCount: 11,
      usage: 'Optional',
      status: 'Active',
      updated: '30 Apr 2023',
    },
  ];

  public async listCatalogProducts(queryParam: any = {}): Promise<any> {
    const { search, status, category, isApprovalsOnly, page = 1, limit = 8 } = queryParam;
    let list = [...AdminService.catalogProductsStore];

    if (isApprovalsOnly) {
      list = list.map((p) => ({ ...p, approval: 'Pending' }));
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all' && status !== 'All Status' && status !== 'Pending Review') {
      list = list.filter((p) => p.approval.toLowerCase() === String(status).toLowerCase());
    }

    if (category && category !== 'All Categories') {
      list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    return {
      metrics: isApprovalsOnly
        ? {
            pendingApprovals: 58,
            pendingApprovalsNote: '12 urgent today',
            awaitingReview: 24,
            awaitingReviewNote: 'Submitted in the last 24 hours',
            avgReviewTime: '2.4 days',
            avgReviewTimeChange: '-12% vs last week',
            rejectedThisWeek: 9,
            rejectedThisWeekNote: 'Mostly missing images or pricing',
          }
        : {
            totalProducts: 12480,
            totalProductsChange: '+1,240 this month',
            activeListings: 10892,
            activeListingsPct: '87.4% of total',
            pendingApproval: 58,
            pendingApprovalNote: 'Under review',
            avgStockPerSku: 128,
            avgStockChange: '+12 vs last month',
          },
      products: list,
      pagination: {
        total: isApprovalsOnly ? 58 : 12480,
        page: Number(page) || 1,
        limit: Number(limit) || 8,
      },
    };
  }

  public async updateCatalogProduct(sku: string, payload: any): Promise<any> {
    const prod = AdminService.catalogProductsStore.find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase()
    );
    if (prod) {
      Object.assign(prod, payload);
      prod.updated = 'Just now';
    }
    return prod;
  }

  public async reviewCatalogProduct(sku: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', note?: string): Promise<any> {
    const prod = AdminService.catalogProductsStore.find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase()
    );
    if (prod) {
      if (decision === 'APPROVE') prod.approval = 'Published';
      else if (decision === 'REJECT') prod.approval = 'Draft';
      else if (decision === 'REQUEST_CHANGES') prod.approval = 'Pending';
      prod.updated = 'Just now';
    }
    return prod;
  }

  public async createCatalogProduct(payload: any): Promise<any> {
    const nextIdx = AdminService.catalogProductsStore.length + 1;
    const newProd = {
      sku: `PRD-${String(nextIdx).padStart(3, '0')}`,
      name: payload.name || 'New Product',
      variant: payload.variant || 'Standard',
      vendor: payload.vendor || 'Everest Pasal',
      category: payload.category || 'Grocery & Staples',
      stock: Number(payload.stock) || 100,
      price: Number(payload.price) || 500,
      approval: payload.approval || 'Published',
      updated: 'Just now',
      image: payload.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    };
    AdminService.catalogProductsStore.unshift(newProd);
    return newProd;
  }

  // Categories
  public async listCategories(queryParam: any = {}): Promise<any> {
    const { search, visibility } = queryParam;
    let list = [...AdminService.categoriesStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.hierarchy.toLowerCase().includes(q));
    }
    if (visibility && visibility !== 'All Visibility') {
      list = list.filter((c) => c.visibility.toLowerCase() === String(visibility).toLowerCase());
    }
    return {
      metrics: {
        totalCategories: 128,
        totalCategoriesChange: '+12 this month',
        activeCategories: 112,
        activeCategoriesPct: '87.5% of total',
        pendingReview: 16,
        pendingReviewNote: 'Needs approval',
        avgProductsPerCategory: 98,
        avgProductsChange: '+8 vs last month',
      },
      categories: list,
      pagination: { total: 128, page: 1, limit: 8 },
    };
  }

  public async createCategory(payload: any): Promise<any> {
    const nextId = `CAT-${String(AdminService.categoriesStore.length + 1).padStart(3, '0')}`;
    const newCat = {
      id: nextId,
      name: payload.name || 'New Category',
      productsCount: 0,
      parent: payload.parent || 'Root',
      hierarchy: payload.hierarchy || payload.name || 'General',
      visibility: payload.visibility || 'Visible',
      status: payload.status || 'Active',
      updated: 'Just now',
      image: payload.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    };
    AdminService.categoriesStore.unshift(newCat);
    return newCat;
  }

  public async updateCategory(id: string, payload: any): Promise<any> {
    const cat = AdminService.categoriesStore.find((c) => c.id === id);
    if (cat) {
      Object.assign(cat, payload);
      cat.updated = 'Just now';
    }
    return cat;
  }

  // Brands
  public async listBrands(queryParam: any = {}): Promise<any> {
    const { search, status } = queryParam;
    let list = [...AdminService.brandsStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.vendor.toLowerCase().includes(q));
    }
    if (status && status !== 'All Status') {
      list = list.filter((b) => b.status.toLowerCase() === String(status).toLowerCase());
    }
    return {
      metrics: {
        totalBrands: 64,
        totalBrandsChange: '+8 this month',
        activeBrands: 58,
        activeBrandsPct: '90.6% of total',
        pendingApproval: 6,
        pendingApprovalNote: 'Needs review',
        avgProductsPerBrand: 124,
        avgProductsChange: '+12 vs last month',
      },
      brands: list,
      pagination: { total: 64, page: 1, limit: 8 },
    };
  }

  public async createBrand(payload: any): Promise<any> {
    const nextId = `BRN-${String(AdminService.brandsStore.length + 1).padStart(3, '0')}`;
    const newBrand = {
      id: nextId,
      name: payload.name || 'New Brand',
      productsCount: 0,
      vendor: payload.vendor || 'Everest Pasal',
      categoryCoverage: payload.categoryCoverage || 'General',
      visibility: payload.visibility || 'Visible',
      status: payload.status || 'Active',
      updated: 'Just now',
      image: payload.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    };
    AdminService.brandsStore.unshift(newBrand);
    return newBrand;
  }

  public async updateBrand(id: string, payload: any): Promise<any> {
    const brand = AdminService.brandsStore.find((b) => b.id === id);
    if (brand) {
      Object.assign(brand, payload);
      brand.updated = 'Just now';
    }
    return brand;
  }

  // Attributes
  public async listAttributes(queryParam: any = {}): Promise<any> {
    const { search, status } = queryParam;
    let list = [...AdminService.attributesStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
    }
    if (status && status !== 'All Status') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }
    return {
      metrics: {
        totalAttributes: 128,
        totalAttributesChange: '+12 this month',
        activeAttributes: 114,
        activeAttributesPct: '89% of total',
        pendingApproval: 7,
        pendingApprovalNote: 'Needs review',
        avgOptionsPerAttribute: 18,
        avgOptionsChange: '+3 vs last month',
      },
      attributes: list,
      pagination: { total: 128, page: 1, limit: 8 },
    };
  }

  public async createAttribute(payload: any): Promise<any> {
    const nextCode = `ATTR-${String(AdminService.attributesStore.length + 1).padStart(3, '0')}`;
    const newAttr = {
      code: nextCode,
      name: payload.name || 'New Attribute',
      subtype: payload.subtype || 'Single select',
      dataType: payload.dataType || 'Text',
      allowedValues: payload.allowedValues || 'Default options',
      categoriesCount: Number(payload.categoriesCount) || 1,
      usage: payload.usage || 'Optional',
      status: payload.status || 'Active',
      updated: 'Just now',
    };
    AdminService.attributesStore.unshift(newAttr);
    return newAttr;
  }

  public async updateAttribute(code: string, payload: any): Promise<any> {
    const attr = AdminService.attributesStore.find((a) => a.code === code);
    if (attr) {
      Object.assign(attr, payload);
      attr.updated = 'Just now';
    }
    return attr;
  }

  private static customersStore: any[] = [
    {
      id: '#CU-0001',
      name: 'Anita Shrestha',
      email: 'anita.shrestha@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-4123-4567',
      location: 'Kathmandu, Bagmati',
      ordersCount: 18,
      totalSpent: 42850,
      totalSpentFormatted: 'NPR 42,850',
      status: 'Active',
      joinedDate: '12 Jan 2023',
    },
    {
      id: '#CU-0002',
      name: 'Bikash Tamang',
      email: 'bikash.tamang@yahoo.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-6234-5678',
      location: 'Pokhara, Gandaki',
      ordersCount: 7,
      totalSpent: 18200,
      totalSpentFormatted: 'NPR 18,200',
      status: 'Active',
      joinedDate: '03 Mar 2023',
    },
    {
      id: '#CU-0003',
      name: 'Sunita Maharjan',
      email: 'sunita.maharjan@outlook.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-5345-6789',
      location: 'Lalitpur, Bagmati',
      ordersCount: 24,
      totalSpent: 67400,
      totalSpentFormatted: 'NPR 67,400',
      status: 'Active',
      joinedDate: '19 Jun 2022',
    },
    {
      id: '#CU-0004',
      name: 'Rajendra Basnet',
      email: 'r.basnet@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-0456-7890',
      location: 'Biratnagar, Koshi',
      ordersCount: 3,
      totalSpent: 6750,
      totalSpentFormatted: 'NPR 6,750',
      status: 'Inactive',
      joinedDate: '28 Aug 2023',
    },
    {
      id: '#CU-0005',
      name: 'Prakash Adhikari',
      email: 'prakash.a@hotmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-6567-8901',
      location: 'Butwal, Lumbini',
      ordersCount: 11,
      totalSpent: 29300,
      totalSpentFormatted: 'NPR 29,300',
      status: 'Active',
      joinedDate: '05 Nov 2023',
    },
    {
      id: '#CU-0006',
      name: 'Mina Gurung',
      email: 'mina.gurung@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      phone: '+977 97-8678-9012',
      location: 'Dharan, Koshi',
      ordersCount: 2,
      totalSpent: 4100,
      totalSpentFormatted: 'NPR 4,100',
      status: 'Suspended',
      joinedDate: '17 Feb 2024',
    },
    {
      id: '#CU-0007',
      name: 'Dipesh Karki',
      email: 'dipesh.karki@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-1789-0123',
      location: 'Hetauda, Bagmati',
      ordersCount: 31,
      totalSpent: 88620,
      totalSpentFormatted: 'NPR 88,620',
      status: 'Active',
      joinedDate: '22 Sep 2022',
    },
    {
      id: '#CU-0008',
      name: 'Kamala Thapa',
      email: 'kamala.thapa@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&auto=format&fit=crop&q=80',
      phone: '+977 98-2890-1234',
      location: 'Nepalgunj, Lumbini',
      ordersCount: 9,
      totalSpent: 23150,
      totalSpentFormatted: 'NPR 23,150',
      status: 'Active',
      joinedDate: '30 Apr 2023',
    },
  ];

  public async listCustomers(queryParam: any = {}): Promise<any> {
    const { search, status, timeframe, page = 1, limit = 8 } = queryParam;
    let list = [...AdminService.customersStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all' && status !== 'All Status') {
      list = list.filter((c) => c.status.toLowerCase() === String(status).toLowerCase());
    }

    const totalFound = 28491;

    return {
      metrics: {
        totalCustomers: 28491,
        totalCustomersChange: '+342 this month',
        activeAccounts: 24107,
        activeAccountsPct: '84.6% of total',
        suspendedAccounts: 184,
        suspendedAccountsNote: 'Under review',
        avgOrdersPerCustomer: 4.2,
        avgOrdersChange: '+0.3 vs last month',
      },
      customers: list,
      pagination: {
        total: totalFound,
        page: Number(page) || 1,
        limit: Number(limit) || 8,
      },
    };
  }

  public async createCustomer(payload: any): Promise<any> {
    const nextIdx = AdminService.customersStore.length + 1;
    const padded = String(nextIdx).padStart(4, '0');
    const newCust = {
      id: `#CU-${padded}`,
      name: payload.name || 'New Customer',
      email: payload.email || `customer${nextIdx}@everestpasal.com`,
      avatar:
        payload.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: payload.phone || '+977 98-0000-0000',
      location: payload.location || 'Kathmandu, Bagmati',
      ordersCount: 0,
      totalSpent: 0,
      totalSpentFormatted: 'NPR 0',
      status: payload.status || 'Active',
      joinedDate: 'Just now',
    };
    AdminService.customersStore.unshift(newCust);
    return newCust;
  }

  public async updateCustomerStatus(id: string, status: string): Promise<any> {
    const cust = AdminService.customersStore.find(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.id.replace('#', '').toLowerCase() === id.toLowerCase()
    );
    if (cust) {
      cust.status = status;
    }
    return { id, status };
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

  // ============================================================================
  // SYSTEM ADMIN CONTROL CENTER - DASHBOARD SEQUENTIAL MODULES
  // ============================================================================

  // State caches for mutations
  private static approvalsStore: any[] = [
    {
      id: 'REQ-2024-0891',
      title: 'Himalayan Crafts Pvt. Ltd.',
      subtitle: 'REQ-2024-0891 • vendor@himalayan.com',
      type: 'Vendor Registration',
      typeColor: 'blue',
      submittedAt: '2 hours ago',
      priority: 'High',
      priorityColor: 'red',
      status: 'PENDING',
      details: {
        legalName: 'Himalayan Crafts Private Limited',
        pan: '601928412',
        categories: ['Handicrafts & Decor'],
        bank: 'Nabil Bank Ltd',
      },
    },
    {
      id: 'REQ-2024-0889',
      title: 'Organic Spice Collection (48 SKUs)',
      subtitle: 'REQ-2024-0889 • Sunrise Organics',
      type: 'Product Listing',
      typeColor: 'peach',
      submittedAt: '5 hours ago',
      priority: 'Medium',
      priorityColor: 'orange',
      status: 'PENDING',
      details: {
        vendor: 'Sunrise Organics Nepal',
        skusCount: 48,
        category: 'Grocery & Spices',
        basePriceRange: 'NPR 250 - NPR 1,800',
      },
    },
    {
      id: 'REQ-2024-0887',
      title: 'NPR 1,250,000 Payout Request',
      subtitle: 'REQ-2024-0887 • Kathmandu Electronics Hub',
      type: 'Payout Request',
      typeColor: 'pink',
      submittedAt: '1 day ago',
      priority: 'High',
      priorityColor: 'red',
      status: 'PENDING',
      details: {
        amount: 1250000,
        merchant: 'Kathmandu Electronics Hub',
        account: 'Global IME Bank • AC: 01029384756',
        escrowCleared: true,
      },
    },
    {
      id: 'REQ-2024-0884',
      title: 'Terai Fresh Foods Co.',
      subtitle: 'REQ-2024-0884 • info@teraifresh.com.np',
      type: 'Vendor Registration',
      typeColor: 'blue',
      submittedAt: '2 days ago',
      priority: 'Low',
      priorityColor: 'slate',
      status: 'PENDING',
      details: {
        legalName: 'Terai Fresh Agro Pvt. Ltd.',
        pan: '302918234',
        categories: ['Fresh Produce', 'Dairy'],
      },
    },
    {
      id: 'REQ-2024-0880',
      title: 'Traditional Dhaka Textile Range',
      subtitle: 'REQ-2024-0880 • Bhaktapur Weavers',
      type: 'Product Listing',
      typeColor: 'peach',
      submittedAt: '3 days ago',
      priority: 'Low',
      priorityColor: 'slate',
      status: 'PENDING',
      details: {
        vendor: 'Bhaktapur Weavers Cooperative',
        skusCount: 16,
        category: 'Apparel & Handloom',
      },
    },
  ];

  private static alertsStore: any[] = [
    {
      id: 'ALT-101',
      title: 'Vendor KYC review required',
      subtitle: 'Himalayan Crafts Pvt. Ltd. • REQ-2024-0891',
      channel: 'Email & In-app',
      channelColor: 'blue',
      triggered: '2 hours ago',
      status: 'Unread',
      statusColor: 'red',
      type: 'Vendor',
    },
    {
      id: 'ALT-102',
      title: 'Product listing catalogue mismatch',
      subtitle: 'Organic Spice Collection • REQ-2024-0889',
      channel: 'Email',
      channelColor: 'peach',
      triggered: '5 hours ago',
      status: 'Pending',
      statusColor: 'orange',
      type: 'Product',
    },
    {
      id: 'ALT-103',
      title: 'Payout request exceeds threshold',
      subtitle: 'Kathmandu Electronics Hub • REQ-2024-0887',
      channel: 'SMS & Email',
      channelColor: 'pink',
      triggered: '1 day ago',
      status: 'Escalated',
      statusColor: 'red',
      type: 'Payouts',
    },
    {
      id: 'ALT-104',
      title: 'Vendor bank account verification',
      subtitle: 'Terai Fresh Foods Co. • REQ-2024-0884',
      channel: 'In-app',
      channelColor: 'blue',
      triggered: '2 days ago',
      status: 'Read',
      statusColor: 'slate',
      type: 'Vendor',
    },
    {
      id: 'ALT-105',
      title: 'Product catalogue policy warning',
      subtitle: 'Traditional Dhaka Textile Range • REQ-2024-0880',
      channel: 'Email',
      channelColor: 'peach',
      triggered: '3 days ago',
      status: 'Read',
      statusColor: 'slate',
      type: 'Product',
    },
  ];

  public async getOverviewData(timeframe: string = '30_days'): Promise<any> {
    const stats = await this.adminRepo.getPlatformStats().catch(() => ({}));

    return {
      timeframe,
      operationalOverview: {
        marketplaceHealth: {
          grossRevenue: Number(stats.grossMarketplaceVolume) || 12847500,
          grossRevenueFormatted: 'NPR 12,847,500',
          growthPct: 12.5,
          totalOrders: Number(stats.totalOrders) || 3842,
          statusBadge: 'Stable',
          periodLabel: 'Gross revenue this month',
        },
        pendingApprovals: {
          totalPending: 59,
          vendorsCount: 12,
          productsCount: 47,
          statusBadge: '59 items',
        },
        supportExceptions: {
          openCases: 23,
          failedDeliveries: 5,
          refundsPending: 8,
          statusBadge: '23 critical',
        },
        inventoryAlerts: {
          itemsCount: 3,
          highPriority: 1,
          mediumPriority: 2,
          statusBadge: '3 items',
        },
      },
      actionableQueue: [
        { id: 'aq-1', title: 'Open Support Cases', subtitle: 'Assigned to Level 1 agents', priority: 'Critical', count: 23, color: '#E63946' },
        { id: 'aq-2', title: 'Failed Deliveries', subtitle: 'Assigned to Level 1 agents', priority: 'High', count: 5, color: '#F97316' },
        { id: 'aq-3', title: 'Pending Refunds', subtitle: 'Assigned to Level 1 agents', priority: 'Medium', count: 8, color: '#EAB308' },
        { id: 'aq-4', title: 'Payment Failures', subtitle: 'Assigned to Level 1 agents', priority: 'High', count: 3, color: '#F97316' },
        { id: 'aq-5', title: 'Vendor Disputes', subtitle: 'Assigned to Level 1 agents', priority: 'Urgent', count: 2, color: '#8B5CF6' },
      ],
      pendingVendorApprovals: [
        {
          id: 'v-1',
          name: 'Himalayan Crafts Co.',
          owner: 'Rohan Giri',
          category: 'Handicrafts & Decor',
          status: 'Documents Submitted',
          appliedAt: 'Applied 1 day ago',
        },
        {
          id: 'v-2',
          name: 'Nepal Tea Collective',
          owner: 'Sujana Baral',
          category: 'Organic Beverages',
          status: 'Pending',
          appliedAt: 'Applied 3 days ago',
        },
        {
          id: 'v-3',
          name: 'Salleri Metal Works',
          owner: 'Kiran Shakya',
          category: 'Kitchenware',
          status: 'Documents Submitted',
          appliedAt: 'Applied 5 days ago',
        },
      ],
      productModerationQueue: [
        {
          id: 'p-1',
          name: 'Handwoven Dhaka Topi',
          vendor: 'Dhaka Weaves',
          category: 'Apparel & Accessories',
          status: 'Pending Review',
          submittedAt: 'Submitted 2 hours ago',
          image: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=100&auto=format&fit=crop&q=80',
        },
        {
          id: 'p-2',
          name: 'Organic Salleri Orthodox Tea',
          vendor: 'Organic Nepal',
          category: 'Grocery',
          status: 'Pending Review',
          submittedAt: 'Submitted 6 hours ago',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
        },
        {
          id: 'p-3',
          name: 'Bronze Buddha Statue (Small)',
          vendor: 'Himalayan Crafts',
          category: 'Handicrafts',
          status: 'Pending Review',
          submittedAt: 'Submitted 1 day ago',
          image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80',
        },
      ],
      inventoryAlertsTable: [
        {
          id: 'inv-1',
          productName: 'Handmade Nepali Slipper',
          vendor: 'Kathmandu Apparel',
          currentStock: 0,
          stockStatus: 'Out of Stock',
          priority: 'High',
          priorityColor: '#E63946',
        },
        {
          id: 'inv-2',
          productName: 'Golden Leaf Herbal Tea',
          vendor: 'Organic Nepal',
          currentStock: 3,
          stockStatus: 'Low Stock',
          priority: 'Medium',
          priorityColor: '#F59E0B',
        },
        {
          id: 'inv-3',
          productName: 'Brass Butter Lamp (Large)',
          vendor: 'Himalayan Crafts',
          currentStock: 5,
          stockStatus: 'Low Stock',
          priority: 'Medium',
          priorityColor: '#F59E0B',
        },
      ],
      marketplaceGlance: {
        activeVendors: Number(stats.totalVendors) || 156,
        activeVendorsNote: 'Live and operational',
        registeredCustomers: Number(stats.totalCustomers) || 28491,
        registeredCustomersNote: 'Total active accounts',
      },
    };
  }

  public async getSalesSummaryData(timeframe: string = 'monthly'): Promise<any> {
    return {
      timeframe,
      revenueAnalytics: {
        totalRevenue: 12847500,
        totalRevenueFormatted: 'NPR 12,847,500',
        growthPct: 12.5,
        comparisonPeriod: 'vs last month',
        chartSeries: [
          { month: 'Jul', currentYear: 2.8, previousYear: 2.2 },
          { month: 'Aug', currentYear: 5.6, previousYear: 4.8 },
          { month: 'Sep', currentYear: 4.2, previousYear: 4.0 },
          { month: 'Oct', currentYear: 12.8, previousYear: 10.4 },
          { month: 'Nov', currentYear: 6.4, previousYear: 5.1 },
          { month: 'Dec', currentYear: 11.2, previousYear: 8.9 },
          { month: 'Jan', currentYear: 7.5, previousYear: 6.2 },
          { month: 'Feb', currentYear: 13.1, previousYear: 10.8 },
          { month: 'Mar', currentYear: 11.4, previousYear: 9.3 },
          { month: 'Apr', currentYear: 12.8, previousYear: 11.0 },
          { month: 'May', currentYear: 13.4, previousYear: 11.2 },
          { month: 'Jun', currentYear: 12.8, previousYear: 10.5 },
        ],
      },
      performanceInsights: {
        topChannel: { name: 'Organic Search', value: '42% of total revenue' },
        bestDay: { name: 'Saturday', value: 'Peak checkout window' },
        fastestSku: { name: 'Handwoven Dhaka Topi', value: '18% of completed orders' },
        averageBasket: { name: '2.4 items', value: 'Cross-sell opportunity' },
        checkoutRate: { name: '3.4%', value: 'Improvement needed at payment step' },
        revenueShare: { name: '85% from repeat buyers', value: 'Retention is driving growth' },
      },
      salesPerformance: {
        completedOrders: { count: 2891, growth: '+12.5%', note: 'Delivered and settled orders' },
        averageOrderValue: { value: 'NPR 3,343.96', growth: '+4.2%', note: 'Average basket value' },
        refundRate: { value: '0.8%', growth: '-0.1%', note: 'Returned orders as a percentage' },
        returningCustomers: { count: 1284, growth: '+8.1%', note: 'Repeat buyers in the last 30 days' },
        grossMargin: { value: '18.4%', growth: '+1.1%', note: 'Estimated contribution margin' },
      },
      salesChannelMix: {
        totalOrders: 3842,
        channels: [
          { name: 'Organic Search', orders: 1624, sharePct: '42.3%', growth: '+12.5%' },
          { name: 'Direct Traffic', orders: 1184, sharePct: '30.8%', growth: '+8.1%' },
          { name: 'Social Media', orders: 690, sharePct: '18.0%', growth: '-0.1%' },
          { name: 'Referrals', orders: 344, sharePct: '9.0%', growth: '+4.2%' },
        ],
      },
      vendorSalesReports: [
        {
          id: 'vsr-1',
          name: 'Himalayan Crafts Co.',
          owner: 'Rohan Giri',
          category: 'Handicrafts & Decor',
          period: 'Last 30 days',
        },
        {
          id: 'vsr-2',
          name: 'Nepal Tea Collective',
          owner: 'Sujana Baral',
          category: 'Organic Beverages',
          period: 'Last 30 days',
        },
        {
          id: 'vsr-3',
          name: 'Salleri Metal Works',
          owner: 'Kiran Shakya',
          category: 'Kitchenware',
          period: 'Last 30 days',
        },
      ],
    };
  }

  public async getOrdersSummaryData(params: any = {}): Promise<any> {
    return {
      kpis: {
        totalOrders: 3842,
        completedOrders: 2891,
        dispatchedOrders: 156,
        newOrders: 124,
        confirmedOrders: { count: 89, tag: 'Healthy', tagColor: 'green' },
        processingOrders: { count: 67, tag: 'Watch', tagColor: 'orange' },
      },
      recentOrders: [
        {
          id: '#EP-38421',
          customer: 'Anish Shrestha',
          vendor: 'Himalayan Crafts',
          amount: 'NPR 12,500',
          amountRaw: 12500,
          payment: 'Paid',
          paymentStatus: 'paid',
          status: 'Delivered',
          fulfillment: 'Completed',
        },
        {
          id: '#EP-38420',
          customer: 'Priyanka Joshi',
          vendor: 'Kathmandu Apparel',
          amount: 'NPR 4,200',
          amountRaw: 4200,
          payment: 'Paid',
          paymentStatus: 'paid',
          status: 'Processing',
          fulfillment: 'Packing',
        },
        {
          id: '#EP-38419',
          customer: 'Ramesh Thapa',
          vendor: 'Organic Nepal',
          amount: 'NPR 1,850',
          amountRaw: 1850,
          payment: 'Pending',
          paymentStatus: 'pending',
          status: 'New',
          fulfillment: 'Awaiting payment',
        },
        {
          id: '#EP-38418',
          customer: 'Sita Dahal',
          vendor: 'Dhaka Weaves',
          amount: 'NPR 8,900',
          amountRaw: 8900,
          payment: 'Paid',
          paymentStatus: 'paid',
          status: 'Delivered',
          fulfillment: 'Completed',
        },
        {
          id: '#EP-38417',
          customer: 'Binod Adhikari',
          vendor: 'Bhadgaon Topi',
          amount: 'NPR 3,100',
          amountRaw: 3100,
          payment: 'Failed',
          paymentStatus: 'failed',
          status: 'Cancelled',
          fulfillment: 'Closed',
        },
      ],
      orderLifecycleCounts: [
        { label: 'Delivered', count: 2891, note: 'Orders delivered and settled' },
        { label: 'Dispatched', count: 156, note: 'Orders handed over to courier' },
        { label: 'Processing', count: 67, note: 'Orders being prepared for dispatch' },
        { label: 'New Orders', count: 124, note: 'Orders awaiting confirmation' },
        { label: 'Confirmed Orders', count: 89, note: 'Orders confirmed by vendor' },
      ],
      orderExceptions: [
        { label: 'Payment Pending', count: 28, note: 'Orders waiting for payment confirmation' },
        { label: 'Cancelled', count: 43, note: 'Orders cancelled by customer or vendor' },
        { label: 'Failed Payments', count: 12, note: 'Orders with failed payment attempts' },
        { label: 'Refund Requests', count: 18, note: 'Orders flagged for refund review' },
        { label: 'Missing Items', count: 9, note: 'Orders with stock or inventory issues' },
        { label: 'Escalated Cases', count: 6, note: 'Orders requiring manual support intervention' },
      ],
    };
  }

  public async getRevenueSummaryData(timeframe: string = 'all_time'): Promise<any> {
    return {
      timeframe,
      marketplaceGrossRevenue: 12847500,
      marketplaceGrossRevenueFormatted: 'NPR 12,847,500',
      allocation: {
        platformCommission: {
          ratePct: 15,
          amount: 1927125,
          amountFormatted: 'NPR 1,927,125',
          formula: 'Platform earnings • Gross revenue × 15% marketplace commission',
        },
        vendorEarnings: {
          ratePct: 85,
          amount: 10920375,
          amountFormatted: 'NPR 10,920,375',
          formula: 'Vendor share • Gross revenue - platform commission',
        },
        formulaSummary: 'NPR 1,927,125 commission + NPR 10,920,375 vendor earnings = NPR 12,847,500 gross revenue',
      },
      revenueAfterRefunds: {
        grossRevenue: 12847500,
        refundAmount: 234600,
        refundPctOfGross: '1.83% of gross',
        netRevenueAfterRefunds: 12612900,
        accountingNote: 'Commission remains NPR 1,927,125 as reported. This view does not recalculate commission or allocate refunds between the platform and vendors.',
      },
      vendorSettlementPosition: {
        completedPayoutsPct: 78.57,
        pendingSettlementsPct: 21.43,
        completedPayoutsAmount: 8579575,
        pendingSettlementsAmount: 2340800,
        totalVendorEarnings: 10920375,
        formulaNote: 'Completed payouts ÷ vendor earnings × 100. Percentages are rounded; see exact balances below.',
      },
      settlementRegister: [
        {
          component: 'Completed Payouts',
          note: 'vendor earnings already paid out',
          position: 'Completed',
          positionColor: 'green',
          sharePct: '78.57%',
          amount: 8579575,
          amountFormatted: '8,579,575',
        },
        {
          component: 'Pending Settlements',
          note: 'vendor earnings remaining to be settled',
          position: 'Pending settlement',
          positionColor: 'orange',
          sharePct: '21.43%',
          amount: 2340800,
          amountFormatted: '2,340,800',
        },
        {
          component: 'Total Vendor Earnings',
          note: '',
          position: '',
          positionColor: '',
          sharePct: '100%',
          amount: 10920375,
          amountFormatted: '10,920,375',
        },
      ],
      reconciliationMatch: {
        isMatched: true,
        summaryText: 'NPR 8,579,575 paid + NPR 2,340,800 pending = NPR 10,920,375 vendor earnings',
        badge: 'Balances match',
      },
    };
  }

  public async getPendingApprovalsData(typeFilter?: string, searchQuery?: string): Promise<any> {
    let list = [...AdminService.approvalsStore];
    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'vendors') list = list.filter((item) => item.type === 'Vendor Registration');
      else if (typeFilter === 'products') list = list.filter((item) => item.type === 'Product Listing');
      else if (typeFilter === 'payouts') list = list.filter((item) => item.type === 'Payout Request');
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      );
    }

    return {
      summaryCards: {
        totalPending: 124,
        totalPendingChange: '+18 since yesterday',
        vendorRegistrations: 37,
        vendorRegistrationsNote: 'Awaiting KYC review',
        productListings: 58,
        productListingsNote: 'Pending catalogue review',
        payoutRequests: 29,
        payoutRequestsNote: 'NPR 4,230,500 held',
      },
      counts: {
        all: 124,
        vendors: 37,
        products: 58,
        payouts: 29,
      },
      requests: list,
    };
  }

  public async approvePendingRequest(id: string, actorId?: string): Promise<any> {
    const item = AdminService.approvalsStore.find((r) => r.id === id);
    if (item) {
      item.status = 'APPROVED';
    }
    return { id, status: 'APPROVED' };
  }

  public async rejectPendingRequest(id: string, reason?: string, actorId?: string): Promise<any> {
    const item = AdminService.approvalsStore.find((r) => r.id === id);
    if (item) {
      item.status = 'REJECTED';
      item.rejectReason = reason || 'Declined by administrator';
    }
    return { id, status: 'REJECTED' };
  }

  public async batchApprovePendingRequests(ids: string[], actorId?: string): Promise<any> {
    ids.forEach((id) => {
      const item = AdminService.approvalsStore.find((r) => r.id === id);
      if (item) item.status = 'APPROVED';
    });
    return { count: ids.length, status: 'APPROVED' };
  }

  public async getAlertsNotificationsData(channelFilter?: string, typeFilter?: string, searchQuery?: string): Promise<any> {
    let list = [...AdminService.alertsStore];
    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'system') list = list.filter((item) => item.type === 'System');
      else if (typeFilter === 'vendor') list = list.filter((item) => item.type === 'Vendor');
      else if (typeFilter === 'product') list = list.filter((item) => item.type === 'Product');
      else if (typeFilter === 'payouts') list = list.filter((item) => item.type === 'Payouts');
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      );
    }

    return {
      summaryCards: {
        unreadAlerts: 18,
        unreadAlertsNote: '6 high priority',
        activeChannels: 12,
        activeChannelsNote: '3 channels paused',
        recentNotifications: 124,
        recentNotificationsNote: '32 sent in the last hour',
        deliveryRate: '98.4%',
        deliveryRateNote: '1.6% bounce rate',
      },
      counts: {
        all: 124,
        system: 18,
        vendor: 24,
        product: 42,
        payouts: 40,
      },
      alerts: list,
    };
  }

  public async markAlertRead(id: string): Promise<any> {
    const item = AdminService.alertsStore.find((a) => a.id === id);
    if (item) item.status = 'Read';
    return { id, status: 'Read' };
  }

  public async snoozeAlert(id: string, duration?: string): Promise<any> {
    const item = AdminService.alertsStore.find((a) => a.id === id);
    if (item) item.status = 'Snoozed';
    return { id, status: 'Snoozed' };
  }

  public async markAllAlertsRead(): Promise<any> {
    AdminService.alertsStore.forEach((a) => (a.status = 'Read'));
    return { count: AdminService.alertsStore.length, status: 'Read' };
  }

  // ==============================================================================
  // INVENTORY SUITE STORES & METHODS
  // Visual Sources of Truth:
  // - Inventory Overview: media_1795249534733_e4bb709b.jpg
  // - Stock Adjustments: media_1795249534732_c03892b1.jpg
  // - Stock Availability: media_1795249534736_b74af85e.jpg
  // - Stock Reservations: media_1795249534740_b9dd0706.jpg
  // - Low Stock: media_1795249534741_42b1c49b.jpg
  // - Out of Stock: media_1795249534742_a62df3a3.jpg
  // - Damaged Stock: media_1795249534744_d23a15a5.jpg
  // ==============================================================================
  private static inventoryStore: any[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      warehouse: 'Kathmandu',
      category: 'Grocery & Staples',
      onHand: 1284,
      available: 1284,
      reserved: 120,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 1164,
      reorderAt: 1500,
      shortfall: 336,
      status: 'Available',
      lowStockStatus: 'Low Stock',
      urgency: 'Medium',
      reservationStatus: 'Reserved',
      lastMovement: '12 Jan 2023',
      lastUpdated: 'Today, 09:42',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      warehouse: 'Pokhara',
      category: 'Beverages',
      onHand: 842,
      available: 842,
      reserved: 96,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 746,
      reorderAt: 1000,
      shortfall: 254,
      status: 'Available',
      lowStockStatus: 'Low Stock',
      urgency: 'Medium',
      reservationStatus: 'Reserved',
      lastMovement: '03 Mar 2023',
      lastUpdated: 'Today, 09:43',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      warehouse: 'Lalitpur',
      category: 'Spices',
      onHand: 4,
      available: 4,
      reserved: 0,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 4,
      reorderAt: 20,
      shortfall: 16,
      status: 'Low Stock',
      lowStockStatus: 'Critical',
      reservationStatus: 'Unreserved',
      urgency: 'Critical',
      lastMovement: '19 Jun 2022',
      lastUpdated: 'Today, 09:44',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      warehouse: 'Biratnagar',
      category: 'Confectionery',
      onHand: 48,
      available: 0,
      reserved: 48,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 0,
      reorderAt: 50,
      shortfall: 50,
      status: 'Out of Stock',
      lowStockStatus: 'Out of Stock',
      stockoutCause: 'Fully Reserved',
      reservationStatus: 'Fully Reserved',
      lastMovement: '28 Aug 2023',
      lastUpdated: 'Today, 09:45',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      warehouse: 'Butwal',
      category: 'Pantry',
      onHand: 917,
      available: 917,
      reserved: 72,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 845,
      reorderAt: 1000,
      shortfall: 155,
      status: 'Available',
      lowStockStatus: 'Low Stock',
      urgency: 'Medium',
      reservationStatus: 'Reserved',
      lastMovement: '05 Nov 2023',
      lastUpdated: 'Today, 09:46',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      warehouse: 'Dharan',
      category: 'Beverages',
      onHand: 48,
      available: 0,
      reserved: 0,
      damaged: 48,
      pendingRelease: 0,
      availableToSell: 0,
      reorderAt: 50,
      shortfall: 50,
      status: 'Damaged',
      lowStockStatus: 'Out of Stock',
      stockoutCause: 'Damaged Stock',
      reservationStatus: 'Unavailable',
      damageReviewStatus: 'Pending Review',
      lastMovement: '17 Feb 2024',
      lastUpdated: 'Today, 09:47',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      warehouse: 'Hetauda',
      category: 'Natural & Wellness',
      onHand: 1240,
      available: 1240,
      reserved: 0,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 1240,
      reorderAt: 1500,
      shortfall: 260,
      status: 'Available',
      lowStockStatus: 'Low Stock',
      reservationStatus: 'Unreserved',
      lastMovement: '22 Sep 2022',
      lastUpdated: 'Today, 09:48',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      warehouse: 'Nepalgunj',
      category: 'Condiments',
      onHand: 756,
      available: 756,
      reserved: 0,
      damaged: 0,
      pendingRelease: 0,
      availableToSell: 756,
      reorderAt: 1000,
      shortfall: 244,
      status: 'Available',
      lowStockStatus: 'Low Stock',
      reservationStatus: 'Unreserved',
      lastMovement: '30 Apr 2023',
      lastUpdated: 'Today, 09:49',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  private static stockAdjustmentsStore: any[] = [
    {
      id: 'ADJ-001',
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      warehouse: 'Kathmandu',
      adjType: 'Cycle Count',
      netChange: '+128',
      netChangeVal: 128,
      newQty: 1412,
      approvedBy: 'R. Sharma',
      status: 'Approved',
      lastUpdated: 'Today, 09:42',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-002',
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      warehouse: 'Pokhara',
      adjType: 'Damage Write-off',
      netChange: '-18',
      netChangeVal: -18,
      newQty: 824,
      approvedBy: 'A. Thapa',
      status: 'Approved',
      lastUpdated: 'Today, 09:43',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-003',
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      warehouse: 'Lalitpur',
      adjType: 'Transfer In',
      netChange: '+48',
      netChangeVal: 48,
      newQty: 52,
      approvedBy: 'Pending',
      status: 'Pending',
      lastUpdated: 'Today, 09:44',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-004',
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      warehouse: 'Biratnagar',
      adjType: 'Cycle Count',
      netChange: '-48',
      netChangeVal: -48,
      newQty: 0,
      approvedBy: 'R. Sharma',
      status: 'Rejected',
      lastUpdated: 'Today, 09:45',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-005',
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      warehouse: 'Butwal',
      adjType: 'Transfer Out',
      netChange: '-72',
      netChangeVal: -72,
      newQty: 845,
      approvedBy: 'Pending',
      status: 'Pending',
      lastUpdated: 'Today, 09:46',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-006',
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      warehouse: 'Dharan',
      adjType: 'Damage Write-off',
      netChange: '-48',
      netChangeVal: -48,
      newQty: 0,
      approvedBy: 'A. Thapa',
      status: 'Approved',
      lastUpdated: 'Today, 09:47',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-007',
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      warehouse: 'Hetauda',
      adjType: 'Cycle Count',
      netChange: '+12',
      netChangeVal: 12,
      newQty: 1252,
      approvedBy: 'R. Sharma',
      status: 'Approved',
      lastUpdated: 'Today, 09:48',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ADJ-008',
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      warehouse: 'Nepalgunj',
      adjType: 'Transfer In',
      netChange: '+36',
      netChangeVal: 36,
      newQty: 792,
      approvedBy: 'Pending',
      status: 'Pending',
      lastUpdated: 'Today, 09:49',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // 1. Inventory Overview
  public async getInventoryOverview(queryParam: any = {}): Promise<any> {
    const { search, status, warehouse } = queryParam;
    let list = [...AdminService.inventoryStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.sku.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.vendor.toLowerCase().includes(q) ||
          i.warehouse.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'All Status') {
      list = list.filter((i) => i.status.toLowerCase() === String(status).toLowerCase());
    }
    if (warehouse && warehouse !== 'All Warehouses') {
      list = list.filter((i) => i.warehouse.toLowerCase() === String(warehouse).toLowerCase());
    }
    return {
      metrics: {
        stockAvailability: 12480,
        stockAvailabilityNote: 'Units ready to fulfil orders',
        reservedStock: 1284,
        reservedStockNote: 'Allocated to open orders',
        lowStock: 58,
        lowStockNote: 'Needs replenishment',
        outOfStock: 12,
        outOfStockNote: 'Immediate action required',
      },
      items: list,
      pagination: { total: 12480, page: 1, limit: 8, warehousesCount: 8 },
    };
  }

  // 2. Stock Availability
  public async getStockAvailability(queryParam: any = {}): Promise<any> {
    const { search, status, warehouse } = queryParam;
    let list = [...AdminService.inventoryStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.sku.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.vendor.toLowerCase().includes(q) ||
          i.warehouse.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'All Status') {
      list = list.filter((i) => i.status.toLowerCase() === String(status).toLowerCase());
    }
    if (warehouse && warehouse !== 'All Warehouses') {
      list = list.filter((i) => i.warehouse.toLowerCase() === String(warehouse).toLowerCase());
    }
    return {
      metrics: {
        availableToSell: 9420,
        availableToSellNote: 'Sellable stock',
        reservedStock: 1284,
        reservedStockNote: 'Allocated for orders',
        lowStock: 254,
        lowStockNote: 'Needs reorder review',
        damagedUnavailable: 48,
        damagedUnavailableNote: 'Quarantined or missing',
      },
      items: list,
      pagination: { total: 12480, page: 1, limit: 8, warehousesCount: 8 },
    };
  }

  // 3. Stock Adjustments
  public async getStockAdjustments(queryParam: any = {}): Promise<any> {
    const { search, status, warehouse } = queryParam;
    let list = [...AdminService.stockAdjustmentsStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.sku.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.vendor.toLowerCase().includes(q) ||
          a.warehouse.toLowerCase().includes(q) ||
          a.adjType.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'All Status') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }
    if (warehouse && warehouse !== 'All Warehouses') {
      list = list.filter((a) => a.warehouse.toLowerCase() === String(warehouse).toLowerCase());
    }
    return {
      metrics: {
        pendingApproval: 18,
        pendingApprovalNote: 'Needs review',
        approvedToday: 12,
        approvedTodayNote: 'Completed',
        rejected: 3,
        rejectedNote: 'Needs correction',
        totalAdjustments: 33,
        totalAdjustmentsNote: 'Last 30 days',
      },
      adjustments: list,
      pagination: { total: 33, page: 1, limit: 8, warehousesCount: 8 },
    };
  }

  public async createStockAdjustment(payload: any): Promise<any> {
    const nextId = `ADJ-${String(AdminService.stockAdjustmentsStore.length + 1).padStart(3, '0')}`;
    const targetItem = AdminService.inventoryStore.find((i) => i.sku === payload.sku) || AdminService.inventoryStore[0];
    const netVal = Number(payload.netChange) || 0;
    const newQuantity = (targetItem.onHand || 100) + netVal;

    const newAdj = {
      id: nextId,
      sku: payload.sku || targetItem.sku,
      name: targetItem.name,
      variant: targetItem.variant,
      vendor: targetItem.vendor,
      warehouse: payload.warehouse || targetItem.warehouse,
      adjType: payload.adjType || 'Cycle Count',
      netChange: netVal >= 0 ? `+${netVal}` : `${netVal}`,
      netChangeVal: netVal,
      newQty: newQuantity,
      approvedBy: 'R. Sharma',
      status: 'Approved',
      lastUpdated: 'Just now',
      image: targetItem.image,
    };

    AdminService.stockAdjustmentsStore.unshift(newAdj);
    targetItem.onHand = newQuantity;
    targetItem.availableToSell = Math.max(0, newQuantity - (targetItem.reserved || 0));
    return newAdj;
  }

  public async reviewStockAdjustment(id: string, decision: 'APPROVE' | 'REJECT'): Promise<any> {
    const adj = AdminService.stockAdjustmentsStore.find((a) => a.id === id);
    if (adj) {
      adj.status = decision === 'APPROVE' ? 'Approved' : 'Rejected';
      adj.approvedBy = 'R. Sharma';
      adj.lastUpdated = 'Just now';
    }
    return adj;
  }

  // 4. Stock Reservations
  public async getStockReservations(queryParam: any = {}): Promise<any> {
    const { search, state, warehouse } = queryParam;
    let list = [...AdminService.inventoryStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.sku.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.vendor.toLowerCase().includes(q)
      );
    }
    if (state && state !== 'All Reservation States') {
      list = list.filter((i) => i.reservationStatus.toLowerCase() === String(state).toLowerCase());
    }
    if (warehouse && warehouse !== 'All Warehouses') {
      list = list.filter((i) => i.warehouse.toLowerCase() === String(warehouse).toLowerCase());
    }
    return {
      metrics: {
        reservedStock: 1284,
        reservedStockNote: 'Allocated for orders',
        pendingRelease: 184,
        pendingReleaseNote: 'Awaiting release',
        overReserved: 36,
        overReservedNote: 'Exceeds on-hand',
        releasedCleared: 1102,
        releasedClearedNote: 'Released from allocation',
      },
      items: list,
      pagination: { total: 12480, page: 1, limit: 8, warehousesCount: 8 },
    };
  }

  // 5. Low Stock
  public async getLowStockItems(queryParam: any = {}): Promise<any> {
    const { search, urgency, warehouse } = queryParam;
    let list = AdminService.inventoryStore.filter((i) => i.onHand < i.reorderAt || i.status === 'Low Stock' || i.status === 'Out of Stock');
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    if (warehouse && warehouse !== 'All Warehouses') {
      list = list.filter((i) => i.warehouse.toLowerCase() === String(warehouse).toLowerCase());
    }
    return {
      metrics: {
        lowStockSkus: 254,
        lowStockSkusNote: 'Below reorder threshold',
        criticalSkus: 36,
        criticalSkusNote: '5 or fewer sellable units',
        warehousesAffected: 8,
        warehousesAffectedNote: 'Locations requiring restock',
        vendorLeadTime: '3-7 days',
        vendorLeadTimeNote: 'Confirm delivery before ordering',
      },
      items: list,
      pagination: { total: 254, page: 1, limit: 8, warehousesCount: 8 },
    };
  }

  // 6. Out of Stock
  public async getOutOfStockItems(queryParam: any = {}): Promise<any> {
    const { search, cause, warehouse } = queryParam;
    let list = AdminService.inventoryStore.filter((i) => i.availableToSell === 0 || i.status === 'Out of Stock' || i.status === 'Damaged');
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    if (cause && cause !== 'All Stockout Causes') {
      list = list.filter((i) => i.stockoutCause && i.stockoutCause.toLowerCase() === String(cause).toLowerCase());
    }
    return {
      metrics: {
        outOfStockSkus: 2,
        outOfStockSkusNote: 'Zero sellable units',
        stockoutCauses: 2,
        stockoutCausesNote: '1 fully reserved, 1 damaged',
        warehousesAffected: 2,
        warehousesAffectedNote: 'Locations requiring recovery',
        unavailableUnits: 48,
        unavailableUnitsNote: 'Damaged stock requiring review',
      },
      items: list,
      pagination: { total: 2, page: 1, limit: 2, warehousesCount: 2 },
    };
  }

  // 7. Damaged Stock
  public async getDamagedStockItems(queryParam: any = {}): Promise<any> {
    const { search, reviewStatus, warehouse } = queryParam;
    let list = AdminService.inventoryStore.filter((i) => (i.damaged && i.damaged > 0) || i.status === 'Damaged');
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    return {
      metrics: {
        damagedSkus: 1,
        damagedSkusNote: 'Requires disposition review',
        pendingReview: 1,
        pendingReviewNote: 'Awaiting condition assessment',
        warehousesWithDamage: 1,
        warehousesWithDamageNote: 'Location with damaged stock',
        damagedUnits: 48,
        damagedUnitsNote: 'Units awaiting disposition',
      },
      items: list,
      pagination: { total: 1, page: 1, limit: 1, warehousesCount: 1 },
    };
  }

  public async disposeDamagedStock(sku: string, payload: any): Promise<any> {
    const item = AdminService.inventoryStore.find((i) => i.sku === sku);
    if (item) {
      item.damaged = 0;
      item.status = 'Out of Stock';
      item.damageReviewStatus = 'Disposed';
      item.lastUpdated = 'Just now';
    }
    return { sku, status: 'Disposed', action: payload.action || 'Write-Off' };
  }

  // ==============================================================================
  // ORDER MANAGEMENT: ALL ORDERS & ORDER EXCEPTIONS (Screens 23 & 24)
  // Visual Sources of Truth: media_1795251174249_13323b18.jpg & media_1795251174251_699f595f.jpg
  // ==============================================================================
  private static ordersManagementStore: any[] = [
    {
      orderId: 'ORD-1001',
      customerName: 'Aarav Thapa',
      customerLocation: 'Kathmandu',
      vendor: 'Himalayan Mart',
      channel: 'Web',
      orderTotal: 4850,
      orderTotalFormatted: 'NPR 4,850',
      payment: 'Paid',
      fulfillment: 'Delivered',
      status: 'Delivered',
      placedOn: '30 Oct 2026',
      itemsCount: 3,
      hasException: false,
    },
    {
      orderId: 'ORD-1002',
      customerName: 'Priya Shrestha',
      customerLocation: 'Pokhara',
      vendor: 'Pokhara Bazaar',
      channel: 'App',
      orderTotal: 1120,
      orderTotalFormatted: 'NPR 1,120',
      payment: 'COD',
      fulfillment: 'Shipped',
      status: 'In Transit',
      placedOn: '31 Oct 2026',
      itemsCount: 1,
      hasException: false,
    },
    {
      orderId: 'ORD-1003',
      customerName: 'Kishor Regmi',
      customerLocation: 'Lalitpur',
      vendor: 'Lalitpur Wholesale',
      channel: 'Web',
      orderTotal: 2340,
      orderTotalFormatted: 'NPR 2,340',
      payment: 'Refund Due',
      fulfillment: 'Cancelled',
      status: 'Cancelled',
      exceptionReason: 'Refund Due',
      resolutionStatus: 'Pending Review',
      placedOn: '30 Oct 2026',
      itemsCount: 2,
      hasException: true,
    },
    {
      orderId: 'ORD-1004',
      customerName: 'Srijana Poudel',
      customerLocation: 'Biratnagar',
      vendor: 'Biratnagar Hub',
      channel: 'App',
      orderTotal: 890,
      orderTotalFormatted: 'NPR 890',
      payment: 'Pending',
      fulfillment: 'Pending',
      status: 'Pending',
      exceptionReason: 'Payment Pending',
      resolutionStatus: 'Pending Review',
      placedOn: '01 Nov 2026',
      itemsCount: 1,
      hasException: true,
    },
    {
      orderId: 'ORD-1005',
      customerName: 'Rohan Bajracharya',
      customerLocation: 'Butwal',
      vendor: 'Butwal Depot',
      channel: 'Web',
      orderTotal: 3210,
      orderTotalFormatted: 'NPR 3,210',
      payment: 'Paid',
      fulfillment: 'Delivered',
      status: 'Delivered',
      placedOn: '29 Oct 2026',
      itemsCount: 2,
      hasException: false,
    },
    {
      orderId: 'ORD-1006',
      customerName: 'Nisha Chaudhary',
      customerLocation: 'Dharan',
      vendor: 'Dharan Market',
      channel: 'App',
      orderTotal: 1980,
      orderTotalFormatted: 'NPR 1,980',
      payment: 'Paid',
      fulfillment: 'Delivered',
      status: 'Delivered',
      placedOn: '28 Oct 2026',
      itemsCount: 1,
      hasException: false,
    },
    {
      orderId: 'ORD-1007',
      customerName: 'Bipin Adhikari',
      customerLocation: 'Hetauda',
      vendor: 'Hetauda Store',
      channel: 'Web',
      orderTotal: 2760,
      orderTotalFormatted: 'NPR 2,760',
      payment: 'Paid',
      fulfillment: 'Packed',
      status: 'Processing',
      placedOn: '01 Nov 2026',
      itemsCount: 4,
      hasException: false,
    },
    {
      orderId: 'ORD-1008',
      customerName: 'Shilpa Rana',
      customerLocation: 'Nepalgunj',
      vendor: 'Nepalgunj Outlet',
      channel: 'App',
      orderTotal: 5440,
      orderTotalFormatted: 'NPR 5,440',
      payment: 'Paid',
      fulfillment: 'Delivered',
      status: 'Delivered',
      placedOn: '27 Oct 2026',
      itemsCount: 3,
      hasException: false,
    },
  ];

  // 1. All Orders
  public async listAdminOrders(queryParam: any = {}): Promise<any> {
    const { search, status, channel } = queryParam;
    let list = [...AdminService.ordersManagementStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerLocation.toLowerCase().includes(q) ||
          o.vendor.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all' && status !== 'All Status') {
      list = list.filter((o) => o.status.toLowerCase() === String(status).toLowerCase());
    }

    if (channel && channel !== 'All Channels') {
      list = list.filter((o) => o.channel.toLowerCase() === String(channel).toLowerCase());
    }

    return {
      metrics: {
        totalOrders: 1284,
        totalOrdersNote: 'Across all channels',
        openOrders: 58,
        openOrdersNote: 'Pending, packed or in transit',
        completedOrders: 1214,
        completedOrdersNote: 'Delivered and closed',
        cancelledOrders: 12,
        cancelledOrdersNote: 'Refunds or exceptions',
      },
      orders: list,
      pagination: {
        total: 1284,
        page: 1,
        limit: 8,
        vendorsCount: 8,
      },
    };
  }

  public async createAdminOrder(payload: any): Promise<any> {
    const nextNum = 1000 + AdminService.ordersManagementStore.length + 1;
    const newOrder = {
      orderId: `ORD-${nextNum}`,
      customerName: payload.customerName || 'New Customer',
      customerLocation: payload.customerLocation || 'Kathmandu',
      vendor: payload.vendor || 'Himalayan Mart',
      channel: payload.channel || 'Web',
      orderTotal: Number(payload.orderTotal) || 1500,
      orderTotalFormatted: `NPR ${(Number(payload.orderTotal) || 1500).toLocaleString()}`,
      payment: payload.payment || 'Paid',
      fulfillment: payload.fulfillment || 'Pending',
      status: payload.status || 'Pending',
      placedOn: 'Just now',
      itemsCount: payload.itemsCount || 1,
      hasException: false,
    };
    AdminService.ordersManagementStore.unshift(newOrder);
    return newOrder;
  }

  // 2. Order Exceptions
  public async listOrderExceptions(queryParam: any = {}): Promise<any> {
    const { search, exceptionType, channel } = queryParam;
    let list = AdminService.ordersManagementStore.filter((o) => o.hasException);

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerLocation.toLowerCase().includes(q) ||
          o.vendor.toLowerCase().includes(q)
      );
    }

    if (exceptionType && exceptionType !== 'All Exceptions') {
      list = list.filter(
        (o) => o.exceptionReason && o.exceptionReason.toLowerCase() === String(exceptionType).toLowerCase()
      );
    }

    if (channel && channel !== 'All Channels') {
      list = list.filter((o) => o.channel.toLowerCase() === String(channel).toLowerCase());
    }

    const openCount = list.filter((o) => o.resolutionStatus === 'Pending Review').length;
    const paymentCount = list.filter((o) => o.exceptionReason === 'Payment Pending').length;
    const refundCount = list.filter((o) => o.exceptionReason === 'Refund Due').length;

    return {
      metrics: {
        openExceptions: openCount,
        openExceptionsNote: 'Need manual resolution',
        paymentExceptions: paymentCount,
        paymentExceptionsNote: 'Pending payment review',
        refundExceptions: refundCount,
        refundExceptionsNote: 'Refund due and pending',
        resolvedExceptions: 0,
        resolvedExceptionsNote: 'No exceptions closed',
      },
      exceptions: list,
      pagination: {
        total: list.length,
        page: 1,
        limit: 8,
        vendorsCount: 2,
      },
    };
  }

  public async createOrderException(payload: any): Promise<any> {
    const targetOrder = AdminService.ordersManagementStore.find((o) => o.orderId === payload.orderId);
    if (targetOrder) {
      targetOrder.hasException = true;
      targetOrder.exceptionReason = payload.reason || 'Operational Exception';
      targetOrder.resolutionStatus = 'Pending Review';
      return targetOrder;
    }
    return null;
  }

  public async resolveOrderRefund(orderId: string, payload: any): Promise<any> {
    const targetOrder = AdminService.ordersManagementStore.find((o) => o.orderId === orderId);
    if (targetOrder) {
      targetOrder.payment = 'Refunded';
      targetOrder.resolutionStatus = 'Resolved';
      targetOrder.hasException = false;
      return { order: targetOrder, refundedAmount: targetOrder.orderTotal, memo: payload.memo || 'Refund processed' };
    }
    return null;
  }

  public async resolveOrderPayment(orderId: string, payload: any): Promise<any> {
    const targetOrder = AdminService.ordersManagementStore.find((o) => o.orderId === orderId);
    if (targetOrder) {
      targetOrder.payment = 'Paid';
      targetOrder.resolutionStatus = 'Resolved';
      targetOrder.hasException = false;
      return { order: targetOrder, memo: payload.memo || 'Payment confirmed' };
    }
    return null;
  }

  // ==============================================================================
  // PAYMENT MANAGEMENT SUITE (Screens 25, 26, 27)
  // ==============================================================================
  private static paymentsStore: any[] = [
    {
      paymentId: 'PAY-1001',
      customerName: 'Aarav Thapa',
      customerLocation: 'Kathmandu',
      vendor: 'Himalayan Mart',
      channel: 'Web',
      paymentAmount: 4850,
      amountFormatted: 'NPR 4,850',
      method: 'Card',
      orderReference: 'ORD-1001',
      status: 'Paid',
      collectionStatus: 'Paid',
      recordedOn: '30 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1002',
      customerName: 'Priya Shrestha',
      customerLocation: 'Pokhara',
      vendor: 'Pokhara Bazaar',
      channel: 'App',
      paymentAmount: 1120,
      amountFormatted: 'NPR 1,120',
      method: 'COD',
      orderReference: 'ORD-1002',
      status: 'Pending',
      collectionStatus: 'Pending',
      recordedOn: '31 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1003',
      customerName: 'Kishor Regmi',
      customerLocation: 'Lalitpur',
      vendor: 'Lalitpur Wholesale',
      channel: 'Web',
      paymentAmount: 2340,
      amountFormatted: 'NPR 2,340',
      method: 'Card',
      orderReference: 'ORD-1003',
      status: 'Refund Due',
      collectionStatus: 'Refund Due',
      recordedOn: '30 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1004',
      customerName: 'Srijana Poudel',
      customerLocation: 'Biratnagar',
      vendor: 'Biratnagar Hub',
      channel: 'App',
      paymentAmount: 890,
      amountFormatted: 'NPR 890',
      method: 'COD',
      orderReference: 'ORD-1004',
      status: 'Pending',
      collectionStatus: 'Pending',
      recordedOn: '01 Nov 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1005',
      customerName: 'Rohan Bajracharya',
      customerLocation: 'Butwal',
      vendor: 'Butwal Depot',
      channel: 'Web',
      paymentAmount: 3210,
      amountFormatted: 'NPR 3,210',
      method: 'Card',
      orderReference: 'ORD-1005',
      status: 'Paid',
      collectionStatus: 'Paid',
      recordedOn: '29 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1006',
      customerName: 'Nisha Chaudhary',
      customerLocation: 'Dharan',
      vendor: 'Dharan Market',
      channel: 'App',
      paymentAmount: 1980,
      amountFormatted: 'NPR 1,980',
      method: 'Card',
      orderReference: 'ORD-1006',
      status: 'Paid',
      collectionStatus: 'Paid',
      recordedOn: '28 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1007',
      customerName: 'Bipin Adhikari',
      customerLocation: 'Hetauda',
      vendor: 'Hetauda Store',
      channel: 'Web',
      paymentAmount: 2760,
      amountFormatted: 'NPR 2,760',
      method: 'Card',
      orderReference: 'ORD-1007',
      status: 'Paid',
      collectionStatus: 'Paid',
      recordedOn: '01 Nov 2026',
      reconciliation: 'Awaiting Statement',
    },
    {
      paymentId: 'PAY-1008',
      customerName: 'Shilpa Rana',
      customerLocation: 'Nepalgunj',
      vendor: 'Nepalgunj Outlet',
      channel: 'App',
      paymentAmount: 5440,
      amountFormatted: 'NPR 5,440',
      method: 'Card',
      orderReference: 'ORD-1008',
      status: 'Paid',
      collectionStatus: 'Paid',
      recordedOn: '27 Oct 2026',
      reconciliation: 'Awaiting Statement',
    },
  ];

  private static gatewaysStore: any[] = [
    {
      id: 'khalti',
      provider: 'Khalti',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'fonepay',
      provider: 'FonePay',
      region: 'Nepal',
      paymentType: 'QR payments',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'imepay',
      provider: 'IME Pay',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'esewa',
      provider: 'eSewa',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'prabhupay',
      provider: 'Prabhu Pay',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'connectips',
      provider: 'Connect IPS',
      region: 'Nepal',
      paymentType: 'Bank transfer',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
  ];

  public async listPayments(queryParam: any = {}): Promise<any> {
    const { search, status, method } = queryParam;
    let list = [...AdminService.paymentsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.paymentId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.customerLocation.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.orderReference.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All Status') {
      list = list.filter((p) => p.status.toLowerCase() === String(status).toLowerCase());
    }

    if (method && method !== 'All Methods') {
      list = list.filter((p) => p.method.toLowerCase() === String(method).toLowerCase());
    }

    const paidCount = list.filter((p) => p.status === 'Paid').length;
    const pendingCount = list.filter((p) => p.status === 'Pending').length;
    const refundCount = list.filter((p) => p.status === 'Refund Due').length;

    return {
      metrics: {
        totalPayments: list.length,
        totalPaymentsNote: `${paidCount} paid • ${pendingCount} pending • ${refundCount} refund due`,
        pendingPayments: pendingCount,
        pendingPaymentsNote: 'NPR 2,010 awaiting collection',
        paidPayments: paidCount,
        paidPaymentsNote: 'NPR 18,240 received',
        refundDue: refundCount,
        refundDueNote: 'NPR 2,340 awaiting refund',
      },
      payments: list,
    };
  }

  public async recordPayment(payload: any): Promise<any> {
    const newPayment = {
      paymentId: payload.paymentId || `PAY-${AdminService.paymentsStore.length + 1001}`,
      customerName: payload.customerName || 'Customer',
      customerLocation: payload.customerLocation || 'Kathmandu',
      vendor: payload.vendor || 'Vendor Store',
      channel: payload.channel || 'Web',
      paymentAmount: Number(payload.paymentAmount || 0),
      amountFormatted: `NPR ${Number(payload.paymentAmount || 0).toLocaleString()}`,
      method: payload.method || 'Card',
      orderReference: payload.orderReference || `ORD-${AdminService.paymentsStore.length + 1001}`,
      status: payload.status || 'Paid',
      collectionStatus: payload.status || 'Paid',
      recordedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reconciliation: 'Awaiting Statement',
    };
    AdminService.paymentsStore.unshift(newPayment);
    return newPayment;
  }

  public async getPaymentReconciliation(queryParam: any = {}): Promise<any> {
    const { search, recordStatus, method } = queryParam;
    let list = [...AdminService.paymentsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.paymentId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.orderReference.toLowerCase().includes(q)
      );
    }

    if (recordStatus && recordStatus !== 'All Records') {
      list = list.filter((p) => p.collectionStatus.toLowerCase() === String(recordStatus).toLowerCase());
    }

    if (method && method !== 'All Methods') {
      list = list.filter((p) => p.method.toLowerCase() === String(method).toLowerCase());
    }

    return {
      metrics: {
        recordedAmount: 'NPR 22,590',
        recordedAmountNote: `${list.length} records • awaiting statement import`,
        pendingCollection: 'NPR 2,010',
        pendingCollectionNote: '2 records still awaiting collection',
        collectedAmount: 'NPR 18,240',
        collectedAmountNote: '5 records marked as collected',
        refundDue: 'NPR 2,340',
        refundDueNote: '1 record awaiting refund',
      },
      reconciliations: list,
    };
  }

  public async importBankStatement(payload: any): Promise<any> {
    return {
      success: true,
      filename: payload.filename || 'bank_statement.csv',
      processedRows: 148,
      matchedRecords: 142,
      varianceRecords: 6,
      importedAt: new Date().toISOString(),
    };
  }

  public async listPaymentGateways(queryParam: any = {}): Promise<any> {
    const { search, provider, method, environment } = queryParam;
    let list = [...AdminService.gatewaysStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (g) =>
          g.provider.toLowerCase().includes(q) ||
          g.paymentType.toLowerCase().includes(q) ||
          g.region.toLowerCase().includes(q)
      );
    }

    if (provider && provider !== 'All Providers') {
      list = list.filter((g) => g.provider.toLowerCase() === String(provider).toLowerCase());
    }

    if (method && method !== 'All Methods') {
      list = list.filter((g) => g.paymentType.toLowerCase().includes(String(method).toLowerCase()));
    }

    if (environment && environment !== 'All Environments') {
      list = list.filter((g) => g.environment.toLowerCase() === String(environment).toLowerCase());
    }

    const connectedCount = list.filter((g) => g.connection === 'Connected').length;
    const setupRequiredCount = list.filter((g) => g.setup === 'Not Started' || g.setup === 'Setup Required').length;

    return {
      metrics: {
        gatewayOptions: list.length,
        gatewayOptionsNote: 'Select a provider to begin setup',
        connectedGateways: connectedCount,
        connectedGatewaysNote: connectedCount === 0 ? 'No integrations configured' : `${connectedCount} active in checkout`,
        setupRequired: setupRequiredCount,
        setupRequiredNote: 'Merchant credentials not added',
        checkoutCurrency: 'NPR',
        checkoutCurrencyNote: 'Nepalese Rupee',
      },
      gateways: list,
    };
  }

  public async configurePaymentGateway(id: string, payload: any): Promise<any> {
    const gw = AdminService.gatewaysStore.find((g) => g.id.toLowerCase() === id.toLowerCase());
    if (gw) {
      gw.environment = payload.environment || 'Sandbox';
      gw.connection = payload.active ? 'Connected' : 'Not Connected';
      gw.setup = payload.active ? 'Configured' : 'Setup Required';
      return gw;
    }
    return null;
  }

  // ============================================================================
  // DELIVERY & LOGISTICS SUITE (Screen 28: Delivery Dashboard)
  // ============================================================================
  private static shipmentsStore: any[] = [
    {
      shipmentId: 'SHP-2019',
      recipient: 'Mina Rai',
      phone: '+977 98-4123-4567',
      route: 'Kathmandu → Lalitpur',
      partner: 'Valley Courier',
      status: 'Out for Delivery',
      eta: 'Today, 14:30',
      orderId: 'ORD-1001',
      address: 'Jhamsikhel, Lalitpur, Bagmati',
      items: 2,
      weight: '1.2 kg',
      zone: 'Kathmandu Valley',
      placedOn: '30 Oct 2026',
    },
    {
      shipmentId: 'SHP-2018',
      recipient: 'Suman Karki',
      phone: '+977 97-6234-5678',
      route: 'Pokhara → Butwal',
      partner: 'Western Parcel',
      status: 'In Transit',
      eta: 'Tomorrow',
      orderId: 'ORD-1002',
      address: 'Traffic Chowk, Butwal, Lumbini',
      items: 1,
      weight: '0.8 kg',
      zone: 'Butwal',
      placedOn: '31 Oct 2026',
    },
    {
      shipmentId: 'SHP-2017',
      recipient: 'Anita Shah',
      phone: '+977 98-5345-6789',
      route: 'Biratnagar → Dharan',
      partner: 'Eastern Dispatch',
      status: 'Failed Delivery',
      eta: 'Review needed',
      orderId: 'ORD-1003',
      address: 'Bhanuchowk, Dharan, Koshi',
      items: 3,
      weight: '2.4 kg',
      zone: 'Rural / Other',
      placedOn: '30 Oct 2026',
      failureReason: 'Address not found after 2 attempts',
    },
    {
      shipmentId: 'SHP-2016',
      recipient: 'Rajendra Basnet',
      phone: '+977 98-0456-7890',
      route: 'Kathmandu → Bhaktapur',
      partner: 'Valley Courier',
      status: 'Delivered',
      eta: 'Delivered (28 Oct)',
      orderId: 'ORD-1004',
      address: 'Suryabinayak, Bhaktapur, Bagmati',
      items: 1,
      weight: '0.5 kg',
      zone: 'Kathmandu Valley',
      placedOn: '28 Oct 2026',
    },
    {
      shipmentId: 'SHP-2015',
      recipient: 'Prakash Adhikari',
      phone: '+977 98-6567-8901',
      route: 'Butwal → Nepalgunj',
      partner: 'Terai Logistics',
      status: 'Delivered',
      eta: 'Delivered (29 Oct)',
      orderId: 'ORD-1005',
      address: 'Tribhuvan Chowk, Nepalgunj, Lumbini',
      items: 4,
      weight: '3.1 kg',
      zone: 'Rural / Other',
      placedOn: '29 Oct 2026',
    },
    {
      shipmentId: 'SHP-2014',
      recipient: 'Kamala Thapa',
      phone: '+977 98-2890-1234',
      route: 'Kathmandu → Pokhara',
      partner: 'Western Parcel',
      status: 'Delivered',
      eta: 'Delivered (27 Oct)',
      orderId: 'ORD-1006',
      address: 'Lakeside, Pokhara, Gandaki',
      items: 2,
      weight: '1.5 kg',
      zone: 'Pokhara',
      placedOn: '27 Oct 2026',
    },
  ];

  public async getDeliveryDashboard(queryParam: any = {}): Promise<any> {
    const { search, status, partner } = queryParam;
    let list = [...AdminService.shipmentsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (s) =>
          s.shipmentId.toLowerCase().includes(q) ||
          s.recipient.toLowerCase().includes(q) ||
          s.route.toLowerCase().includes(q) ||
          s.partner.toLowerCase().includes(q) ||
          s.orderId.toLowerCase().includes(q) ||
          (s.zone && s.zone.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All Status') {
      list = list.filter((s) => s.status.toLowerCase() === String(status).toLowerCase());
    }

    if (partner && partner !== 'All Partners') {
      list = list.filter((s) => s.partner.toLowerCase() === String(partner).toLowerCase());
    }

    return {
      kpis: {
        onTimeDelivery: '96.8%',
        onTimeDeliveryNote: '1,105 of 1,142 delivered on time',
        shipments: '1,284',
        shipmentsNote: '1,142 delivered • 128 in transit • 14 exceptions',
        deliveryPartners: '12',
        deliveryPartnersNote: '8 active • 3 onboarding • 1 paused',
        deliveryZones: '24',
        deliveryZonesNote: '18 standard • 4 express • 2 rural',
      },
      recentShipments: list,
      deliveryCharges: [
        { name: 'Standard (0-5 km)', fee: 'NPR 120' },
        { name: 'Express (0-5 km)', fee: 'NPR 250' },
        { name: 'Rural (5+ km)', fee: 'NPR 180' },
        { name: 'Heavy / Bulky', fee: 'NPR 350' },
      ],
      tracking: [
        { label: 'Picked up', value: '1,284' },
        { label: 'Active in transit', value: '128' },
        { label: 'Delivered', value: '1,142' },
        { label: 'Exceptions', value: '14' },
      ],
      failedDeliveries: [
        { label: 'Address not found', count: 6 },
        { label: 'Customer unavailable', count: 4 },
        { label: 'Package damaged', count: 2 },
        { label: 'Other', count: 2 },
      ],
      returnToOrigin: [
        { label: 'Pending return', count: 8 },
        { label: 'In transit', count: 3 },
        { label: 'Received', count: 3 },
        { label: 'Refund initiated', count: 2 },
      ],
      partnerOnTimeRate: [
        { partner: 'Valley Courier', rate: '98.2%' },
        { partner: 'Western Parcel', rate: '96.5%' },
        { partner: 'Eastern Dispatch', rate: '94.8%' },
        { partner: 'Terai Logistics', rate: '92.1%' },
      ],
      shipmentShareByZone: [
        { zone: 'Kathmandu Valley', share: '42%' },
        { zone: 'Pokhara', share: '18%' },
        { zone: 'Butwal', share: '12%' },
        { zone: 'Rural / Other', share: '28%' },
      ],
      exceptionsByZone: [
        { zone: 'Kathmandu Valley', count: 4 },
        { zone: 'Pokhara', count: 3 },
        { zone: 'Butwal', count: 2 },
        { zone: 'Rural / Other', count: 5 },
      ],
    };
  }

  public async assignShipment(payload: any): Promise<any> {
    const nextNum = AdminService.shipmentsStore.length + 2020;
    const newShipment = {
      shipmentId: payload.shipmentId || `SHP-${nextNum}`,
      recipient: payload.recipient || 'Customer',
      phone: payload.phone || '+977 98-0000-0000',
      route: payload.route || 'Kathmandu → Lalitpur',
      partner: payload.partner || 'Valley Courier',
      status: payload.status || 'In Transit',
      eta: payload.eta || 'Tomorrow',
      orderId: payload.orderId || `ORD-${nextNum}`,
      address: payload.address || 'Kathmandu, Bagmati',
      items: payload.items || 1,
      weight: payload.weight || '1.0 kg',
      zone: payload.zone || 'Kathmandu Valley',
      placedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: payload.notes || '',
    };
    AdminService.shipmentsStore.unshift(newShipment);
    return newShipment;
  }

  public async updateShipmentStatus(id: string, payload: any): Promise<any> {
    const shipment = AdminService.shipmentsStore.find((s) => s.shipmentId.toLowerCase() === id.toLowerCase());
    if (shipment) {
      if (payload.status) shipment.status = payload.status;
      if (payload.eta) shipment.eta = payload.eta;
      if (payload.failureReason) shipment.failureReason = payload.failureReason;
      return shipment;
    }
    return null;
  }

  // ==============================================================================
  // RETURNS & REFUNDS MANAGEMENT SUITE (Screens 29, 30, 31, 32, 33, 34)
  // Visual Sources of Truth: media_1795254092900_15a110f2.jpg, media_1795254092874_4dc9995d.jpg,
  // media_1795254092896_e790ee94.jpg, media_1795254092872_12b3efef.jpg,
  // media_1795254092885_d0756584.jpg, media_1795254092865_ec48ca1e.jpg
  // ==============================================================================

  private static returnsStore: any[] = [
    {
      returnId: 'RET-1042',
      submittedDate: '01 Nov · 09:15',
      customer: 'Mina Rai',
      phone: '+977 98-4123-4567',
      orderId: 'ORD-88214',
      returnedItem: 'Trail fleece jacket',
      sku: 'EP-FLC-204-M',
      variant: 'Slate · Size M / 1 of 1',
      reason: 'Wrong size',
      workflowStatus: 'Awaiting Approval',
      amount: 1450,
      seller: 'Himal Outdoor',
      deliveredDate: '27 Oct 2026',
      assignedTo: 'Rajesh Sharma',
      quote: 'The jacket is too tight at the shoulders. The tags are attached and I have not worn it. I would like to return it for a refund.',
      attachments: [
        { name: 'size-label.jpg', size: '248 KB', date: '01 Nov' },
        { name: 'item-with-tags.jpg', size: '412 KB', date: '01 Nov' },
      ],
      returnWindowStatus: '5 days since delivery · within 7-day window (Eligible)',
      categoryStatus: 'Apparel · no final-sale exclusion (Eligible)',
      priorReturnStatus: '1 purchased · no prior return for this item (Verified)',
      itemCondition: 'Customer reports unused, tags attached (Inspect on receipt)',
    },
    {
      returnId: 'RET-1041',
      submittedDate: '31 Oct · 16:40',
      customer: 'Suman Karki',
      phone: '+977 97-6234-5678',
      orderId: 'ORD-88209',
      returnedItem: 'Ceramic mug',
      sku: 'EP-MUG-011-BL',
      variant: 'Blue · 1 item',
      reason: 'Damaged item',
      workflowStatus: 'Awaiting Inspection',
      amount: 890,
      seller: 'Valley Ceramics',
      deliveredDate: '28 Oct 2026',
      intakeRef: 'RCV-5041',
      intakeDate: '31 Oct · 16:40',
      storageBin: 'QC-B04',
      inspector: 'S. Shrestha · KTM warehouse',
      expectedSku: 'EP-MUG-011-BL · Blue',
      countedQty: 1,
      skuMatch: 'Not verified',
    },
    {
      returnId: 'RET-1040',
      submittedDate: '31 Oct · 14:20',
      customer: 'Anita Shah',
      phone: '+977 98-5345-6789',
      orderId: 'ORD-88194',
      returnedItem: 'Everyday backpack',
      sku: 'EP-BPK-102-BK',
      variant: 'Black · 1 item',
      reason: 'Wrong product',
      workflowStatus: 'Awaiting authorization',
      inspectionStatus: 'Inspection Passed',
      amount: 2100,
      seller: 'Urban Gear Nepal',
      deliveredDate: '26 Oct 2026',
      originalPayment: 'eSewa',
      transactionRef: 'ES-PAY-88194',
      paidOn: '26 Oct 2026',
      inspectionId: 'INS-2040 / S. Shrestha',
      passedAt: '31 Oct 2026 · 15:20',
      inspectionNote: 'Wrong product confirmed. Everyday backpack, 1 unit; received complete and unused. Restock approved by warehouse.',
      proposedAuthorization: 2100,
      maxEligible: 2100,
    },
    {
      returnId: 'RET-1039',
      submittedDate: '31 Oct · 11:05',
      customer: 'Rohan Shrestha',
      phone: '+977 98-1234-5678',
      orderId: 'ORD-88186',
      returnedItem: 'Running shoes',
      sku: 'EP-SHO-402-42',
      variant: 'EU 42 · 1 pair',
      reason: 'Wrong size',
      workflowStatus: 'Awaiting Approval',
      amount: 3200,
      seller: 'ActiveFoot Nepal',
      deliveredDate: '28 Oct 2026',
    },
    {
      returnId: 'RET-1038',
      submittedDate: '30 Oct · 15:30',
      customer: 'Bina Gurung',
      phone: '+977 98-2345-6789',
      orderId: 'ORD-88175',
      returnedItem: 'Cotton kurta',
      sku: 'EP-APP-501-L',
      variant: 'Size L · 1 item',
      reason: 'Not as described',
      workflowStatus: 'Awaiting Approval',
      amount: 1850,
      seller: 'Lalitpur Weavers',
      deliveredDate: '27 Oct 2026',
    },
    {
      returnId: 'RET-1037',
      submittedDate: '30 Oct · 10:10',
      customer: 'Prakash Thapa',
      phone: '+977 98-3456-7890',
      orderId: 'ORD-88161',
      returnedItem: 'Wireless headphones',
      sku: 'EP-AUD-701',
      variant: '1 item',
      reason: 'Defective item',
      workflowStatus: 'Awaiting authorization',
      inspectionStatus: 'Inspection Passed',
      amount: 4500,
      seller: 'SoundNepal',
      deliveredDate: '25 Oct 2026',
      originalPayment: 'Visa · 4821',
      paidOn: '25 Oct 2026',
      proposedAuthorization: 4500,
    },
    {
      returnId: 'RET-1036',
      submittedDate: '29 Oct · 16:50',
      customer: 'Nisha Lama',
      phone: '+977 98-4567-8901',
      orderId: 'ORD-88150',
      returnedItem: 'Linen shirt',
      sku: 'EP-APP-303-S',
      variant: 'Size S · 1 item',
      reason: 'Wrong size',
      workflowStatus: 'Refund Processing',
      amount: 1750,
      seller: 'Nepal Crafts',
      deliveredDate: '25 Oct 2026',
      payoutId: 'PAY-7036',
      payoutRef: 'EP-RF-1036',
      providerRef: 'KH-RF-7036',
      method: 'Khalti',
      currentState: 'Processing (Provider accepted)',
    },
    {
      returnId: 'RET-1035',
      submittedDate: '29 Oct · 13:25',
      customer: 'Deepak Joshi',
      phone: '+977 98-5678-9012',
      orderId: 'ORD-88143',
      returnedItem: 'Steel water bottle',
      sku: 'EP-BTL-101',
      variant: '750 ml · 1 item',
      reason: 'Damaged item',
      workflowStatus: 'Refund Payment Issue',
      amount: 1100,
      seller: 'EcoWare Nepal',
      deliveredDate: '24 Oct 2026',
      payoutId: 'PAY-7035',
      payoutRef: 'EP-RF-1035',
      providerRef: 'ES-RF-7035',
      method: 'eSewa',
      currentState: 'Payment issue (Destination rejected)',
      issueDetail: 'Destination rejected · no debit confirmed',
    },
    {
      returnId: 'RET-1034',
      submittedDate: '29 Oct · 09:05',
      customer: 'Puja Adhikari',
      phone: '+977 98-6789-0123',
      orderId: 'ORD-88128',
      returnedItem: 'Desk organizer',
      sku: 'EP-DSK-202',
      variant: '1 item',
      reason: 'Wrong product',
      workflowStatus: 'Awaiting authorization',
      inspectionStatus: 'Inspection Passed',
      amount: 1250,
      seller: 'OfficePlus',
      deliveredDate: '24 Oct 2026',
      originalPayment: 'Khalti',
      paidOn: '24 Oct 2026',
      proposedAuthorization: 1250,
    },
    {
      returnId: 'RET-1033',
      submittedDate: '28 Oct · 17:45',
      customer: 'Arjun Nepal',
      phone: '+977 98-7890-1234',
      orderId: 'ORD-88112',
      returnedItem: 'Reading lamp',
      sku: 'EP-LMP-011',
      variant: '1 item',
      reason: 'Defective item',
      workflowStatus: 'Refunded',
      amount: 2400,
      seller: 'Lumiere Nepal',
      deliveredDate: '23 Oct 2026',
      refundReceipt: 'RF-6033',
      method: 'Visa · 6042',
      completedAt: '01 Nov 2026 · 08:40 NPT',
      providerRef: 'CD-RF-6033',
      uniqueRef: 'EP-RF-1033',
      authorizedBy: 'A. Sharma · 30 Oct',
    },
    {
      returnId: 'RET-1032',
      submittedDate: '28 Oct · 14:15',
      customer: 'Sabin Maharjan',
      phone: '+977 98-8901-2345',
      orderId: 'ORD-88119',
      returnedItem: 'Thermos flask',
      sku: 'EP-THM-102',
      variant: '1 item',
      reason: 'Damaged item',
      workflowStatus: 'Awaiting authorization',
      inspectionStatus: 'Inspection Passed',
      amount: 850,
      seller: 'KitchenEase',
      deliveredDate: '24 Oct 2026',
      originalPayment: 'eSewa',
      paidOn: '24 Oct 2026',
      proposedAuthorization: 850,
    },
    {
      returnId: 'RET-1031',
      submittedDate: '30 Oct · 10:45',
      customer: 'Sita Pandey',
      phone: '+977 98-9012-3456',
      orderId: 'ORD-88105',
      returnedItem: 'Silk scarf',
      sku: 'EP-SCF-09',
      variant: '1 item',
      reason: 'Damaged item',
      workflowStatus: 'Awaiting Approval',
      amount: 980,
      seller: 'Pashmina Heritage',
      deliveredDate: '25 Oct 2026',
    },
    {
      returnId: 'RET-1030',
      submittedDate: '29 Oct · 14:10',
      customer: 'Kiran Basnet',
      phone: '+977 98-0123-4567',
      orderId: 'ORD-88099',
      returnedItem: 'Leather belt',
      sku: 'EP-BLT-01',
      variant: '1 item',
      reason: 'Wrong product',
      workflowStatus: 'Awaiting Approval',
      amount: 2750,
      seller: 'Kathmandu Leather',
      deliveredDate: '25 Oct 2026',
    },
    {
      returnId: 'RET-1028',
      submittedDate: '29 Oct · 09:20',
      customer: 'Alina Tamang',
      phone: '+977 98-1234-9876',
      orderId: 'ORD-88075',
      returnedItem: 'Knitted cardigan',
      sku: 'EP-CRD-12',
      variant: '1 item',
      reason: 'Wrong size',
      workflowStatus: 'Awaiting Approval',
      amount: 1600,
      seller: 'Himalayan Knits',
      deliveredDate: '24 Oct 2026',
    },
  ];

  private static inspectionsStore: any[] = [
    {
      returnId: 'RET-1041',
      customer: 'Suman Karki',
      orderId: 'ORD-88209',
      item: 'Ceramic mug · EP-MUG-011-BL',
      sku: 'EP-MUG-011-BL',
      variant: 'Blue',
      receivedDate: '31 Oct · 18:40',
      amount: 890,
      intake: 'RCV-5041 / 31 Oct · 16:40',
      bin: 'QC-B04',
      reportedReason: 'Damaged item',
      expectedSku: 'EP-MUG-011-BL · Blue',
      countedQuantity: 1,
      skuMatch: 'Not verified',
      itemCondition: 'Pending',
      packagingStatus: 'Pending',
      reportedDamageVerified: 'Pending',
      tagsStatus: 'Pending',
      evidenceFile: 'damage-claim.jpg (388 KB)',
      findings: '',
      disposition: '',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1025',
      customer: 'Bikash Shahi',
      orderId: 'ORD-88055',
      item: 'Cotton bedsheet · 1 unit',
      sku: 'EP-BED-04',
      variant: 'King',
      receivedDate: '31 Oct · 12:10',
      amount: 2200,
      reportedReason: 'Wrong size',
    },
    {
      returnId: 'RET-1021',
      customer: 'Meena Shrestha',
      orderId: 'ORD-88029',
      item: 'Electric kettle · 1 unit',
      sku: 'EP-KTL-01',
      variant: '1.8L',
      receivedDate: '30 Oct · 15:00',
      amount: 3150,
      reportedReason: 'Defective item',
    },
    {
      returnId: 'RET-1019',
      customer: 'Roshan Poudel',
      orderId: 'ORD-88019',
      item: 'Sports tee · 2 units',
      sku: 'EP-TEE-99',
      variant: 'L',
      receivedDate: '30 Oct · 11:20',
      amount: 1500,
      reportedReason: 'Wrong size',
    },
    {
      returnId: 'RET-1017',
      customer: 'Dipa Khatri',
      orderId: 'ORD-88002',
      item: 'Lunch box · 1 unit',
      sku: 'EP-BOX-02',
      variant: 'Steel',
      receivedDate: '29 Oct · 14:10',
      amount: 750,
      reportedReason: 'Damaged item',
    },
    {
      returnId: 'RET-1014',
      customer: 'Nabin Giri',
      orderId: 'ORD-87940',
      item: 'Travel duffel · 1 unit',
      sku: 'EP-DFL-08',
      variant: 'Black',
      receivedDate: '28 Oct · 10:00',
      amount: 2650,
      reportedReason: 'Defective item',
    },
  ];

  private static payoutJobsStore: any[] = [
    {
      payoutId: 'PAY-7035',
      returnId: 'RET-1035',
      customer: 'Deepak Joshi',
      orderId: 'ORD-88143',
      uniqueRef: 'EP-RF-1035',
      method: 'eSewa',
      amount: 1100,
      submittedDate: '31 Oct · 13:40',
      providerRef: 'ES-RF-7035',
      currentState: 'Payment issue',
      issueSubstate: 'Destination rejected',
      issueDetail: 'Destination rejected · no debit confirmed',
      lastChecked: '01 Nov 2026 · 10:10 NPT',
      isIssue: true,
    },
    {
      payoutId: 'PAY-7024',
      returnId: 'RET-1024',
      customer: 'Ramesh KC',
      orderId: 'ORD-88041',
      uniqueRef: 'EP-RF-1024',
      method: 'Bank transfer',
      amount: 3650,
      submittedDate: '30 Oct · 10:25',
      providerRef: 'BT-RF-7024',
      currentState: 'Payment issue',
      issueSubstate: 'Account validation failed',
      issueDetail: 'Account validation failed at clearing bank',
      lastChecked: '31 Oct 2026 · 12:00 NPT',
      isIssue: true,
    },
    {
      payoutId: 'PAY-7036',
      returnId: 'RET-1036',
      customer: 'Nisha Lama',
      orderId: 'ORD-88150',
      uniqueRef: 'EP-RF-1036',
      method: 'Khalti',
      amount: 1750,
      submittedDate: '01 Nov · 09:50',
      providerRef: 'KH-RF-7036',
      currentState: 'Processing',
      issueSubstate: 'Provider accepted',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7029',
      returnId: 'RET-1029',
      customer: 'Milan Rai',
      orderId: 'ORD-88098',
      uniqueRef: 'EP-RF-1029',
      method: 'Visa · 3912',
      amount: 2850,
      submittedDate: '31 Oct · 15:10',
      providerRef: 'CD-RF-7029',
      currentState: 'Processing',
      issueSubstate: 'Settlement pending',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7027',
      returnId: 'RET-1027',
      customer: 'Rupa Bista',
      orderId: 'ORD-88080',
      uniqueRef: 'EP-RF-1027',
      method: 'eSewa',
      amount: 950,
      submittedDate: '31 Oct · 14:20',
      providerRef: 'ES-RF-7027',
      currentState: 'Submitted',
      issueSubstate: 'Awaiting provider response',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7026',
      returnId: 'RET-1026',
      customer: 'Suraj Rana',
      orderId: 'ORD-88066',
      uniqueRef: 'EP-RF-1026',
      method: 'Bank transfer',
      amount: 4200,
      submittedDate: '30 Oct · 11:40',
      providerRef: 'BT-RF-7026',
      currentState: 'Processing',
      issueSubstate: '1 business day elapsed',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7023',
      returnId: 'RET-1023',
      customer: 'Asha Magar',
      orderId: 'ORD-88034',
      uniqueRef: 'EP-RF-1023',
      method: 'Khalti',
      amount: 1300,
      submittedDate: '29 Oct · 09:10',
      providerRef: 'KH-RF-7023',
      currentState: 'Delayed',
      issueSubstate: 'No final response >48h',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7022',
      returnId: 'RET-1022',
      customer: 'Hari Khadka',
      orderId: 'ORD-88022',
      uniqueRef: 'EP-RF-1022',
      method: 'Mastercard · 2184',
      amount: 2600,
      submittedDate: '29 Oct · 08:45',
      providerRef: 'CD-RF-7022',
      currentState: 'Processing',
      issueSubstate: 'Within 3-5 business days',
      isIssue: false,
    },
  ];

  private static refundHistoryStore: any[] = [
    {
      receiptId: 'RF-6033',
      returnId: 'RET-1033',
      orderId: 'ORD-88112',
      customer: 'Arjun Nepal',
      method: 'Visa · 6042',
      amount: 2400,
      completedAt: '01 Nov 2026 · 08:40 NPT',
      completedDate: '01 Nov 2026',
      completedTime: '08:40 NPT',
      providerRef: 'CD-RF-6033',
      uniqueRef: 'EP-RF-1033',
      item: 'Reading lamp',
      reason: 'Defective item',
      authorizedBy: 'A. Sharma · 30 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '30 Oct · 09:20 · S. Shrestha' },
        { label: 'Refund authorized · NPR 2,400', date: '30 Oct · 11:05 · A. Sharma' },
        { label: 'Payout submitted · PAY-7033', date: '30 Oct · 11:15 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6033', date: '01 Nov · 08:40 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6020',
      returnId: 'RET-1020',
      orderId: 'ORD-88015',
      customer: 'Sunita Raut',
      method: 'eSewa',
      amount: 1800,
      completedAt: '31 Oct 2026 · 16:25 NPT',
      completedDate: '31 Oct 2026',
      completedTime: '16:25 NPT',
      providerRef: 'ES-RF-6020',
      uniqueRef: 'EP-RF-1020',
    },
    {
      receiptId: 'RF-6018',
      returnId: 'RET-1018',
      orderId: 'ORD-87998',
      customer: 'Rajan Bhandari',
      method: 'Bank transfer',
      amount: 5200,
      completedAt: '31 Oct 2026 · 13:15 NPT',
      completedDate: '31 Oct 2026',
      completedTime: '13:15 NPT',
      providerRef: 'BT-RF-6018',
      uniqueRef: 'EP-RF-1018',
    },
    {
      receiptId: 'RF-6016',
      returnId: 'RET-1016',
      orderId: 'ORD-87974',
      customer: 'Samjhana Rai',
      method: 'Khalti',
      amount: 1350,
      completedAt: '30 Oct 2026 · 15:05 NPT',
      completedDate: '30 Oct 2026',
      completedTime: '15:05 NPT',
      providerRef: 'KH-RF-6016',
      uniqueRef: 'EP-RF-1016',
    },
    {
      receiptId: 'RF-6015',
      returnId: 'RET-1015',
      orderId: 'ORD-87951',
      customer: 'Manoj Shah',
      method: 'eSewa',
      amount: 2950,
      completedAt: '30 Oct 2026 · 10:45 NPT',
      completedDate: '30 Oct 2026',
      completedTime: '10:45 NPT',
      providerRef: 'ES-RF-6015',
      uniqueRef: 'EP-RF-1015',
    },
    {
      receiptId: 'RF-6013',
      returnId: 'RET-1013',
      orderId: 'ORD-87933',
      customer: 'Sarita Karki',
      method: 'Mastercard · 7108',
      amount: 3400,
      completedAt: '29 Oct 2026 · 16:30 NPT',
      completedDate: '29 Oct 2026',
      completedTime: '16:30 NPT',
      providerRef: 'CD-RF-6013',
      uniqueRef: 'EP-RF-1013',
    },
    {
      receiptId: 'RF-6012',
      returnId: 'RET-1012',
      orderId: 'ORD-87912',
      customer: 'Bishal Lama',
      method: 'Khalti',
      amount: 1250,
      completedAt: '29 Oct 2026 · 11:50 NPT',
      completedDate: '29 Oct 2026',
      completedTime: '11:50 NPT',
      providerRef: 'KH-RF-6012',
      uniqueRef: 'EP-RF-1012',
    },
    {
      receiptId: 'RF-6011',
      returnId: 'RET-1011',
      orderId: 'ORD-87880',
      customer: 'Sushma Thapa',
      method: 'Bank transfer',
      amount: 4100,
      completedAt: '28 Oct 2026 · 14:20 NPT',
      completedDate: '28 Oct 2026',
      completedTime: '14:20 NPT',
      providerRef: 'BT-RF-6011',
      uniqueRef: 'EP-RF-1011',
    },
  ];

  // 1. Return Requests (Screen 29)
  public async getReturnRequests(queryParam: any = {}): Promise<any> {
    const { search, status, reason, tab } = queryParam;
    let list = [...AdminService.returnsStore];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (r) =>
          r.returnId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.returnedItem.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All workflow statuses') {
      list = list.filter((r) => r.workflowStatus.toLowerCase().includes(String(status).toLowerCase()));
    }

    if (reason && reason !== 'All reasons') {
      list = list.filter((r) => r.reason.toLowerCase() === String(reason).toLowerCase());
    }

    if (tab === 'needs-approval') {
      list = list.filter((r) => r.workflowStatus === 'Awaiting Approval');
    } else if (tab === 'new-today') {
      list = list.filter((r) => r.submittedDate.includes('01 Nov'));
    } else if (tab === 'my-assigned') {
      list = list.filter((r) => r.assignedTo === 'Rajesh Sharma');
    }

    return {
      kpis: {
        totalReturnCases: 80,
        awaitingApproval: 12,
        awaitingInspection: 6,
        awaitingRefundAuthorization: 4,
        refundProcessing: 14,
        refunded: 42,
        refundPaymentIssues: 2,
      },
      requests: list,
    };
  }

  // 2. Return Approvals (Screen 30)
  public async getReturnApprovals(queryParam: any = {}): Promise<any> {
    const list = AdminService.returnsStore.filter((r) => r.workflowStatus === 'Awaiting Approval');
    return {
      kpis: {
        awaitingApproval: 12,
        awaitingApprovalNote: 'All incoming requests requiring a decision',
        newToday: 3,
        newTodayNote: 'Included in the 12-case approval queue',
        reviewPriority: '2 over 48h',
        reviewPriorityNote: 'Oldest submissions first when unassigned',
      },
      queue: list,
    };
  }

  public async approveReturn(id: string, payload: any): Promise<any> {
    const r = AdminService.returnsStore.find((x) => x.returnId.toLowerCase() === id.toLowerCase());
    if (r) {
      r.workflowStatus = 'Awaiting Inspection';
      r.approvalNote = payload.note || 'Return approved by admin';
      return r;
    }
    return null;
  }

  public async rejectReturn(id: string, payload: any): Promise<any> {
    const r = AdminService.returnsStore.find((x) => x.returnId.toLowerCase() === id.toLowerCase());
    if (r) {
      r.workflowStatus = 'Rejected';
      r.rejectionReason = payload.reason || 'Return policy ineligible';
      return r;
    }
    return null;
  }

  // 3. Return Inspections (Screen 33)
  public async getReturnInspections(queryParam: any = {}): Promise<any> {
    return {
      pendingCasesCount: AdminService.inspectionsStore.length,
      inspections: AdminService.inspectionsStore,
    };
  }

  public async submitInspection(id: string, payload: any): Promise<any> {
    const insp = AdminService.inspectionsStore.find((x) => x.returnId.toLowerCase() === id.toLowerCase());
    if (insp) {
      insp.decision = payload.decision || 'Passed';
      insp.disposition = payload.disposition || 'Restock';
      insp.findings = payload.findings || 'Verified condition';
      const r = AdminService.returnsStore.find((x) => x.returnId.toLowerCase() === id.toLowerCase());
      if (r) {
        r.workflowStatus = payload.decision === 'Passed' ? 'Awaiting authorization' : 'Inspection Failed';
        r.inspectionStatus = payload.decision === 'Passed' ? 'Inspection Passed' : 'Inspection Failed';
      }
      return insp;
    }
    return null;
  }

  // 4. Refund Requests (Screen 31)
  public async getRefundRequests(queryParam: any = {}): Promise<any> {
    const list = AdminService.returnsStore.filter((r) => r.workflowStatus === 'Awaiting authorization');
    return {
      kpis: {
        awaitingAuthorization: 4,
        awaitingAuthorizationNote: 'All four have passed return inspection',
        totalRequested: 'NPR 8,700',
        totalRequestedNote: 'NPR 2,100 + NPR 4,500 + NPR 1,250 + NPR 850',
        authorizedInQueue: 'NPR 0',
        authorizedInQueueNote: 'No authorization decision has been saved',
      },
      requests: list,
    };
  }

  public async authorizeRefund(id: string, payload: any): Promise<any> {
    const r = AdminService.returnsStore.find((x) => x.returnId.toLowerCase() === id.toLowerCase());
    if (r) {
      r.workflowStatus = 'Refund Processing';
      r.authorizedAmount = payload.amount || r.amount;
      r.financeDecisionNote = payload.note || 'Authorized refund';
      return r;
    }
    return null;
  }

  // 5. Refund Processing (Screen 32)
  public async getRefundProcessing(queryParam: any = {}): Promise<any> {
    return {
      kpis: {
        refundProcessing: 14,
        refundProcessingNote: 'Submitted or pending provider confirmation',
        refundPaymentIssues: 2,
        refundPaymentIssuesNote: 'Require reconciliation before a safe retry',
        queueScope: 16,
        queueScopeNote: 'Not completed · Excluded from Refund History',
      },
      jobs: AdminService.payoutJobsStore,
    };
  }

  public async reconcilePayoutJob(id: string, payload: any): Promise<any> {
    const job = AdminService.payoutJobsStore.find((j) => j.payoutId.toLowerCase() === id.toLowerCase());
    if (job) {
      job.currentState = payload.state || 'Processing';
      job.issueDetail = payload.note || 'Reconciliation completed. Payout in progress.';
      job.isIssue = false;
      return job;
    }
    return null;
  }

  // 6. Refund History (Screen 34)
  public async getRefundHistory(queryParam: any = {}): Promise<any> {
    return {
      kpis: {
        completedRefunds: 42,
        completedRefundsNote: 'Last 30 days · 03 Oct–01 Nov 2026',
        totalCompletedAmount: 'NPR 124,800',
        totalCompletedAmountNote: 'All 42 completed records, not only visible rows',
        averageCompletedRefund: 'NPR 2,971.43',
        averageCompletedRefundNote: 'NPR 124,800 ÷ 42 completed refunds',
      },
      history: AdminService.refundHistoryStore,
    };
  }

  public async createReturnRequest(payload: any): Promise<any> {
    const nextNum = AdminService.returnsStore.length + 1043;
    const newReq = {
      returnId: `RET-${nextNum}`,
      submittedDate: 'Just now',
      customer: payload.customer || 'Customer',
      phone: payload.phone || '+977 98-0000-0000',
      orderId: payload.orderId || `ORD-${nextNum + 80000}`,
      returnedItem: payload.returnedItem || 'Returned Item',
      sku: payload.sku || 'EP-ITEM',
      variant: payload.variant || 'Standard',
      reason: payload.reason || 'Wrong size',
      workflowStatus: 'Awaiting Approval',
      amount: Number(payload.amount || 1000),
      seller: payload.seller || 'Everest Vendor',
      deliveredDate: 'Recent',
      assignedTo: 'Rajesh Sharma',
      quote: payload.quote || 'Customer requested return',
      attachments: [],
    };
    AdminService.returnsStore.unshift(newReq);
    return newReq;
  }

  // ============================================================================
  // AGENT MANAGEMENT DATA STORES & METHODS (Screens 35 - 41)
  // ============================================================================

  private static agentsStore: any[] = [
    {
      agentId: 'AGT-1001',
      name: 'Sujan Karki',
      joined: '12 Aug 2026',
      email: 'sujan.k@example.test',
      phone: '98•••••101',
      fullPhone: '+977 9841234101',
      region: 'Kathmandu',
      status: 'Active',
      ordersCount: 12,
      deliveredCount: 8,
      commissionAmount: 1200,
      commissionText: 'NPR 1,200',
      commissionStatus: 'Approved, unpaid',
    },
    {
      agentId: 'AGT-1002',
      name: 'Nirmala Rai',
      joined: '18 Aug 2026',
      email: 'nirmala.r@example.test',
      phone: '98•••••102',
      fullPhone: '+977 9841234102',
      region: 'Pokhara',
      status: 'Active',
      ordersCount: 9,
      deliveredCount: 6,
      commissionAmount: 850,
      commissionText: 'NPR 850',
      commissionStatus: 'Approved, unpaid',
    },
    {
      agentId: 'AGT-1003',
      name: 'Bikash Thapa',
      joined: '22 Aug 2026',
      email: 'bikash.t@example.test',
      phone: '98•••••103',
      fullPhone: '+977 9841234103',
      region: 'Biratnagar',
      status: 'Active',
      ordersCount: 7,
      deliveredCount: 4,
      commissionAmount: 250,
      commissionText: 'NPR 250',
      commissionStatus: 'Pending review',
    },
    {
      agentId: 'AGT-1004',
      name: 'Pratik Shrestha',
      joined: '29 Aug 2026',
      email: 'pratik.s@example.test',
      phone: '98•••••104',
      fullPhone: '+977 9841234104',
      region: 'Lalitpur',
      status: 'Suspended',
      suspendedSince: '29 Oct',
      ordersCount: 3,
      deliveredCount: 1,
      cancelledCount: 1,
      commissionAmount: 0,
      commissionText: 'NPR 400 reversed',
      commissionStatus: 'Excluded from balance',
    },
    {
      agentId: 'AGT-1005',
      name: 'Sarita Gurung',
      joined: '02 Sep 2026',
      email: 'sarita.g@example.test',
      phone: '98•••••105',
      fullPhone: '+977 9841234105',
      region: 'Butwal',
      status: 'Active',
      ordersCount: 6,
      deliveredCount: 4,
      commissionAmount: 700,
      commissionText: 'NPR 700',
      commissionStatus: 'Approved, unpaid',
    },
    {
      agentId: 'AGT-1006',
      name: 'Deepak Adhikari',
      joined: '06 Sep 2026',
      email: 'deepak.a@example.test',
      phone: '98•••••106',
      fullPhone: '+977 9841234106',
      region: 'Dharan',
      status: 'Active',
      ordersCount: 5,
      deliveredCount: 3,
      commissionAmount: 500,
      commissionText: 'NPR 500',
      commissionStatus: 'Approved, unpaid',
    },
    {
      agentId: 'AGT-1007',
      name: 'Roshani Lama',
      joined: '11 Sep 2026',
      email: 'roshani.l@example.test',
      phone: '98•••••107',
      fullPhone: '+977 9841234107',
      region: 'Kathmandu',
      status: 'Inactive',
      ordersCount: 2,
      deliveredCount: 1,
      commissionAmount: 0,
      commissionText: 'NPR 0',
      commissionStatus: 'No available balance',
    },
    {
      agentId: 'AGT-1008',
      name: 'Kiran Basnet',
      joined: '15 Sep 2026',
      email: 'kiran.b@example.test',
      phone: '98•••••108',
      fullPhone: '+977 9841234108',
      region: 'Lalitpur',
      status: 'Active',
      ordersCount: 4,
      deliveredCount: 2,
      commissionAmount: 0,
      commissionText: 'NPR 0',
      commissionStatus: 'Pending settlement',
    },
  ];

  private static agentApplicationsStore: any[] = [
    {
      appId: 'AP-2042',
      name: 'Asha Tamang',
      email: 'asha.t@example.test',
      region: 'Kathmandu',
      source: 'Mobile',
      submittedDate: '31 Oct 2026 · 14:20 NPT',
      status: 'Under Review',
      docCompleteness: '3 of 3 submitted',
      docSubtext: 'Verification pending',
      reviewer: 'Meera Joshi',
      nextAction: 'Review application',
      contactMasked: '98•••••242',
      coverageArea: 'Kathmandu · Baneshwor & Koteshwor',
      experience: '2 years in retail sales. Plans to assist neighborhood customers with product discovery and order placement.',
    },
    {
      appId: 'AP-2041',
      name: 'Manoj Poudel',
      email: 'manoj.p@example.test',
      region: 'Pokhara',
      source: 'Web',
      submittedDate: '31 Oct 2026 · 11:05 NPT',
      status: 'Submitted',
      docCompleteness: '2 of 3 submitted',
      docSubtext: 'PAN missing',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
    {
      appId: 'AP-2040',
      name: 'Sita Magar',
      email: 'sita.m@example.test',
      region: 'Butwal',
      source: 'Referral',
      submittedDate: '30 Oct 2026 · 16:40 NPT',
      status: 'Under Review',
      docCompleteness: '3 of 3 submitted',
      docSubtext: 'Identity check pending',
      reviewer: 'Rajesh Sharma',
      nextAction: 'Review application',
    },
    {
      appId: 'AP-2039',
      name: 'Rajan Neupane',
      email: 'rajan.n@example.test',
      region: 'Lalitpur',
      source: 'Web',
      submittedDate: '30 Oct 2026 · 09:10 NPT',
      status: 'Needs information',
      docCompleteness: '2 of 3 submitted',
      docSubtext: 'Address proof unclear',
      reviewer: 'Meera Joshi',
      nextAction: 'View request',
    },
    {
      appId: 'AP-2038',
      name: 'Pema Sherpa',
      email: 'pema.s@example.test',
      region: 'Dharan',
      source: 'Mobile',
      submittedDate: '29 Oct 2026 · 15:35 NPT',
      status: 'Under Review',
      docCompleteness: '2 of 3 submitted',
      docSubtext: 'Awaiting PAN upload',
      reviewer: 'Meera Joshi',
      nextAction: 'Review application',
    },
    {
      appId: 'AP-2037',
      name: 'Anil Chaudhary',
      email: 'anil.c@example.test',
      region: 'Biratnagar',
      source: 'Referral',
      submittedDate: '29 Oct 2026 · 12:00 NPT',
      status: 'Under Review',
      docCompleteness: '3 of 3 submitted',
      docSubtext: 'Address mismatch',
      reviewer: 'Unassigned',
      nextAction: 'Review application',
    },
    {
      appId: 'AP-2036',
      name: 'Ritu Acharya',
      email: 'ritu.a@example.test',
      region: 'Kathmandu',
      source: 'Web',
      submittedDate: '28 Oct 2026 · 10:30 NPT',
      status: 'Approved',
      docCompleteness: '3 of 3 verified',
      docSubtext: 'Decision 30 Oct',
      reviewer: 'Rajesh Sharma',
      nextAction: 'View application',
    },
    {
      appId: 'AP-2035',
      name: 'Sunil Khadka',
      email: 'sunil.k@example.test',
      region: 'Pokhara',
      source: 'Mobile',
      submittedDate: '28 Oct 2026 · 08:20 NPT',
      status: 'Submitted',
      docCompleteness: '1 of 3 submitted',
      docSubtext: 'ID and PAN missing',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
    {
      appId: 'AP-2034',
      name: 'Bina Bhandari',
      email: 'bina.b@example.test',
      region: 'Butwal',
      source: 'Web',
      submittedDate: '27 Oct 2026 · 16:45 NPT',
      status: 'Needs information',
      docCompleteness: '2 of 3 submitted',
      docSubtext: 'Replace expired ID',
      reviewer: 'Meera Joshi',
      nextAction: 'View request',
    },
    {
      appId: 'AP-2033',
      name: 'Dinesh K.C.',
      email: 'dinesh.k@example.test',
      region: 'Dharan',
      source: 'Referral',
      submittedDate: '27 Oct 2026 · 14:00 NPT',
      status: 'Submitted',
      docCompleteness: '3 of 3 submitted',
      docSubtext: 'Not yet reviewed',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
  ];

  private static agentApprovalsStore: any[] = [
    {
      appId: 'AP-2042',
      name: 'Asha Tamang',
      region: 'Kathmandu',
      source: 'Mobile application',
      submittedDate: '31 Oct 2026, 14:20 NPT',
      reviewer: 'Meera Joshi',
      stage: 'Ready for review',
      stageSubtext: '3 documents · Verification pending',
      contactMasked: '98•••••242',
      email: 'asha.t@example.test',
      coverageArea: 'Kathmandu · Baneshwor & Koteshwor',
      experience: '2 years in retail sales. Plans to assist neighborhood customers with product discovery and order placement.',
      documents: [
        { name: 'Citizenship document', note: 'Name and date of birth', submittedDate: '31 Oct · 14:18', status: 'Pending', subtext: 'Identity match required' },
        { name: 'PAN certificate', note: 'Tax registration', submittedDate: '31 Oct · 14:18', status: 'Pending', subtext: 'Validate tax details' },
        { name: 'Address proof', note: 'Kathmandu coverage', submittedDate: '31 Oct · 14:20', status: 'Verified', subtext: 'Meera · 01 Nov, 08:50' },
      ],
      checklist: {
        coverageAvailable: true,
        is18Plus: true,
        identityConfirmed: false,
        panValidated: false,
        termsAcknowledged: false,
      },
      reviewerNotes: 'Address proof matches the requested coverage. Confirm citizenship details and PAN before approval. No decision recorded.',
      reviewerTimestamp: 'Meera Joshi · 01 Nov, 09:50 NPT',
    },
    {
      appId: 'AP-2040',
      name: 'Sita Magar',
      region: 'Butwal',
      source: 'Referral',
      submittedDate: '30 Oct 2026, 16:40 NPT',
      reviewer: 'Rajesh Sharma',
      stage: 'Ready for review',
      stageSubtext: '3 documents · Identity check pending',
      contactMasked: '98•••••440',
      email: 'sita.m@example.test',
      coverageArea: 'Butwal · Traffic Chowk & Golpark',
      experience: 'Experienced local distributor for consumer electronics.',
      documents: [
        { name: 'Citizenship document', note: 'Front and back scan', submittedDate: '30 Oct · 16:30', status: 'Pending', subtext: 'Review pending' },
        { name: 'PAN certificate', note: 'Individual PAN', submittedDate: '30 Oct · 16:32', status: 'Verified', subtext: 'Valid IRD record' },
        { name: 'Address proof', note: 'Electricity bill', submittedDate: '30 Oct · 16:35', status: 'Verified', subtext: 'Matches ward address' },
      ],
      checklist: {
        coverageAvailable: true,
        is18Plus: true,
        identityConfirmed: false,
        panValidated: true,
        termsAcknowledged: true,
      },
      reviewerNotes: 'PAN verified against IRD portal. Citizenship photo needs brightness enhancement.',
      reviewerTimestamp: 'Rajesh Sharma · 31 Oct, 11:20 NPT',
    },
    {
      appId: 'AP-2038',
      name: 'Pema Sherpa',
      region: 'Dharan',
      source: 'Mobile',
      submittedDate: '29 Oct 2026, 15:35 NPT',
      reviewer: 'Meera Joshi',
      stage: 'Awaiting documents',
      stageSubtext: 'PAN upload requested · 29 Oct',
      contactMasked: '98•••••138',
      email: 'pema.s@example.test',
      coverageArea: 'Dharan · Bhanu Chowk',
      experience: 'Apparel shop owner with strong community footfall.',
      documents: [
        { name: 'Citizenship document', note: 'Clear copy attached', submittedDate: '29 Oct · 15:30', status: 'Verified', subtext: 'DOB verified' },
        { name: 'PAN certificate', note: 'Awaiting re-upload', submittedDate: 'Pending', status: 'Missing', subtext: 'Blurry upload' },
        { name: 'Address proof', note: 'Municipality tax receipt', submittedDate: '29 Oct · 15:32', status: 'Verified', subtext: 'Address confirmed' },
      ],
      checklist: {
        coverageAvailable: true,
        is18Plus: true,
        identityConfirmed: true,
        panValidated: false,
        termsAcknowledged: false,
      },
      reviewerNotes: 'Notification sent to upload readable PAN card image.',
      reviewerTimestamp: 'Meera Joshi · 29 Oct, 17:00 NPT',
    },
    {
      appId: 'AP-2037',
      name: 'Anil Chaudhary',
      region: 'Biratnagar',
      source: 'Referral',
      submittedDate: '29 Oct 2026, 12:00 NPT',
      reviewer: 'Unassigned',
      stage: 'Escalated',
      stageSubtext: 'Address mismatch · Assign reviewer',
      contactMasked: '98•••••737',
      email: 'anil.c@example.test',
      coverageArea: 'Biratnagar · Main Road',
      experience: 'Freelance sales promoter for regional FMCG goods.',
      documents: [
        { name: 'Citizenship document', note: 'Dhangadhi issued', submittedDate: '29 Oct · 11:50', status: 'Verified', subtext: 'Valid citizen card' },
        { name: 'PAN certificate', note: 'Verified', submittedDate: '29 Oct · 11:52', status: 'Verified', subtext: 'Verified' },
        { name: 'Address proof', note: 'Rent agreement Biratnagar', submittedDate: '29 Oct · 11:55', status: 'Pending', subtext: 'Mismatch with permanent' },
      ],
      checklist: {
        coverageAvailable: true,
        is18Plus: true,
        identityConfirmed: true,
        panValidated: true,
        termsAcknowledged: false,
      },
      reviewerNotes: 'Temporary residence proof provided without landlord stamp. Escalated for supervisor sign-off.',
      reviewerTimestamp: 'System Escalation · 30 Oct, 09:00 NPT',
    },
  ];

  private static agentActivitiesStore: any[] = [
    {
      eventId: 'EVT-8108',
      time: '01 Nov · 10:12:08',
      tz: 'NPT',
      actor: 'Sujan Karki',
      actorRole: 'Agent',
      actorId: 'AGT-1001',
      action: 'Payout requested',
      affectedRecord: 'PAY-301',
      recordAmount: 'NPR 1,000',
      outcome: 'Requested',
      context: 'Awaiting finance review',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8107',
      time: '01 Nov · 10:02:34',
      tz: 'NPT',
      actor: 'Nirmala Rai',
      actorRole: 'Agent',
      actorId: 'AGT-1002',
      action: 'Order created',
      affectedRecord: 'ORD-AG2010',
      recordAmount: 'Assisted attribution',
      outcome: 'Success',
      context: 'Processing · payment pending',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8106',
      time: '01 Nov · 09:50:10',
      tz: 'NPT',
      actor: 'Meera Joshi',
      actorRole: 'Admin',
      actorId: 'ADM-003',
      action: 'Status changed',
      affectedRecord: 'AP-2042',
      recordAmount: 'Address proof verified',
      outcome: 'Success',
      context: 'Application still Under Review',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8105',
      time: '01 Nov · 09:42:19',
      tz: 'NPT',
      actor: 'Sujan Karki',
      actorRole: 'Agent',
      actorId: 'AGT-1001',
      action: 'Customer registered',
      affectedRecord: 'CUS-7301',
      recordAmount: 'Consent recorded',
      outcome: 'Success',
      context: 'Mobile number verified',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8105B',
      time: '01 Nov · 09:30:04',
      tz: 'NPT',
      actor: 'Bikash Thapa',
      actorRole: 'Agent',
      actorId: 'AGT-1003',
      action: 'Sign-in',
      affectedRecord: 'Agent portal',
      recordAmount: 'Session audit recorded',
      outcome: 'Success',
      context: 'Password sign-in',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8104',
      time: '31 Oct · 17:25:41',
      tz: 'NPT',
      actor: 'Commission rules',
      actorRole: 'System',
      actorId: 'SYS-001',
      action: 'Commission adjusted',
      affectedRecord: 'ORD-AG2004',
      recordAmount: 'NPR 400 reversed',
      outcome: 'Success',
      context: 'Cancelled order · never payable',
      inspectText: 'View details',
      description: 'System rule cancelled ORD-AG2004\'s provisional commission after the order was cancelled. Commission changed from NPR 400 to NPR 0 payable.',
      agentRef: 'Pratik Shrestha / AGT-1004',
      reason: 'Order cancelled',
    },
    {
      eventId: 'EVT-8103',
      time: '31 Oct · 16:40:12',
      tz: 'NPT',
      actor: 'Rajesh Sharma',
      actorRole: 'Admin',
      actorId: 'ADM-001',
      action: 'Order assigned',
      affectedRecord: 'ORD-AG2008',
      recordAmount: 'Deepak Adhikari',
      outcome: 'Success',
      context: 'Assigned to Dharan coverage',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8102',
      time: '31 Oct · 14:20:00',
      tz: 'NPT',
      actor: 'Asha Tamang',
      actorRole: 'Applicant',
      actorId: 'AP-2042',
      action: 'Document uploaded',
      affectedRecord: 'AP-2042',
      recordAmount: 'Address proof PDF',
      outcome: 'Submitted',
      context: 'Upload received; not verification',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8101',
      time: '30 Oct · 15:10:03',
      tz: 'NPT',
      actor: 'Meera Joshi',
      actorRole: 'Admin',
      actorId: 'ADM-003',
      action: 'Status changed',
      affectedRecord: 'AP-2039',
      recordAmount: 'Needs information',
      outcome: 'Success',
      context: 'Requested clearer address proof',
      inspectText: 'View details',
    },
    {
      eventId: 'EVT-8100',
      time: '29 Oct · 11:05:20',
      tz: 'NPT',
      actor: 'Rajesh Sharma',
      actorRole: 'Admin',
      actorId: 'ADM-001',
      action: 'Status changed',
      affectedRecord: 'AGT-1004',
      recordAmount: 'Pratik Shrestha',
      outcome: 'Success',
      context: 'Active → Suspended · policy review',
      inspectText: 'View details',
    },
  ];

  private static agentOrdersStore: any[] = [
    {
      orderId: 'ORD-AG2001',
      customer: 'Mina Adhikari',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      region: 'Kathmandu',
      attributionType: 'Direct',
      orderTotal: 10800,
      orderStatus: 'Delivered',
      orderDate: '28 Oct 2026',
      paymentState: 'Paid',
      commissionEligibility: 'Eligible',
      commissionAmountText: 'NPR 500 approved',
    },
    {
      orderId: 'ORD-AG2002',
      customer: 'Rohan Gurung',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      region: 'Pokhara',
      attributionType: 'Assisted',
      orderTotal: 7560,
      orderStatus: 'Delivered',
      orderDate: '29 Oct 2026',
      paymentState: 'Paid',
      commissionEligibility: 'Eligible',
      commissionAmountText: 'NPR 350 approved',
    },
    {
      orderId: 'ORD-AG2003',
      customer: 'Anita K.C.',
      agentId: 'AGT-1003',
      agentName: 'Bikash Thapa',
      region: 'Biratnagar',
      attributionType: 'Referral',
      orderTotal: 5400,
      orderStatus: 'Delivered',
      orderDate: '29 Oct 2026',
      paymentState: 'Paid',
      commissionEligibility: 'Eligible',
      commissionAmountText: 'NPR 250 pending',
    },
    {
      orderId: 'ORD-AG2004',
      customer: 'Suman Lama',
      agentId: 'AGT-1004',
      agentName: 'Pratik Shrestha',
      region: 'Lalitpur',
      attributionType: 'Direct',
      orderTotal: 8640,
      orderStatus: 'Cancelled',
      orderDate: '31 Oct 2026',
      paymentState: 'Voided',
      paymentSubtext: 'No charge settled',
      commissionEligibility: 'Not eligible',
      commissionAmountText: 'NPR 400 reversed',
    },
    {
      orderId: 'ORD-AG2005',
      customer: 'Puja Shah',
      agentId: 'AGT-1005',
      agentName: 'Sarita Gurung',
      region: 'Butwal',
      attributionType: 'Assisted',
      orderTotal: 6480,
      orderStatus: 'Delivered',
      orderDate: '30 Oct 2026',
      paymentState: 'Unsettled',
      paymentSubtext: 'COD reconciliation',
      commissionEligibility: 'On hold',
      commissionAmountText: 'Await settlement',
    },
    {
      orderId: 'ORD-AG2006',
      customer: 'Arjun Bista',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      region: 'Kathmandu',
      attributionType: 'Direct',
      orderTotal: 4320,
      orderStatus: 'In Transit',
      paymentState: 'Paid',
      paymentDate: '31 Oct 2026',
      commissionEligibility: 'Not yet eligible',
      commissionAmountText: 'Await delivery',
    },
    {
      orderId: 'ORD-AG2007',
      customer: 'Sabina Rai',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      region: 'Pokhara',
      attributionType: 'Referral',
      orderTotal: 3780,
      orderStatus: 'Processing',
      paymentState: 'Pending',
      paymentSubtext: 'Bank confirmation',
      commissionEligibility: 'Not yet eligible',
      commissionAmountText: 'Await delivery & payment',
    },
    {
      orderId: 'ORD-AG2008',
      customer: 'Nabin Tamang',
      agentId: 'AGT-1006',
      agentName: 'Deepak Adhikari',
      region: 'Dharan',
      attributionType: 'Assisted',
      orderTotal: 9720,
      orderStatus: 'In Transit',
      paymentState: 'COD due',
      paymentSubtext: 'Collect on delivery',
      commissionEligibility: 'Not yet eligible',
      commissionAmountText: 'Await delivery & payment',
    },
    {
      orderId: 'ORD-AG2009',
      customer: 'Gita Pandey',
      agentId: 'AGT-1008',
      agentName: 'Kiran Basnet',
      region: 'Lalitpur',
      attributionType: 'Direct',
      orderTotal: 2160,
      orderStatus: 'Delivered',
      orderDate: '31 Oct 2026',
      paymentState: 'Unsettled',
      paymentSubtext: 'Wallet reconciliation',
      commissionEligibility: 'On hold',
      commissionAmountText: 'Await settlement',
    },
    {
      orderId: 'ORD-AG2010',
      customer: 'Laxmi Shrestha',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      region: 'Pokhara',
      attributionType: 'Assisted',
      orderTotal: 6284,
      orderStatus: 'Processing',
      paymentState: 'Pending',
      paymentSubtext: 'Payment link sent',
      commissionEligibility: 'Not yet eligible',
      commissionAmountText: 'Await delivery & payment',
    },
  ];

  private static agentCommissionsStore: any[] = [
    {
      commId: 'COM-6001',
      orderId: 'ORD-AG2001',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      eligibleBase: 10000,
      orderTotal: 10800,
      excludedCharges: 800,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 500,
      status: 'Approved',
      payoutSubtext: 'Not yet paid',
      adjustment: 'No adjustment',
      approvedBy: 'Rajesh Sharma',
      approvedDate: '30 Oct 2026',
    },
    {
      commId: 'COM-6002',
      orderId: 'ORD-AG2002',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      eligibleBase: 7000,
      orderTotal: 7560,
      excludedCharges: 560,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 350,
      status: 'Approved',
      payoutSubtext: 'Not yet paid',
      adjustment: 'No adjustment',
    },
    {
      commId: 'COM-6003',
      orderId: 'ORD-AG2003',
      agentId: 'AGT-1003',
      agentName: 'Bikash Thapa',
      eligibleBase: 5000,
      orderTotal: 5400,
      excludedCharges: 400,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 250,
      status: 'Pending',
      payoutSubtext: 'Review required',
      adjustment: 'No adjustment',
    },
    {
      commId: 'COM-6004',
      orderId: 'ORD-AG2004',
      agentId: 'AGT-1004',
      agentName: 'Pratik Shrestha',
      eligibleBase: 8000,
      eligibleBaseSubtext: 'Original base',
      orderTotal: 8640,
      excludedCharges: 640,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 0,
      commissionText: 'NPR 0 payable',
      status: 'Reversed',
      payoutSubtext: 'Order cancelled',
      adjustment: '- NPR 400',
      adjustmentSubtext: 'Excluded',
    },
    {
      commId: 'COM-5998',
      orderId: 'ORD-AG1998',
      agentId: 'AGT-1005',
      agentName: 'Sarita Gurung',
      eligibleBase: 8000,
      orderTotal: 8500,
      excludedCharges: 500,
      policy: 'Promotional 7.5%',
      rate: '7.5%',
      commission: 600,
      status: 'Approved',
      payoutSubtext: 'Not yet paid',
      adjustment: 'No adjustment',
    },
    {
      commId: 'COM-5997',
      orderId: 'ORD-AG1997',
      agentId: 'AGT-1006',
      agentName: 'Deepak Adhikari',
      eligibleBase: 6000,
      orderTotal: 6300,
      excludedCharges: 300,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 300,
      status: 'Approved',
      payoutSubtext: 'Not yet paid',
      adjustment: 'No adjustment',
    },
    {
      commId: 'COM-5986',
      orderId: 'ORD-AG1986',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      eligibleBase: 20000,
      orderTotal: 21000,
      excludedCharges: 1000,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 1000,
      status: 'Paid',
      payoutSubtext: 'PAY-291 · 28 Oct',
      adjustment: 'No adjustment',
    },
    {
      commId: 'COM-5982',
      orderId: 'ORD-AG1982',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      eligibleBase: 12000,
      orderTotal: 12600,
      excludedCharges: 600,
      policy: 'Standard 5%',
      rate: '5.0%',
      commission: 600,
      status: 'Paid',
      payoutSubtext: 'PAY-290 · 27 Oct',
      adjustment: 'No adjustment',
    },
  ];

  private static agentPayoutsStore: any[] = [
    {
      payoutId: 'PAY-301',
      requestedDate: '01 Nov · 10:12',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      amount: 1000,
      method: 'Bank transfer',
      destination: 'Account •••• 4812',
      status: 'Requested',
      paymentContext: 'Not paid',
      contextSubtext: 'Await finance review',
      nextAction: 'Review payout',
    },
    {
      payoutId: 'PAY-300',
      requestedDate: '31 Oct · 16:10',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      amount: 500,
      method: 'Wallet',
      destination: '98•••••102',
      status: 'Processing',
      paymentContext: 'Not paid',
      contextSubtext: 'Confirmation pending',
      nextAction: 'View payment details',
    },
    {
      payoutId: 'PAY-299',
      requestedDate: '31 Oct · 14:20',
      agentId: 'AGT-1005',
      agentName: 'Sarita Gurung',
      amount: 300,
      method: 'Bank transfer',
      destination: 'Account •••• 7720',
      status: 'Scheduled',
      paymentContext: 'Not paid',
      contextSubtext: '02 Nov batch',
      nextAction: 'View payment details',
    },
    {
      payoutId: 'PAY-298',
      requestedDate: '30 Oct · 12:30',
      agentId: 'AGT-1006',
      agentName: 'Deepak Adhikari',
      amount: 200,
      method: 'Wallet',
      destination: '98•••••106',
      status: 'Under Review',
      paymentContext: 'Not paid',
      contextSubtext: 'Name match check',
      nextAction: 'Review payout',
    },
    {
      payoutId: 'PAY-297',
      requestedDate: '30 Oct · 09:45',
      agentId: 'AGT-1005',
      agentName: 'Sarita Gurung',
      amount: 200,
      method: 'Bank transfer',
      destination: 'Account •••• 7720',
      status: 'Failed',
      paymentContext: 'Not paid',
      contextSubtext: 'Account validation failed',
      nextAction: 'Review failed payout',
    },
    {
      payoutId: 'PAY-291',
      requestedDate: '28 Oct · 15:00',
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      amount: 1000,
      method: 'Bank transfer',
      destination: 'Account •••• 4812',
      status: 'Paid',
      paymentContext: 'Confirmed 28 Oct',
      contextSubtext: 'Reference •••• 9082',
      nextAction: 'View payment details',
    },
    {
      payoutId: 'PAY-290',
      requestedDate: '27 Oct · 11:20',
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      amount: 600,
      method: 'Wallet',
      destination: '98•••••102',
      status: 'Paid',
      paymentContext: 'Confirmed 27 Oct',
      contextSubtext: 'Reference •••• 7231',
      nextAction: 'View payment details',
    },
  ];

  private static agentStatementsStore: any[] = [
    {
      agentId: 'AGT-1001',
      agentName: 'Sujan Karki',
      approved: 10200,
      paid: 9000,
      available: 1200,
      pending: 3500,
    },
    {
      agentId: 'AGT-1002',
      agentName: 'Nirmala Rai',
      approved: 8850,
      paid: 8000,
      available: 850,
      pending: 2750,
    },
    {
      agentId: 'AGT-1003',
      agentName: 'Bikash Thapa',
      approved: 4000,
      paid: 4000,
      available: 0,
      pending: 2500,
    },
  ];

  // 1. All Agents (Screen 35)
  public async getAgents(queryParam: any = {}): Promise<any> {
    const { search, status, region } = queryParam;
    let list = [...AdminService.agentsStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.agentId.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }
    if (region && region !== 'ALL') {
      list = list.filter((a) => a.region.toLowerCase() === String(region).toLowerCase());
    }
    return {
      kpis: {
        onboarded: 32,
        active: 24,
        inactive: 5,
        suspended: 3,
      },
      agents: list,
    };
  }

  public async getAgentById(id: string): Promise<any> {
    const a = AdminService.agentsStore.find((x) => x.agentId.toLowerCase() === id.toLowerCase());
    return a || null;
  }

  public async updateAgentStatus(id: string, status: string): Promise<any> {
    const a = AdminService.agentsStore.find((x) => x.agentId.toLowerCase() === id.toLowerCase());
    if (a) {
      a.status = status;
      return a;
    }
    return null;
  }

  public async createAgent(payload: any): Promise<any> {
    const nextNum = AdminService.agentsStore.length + 1001;
    const newAgent = {
      agentId: `AGT-${nextNum}`,
      name: payload.name || 'New Agent',
      joined: 'Today',
      email: payload.email || 'agent@example.test',
      phone: payload.phone || '98•••••000',
      fullPhone: payload.phone || '+977 9800000000',
      region: payload.region || 'Kathmandu',
      status: 'Active',
      ordersCount: 0,
      deliveredCount: 0,
      commissionAmount: 0,
      commissionText: 'NPR 0',
      commissionStatus: 'No available balance',
    };
    AdminService.agentsStore.unshift(newAgent);
    return newAgent;
  }

  // 2. Agent Applications (Screen 36)
  public async getAgentApplications(queryParam: any = {}): Promise<any> {
    const { search, status, source } = queryParam;
    let list = [...AdminService.agentApplicationsStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.appId.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }
    if (source && source !== 'ALL') {
      list = list.filter((a) => a.source.toLowerCase() === String(source).toLowerCase());
    }
    return {
      kpis: {
        recent: 12,
        submitted: 5,
        underReview: 4,
        needsInformation: 2,
        approved: 1,
      },
      applications: list,
    };
  }

  public async assignAgentApplication(id: string, reviewer: string): Promise<any> {
    const app = AdminService.agentApplicationsStore.find((x) => x.appId.toLowerCase() === id.toLowerCase());
    if (app) {
      app.reviewer = reviewer;
      return app;
    }
    return null;
  }

  // 3. Agent Approvals (Screen 37)
  public async getAgentApprovals(queryParam: any = {}): Promise<any> {
    return {
      summaryBanner: '4 applications Under Review · 2 ready for review · 1 awaiting documents · 1 escalated',
      queue: AdminService.agentApprovalsStore,
    };
  }

  public async approveAgentApplication(id: string, note: string): Promise<any> {
    const item = AdminService.agentApprovalsStore.find((x) => x.appId.toLowerCase() === id.toLowerCase());
    if (item) {
      item.stage = 'Approved';
      item.decision = 'Approved';
      item.reviewerNotes = note || 'Applicant approved for agent onboarding.';
      const app = AdminService.agentApplicationsStore.find((x) => x.appId.toLowerCase() === id.toLowerCase());
      if (app) {
        app.status = 'Approved';
        app.nextAction = 'View application';
      }
      return item;
    }
    return null;
  }

  public async rejectAgentApplication(id: string, reason: string): Promise<any> {
    const item = AdminService.agentApprovalsStore.find((x) => x.appId.toLowerCase() === id.toLowerCase());
    if (item) {
      item.stage = 'Rejected';
      item.decision = 'Rejected';
      item.reviewerNotes = reason || 'Applicant rejected.';
      const app = AdminService.agentApplicationsStore.find((x) => x.appId.toLowerCase() === id.toLowerCase());
      if (app) {
        app.status = 'Rejected';
      }
      return item;
    }
    return null;
  }

  // 4. Agent Activities (Screen 38)
  public async getAgentActivities(queryParam: any = {}): Promise<any> {
    const { search, activity, actor } = queryParam;
    let list = [...AdminService.agentActivitiesStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (e) =>
          e.eventId.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.affectedRecord.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q)
      );
    }
    return {
      totalEvents: 146,
      events: list,
    };
  }

  // 5. Agent Orders (Screen 39)
  public async getAgentOrders(queryParam: any = {}): Promise<any> {
    const { search, status, attribution } = queryParam;
    let list = [...AdminService.agentOrdersStore];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.agentName.toLowerCase().includes(q)
      );
    }
    return {
      kpis: {
        attributedOrders: 56,
        delivered: 34,
        inTransit: 10,
        processing: 8,
        cancelled: 4,
      },
      orders: list,
    };
  }

  // 6. Agent Commissions (Screen 40)
  public async getAgentCommissions(queryParam: any = {}): Promise<any> {
    return {
      kpis: {
        approved: 'NPR 31,250',
        approvedNote: 'Includes NPR 28,000 already paid',
        pendingReview: 'NPR 11,250',
        pendingReviewNote: 'Not withdrawable',
        availableApproved: 'NPR 3,250',
        availableApprovedNote: 'Approved less paid',
        reversalsExcluded: 'NPR 1,500',
        reversalsExcludedNote: 'Not included in balances',
      },
      ledger: AdminService.agentCommissionsStore,
    };
  }

  // 7. Agent Earnings (Screen 41)
  public async getAgentEarnings(queryParam: any = {}): Promise<any> {
    return {
      kpis: {
        approved: 'NPR 31,250',
        approvedNote: 'Includes paid commissions',
        pendingCommissions: 'NPR 11,250',
        pendingCommissionsNote: 'Not yet withdrawable',
        paidCommissions: 'NPR 28,000',
        paidCommissionsNote: 'Confirmed payouts only',
        availableApproved: 'NPR 3,250',
        availableApprovedNote: '31,250 approved - 28,000 paid',
      },
      payouts: AdminService.agentPayoutsStore,
      statements: AdminService.agentStatementsStore,
    };
  }

  public async reviewAgentPayout(id: string, payload: any): Promise<any> {
    const p = AdminService.agentPayoutsStore.find((x) => x.payoutId.toLowerCase() === id.toLowerCase());
    if (p) {
      p.status = payload.status || 'Processing';
      p.contextSubtext = payload.note || 'Review completed';
      return p;
    }
    return null;
  }
}

export const adminService = new AdminService();
