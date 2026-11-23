// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 25: All Payments (Payment Management > All Payments)
// Visual Source of Truth: media_1795251784865_79f76de2.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Eye,
  FileText,
  CreditCard,
  CheckCircle2,
  X,
  RefreshCw,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface PaymentItem {
  paymentId: string;
  customerName: string;
  customerLocation: string;
  vendor: string;
  channel: 'Web' | 'App';
  amount: number;
  amountFormatted: string;
  method: 'Card' | 'COD' | string;
  orderReference: string;
  status: 'Paid' | 'Pending' | 'Refund Due' | string;
  recordedOn: string;
  reconciliationStatus?: string;
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalPayments: 8,
    totalPaymentsNote: '5 paid • 2 pending • 1 refund due',
    pendingPayments: 2,
    pendingPaymentsNote: 'NPR 2,010 awaiting collection',
    paidPayments: 5,
    paidPaymentsNote: 'NPR 18,240 received',
    refundDue: 1,
    refundDueNote: 'NPR 2,340 awaiting refund',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [methodFilter, setMethodFilter] = useState<string>('All Methods');

  // Modals state
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [viewPaymentModalOpen, setViewPaymentModalOpen] = useState<boolean>(false);
  const [reviewPaymentModalOpen, setReviewPaymentModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Payment Form
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerLocation, setNewCustomerLocation] = useState<string>('Kathmandu');
  const [newVendor, setNewVendor] = useState<string>('Himalayan Mart');
  const [newChannel, setNewChannel] = useState<'Web' | 'App'>('Web');
  const [newAmount, setNewAmount] = useState<string>('2500');
  const [newMethod, setNewMethod] = useState<'Card' | 'COD'>('Card');
  const [newOrderRef, setNewOrderRef] = useState<string>('ORD-1009');
  const [newStatus, setNewStatus] = useState<string>('Paid');

  const initialSeedPayments: PaymentItem[] = [
    {
      paymentId: 'PAY-1001',
      customerName: 'Aarav Thapa',
      customerLocation: 'Kathmandu',
      vendor: 'Himalayan Mart',
      channel: 'Web',
      amount: 4850,
      amountFormatted: 'NPR 4,850',
      method: 'Card',
      orderReference: 'ORD-1001',
      status: 'Paid',
      recordedOn: '30 Oct 2026',
    },
    {
      paymentId: 'PAY-1002',
      customerName: 'Priya Shrestha',
      customerLocation: 'Pokhara',
      vendor: 'Pokhara Bazaar',
      channel: 'App',
      amount: 1120,
      amountFormatted: 'NPR 1,120',
      method: 'COD',
      orderReference: 'ORD-1002',
      status: 'Pending',
      recordedOn: '31 Oct 2026',
    },
    {
      paymentId: 'PAY-1003',
      customerName: 'Kishor Regmi',
      customerLocation: 'Lalitpur',
      vendor: 'Lalitpur Wholesale',
      channel: 'Web',
      amount: 2340,
      amountFormatted: 'NPR 2,340',
      method: 'Card',
      orderReference: 'ORD-1003',
      status: 'Refund Due',
      recordedOn: '30 Oct 2026',
    },
    {
      paymentId: 'PAY-1004',
      customerName: 'Srijana Poudel',
      customerLocation: 'Biratnagar',
      vendor: 'Biratnagar Hub',
      channel: 'App',
      amount: 890,
      amountFormatted: 'NPR 890',
      method: 'COD',
      orderReference: 'ORD-1004',
      status: 'Pending',
      recordedOn: '01 Nov 2026',
    },
    {
      paymentId: 'PAY-1005',
      customerName: 'Rohan Bajracharya',
      customerLocation: 'Butwal',
      vendor: 'Butwal Depot',
      channel: 'Web',
      amount: 3210,
      amountFormatted: 'NPR 3,210',
      method: 'Card',
      orderReference: 'ORD-1005',
      status: 'Paid',
      recordedOn: '29 Oct 2026',
    },
    {
      paymentId: 'PAY-1006',
      customerName: 'Nisha Chaudhary',
      customerLocation: 'Dharan',
      vendor: 'Dharan Market',
      channel: 'App',
      amount: 1980,
      amountFormatted: 'NPR 1,980',
      method: 'Card',
      orderReference: 'ORD-1006',
      status: 'Paid',
      recordedOn: '28 Oct 2026',
    },
    {
      paymentId: 'PAY-1007',
      customerName: 'Bipin Adhikari',
      customerLocation: 'Hetauda',
      vendor: 'Hetauda Store',
      channel: 'Web',
      amount: 2760,
      amountFormatted: 'NPR 2,760',
      method: 'Card',
      orderReference: 'ORD-1007',
      status: 'Paid',
      recordedOn: '01 Nov 2026',
    },
    {
      paymentId: 'PAY-1008',
      customerName: 'Shilpa Rana',
      customerLocation: 'Nepalgunj',
      vendor: 'Nepalgunj Outlet',
      channel: 'App',
      amount: 5440,
      amountFormatted: 'NPR 5,440',
      method: 'Card',
      orderReference: 'ORD-1008',
      status: 'Paid',
      recordedOn: '27 Oct 2026',
    },
  ];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/admin/payments');
      if (res && res.payments && Array.isArray(res.payments)) {
        setPayments(res.payments);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setPayments(initialSeedPayments);
      }
    } catch {
      setPayments(initialSeedPayments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.paymentId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerLocation.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.orderReference.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All Status' ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === 'All Methods' ||
        item.method.toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Payment ID',
      'Customer',
      'Location',
      'Vendor',
      'Channel',
      'Amount (NPR)',
      'Method',
      'Order Reference',
      'Status',
      'Recorded On',
    ];
    const rows = filteredPayments.map((p) => [
      p.paymentId,
      p.customerName,
      p.customerLocation,
      p.vendor,
      p.channel,
      p.amount.toString(),
      p.method,
      p.orderReference,
      p.status,
      p.recordedOn,
    ]);

    exportToCsv({
      filename: `everest-pasal-payments-report-${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Platform Payments Ledger',
      subtitle: 'System Admin Control Center - Payment Management Suite',
      metadata: {
        'Export Date': new Date().toLocaleString(),
        'Total Records': filteredPayments.length.toString(),
        'Paid Payments': metrics.paidPayments.toString(),
        'Pending Payments': metrics.pendingPayments.toString(),
        'Refund Due': metrics.refundDue.toString(),
      },
      headers,
      rows,
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: newCustomerName,
        customerLocation: newCustomerLocation,
        vendor: newVendor,
        channel: newChannel,
        amount: Number(newAmount),
        method: newMethod,
        orderReference: newOrderRef,
        status: newStatus,
      };
      const res = await ApiClient.post<any>('/api/v1/admin/payments', payload);
      if (res) {
        setPayments((prev) => [res, ...prev]);
      }
    } catch {
      const nextNum = 1000 + payments.length + 1;
      const fallback: PaymentItem = {
        paymentId: `PAY-${nextNum}`,
        customerName: newCustomerName,
        customerLocation: newCustomerLocation,
        vendor: newVendor,
        channel: newChannel,
        amount: Number(newAmount),
        amountFormatted: `NPR ${Number(newAmount).toLocaleString()}`,
        method: newMethod,
        orderReference: newOrderRef,
        status: newStatus,
        recordedOn: 'Just now',
      };
      setPayments((prev) => [fallback, ...prev]);
    }

    setToastMessage(`Payment of NPR ${Number(newAmount).toLocaleString()} recorded successfully.`);
    setRecordPaymentModalOpen(false);
    setNewCustomerName('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExecuteReviewAction = (action: 'CAPTURE' | 'REFUND') => {
    if (!selectedPayment) return;

    if (action === 'CAPTURE') {
      setPayments((prev) =>
        prev.map((p) =>
          p.paymentId === selectedPayment.paymentId ? { ...p, status: 'Paid' } : p
        )
      );
      setToastMessage(`Payment ${selectedPayment.paymentId} marked as Paid and collected.`);
    } else {
      setPayments((prev) =>
        prev.map((p) =>
          p.paymentId === selectedPayment.paymentId ? { ...p, status: 'Refunded' } : p
        )
      );
      setToastMessage(`Refund of ${selectedPayment.amountFormatted} processed for ${selectedPayment.paymentId}.`);
    }

    setReviewPaymentModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Paid') {
      return (
        <span
          style={{
            padding: '3px 10px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            border: '1px solid #BBF7D0',
            borderRadius: '4px',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
        >
          Paid
        </span>
      );
    }
    if (status === 'Refund Due') {
      return (
        <span
          style={{
            padding: '3px 10px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: '4px',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
        >
          Refund Due
        </span>
      );
    }
    return (
      <span
        style={{
          padding: '3px 10px',
          backgroundColor: '#E0E7FF',
          color: '#4338CA',
          border: '1px solid #C7D2FE',
          borderRadius: '4px',
          fontSize: '11.5px',
          fontWeight: 500,
        }}
      >
        Pending
      </span>
    );
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#E63946', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            All Payments
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}>
            Track payment records, collection status and refunds across customer orders. Review pending payments and outstanding refunds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={15} color="#64748B" />
            <span>Export Payments Report</span>
          </button>

          <button
            onClick={() => setRecordPaymentModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Total Payments
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.totalPayments}
          </div>
          <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 500 }}>
            {metrics.totalPaymentsNote}
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Pending Payments
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.pendingPayments}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.pendingPaymentsNote}
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Paid Payments
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10B981', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.paidPayments}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.paidPaymentsNote}
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Refund Due
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.refundDue}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.refundDueNote}
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '650px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search payment, order or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refund Due">Refund Due</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Methods">All Methods</option>
              <option value="Card">Card</option>
              <option value="COD">COD</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {filteredPayments.length} payments across 8 vendors
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: '11px', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>PAYMENT ID</th>
                <th style={{ padding: '12px 18px' }}>CUSTOMER</th>
                <th style={{ padding: '12px 18px' }}>VENDOR / CHANNEL</th>
                <th style={{ padding: '12px 18px' }}>PAYMENT AMOUNT</th>
                <th style={{ padding: '12px 18px' }}>METHOD</th>
                <th style={{ padding: '12px 18px' }}>ORDER REFERENCE</th>
                <th style={{ padding: '12px 18px' }}>STATUS</th>
                <th style={{ padding: '12px 18px' }}>RECORDED ON</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto' }} />
                    Loading payment records...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No payment records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => {
                  return (
                    <tr
                      key={item.paymentId}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Payment ID */}
                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>
                        {item.paymentId}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                          {item.customerName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          {item.customerLocation}
                        </div>
                      </td>

                      {/* Vendor / Channel */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 500, color: '#334155' }}>
                          {item.vendor}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          {item.channel}
                        </div>
                      </td>

                      {/* Payment Amount */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 600 }}>
                        {item.amountFormatted}
                      </td>

                      {/* Method */}
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {item.method}
                      </td>

                      {/* Order Reference */}
                      <td style={{ padding: '14px 18px', color: '#0B4EA2', fontWeight: 500 }}>
                        {item.orderReference}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Recorded On */}
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {item.recordedOn}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {item.status === 'Paid' ? (
                          <button
                            onClick={() => {
                              setSelectedPayment(item);
                              setViewPaymentModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#0B4EA2',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedPayment(item);
                              setReviewPaymentModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#0B4EA2',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <FileText size={13} />
                            <span>Review</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', fontSize: '12px', color: '#64748B' }}>
          Showing 1–{filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* MODAL 1: Record Payment Modal */}
      {recordPaymentModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '520px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} color="#0B4EA2" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Record Payment Transaction
                </h3>
              </div>
              <button onClick={() => setRecordPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Adhikari"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomerLocation}
                      onChange={(e) => setNewCustomerLocation(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Vendor
                    </label>
                    <select
                      value={newVendor}
                      onChange={(e) => setNewVendor(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="Himalayan Mart">Himalayan Mart</option>
                      <option value="Pokhara Bazaar">Pokhara Bazaar</option>
                      <option value="Lalitpur Wholesale">Lalitpur Wholesale</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Amount (NPR)
                    </label>
                    <input
                      type="number"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Payment Method
                    </label>
                    <select
                      value={newMethod}
                      onChange={(e) => setNewMethod(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="Card">Card (Credit/Debit/Fonepay)</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRecordPaymentModalOpen(false)}
                  style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#0B4EA2', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Payment Modal */}
      {viewPaymentModalOpen && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                Payment Receipt • {selectedPayment.paymentId}
              </h3>
              <button onClick={() => setViewPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Total Collected</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0B4EA2', marginTop: '4px' }}>{selectedPayment.amountFormatted}</div>
                <div style={{ marginTop: '6px' }}>{getStatusBadge(selectedPayment.status)}</div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer:</span>
                  <strong>{selectedPayment.customerName} ({selectedPayment.customerLocation})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vendor:</span>
                  <strong>{selectedPayment.vendor}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Order Reference:</span>
                  <strong>{selectedPayment.orderReference}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Method / Channel:</span>
                  <strong>{selectedPayment.method} • {selectedPayment.channel}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Recorded Date:</span>
                  <strong>{selectedPayment.recordedOn}</strong>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button
                onClick={() => setViewPaymentModalOpen(false)}
                style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Review Payment Modal */}
      {reviewPaymentModalOpen && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '520px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                Payment Review • {selectedPayment.paymentId}
              </h3>
              <button onClick={() => setReviewPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              {selectedPayment.status === 'Refund Due' ? (
                <div>
                  <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', marginBottom: '16px', color: '#991B1B', fontSize: '12.5px' }}>
                    Refund is due for cancelled order <strong>{selectedPayment.orderReference}</strong>. Amount to refund: <strong>{selectedPayment.amountFormatted}</strong>.
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Execute refund to reverse charges back to customer account and settle merchant account.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginBottom: '16px', color: '#1E40AF', fontSize: '12.5px' }}>
                    Payment collection pending for <strong>{selectedPayment.amountFormatted}</strong> ({selectedPayment.method}) on order <strong>{selectedPayment.orderReference}</strong>.
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Confirm that funds have been collected from the customer or delivery partner.
                  </p>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setReviewPaymentModalOpen(false)}
                style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              {selectedPayment.status === 'Refund Due' ? (
                <button
                  onClick={() => handleExecuteReviewAction('REFUND')}
                  style={{ padding: '7px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Process Refund
                </button>
              ) : (
                <button
                  onClick={() => handleExecuteReviewAction('CAPTURE')}
                  style={{ padding: '7px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#0B4EA2', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
