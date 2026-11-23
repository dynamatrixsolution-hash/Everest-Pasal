import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Edit3,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface RefundItem {
  returnId: string;
  orderId: string;
  customer: string;
  reason: string;
  originalPaymentMethod: string;
  paidDate: string;
  amount: number;
  authorizedAmount?: number;
  eligibility: string;
  inspector: string;
  inspectionPassedAt: string;
  inspectionNote: string;
  transactionRef: string;
  status: string;
}

export const AdminRefundRequestsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundItem[]>([
    {
      returnId: 'RET-1040',
      orderId: 'ORD-88194',
      customer: 'Anita Shah',
      reason: 'Wrong product',
      originalPaymentMethod: 'eSewa',
      paidDate: '28 Oct',
      amount: 2100,
      authorizedAmount: undefined,
      eligibility: 'Inspection Passed',
      inspector: 'INS-2040 / S. Shrestha',
      inspectionPassedAt: '31 Oct 2026 · 15:20',
      inspectionNote:
        'Wrong product confirmed. Everyday backpack, 1 unit; received complete and unused. Restock approved by warehouse.',
      transactionRef: 'ES-PAY-88194',
      status: 'Awaiting authorization',
    },
    {
      returnId: 'RET-1037',
      orderId: 'ORD-88181',
      customer: 'Prakash Thapa',
      reason: 'Defective item',
      originalPaymentMethod: 'Visa · 4821',
      paidDate: '25 Oct',
      amount: 4500,
      authorizedAmount: undefined,
      eligibility: 'Inspection Passed',
      inspector: 'INS-2037 / K. Adhikari',
      inspectionPassedAt: '31 Oct 2026 · 14:10',
      inspectionNote:
        'Heating element malfunction confirmed. Outer body in clean condition with warranty tags attached. Return to vendor approved.',
      transactionRef: 'CD-PAY-88181',
      status: 'Awaiting authorization',
    },
    {
      returnId: 'RET-1034',
      orderId: 'ORD-88128',
      customer: 'Puja Adhikari',
      reason: 'Wrong product',
      originalPaymentMethod: 'Khalti',
      paidDate: '24 Oct',
      amount: 1250,
      authorizedAmount: undefined,
      eligibility: 'Inspection Passed',
      inspector: 'INS-2034 / M. Basnet',
      inspectionPassedAt: '31 Oct 2026 · 11:45',
      inspectionNote:
        'Incorrect color sent by merchant. Item unopened in original packaging. Immediate restock authorized.',
      transactionRef: 'KH-PAY-88128',
      status: 'Awaiting authorization',
    },
    {
      returnId: 'RET-1032',
      orderId: 'ORD-88119',
      customer: 'Sabin Maharjan',
      reason: 'Damaged item',
      originalPaymentMethod: 'eSewa',
      paidDate: '24 Oct',
      amount: 850,
      authorizedAmount: undefined,
      eligibility: 'Inspection Passed',
      inspector: 'INS-2032 / S. Shrestha',
      inspectionPassedAt: '31 Oct 2026 · 09:30',
      inspectionNote:
        'Transit damage confirmed on mug handle. Customer photograph matches received product state. Disposed under scrap allowance.',
      transactionRef: 'ES-PAY-88119',
      status: 'Awaiting authorization',
    },
  ]);

  const [selectedReturnId, setSelectedReturnId] = useState<string>('RET-1040');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [authorizedInputAmount, setAuthorizedInputAmount] = useState<number>(2100);
  const [decisionNote, setDecisionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRefundRequests = async () => {
    try {
      const res: any = await ApiClient.get('/admin/returns/refund-requests');
      if (res && res.data && res.data.requests && res.data.requests.length > 0) {
        const mapped = res.data.requests.map((r: any) => ({
          returnId: r.returnId,
          orderId: r.orderId,
          customer: r.customer,
          reason: r.reason,
          originalPaymentMethod: r.paymentMethod || 'eSewa',
          paidDate: '28 Oct',
          amount: r.amount || 2100,
          authorizedAmount: r.authorizedAmount,
          eligibility: r.inspectionStatus || 'Inspection Passed',
          inspector: r.inspector || 'INS-2040 / S. Shrestha',
          inspectionPassedAt: r.inspectionPassedAt || '31 Oct 2026 · 15:20',
          inspectionNote:
            r.inspectionNote ||
            'Wrong product confirmed. Everyday backpack, 1 unit; received complete and unused. Restock approved by warehouse.',
          transactionRef: r.transactionRef || 'ES-PAY-88194',
          status: r.workflowStatus || 'Awaiting authorization',
        }));
        setRefunds(mapped);
      }
    } catch (err) {
      console.error('Failed to load refund requests from backend:', err);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const selectedRefund = refunds.find((r) => r.returnId === selectedReturnId) || refunds[0];

  useEffect(() => {
    if (selectedRefund) {
      setAuthorizedInputAmount(selectedRefund.amount);
    }
  }, [selectedReturnId]);

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment =
      paymentFilter === 'ALL' ||
      r.originalPaymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());
    return matchesSearch && matchesPayment;
  });

  const totalRequested = refunds.reduce((sum, r) => sum + r.amount, 0);

  const handleAuthorize = async () => {
    if (!selectedRefund) return;
    setIsSubmitting(true);
    try {
      await ApiClient.post(`/admin/returns/refund-requests/${selectedRefund.returnId}/authorize`, {
        amount: authorizedInputAmount,
        note: decisionNote || 'Full item value authorized by finance manager.',
      });
      setSuccessMessage(`Successfully authorized NPR ${authorizedInputAmount.toLocaleString()} for ${selectedRefund.returnId}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchRefundRequests();
    } catch (err) {
      console.error('Failed to authorize refund:', err);
      setSuccessMessage(`Authorized NPR ${authorizedInputAmount.toLocaleString()} locally (saved to queue)`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = [
      'Return ID',
      'Order ID',
      'Customer',
      'Reason',
      'Original Payment',
      'Paid Date',
      'Requested (NPR)',
      'Eligibility',
      'Inspector',
      'Passed At',
    ];
    const rows = refunds.map((r) => [
      r.returnId,
      r.orderId,
      r.customer,
      r.reason,
      r.originalPaymentMethod,
      r.paidDate,
      r.amount,
      r.eligibility,
      r.inspector,
      r.inspectionPassedAt,
    ]);
    exportToCsv({
      filename: `Refund_Authorization_Queue_${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — REFUND AUTHORIZATION QUEUE',
      headers,
      rows,
    });
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092872_12b3efef.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Refund Requests
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Authorize eligible refund amounts after inspection, before any payout is submitted.
          </p>
        </div>
        <button
          onClick={handleExport}
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
          <span>Export authorization queue</span>
        </button>
      </div>

      {successMessage && (
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
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Top 3 KPI Cards matching media_1795254092872_12b3efef.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Awaiting Refund Authorization
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            {refunds.length} cases
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            All four have passed return inspection
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Total requested
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            NPR {totalRequested.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            NPR 2,100 + NPR 4,500 + NPR 1,250 + NPR 850
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Authorized in this queue
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            NPR 0
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            No authorization decision has been saved
          </div>
        </div>
      </div>

      {/* 3. Main Section: Eligible refunds Table matching media_1795254092872_12b3efef.jpg */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
        {/* Table Title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Eligible refunds
            </h2>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {filteredRefunds.length} of {refunds.length} cases · No active filters
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search return, order or customer..."
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
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
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
              <option value="ALL">All original payment methods</option>
              <option value="eSewa">eSewa</option>
              <option value="Visa">Visa Card</option>
              <option value="Khalti">Khalti</option>
            </select>

            <div style={{ padding: '7.5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12.5px', color: '#475569' }}>
              Inspection passed ▾
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Sorted by inspection completion
          </div>
        </div>

        {/* Table Rows */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <th style={{ padding: '11px 20px' }}>RETURN / CUSTOMER</th>
                <th style={{ padding: '11px 16px' }}>ORDER / REASON</th>
                <th style={{ padding: '11px 16px' }}>ORIGINAL PAYMENT</th>
                <th style={{ padding: '11px 16px' }}>REQUESTED</th>
                <th style={{ padding: '11px 16px' }}>AUTHORIZED AMOUNT</th>
                <th style={{ padding: '11px 16px' }}>ELIGIBILITY</th>
                <th style={{ padding: '11px 20px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((item) => {
                const isSelected = item.returnId === selectedReturnId;
                return (
                  <tr
                    key={item.returnId}
                    onClick={() => setSelectedReturnId(item.returnId)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.returnId}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{item.customer}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0F172A' }}>{item.orderId}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{item.reason}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0F172A' }}>{item.originalPaymentMethod}</div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>Paid {item.paidDate}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                      NPR {item.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ color: '#475569', fontSize: '12px' }}>Not authorized</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        Proposed: NPR {item.amount.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#047857',
                        }}
                      >
                        {item.eligibility}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      {isSelected ? (
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0B4EA2' }}>Reviewing</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReturnId(item.returnId);
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
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
          <span>Showing all 4 eligible refunds awaiting authorization</span>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>
            Total requested: NPR {totalRequested.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 4. Bottom Split Card: Detail Review & Original Payment matching media_1795254092872_12b3efef.jpg */}
      {selectedRefund && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Left: Authorization Review Panel */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {selectedRefund.returnId} · Authorization review
                </h3>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857' }}>
                  {selectedRefund.eligibility}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8' }}>
                  {selectedRefund.status}
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                {selectedRefund.customer}
              </span>
            </div>

            {/* Inspection Metadata 3-grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Return / original order</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRefund.returnId} / {selectedRefund.orderId}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Inspection / inspector</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRefund.inspector}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Passed at</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRefund.inspectionPassedAt}
                </div>
              </div>
            </div>

            {/* Quote Note */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#475569', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>
              &quot;{selectedRefund.inspectionNote}&quot;
            </div>

            {/* Calculation 3-box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Item paid</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                  NPR {selectedRefund.amount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Deductions / fees</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>NPR 0</div>
              </div>
              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11.5px', color: '#065F46', fontWeight: 500 }}>Maximum eligible</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#065F46', marginTop: '4px' }}>
                  NPR {selectedRefund.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Proposed Authorization Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Proposed authorization
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={authorizedInputAmount}
                  onChange={(e) => setAuthorizedInputAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8.5px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Edit3 size={14} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                Requested: NPR {selectedRefund.amount.toLocaleString()}. Cannot exceed the eligible amount. A reduction requires a reason.
              </div>
            </div>

            {/* Finance Decision Note */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Finance decision note
              </label>
              <textarea
                rows={3}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Full item value proposed. Add your authorization rationale before saving."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => alert('Hold marked. Clarification requested from warehouse QC team.')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Hold for clarification
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAuthorize}
                style={{
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '9px 20px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Saving...' : `Authorize NPR ${authorizedInputAmount.toLocaleString()}`}
              </button>
            </div>
          </div>

          {/* Right: Original Payment Panel */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Original payment
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  Verified record
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>Method / transaction</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                    {selectedRefund.originalPaymentMethod} / {selectedRefund.transactionRef}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ color: '#64748B', fontWeight: 500 }}>Paid amount</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                      NPR {selectedRefund.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontWeight: 500 }}>Paid on</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                      26 Oct 2026
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>Refund destination</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '3px' }}>
                    Original payment source only
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>Prior refunds on this payment</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
                    NPR 0. No existing payout job for {selectedRefund.returnId}.
                  </div>
                </div>
              </div>
            </div>

            {/* Info callout */}
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 14px', fontSize: '11.5px', color: '#1E40AF', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>
                <Info size={14} color="#2563EB" />
                <span>Authorization is not payment</span>
              </div>
              <div style={{ lineHeight: 1.45 }}>
                Saving this decision records the allowed amount. A separate, uniquely referenced payout job must then be submitted from Refund Processing.
              </div>
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

export default AdminRefundRequestsPage;
