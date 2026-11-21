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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refund History</h1>
          <p className="text-sm text-slate-500 mt-1">
            An audit-ready ledger of completed refunds, with payment references and traceable receipts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportLedger}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export ledger
          </button>
          <button
            onClick={handleDownloadReceiptPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Download receipts
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed refunds
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">42</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Last 30 days · 03 Oct–01 Nov 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total completed amount
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">NPR 124,800</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">All 42 completed records, not only visible rows</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average completed refund
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">NPR 2,971.43</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">NPR 124,800 ÷ 42 completed refunds</p>
        </div>
      </div>

      {/* Completed Refund Ledger Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Completed refund ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified refunds with unique gateway reconciliation codes
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Confirmed payments only
          </span>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt, return, order or customer"
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
            />
          </div>

          <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>03 Oct–01 Nov 2026</span>
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
          >
            <option value="ALL">All methods</option>
            <option value="Visa">Visa Card</option>
            <option value="Mastercard">Mastercard</option>
            <option value="eSewa">eSewa</option>
            <option value="Khalti">Khalti</option>
            <option value="Bank transfer">Bank transfer</option>
          </select>

          <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed only
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">Refund Receipt</th>
                <th className="py-3.5 px-6">Return / Order</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Method</th>
                <th className="py-3.5 px-6">Completed Amount</th>
                <th className="py-3.5 px-6">Completed At</th>
                <th className="py-3.5 px-6">Provider / Unique Ref.</th>
                <th className="py-3.5 px-6 text-right">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => {
                const isSelected = item.receiptId === selectedReceiptId;
                return (
                  <tr
                    key={item.receiptId}
                    onClick={() => setSelectedReceiptId(item.receiptId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{item.receiptId}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 mt-0.5">
                        Completed
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{item.returnId}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.orderId}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {item.customer}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {item.method}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      NPR {item.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div>{item.completedDate}</div>
                      <div className="text-[11px] text-slate-400">{item.completedTime}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="text-slate-800">{item.providerRef}</div>
                      <div className="text-slate-400 mt-0.5">{item.uniqueRef}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceiptId(item.receiptId);
                        }}
                        className={`text-xs font-semibold inline-flex items-center gap-1 ${
                          isSelected ? 'text-[#0B4EA2]' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3">
          <span>Showing 1–8 of 42 completed refunds · Newest first</span>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-slate-400">8 per page</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                Previous
              </button>
              <span className="px-3 py-1.5 font-semibold text-slate-700">1 of 6</span>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Split Card: Receipt Card & Traceable Audit Trail */}
      {selectedRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Section (2 cols): Refund Receipt Detail */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {selectedRecord.receiptId} · Refund receipt
              </h3>
              <span className="text-sm font-semibold text-slate-800">
                {selectedRecord.customer}
              </span>
            </div>

            {/* Big Amount and PDF Download Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50/80 p-4 rounded-xl border border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  NPR {selectedRecord.amount.toLocaleString()}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Receipt PDF
              </button>
            </div>

            {/* 6-Grid Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Return / order</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRecord.returnId} / {selectedRecord.orderId}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Original payment</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRecord.method} / CD-PAY-88112
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Completed at</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRecord.completedAt}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Provider reference</div>
                <div className="text-slate-900 font-mono font-semibold mt-1">
                  {selectedRecord.providerRef}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Unique payout reference</div>
                <div className="text-slate-900 font-mono font-semibold mt-1">
                  {selectedRecord.uniqueRef}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Authorized by</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRecord.authorizedBy || 'A. Sharma · 30 Oct'}
                </div>
              </div>
            </div>

            {/* Receipt Summary Note */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-600 italic">
              {selectedRecord.item || 'Reading lamp'} · {selectedRecord.reason || 'Defective item'} · Full item amount returned to the original payment source. Receipt recorded in the customer case timeline.
            </div>
          </div>

          {/* Right Card (1 col): Traceable Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Audit trail</h3>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {selectedRecord.returnId}
                </span>
              </div>

              {/* Step Timeline */}
              <div className="space-y-4 pt-4 text-xs">
                {(selectedRecord.auditTrail || [
                  { label: 'Inspection passed', date: '30 Oct · 09:20 · S. Shrestha' },
                  { label: 'Refund authorized · NPR 2,400', date: '30 Oct · 11:05 · A. Sharma' },
                  { label: 'Payout submitted · PAY-7033', date: '30 Oct · 11:15 · Rajesh Sharma' },
                  { label: 'Payment confirmed · RF-6033', date: '01 Nov · 08:40 · Reference recorded' },
                ]).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{step.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
              Immutable ledger hash: <span className="font-mono text-slate-700">sha256:7f9b81...4a2</span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-200/60">
        <span>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</span>
        <span>Everest Pasal / Operations</span>
      </div>
    </div>
  );
};

export default AdminRefundHistoryPage;
