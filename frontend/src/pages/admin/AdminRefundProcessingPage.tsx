import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface PayoutJob {
  payoutId: string;
  returnId: string;
  customer: string;
  orderId: string;
  uniqueRef: string;
  method: string;
  amount: number;
  submittedDate: string;
  providerRef: string;
  currentState: string;
  issueSubstate: string;
  issueDetail?: string;
  lastChecked?: string;
  isIssue: boolean;
}

export const AdminRefundProcessingPage: React.FC = () => {
  const [jobs, setJobs] = useState<PayoutJob[]>([
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
      issueDetail:
        'eSewa returned a destination rejected response at 31 Oct · 13:42. The target mobile wallet was reported inactive or closed. The customer\'s card/wallet was not debited.',
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
      issueDetail:
        'Account validation failed at clearing bank. Account number does not match registered account name.',
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
  ]);

  const [selectedPayoutId, setSelectedPayoutId] = useState<string>('PAY-7035');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [isReconciling, setIsReconciling] = useState(false);
  const [successNote, setSuccessNote] = useState('');

  const fetchProcessingJobs = async () => {
    try {
      const res: any = await ApiClient.get('/admin/returns/processing');
      if (res && res.data && res.data.jobs && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load payout processing jobs:', err);
    }
  };

  useEffect(() => {
    fetchProcessingJobs();
  }, []);

  const selectedJob = jobs.find((j) => j.payoutId === selectedPayoutId) || jobs[0];

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.payoutId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState =
      stateFilter === 'ALL' ||
      j.currentState.toLowerCase() === stateFilter.toLowerCase();
    const matchesProvider =
      providerFilter === 'ALL' ||
      j.method.toLowerCase().includes(providerFilter.toLowerCase());
    return matchesSearch && matchesState && matchesProvider;
  });

  const handleReconcile = async () => {
    if (!selectedJob) return;
    setIsReconciling(true);
    try {
      await ApiClient.post(`/admin/returns/processing/${selectedJob.payoutId}/reconcile`, {
        state: 'Processing',
        note: 'Reconciled with gateway zero-debit verification. Payout cleared for retry.',
      });
      setSuccessNote(`Reconciled original job ${selectedJob.payoutId} successfully.`);
      setTimeout(() => setSuccessNote(''), 4000);
      fetchProcessingJobs();
    } catch (err) {
      console.error('Reconciliation error:', err);
      setJobs((prev) =>
        prev.map((j) =>
          j.payoutId === selectedJob.payoutId
            ? { ...j, currentState: 'Processing', issueSubstate: 'Reconciled · In progress', isIssue: false }
            : j
        )
      );
      setSuccessNote(`Reconciled ${selectedJob.payoutId} locally.`);
      setTimeout(() => setSuccessNote(''), 4000);
    } finally {
      setIsReconciling(false);
    }
  };

  const renderStatusBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case 'payment issue':
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2.5px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
            }}
          >
            Payment issue
          </span>
        );
      case 'processing':
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2.5px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
            }}
          >
            Processing
          </span>
        );
      case 'submitted':
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2.5px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#475569',
            }}
          >
            Submitted
          </span>
        );
      case 'delayed':
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2.5px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#B45309',
            }}
          >
            Delayed
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2.5px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#F1F5F9',
              color: '#475569',
            }}
          >
            {state}
          </span>
        );
    }
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092885_d0756584.jpg */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Refund Processing
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
          Track automated payout submissions, monitor gateway status, and resolve exceptions before confirmation.
        </p>
      </div>

      {successNote && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{successNote}</span>
        </div>
      )}

      {/* 2. Top 3 KPI Cards matching media_1795254092885_d0756584.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Refund Processing
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            14 jobs
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Submitted or pending provider confirmation
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#E63946', fontWeight: 600, marginBottom: '6px' }}>
            Refund Payment Issues
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#E63946', lineHeight: 1.1 }}>
            2 jobs
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Require reconciliation before a safe retry
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Queue scope
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            16 active jobs
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Not completed · Excluded from Refund History
          </div>
        </div>
      </div>

      {/* 3. Payout Monitor Table matching media_1795254092885_d0756584.jpg */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Payout monitor
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Automated submission pipeline and exception resolution
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {jobs.length} active jobs
          </span>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '340px' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search job ID, return, order or customer..."
              style={{
                width: '100%',
                padding: '7.5px 12px 7.5px 32px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{
              padding: '7.5px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#475569',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All payout states</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Processing">Processing</option>
            <option value="Submitted">Submitted</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{
              padding: '7.5px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#475569',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All providers</option>
            <option value="eSewa">eSewa</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="Khalti">Khalti</option>
            <option value="Visa">Visa Card</option>
            <option value="Mastercard">Mastercard</option>
          </select>

          <div style={{ padding: '7.5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12.5px', color: '#475569' }}>
            All methods ▾
          </div>
        </div>

        {/* Table Rows */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <th style={{ padding: '11px 20px' }}>PAYOUT JOB</th>
                <th style={{ padding: '11px 16px' }}>RETURN / CUSTOMER</th>
                <th style={{ padding: '11px 16px' }}>METHOD</th>
                <th style={{ padding: '11px 16px' }}>AMOUNT</th>
                <th style={{ padding: '11px 16px' }}>SUBMITTED</th>
                <th style={{ padding: '11px 16px' }}>PROVIDER REF</th>
                <th style={{ padding: '11px 16px' }}>CURRENT STATE</th>
                <th style={{ padding: '11px 20px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const isSelected = job.payoutId === selectedPayoutId;
                return (
                  <tr
                    key={job.payoutId}
                    onClick={() => setSelectedPayoutId(job.payoutId)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{job.payoutId}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', fontFamily: 'monospace' }}>{job.uniqueRef}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0F172A' }}>{job.returnId}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{job.customer}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 500, color: '#0F172A' }}>
                      {job.method}
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                      NPR {job.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748B' }}>
                      {job.submittedDate}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '11.5px', fontFamily: 'monospace', color: '#475569' }}>
                      {job.providerRef}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                        {renderStatusBadge(job.currentState)}
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{job.issueSubstate}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      {job.isIssue ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: isSelected ? '#0B4EA2' : '#DC2626',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Review issue
                        </button>
                      ) : job.currentState === 'Delayed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#D97706',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Reconcile →
                        </button>
                      ) : job.currentState === 'Submitted' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Check status →
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#0B4EA2',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          View job
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
          <span>Showing 1–8 of 16 active jobs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              Previous
            </button>
            <button style={{ padding: '5px 12px', backgroundColor: '#0B4EA2', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}>
              1
            </button>
            <button style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              2
            </button>
            <button style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Split Card: Payment Issue Review & Reconcile Guidance matching media_1795254092885_d0756584.jpg */}
      {selectedJob && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Left: Issue Review Panel */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {selectedJob.payoutId} · Payment issue review
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                {selectedJob.customer}
              </span>
            </div>

            {/* Error Banner Callout */}
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontWeight: 600, color: '#991B1B' }}>
                <AlertCircle size={15} color="#DC2626" />
                <span>{selectedJob.issueDetail || 'Gateway reported destination rejected error.'}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px', paddingLeft: '22px' }}>
                The target mobile wallet was reported inactive or closed. The customer&apos;s card/wallet was not debited.
              </div>
            </div>

            {/* 4 Detail Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Return / original order</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedJob.returnId} / {selectedJob.orderId}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Unique payout ref</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px', fontFamily: 'monospace' }}>
                  {selectedJob.uniqueRef}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Amount to refund</div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700, marginTop: '3px' }}>
                  NPR {selectedJob.amount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Provider reference</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px', fontFamily: 'monospace' }}>
                  {selectedJob.providerRef}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={isReconciling}
                onClick={handleReconcile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '9px 20px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  opacity: isReconciling ? 0.7 : 1,
                }}
              >
                <RefreshCw size={14} color="#FFFFFF" className={isReconciling ? 'animate-spin' : ''} />
                <span>Reconcile original job</span>
              </button>
              <button
                type="button"
                onClick={() => alert(`Reviewing destination credentials for ${selectedJob.customer}...`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  padding: '9px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Review destination
              </button>
              <button
                type="button"
                onClick={() => alert(`Showing prior gateway attempts for ${selectedJob.uniqueRef}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  padding: '9px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                View attempts
              </button>
            </div>
          </div>

          {/* Right: Safe Retry Policy */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '14px', color: '#E63946', fontWeight: 700, fontSize: '13.5px' }}>
                <ShieldAlert size={17} color="#E63946" />
                <span>Reconcile before retrying</span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                Never retry a failed payout with the same provider without first reconciling the original reference. Reconciling prevents duplicate debits if the provider previously accepted the transaction.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#0F172A' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>1.</span>
                  <span>Query provider status with <code style={{ backgroundColor: '#F1F5F9', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px' }}>{selectedJob.providerRef}</code>.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>2.</span>
                  <span>If provider confirms zero debit, close <code style={{ backgroundColor: '#F1F5F9', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px' }}>{selectedJob.payoutId}</code> as canceled.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>3.</span>
                  <span>Obtain verified alternate destination from the customer before re-submitting.</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', paddingTop: '14px', borderTop: '1px solid #E2E8F0', marginTop: '16px' }}>
              Provider compliance protocol · Nepal Rastra Bank payment directive
            </div>
          </div>
        </div>
      )}

      {/* 5. Subtle Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
        <span>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</span>
        <span>Everest Pasal / Operations</span>
      </div>
    </div>
  );
};

export default AdminRefundProcessingPage;
