import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface AuditStep {
  label: string;
  date: string;
}

interface RefundRecord {
  receiptId: string;
  returnId: string;
  orderId: string;
  customer: string;
  method: string;
  amount: number;
  completedAt: string;
  completedDate: string;
  completedTime: string;
  providerRef: string;
  uniqueRef: string;
  item?: string;
  reason?: string;
  authorizedBy?: string;
  auditTrail?: AuditStep[];
}

export const AdminRefundHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<RefundRecord[]>([
    {
      receiptId: 'RF-6033',
      returnId: 'RET-1033',
      orderId: 'ORD-88112',
      customer: 'Arjun Nepal',
      method: 'Visa · 6042',
      amount: 2400,
      completedAt: '01 Nov 2026 · 08:40 NPT',
      completedDate: '01 Nov 2026',
      completedTime: '08:40 NPT',
      providerRef: 'CD-RF-6033',
      uniqueRef: 'EP-RF-1033',
      item: 'Reading lamp',
      reason: 'Defective item',
      authorizedBy: 'A. Sharma · 30 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '30 Oct · 09:20 · S. Shrestha' },
        { label: 'Refund authorized · NPR 2,400', date: '30 Oct · 11:05 · A. Sharma' },
        { label: 'Payout submitted · PAY-7033', date: '30 Oct · 11:15 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6033', date: '01 Nov · 08:40 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6020',
      returnId: 'RET-1020',
      orderId: 'ORD-88015',
      customer: 'Sunita Raut',
      method: 'eSewa',
      amount: 1800,
      completedAt: '31 Oct 2026 · 16:25 NPT',
      completedDate: '31 Oct 2026',
      completedTime: '16:25 NPT',
      providerRef: 'ES-RF-6020',
      uniqueRef: 'EP-RF-1020',
      item: 'Yoga mat · 6mm',
      reason: 'Wrong product',
      authorizedBy: 'A. Sharma · 31 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '31 Oct · 11:20 · S. Shrestha' },
        { label: 'Refund authorized · NPR 1,800', date: '31 Oct · 13:00 · A. Sharma' },
        { label: 'Payout submitted · PAY-7020', date: '31 Oct · 14:10 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6020', date: '31 Oct · 16:25 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6018',
      returnId: 'RET-1018',
      orderId: 'ORD-87998',
      customer: 'Rajan Bhandari',
      method: 'Bank transfer',
      amount: 5200,
      completedAt: '31 Oct 2026 · 13:15 NPT',
      completedDate: '31 Oct 2026',
      completedTime: '13:15 NPT',
      providerRef: 'BT-RF-6018',
      uniqueRef: 'EP-RF-1018',
      item: 'Leather boots',
      reason: 'Wrong size',
      authorizedBy: 'K. Adhikari · 30 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '30 Oct · 14:20 · M. Basnet' },
        { label: 'Refund authorized · NPR 5,200', date: '30 Oct · 16:00 · K. Adhikari' },
        { label: 'Payout submitted · PAY-7018', date: '31 Oct · 09:15 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6018', date: '31 Oct · 13:15 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6016',
      returnId: 'RET-1016',
      orderId: 'ORD-87974',
      customer: 'Samjhana Rai',
      method: 'Khalti',
      amount: 1350,
      completedAt: '30 Oct 2026 · 15:05 NPT',
      completedDate: '30 Oct 2026',
      completedTime: '15:05 NPT',
      providerRef: 'KH-RF-6016',
      uniqueRef: 'EP-RF-1016',
      item: 'Bluetooth earphone',
      reason: 'Damaged item',
      authorizedBy: 'A. Sharma · 30 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '30 Oct · 10:15 · S. Shrestha' },
        { label: 'Refund authorized · NPR 1,350', date: '30 Oct · 11:30 · A. Sharma' },
        { label: 'Payout submitted · PAY-7016', date: '30 Oct · 12:45 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6016', date: '30 Oct · 15:05 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6015',
      returnId: 'RET-1015',
      orderId: 'ORD-87951',
      customer: 'Manoj Shah',
      method: 'eSewa',
      amount: 2950,
      completedAt: '30 Oct 2026 · 10:45 NPT',
      completedDate: '30 Oct 2026',
      completedTime: '10:45 NPT',
      providerRef: 'ES-RF-6015',
      uniqueRef: 'EP-RF-1015',
      item: 'Electric blender',
      reason: 'Defective item',
      authorizedBy: 'A. Sharma · 29 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '29 Oct · 15:20 · S. Shrestha' },
        { label: 'Refund authorized · NPR 2,950', date: '29 Oct · 17:00 · A. Sharma' },
        { label: 'Payout submitted · PAY-7015', date: '30 Oct · 08:30 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6015', date: '30 Oct · 10:45 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6013',
      returnId: 'RET-1013',
      orderId: 'ORD-87933',
      customer: 'Sarita Karki',
      method: 'Mastercard · 7108',
      amount: 3400,
      completedAt: '29 Oct 2026 · 16:30 NPT',
      completedDate: '29 Oct 2026',
      completedTime: '16:30 NPT',
      providerRef: 'CD-RF-6013',
      uniqueRef: 'EP-RF-1013',
      item: 'Silk saree',
      reason: 'Not as described',
      authorizedBy: 'K. Adhikari · 29 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '29 Oct · 11:00 · M. Basnet' },
        { label: 'Refund authorized · NPR 3,400', date: '29 Oct · 12:45 · K. Adhikari' },
        { label: 'Payout submitted · PAY-7013', date: '29 Oct · 14:00 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6013', date: '29 Oct · 16:30 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6012',
      returnId: 'RET-1012',
      orderId: 'ORD-87912',
      customer: 'Bishal Lama',
      method: 'Khalti',
      amount: 1250,
      completedAt: '29 Oct 2026 · 11:50 NPT',
      completedDate: '29 Oct 2026',
      completedTime: '11:50 NPT',
      providerRef: 'KH-RF-6012',
      uniqueRef: 'EP-RF-1012',
      item: 'Sports bag',
      reason: 'Wrong size',
      authorizedBy: 'A. Sharma · 28 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '28 Oct · 14:00 · S. Shrestha' },
        { label: 'Refund authorized · NPR 1,250', date: '28 Oct · 16:20 · A. Sharma' },
        { label: 'Payout submitted · PAY-7012', date: '29 Oct · 09:10 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6012', date: '29 Oct · 11:50 · Reference recorded' },
      ],
    },
    {
      receiptId: 'RF-6011',
      returnId: 'RET-1011',
      orderId: 'ORD-87880',
      customer: 'Sushma Thapa',
      method: 'Bank transfer',
      amount: 4100,
      completedAt: '28 Oct 2026 · 14:20 NPT',
      completedDate: '28 Oct 2026',
      completedTime: '14:20 NPT',
      providerRef: 'BT-RF-6011',
      uniqueRef: 'EP-RF-1011',
      item: 'Ceramic cookware set',
      reason: 'Damaged item',
      authorizedBy: 'K. Adhikari · 28 Oct',
      auditTrail: [
        { label: 'Inspection passed', date: '28 Oct · 10:15 · M. Basnet' },
        { label: 'Refund authorized · NPR 4,100', date: '28 Oct · 11:45 · K. Adhikari' },
        { label: 'Payout submitted · PAY-7011', date: '28 Oct · 12:30 · Rajesh Sharma' },
        { label: 'Payment confirmed · RF-6011', date: '28 Oct · 14:20 · Reference recorded' },
      ],
    },
  ]);

  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('RF-6033');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchRefundHistory = async () => {
    try {
      const res: any = await ApiClient.get('/admin/returns/refund-history');
      if (res && res.data && res.data.history && res.data.history.length > 0) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load refund history:', err);
    }
  };

  useEffect(() => {
    fetchRefundHistory();
  }, []);

  const selectedRecord = history.find((h) => h.receiptId === selectedReceiptId) || history[0];

  const filteredHistory = history.filter((h) => {
    const matchesSearch =
      h.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.providerRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod =
      methodFilter === 'ALL' ||
      h.method.toLowerCase().includes(methodFilter.toLowerCase());
    return matchesSearch && matchesMethod;
  });

  const handleExportLedger = () => {
    const headers = [
      'Refund Receipt',
      'Return ID',
      'Order ID',
      'Customer',
      'Method',
      'Completed Amount (NPR)',
      'Completed At',
      'Provider Ref',
      'Unique Payout Ref',
    ];
    const rows = history.map((h) => [
      h.receiptId,
      h.returnId,
      h.orderId,
      h.customer,
      h.method,
      h.amount,
      h.completedAt,
      h.providerRef,
      h.uniqueRef,
    ]);
    exportToCsv({
      filename: `Completed_Refund_Ledger_${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — COMPLETED REFUND LEDGER',
      headers,
      rows,
    });
  };

  const handleDownloadReceiptPdf = () => {
    if (!selectedRecord) return;
    alert(`Generating official PDF receipt for ${selectedRecord.receiptId} (${selectedRecord.customer})...`);
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092865_ec48ca1e.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Refund History
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            An audit-ready ledger of completed refunds, with payment references and traceable receipts.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportLedger}
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
            <span>Export ledger</span>
          </button>
          <button
            onClick={handleDownloadReceiptPdf}
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
            <FileText size={14} color="#0F172A" />
            <span>Download receipts</span>
          </button>
        </div>
      </div>

      {/* 2. Top 3 KPI Cards matching media_1795254092865_ec48ca1e.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Completed refunds
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            42
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            Last 30 days · 03 Oct–01 Nov 2026
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Total completed amount
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            NPR 124,800
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            All 42 completed records, not only visible rows
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>
            Average completed refund
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
            NPR 2,971.43
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
            NPR 124,800 ÷ 42 completed refunds
          </div>
        </div>
      </div>

      {/* 3. Completed Refund Ledger Table matching media_1795254092865_ec48ca1e.jpg */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Completed refund ledger
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Verified refunds with unique gateway reconciliation codes
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Confirmed payments only
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
              placeholder="Search receipt, return, order or customer"
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7.5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
            <Calendar size={13} color="#64748B" />
            <span>03 Oct–01 Nov 2026</span>
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
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
            <option value="ALL">All methods</option>
            <option value="Visa">Visa Card</option>
            <option value="Mastercard">Mastercard</option>
            <option value="eSewa">eSewa</option>
            <option value="Khalti">Khalti</option>
            <option value="Bank transfer">Bank transfer</option>
          </select>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#047857',
            }}
          >
            Completed only
          </span>
        </div>

        {/* Table Rows */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <th style={{ padding: '11px 20px' }}>REFUND RECEIPT</th>
                <th style={{ padding: '11px 16px' }}>RETURN / ORDER</th>
                <th style={{ padding: '11px 16px' }}>CUSTOMER</th>
                <th style={{ padding: '11px 16px' }}>METHOD</th>
                <th style={{ padding: '11px 16px' }}>COMPLETED AMOUNT</th>
                <th style={{ padding: '11px 16px' }}>COMPLETED AT</th>
                <th style={{ padding: '11px 16px' }}>PROVIDER / UNIQUE REF.</th>
                <th style={{ padding: '11px 20px', textAlign: 'right' }}>RECORD</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const isSelected = item.receiptId === selectedReceiptId;
                return (
                  <tr
                    key={item.receiptId}
                    onClick={() => setSelectedReceiptId(item.receiptId)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.receiptId}</div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor: '#ECFDF5',
                          color: '#047857',
                          marginTop: '2px',
                        }}
                      >
                        Completed
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0F172A' }}>{item.returnId}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{item.orderId}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 500, color: '#0F172A' }}>
                      {item.customer}
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 500, color: '#0F172A' }}>
                      {item.method}
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                      NPR {item.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748B' }}>
                      <div>{item.completedDate}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.completedTime}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '11.5px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#0F172A', fontWeight: 500 }}>{item.providerRef}</div>
                      <div style={{ color: '#94A3B8', fontSize: '11px' }}>{item.uniqueRef}</div>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceiptId(item.receiptId);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'none',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: isSelected ? '#0B4EA2' : '#0B4EA2',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <FileText size={13} />
                        <span>View receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
          <span>Showing 1–8 of 42 completed refunds · Newest first</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#94A3B8' }}>8 per page ▾</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                Previous
              </button>
              <span style={{ fontWeight: 600, color: '#0F172A', padding: '0 4px' }}>1 of 6</span>
              <button style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Split Card: Receipt Card & Traceable Audit Trail matching media_1795254092865_ec48ca1e.jpg */}
      {selectedRecord && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Left: Refund Receipt Detail Panel */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {selectedRecord.receiptId} · Refund receipt
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                {selectedRecord.customer}
              </span>
            </div>

            {/* Big Amount and PDF Download Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                  NPR {selectedRecord.amount.toLocaleString()}
                </span>
                <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857' }}>
                  Completed
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <Download size={13} color="#64748B" />
                <span>Receipt PDF</span>
              </button>
            </div>

            {/* 6-Grid Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Return / order</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRecord.returnId} / {selectedRecord.orderId}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Original payment</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRecord.method} / CD-PAY-88112
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Completed at</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRecord.completedAt}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Provider reference</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px', fontFamily: 'monospace' }}>
                  {selectedRecord.providerRef}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Unique payout reference</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px', fontFamily: 'monospace' }}>
                  {selectedRecord.uniqueRef}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Authorized by</div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRecord.authorizedBy || 'A. Sharma · 30 Oct'}
                </div>
              </div>
            </div>

            {/* Receipt Summary Note */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
              {selectedRecord.item || 'Reading lamp'} · {selectedRecord.reason || 'Defective item'} · Full item amount returned to the original payment source. Receipt recorded in the customer case timeline.
            </div>
          </div>

          {/* Right: Traceable Audit Trail */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Audit trail
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedRecord.returnId}
                </span>
              </div>

              {/* Step Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                {(selectedRecord.auditTrail || [
                  { label: 'Inspection passed', date: '30 Oct · 09:20 · S. Shrestha' },
                  { label: 'Refund authorized · NPR 2,400', date: '30 Oct · 11:05 · A. Sharma' },
                  { label: 'Payout submitted · PAY-7033', date: '30 Oct · 11:15 · Rajesh Sharma' },
                  { label: 'Payment confirmed · RF-6033', date: '01 Nov · 08:40 · Reference recorded' },
                ]).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{step.label}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '16px' }}>
              Immutable ledger hash: <span style={{ fontFamily: 'monospace', color: '#475569' }}>sha256:7f9b81...4a2</span>
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

export default AdminRefundHistoryPage;
