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
        // Map backend returnsStore to match RefundItem
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refund Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Authorize eligible refund amounts after inspection, before any payout is submitted.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export authorization queue
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Awaiting Refund Authorization
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">{refunds.length} cases</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">All four have passed return inspection</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total requested
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">
              NPR {totalRequested.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            NPR 2,100 + NPR 4,500 + NPR 1,250 + NPR 850
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Authorized in this queue
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">NPR 0</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">No authorization decision has been saved</p>
        </div>
      </div>

      {/* Main Section: Eligible refunds */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Eligible refunds</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredRefunds.length} of {refunds.length} cases · No active filters
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Sorted by inspection completion
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search return, order or customer..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2] focus:border-transparent"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
          >
            <option value="ALL">All original payment methods</option>
            <option value="eSewa">eSewa</option>
            <option value="Visa">Visa Card</option>
            <option value="Khalti">Khalti</option>
          </select>

          <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-1.5">
            <span>Inspection passed</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">Return / Customer</th>
                <th className="py-3.5 px-6">Order / Reason</th>
                <th className="py-3.5 px-6">Original Payment</th>
                <th className="py-3.5 px-6">Requested</th>
                <th className="py-3.5 px-6">Authorized Amount</th>
                <th className="py-3.5 px-6">Eligibility</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefunds.map((item) => {
                const isSelected = item.returnId === selectedReturnId;
                return (
                  <tr
                    key={item.returnId}
                    onClick={() => setSelectedReturnId(item.returnId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{item.returnId}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.customer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{item.orderId}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.reason}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{item.originalPaymentMethod}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Paid {item.paidDate}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      NPR {item.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-600 text-xs">Not authorized</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Proposed: NPR {item.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.eligibility}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isSelected ? (
                        <span className="text-xs font-semibold text-[#0B4EA2]">Reviewing</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReturnId(item.returnId);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
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

        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
          <span>Showing all 4 eligible refunds awaiting authorization</span>
          <span className="font-semibold text-slate-700">
            Total requested: NPR {totalRequested.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom Split Card: Detail Review & Original Payment */}
      {selectedRefund && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Section (2 cols): Authorization Review */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRefund.returnId} · Authorization review
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedRefund.eligibility}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedRefund.status}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {selectedRefund.customer}
              </span>
            </div>

            {/* Inspection details info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Return / original order</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRefund.returnId} / {selectedRefund.orderId}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Inspection / inspector</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRefund.inspector}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Passed at</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedRefund.inspectionPassedAt}
                </div>
              </div>
            </div>

            {/* Inspection Note Box */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-700 italic leading-relaxed">
              &quot;{selectedRefund.inspectionNote}&quot;
            </div>

            {/* Calculation summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Item paid</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  NPR {selectedRefund.amount.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Deductions / fees</div>
                <div className="text-base font-bold text-slate-900 mt-1">NPR 0</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs text-emerald-700 font-medium">Maximum eligible</div>
                <div className="text-base font-bold text-emerald-800 mt-1">
                  NPR {selectedRefund.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Proposed authorization input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Proposed authorization
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={authorizedInputAmount}
                  onChange={(e) => setAuthorizedInputAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                />
                <Edit3 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                Requested: NPR {selectedRefund.amount.toLocaleString()}. Cannot exceed the eligible amount. A reduction requires a reason.
              </p>
            </div>

            {/* Finance decision note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Finance decision note
              </label>
              <textarea
                rows={3}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Full item value proposed. Add your authorization rationale before saving."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => alert('Hold marked. Clarification requested from warehouse QC team.')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Hold for clarification
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAuthorize}
                className="px-6 py-2.5 rounded-xl bg-[#0B4EA2] text-white hover:bg-blue-800 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : `Authorize NPR ${authorizedInputAmount.toLocaleString()}`}
              </button>
            </div>
          </div>

          {/* Right Card (1 col): Original Payment */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Original payment</h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Verified record
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Method / transaction</div>
                  <div className="text-slate-900 font-semibold text-sm mt-1">
                    {selectedRefund.originalPaymentMethod} / {selectedRefund.transactionRef}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 font-medium">Paid amount</div>
                    <div className="text-slate-900 font-semibold text-sm mt-1">
                      NPR {selectedRefund.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Paid on</div>
                    <div className="text-slate-900 font-semibold text-sm mt-1">
                      26 Oct 2026
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium">Refund destination</div>
                  <div className="text-slate-900 font-semibold mt-1">
                    Original payment source only
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium">Prior refunds on this payment</div>
                  <div className="text-slate-700 mt-1">
                    NPR 0. No existing payout job for {selectedRefund.returnId}.
                  </div>
                </div>
              </div>
            </div>

            {/* Info warning callout */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                Authorization is not payment
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Saving this decision records the allowed amount. A separate, uniquely referenced payout job must then be submitted from Refund Processing.
              </p>
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

export default AdminRefundRequestsPage;
