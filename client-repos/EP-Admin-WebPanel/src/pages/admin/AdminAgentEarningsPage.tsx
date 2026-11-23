import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface PayoutRecord {
  id: string;
  payoutId: string;
  agentName: string;
  agentId: string;
  amount: number;
  method: string;
  destination: string;
  requestedAt: string;
  status: 'Pending Review' | 'Processing' | 'Completed' | 'Failed';
}

interface StatementRecord {
  id: string;
  statementId: string;
  agentName: string;
  agentId: string;
  period: string;
  totalOrders: number;
  grossCommission: number;
  withholdings: number;
  netPayable: number;
  status: 'Settled' | 'Draft' | 'Processing';
}

export const AdminAgentEarningsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: '1',
      payoutId: 'PAY-301',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      amount: 1000,
      method: 'eSewa',
      destination: '9841234567',
      requestedAt: '01 Nov 2026 10:12 NPT',
      status: 'Pending Review',
    },
    {
      id: '2',
      payoutId: 'PAY-300',
      agentName: 'Nirmala Rai',
      agentId: 'AGT-1002',
      amount: 2500,
      method: 'Bank transfer',
      destination: 'Nabil Bank · 0192837461',
      requestedAt: '31 Oct 2026 15:30 NPT',
      status: 'Processing',
    },
    {
      id: '3',
      payoutId: 'PAY-298',
      agentName: 'Bikash Thapa',
      agentId: 'AGT-1003',
      amount: 1500,
      method: 'Khalti',
      destination: '9801239876',
      requestedAt: '30 Oct 2026 11:20 NPT',
      status: 'Completed',
    },
    {
      id: '4',
      payoutId: 'PAY-295',
      agentName: 'Sarita Gurung',
      agentId: 'AGT-1005',
      amount: 3000,
      method: 'eSewa',
      destination: '9812345678',
      requestedAt: '29 Oct 2026 16:00 NPT',
      status: 'Completed',
    },
    {
      id: '5',
      payoutId: 'PAY-290',
      agentName: 'Roshani Lama',
      agentId: 'AGT-1007',
      amount: 2000,
      method: 'Bank transfer',
      destination: 'Global IME · 2847192847',
      requestedAt: '28 Oct 2026 09:45 NPT',
      status: 'Completed',
    },
  ]);

  const [statements, setStatements] = useState<StatementRecord[]>([
    {
      id: '1',
      statementId: 'STM-2026-10-01',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      period: 'Oct 2026',
      totalOrders: 28,
      grossCommission: 9120,
      withholdings: 1368,
      netPayable: 7752,
      status: 'Settled',
    },
    {
      id: '2',
      statementId: 'STM-2026-10-02',
      agentName: 'Nirmala Rai',
      agentId: 'AGT-1002',
      period: 'Oct 2026',
      totalOrders: 22,
      grossCommission: 7260,
      withholdings: 1089,
      netPayable: 6171,
      status: 'Settled',
    },
    {
      id: '3',
      statementId: 'STM-2026-10-03',
      agentName: 'Bikash Thapa',
      agentId: 'AGT-1003',
      period: 'Oct 2026',
      totalOrders: 19,
      grossCommission: 5925,
      withholdings: 888.75,
      netPayable: 5036.25,
      status: 'Settled',
    },
  ]);

  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord>(payouts[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents/earnings')
      .then((res) => {
        if (res?.data?.payouts && Array.isArray(res.data.payouts)) {
          setPayouts(res.data.payouts);
          if (res.data.payouts.length > 0) {
            setSelectedPayout(res.data.payouts[0]);
          }
        }
        if (res?.data?.statements && Array.isArray(res.data.statements)) {
          setStatements(res.data.statements);
        }
      })
      .catch(() => {});
  }, []);

  const handleReviewPayout = (payout: PayoutRecord, action: 'Approve' | 'Reject') => {
    const nextStatus = action === 'Approve' ? 'Completed' : 'Failed';
    ApiClient.put(`/api/v1/admin/agents/payouts/${payout.payoutId}/review`, {
      action,
    }).catch(() => {});

    setPayouts((prev) =>
      prev.map((p) => (p.payoutId === payout.payoutId ? { ...p, status: nextStatus as any } : p))
    );
    if (selectedPayout.payoutId === payout.payoutId) {
      setSelectedPayout({ ...selectedPayout, status: nextStatus as any });
    }
    alert(`Payout ${payout.payoutId} marked as ${nextStatus}!`);
  };

  const handleExportStatements = () => {
    exportToCsv({
      filename: 'agent_monthly_statements.csv',
      title: 'EVEREST PASAL — AGENT MONTHLY STATEMENTS',
      headers: ['Statement ID', 'Agent', 'Period', 'Orders', 'Gross Commission', 'TDS (15%)', 'Net Payable', 'Status'],
      rows: statements.map((s) => [
        s.statementId,
        `${s.agentName} (${s.agentId})`,
        s.period,
        s.totalOrders,
        `NPR ${s.grossCommission}`,
        `NPR ${s.withholdings}`,
        `NPR ${s.netPayable}`,
        s.status,
      ]),
    });
  };

  const filteredPayouts = payouts.filter(
    (p) =>
      p.payoutId.toLowerCase().includes(search.toLowerCase()) ||
      p.agentName.toLowerCase().includes(search.toLowerCase()) ||
      p.agentId.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Poppins', sans-serif",
        color: '#0F172A',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
            Agent Earnings
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage payout requests, balance settlements and commission statement reconciliation.
          </p>
        </div>

        <button
          onClick={handleExportStatements}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0B4EA2',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Download size={15} />
          <span>Export statements</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Approved */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Approved
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
            NPR 31,250
          </div>
        </div>

        {/* Pending commissions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Pending commissions
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '6px' }}>
            NPR 11,250
          </div>
        </div>

        {/* Paid commissions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Paid commissions
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
            NPR 28,000
          </div>
        </div>

        {/* Available approved */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Available approved
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0B4EA2', marginTop: '6px' }}>
            NPR 3,250
          </div>
        </div>
      </div>

      {/* Top Notice Banner */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          borderRadius: '10px',
          border: '1px solid #BFDBFE',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Info size={18} color="#1D4ED8" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12.5px', color: '#1E40AF', fontWeight: 500 }}>
          Payout reservations are not payments. Reserving commissions locks the funds for batch processing. Payout completion requires bank or digital wallet confirmation.
        </div>
      </div>

      {/* Table 1: Payout workbench */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            Payout workbench
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              padding: '5px 10px',
              gap: '6px',
              width: '240px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search payout ID or agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  PAYOUT ID / AGENT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  AMOUNT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  METHOD / DESTINATION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  REQUESTED AT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((p) => {
                const isSelected = selectedPayout.payoutId === p.payoutId;
                return (
                  <tr
                    key={p.payoutId}
                    onClick={() => setSelectedPayout(p)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* ID / Agent */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.payoutId}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {p.agentName} ({p.agentId})
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                      NPR {p.amount.toLocaleString()}
                    </td>

                    {/* Method / Destination */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#1E293B', fontWeight: 500 }}>{p.method}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {p.destination}
                      </div>
                    </td>

                    {/* Requested At */}
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                      {p.requestedAt}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            p.status === 'Completed'
                              ? '#DCFCE7'
                              : p.status === 'Processing'
                              ? '#E0F2FE'
                              : p.status === 'Pending Review'
                              ? '#FEF3C7'
                              : '#FEE2E2',
                          color:
                            p.status === 'Completed'
                              ? '#15803D'
                              : p.status === 'Processing'
                              ? '#0369A1'
                              : p.status === 'Pending Review'
                              ? '#92400E'
                              : '#B91C1C',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      {p.status === 'Pending Review' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewPayout(p, 'Approve');
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#0B4EA2',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewPayout(p, 'Reject');
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#FFF1F2',
                              color: '#E63946',
                              border: '1px solid #FECDD3',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#64748B' }}>● View receipt</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Agent statements */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            Agent statements
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            Monthly tax and commission reconciliation statements
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  STATEMENT ID
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  AGENT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  PERIOD
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  TOTAL ORDERS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  GROSS COMMISSION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  WITHHOLDINGS (TDS 15%)
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  NET PAYABLE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  STATEMENT STATUS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  DOWNLOAD
                </th>
              </tr>
            </thead>
            <tbody>
              {statements.map((s) => (
                <tr key={s.statementId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>
                    {s.statementId}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{s.agentName}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{s.agentId}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>
                    {s.period}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1E293B' }}>
                    {s.totalOrders} orders
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>
                    NPR {s.grossCommission.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#E63946', fontWeight: 500 }}>
                    -NPR {s.withholdings.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#15803D' }}>
                    NPR {s.netPayable.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => alert(`Downloading PDF Statement for ${s.agentName} (${s.statementId})`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0B4EA2',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Payout Actions Drawer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
            Batch Payout Engine
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
            Automated settlement batches are compiled every Friday at 17:00 NPT. Digital wallet transfers (eSewa / Khalti) are disbursed via direct API gateway; bank transfers are generated in ACH file format.
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Payout actions
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>^</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              onClick={() => alert('Batch payout processor initiated for pending requests.')}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Process batch payout
            </div>
            <div
              onClick={() => handleExportStatements()}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Export tax report (TDS)
            </div>
            <div
              onClick={() => (window.location.href = `/admin/payments/reconciliation`)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Reconcile gateway
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAgentEarningsPage;