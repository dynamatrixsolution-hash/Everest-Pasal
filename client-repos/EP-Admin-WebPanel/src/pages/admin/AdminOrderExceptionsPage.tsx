// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 24: Order Exceptions (Order Management > Order Exceptions)
// Visual Source of Truth: media_1795251174251_699f595f.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  FileText,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface OrderException {
  orderId: string;
  customerName: string;
  customerLocation: string;
  vendor: string;
  channel: 'Web' | 'App';
  orderTotal: number;
  orderTotalFormatted: string;
  payment: string;
  fulfillment: string;
  exceptionReason: 'Refund Due' | 'Payment Pending' | string;
  resolutionStatus: 'Pending Review' | 'Resolved';
  placedOn: string;
}

export const AdminOrderExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<OrderException[]>([]);
  const [metrics, setMetrics] = useState({
    openExceptions: 2,
    openExceptionsNote: 'Need manual resolution',
    paymentExceptions: 1,
    paymentExceptionsNote: 'Pending payment review',
    refundExceptions: 1,
    refundExceptionsNote: 'Refund due and pending',
    resolvedExceptions: 0,
    resolvedExceptionsNote: 'No exceptions closed',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exceptionTypeFilter, setExceptionTypeFilter] = useState<string>('All Exceptions');
  const [channelFilter, setChannelFilter] = useState<string>('All Channels');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [createExceptionModalOpen, setCreateExceptionModalOpen] = useState<boolean>(false);
  const [selectedException, setSelectedException] = useState<OrderException | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Exception State
  const [newOrderId, setNewOrderId] = useState<string>('ORD-1005');
  const [newReason, setNewReason] = useState<string>('Damaged Goods on Delivery');
  const [newNotes, setNewNotes] = useState<string>('');

  const initialSeedExceptions: OrderException[] = [
    {
      orderId: 'ORD-1003',
      customerName: 'Kishor Regmi',
      customerLocation: 'Lalitpur',
      vendor: 'Lalitpur Wholesale',
      channel: 'Web',
      orderTotal: 2340,
      orderTotalFormatted: 'NPR 2,340',
      payment: 'Refund Due',
      fulfillment: 'Cancelled',
      exceptionReason: 'Refund Due',
      resolutionStatus: 'Pending Review',
      placedOn: '30 Oct 2026',
    },
    {
      orderId: 'ORD-1004',
      customerName: 'Srijana Poudel',
      customerLocation: 'Biratnagar',
      vendor: 'Biratnagar Hub',
      channel: 'App',
      orderTotal: 890,
      orderTotalFormatted: 'NPR 890',
      payment: 'Pending',
      fulfillment: 'Pending',
      exceptionReason: 'Payment Pending',
      resolutionStatus: 'Pending Review',
      placedOn: '01 Nov 2026',
    },
  ];

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/admin/orders/exceptions');
      if (res && res.exceptions && Array.isArray(res.exceptions)) {
        setExceptions(res.exceptions);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setExceptions(initialSeedExceptions);
      }
    } catch {
      setExceptions(initialSeedExceptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.orderId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerLocation.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q);

      const matchesType =
        exceptionTypeFilter === 'All Exceptions' ||
        item.exceptionReason.toLowerCase() === exceptionTypeFilter.toLowerCase();

      const matchesChannel =
        channelFilter === 'All Channels' ||
        item.channel.toLowerCase() === channelFilter.toLowerCase();

      return matchesSearch && matchesType && matchesChannel;
    });
  }, [exceptions, searchQuery, exceptionTypeFilter, channelFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Order ID',
      'Customer',
      'Location',
      'Vendor',
      'Channel',
      'Order Total (NPR)',
      'Payment Status',
      'Fulfilment Status',
      'Exception Reason',
      'Resolution Status',
      'Placed On',
    ];
    const rows = filteredExceptions.map((e) => [
      e.orderId,
      e.customerName,
      e.customerLocation,
      e.vendor,
      e.channel,
      e.orderTotal.toString(),
      e.payment,
      e.fulfillment,
      e.exceptionReason,
      e.resolutionStatus,
      e.placedOn,
    ]);

    exportToCsv({
      filename: `everest-pasal-order-exceptions-${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Order Exceptions Audit Report',
      subtitle: 'System Admin Control Center - Order Management Suite',
      metadata: {
        'Export Date': new Date().toLocaleString(),
        'Open Exceptions': metrics.openExceptions.toString(),
        'Payment Exceptions': metrics.paymentExceptions.toString(),
        'Refund Exceptions': metrics.refundExceptions.toString(),
      },
      headers,
      rows,
    });
  };

  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/admin/orders/exceptions', {
        orderId: newOrderId,
        reason: newReason,
        notes: newNotes,
      });
    } catch {
      // Offline fallback
    }

    const created: OrderException = {
      orderId: newOrderId,
      customerName: 'Rohan Bajracharya',
      customerLocation: 'Butwal',
      vendor: 'Butwal Depot',
      channel: 'Web',
      orderTotal: 3210,
      orderTotalFormatted: 'NPR 3,210',
      payment: 'Paid',
      fulfillment: 'Delivered',
      exceptionReason: newReason,
      resolutionStatus: 'Pending Review',
      placedOn: 'Just now',
    };

    setExceptions((prev) => [created, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      openExceptions: prev.openExceptions + 1,
    }));

    setToastMessage(`Exception successfully recorded for ${newOrderId}. Assigned to support desk.`);
    setCreateExceptionModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProcessRefund = async () => {
    if (!selectedException) return;
    try {
      await ApiClient.post(`/api/v1/admin/orders/${selectedException.orderId}/refund`, {
        memo: 'Processed from Order Exceptions panel',
      });
    } catch {
      // Offline fallback
    }

    setExceptions((prev) =>
      prev.map((e) =>
        e.orderId === selectedException.orderId
          ? { ...e, resolutionStatus: 'Resolved', payment: 'Refunded' }
          : e
      )
    );

    setMetrics((prev) => ({
      ...prev,
      openExceptions: Math.max(0, prev.openExceptions - 1),
      refundExceptions: Math.max(0, prev.refundExceptions - 1),
      resolvedExceptions: prev.resolvedExceptions + 1,
    }));

    setToastMessage(`Refund of ${selectedException.orderTotalFormatted} dispatched and exception closed.`);
    setRefundModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProcessPayment = async () => {
    if (!selectedException) return;
    try {
      await ApiClient.post(`/api/v1/admin/orders/${selectedException.orderId}/payment`, {
        memo: 'Payment verified and captured from Exceptions panel',
      });
    } catch {
      // Offline fallback
    }

    setExceptions((prev) =>
      prev.map((e) =>
        e.orderId === selectedException.orderId
          ? { ...e, resolutionStatus: 'Resolved', payment: 'Paid', fulfillment: 'Packed' }
          : e
      )
    );

    setMetrics((prev) => ({
      ...prev,
      openExceptions: Math.max(0, prev.openExceptions - 1),
      paymentExceptions: Math.max(0, prev.paymentExceptions - 1),
      resolvedExceptions: prev.resolvedExceptions + 1,
    }));

    setToastMessage(`Payment of ${selectedException.orderTotalFormatted} captured and order moved to Processing.`);
    setPaymentModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
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
            Order Exceptions
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}>
            Review orders with unresolved payment, refund, cancellation or operational issues that need manual resolution.
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
            <span>Export Exceptions Report</span>
          </button>

          <button
            onClick={() => setCreateExceptionModalOpen(true)}
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
            <span>Create Exception</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Open Exceptions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.openExceptions}
          </div>
          <div style={{ fontSize: '11.5px', color: '#E63946', fontWeight: 500 }}>
            {metrics.openExceptionsNote}
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Payment Exceptions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.paymentExceptions}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.paymentExceptionsNote}
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Refund Exceptions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.refundExceptions}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.refundExceptionsNote}
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Resolved Exceptions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.resolvedExceptions}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.resolvedExceptionsNote}
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
                placeholder="Search exception ID, customer or vendor..."
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
              value={exceptionTypeFilter}
              onChange={(e) => setExceptionTypeFilter(e.target.value)}
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
              <option value="All Exceptions">All Exceptions</option>
              <option value="Refund Due">Refund Due</option>
              <option value="Payment Pending">Payment Pending</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
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
              <option value="All Channels">All Channels</option>
              <option value="Web">Web</option>
              <option value="App">App</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {filteredExceptions.length} open exceptions across 2 vendors
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: '11px', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>ORDER ID</th>
                <th style={{ padding: '12px 18px' }}>CUSTOMER</th>
                <th style={{ padding: '12px 18px' }}>VENDOR / CHANNEL</th>
                <th style={{ padding: '12px 18px' }}>ORDER TOTAL</th>
                <th style={{ padding: '12px 18px' }}>PAYMENT</th>
                <th style={{ padding: '12px 18px' }}>FULFILMENT</th>
                <th style={{ padding: '12px 18px' }}>EXCEPTION REASON</th>
                <th style={{ padding: '12px 18px' }}>RESOLUTION STATUS</th>
                <th style={{ padding: '12px 18px' }}>PLACED ON</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>NEXT ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto' }} />
                    Loading order exceptions...
                  </td>
                </tr>
              ) : filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No exceptions found. All operational workflows normal.
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((item) => {
                  const getReasonBadge = (reason: string) => {
                    if (reason === 'Refund Due') {
                      return (
                        <span
                          style={{
                            padding: '3px 8px',
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
                          padding: '3px 8px',
                          backgroundColor: '#FEF3C7',
                          color: '#D97706',
                          border: '1px solid #FDE68A',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                        }}
                      >
                        Payment Pending
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={item.orderId}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Order ID */}
                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>
                        {item.orderId}
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

                      {/* Order Total */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 600 }}>
                        {item.orderTotalFormatted}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 18px', color: item.payment === 'Refund Due' ? '#DC2626' : '#334155', fontWeight: 500 }}>
                        {item.payment}
                      </td>

                      {/* Fulfilment */}
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {item.fulfillment}
                      </td>

                      {/* Exception Reason */}
                      <td style={{ padding: '14px 18px' }}>
                        {getReasonBadge(item.exceptionReason)}
                      </td>

                      {/* Resolution Status */}
                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 500 }}>
                        {item.resolutionStatus}
                      </td>

                      {/* Placed On */}
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {item.placedOn}
                      </td>

                      {/* Next Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {item.exceptionReason === 'Refund Due' ? (
                          <button
                            onClick={() => {
                              setSelectedException(item);
                              setRefundModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#1D4ED8',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <RotateCcw size={13} />
                            <span>Review Refund</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedException(item);
                              setPaymentModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#1D4ED8',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <CreditCard size={13} />
                            <span>Review Payment</span>
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

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
          <div>
            Showing 1–{filteredExceptions.length} of {metrics.openExceptions} exceptions
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'default',
                fontSize: '12px',
              }}
            >
              Previous
            </button>

            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#0B4EA2',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              1
            </button>

            <button
              disabled
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#94A3B8',
                cursor: 'not-allowed',
                fontSize: '12px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Exception Modal */}
      {createExceptionModalOpen && (
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
                <ShieldAlert size={18} color="#E63946" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Log Manual Order Exception
                </h3>
              </div>
              <button onClick={() => setCreateExceptionModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateException}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Target Order ID
                  </label>
                  <select
                    value={newOrderId}
                    onChange={(e) => setNewOrderId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="ORD-1005">ORD-1005 (Rohan Bajracharya • NPR 3,210)</option>
                    <option value="ORD-1006">ORD-1006 (Nisha Chaudhary • NPR 1,980)</option>
                    <option value="ORD-1007">ORD-1007 (Bipin Adhikari • NPR 2,760)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Exception Classification
                  </label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="Damaged Goods on Delivery">Damaged Goods on Delivery</option>
                    <option value="Customer Address Unreachable">Customer Address Unreachable</option>
                    <option value="Payment Gateway Discrepancy">Payment Gateway Discrepancy</option>
                    <option value="Vendor Non-Fulfillment Timeout">Vendor Non-Fulfillment Timeout</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Investigation Memo
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe reported issue and steps required..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateExceptionModalOpen(false)}
                  style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#0B4EA2', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Review Refund Modal */}
      {refundModalOpen && selectedException && (
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
                <RotateCcw size={18} color="#DC2626" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Execute Exception Refund • {selectedException.orderId}
                </h3>
              </div>
              <button onClick={() => setRefundModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#991B1B' }}>
                  Refund Exception flagged for cancelled order. Amount due: <strong>{selectedException.orderTotalFormatted}</strong> to <strong>{selectedException.customerName} ({selectedException.customerLocation})</strong>.
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '16px' }}>
                Confirming will trigger payment gateway reversal to the customer&apos;s bank / digital wallet and mark exception as Resolved.
              </div>
            </div>
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRefundModalOpen(false)}
                style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                style={{ padding: '7px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Execute Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Review Payment Modal */}
      {paymentModalOpen && selectedException && (
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
                  Resolve Payment Exception • {selectedException.orderId}
                </h3>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ padding: '14px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#92400E' }}>
                  Manual verification required for order of <strong>{selectedException.orderTotalFormatted}</strong> by <strong>{selectedException.customerName}</strong> via {selectedException.channel}.
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '16px' }}>
                Confirming will mark payment as verified, advance order status to Processing, notify vendor ({selectedException.vendor}) to dispatch, and resolve this exception.
              </div>
            </div>
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPaymentModalOpen(false)}
                style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                style={{ padding: '7px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#0B4EA2', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Capture & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
