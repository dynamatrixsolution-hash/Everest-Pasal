// ==============================================================================
// EVEREST PASAL - VENDOR EARNINGS & PAYOUTS MODULE
// Exact pixel-perfect implementation matching user mockup (media_1794204829703_f1726be1.jpg)
//
// Features:
// 1. Header with Date Range Filter & Download Statement Button
// 2. 4 Top Summary KPI Cards (Total Sales, Net Settled, Payouts, Pending Balance) with mask toggle
// 3. Earnings Overview (Daily Area Chart with Festival Peak Tooltip)
// 4. Available for Payout Card (NPR 284,500.00 with "Request Payout Now" Modal)
// 5. Primary Payout Account Card (Nabil Bank Limited, Verified)
// 6. Earnings Reconciliation Equation (Gross Sales -> Discounts -> Platform Fee -> TDS -> Net Vendor Pool)
// 7. Payout History & Bank Disbursals Table (Search, Filter, Receipt View Modal)
// 8. Earnings Transactions & Adjustment Ledger (Order Credits, Commissions, Reversals, Weight Adjustments)
//
// Typography: Poppins font family throughout
// Color Palette: #1A56DB (Primary Blue), #10B981 (Success Green), #EF4444 (Alert Red), #F59E0B (Amber)
// ==============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { ApiClient } from '../../api/client';

export interface PayoutHistoryItem {
  id: string;
  payoutId: string;
  requestDate: string;
  settlementPeriod: string;
  amount: number;
  paymentMethod: string;
  bankRef: string;
  status: 'Paid' | 'Processing' | 'Pending';
  disbursedDate: string;
}

export interface LedgerTransactionItem {
  id: string;
  dateTime: string;
  txnId: string;
  relatedOrder: string;
  transactionType: string;
  gross: number | null;
  feesComm: {
    amount: number;
    label?: string;
    isRebate?: boolean;
  };
  netPayout: number;
  status: 'Holding (7d)' | 'Settled' | 'Available' | 'Pending';
}

const INITIAL_PAYOUTS: PayoutHistoryItem[] = [
  {
    id: 'po-1',
    payoutId: '#PO-9842',
    requestDate: 'Dec 01, 2025',
    settlementPeriod: 'Nov 15 – Nov 30',
    amount: 320000,
    paymentMethod: '● NCHL-IPS Direct',
    bankRef: 'NCHL2025120199428',
    status: 'Paid',
    disbursedDate: 'Dec 02, 2025',
  },
  {
    id: 'po-2',
    payoutId: '#PO-9811',
    requestDate: 'Nov 16, 2025',
    settlementPeriod: 'Nov 01 – Nov 14',
    amount: 415200,
    paymentMethod: '● NCHL-IPS Direct',
    bankRef: 'NCHL2025111624091',
    status: 'Paid',
    disbursedDate: 'Nov 17, 2025',
  },
  {
    id: 'po-3',
    payoutId: '#PO-9764',
    requestDate: 'Nov 01, 2025',
    settlementPeriod: 'Oct 15 – Oct 31',
    amount: 256170,
    paymentMethod: '● Fonepay Corporate',
    bankRef: 'FP-1101-8923058',
    status: 'Paid',
    disbursedDate: 'Nov 02, 2025',
  },
  {
    id: 'po-4',
    payoutId: '#PO-9720',
    requestDate: 'Oct 16, 2025',
    settlementPeriod: 'Oct 01 – Oct 14',
    amount: 184000,
    paymentMethod: '● NCHL-IPS Direct',
    bankRef: 'NCHL2025101615571',
    status: 'Paid',
    disbursedDate: 'Oct 17, 2025',
  },
  {
    id: 'po-5',
    payoutId: '#PO-9685',
    requestDate: 'Oct 01, 2025',
    settlementPeriod: 'Sep 15 – Sep 30',
    amount: 298400,
    paymentMethod: '● RTGS Bank Transfer',
    bankRef: 'RTGS-NPR-448102',
    status: 'Paid',
    disbursedDate: 'Oct 02, 2025',
  },
];

