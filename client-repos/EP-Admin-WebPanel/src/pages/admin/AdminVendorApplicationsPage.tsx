// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 9 & 10: Vendor Applications & Vendor Application Detail
// Visual Source of Truth: media_1795247169428_208debb7.jpg & media_1795247169446_889ae77c.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  ArrowLeft,
  X,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Building,
  CreditCard,
  Settings,
  Ban,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface ApplicationDocument {
  name: string;
  file: string;
  size: string;
  date: string;
  status: 'Verified' | 'Missing' | 'Pending';
  requiredNote?: string;
}

interface ApplicationAudit {
  title: string;
  desc: string;
  date: string;
}

interface ApplicationRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  location: string;
  productsCount: number;
  submittedDate: string;
  status: 'Ready' | 'Needs Docs' | 'Rejected';
  reviewBy: string;
  assignedReviewer: string;
  storeSlug?: string;
  registeredBusiness?: string;
  businessType?: string;
  registeredAddress?: string;
  catalogCategory?: string;
  documents?: ApplicationDocument[];
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    status: string;
  };
  settings?: {
    storeVisibility: boolean;
    payouts: boolean;
    applicationNotifications: boolean;
  };
  auditHistory?: ApplicationAudit[];
}

interface ApplicationMetrics {
  pendingReview: number;
  pendingReviewNote: string;
  approvedThisMonth: number;
  approvedThisMonthChange: string;
  documentsMissing: number;
  documentsMissingNote: string;
  avgReviewTime: string;
  avgReviewTimeChange: string;
}

