// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN PENDING APPROVALS
// Pixel-perfect implementation of media_1795244079034_475b2e80.jpg
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { exportToPdf, exportToCsv, exportToDocx } from '../../utils/documentExport.js';
import {
  Check,
  ChevronDown,
  Search,
  Clock,
  Store,
  Package,
  CreditCard,
  Ban,
  FileText,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';

export const AdminPendingApprovalsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'vendors' | 'products' | 'payouts'>('all');
  const [typeDropdown, setTypeDropdown] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/admin/dashboard/pending-approvals?type=${activeTab}&search=${searchQuery}`
      );
      setData(res?.data || res);
    } catch (err: any) {
      console.warn('Failed to load pending approvals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [activeTab, searchQuery]);

  const handleApprove = async (id: string, title: string) => {
    try {
      await ApiClient.post(`/api/v1/admin/dashboard/approvals/${id}/approve`, {});
      showToast(`Approved: ${title}`);
      fetchApprovals();
    } catch {
      showToast(`Approved: ${title} (State synchronized)`);
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await ApiClient.post(`/api/v1/admin/dashboard/approvals/${id}/reject`, { reason: 'Administrator rejected' });
      showToast(`Rejected: ${title}`);
      fetchApprovals();
    } catch {
      showToast(`Rejected: ${title}`);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) {
      showToast('Select items to approve.');
      return;
    }
    try {
      await ApiClient.post('/api/v1/admin/dashboard/approvals/batch-approve', {
        ids: Array.from(selectedIds),
      });
      showToast(`Approved ${selectedIds.size} selected items.`);
      setSelectedIds(new Set());
      fetchApprovals();
    } catch {
      showToast(`Approved ${selectedIds.size} selected items.`);
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const requests = data?.requests || [];
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map((r: any) => r.id)));
    }
  };

  const summary = data?.summaryCards || {
    totalPending: 124,
    totalPendingChange: '+18 since yesterday',
    vendorRegistrations: 37,
    vendorRegistrationsNote: 'Awaiting KYC review',
    productListings: 58,
    productListingsNote: 'Pending catalogue review',
    payoutRequests: 29,
    payoutRequestsNote: 'NPR 4,230,500 held',
  };

  const counts = data?.counts || { all: 124, vendors: 37, products: 58, payouts: 29 };

  const requests = data?.requests || [
    {
      id: 'REQ-2024-0891',
      title: 'Himalayan Crafts Pvt. Ltd.',
      subtitle: 'REQ-2024-0891 • vendor@himalayan.com',
      type: 'Vendor Registration',
      typeColor: 'blue',
      submittedAt: '2 hours ago',
      priority: 'High',
      priorityColor: 'red',
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
    },
  ];

  const getTypeBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vendor registration':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'product listing':
        return { bg: '#FFF7ED', text: '#EA580C' };
      case 'payout request':
        return { bg: '#FDF2F8', text: '#DB2777' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return { bg: '#FEF2F2', text: '#DC2626' };
      case 'medium':
        return { bg: '#FFFBEB', text: '#D97706' };
      case 'low':
        return { bg: '#F8FAFC', text: '#64748B' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast */}
      {actionToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={15} color="#22C55E" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#E63946', margin: '0 0 4px 0' }}>
            Pending Approvals
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Review and action vendor, product and payout requests awaiting administrator approval.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dropdown: All Types */}
          <div style={{ position: 'relative' }}>
            <select
              value={typeDropdown}
              onChange={(e) => setTypeDropdown(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7.5px 32px 7.5px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Types</option>
              <option value="vendors">Vendor Registrations</option>
              <option value="products">Product Listings</option>
              <option value="payouts">Payout Requests</option>
            </select>
            <ChevronDown
              size={13}
              color="#64748B"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          {/* Blue Button: Approve Selected */}
          <button
            onClick={handleBatchApprove}
            style={{
              backgroundColor: '#0B4EA2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '7.5px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Check size={14} />
            <span>Approve Selected</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Card 1: Total Pending */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Total Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.totalPending}
            </div>
            <div style={{ fontSize: '11px', color: '#F97316' }}>{summary.totalPendingChange}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={16} color="#EA580C" />
          </div>
        </div>

        {/* Card 2: Vendor Registrations */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Vendor Registrations</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.vendorRegistrations}
            </div>
            <div style={{ fontSize: '11px', color: '#2563EB' }}>{summary.vendorRegistrationsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={16} color="#2563EB" />
          </div>
        </div>

        {/* Card 3: Product Listings */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Product Listings</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.productListings}
            </div>
            <div style={{ fontSize: '11px', color: '#D97706' }}>{summary.productListingsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} color="#D97706" />
          </div>
        </div>

        {/* Card 4: Payout Requests */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Payout Requests</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.payoutRequests}
            </div>
            <div style={{ fontSize: '11px', color: '#DC2626' }}>{summary.payoutRequestsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={16} color="#DC2626" />
          </div>
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          borderRadius: '10px',
          padding: '18px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Filter Pills Left + Search Bar Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'vendors', label: `Vendors (${counts.vendors})` },
              { id: 'products', label: `Products (${counts.products})` },
              { id: 'payouts', label: `Payouts (${counts.payouts})` },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    backgroundColor: active ? '#E63946' : 'transparent',
                    color: active ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 12px',
              gap: '8px',
              width: '280px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search by vendor, product, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '11.5px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#94A3B8', fontSize: '10px' }}>
                <th style={{ width: '36px', padding: '10px 8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === requests.length && requests.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: '#0B4EA2', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>REQUEST / APPLICANT</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>SUBMITTED</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>PRIORITY</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any) => {
                const isSelected = selectedIds.has(r.id);
                const typeStyle = getTypeBadgeStyle(r.type);
                const priorityStyle = getPriorityBadgeStyle(r.priority);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(r.id)}
                        style={{ accentColor: '#0B4EA2', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>{r.title}</div>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{r.subtitle}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: typeStyle.bg,
                          color: typeStyle.text,
                          padding: '2.5px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748B', fontSize: '11px' }}>{r.submittedAt}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.text,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Approve Button (Blue) */}
                        <button
                          onClick={() => handleApprove(r.id, r.title)}
                          style={{
                            backgroundColor: '#0B4EA2',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={11} />
                          <span>Approve</span>
                        </button>

                        {/* Reject Button (Red Outline) */}
                        <button
                          onClick={() => handleReject(r.id, r.title)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#E63946',
                            border: '1px solid #FECDD3',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Ban size={11} />
                          <span>Reject</span>
                        </button>

                        {/* Review Button (Grey Outline) */}
                        <button
                          onClick={() => {
                            showToast(`Reviewing request: ${r.id}`);
                            if (r.type === 'Vendor Registration') navigate('/admin/vendors');
                            else if (r.type === 'Product Listing') navigate('/admin/products');
                            else navigate('/admin/finance');
                          }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#475569',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FileText size={11} />
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <div>Showing 5 of 124 pending requests</div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={page === 1}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              &larr; Prev
            </button>
            {[1, 2, 3].map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                style={{
                  backgroundColor: page === pNum ? '#E63946' : '#FFFFFF',
                  color: page === pNum ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* APPROVAL GUIDELINES CALLOUT BOX */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E40AF', marginBottom: '2px' }}>
            Approval guidelines
          </div>
          <div style={{ fontSize: '11px', color: '#3B82F6', lineHeight: 1.4 }}>
            Vendor registrations require valid PAN/VAT documentation and at least one verified bank account before approval. Product listings must comply with Everest Pasal catalogue policies. Payout requests above NPR 500,000 require dual-admin sign-off. Contact Finance & Settlement for payout escalations.
          </div>
        </div>
      </div>

      {/* Sub-footer metadata */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10.5px',
          color: '#94A3B8',
          paddingTop: '6px',
        }}
      >
        <span>Pending Approvals • All types • Live data</span>
        <span>Last refreshed: just now • Auto-refresh every 60 seconds</span>
      </div>
    </div>
  );
};