const INITIAL_LEDGER: LedgerTransactionItem[] = [
  {
    id: 'txn-1',
    dateTime: 'Dec 15, 2025 · 09:42 AM',
    txnId: '#TXN-8814',
    relatedOrder: '#EP-02408',
    transactionType: '● Order Credit (Smart TV 43")',
    gross: 42000,
    feesComm: { amount: -2520 },
    netPayout: 39480,
    status: 'Holding (7d)',
  },
  {
    id: 'txn-2',
    dateTime: 'Dec 14, 2025 · 05:15 PM',
    txnId: '#TXN-8809',
    relatedOrder: '#EP-02391',
    transactionType: '● Marketplace Commission (4.5%)',
    gross: null,
    feesComm: { amount: -855 },
    netPayout: -855,
    status: 'Settled',
  },
  {
    id: 'txn-3',
    dateTime: 'Dec 14, 2025 · 02:30 PM',
    txnId: '#TXN-8798',
    relatedOrder: '#EP-02380',
    transactionType: '● Order Credit (ANC Earbuds)',
    gross: 4800,
    feesComm: { amount: -288 },
    netPayout: 4512,
    status: 'Available',
  },
  {
    id: 'txn-4',
    dateTime: 'Dec 13, 2025 · 11:05 AM',
    txnId: '#TXN-8772',
    relatedOrder: '#EP-02294',
    transactionType: '● Return Dispute Reversal',
    gross: -2900,
    feesComm: { amount: 130.5, label: '(Fee Rebate)', isRebate: true },
    netPayout: -2769.5,
    status: 'Settled',
  },
  {
    id: 'txn-5',
    dateTime: 'Dec 12, 2025 · 04:20 PM',
    txnId: '#TXN-8749',
    relatedOrder: '#EP-02260',
    transactionType: '● Logistics Weight Adjustment',
    gross: null,
    feesComm: { amount: -120 },
    netPayout: -120,
    status: 'Settled',
  },
];

