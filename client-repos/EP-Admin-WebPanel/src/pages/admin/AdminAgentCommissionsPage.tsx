import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Clock,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface CommissionRecord {
  id: string;
  commissionId: string;
  orderId: string;
  orderDate: string;
  agentName: string;
  agentId: string;
  eligibleBase: number;
  grossAmount: number;
  policy: string;
  ratePercent: number;
  commissionAmount: number;
  state: 'Approved' | 'Pending Review' | 'Reversed' | 'Reserved';
  adjustment: string;
}

export const AdminAgentCommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    {
      id: '1',
      commissionId: 'COM-6001',
      orderId: 'ORD-AG2001',
      orderDate: '30 Oct 2026',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      eligibleBase: 10000,
      grossAmount: 10800,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 500,
      state: 'Approved',
      adjustment: 'None',
    },
    {
      id: '2',
      commissionId: 'COM-6000',
      orderId: 'ORD-AG2002',
      orderDate: '29 Oct 2026',
      agentName: 'Nirmala Rai',
      agentId: 'AGT-1002',
      eligibleBase: 8000,
      grossAmount: 8400,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 400,
      state: 'Pending Review',
      adjustment: 'None',
    },
    {
      id: '3',
      commissionId: 'COM-5998',
      orderId: 'ORD-AG2003',
      orderDate: '28 Oct 2026',
      agentName: 'Bikash Thapa',
      agentId: 'AGT-1003',
      eligibleBase: 13000,
      grossAmount: 14200,
      policy: 'Tier 2 Territory',
      ratePercent: 5.5,
      commissionAmount: 715,
      state: 'Approved',
      adjustment: 'None',
    },
    {
      id: '4',
      commissionId: 'COM-5995',
      orderId: 'ORD-AG2004',
      orderDate: '27 Oct 2026',
      agentName: 'Pratik Shrestha',
      agentId: 'AGT-1004',
      eligibleBase: 8000,
      grossAmount: 8000,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 0,
      state: 'Reversed',
      adjustment: '-NPR 400 (Cancellation)',
    },
    {
      id: '5',
      commissionId: 'COM-5991',
      orderId: 'ORD-AG2005',
      orderDate: '26 Oct 2026',
      agentName: 'Sarita Gurung',
      agentId: 'AGT-1005',
      eligibleBase: 6000,
      grossAmount: 6500,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 300,
      state: 'Pending Review',
      adjustment: 'None',
    },
    {
      id: '6',
      commissionId: 'COM-5988',
      orderId: 'ORD-AG2006',
      orderDate: '25 Oct 2026',
      agentName: 'Roshani Lama',
      agentId: 'AGT-1007',
      eligibleBase: 12000,
      grossAmount: 12500,
      policy: 'Tier 2 Territory',
      ratePercent: 5.5,
      commissionAmount: 660,
      state: 'Approved',
      adjustment: 'None',
    },
    {
      id: '7',
      commissionId: 'COM-5985',
      orderId: 'ORD-AG2007',
      orderDate: '24 Oct 2026',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      eligibleBase: 5000,
      grossAmount: 5200,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 250,
      state: 'Approved',
      adjustment: 'None',
    },
    {
      id: '8',
      commissionId: 'COM-5982',
      orderId: 'ORD-AG2008',
      orderDate: '23 Oct 2026',
      agentName: 'Deepak Adhikari',
      agentId: 'AGT-1006',
      eligibleBase: 6500,
      grossAmount: 7000,
      policy: 'Standard Field',
      ratePercent: 5.0,
      commissionAmount: 325,
      state: 'Pending Review',
      adjustment: 'None',
    },
  ]);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [policyFilter, setPolicyFilter] = useState('All');
  const [selectedComm, setSelectedComm] = useState<CommissionRecord>(commissions[0]);

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents/commissions')
      .then((res) => {
        if (res?.data?.commissions && Array.isArray(res.data.commissions)) {
          setCommissions(res.data.commissions);
          if (res.data.commissions.length > 0) {
            setSelectedComm(res.data.commissions[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    exportToCsv({
      filename: 'agent_commissions_ledger.csv',
      title: 'EVEREST PASAL — AGENT COMMISSIONS LEDGER',
      headers: ['Commission ID', 'Order ID', 'Date', 'Agent', 'Eligible Base', 'Policy', 'Commission', 'State', 'Adjustment'],
      rows: commissions.map((c) => [
        c.commissionId,
        c.orderId,
        c.orderDate,
        `${c.agentName} (${c.agentId})`,
        `NPR ${c.eligibleBase}`,
        `${c.policy} (${c.ratePercent}%)`,
        `NPR ${c.commissionAmount}`,
        c.state,
        c.adjustment,
      ]),
    });
  };

  const filteredCommissions = commissions.filter((c) => {
    const matchesSearch =
      c.commissionId.toLowerCase().includes(search.toLowerCase()) ||
      c.orderId.toLowerCase().includes(search.toLowerCase()) ||
      c.agentName.toLowerCase().includes(search.toLowerCase()) ||
      c.agentId.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === 'All' || c.state === stateFilter;
    const matchesPolicy = policyFilter === 'All' || c.policy.includes(policyFilter);
    return matchesSearch && matchesState && matchesPolicy;
  });

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
            Agent Commissions
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Review commission calculations, attribution logic, adjustments and approval status.
          </p>
        </div>

        <button
          onClick={handleExport}
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
          <span>Export ledger</span>
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
        {/* Approved · Last 30 days */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Approved · Last 30 days
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
            NPR 31,250
          </div>
        </div>

        {/* Pending review */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Pending review
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '6px' }}>
            NPR 11,250
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
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
            NPR 3,250
          </div>
        </div>

        {/* Reversals · excluded */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Reversals · excluded
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#E63946', marginTop: '6px' }}>
            NPR 1,500
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
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
              maxWidth: '380px',
            }}
          >
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search commission ID, order or agent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              fontSize: '12.5px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="All">All review states</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reversed">Reversed</option>
          </select>

          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              fontSize: '12.5px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="All">All policy tiers</option>
            <option value="Standard">Standard Field (5%)</option>
            <option value="Tier 2">Tier 2 Territory (5.5%)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  COMMISSION / SOURCE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  AGENT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ELIGIBLE BASE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  POLICY / RATE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  COMMISSION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  REVIEW / PAYOUT STATE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ADJUSTMENT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map((c) => {
                const isSelected = selectedComm.commissionId === c.commissionId;
                return (
                  <tr
                    key={c.commissionId}
                    onClick={() => setSelectedComm(c)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Commission ID / Order */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{c.commissionId}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {c.orderId} · {c.orderDate}
                      </div>
                    </td>

                    {/* Agent */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{c.agentName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {c.agentId}
                      </div>
                    </td>

                    {/* Eligible Base */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        NPR {c.eligibleBase.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        Gross NPR {c.grossAmount.toLocaleString()}
                      </div>
                    </td>

                    {/* Policy / Rate */}
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {c.policy} · {c.ratePercent}%
                    </td>

                    {/* Commission */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                      NPR {c.commissionAmount.toLocaleString()}
                    </td>

                    {/* Review / Payout State */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            c.state === 'Approved'
                              ? '#DCFCE7'
                              : c.state === 'Pending Review'
                              ? '#FEF3C7'
                              : c.state === 'Reversed'
                              ? '#FEE2E2'
                              : '#E0F2FE',
                          color:
                            c.state === 'Approved'
                              ? '#15803D'
                              : c.state === 'Pending Review'
                              ? '#92400E'
                              : c.state === 'Reversed'
                              ? '#B91C1C'
                              : '#0369A1',
                        }}
                      >
                        {c.state}
                      </span>
                    </td>

                    {/* Adjustment */}
                    <td style={{ padding: '14px 16px', fontSize: '11.5px', color: c.adjustment === 'None' ? '#64748B' : '#E63946', fontWeight: c.adjustment === 'None' ? 400 : 600 }}>
                      {c.adjustment}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComm(c);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#0B4EA2',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '8px' }}>●</span> View calculation
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748B',
          }}
        >
          <div>Showing 1–8 of 48 commissions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Previous
            </button>
            <button
              style={{
                border: '1px solid #0B4EA2',
                background: '#0B4EA2',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              1
            </button>
            <button
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Calculation Detail Bottom Drawer (Matching Reference Screenshot) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Calculation Detail Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
            Calculation detail · {selectedComm.commissionId}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
            Attributed to {selectedComm.agentName} ({selectedComm.agentId}) · Source: {selectedComm.orderId}
          </div>

          {/* Formula calculation container */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              marginTop: '12px',
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
              Order total NPR {selectedComm.grossAmount.toLocaleString()} - NPR {(selectedComm.grossAmount - selectedComm.eligibleBase).toLocaleString()} (Tax/Shipping) = NPR {selectedComm.eligibleBase.toLocaleString()} net base × {selectedComm.ratePercent}% = NPR {selectedComm.commissionAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Policy: {selectedComm.policy} Commission v2.1 · Attribution: Direct Agent Code {selectedComm.agentId}
            </div>
          </div>
        </div>

        {/* Right Commission Actions */}
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
              Commission actions
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
              onClick={() => {
                alert(`Commission ${selectedComm.commissionId} approved for payout.`);
                const updated = commissions.map((c) =>
                  c.commissionId === selectedComm.commissionId ? { ...c, state: 'Approved' as any } : c
                );
                setCommissions(updated);
                setSelectedComm({ ...selectedComm, state: 'Approved' });
              }}
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
              Approve commission
            </div>
            <div
              onClick={() => alert(`Payout placed on hold for investigation: ${selectedComm.commissionId}`)}
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
              Hold payout
            </div>
            <div
              onClick={() => alert(`Recalculated commission: NPR ${selectedComm.commissionAmount}`)}
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
              Recalculate
            </div>
            <div
              onClick={() =>
                exportToCsv({
                  filename: `${selectedComm.commissionId}_breakdown.csv`,
                  title: `EVEREST PASAL — COMMISSION BREAKDOWN ${selectedComm.commissionId}`,
                  headers: ['Commission ID', 'Order ID', 'Date', 'Agent', 'Eligible Base', 'Policy', 'Commission', 'State', 'Adjustment'],
                  rows: [[
                    selectedComm.commissionId,
                    selectedComm.orderId,
                    selectedComm.orderDate,
                    `${selectedComm.agentName} (${selectedComm.agentId})`,
                    `NPR ${selectedComm.eligibleBase}`,
                    `${selectedComm.policy} (${selectedComm.ratePercent}%)`,
                    `NPR ${selectedComm.commissionAmount}`,
                    selectedComm.state,
                    selectedComm.adjustment,
                  ]],
                })
              }
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
              Download breakdown
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAgentCommissionsPage;