import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';

interface TransactionItem {
  id: string;
  transaction_no: string;
  description: string;
  order_no: string;
  type: string;
  type_badge: string;
  date: string;
  gross_amount: number | null;
  fees: number | null;
  net_amount: number;
  payment_method: string;
  status: string;
}

export const VendorFinancePage: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('Last 30 days');
  const [sortBy, setSortBy] = useState<string>('Newest first');

  // Selected transactions for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>(['txn-1048', 'txn-1047', 'txn-1046']);

  // Metrics & breakdown
  const [metrics, setMetrics] = useState({
    grossSales: 1284500,
    marketplaceFees: 64225,
    logisticsCharges: 28400,
    refundsAdjustments: 12750,
    netEarnings: 1179125,
  });

  const [breakdown, setBreakdown] = useState({
    periodLabel: 'Sep 1 – Sep 16, 2026',
    grossSales: 1284500,
    marketplaceFees: -64225,
    logisticsCharges: -28400,
    refunds: -12750,
    adjustments: -5000,
    netEarnings: 1179125,
  });

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'Excel'>('PDF');
  const [exportStartDate, setExportStartDate] = useState<string>('Sep 1, 2026');
  const [exportEndDate, setExportEndDate] = useState<string>('Sep 16, 2026');
  const [exportDatePill, setExportDatePill] = useState<string>('Custom range');
  const [includeOptions, setIncludeOptions] = useState({
    transactionDetails: true,
    feeBreakdown: true,
    settlementInfo: true,
    orderDetails: false,
    customerInfo: false,
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/vendor/finance/transactions?type=${typeFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      if (res && res.data) {
        const d = res.data;
        setTransactions(d.transactions || []);
        if (d.metrics) setMetrics(d.metrics);
        if (d.breakdown) setBreakdown(d.breakdown);
      }
    } catch (err: any) {
      console.error('Failed to fetch finance transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  // Handle Export submit
  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsExporting(true);
      await ApiClient.post('/api/v1/vendor/finance/export', {
        format: exportFormat.toLowerCase(),
        dateRange: `${exportStartDate} - ${exportEndDate}`,
        include: includeOptions,
      });

      // Trigger automatic file download simulation
      const filename = `Everest_Pasal_Statement_${exportStartDate.replace(/[\s,]+/g, '_')}_to_${exportEndDate.replace(/[\s,]+/g, '_')}.${exportFormat.toLowerCase()}`;
      const element = document.createElement('a');
      const content = `Everest Pasal Marketplace Statement\nPeriod: ${exportStartDate} - ${exportEndDate}\nGross Sales: NPR ${metrics.grossSales}\nNet Earnings: NPR ${metrics.netEarnings}\nTransactions Count: 248`;
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setShowExportModal(false);
      setSuccessToast(`Statement successfully exported in ${exportFormat} format!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter transactions locally
  const filteredTransactions = transactions.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.transaction_no.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.order_no.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (typeFilter !== 'ALL' && t.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div style={{ padding: '0 0 60px 0', minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      {/* Toast Notification */}
      {successToast && (
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
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Transaction Statement
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Track marketplace transactions, deductions, adjustments, and net earnings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'Transaction,Description,Order,Type,Date,Gross,Fees,Net',
                  ...transactions.map(
                    (t) =>
                      `"${t.transaction_no}","${t.description}","${t.order_no}","${t.type}","${t.date}",${t.gross_amount || 0},${t.fees || 0},${t.net_amount}`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setSuccessToast('Transactions CSV downloaded successfully!');
              setTimeout(() => setSuccessToast(null), 3000);
            }}
            style={{
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Download CSV
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '9px 18px',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
          >
            Export statement
          </button>
        </div>
      </div>

      {/* 5 KPI METRICS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* GROSS SALES */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>GROSS SALES</span>
            <span style={{ color: '#10B981', fontWeight: 700, fontSize: '14px' }}>↗</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
            NPR {metrics.grossSales.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Total transaction value</div>
        </div>

        {/* MARKETPLACE FEES */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>MARKETPLACE FEES</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#E5484D', marginBottom: '4px' }}>
            NPR {metrics.marketplaceFees.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Platform fees deducted</div>
        </div>

        {/* LOGISTICS CHARGES */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>LOGISTICS CHARGES</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', marginBottom: '4px' }}>
            NPR {metrics.logisticsCharges.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Delivery charges</div>
        </div>

        {/* REFUNDS & ADJUSTMENTS */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>REFUNDS & ADJUSTMENTS</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#E5484D', marginBottom: '4px' }}>
            NPR {metrics.refundsAdjustments.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Refunds processed</div>
        </div>

        {/* NET EARNINGS (Green Border Box) */}
        <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #86EFAC', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', letterSpacing: '0.05em' }}>NET EARNINGS</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A', marginBottom: '4px' }}>
            NPR {metrics.netEarnings.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Amount after deductions</div>
        </div>
      </div>

      {/* DUAL CARDS: STATEMENT BREAKDOWN & PERIOD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* LEFT: STATEMENT BREAKDOWN */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Statement breakdown
            </h3>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
              {breakdown.periodLabel}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
              <span>Gross sales</span>
              <span style={{ fontWeight: 600 }}>NPR {breakdown.grossSales.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
              <span>Marketplace fees</span>
              <span style={{ fontWeight: 600, color: '#E5484D' }}>- NPR {Math.abs(breakdown.marketplaceFees).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
              <span>Logistics charges</span>
              <span style={{ fontWeight: 600, color: '#E5484D' }}>- NPR {Math.abs(breakdown.logisticsCharges).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
              <span>Refunds</span>
              <span style={{ fontWeight: 600, color: '#E5484D' }}>- NPR {Math.abs(breakdown.refunds).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
              <span>Adjustments</span>
              <span style={{ fontWeight: 600, color: '#E5484D' }}>- NPR {Math.abs(breakdown.adjustments).toLocaleString()}</span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#ECE7DE', margin: '6px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ fontWeight: 800, color: '#1E293B' }}>Net earnings</span>
              <span style={{ fontWeight: 800, color: '#16A34A' }}>NPR {breakdown.netEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: PERIOD SELECTOR */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>
            Period
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#334155',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            <span>📅</span>
            <span>Sep 1, 2026 – Sep 16, 2026</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {['Today', 'Last 7 days', 'Last 30 days', 'This month'].map((p) => {
              const active = periodFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                    color: active ? '#2563EB' : '#64748B',
                    border: active ? '1px solid #2563EB' : '1px solid #ECE7DE',
                    textAlign: 'center',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {['Last month', 'Custom'].map((p) => {
              const active = periodFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                    color: active ? '#2563EB' : '#64748B',
                    border: active ? '1px solid #2563EB' : '1px solid #ECE7DE',
                    textAlign: 'center',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Showing transactions for the selected period.
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '320px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by transaction ID, order ID, or descripti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ECE7DE',
              fontSize: '13px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="ALL">Type ▾</option>
            <option value="Sale">Sale</option>
            <option value="Marketplace Fee">Marketplace Fee</option>
            <option value="Logistics">Logistics</option>
            <option value="Refund">Refund</option>
            <option value="Payout">Payout</option>
            <option value="Adjustment">Adjustment</option>
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ECE7DE',
              fontSize: '13px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="ALL">Status ▾</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Payment method dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ECE7DE',
              fontSize: '13px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="ALL">Payment method ▾</option>
            <option value="eSewa">eSewa</option>
            <option value="Khalti">Khalti</option>
            <option value="ConnectIPS">ConnectIPS</option>
          </select>

          <button
            onClick={() => {
              setTypeFilter('ALL');
              setStatusFilter('ALL');
              setPaymentFilter('ALL');
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '8px 8px',
            }}
          >
            + More filters
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #ECE7DE',
              fontSize: '13px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="Newest first">Sort by: Newest first ▾</option>
            <option value="Oldest first">Sort by: Oldest first ▾</option>
            <option value="Highest amount">Sort by: Highest amount ▾</option>
          </select>

          <button
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #ECE7DE',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* SELECTION BAR (When transactions selected) */}
      {selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
              onChange={toggleSelectAll}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedIds.length} transactions selected</span>
            <button
              onClick={() => setSelectedIds([])}
              style={{ background: 'none', border: 'none', color: '#2563EB', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Clear selection
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                color: '#1E293B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Export selected
            </button>
            <button
              onClick={() => {
                setSuccessToast(`Downloaded statements for ${selectedIds.length} items`);
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                color: '#1E293B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Download statements
            </button>
            <button
              onClick={() => {
                setSuccessToast(`${selectedIds.length} transactions marked reviewed`);
                setSelectedIds([]);
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                color: '#1E293B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Mark reviewed
            </button>
          </div>
        </div>
      )}

      {/* MAIN TRANSACTIONS TABLE OR EMPTY STATE */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            Loading transactions statement...
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* EMPTY STATE MATCHING finance-empty-state.png */
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '32px',
              }}
            >
              📄
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
              No transactions yet
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Your transaction history will appear here once you start receiving orders and payments.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => alert('Everest Pasal Merchant Payment Terms & Escrow Policy')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #ECE7DE',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Learn about payments
              </button>
              <button
                onClick={() => navigate('/vendor/orders')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Go to orders
              </button>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Everest Pasal automatically disburses settled vendor funds every week via direct bank transfer.');
              }}
              style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              How do payouts work on Everest Pasal? →
            </a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ECE7DE', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '14px 16px' }}>Transaction</th>
                  <th style={{ padding: '14px 16px' }}>Order</th>
                  <th style={{ padding: '14px 16px' }}>Type</th>
                  <th style={{ padding: '14px 16px' }}>Date</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Gross Amount</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Fees</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isChecked = selectedIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid #ECE7DE',
                        transition: 'background-color 0.1s ease',
                        backgroundColor: isChecked ? '#F8FAFC' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isChecked ? '#F8FAFC' : 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(tx.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Transaction ID & Description */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>{tx.transaction_no}</div>
                        <div style={{ color: '#64748B', fontSize: '12px' }}>{tx.description}</div>
                      </td>

                      {/* Order */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => navigate('/vendor/orders')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563EB',
                            fontWeight: 600,
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          {tx.order_no}
                        </button>
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {tx.type === 'Sale' && (
                          <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Sale
                          </span>
                        )}
                        {tx.type === 'Marketplace Fee' && (
                          <span style={{ backgroundColor: '#F1F5F9', color: '#2563EB', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Marketplace Fee
                          </span>
                        )}
                        {tx.type === 'Logistics' && (
                          <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Logistics
                          </span>
                        )}
                        {tx.type === 'Refund' && (
                          <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Refund
                          </span>
                        )}
                        {tx.type === 'Payout' && (
                          <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Payout
                          </span>
                        )}
                        {tx.type === 'Adjustment' && (
                          <span style={{ backgroundColor: '#F3E8FF', color: '#7E22CE', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Adjustment
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px' }}>
                        {tx.date}
                      </td>

                      {/* Gross Amount */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: tx.gross_amount && tx.gross_amount < 0 ? '#E5484D' : '#1E293B' }}>
                        {tx.gross_amount !== null
                          ? `${tx.gross_amount < 0 ? '- NPR ' + Math.abs(tx.gross_amount).toLocaleString() : 'NPR ' + tx.gross_amount.toLocaleString()}`
                          : '—'}
                      </td>

                      {/* Fees */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#E5484D' }}>
                        {tx.fees !== null ? `- NPR ${Math.abs(tx.fees).toLocaleString()}` : '—'}
                      </td>

                      {/* Net Amount */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: tx.net_amount > 0 ? '#16A34A' : '#E5484D' }}>
                        {tx.net_amount > 0
                          ? `NPR ${tx.net_amount.toLocaleString()}`
                          : `- NPR ${Math.abs(tx.net_amount).toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {filteredTransactions.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #ECE7DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#64748B',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>Showing 1-{filteredTransactions.length} of 248 transactions</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                ←
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                1
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                2
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                3
              </button>
              <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                10
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Items per page:</span>
              <select
                defaultValue="25"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* EXPORT STATEMENT MODAL (finance-export-modal.png) */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Export statement
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleExportSubmit} style={{ padding: '24px' }}>
              {/* EXPORT FORMAT */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Export Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {/* PDF Card */}
                  <div
                    onClick={() => setExportFormat('PDF')}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: exportFormat === 'PDF' ? '2px solid #2563EB' : '1px solid #ECE7DE',
                      backgroundColor: exportFormat === 'PDF' ? '#F0F7FF' : '#FFFDF9',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: exportFormat === 'PDF' ? '4px solid #2563EB' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Formatted report</div>
                  </div>

                  {/* CSV Card */}
                  <div
                    onClick={() => setExportFormat('CSV')}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: exportFormat === 'CSV' ? '2px solid #2563EB' : '1px solid #ECE7DE',
                      backgroundColor: exportFormat === 'CSV' ? '#F0F7FF' : '#FFFDF9',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📊</span>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: exportFormat === 'CSV' ? '4px solid #2563EB' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>CSV</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Spreadsheet data</div>
                  </div>

                  {/* Excel Card */}
                  <div
                    onClick={() => setExportFormat('Excel')}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: exportFormat === 'Excel' ? '2px solid #2563EB' : '1px solid #ECE7DE',
                      backgroundColor: exportFormat === 'Excel' ? '#F0F7FF' : '#FFFDF9',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📈</span>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: exportFormat === 'Excel' ? '4px solid #2563EB' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Excel</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Full workbook</div>
                  </div>
                </div>
              </div>

              {/* DATE RANGE */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Date Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Start date</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #ECE7DE', borderRadius: '8px', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}>
                      <span>{exportStartDate}</span>
                      <span>📅</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>End date</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #ECE7DE', borderRadius: '8px', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}>
                      <span>{exportEndDate}</span>
                      <span>📅</span>
                    </div>
                  </div>
                </div>

                {/* Quick Date Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['This month', 'Last month', 'Last quarter', 'Year to date', 'Custom range'].map((pill) => {
                    const isSelected = exportDatePill === pill;
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setExportDatePill(pill)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          color: isSelected ? '#2563EB' : '#64748B',
                          border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                        }}
                      >
                        {pill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INCLUDE IN EXPORT */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Include in Export
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeOptions.transactionDetails}
                      onChange={(e) => setIncludeOptions((prev) => ({ ...prev, transactionDetails: e.target.checked }))}
                    />
                    <span>Transaction details</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeOptions.feeBreakdown}
                      onChange={(e) => setIncludeOptions((prev) => ({ ...prev, feeBreakdown: e.target.checked }))}
                    />
                    <span>Fee breakdown</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeOptions.settlementInfo}
                      onChange={(e) => setIncludeOptions((prev) => ({ ...prev, settlementInfo: e.target.checked }))}
                    />
                    <span>Settlement information</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeOptions.orderDetails}
                      onChange={(e) => setIncludeOptions((prev) => ({ ...prev, orderDetails: e.target.checked }))}
                    />
                    <span>Order details</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeOptions.customerInfo}
                      onChange={(e) => setIncludeOptions((prev) => ({ ...prev, customerInfo: e.target.checked }))}
                    />
                    <span>Customer information</span>
                  </label>
                </div>
              </div>

              {/* INFO CALLOUT BOX */}
              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  color: '#0369A1',
                }}
              >
                <span>ℹ️</span>
                <span>
                  This export will include <strong>248 transactions</strong> from <strong>{exportStartDate} – {exportEndDate}</strong> in {exportFormat} format.
                </span>
              </div>

              {/* FOOTER BUTTONS */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    border: '1px solid #ECE7DE',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isExporting ? 'Generating...' : 'Export statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
