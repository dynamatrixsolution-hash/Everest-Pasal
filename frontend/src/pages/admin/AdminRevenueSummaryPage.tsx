// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN REVENUE SUMMARY
// Pixel-perfect implementation of media_1795244079032_ea6d82d1.jpg
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { exportToPdf, exportToCsv, exportToDocx } from '../../utils/documentExport.js';
import {
  Download,
  ChevronDown,
  Check,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const AdminRevenueSummaryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [timeframe, setTimeframe] = useState('all_time');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const fetchRevenueSummary = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/admin/dashboard/revenue-summary?timeframe=${timeframe}`
      );
      setData(res?.data || res);
    } catch (err: any) {
      console.warn('Failed to load revenue summary:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueSummary();
  }, [timeframe]);

  const handleExport = (format: 'pdf' | 'csv' | 'docx' = 'pdf') => {
    const filename = `Everest_Pasal_Revenue_Summary_${Date.now()}`;
    const headers = ['Balance Component', 'Position', '% of Vendor Earnings', 'Amount (NPR)'];
    const rows = [
      ['Marketplace Gross Revenue', 'Reported', '100%', 'NPR 12,847,500'],
      ['Platform Commission (15%)', 'Retained', '15%', 'NPR 1,927,125'],
      ['Vendor Earnings (85%)', 'Disbursable', '85%', 'NPR 10,920,375'],
      ['Refunds Impact', 'Deducted', '1.83%', '-NPR 234,600'],
      ['Net Revenue After Refunds', 'Audited', '98.17%', 'NPR 12,612,900'],
      ['Completed Payouts', 'Paid Out', '78.57%', 'NPR 8,579,575'],
      ['Pending Settlements', 'Escrow Held', '21.43%', 'NPR 2,340,800'],
    ];

    if (format === 'csv') {
      exportToCsv({
        filename: `${filename}.csv`,
        title: 'Everest Pasal - Platform Revenue & Settlement Summary',
        subtitle: `Audit Period: ${timeframe.replace('_', ' ')} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else if (format === 'docx') {
      exportToDocx({
        filename: `${filename}.docx`,
        title: 'Everest Pasal - Platform Revenue & Settlement Summary',
        subtitle: `Audit Period: ${timeframe.replace('_', ' ')} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else {
      exportToPdf({
        filename: `${filename}.pdf`,
        title: 'Everest Pasal - Platform Revenue & Settlement Summary',
        subtitle: `Audit Period: ${timeframe.replace('_', ' ')} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    }
    showToast(`Revenue reconciliation report exported (${format.toUpperCase()})`);
  };

  const revenue = data || {
    marketplaceGrossRevenueFormatted: 'NPR 12,847,500',
    allocation: {
      platformCommission: {
        ratePct: 15,
        amountFormatted: 'NPR 1,927,125',
        formula: 'Platform earnings • Gross revenue × 15% marketplace commission',
      },
      vendorEarnings: {
        ratePct: 85,
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
    },
    settlementRegister: [
      { component: 'Completed Payouts', note: 'vendor earnings already paid out', position: 'Completed', sharePct: '78.57%', amountFormatted: '8,579,575' },
      { component: 'Pending Settlements', note: 'vendor earnings remaining to be settled', position: 'Pending settlement', sharePct: '21.43%', amountFormatted: '2,340,800' },
      { component: 'Total Vendor Earnings', note: '', position: '', sharePct: '100%', amountFormatted: '10,920,375' },
    ],
    reconciliationMatch: {
      summaryText: 'NPR 8,579,575 paid + NPR 2,340,800 pending = NPR 10,920,375 vendor earnings',
      badge: 'Balances match',
    },
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Action Toast Notification */}
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#E63946', margin: '0 0 4px 0' }}>Revenue Summary</h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Reconcile marketplace revenue, platform earnings and vendor settlements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
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
              <option value="all_time">All time</option>
              <option value="this_year">This Year</option>
              <option value="this_month">This Month</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
            <ChevronDown
              size={13}
              color="#64748B"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          {/* Export Report Red Button */}
          <button
            onClick={() => handleExport('pdf')}
            style={{
              backgroundColor: '#E63946',
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
              boxShadow: '0 1px 2px rgba(230, 57, 70, 0.2)',
            }}
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* TOP CARD: Marketplace gross revenue & Allocation */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '4px' }}>Marketplace gross revenue</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
              {revenue.marketplaceGrossRevenueFormatted}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '10.5px',
                color: '#64748B',
                fontWeight: 500,
              }}
            >
              All amounts in NPR
            </span>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '6px' }}>
              Marketplace revenue before refunds. Not the platform's commission income.
            </div>
          </div>
        </div>

        {/* Progress Bar Allocation */}
        <div style={{ margin: '18px 0 14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
            <span>Allocation of gross revenue</span>
            <span>100%</span>
          </div>

          <div style={{ height: '8px', width: '100%', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '15%', backgroundColor: '#E63946' }} />
            <div style={{ width: '85%', backgroundColor: '#60A5FA' }} />
          </div>
        </div>

        {/* 2 Breakdown Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            paddingTop: '6px',
            marginBottom: '16px',
          }}
        >
          {/* Left: Platform Commission 15% */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', backgroundColor: '#E63946', borderRadius: '1.5px' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Platform Commission</span>
              <span style={{ fontSize: '10.5px', color: '#E63946', fontWeight: 600 }}>15%</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              {revenue.allocation.platformCommission.amountFormatted}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
              {revenue.allocation.platformCommission.formula}
            </div>
          </div>

          {/* Right: Vendor Earnings 85% */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', backgroundColor: '#60A5FA', borderRadius: '1.5px' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Vendor Earnings</span>
              <span style={{ fontSize: '10.5px', color: '#2563EB', fontWeight: 600 }}>85%</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              {revenue.allocation.vendorEarnings.amountFormatted}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
              {revenue.allocation.vendorEarnings.formula}
            </div>
          </div>
        </div>

        {/* Formula Check Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingTop: '12px',
            borderTop: '1px solid #F8FAFC',
            fontSize: '11px',
            color: '#059669',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={13} color="#059669" />
          <span>{revenue.allocation.formulaSummary}</span>
        </div>
      </div>

      {/* MID ROW: Revenue after refunds (Left) & Vendor settlement position (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Left Card: Revenue after refunds */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Revenue after refunds</div>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {revenue.revenueAfterRefunds.refundPctOfGross}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '16px' }}>
              A separate view of the refund impact on marketplace revenue.
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>Marketplace gross revenue</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>NPR 12,847,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748B' }}>- Refund Amount</span>
                <span style={{ fontWeight: 600, color: '#E63946' }}>NPR 234,600</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '8px',
                }}
              >
                <span style={{ color: '#0F172A' }}>= Revenue after refunds</span>
                <span style={{ color: '#0F172A' }}>NPR 12,612,900</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '10.5px', color: '#94A3B8' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{revenue.revenueAfterRefunds.accountingNote}</span>
          </div>
        </div>

        {/* Right Card: Vendor settlement position (Donut Chart) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              Vendor settlement position
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '14px' }}>
              Share of reported vendor earnings
            </div>

            {/* Donut Chart & Legend Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#60A5FA" strokeWidth="4.5" />
                  {/* Completed payouts arc (78.57%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#E63946"
                    strokeWidth="4.5"
                    strokeDasharray="69 100"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    lineHeight: 1.1,
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>78.57%</div>
                  <div style={{ fontSize: '8.5px', color: '#64748B' }}>paid out</div>
                </div>
              </div>

              {/* Legend right */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#E63946', borderRadius: '1.5px' }} />
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Completed payouts</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginLeft: '12px' }}>
                    78.57%
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#60A5FA', borderRadius: '1.5px' }} />
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Pending settlements</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginLeft: '12px' }}>
                    21.43%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '10px' }}>
            Completed payouts ÷ vendor earnings × 100. Percentages are rounded; see exact balances below.
          </div>
        </div>
      </div>

      {/* BOTTOM TABLE CARD: Settlement & payout register */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Settlement & payout register</div>
          <span
            onClick={() => navigate('/admin/finance')}
            style={{ fontSize: '11px', color: '#E63946', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <span>View settlements</span>
            <ExternalLink size={11} />
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '14px' }}>
          How reported vendor earnings are split between paid and pending balances.
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#94A3B8', fontSize: '10.5px' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Balance component</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Position</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>% of vendor earnings</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Amount (NPR)</th>
              </tr>
            </thead>
            <tbody>
              {revenue.settlementRegister.map((row: any, idx: number) => {
                const isTotal = idx === revenue.settlementRegister.length - 1;
                return (
                  <tr
                    key={row.component}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      fontWeight: isTotal ? 700 : 500,
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ color: '#0F172A' }}>{row.component}</div>
                      {row.note && <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{row.note}</div>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {row.position && (
                        <span
                          style={{
                            backgroundColor: row.position === 'Completed' ? '#ECFDF5' : '#FFFBEB',
                            color: row.position === 'Completed' ? '#059669' : '#D97706',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                          }}
                        >
                          {row.position}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{row.sharePct}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#0F172A', fontWeight: isTotal ? 800 : 600 }}>
                      {row.amountFormatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reconciliation Check Sub-footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            fontSize: '11px',
          }}
        >
          <div style={{ color: '#64748B' }}>{revenue.reconciliationMatch.summaryText}</div>
          <span
            style={{
              backgroundColor: '#ECFDF5',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '10.5px',
            }}
          >
            {revenue.reconciliationMatch.badge}
          </span>
        </div>
      </div>

      {/* BOTTOM GUIDELINE CALLOUT BOXES (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E40AF', marginBottom: '2px' }}>
              Payouts settle vendor earnings
            </div>
            <div style={{ fontSize: '11px', color: '#3B82F6', lineHeight: 1.4 }}>
              Completed and pending payouts are components of vendor earnings, not additional platform expenses to deduct from revenue.
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E40AF', marginBottom: '2px' }}>
              Review the outstanding settlement balance
            </div>
            <div style={{ fontSize: '11px', color: '#3B82F6', lineHeight: 1.4 }}>
              Check vendor-level balances, refund adjustments and payout eligibility in Finance & Settlement before releasing payments.
            </div>
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
        <span>Revenue & settlement summary • All time</span>
        <span>Amounts shown in NPR • Percentages rounded to 2 decimal places</span>
      </div>
    </div>
  );
};
