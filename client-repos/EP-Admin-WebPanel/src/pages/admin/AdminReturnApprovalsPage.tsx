import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface ApprovalCase {
  returnId: string;
  submittedDate: string;
  customer: string;
  phone: string;
  orderId: string;
  returnedItem: string;
  sku: string;
  variant: string;
  reason: string;
  amount: number;
  seller?: string;
  deliveredDate?: string;
  assignedTo?: string;
  quote?: string;
  attachments?: { name: string; size: string; date: string }[];
  returnWindowStatus?: string;
  categoryStatus?: string;
  priorReturnStatus?: string;
  itemCondition?: string;
}

export const AdminReturnApprovalsPage: React.FC = () => {
  const [queue, setQueue] = useState<ApprovalCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ApprovalCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchApprovalsQueue = async () => {
    try {
      const res: any = await ApiClient.get('/admin/returns/approvals');
      if (res && res.data && res.data.queue) {
        setQueue(res.data.queue);
        if (!selectedCase && res.data.queue.length > 0) {
          setSelectedCase(res.data.queue[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load return approvals queue:', err);
    }
  };

  useEffect(() => {
    fetchApprovalsQueue();
  }, []);

  const handleApprove = async () => {
    if (!selectedCase) return;
    setIsProcessing(true);
    try {
      await ApiClient.post(`/admin/returns/approvals/${selectedCase.returnId}/approve`, {
        note: reviewNote || 'Return approved by administrator',
      });
      setActionSuccess(`Return ${selectedCase.returnId} has been approved for warehouse intake.`);
      setTimeout(() => setActionSuccess(''), 4000);
      setReviewNote('');
      await fetchApprovalsQueue();
    } catch (err: any) {
      console.error('Failed to approve return:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCase) return;
    setIsProcessing(true);
    try {
      await ApiClient.post(`/admin/returns/approvals/${selectedCase.returnId}/reject`, {
        reason: reviewNote || 'Policy ineligible',
      });
      setActionSuccess(`Return ${selectedCase.returnId} has been rejected.`);
      setTimeout(() => setActionSuccess(''), 4000);
      setReviewNote('');
      await fetchApprovalsQueue();
    } catch (err: any) {
      console.error('Failed to reject return:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredQueue = queue.filter(
    (c) =>
      c.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092874_4dc9995d.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Return Approvals
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Review policy eligibility and authorize the return—not the refund.
          </p>
        </div>
        <button
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
          <BookOpen size={14} color="#0F172A" />
          <span>Return policy</span>
        </button>
      </div>

      {/* 2. Top 3 KPI Cards matching media_1795254092874_4dc9995d.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>Awaiting Approval</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>12 cases</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            All incoming requests requiring a decision
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>New today</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>3 requests</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Included in the 12-case approval queue
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>Review priority</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>2 over 48h</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Oldest submissions first when unassigned
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>
          {actionSuccess}
        </div>
      )}

      {/* 3. Master-Detail Split Screen Layout matching media_1795254092874_4dc9995d.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
        {/* Left Column: Approval Queue */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Approval queue</div>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 7px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
              12
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '6px 10px',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            <Search size={13} color="#94A3B8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queue"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                color: '#0F172A',
                width: '100%',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <select
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                color: '#475569',
                outline: 'none',
              }}
            >
              <option>Newest first</option>
              <option>Oldest first</option>
              <option>Highest value</option>
            </select>
          </div>

          {/* Queue Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {filteredQueue.map((item) => {
              const isSelected = selectedCase?.returnId === item.returnId;
              return (
                <div
                  key={item.returnId}
                  onClick={() => setSelectedCase(item)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #0B4EA2' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{item.returnId}</span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{item.submittedDate}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                    {item.customer}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748B' }}>
                    <span>{item.reason}</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>NPR {item.amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Pagination Footer */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
            <span>Showing 1–6 of 12 awaiting approval</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span>Page 1 of 2</span>
              <span style={{ color: '#0B4EA2', cursor: 'pointer', fontWeight: 600 }}>&gt; Next 6</span>
            </div>
          </div>
        </div>

        {/* Right Column: Case Details & Review Decision */}
        {selectedCase && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {selectedCase.returnId} · Return review
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                    Awaiting Approval
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Submitted {selectedCase.submittedDate} NPT
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Assigned to <strong style={{ color: '#0F172A' }}>{selectedCase.assignedTo || 'Rajesh Sharma'}</strong>
              </div>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{selectedCase.customer}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Original order</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B4EA2', marginTop: '2px' }}>{selectedCase.orderId}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Requested amount</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>NPR {selectedCase.amount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Item / SKU</div>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#0F172A', marginTop: '2px' }}>{selectedCase.returnedItem} · {selectedCase.sku || 'EP-FLC-204-M'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Variant / quantity</div>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#0F172A', marginTop: '2px' }}>{selectedCase.variant}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Seller / delivered</div>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#0F172A', marginTop: '2px' }}>{selectedCase.seller || 'Himal Outdoor'} / {selectedCase.deliveredDate || '27 Oct 2026'}</div>
              </div>
            </div>

            {/* Section: Reason & Customer Quote */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Reason: {selectedCase.reason}
              </div>
              <blockquote style={{ margin: '0 0 12px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderLeft: '3px solid #CBD5E1', borderRadius: '4px', fontSize: '12.5px', color: '#334155', fontStyle: 'italic' }}>
                "{selectedCase.quote || 'The jacket is too tight at the shoulders. The tags are attached and I have not worn it. I would like to return it for a refund.'}"
              </blockquote>

              {/* Attachments */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '12px' }}>
                  <FileText size={14} color="#64748B" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>size-label.jpg</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Customer upload · 248 KB · 01 Nov</div>
                  </div>
                  <ExternalLink size={12} color="#94A3B8" style={{ marginLeft: '4px', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '12px' }}>
                  <FileText size={14} color="#64748B" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>item-with-tags.jpg</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Customer upload · 412 KB · 01 Nov</div>
                  </div>
                  <ExternalLink size={12} color="#94A3B8" style={{ marginLeft: '4px', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* Section: Policy & Eligibility */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Policy & eligibility</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Standard returns · Policy v2.3</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <div>
                    <strong>Return window: </strong>
                    <span style={{ color: '#475569' }}>5 days since delivery · within 7-day window</span>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                    Eligible
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <div>
                    <strong>Product category: </strong>
                    <span style={{ color: '#475569' }}>Apparel · no final-sale exclusion</span>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                    Eligible
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <div>
                    <strong>Quantity & prior returns: </strong>
                    <span style={{ color: '#475569' }}>1 purchased · no prior return for this item</span>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                    Verified
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <div>
                    <strong>Item condition: </strong>
                    <span style={{ color: '#475569' }}>Customer reports unused, tags attached</span>
                  </div>
                  <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, fontSize: '11px' }}>
                    Inspect on receipt
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Internal Review Note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Internal review note
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a decision rationale or specify what information is missing. Notes are recorded in the case audit trail."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '12px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Blue Alert Callout */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginBottom: '20px' }}>
              <AlertCircle size={16} color="#0B4EA2" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
                <strong>Approval permits the return only</strong> — The item must be received and inspected before finance can authorize a refund. No payment is issued by this decision.
              </div>
            </div>

            {/* Action Buttons matching media_1795254092874_4dc9995d.jpg */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                style={{
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#DC2626',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                Reject return
              </button>
              <button
                type="button"
                style={{
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Request information
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(11, 78, 162, 0.2)',
                }}
              >
                <Check size={14} />
                <span>{isProcessing ? 'Processing...' : 'Approve return'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '24px' }}>
        <div>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</div>
        <div>Everest Pasal / Operations</div>
      </div>
    </div>
  );
};
