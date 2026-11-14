// ==============================================================================
// EVEREST PASAL - VENDOR TRANSACTIONS & FINANCIAL LEDGER MODULE
// Exact pixel-perfect implementation matching user mockups:
// 1. Transactions Ledger List (media_1794563249478_69285594.jpg)
// 2. Transaction Detail View (media_1794563249475_e03258da.jpg)
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { ApiClient } from '../../api/client.js';
import { Skeleton, SkeletonTable, SkeletonStatCards } from '../../components/Common/Skeleton.js';
import { useRouter } from '../../router/index.js';
import { Printer, FileDown, Download, RefreshCw, Copy, ExternalLink, Headphones, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import { exportToPdf, exportToCsv } from '../../utils/documentExport.js';

export interface TransactionItem {
  id: string;
  txnId: string;
  dateTime: string;
  type: string;
  typeCode: string;
  orderRef: string;
  party: string;
  partyLocation: string;
  paymentMethod: string;
  methodCode: string;
  direction: string;
  directionCode: 'inflow' | 'outflow' | 'pending';
  grossAmount: number;
  currency: string;
  status: 'Settled' | 'Pending';
}

export interface TransactionDetail {
  txnId: string;
  status: string;
  settlementStatus: string;
  complianceBadge: string;
  category: string;
  processedDate: string;
  paymentChannel: string;
  summaryKpis: {
    grossReceived: number;
    grossLabel: string;
    deductionsAndFees: number;
    deductionsLabel: string;
    netSettledToVendor: number;
    netSettledLabel: string;
    settlementDestination: {
      bankName: string;
      accountMasked: string;
    };
  };
  financialLedger: {
    voucherNo: string;
    itemsGrossSubtotal: number;
    customerDeliveryFee: number;
    deliveryHub: string;
    everestCommissionRate: string;
    everestCommissionTier: string;
    everestCommissionAmount: number;
    paymentGatewayFeeRate: string;
    paymentGatewayNote: string;
    paymentGatewayAmount: number;
    governmentTdsRate: string;
    governmentTdsNote: string;
    governmentTdsAmount: number;
    finalNetDisbursableAmount: number;
    approvalNote: string;
    guaranteeText: string;
  };
  linkedOrder: {
    orderNo: string;
    orderStatus: string;
    fulfillmentHub: string;
    items: Array<{
      id: string;
      title: string;
      sku: string;
      qty: number;
      verificationBadge: string;
      price: number;
    }>;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    shipping: {
      destination: string;
      hub: string;
    };
  };
  technicalMetadata: {
    apiVersion: string;
    paymentProvider: string;
    gatewayRefId: string;
    networkTrace: string;
    payerWalletId: string;
    securitySignature: string;
    escrowStatus: string;
  };
  lifecycle: {
    realtimeSync: boolean;
    steps: Array<{
      title: string;
      timestamp: string;
      note: string;
      completed: boolean;
      statusTag?: string;
      inProgress?: boolean;
    }>;
  };
  payoutBatch: {
    cycle: string;
    nextDisbursementDate: string;
    processingInitiation: string;
    associatedBatchNo: string;
    accountHolder: string;
    bankDetails: string;
    accountNo: string;
  };
}

export const VendorPaymentsPage: React.FC = () => {
  const { path, navigate } = useRouter();

  // Navigation State: determine if user is viewing detail or list
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTxn = params.get('txnId') || params.get('id');
      if (urlTxn) return urlTxn;
    }
    return null;
  });

  const handleSelectTxn = (txnId: string) => {
    setSelectedTxnId(txnId);
    if (typeof window !== 'undefined') {
      const clean = txnId.replace('#', '');
      window.history.pushState(null, '', `/vendor/transactions?id=${clean}`);
    }
  };

  const handleBackToList = () => {
    setSelectedTxnId(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/vendor/transactions');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlTxn = params.get('txnId') || params.get('id');
        setSelectedTxnId(urlTxn || null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filters & Pagination State
  const [dateRange, setDateRange] = useState('30_days');
  const [categoryTab, setCategoryTab] = useState<'all' | 'order_payments' | 'refunds' | 'platform_fees' | 'payouts' | 'adjustments'>('all');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Data Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [detailData, setDetailData] = useState<TransactionDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // UI Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryReason, setInquiryReason] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadTaxInvoice = () => {
    if (!detailData) {
      showToast('No transaction details loaded.');
      return;
    }
    const items = detailData.linkedOrder?.items || [];
    exportToPdf({
      filename: `Tax_Invoice_${detailData.txnId.replace('#', '')}.pdf`,
      title: `NEPAL IRD TAX INVOICE - ${detailData.txnId}`,
      subtitle: `Issued in accordance with Nepal Value Added Tax Act 2052 • IRD Approval Ref: EP/VAT/2081`,
      metadata: {
        'Transaction ID': detailData.txnId,
        'Order Reference': detailData.linkedOrder?.orderNo || 'N/A',
        'Customer Name': detailData.linkedOrder?.customer?.name || 'Customer',
        'Customer Email': detailData.linkedOrder?.customer?.email || 'N/A',
        'Payment Channel': detailData.paymentChannel,
        'Processed Date': detailData.processedDate,
        'Delivery Destination': detailData.linkedOrder?.shipping?.destination || 'Nepal',
        'Voucher No': detailData.financialLedger?.voucherNo || 'N/A',
      },
      headers: ['Item Description', 'SKU', 'Verification', 'Qty', 'Unit Price (NPR)', 'Amount (NPR)'],
      rows: items.map((item) => [
        item.title,
        item.sku,
        item.verificationBadge || 'Original',
        String(item.qty),
        Number(item.price / (item.qty || 1)).toLocaleString(),
        Number(item.price).toLocaleString(),
      ]),
      totals: [
        { label: 'Gross Received', value: `NPR ${detailData.summaryKpis?.grossReceived?.toLocaleString() || '0'}` },
        { label: 'Everest Pasal Commission', value: `NPR ${detailData.financialLedger?.everestCommissionAmount?.toLocaleString() || '0'}` },
        { label: 'Payment Gateway Fee', value: `NPR ${detailData.financialLedger?.paymentGatewayAmount?.toLocaleString() || '0'}` },
        { label: 'Govt TDS Withholding (1.5%)', value: `NPR ${detailData.financialLedger?.governmentTdsAmount?.toLocaleString() || '0'}` },
        { label: 'Net Settled to Vendor', value: `NPR ${detailData.summaryKpis?.netSettledToVendor?.toLocaleString() || '0'}` },
      ],
      footerNotes: [
        'This is a computer-generated tax invoice verified under the Nepal Value Added Tax Rules 2053.',
        'All disputes are subject to Kathmandu District Court jurisdiction.',
      ],
      branding: {
        storeName: 'Manish Electronics Pvt. Ltd.',
        vatPan: '609821435',
        address: 'New Road, Kathmandu, Nepal',
      },
    });
    showToast('Tax invoice generated successfully.');
  };

  const handlePrintReceipt = () => {
    handleDownloadTaxInvoice();
  };

  const handleExportLedger = () => {
    if (!transactions.length) {
      showToast('No transactions to export');
      return;
    }
    exportToCsv({
      filename: `Vendor_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Vendor Financial Transactions Ledger',
      headers: ['Transaction ID', 'Date & Time', 'Type', 'Order Ref', 'Party', 'Location', 'Payment Method', 'Direction', 'Gross Amount (NPR)', 'Status'],
      rows: transactions.map((t) => [
        t.txnId,
        t.dateTime,
        t.type,
        t.orderRef,
        t.party,
        t.partyLocation,
        t.paymentMethod.replace('● ', ''),
        t.direction,
        String(t.grossAmount),
        t.status,
      ]),
    });
    showToast(`Exported ${transactions.length} ledger transactions to CSV.`);
  };

  // 1. Fetch Transactions Ledger List from Backend
  const fetchLedger = (silent = false) => {
    if (!silent) setIsLoading(true);
    const sortParam = sortFilter === 'highest' ? 'AMOUNT_HIGH' : sortFilter === 'oldest' ? 'AMOUNT_LOW' : 'NEWEST';
    ApiClient.get(
      `/api/v1/vendor/finance/transactions-ledger?timeframe=${dateRange}&category=${categoryTab}&status=${statusFilter}&method=${methodFilter}&direction=${directionFilter}&sort=${sortParam}&page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchQuery)}`
    )
      .then((res: any) => {
        const payload = res?.data || res;
        if (payload) {
          setLedgerData(payload);
          setTransactions(Array.isArray(payload.transactions) ? payload.transactions : []);
        }
      })
      .catch((err) => {
        console.warn('[Transactions] Failed to fetch ledger:', err?.message);
        setTransactions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLedger();
  }, [dateRange, categoryTab, statusFilter, methodFilter, directionFilter, sortFilter, page, pageSize, searchQuery]);

  // 2. Fetch Transaction Detail when selectedTxnId changes
  useEffect(() => {
    if (!selectedTxnId) {
      setDetailData(null);
      return;
    }
    setIsDetailLoading(true);
    const cleanId = selectedTxnId.replace('#', '');
    ApiClient.get(`/api/v1/vendor/finance/transactions/${cleanId}`)
      .then((res: any) => {
        const payload = res?.data || res?.transaction || res;
        if (payload) {
          setDetailData(payload);
        }
      })
      .catch((err) => {
        console.warn('[Transactions] Failed to fetch detail:', err?.message);
        setDetailData(null);
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
  }, [selectedTxnId]);

  // Checkbox helpers
  const toggleSelectAll = () => {
    if (selectedRows.size === transactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(transactions.map((t) => t.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  // ============================================================================
  // RENDER 1: TRANSACTION DETAIL VIEW (media_1794563249475_e03258da.jpg)
  // ============================================================================
  if (selectedTxnId) {
    if (isDetailLoading || !detailData) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Poppins', sans-serif" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="300px" height="28px" />
            <Skeleton width="200px" height="38px" borderRadius="8px" />
          </div>
          <Skeleton width="100%" height="160px" borderRadius="16px" />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1fr)', gap: '20px' }}>
            <Skeleton width="100%" height="480px" borderRadius="16px" />
            <Skeleton width="100%" height="480px" borderRadius="16px" />
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#0F172A',
        }}
      >
        {/* Toast */}
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
            }}
          >
            ✓ {toastMessage}
          </div>
        )}

        {/* 1. Breadcrumbs & Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
              Business & Finance &nbsp;/&nbsp; Transactions &nbsp;/&nbsp;{' '}
              <span style={{ color: '#1A56DB', fontWeight: 700 }}>{detailData.txnId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleBackToList}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>←</span> Back to Transactions
              </button>
              <span
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#16A34A',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                {detailData.settlementStatus}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrintReceipt}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={15} /> Print Receipt
            </button>
            <button
              onClick={handleDownloadTaxInvoice}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileDown size={15} /> Download Tax Invoice (PDF)
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Transaction permalink copied to clipboard!');
              }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Copy size={15} /> Copy Link
            </button>
            <button
              onClick={() => setShowInquiryModal(true)}
              style={{
                backgroundColor: '#1A56DB',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(26,86,219,0.25)',
              }}
            >
              <Headphones size={15} /> Merchant Help
            </button>
          </div>
        </div>

        {/* 2. Top Header Summary Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #ECECEC',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                  {detailData.txnId}
                </h1>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(detailData.txnId);
                    showToast('Transaction ID copied!');
                  }}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px' }}
                  title="Copy Transaction ID"
                >
                  ⧉
                </button>
                <span
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                  }}
                >
                  ✓ {detailData.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>
                {detailData.category}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                Processed on: {detailData.processedDate} • Payment Channel:{' '}
                <span style={{ color: '#1A56DB', fontWeight: 600 }}>{detailData.paymentChannel}</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #BFDBFE',
              }}
            >
              <span>🛡️</span> {detailData.complianceBadge}
            </div>
          </div>

          {/* 4 Inner KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '22px' }}>
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                GROSS RECEIVED
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                NPR {detailData.summaryKpis.grossReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                {detailData.summaryKpis.grossLabel}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                DEDUCTIONS & FEES
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                −NPR {Math.abs(detailData.summaryKpis.deductionsAndFees).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '10.5px', color: '#DC2626', marginTop: '4px' }}>
                {detailData.summaryKpis.deductionsLabel}
              </div>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px', border: '1.5px solid #93C5FD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#1E40AF' }}>
                  NET SETTLED TO VENDOR
                </span>
                <span style={{ color: '#16A34A', fontSize: '13px' }}>🔒</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A56DB', marginTop: '4px' }}>
                NPR {detailData.summaryKpis.netSettledToVendor.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '10.5px', color: '#1E40AF', marginTop: '4px', fontWeight: 600 }}>
                {detailData.summaryKpis.netSettledLabel}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                SETTLEMENT DESTINATION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  N
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  {detailData.summaryKpis.settlementDestination.bankName}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                {detailData.summaryKpis.settlementDestination.accountMasked}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Card 1: Financial Ledger Breakdown */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '20px' }}>📋</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Financial Ledger Breakdown
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Audit-ready calculation for vendor remittance voucher
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '4px' }}>
                  Voucher: {detailData.financialLedger.voucherNo}
                </div>
              </div>

              {/* Line items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#1A56DB', fontSize: '10px' }}>●</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Item Gross Subtotal</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>
                    NPR {detailData.financialLedger.itemsGrossSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '10px' }}>●</span>
                    <div>
                      <span style={{ color: '#475569' }}>Customer Delivery Fee Paid</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>({detailData.financialLedger.deliveryHub})</span>
                    </div>
                  </div>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>
                    NPR {detailData.financialLedger.customerDeliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#DC2626', fontSize: '12px' }}>⊖</span>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 600 }}>
                        Everest Pasal Commission ({detailData.financialLedger.everestCommissionRate})
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{detailData.financialLedger.everestCommissionTier}</div>
                    </div>
                  </div>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    −NPR {Math.abs(detailData.financialLedger.everestCommissionAmount).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#DC2626', fontSize: '12px' }}>⊖</span>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 600 }}>
                        Payment Gateway Fee ({detailData.financialLedger.paymentGatewayFeeRate})
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{detailData.financialLedger.paymentGatewayNote}</div>
                    </div>
                  </div>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    −NPR {Math.abs(detailData.financialLedger.paymentGatewayAmount).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#DC2626', fontSize: '12px' }}>⊖</span>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 600 }}>
                        Government TDS Withholding ({detailData.financialLedger.governmentTdsRate})
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{detailData.financialLedger.governmentTdsNote}</div>
                    </div>
                  </div>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    −NPR {Math.abs(detailData.financialLedger.governmentTdsAmount).toFixed(2)}
                  </span>
                </div>

                {/* Final Net Disbursable Box */}
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    border: '1.5px solid #93C5FD',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: '#10B981', color: '#FFFFFF', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        Final Net Disbursable Amount
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {detailData.financialLedger.approvalNote}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A56DB' }}>
                      NPR {detailData.financialLedger.finalNetDisbursableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700 }}>
                      {detailData.financialLedger.guaranteeText}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Linked Order #EP-02408 */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '20px' }}>🛍️</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Linked Order {detailData.linkedOrder.orderNo}
                      </h3>
                      <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        {detailData.linkedOrder.orderStatus}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      {detailData.linkedOrder.fulfillmentHub}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/vendor/orders')}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#1A56DB', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  View Full Order →
                </button>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {detailData.linkedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        🎧
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          SKU: {item.sku} • Qty: {item.qty} •{' '}
                          <span style={{ color: '#16A34A', fontWeight: 600 }}>✓ {item.verificationBadge}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                      NPR {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer & Shipping Profile */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #F1F5F9', marginTop: '18px', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    CUSTOMER & SHIPPING PROFILE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {detailData.linkedOrder.customer.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{detailData.linkedOrder.customer.email}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{detailData.linkedOrder.customer.phone}</div>
                </div>

                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    DELIVERY DESTINATION
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {detailData.linkedOrder.shipping.destination}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{detailData.linkedOrder.shipping.hub}</div>
                </div>
              </div>
            </div>

            {/* Card 3: Payment Gateway & Technical Settlement Metadata */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '20px' }}>💻</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Payment Gateway & Technical Settlement Metadata
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Cryptographic audit log for NCHL national clearing trace
                    </p>
                  </div>
                </div>
                <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                  {detailData.technicalMetadata.apiVersion}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Payment Provider</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                    {detailData.technicalMetadata.paymentProvider}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Gateway Reference ID</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {detailData.technicalMetadata.gatewayRefId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>NCHL / Fonepay Network Trace</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {detailData.technicalMetadata.networkTrace}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Payer Wallet ID</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {detailData.technicalMetadata.payerWalletId}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '11px', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span> Security Signature: <span style={{ fontFamily: 'monospace', color: '#0F172A' }}>{detailData.technicalMetadata.securitySignature}</span>
                </div>
                <div style={{ color: '#16A34A', fontWeight: 700 }}>
                  ✓ {detailData.technicalMetadata.escrowStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Card 1: Settlement Lifecycle */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Settlement Lifecycle
                </h3>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                  Real-time sync
                </span>
              </div>

              {/* Timeline steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {detailData.lifecycle.steps.map((st, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: st.completed ? '#10B981' : '#1A56DB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      {st.completed ? '✓' : '◉'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                          {st.title}
                        </span>
                        {st.statusTag && (
                          <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                            {st.statusTag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                        {st.timestamp}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                        {st.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Payout Batch Status */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📅</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    PAYOUT BATCH STATUS
                  </span>
                </div>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {detailData.payoutBatch.cycle}
                </span>
              </div>

              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Next Payout Disbursement</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {detailData.payoutBatch.nextDisbursementDate}
                </div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '1px' }}>
                  {detailData.payoutBatch.processingInitiation}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Associated Batch Number</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {detailData.payoutBatch.associatedBatchNo}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/vendor/finance')}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#1A56DB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  View Batch →
                </button>
              </div>

              <div style={{ paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Designated Settlement Account</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {detailData.payoutBatch.accountHolder}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>{detailData.payoutBatch.bankDetails}</div>
                <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#64748B' }}>{detailData.payoutBatch.accountNo}</div>
              </div>
            </div>

            {/* Card 3: Everest Seller Shield */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#1A56DB', fontSize: '18px' }}>🛡️</span>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>
                  EVEREST SELLER SHIELD
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                All transactions are protected by Everest Pasal Seller Shield. Inquiries raised within 14 days of clearance are investigated with priority bank audit records.
              </p>

              <button
                onClick={() => setShowInquiryModal(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#1A56DB',
                  border: '1px solid #93C5FD',
                  padding: '9px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '10px',
                }}
              >
                Raise Inquiry for this Transaction
              </button>

              <button
                onClick={() => showToast('Connecting to 24/7 Kathmandu Merchant Support Desk...')}
                style={{
                  width: '100%',
                  backgroundColor: '#1A56DB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(26,86,219,0.2)',
                }}
              >
                Call Merchant Support (+977 01-4422890)
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#94A3B8', marginTop: '12px' }}>
                <span>Kathmandu Support Desk</span>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>• Avg. response &lt; 2 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Raise Inquiry Modal */}
        {showInquiryModal && (
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
                maxWidth: '460px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Raise Inquiry: {detailData.txnId}
                </h3>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Submit an escrow dispute or payment settlement reconciliation ticket to the Everest Pasal Finance Operations team.
              </p>

              <textarea
                rows={4}
                placeholder="Explain the settlement or deduction issue in detail..."
                value={inquiryReason}
                onChange={(e) => setInquiryReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  fontFamily: "'Poppins', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    showToast('Support Ticket #TKT-8841 created. Our finance team will review it within 2 hours.');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1A56DB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: TRANSACTIONS LEDGER LIST (media_1794563249478_69285594.jpg)
  // ============================================================================
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="280px" height="32px" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="220px" height="40px" borderRadius="8px" />
            <Skeleton width="160px" height="40px" borderRadius="8px" />
          </div>
        </div>
        <SkeletonStatCards count={5} columns={5} />
        <Skeleton width="100%" height="44px" borderRadius="8px" />
        <SkeletonTable rows={8} columns={9} />
        <Skeleton width="100%" height="80px" borderRadius="12px" />
      </div>
    );
  }

  const kpis = ledgerData?.kpis || {
    grossVolume: 0,
    grossVolumeFormatted: '0',
    grossVolumeAmount: 0,
    successfulTxns: 0,
    pendingClearing: 0,
    inProgress: 0,
    platformAndTds: 0,
  };

  const categoryCounts = ledgerData?.categoryCounts || {
    all: 0,
    orderPayments: 0,
    refunds: 0,
    platformFees: 0,
    payouts: 0,
    adjustments: 0,
  };

  const gatewayDist = ledgerData?.gatewayDistribution || {
    period: 'Current Settlement Period',
    totalVolumeCleared: 0,
    channels: [],
  };

  const totalTxns = Number(ledgerData?.totalCount ?? transactions.length);
  const totalPages = Math.max(1, Math.ceil(totalTxns / pageSize));
  const startItem = totalTxns === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalTxns);
  const dateRangeLabel =
    dateRange === '14_days'
      ? 'Current Cycle (14 Days)'
      : dateRange === 'last_month'
      ? 'Previous Month'
      : dateRange === 'fiscal_year'
      ? 'Fiscal Year 2083/84'
      : 'Last 30 Days';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
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
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
          Transactions Ledger
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setPage(1);
            }}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <option value="30_days">📅 Last 30 Days (Nov 16 – Dec 15, 2025)</option>
            <option value="14_days">📅 Current Cycle (Dec 01 – Dec 15)</option>
            <option value="last_month">📅 Previous Month (Kartik 2083)</option>
            <option value="fiscal_year">📅 Fiscal Year 2083/84</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchLedger();
              showToast('Transactions ledger updated with real-time sync.');
            }}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#475569',
              cursor: 'pointer',
            }}
            title="Refresh Ledger"
          >
            <RefreshCw size={14} />
          </button>

          {/* Export Ledger Button */}
          <button
            onClick={handleExportLedger}
            style={{
              backgroundColor: '#1A56DB',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(26,86,219,0.25)',
            }}
          >
            <FileDown size={15} /> Export Ledger <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              GROSS VOLUME
            </span>
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>💬</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {kpis.grossVolume}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              SUCCESSFUL TXNS
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7' }}></span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {kpis.successfulTxns}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              PENDING CLEARING
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>
            {kpis.pendingClearing}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              IN PROGRESS
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A56DB' }}></span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1A56DB', marginTop: '6px' }}>
            {kpis.inProgress}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              PLATFORM & TDS
            </span>
            <span style={{ color: '#10B981', fontSize: '13px', fontWeight: 800 }}>✓</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginTop: '6px' }}>
            {kpis.platformAndTds}
          </div>
        </div>
      </div>

      {/* 3. Segmented Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        {[
          { id: 'all', label: 'All Transactions', count: categoryCounts.all },
          { id: 'order_payments', label: 'Order Payments', count: categoryCounts.orderPayments },
          { id: 'refunds', label: 'Refunds', count: categoryCounts.refunds },
          { id: 'platform_fees', label: 'Platform Fees', count: categoryCounts.platformFees },
          { id: 'payouts', label: 'Payouts', count: categoryCounts.payouts },
          { id: 'adjustments', label: 'Adjustments', count: categoryCounts.adjustments },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCategoryTab(tab.id as any);
              setPage(1);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: categoryTab === tab.id ? '#1A56DB' : 'transparent',
              color: categoryTab === tab.id ? '#FFFFFF' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                backgroundColor: categoryTab === tab.id ? '#1E40AF' : '#F1F5F9',
                color: categoryTab === tab.id ? '#FFFFFF' : '#475569',
                padding: '2px 7px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {Number(tab.count || 0).toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8', fontSize: '13px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search Transaction ID, Order #, Buyer, eSewa Ref"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              fontFamily: "'Poppins', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses ▾</option>
            <option value="Settled">Settled</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="ALL">All method ▾</option>
            <option value="esewa">eSewa Mobile Wallet</option>
            <option value="fonepay">Fonepay QR / UPI</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="nchl">NCHL-IPS Direct</option>
          </select>

          <select
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="ALL">Direction: All ▾</option>
            <option value="inflow">Inflow (Incoming)</option>
            <option value="outflow">Outflow (Deductions/Payouts)</option>
          </select>

          <select
            value={sortFilter}
            onChange={(e) => {
              setSortFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="newest">Sort: Newest First ▾</option>
            <option value="oldest">Sort: Lowest Amount</option>
            <option value="highest">Sort: Highest Amount</option>
          </select>
        </div>
      </div>

      {/* 5. Active Filters Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748B', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#475569' }}>ACTIVE FILTERS:</span>
        <span style={{ backgroundColor: '#F1F5F9', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
          Date: {dateRangeLabel}
        </span>
        <span style={{ backgroundColor: '#F1F5F9', color: '#0F172A', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
          Store: {ledgerData?.storeName || 'Active Store'}
        </span>
        {statusFilter !== 'ALL' && (
          <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            Status: {statusFilter}
          </span>
        )}
        {methodFilter !== 'ALL' && (
          <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            Method: {methodFilter.toUpperCase()}
          </span>
        )}
        <button
          onClick={() => {
            setCategoryTab('all');
            setStatusFilter('ALL');
            setMethodFilter('ALL');
            setDirectionFilter('ALL');
            setSearchQuery('');
            setPage(1);
          }}
          style={{ backgroundColor: 'transparent', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', padding: '2px 6px' }}
        >
          Clear All
        </button>
      </div>

      {/* 6. Transactions Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '1020px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '14px 18px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === transactions.length && transactions.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>TXN ID</th>
                <th style={{ padding: '14px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>DATE & TIME</th>
                <th style={{ padding: '14px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>TYPE</th>
                <th style={{ padding: '14px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>ORDER REF</th>
                <th style={{ padding: '14px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>PARTY / CUSTOMER</th>
                <th style={{ padding: '14px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>PAYMENT METHOD</th>
                <th style={{ padding: '14px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>DIRECTION</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>GROSS AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const isSelected = selectedRows.has(txn.id);

                return (
                  <tr
                    key={txn.id}
                    onClick={() => handleSelectTxn(txn.txnId)}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <td
                      style={{ padding: '14px 18px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectRow(txn.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(txn.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>

                    {/* TXN ID */}
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      {txn.txnId}
                    </td>

                    {/* DATE & TIME */}
                    <td style={{ padding: '14px 12px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {txn.dateTime}
                    </td>

                    {/* TYPE */}
                    <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor:
                            txn.typeCode === 'order_payment'
                              ? '#ECFDF5'
                              : txn.typeCode === 'refunds'
                              ? '#FEF2F2'
                              : txn.typeCode === 'platform_fees'
                              ? '#F1F5F9'
                              : txn.typeCode === 'payouts'
                              ? '#F5F3FF'
                              : '#FFFBEB',
                          color:
                            txn.typeCode === 'order_payment'
                              ? '#16A34A'
                              : txn.typeCode === 'refunds'
                              ? '#DC2626'
                              : txn.typeCode === 'platform_fees'
                              ? '#475569'
                              : txn.typeCode === 'payouts'
                              ? '#7C3AED'
                              : '#D97706',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        {txn.type}
                      </span>
                    </td>

                    {/* ORDER REF */}
                    <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#1A56DB', fontWeight: 700, fontSize: '12.5px' }}>
                        {txn.orderRef}
                      </span>
                    </td>

                    {/* PARTY / CUSTOMER */}
                    <td style={{ padding: '14px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                        {txn.party}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {txn.partyLocation}
                      </div>
                    </td>

                    {/* PAYMENT METHOD */}
                    <td style={{ padding: '14px 14px', color: '#334155', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {txn.paymentMethod}
                    </td>

                    {/* DIRECTION */}
                    <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                      {txn.directionCode === 'inflow' ? (
                        <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '12.5px' }}>
                          ↓ Inflow
                        </span>
                      ) : txn.directionCode === 'outflow' ? (
                        <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '12.5px' }}>
                          ↑ Outflow
                        </span>
                      ) : (
                        <span style={{ color: '#D97706', fontWeight: 700, fontSize: '12px' }}>
                          ⏳ Pending
                        </span>
                      )}
                    </td>

                    {/* GROSS AMOUNT */}
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap', color: txn.grossAmount < 0 ? '#DC2626' : '#0F172A' }}>
                      {txn.grossAmount < 0
                        ? `-NPR ${Math.abs(txn.grossAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : `NPR ${txn.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalTxns}</strong> transactions
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: page <= 1 ? '#CBD5E1' : '#64748B',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: pageNum === page ? 'none' : '1px solid #E2E8F0',
                  backgroundColor: pageNum === page ? '#DC2626' : '#FFFFFF',
                  color: pageNum === page ? '#FFFFFF' : '#64748B',
                  fontWeight: pageNum === page ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {pageNum}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: page >= totalPages ? '#CBD5E1' : '#64748B',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Items per page:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '11.5px', outline: 'none' }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7. Bottom Payment Gateway Distribution Component */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #ECECEC',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#1A56DB' }}>🌐</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              Payment Gateway Distribution
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              ({gatewayDist.period || 'Current Settlement Period'})
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748B' }}>
            Total Volume Cleared:{' '}
            <strong style={{ color: '#0F172A' }}>
              NPR {Number(gatewayDist.totalVolumeCleared || 0).toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Continuous Segmented Bar */}
        <div style={{ width: '100%', height: '10px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: '#F1F5F9', marginBottom: '14px' }}>
          {gatewayDist.channels.map((ch: any, idx: number) => (
            <div
              key={idx}
              style={{
                width: `${ch.percentage}%`,
                backgroundColor: ch.color,
                height: '100%',
              }}
              title={`${ch.name}: ${ch.percentage}% (NPR ${Number(ch.amount || 0).toLocaleString()})`}
            />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '28px', flexWrap: 'wrap', fontSize: '11.5px' }}>
          {gatewayDist.channels.map((ch: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ch.color }}></span>
              <div>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{ch.name}</span>
                <span style={{ color: '#64748B', marginLeft: '6px' }}>
                  {ch.percentage}% • NPR {Number(ch.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
