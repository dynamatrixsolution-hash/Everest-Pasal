import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface PayoutJob {
  payoutId: string;
  returnId: string;
  customer: string;
  orderId: string;
  uniqueRef: string;
  method: string;
  amount: number;
  submittedDate: string;
  providerRef: string;
  currentState: string;
  issueSubstate: string;
  issueDetail?: string;
  lastChecked?: string;
  isIssue: boolean;
}

export const AdminRefundProcessingPage: React.FC = () => {
  const [jobs, setJobs] = useState<PayoutJob[]>([
    {
      payoutId: 'PAY-7035',
      returnId: 'RET-1035',
      customer: 'Deepak Joshi',
      orderId: 'ORD-88143',
      uniqueRef: 'EP-RF-1035',
      method: 'eSewa',
      amount: 1100,
      submittedDate: '31 Oct · 13:40',
      providerRef: 'ES-RF-7035',
      currentState: 'Payment issue',
      issueSubstate: 'Destination rejected',
      issueDetail: 'eSewa returned a destination rejected response at 31 Oct · 13:42. The target mobile wallet was reported inactive or closed. The customer\'s card/wallet was not debited.',
      lastChecked: '01 Nov 2026 · 10:10 NPT',
      isIssue: true,
    },
    {
      payoutId: 'PAY-7024',
      returnId: 'RET-1024',
      customer: 'Ramesh KC',
      orderId: 'ORD-88041',
      uniqueRef: 'EP-RF-1024',
      method: 'Bank transfer',
      amount: 3650,
      submittedDate: '30 Oct · 10:25',
      providerRef: 'BT-RF-7024',
      currentState: 'Payment issue',
      issueSubstate: 'Account validation failed',
      issueDetail: 'Account validation failed at clearing bank. Account number does not match registered account name.',
      lastChecked: '31 Oct 2026 · 12:00 NPT',
      isIssue: true,
    },
    {
      payoutId: 'PAY-7036',
      returnId: 'RET-1036',
      customer: 'Nisha Lama',
      orderId: 'ORD-88150',
      uniqueRef: 'EP-RF-1036',
      method: 'Khalti',
      amount: 1750,
      submittedDate: '01 Nov · 09:50',
      providerRef: 'KH-RF-7036',
      currentState: 'Processing',
      issueSubstate: 'Provider accepted',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7029',
      returnId: 'RET-1029',
      customer: 'Milan Rai',
      orderId: 'ORD-88098',
      uniqueRef: 'EP-RF-1029',
      method: 'Visa · 3912',
      amount: 2850,
      submittedDate: '31 Oct · 15:10',
      providerRef: 'CD-RF-7029',
      currentState: 'Processing',
      issueSubstate: 'Settlement pending',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7027',
      returnId: 'RET-1027',
      customer: 'Rupa Bista',
      orderId: 'ORD-88080',
      uniqueRef: 'EP-RF-1027',
      method: 'eSewa',
      amount: 950,
      submittedDate: '31 Oct · 14:20',
      providerRef: 'ES-RF-7027',
      currentState: 'Submitted',
      issueSubstate: 'Awaiting provider response',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7026',
      returnId: 'RET-1026',
      customer: 'Suraj Rana',
      orderId: 'ORD-88066',
      uniqueRef: 'EP-RF-1026',
      method: 'Bank transfer',
      amount: 4200,
      submittedDate: '30 Oct · 11:40',
      providerRef: 'BT-RF-7026',
      currentState: 'Processing',
      issueSubstate: '1 business day elapsed',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7023',
      returnId: 'RET-1023',
      customer: 'Asha Magar',
      orderId: 'ORD-88034',
      uniqueRef: 'EP-RF-1023',
      method: 'Khalti',
      amount: 1300,
      submittedDate: '29 Oct · 09:10',
      providerRef: 'KH-RF-7023',
      currentState: 'Delayed',
      issueSubstate: 'No final response >48h',
      isIssue: false,
    },
    {
      payoutId: 'PAY-7022',
      returnId: 'RET-1022',
      customer: 'Hari Khadka',
      orderId: 'ORD-88022',
      uniqueRef: 'EP-RF-1022',
      method: 'Mastercard · 2184',
      amount: 2600,
      submittedDate: '29 Oct · 08:45',
      providerRef: 'CD-RF-7022',
      currentState: 'Processing',
      issueSubstate: 'Within 3-5 business days',
      isIssue: false,
    },
  ]);

  const [selectedPayoutId, setSelectedPayoutId] = useState<string>('PAY-7035');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [isReconciling, setIsReconciling] = useState(false);
  const [successNote, setSuccessNote] = useState('');

  const fetchProcessingJobs = async () => {
    try {
      const res: any = await ApiClient.get('/admin/returns/processing');
      if (res && res.data && res.data.jobs && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load payout processing jobs:', err);
    }
  };

  useEffect(() => {
    fetchProcessingJobs();
  }, []);

  const selectedJob = jobs.find((j) => j.payoutId === selectedPayoutId) || jobs[0];

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.payoutId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState =
      stateFilter === 'ALL' ||
      j.currentState.toLowerCase() === stateFilter.toLowerCase();
    const matchesProvider =
      providerFilter === 'ALL' ||
      j.method.toLowerCase().includes(providerFilter.toLowerCase());
    return matchesSearch && matchesState && matchesProvider;
  });

  const handleReconcile = async () => {
    if (!selectedJob) return;
    setIsReconciling(true);
    try {
      await ApiClient.post(`/admin/returns/processing/${selectedJob.payoutId}/reconcile`, {
        state: 'Processing',
        note: 'Reconciled with gateway zero-debit verification. Payout cleared for retry.',
      });
      setSuccessNote(`Reconciled original job ${selectedJob.payoutId} successfully.`);
      setTimeout(() => setSuccessNote(''), 4000);
      fetchProcessingJobs();
    } catch (err) {
      console.error('Reconciliation error:', err);
      // update locally
      setJobs((prev) =>
        prev.map((j) =>
          j.payoutId === selectedJob.payoutId
            ? { ...j, currentState: 'Processing', issueSubstate: 'Reconciled · In progress', isIssue: false }
            : j
        )
      );
      setSuccessNote(`Reconciled ${selectedJob.payoutId} locally.`);
      setTimeout(() => setSuccessNote(''), 4000);
    } finally {
      setIsReconciling(false);
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case 'payment issue':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Payment issue
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Processing
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Submitted
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refund Processing</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track automated payout submissions, monitor gateway status, and resolve exceptions before confirmation.
        </p>
      </div>

      {successNote && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successNote}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Refund Processing
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">14 jobs</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Submitted or pending provider confirmation</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-[#E63946] uppercase tracking-wider">
            Refund Payment Issues
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-[#E63946]">2 jobs</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Require reconciliation before a safe retry</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Queue scope
          </span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">16 active jobs</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Not completed · Excluded from Refund History</p>
        </div>
      </div>

      {/* Payout Monitor Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Payout monitor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated submission pipeline and exception resolution
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {jobs.length} active jobs
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
              placeholder="Search job ID, return, order or customer..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
          >
            <option value="ALL">All payout states</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Processing">Processing</option>
            <option value="Submitted">Submitted</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
          >
            <option value="ALL">All providers</option>
            <option value="eSewa">eSewa</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="Khalti">Khalti</option>
            <option value="Visa">Visa Card</option>
            <option value="Mastercard">Mastercard</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">Payout Job</th>
                <th className="py-3.5 px-6">Return / Customer</th>
                <th className="py-3.5 px-6">Method</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Submitted</th>
                <th className="py-3.5 px-6">Provider Ref</th>
                <th className="py-3.5 px-6">Current State</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const isSelected = job.payoutId === selectedPayoutId;
                return (
                  <tr
                    key={job.payoutId}
                    onClick={() => setSelectedPayoutId(job.payoutId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{job.payoutId}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{job.uniqueRef}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{job.returnId}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{job.customer}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {job.method}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      NPR {job.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {job.submittedDate}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-700">
                      {job.providerRef}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(job.currentState)}
                        <span className="text-[11px] text-slate-400">
                          {job.issueSubstate}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {job.isIssue ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-[#0B4EA2]' : 'text-rose-600 hover:text-rose-800'
                          }`}
                        >
                          Review issue
                        </button>
                      ) : job.currentState === 'Delayed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800"
                        >
                          Reconcile →
                        </button>
                      ) : job.currentState === 'Submitted' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Check status →
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayoutId(job.payoutId);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View job
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3">
          <span>Showing 1–8 of 16 active jobs</span>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[#0B4EA2] text-white font-semibold">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Split Card: Payment Issue Review & Reconcile Guidance */}
      {selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Section (2 cols): Issue Review */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {selectedJob.payoutId} · Payment issue review
              </h3>
              <span className="text-sm font-semibold text-slate-800">
                {selectedJob.customer}
              </span>
            </div>

            {/* Error Banner Callout */}
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="font-semibold text-rose-950 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {selectedJob.issueDetail || 'Gateway reported destination rejected error.'}
              </div>
              <p className="text-[11px] text-rose-700">
                The target mobile wallet was reported inactive or closed. The customer&apos;s card/wallet was not debited.
              </p>
            </div>

            {/* 4 Detail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Return / original order</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedJob.returnId} / {selectedJob.orderId}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Unique payout ref</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedJob.uniqueRef}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Amount to refund</div>
                <div className="text-slate-900 font-bold mt-1">
                  NPR {selectedJob.amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Provider reference</div>
                <div className="text-slate-900 font-semibold mt-1">
                  {selectedJob.providerRef}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isReconciling}
                onClick={handleReconcile}
                className="px-5 py-2.5 rounded-xl bg-[#0B4EA2] text-white hover:bg-blue-800 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />
                Reconcile original job
              </button>
              <button
                type="button"
                onClick={() => alert(`Reviewing destination credentials for ${selectedJob.customer}...`)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Review destination
              </button>
              <button
                type="button"
                onClick={() => alert(`Showing prior gateway attempts for ${selectedJob.uniqueRef}`)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                View attempts
              </button>
            </div>
          </div>

          {/* Right Card (1 col): Safe Retry Policy */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#E63946] font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                Reconcile before retrying
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never retry a failed payout with the same provider without first reconciling the original reference. Reconciling prevents duplicate debits if the provider previously accepted the transaction.
              </p>
              <div className="space-y-3 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">1.</span>
                  <span>Query provider status with <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">{selectedJob.providerRef}</code>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">2.</span>
                  <span>If provider confirms zero debit, close <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">{selectedJob.payoutId}</code> as canceled.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">3.</span>
                  <span>Obtain verified alternate destination from the customer before re-submitting.</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              Provider compliance protocol · Nepal Rastra Bank payment directive
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

export default AdminRefundProcessingPage;