export const VendorFinancePage: React.FC = () => {
  // Page Controls
  const [dateRange, setDateRange] = useState('30_days');
  const [isMasked, setIsMasked] = useState(false);
  const [earningsTab, setEarningsTab] = useState<'net' | 'gross' | 'deductions'>('net');
  const [earningsFrequency, setEarningsFrequency] = useState<'daily' | 'weekly'>('daily');

  // Payouts state & filters
  const [payouts, setPayouts] = useState<PayoutHistoryItem[]>(INITIAL_PAYOUTS);
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('ALL');

  // Ledger state & filters
  const [ledger, setLedger] = useState<LedgerTransactionItem[]>(INITIAL_LEDGER);
  const [ledgerTab, setLedgerTab] = useState<'all' | 'credits' | 'commissions' | 'refunds' | 'logistics'>('all');

  // Modals state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmountInput, setPayoutAmountInput] = useState('284500');
  const [selectedReceipt, setSelectedReceipt] = useState<PayoutHistoryItem | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load live overview from Backend API with fallback
  useEffect(() => {
    ApiClient.get(`/api/v1/vendor/finance/overview?timeframe=${dateRange}`)
      .then((res: any) => {
        if (res && res.payoutHistory && Array.isArray(res.payoutHistory)) {
          const mapped = res.payoutHistory.map((p: any, idx: number) => ({
            id: `po-${idx}`,
            payoutId: p.payoutId,
            requestDate: p.requestDate,
            settlementPeriod: p.settlementPeriod,
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            bankRef: p.bankRefUtr,
            status: p.status,
            disbursedDate: p.disbursedDate,
          }));
          setPayouts(mapped);
        }
      })
      .catch((err) => {
        console.warn('[Finance] Using initial baseline financial state:', err.message);
      });
  }, [dateRange]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (payoutStatusFilter !== 'ALL' && p.status !== payoutStatusFilter) return false;
      if (payoutSearch.trim()) {
        const q = payoutSearch.toLowerCase();
        return (
          p.payoutId.toLowerCase().includes(q) ||
          p.bankRef.toLowerCase().includes(q) ||
          p.paymentMethod.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payouts, payoutSearch, payoutStatusFilter]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      if (ledgerTab === 'credits' && !item.transactionType.includes('Order Credit')) return false;
      if (ledgerTab === 'commissions' && !item.transactionType.includes('Commission')) return false;
      if (ledgerTab === 'refunds' && !item.transactionType.includes('Return')) return false;
      if (ledgerTab === 'logistics' && !item.transactionType.includes('Logistics')) return false;
      return true;
    });
  }, [ledger, ledgerTab]);

  // Handle Submit Payout Request
  const handleConfirmPayout = () => {
    const amt = parseFloat(payoutAmountInput) || 0;
    if (amt < 1000) {
      showToast('Minimum payout amount is NPR 1,000.00');
      return;
    }
    if (amt > 284500) {
      showToast('Amount exceeds available payout balance.');
      return;
    }

    const newPayout: PayoutHistoryItem = {
      id: `po-${Date.now()}`,
      payoutId: `#PO-${Math.floor(9850 + Math.random() * 50)}`,
      requestDate: 'Today',
      settlementPeriod: 'Dec 01 – Dec 15',
      amount: amt,
      paymentMethod: '● NCHL-IPS Direct',
      bankRef: `NCHL20251215${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Processing',
      disbursedDate: 'Pending Bank Clearance',
    };

    setPayouts([newPayout, ...payouts]);
    setShowPayoutModal(false);
    showToast(`Payout request for NPR ${amt.toLocaleString()} submitted via NCHL-IPS.`);

    ApiClient.post('/api/v1/vendor/finance/payout-request', { amount: amt })
      .catch(() => {});
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        position: 'relative',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0F172A',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER & DATE RANGE FILTER BAR */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
            Earnings & Payouts
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Track settled revenue, manage automated bank transfers, and audit withholding tax deductions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mask / Privacy Toggle */}
          <button
            onClick={() => setIsMasked(!isMasked)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Toggle masking financial figures"
          >
            <span>{isMasked ? '👁️ Show Numbers' : '🔒 Mask Privacy'}</span>
          </button>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              outline: 'none',
            }}
          >
            <option value="30_days">📅 Last 30 Days (Nov 15 – Dec 15)</option>
            <option value="14_days">📅 Current Cycle (Dec 01 – Dec 15)</option>
            <option value="last_month">📅 Previous Month (Kartik 2083)</option>
            <option value="fiscal_year">📅 Fiscal Year 2083/84</option>
          </select>

          {/* Download Statement Button */}
          <button
            onClick={() => showToast('Generating official Nepal IRD verified Payout Statement (PDF)...')}
            style={{
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📥</span> Download Statement
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 SUMMARY FINANCIAL KPI CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {/* Card 1: Gross Sales */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            GROSS MARKETPLACE SALES
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
            {isMasked ? 'XXXXXXXXXX' : 'NPR 1,842,650'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            +18.4% vs last cycle
          </div>
        </div>

        {/* Card 2: Net Settled Pool */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            NET SETTLED EARNINGS
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1A56DB', marginTop: '8px' }}>
            {isMasked ? 'XXXXXXXXXX' : 'NPR 1,652,820'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
            After fees & discounts
          </div>
        </div>

        {/* Card 3: Lifetime Payouts */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            TOTAL PAYOUTS DISBURSED
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
            {isMasked ? 'XXXXXXXXXX' : 'NPR 1,463,570'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
            38 completed transfers
          </div>
        </div>

        {/* Card 4: Withholding TDS */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            WITHHOLDING TDS (1.5%)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '8px' }}>
            {isMasked ? 'XXXXXXXXXX' : '- NPR 27,640'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            IRD e-TDS Tax Certified
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EARNINGS OVERVIEW CHART & AVAILABLE FOR PAYOUT CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* Left: Earnings Overview Chart */}
        <div style={{ minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Earnings Overview
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                Nov 15 – Dec 15, 2025 vs Previous 30-Day Cycle
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Metric Tabs */}
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
                {(['net', 'gross', 'deductions'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEarningsTab(tab)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: earningsTab === tab ? '#1A56DB' : 'transparent',
                      color: earningsTab === tab ? '#FFFFFF' : '#64748B',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {tab === 'net' ? 'Net Earnings' : tab === 'gross' ? 'Gross' : 'Deductions'}
                  </button>
                ))}
              </div>

              {/* Frequency */}
              <div style={{ display: 'flex', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '2px' }}>
                {(['daily', 'weekly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setEarningsFrequency(freq)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: earningsFrequency === freq ? '#0F172A' : 'transparent',
                      color: earningsFrequency === freq ? '#FFFFFF' : '#64748B',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Area Line Chart */}
          <div style={{ position: 'relative', width: '100%', height: '230px' }}>
            <svg viewBox="0 0 680 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A56DB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1A56DB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="30" x2="660" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="75" x2="660" y2="75" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="120" x2="660" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="165" x2="660" y2="165" stroke="#E2E8F0" strokeWidth="1" />

              {/* Previous Cycle (dashed line) */}
              <path
                d="M 40 145 Q 120 135 180 120 T 300 110 T 420 85 T 540 80 T 650 65"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Current Period (Gradient Area) */}
              <path
                d="M 40 150 Q 110 130 170 125 T 280 130 T 400 45 T 520 80 T 650 55 L 650 165 L 40 165 Z"
                fill="url(#earningsGradient)"
              />

              {/* Current Period (Solid Blue Curve) */}
              <path
                d="M 40 150 Q 110 130 170 125 T 280 130 T 400 45 T 520 80 T 650 55"
                fill="none"
                stroke="#1A56DB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Points */}
              <circle cx="40" cy="150" r="4" fill="#FFFFFF" stroke="#1A56DB" strokeWidth="2" />
              <circle cx="170" cy="125" r="4" fill="#FFFFFF" stroke="#1A56DB" strokeWidth="2" />
              <circle cx="280" cy="130" r="4" fill="#FFFFFF" stroke="#1A56DB" strokeWidth="2" />
              <circle cx="400" cy="45" r="5" fill="#1A56DB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="520" cy="80" r="4" fill="#FFFFFF" stroke="#1A56DB" strokeWidth="2" />
              <circle cx="650" cy="55" r="4" fill="#FFFFFF" stroke="#1A56DB" strokeWidth="2" />

              {/* Dec 08 Peak Tooltip Badge */}
              <g transform="translate(325, 15)">
                <rect x="0" y="0" width="150" height="26" rx="6" fill="#0F172A" />
                <path d="M 75 26 L 80 30 L 70 30 Z" fill="#0F172A" />
                <text x="75" y="17" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                  ★ Dec 08 Peak: NPR 54,200
                </text>
              </g>

              {/* X-Axis Dates */}
              <text x="40" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Nov 15</text>
              <text x="120" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Nov 20</text>
              <text x="200" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Nov 25</text>
              <text x="300" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Nov 30</text>
              <text x="400" y="185" fontSize="10" fill="#DC2626" fontWeight="700" textAnchor="middle">Dec 08 (Sale)</text>
              <text x="520" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Dec 12</text>
              <text x="640" y="185" fontSize="10" fill="#94A3B8" textAnchor="middle">Dec 15</text>
            </svg>
          </div>

          {/* Bottom Chart Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', marginTop: '16px', paddingTop: '12px', fontSize: '11.5px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1A56DB' }}></span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Current Period:</span>
                <span style={{ color: '#0F172A' }}>{isMasked ? 'XXXXXXXX' : 'NPR 1,617,450'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
                <span style={{ width: '16px', height: '2px', backgroundColor: '#94A3B8', borderTop: '2px dashed #94A3B8' }}></span>
                <span>Previous Cycle: {isMasked ? 'XXXXXXXX' : 'NPR 1,345,320'}</span>
              </div>
            </div>

            <div style={{ color: '#94A3B8' }}>
              Updated Today at 09:45 AM NPT
            </div>
          </div>
        </div>

        {/* Right: Available for Payout & Primary Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Card 1: Available for Payout */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                AVAILABLE FOR PAYOUT
              </span>
              <span style={{ color: '#10B981', fontSize: '16px' }}>🛡️</span>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              {isMasked ? 'XXXXXXXXXX' : 'NPR 284,500.00'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#64748B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Minimum payout limit:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>NPR 1,000.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Next automated run:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Dec 20, 2025</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Processing network:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>NCHL-IPS / RTGS</span>
              </div>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              style={{
                width: '100%',
                backgroundColor: '#1A56DB',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
              }}
            >
              <span>💳</span> Request Payout Now
            </button>
          </div>

          {/* Card 2: Primary Payout Account */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                PRIMARY PAYOUT ACCOUNT
              </span>
              <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                ✓ Verified
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                NB
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                  Nabil Bank Limited
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  Kathmandu Main Branch (Teendhara)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '6px', letterSpacing: '1px' }}>
                  **** **** 4892
                </div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                  Account Name: Manish Electronics Pvt. Ltd.
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '14px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
              <span style={{ color: '#64748B' }}>Current NPR A/C</span>
              <button
                onClick={() => setShowBankModal(true)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#1A56DB', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
              >
                Manage Bank Details ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EARNINGS RECONCILIATION EQUATION */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Earnings Reconciliation Equation
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
              Detailed breakdown of gross volume converted into vendor net settlements.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            Tax Reference: IRD Nepal Section 89
          </span>
        </div>

        {/* 5 Connected Equation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr auto 1.15fr', gap: '8px', alignItems: 'center' }}>
          {/* Card 1: Gross Sales */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gross Sales</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {isMasked ? 'XXXXXX' : 'NPR 1,842,650'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              Total customer checkout value
            </div>
          </div>

          {/* Minus Operator */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#94A3B8', textAlign: 'center' }}>−</div>

          {/* Card 2: Discounts & Returns */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Discounts & Returns</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {isMasked ? 'XXXXXX' : '− NPR 81,000'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              Promo (32.8k) · Returns (48.2k)
            </div>
          </div>

          {/* Minus Operator */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#94A3B8', textAlign: 'center' }}>−</div>

          {/* Card 3: Platform Fee */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Platform Fee (4.5%)</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {isMasked ? 'XXXXXX' : '− NPR 81,190'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              Everest Pasal tech & catalog fee
            </div>
          </div>

          {/* Minus Operator */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#94A3B8', textAlign: 'center' }}>−</div>

          {/* Card 4: Withholding TDS */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Withholding TDS (1.5%)</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {isMasked ? 'XXXXXX' : '− NPR 27,640'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              Deposited to IRD Nepal on your PAN
            </div>
          </div>

          {/* Equals Operator */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1A56DB', textAlign: 'center' }}>=</div>

          {/* Card 5: Net Vendor Pool */}
          <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '14px', border: '1.5px solid #93C5FD' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Net Vendor Pool</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A56DB', marginTop: '4px' }}>
              {isMasked ? 'XXXXXX' : 'NPR 1,652,820'}
            </div>
            <div style={{ fontSize: '10px', color: '#1E40AF', marginTop: '4px', fontWeight: 600 }}>
              Total net vendor entitled amount
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PAYOUT HISTORY & BANK DISBURSALS */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Payout History & Bank Disbursals
              </h3>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                38 Total Transfers
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
              Showing recent verified bank transfers to Nabil Bank NPR account.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '7px', color: '#94A3B8', fontSize: '12px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by Payout ID or UTR..."
                value={payoutSearch}
                onChange={(e) => setPayoutSearch(e.target.value)}
                style={{
                  padding: '7px 12px 7px 30px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  outline: 'none',
                  width: '210px',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={payoutStatusFilter}
              onChange={(e) => setPayoutStatusFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                color: '#334155',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">All Statuses ▾</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={() => showToast('Exporting Payout History (CSV)...')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', borderTop: '1px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, whiteSpace: 'nowrap' }}>PAYOUT ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>REQUEST DATE</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>SETTLEMENT PERIOD</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>AMOUNT (NPR)</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>PAYMENT METHOD</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>BANK REF / UTR</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>DISBURSED DATE</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid #F8FAFC',
                    backgroundColor: '#FFFFFF',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1A56DB', whiteSpace: 'nowrap' }}>
                    {p.payoutId}
                  </td>
                  <td style={{ padding: '14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {p.requestDate}
                  </td>
                  <td style={{ padding: '14px', color: '#0F172A', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {p.settlementPeriod}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    NPR {p.amount.toLocaleString()}.00
                  </td>
                  <td style={{ padding: '14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {p.paymentMethod}
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {p.bankRef}
                  </td>
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        backgroundColor: p.status === 'Paid' ? '#ECFDF5' : '#FEF3C7',
                        color: p.status === 'Paid' ? '#16A34A' : '#D97706',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      ✓ {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {p.disbursedDate}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#1A56DB',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
          <div>Showing 1 to 5 of 38 disbursals</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>Previous</button>
            <button style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 700 }}>1</button>
            <button style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>2</button>
            <button style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>3</button>
            <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. EARNINGS TRANSACTIONS & ADJUSTMENT LEDGER */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Earnings Transactions & Adjustment Ledger
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
              Granular line-item debits, order credits, and logistics adjustments.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'credits', label: 'Order Earnings' },
                { id: 'commissions', label: 'Platform Commission' },
                { id: 'refunds', label: 'Refunds' },
                { id: 'logistics', label: 'Logistics Fee' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLedgerTab(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: ledgerTab === tab.id ? 'none' : '1px solid #E2E8F0',
                  backgroundColor: ledgerTab === tab.id ? '#0F172A' : '#FFFFFF',
                  color: ledgerTab === tab.id ? '#FFFFFF' : '#64748B',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', borderTop: '1px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, whiteSpace: 'nowrap' }}>DATE & TIME</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>TXN ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>RELATED ORDER</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>TRANSACTION TYPE</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>GROSS</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>FEES / COMM.</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>NET PAYOUT</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((txn) => (
                <tr
                  key={txn.id}
                  style={{
                    borderBottom: '1px solid #F8FAFC',
                    backgroundColor: '#FFFFFF',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {txn.dateTime}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    {txn.txnId}
                  </td>
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#1A56DB', fontWeight: 700, fontSize: '12.5px' }}>
                      {txn.relatedOrder}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#0F172A', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {txn.transactionType}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600, color: txn.gross && txn.gross < 0 ? '#DC2626' : '#0F172A', whiteSpace: 'nowrap' }}>
                    {txn.gross !== null ? (txn.gross < 0 ? `- NPR ${Math.abs(txn.gross).toLocaleString()}.00` : `NPR ${txn.gross.toLocaleString()}.00`) : '—'}
                  </td>
                  <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: txn.feesComm.isRebate ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '12px' }}>
                      {txn.feesComm.isRebate ? `+ NPR ${txn.feesComm.amount.toFixed(2)}` : `- NPR ${Math.abs(txn.feesComm.amount).toLocaleString()}.00`}
                    </span>
                    {txn.feesComm.label && (
                      <span style={{ color: '#16A34A', fontSize: '11px', marginLeft: '4px' }}>
                        {txn.feesComm.label}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, whiteSpace: 'nowrap', color: txn.netPayout >= 0 ? '#16A34A' : '#DC2626' }}>
                    {txn.netPayout >= 0 ? `+ NPR ${txn.netPayout.toLocaleString()}.00` : `- NPR ${Math.abs(txn.netPayout).toLocaleString()}.00`}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        backgroundColor:
                          txn.status === 'Holding (7d)'
                            ? '#FEF3C7'
                            : txn.status === 'Settled'
                            ? '#ECFDF5'
                            : '#EFF6FF',
                        color:
                          txn.status === 'Holding (7d)'
                            ? '#D97706'
                            : txn.status === 'Settled'
                            ? '#16A34A'
                            : '#1D4ED8',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748B' }}>
          <span>Auto-reconciled with Nepal Inland Revenue Department (IRD) records</span>
          <button
            onClick={() => showToast('Opening complete unpaginated ledger audit view...')}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#1A56DB', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
          >
            View All 1,428 Ledger Rows ➔
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. PAYOUT REQUEST MODAL */}
      {/* ========================================================================= */}
      {showPayoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Request Payout Transfer
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Transfer eligible cleared vendor escrow balance directly to your registered Nabil Bank commercial account via NCHL-IPS.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px 16px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Available For Instant Payout
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1A56DB', marginTop: '2px' }}>
                NPR 284,500.00
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Payout Amount (NPR) *
              </label>
              <input
                type="number"
                value={payoutAmountInput}
                onChange={(e) => setPayoutAmountInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>Min: NPR 1,000.00</span>
                <span
                  onClick={() => setPayoutAmountInput('284500')}
                  style={{ color: '#1A56DB', fontWeight: 700, cursor: 'pointer' }}
                >
                  Max (All): NPR 284,500.00
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '11.5px', color: '#1E40AF' }}>
              <div>🏦 <strong>Beneficiary:</strong> Nabil Bank Limited (**** 4892)</div>
              <div style={{ marginTop: '2px' }}>⏱️ <strong>Processing SLA:</strong> Dispatched via NCHL-IPS within 2 hours.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                style={{
                  padding: '9px 22px',
                  backgroundColor: '#1A56DB',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
                }}
              >
                Confirm Payout Transfer ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Bank Disbursal Voucher
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Official Settlement Receipt · Everest Pasal</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Amount Transferred</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>
                NPR {selectedReceipt.amount.toLocaleString()}.00
              </div>
              <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginTop: '6px', display: 'inline-block' }}>
                ✓ Completed & Reconciled
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payout Reference</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedReceipt.payoutId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Bank UTR / Ref</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>{selectedReceipt.bankRef}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Settlement Cycle</span>
                <span style={{ color: '#0F172A' }}>{selectedReceipt.settlementPeriod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Disbursal Date</span>
                <span style={{ color: '#0F172A' }}>{selectedReceipt.disbursedDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Beneficiary Account</span>
                <span style={{ color: '#0F172A' }}>Nabil Bank (**** 4892)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  showToast(`Printed PDF receipt for ${selectedReceipt.payoutId}`);
                  setSelectedReceipt(null);
                }}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#1A56DB',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                🖨️ Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MANAGE BANK DETAILS MODAL */}
      {/* ========================================================================= */}
      {showBankModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Primary Beneficiary Bank Account
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Bank Name</label>
                <input
                  type="text"
                  readOnly
                  value="Nabil Bank Limited"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Branch</label>
                <input
                  type="text"
                  readOnly
                  value="Kathmandu Main Branch (Teendhara)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Account Number</label>
                <input
                  type="text"
                  readOnly
                  value="0120017504892"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Account Holder Name</label>
                <input
                  type="text"
                  readOnly
                  value="Manish Electronics Pvt. Ltd."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  showToast('Security verification request initiated for bank update.');
                  setShowBankModal(false);
                }}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#1A56DB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Request Bank Account Change ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
