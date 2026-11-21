import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Calendar,
  SlidersHorizontal,
  FileText,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';
import { useRouter } from '../../router/index.js';

interface ReturnCase {
  returnId: string;
  submittedDate: string;
  customer: string;
  phone: string;
  orderId: string;
  returnedItem: string;
  variant: string;
  reason: string;
  workflowStatus: string;
  inspectionStatus?: string;
  amount: number;
  seller?: string;
}

interface ReturnKpis {
  totalReturnCases: number;
  awaitingApproval: number;
  awaitingInspection: number;
  awaitingRefundAuthorization: number;
  refundProcessing: number;
  refunded: number;
  refundPaymentIssues: number;
}

export const AdminReturnRequestsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [kpis, setKpis] = useState<ReturnKpis>({
    totalReturnCases: 80,
    awaitingApproval: 12,
    awaitingInspection: 6,
    awaitingRefundAuthorization: 4,
    refundProcessing: 14,
    refunded: 42,
    refundPaymentIssues: 2,
  });

  const [requests, setRequests] = useState<ReturnCase[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'needs-approval' | 'new-today' | 'my-assigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All workflow statuses');
  const [reasonFilter, setReasonFilter] = useState('All reasons');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Create Return Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [newOrderId, setNewOrderId] = useState('ORD-88220');
  const [newItem, setNewItem] = useState('');
  const [newVariant, setNewVariant] = useState('Size L · 1 item');
  const [newReason, setNewReason] = useState('Wrong size');
  const [newAmount, setNewAmount] = useState('1500');
  const [newPhone, setNewPhone] = useState('+977 98-4100-0000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReturnRequests = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'All workflow statuses') params.append('status', statusFilter);
      if (reasonFilter !== 'All reasons') params.append('reason', reasonFilter);
      if (activeTab !== 'all') params.append('tab', activeTab);

      const res: any = await ApiClient.get(`/admin/returns/requests?${params.toString()}`);
      if (res && res.data) {
        if (res.data.kpis) setKpis(res.data.kpis);
        if (res.data.requests) setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to load return requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, [searchQuery, statusFilter, reasonFilter, activeTab]);

  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest_pasal_return_requests_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'EVEREST PASAL — RETURN REQUESTS LEDGER',
      subtitle: 'Audit-ready return cases & status workflow',
      metadata: {
        'Total Return Cases': String(kpis.totalReturnCases),
        'Awaiting Approval': String(kpis.awaitingApproval),
        'Awaiting Inspection': String(kpis.awaitingInspection),
        'Awaiting Authorization': String(kpis.awaitingRefundAuthorization),
        'Refund Processing': String(kpis.refundProcessing),
        'Refunded': String(kpis.refunded),
        'Export Date': new Date().toLocaleString(),
      },
      headers: [
        'RETURN ID',
        'SUBMITTED DATE',
        'CUSTOMER',
        'ORDER ID',
        'RETURNED ITEM',
        'VARIANT',
        'REASON',
        'WORKFLOW STATUS',
        'AMOUNT (NPR)',
      ],
      rows: requests.map((r) => [
        r.returnId,
        r.submittedDate,
        r.customer,
        r.orderId,
        r.returnedItem,
        r.variant,
        r.reason,
        r.workflowStatus,
        r.amount,
      ]),
    });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.trim() || !newItem.trim()) {
      setFormError('Please enter customer name and item details.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await ApiClient.post('/admin/returns/requests', {
        customer: newCustomer,
        phone: newPhone,
        orderId: newOrderId,
        returnedItem: newItem,
        variant: newVariant,
        reason: newReason,
        amount: Number(newAmount),
      });
      setShowCreateModal(false);
      setNewCustomer('');
      setNewItem('');
      await fetchReturnRequests();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextAction = (item: ReturnCase) => {
    if (item.workflowStatus === 'Awaiting Approval') {
      navigate('/admin/returns/approvals');
    } else if (item.workflowStatus === 'Awaiting Inspection') {
      navigate('/admin/returns/inspections');
    } else if (item.workflowStatus === 'Awaiting authorization') {
      navigate('/admin/returns/refund-requests');
    } else if (item.workflowStatus === 'Refund Processing' || item.workflowStatus === 'Refund Payment Issue') {
      navigate('/admin/returns/processing');
    } else if (item.workflowStatus === 'Refunded') {
      navigate('/admin/returns/refund-history');
    }
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092900_15a110f2.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Return Requests
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage every return case, with the right context and a clear next step.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <Download size={14} color="#0F172A" />
            <span>Export requests</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Plus size={14} color="#FFFFFF" />
            <span>Create return request</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (7 KPIs) matching media_1795254092900_15a110f2.jpg */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.totalReturnCases}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Total return cases</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.awaitingApproval}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Awaiting Approval</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.awaitingInspection}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Awaiting Inspection</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.awaitingRefundAuthorization}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Awaiting Refund Authorization</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.refundProcessing}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Refund Processing</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.refunded}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>Refunded</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', lineHeight: 1.1 }}>{kpis.refundPaymentIssues}</div>
          <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '6px', fontWeight: 500 }}>Refund Payment Issues</div>
        </div>
      </div>

      {/* 3. Sub-tabs Filter Pills matching media_1795254092900_15a110f2.jpg */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'all' ? '#0B4EA2' : '#FFFFFF',
            color: activeTab === 'all' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'all' ? '0 1px 2px rgba(11, 78, 162, 0.2)' : 'none',
          }}
        >
          All requests · 80
        </button>
        <button
          onClick={() => setActiveTab('needs-approval')}
          style={{
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 500,
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            backgroundColor: activeTab === 'needs-approval' ? '#0B4EA2' : '#FFFFFF',
            color: activeTab === 'needs-approval' ? '#FFFFFF' : '#475569',
          }}
        >
          Needs approval · 12
        </button>
        <button
          onClick={() => setActiveTab('new-today')}
          style={{
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 500,
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            backgroundColor: activeTab === 'new-today' ? '#0B4EA2' : '#FFFFFF',
            color: activeTab === 'new-today' ? '#FFFFFF' : '#475569',
          }}
        >
          New today · 3
        </button>
        <button
          onClick={() => setActiveTab('my-assigned')}
          style={{
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 500,
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            backgroundColor: activeTab === 'my-assigned' ? '#0B4EA2' : '#FFFFFF',
            color: activeTab === 'my-assigned' ? '#FFFFFF' : '#475569',
          }}
        >
          My assigned cases · 8
        </button>
      </div>

      {/* 4. Search and Filter Controls matching media_1795254092900_15a110f2.jpg */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '7px',
            padding: '7px 12px',
            gap: '8px',
            flex: 1,
          }}
        >
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search return ID, order or customer"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '12.5px',
              color: '#0F172A',
              width: '100%',
              fontFamily: "'Poppins', sans-serif",
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '7px',
            padding: '7px 12px',
            fontSize: '12.5px',
            color: '#334155',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <option value="All workflow statuses">All workflow statuses</option>
          <option value="Awaiting Approval">Awaiting Approval</option>
          <option value="Awaiting Inspection">Awaiting Inspection</option>
          <option value="Awaiting authorization">Awaiting authorization</option>
          <option value="Refund Processing">Refund Processing</option>
          <option value="Refunded">Refunded</option>
          <option value="Refund Payment Issue">Refund Payment Issue</option>
        </select>

        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '7px',
            padding: '7px 12px',
            fontSize: '12.5px',
            color: '#334155',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <option value="All reasons">All reasons</option>
          <option value="Wrong size">Wrong size</option>
          <option value="Damaged item">Damaged item</option>
          <option value="Wrong product">Wrong product</option>
          <option value="Not as described">Not as described</option>
          <option value="Defective item">Defective item</option>
        </select>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '7px',
            padding: '7px 12px',
            fontSize: '12.5px',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          <Calendar size={13} color="#64748B" />
          <span>Last 30 days</span>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '7px',
            padding: '7px 14px',
            fontSize: '12.5px',
            fontWeight: 500,
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={13} color="#64748B" />
          <span>More filters</span>
        </button>
      </div>

      {/* 5. Return Cases Table Section matching media_1795254092900_15a110f2.jpg */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>All return cases</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>80 results · Sorted by most recent request</div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  REQUEST / SUBMITTED
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  CUSTOMER / ORDER
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  RETURNED ITEM
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  REASON
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  WORKFLOW STATUS
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  AMOUNT
                </th>
                <th style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                  NEXT ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 10).map((item, index) => (
                <tr
                  key={item.returnId}
                  style={{
                    borderBottom: index < 9 ? '1px solid #F1F5F9' : 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {/* Request / Submitted */}
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.returnId}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.submittedDate}</div>
                  </td>

                  {/* Customer / Order */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.customer}</div>
                    <div style={{ fontSize: '11px', color: '#0B4EA2', cursor: 'pointer' }}>{item.orderId}</div>
                  </td>

                  {/* Returned Item */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{item.returnedItem}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.variant}</div>
                  </td>

                  {/* Reason */}
                  <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#475569' }}>
                    {item.reason}
                  </td>

                  {/* Workflow Status */}
                  <td style={{ padding: '12px 16px' }}>
                    {item.workflowStatus === 'Awaiting Approval' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        Awaiting Approval
                      </span>
                    ) : item.workflowStatus === 'Awaiting Inspection' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        Awaiting Inspection
                      </span>
                    ) : item.workflowStatus === 'Awaiting authorization' ? (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0B4EA2' }}>Awaiting authorization</div>
                        <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 500 }}>Inspection Passed</div>
                      </div>
                    ) : item.workflowStatus === 'Refund Processing' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        Refund Processing
                      </span>
                    ) : item.workflowStatus === 'Refund Payment Issue' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        Refund Payment Issue
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        Refunded
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    NPR {item.amount.toLocaleString()}
                  </td>

                  {/* Next Action */}
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {item.workflowStatus === 'Awaiting Approval' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={12} color="#64748B" />
                        <span>Review request</span>
                      </button>
                    )}
                    {item.workflowStatus === 'Awaiting Inspection' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} color="#64748B" />
                        <span>View inspection</span>
                      </button>
                    )}
                    {item.workflowStatus === 'Awaiting authorization' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={12} color="#64748B" />
                        <span>Review refund</span>
                      </button>
                    )}
                    {item.workflowStatus === 'Refund Processing' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <CreditCard size={12} color="#64748B" />
                        <span>Track payout</span>
                      </button>
                    )}
                    {item.workflowStatus === 'Refund Payment Issue' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#DC2626',
                          cursor: 'pointer',
                        }}
                      >
                        <AlertTriangle size={12} color="#DC2626" />
                        <span>Resolve issue</span>
                      </button>
                    )}
                    {item.workflowStatus === 'Refunded' && (
                      <button
                        onClick={() => handleNextAction(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={12} color="#64748B" />
                        <span>View receipt</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer note matching media_1795254092900_15a110f2.jpg */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Showing 1–10 of 80 return cases
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>10 per page</span>
            <button
              disabled={currentPage === 1}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, padding: '0 4px' }}>
              1 of 8
            </span>
            <button
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94A3B8' }}>
        <div>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</div>
        <div>Everest Pasal / Operations</div>
      </div>

      {/* ================================================================ */}
      {/* MODAL: Create Return Request */}
      {/* ================================================================ */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                  <RotateCcw size={18} color="#0B4EA2" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    Create Return Request
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Log a manual customer return case
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', color: '#DC2626', fontSize: '12px', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mina Rai"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+977 98-XXXX-XXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Original Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-88214"
                    value={newOrderId}
                    onChange={(e) => setNewOrderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Refund Amount (NPR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Returned Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trail fleece jacket"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Return Reason *
                  </label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Wrong size">Wrong size</option>
                    <option value="Damaged item">Damaged item</option>
                    <option value="Wrong product">Wrong product</option>
                    <option value="Not as described">Not as described</option>
                    <option value="Defective item">Defective item</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Return Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