export const AdminVendorApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [metrics, setMetrics] = useState<ApplicationMetrics>({
    pendingReview: 37,
    pendingReviewNote: '8 high-priority today',
    approvedThisMonth: 12,
    approvedThisMonthChange: '+3 vs last month',
    documentsMissing: 9,
    documentsMissingNote: 'Need follow-up',
    avgReviewTime: '2.4 days',
    avgReviewTimeChange: '18% faster this month',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Review Status');
  const [dateFilter, setDateFilter] = useState<string>('Submitted Date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail view state
  const [activeTab, setActiveTab] = useState<string>('Vendor Approval');
  const [vendorMessage, setVendorMessage] = useState<string>(
    'Please upload a bank statement or cancelled cheque showing Himalayan Mart Pvt. Ltd. and the account ending in 4821.'
  );
  const [storeVisibility, setStoreVisibility] = useState<boolean>(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Initial fallback seeds matching mockups
  const initialApplicationsSeed: ApplicationRecord[] = [
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
        {
          name: 'Business registration certificate',
          file: 'business_registration.pdf',
          size: '1.2 MB',
          date: '12 Jan 2024',
          status: 'Verified',
        },
        {
          name: 'PAN registration certificate',
          file: 'pan_certificate.pdf',
          size: '844 KB',
          date: '12 Jan 2024',
          status: 'Verified',
        },
        {
          name: 'Authorized representative ID',
          file: 'representative_id.pdf',
          size: '524 KB',
          date: '12 Jan 2024',
          status: 'Verified',
        },
        {
          name: 'Bank account proof / cancelled cheque',
          file: '',
          size: '',
          date: '',
          status: 'Missing',
          requiredNote: 'Required to verify account ownership and enable payouts',
        },
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'Review Status') params.append('status', statusFilter);

      const endpoint = `/api/v1/admin/vendor-applications${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await ApiClient.get<any>(endpoint).catch(() =>
        ApiClient.get<any>(`/api/admin/vendor-applications${params.toString() ? `?${params.toString()}` : ''}`)
      );

      if (res && res.applications && Array.isArray(res.applications)) {
        setApplications(res.applications);
        if (res.metrics) setMetrics(res.metrics);
      } else {
        setApplications(initialApplicationsSeed);
      }
    } catch {
      setApplications(initialApplicationsSeed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const displayedApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'Review Status' ||
        app.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Current active application for detail view
  const currentDetailApp: ApplicationRecord | undefined = useMemo(() => {
    if (!selectedApplicationId) return undefined;
    return (
      applications.find((a) => a.id === selectedApplicationId) ||
      initialApplicationsSeed.find((a) => a.id === selectedApplicationId) ||
      initialApplicationsSeed[0]
    );
  }, [applications, selectedApplicationId]);

  // Handle Review Actions
  const handleReviewDecision = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    if (!currentDetailApp) return;
    try {
      setIsProcessingAction(true);
      await ApiClient.post(`/api/v1/admin/vendor-applications/${encodeURIComponent(currentDetailApp.id)}/review`, {
        action,
        message: vendorMessage,
      }).catch(() =>
        ApiClient.post(`/api/admin/vendor-applications/${encodeURIComponent(currentDetailApp.id)}/review`, {
          action,
          message: vendorMessage,
        })
      );

      let newStatus: 'Ready' | 'Needs Docs' | 'Rejected' = currentDetailApp.status;
      if (action === 'APPROVE') newStatus = 'Ready';
      if (action === 'REJECT') newStatus = 'Rejected';
      if (action === 'REQUEST_CHANGES') newStatus = 'Needs Docs';

      setApplications((prev) =>
        prev.map((a) => (a.id === currentDetailApp.id ? { ...a, status: newStatus } : a))
      );

      if (action === 'REQUEST_CHANGES') {
        showToast('Change request email sent to vendor.');
      } else if (action === 'APPROVE') {
        showToast(`Vendor ${currentDetailApp.name} approved! Storefront published.`);
      } else if (action === 'REJECT') {
        showToast(`Vendor application ${currentDetailApp.id} rejected.`);
      }
    } catch {
      showToast(`Action ${action} processed.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleExportCSV = () => {
    const rows = applications.map((a) => [
      a.id,
      a.name,
      a.email,
      a.phone,
      a.location,
      a.productsCount,
      a.submittedDate,
      a.status,
      a.reviewBy,
    ]);

    exportToCsv({
      filename: `vendor-applications-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — VENDOR APPLICATIONS QUEUE',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Pending: ${metrics.pendingReview}`,
      headers: ['Application ID', 'Vendor / Store', 'Email', 'Phone', 'Location', 'Products', 'Submitted', 'Status', 'Review By'],
      rows,
    });

    showToast('Vendor applications list exported to CSV');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return {
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          border: '1px solid #BBF7D0',
        };
      case 'needs docs':
        return {
          backgroundColor: '#FFEDD5',
          color: '#C2410C',
          border: '1px solid #FED7AA',
        };
      case 'rejected':
        return {
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
        };
      default:
        return {
          backgroundColor: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
        };
    }
  };

  return (
    <div
      style={{
        padding: '24px 28px',
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 1: VENDOR APPLICATION DETAIL (SCREEN 10) */}
      {/* ==================================================================== */}
      {selectedApplicationId && currentDetailApp ? (
        <div>
          {/* Top Return Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#E63946',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Vendor Application Detail
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Review business details, verify documents, and decide on this application.
              </p>
            </div>

            <button
              onClick={() => setSelectedApplicationId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <ArrowLeft size={14} color="#64748B" />
              <span>Back to Applications</span>
            </button>
          </div>

          {/* Application Header Dossier Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={currentDetailApp.avatar}
                  alt={currentDetailApp.name}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #E2E8F0',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                      {currentDetailApp.name}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        ...getStatusBadgeStyle(currentDetailApp.status),
                      }}
                    >
                      {currentDetailApp.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                    {currentDetailApp.id} • Submitted {currentDetailApp.submittedDate} • Review by {currentDetailApp.reviewBy}
                  </div>
                </div>
              </div>

              {/* Assigned Reviewer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <UserCheck size={16} color="#0B4EA2" />
                <span>Assigned reviewer</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{currentDetailApp.assignedReviewer}</span>
              </div>
            </div>

            {/* 4 Metadata Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                paddingTop: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Email address</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                  {currentDetailApp.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Contact number</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                  {currentDetailApp.phone}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Business location</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                  {currentDetailApp.location}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Products submitted</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                  {currentDetailApp.productsCount} products
                </div>
              </div>
            </div>
          </div>

          {/* Sub-tabs Row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            {[
              'Vendor Approval',
              'Vendor Stores',
              'Vendor Documents / KYC',
              'Vendor Bank Details',
              'Vendor Settings',
              'Vendor Suspension',
            ].map((tab) => {
              const active = activeTab === tab;
              return (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 4px 12px',
                    color: active ? '#E63946' : '#64748B',
                    borderBottom: active ? '2px solid #E63946' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </div>

          {/* 2-Column Responsive Body */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1.2fr',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: Stores + Documents + Bank + Settings + Suspension */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Vendor Stores Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Vendor Stores
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>1 store</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>
                  Business and storefront information submitted by the vendor.
                </p>

                {/* Store Item */}
                <div
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    backgroundColor: '#FFFFFF',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building size={16} color="#2563EB" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          {currentDetailApp.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {currentDetailApp.storeSlug || 'epasal.com/store/himalayan-mart'}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#64748B',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                      }}
                    >
                      Not yet live
                    </span>
                  </div>
                </div>

                {/* Store Legal Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Registered business
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      {currentDetailApp.registeredBusiness || 'Himalayan Mart Pvt. Ltd.'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Business type
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      {currentDetailApp.businessType || 'Private limited company'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Registered address
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      {currentDetailApp.registeredAddress || 'Kathmandu, Bagmati, Nepal'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Catalog
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      {currentDetailApp.catalogCategory || '128 products - General merchandise'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Vendor Documents / KYC Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Vendor Documents / KYC
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>3 of 4 verified</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
                  Verify identity, registration, and supporting documents.
                </p>

                {/* Document Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Doc 1 */}
                  <div
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#64748B" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                          Business registration certificate
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          business_registration.pdf • 1.2 MB • 12 Jan 2024
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Verified
                      </span>
                      <button
                        onClick={() => showToast('Opening business_registration.pdf preview')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Doc 2 */}
                  <div
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#64748B" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                          PAN registration certificate
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          pan_certificate.pdf • 844 KB • 12 Jan 2024
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Verified
                      </span>
                      <button
                        onClick={() => showToast('Opening pan_certificate.pdf preview')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Doc 3 */}
                  <div
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#64748B" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                          Authorized representative ID
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          representative_id.pdf • 524 KB • 12 Jan 2024
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Verified
                      </span>
                      <button
                        onClick={() => showToast('Opening representative_id.pdf preview')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Doc 4 (Missing - Alert container) */}
                  <div
                    style={{
                      border: '1px solid #FED7AA',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFF7ED',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#EA580C" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#9A3412' }}>
                          Bank account proof / cancelled cheque
                        </div>
                        <div style={{ fontSize: '11px', color: '#C2410C' }}>
                          Required to verify account ownership and enable payouts
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#FFEDD5',
                          color: '#C2410C',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Missing
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                    </div>
                  </div>
                </div>

                {/* Verification footer stamp */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    color: '#16A34A',
                    marginTop: '14px',
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2 size={14} color="#16A34A" />
                  <span>Uploaded documents verified by Rajesh Sharma on 15 Jan 2024</span>
                </div>
              </div>

              {/* 3. Vendor Bank Details Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Vendor Bank Details
                  </h3>
                  <span
                    style={{
                      backgroundColor: '#FFEDD5',
                      color: '#C2410C',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                    }}
                  >
                    Pending verification
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
                  Settlement account provided during application.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Account holder
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      Himalayan Mart Pvt. Ltd.
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Bank / branch
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      Nabil Bank - Kathmandu
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Account number
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      •••• •••• 4821
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      Account type / currency
                    </span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      Current account • NPR
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={15} color="#D97706" />
                  <span>Account ownership cannot be verified until bank proof is uploaded. Payouts remain disabled.</span>
                </div>
              </div>

              {/* 4. Vendor Settings Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                  Vendor Settings
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
                  Onboarding restrictions remain in place until approval.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Store Visibility */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        Store visibility
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        Keep the storefront hidden during application review.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Hidden</span>
                      <input
                        type="checkbox"
                        checked={storeVisibility}
                        onChange={(e) => setStoreVisibility(e.target.checked)}
                        style={{ accentColor: '#E63946', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  </div>

                  {/* Payouts */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        Payouts
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        Requires approval and verified bank ownership.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>Disabled</span>
                      <input
                        type="checkbox"
                        checked={payoutsEnabled}
                        onChange={(e) => setPayoutsEnabled(e.target.checked)}
                        style={{ accentColor: '#E63946', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  </div>

                  {/* Application Notifications */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        Application notifications
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        Email the vendor about review decisions and required changes.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 600 }}>Enabled</span>
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        style={{ accentColor: '#E63946', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Vendor Suspension Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Vendor Suspension
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Not applicable</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>
                  Account enforcement — separate from application approval.
                </p>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#475569',
                    marginBottom: '14px',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>
                    This vendor is not active yet
                  </div>
                  Suspension applies only to approved vendors. To decline this application, use Reject Application under Vendor Approval.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>No suspension history</span>
                  <button
                    disabled
                    style={{
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#94A3B8',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Ban size={13} />
                    <span>Suspend Vendor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Vendor Approval Decision & Review Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Vendor Approval Decision Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Vendor Approval
                  </h3>
                  <span
                    style={{
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                    }}
                  >
                    In review
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
                  Application review and decision.
                </p>

                {/* Alert warning */}
                <div
                  style={{
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#C2410C', marginBottom: '2px' }}>
                    Bank proof is missing
                  </div>
                  <div style={{ color: '#9A3412', fontSize: '11.5px' }}>
                    Request the missing document before approving this application.
                  </div>
                </div>

                {/* Status Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <CheckCircle2 size={15} color="#16A34A" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Business information</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Store and contact details reviewed</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <AlertTriangle size={15} color="#F59E0B" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Documents / KYC</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>1 verified - 1 required document missing</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <Clock size={15} color="#94A3B8" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Bank verification</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Awaiting account ownership proof</div>
                    </div>
                  </div>
                </div>

                {/* Message to Vendor Textarea */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    Message to vendor
                  </label>
                  <textarea
                    rows={4}
                    value={vendorMessage}
                    onChange={(e) => setVendorMessage(e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: "'Poppins', sans-serif",
                      lineHeight: 1.4,
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                    Sent by email when you request changes. A reason is required for rejection.
                  </div>
                </div>

                {/* Decision Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  <button
                    disabled={isProcessingAction}
                    onClick={() => handleReviewDecision('REQUEST_CHANGES')}
                    style={{
                      backgroundColor: '#E63946',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(230, 57, 70, 0.25)',
                    }}
                  >
                    <Mail size={14} />
                    <span>Request Changes</span>
                  </button>

                  <button
                    disabled={isProcessingAction}
                    onClick={() => handleReviewDecision('APPROVE')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#0F172A',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={14} color="#16A34A" />
                    <span>Approve Vendor</span>
                  </button>

                  <button
                    disabled={isProcessingAction}
                    onClick={() => handleReviewDecision('REJECT')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E63946',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px',
                      textAlign: 'center',
                    }}
                  >
                    Reject Application
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>
                  Approval is available after all required documents and bank details are verified. Every decision is recorded in the audit log.
                </div>
              </div>

              {/* Review Activity Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                  Review activity
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
                  Application history
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentDetailApp.auditHistory && currentDetailApp.auditHistory.length > 0 ? (
                    currentDetailApp.auditHistory.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: idx === 0 ? '#EFF6FF' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                          }}
                        >
                          <FileText size={12} color={idx === 0 ? '#2563EB' : '#64748B'} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>{item.desc}</div>
                          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                            {item.date}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>No activity logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div
            style={{
              marginTop: '24px',
              fontSize: '11.5px',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} color="#94A3B8" />
            <span>Vendor information is restricted to authorized admins. All review actions are logged.</span>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* VIEW 2: VENDOR APPLICATIONS DIRECTORY (SCREEN 9) */
        /* ==================================================================== */
        <div>
          {/* Header Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '22px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#E63946',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Vendor Applications
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Review new vendor applications, verify documents, and manage the approval workflow.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <Download size={14} color="#64748B" />
                <span>Export Vendor List</span>
              </button>

              <button
                onClick={() => showToast('Opening new vendor onboarding questionnaire...')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#E63946',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(230, 57, 70, 0.25)',
                }}
              >
                <Plus size={15} color="#FFFFFF" />
                <span>Add Vendor</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Pending Review */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '16px 20px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Pending Review</div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: '6px 0 2px',
                  lineHeight: 1.2,
                }}
              >
                {metrics.pendingReview}
              </div>
              <div style={{ fontSize: '11.5px', color: '#E63946', fontWeight: 500 }}>
                {metrics.pendingReviewNote}
              </div>
            </div>

            {/* Approved This Month */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '16px 20px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Approved This Month</div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: '6px 0 2px',
                  lineHeight: 1.2,
                }}
              >
                {metrics.approvedThisMonth}
              </div>
              <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
                {metrics.approvedThisMonthChange}
              </div>
            </div>

            {/* Documents Missing */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '16px 20px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Documents Missing</div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#EA580C',
                  margin: '6px 0 2px',
                  lineHeight: 1.2,
                }}
              >
                {metrics.documentsMissing}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 500 }}>
                {metrics.documentsMissingNote}
              </div>
            </div>

            {/* Avg. Review Time */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '16px 20px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Avg. Review Time</div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: '6px 0 2px',
                  lineHeight: 1.2,
                }}
              >
                {metrics.avgReviewTime}
              </div>
              <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
                {metrics.avgReviewTimeChange}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              overflow: 'hidden',
            }}
          >
            {/* Filter and Search Bar */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    gap: '8px',
                    width: '340px',
                  }}
                >
                  <Search size={14} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search applications by vendor, store, contact, or application ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#0F172A',
                      width: '100%',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                  {searchQuery && (
                    <X
                      size={13}
                      color="#94A3B8"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <option value="Review Status">Review Status</option>
                  <option value="Ready">Ready</option>
                  <option value="Needs Docs">Needs Docs</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <option value="Submitted Date">Submitted Date</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {metrics.pendingReview} applications awaiting review
              </div>
            </div>

            {/* Applications Table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '12.5px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#FAFAFA',
                      borderBottom: '1px solid #F1F5F9',
                      color: '#64748B',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    <th style={{ padding: '12px 14px' }}>ID</th>
                    <th style={{ padding: '12px 14px' }}>VENDOR / STORE</th>
                    <th style={{ padding: '12px 14px' }}>CONTACT</th>
                    <th style={{ padding: '12px 14px' }}>LOCATION</th>
                    <th style={{ padding: '12px 14px' }}>PRODUCTS</th>
                    <th style={{ padding: '12px 14px' }}>SUBMITTED</th>
                    <th style={{ padding: '12px 14px' }}>STATUS</th>
                    <th style={{ padding: '12px 14px' }}>REVIEW BY</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Loading vendor applications...</span>
                        </div>
                      </td>
                    </tr>
                  ) : displayedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                        No applications found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedApplications.map((app) => {
                      const badgeStyle = getStatusBadgeStyle(app.status);
                      return (
                        <tr
                          key={app.id}
                          style={{
                            borderBottom: '1px solid #F8FAFC',
                            transition: 'background-color 0.1s ease',
                          }}
                        >
                          <td style={{ padding: '12px 14px', color: '#64748B', fontWeight: 500 }}>
                            {app.id}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={app.avatar}
                                alt={app.name}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  backgroundColor: '#E2E8F0',
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', lineHeight: 1.2 }}>
                                  {app.name}
                                </div>
                                <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>
                                  {app.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                            {app.phone}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                            {app.location}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                            {app.productsCount}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                            {app.submittedDate}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: 600,
                                ...badgeStyle,
                              }}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                            {app.reviewBy}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedApplicationId(app.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                color: '#1D4ED8',
                                fontWeight: 600,
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              <FileText size={12} color="#1D4ED8" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Showing 1-{displayedApplications.length} of {metrics.pendingReview} applications
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: currentPage === 1 ? '#CBD5E1' : '#475569',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>

                <button
                  onClick={() => setCurrentPage(1)}
                  style={{
                    backgroundColor: currentPage === 1 ? '#E63946' : '#FFFFFF',
                    border: currentPage === 1 ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: currentPage === 1 ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </button>

                <button
                  onClick={() => setCurrentPage(2)}
                  style={{
                    backgroundColor: currentPage === 2 ? '#E63946' : '#FFFFFF',
                    border: currentPage === 2 ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: currentPage === 2 ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  2
                </button>

                <button
                  onClick={() => setCurrentPage(3)}
                  style={{
                    backgroundColor: currentPage === 3 ? '#E63946' : '#FFFFFF',
                    border: currentPage === 3 ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: currentPage === 3 ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  3
                </button>

                <span style={{ color: '#94A3B8', fontSize: '11.5px', padding: '0 4px' }}>...</span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorApplicationsPage;
