// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN ORDERS SUMMARY
// Pixel-perfect implementation of media_1795244079050_53f03747.jpg
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { exportToPdf, exportToCsv, exportToDocx } from '../../utils/documentExport.js';
import {
  Download,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Check,
  MoreHorizontal,
  FileText,
  Eye,
} from 'lucide-react';

export const AdminOrdersSummaryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [timeframe, setTimeframe] = useState('30_days');
  const [periodTab, setPeriodTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const fetchOrdersSummary = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/admin/dashboard/orders-summary?timeframe=${timeframe}&filter=${statusFilter}&search=${searchQuery}`
      );
      setData(res?.data || res);
    } catch (err: any) {
      console.warn('Failed to load orders summary:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersSummary();
  }, [timeframe, periodTab, statusFilter, searchQuery]);

  const handleExport = (format: 'pdf' | 'csv' | 'docx' = 'pdf') => {
    const filename = `Everest_Pasal_Orders_Summary_${Date.now()}`;
    const headers = ['Order ID', 'Customer', 'Vendor', 'Amount', 'Payment Status', 'Fulfillment Status'];
    const rows = (data?.recentOrders || []).map((o: any) => [
      o.id,
      o.customer,
      o.vendor,
      o.amount,
      o.payment,
      o.fulfillment,
    ]);

    if (format === 'csv') {
      exportToCsv({
        filename: `${filename}.csv`,
        title: 'Everest Pasal - Platform Orders Summary',
        subtitle: `Filter: ${statusFilter} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else if (format === 'docx') {
      exportToDocx({
        filename: `${filename}.docx`,
        title: 'Everest Pasal - Platform Orders Summary',
        subtitle: `Filter: ${statusFilter} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else {
      exportToPdf({
        filename: `${filename}.pdf`,
        title: 'Everest Pasal - Platform Orders Summary',
        subtitle: `Filter: ${statusFilter} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    }
    showToast(`Orders summary exported (${format.toUpperCase()})`);
  };

  const kpis = data?.kpis || {
    totalOrders: 3842,
    completedOrders: 2891,
    dispatchedOrders: 156,
    newOrders: 124,
    confirmedOrders: { count: 89, tag: 'Healthy', tagColor: 'green' },
    processingOrders: { count: 67, tag: 'Watch', tagColor: 'orange' },
  };

  const orders = data?.recentOrders || [
    { id: '#EP-38421', customer: 'Anish Shrestha', vendor: 'Himalayan Crafts', amount: 'NPR 12,500', payment: 'Paid', status: 'Delivered', fulfillment: 'Completed' },
    { id: '#EP-38420', customer: 'Priyanka Joshi', vendor: 'Kathmandu Apparel', amount: 'NPR 4,200', payment: 'Paid', status: 'Processing', fulfillment: 'Packing' },
    { id: '#EP-38419', customer: 'Ramesh Thapa', vendor: 'Organic Nepal', amount: 'NPR 1,850', payment: 'Pending', status: 'New', fulfillment: 'Awaiting payment' },
    { id: '#EP-38418', customer: 'Sita Dahal', vendor: 'Dhaka Weaves', amount: 'NPR 8,900', payment: 'Paid', status: 'Delivered', fulfillment: 'Completed' },
    { id: '#EP-38417', customer: 'Binod Adhikari', vendor: 'Bhadgaon Topi', amount: 'NPR 3,100', payment: 'Failed', status: 'Cancelled', fulfillment: 'Closed' },
  ];

  const lifecycleCounts = data?.orderLifecycleCounts || [
    { label: 'Delivered', count: 2891, note: 'Orders delivered and settled' },
    { label: 'Dispatched', count: 156, note: 'Orders handed over to courier' },
    { label: 'Processing', count: 67, note: 'Orders being prepared for dispatch' },
    { label: 'New Orders', count: 124, note: 'Orders awaiting confirmation' },
    { label: 'Confirmed Orders', count: 89, note: 'Orders confirmed by vendor' },
  ];

  const orderExceptions = data?.orderExceptions || [
    { label: 'Payment Pending', count: 28, note: 'Orders waiting for payment confirmation' },
    { label: 'Cancelled', count: 43, note: 'Orders cancelled by customer or vendor' },
    { label: 'Failed Payments', count: 12, note: 'Orders with failed payment attempts' },
    { label: 'Refund Requests', count: 18, note: 'Orders flagged for refund review' },
    { label: 'Missing Items', count: 9, note: 'Orders with stock or inventory issues' },
    { label: 'Escalated Cases', count: 6, note: 'Orders requiring manual support intervention' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return { bg: '#ECFDF5', text: '#059669' };
      case 'processing':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'new':
      case 'pending':
        return { bg: '#FFFBEB', text: '#D97706' };
      case 'cancelled':
      case 'failed':
        return { bg: '#FEF2F2', text: '#DC2626' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#E63946', margin: '0 0 4px 0' }}>Orders Summary</h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Monitor order volume, fulfillment progress, exceptions and operational health across Everest Pasal.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Timeframe Dropdown */}
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
              <option value="30_days">Last 30 Days</option>
              <option value="7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="all_time">All Time</option>
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

      {/* TOP 6 KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Card 1: Total Orders */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Total Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.totalOrders.toLocaleString()}</div>
        </div>

        {/* Card 2: Completed Orders */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Completed Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.completedOrders.toLocaleString()}</div>
        </div>

        {/* Card 3: Dispatched Orders */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Dispatched Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.dispatchedOrders.toLocaleString()}</div>
        </div>

        {/* Card 4: New Orders */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>New Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.newOrders.toLocaleString()}</div>
        </div>

        {/* Card 5: Confirmed Orders [Healthy] */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Confirmed Or...</span>
            <span style={{ fontSize: '9.5px', color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
              Healthy
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.confirmedOrders.count}</div>
        </div>

        {/* Card 6: Processing Orders [Watch] */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Processing Or...</span>
            <span style={{ fontSize: '9.5px', color: '#D97706', backgroundColor: '#FFFBEB', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
              Watch
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{kpis.processingOrders.count}</div>
        </div>
      </div>

      {/* MAIN SECTION: Recent Orders Table Card */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Recent Orders</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Central working surface for order triage, payment review, and fulfillment follow-up.
            </div>
          </div>

          {/* Filter Pills right */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['All', 'New', 'Processing', 'Dispatched', 'Delivered', 'Exceptions'] as const).map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    backgroundColor: active ? '#EFF6FF' : 'transparent',
                    color: active ? '#2563EB' : '#64748B',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, Filters, and Daily/Weekly/Monthly/Yearly */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 12px',
              gap: '8px',
              width: '320px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Quick find order ID, customer, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '11.5px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          {/* Right: Filters Button + Period Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => showToast('Filters panel opened.')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                padding: '5.5px 12px',
                fontSize: '11.5px',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={12} color="#64748B" />
              <span>Filters</span>
            </button>

            <div style={{ display: 'flex', gap: '3px' }}>
              {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((p) => {
                const active = periodTab === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPeriodTab(p)}
                    style={{
                      backgroundColor: active ? '#E63946' : '#F1F5F9',
                      color: active ? '#FFFFFF' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '10.5px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#94A3B8', fontSize: '10.5px' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>ORDER ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>CUSTOMER</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>VENDOR</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>AMOUNT</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>PAYMENT</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>FULFILLMENT</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>ACT</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => {
                const pColor = getStatusColor(o.payment);
                const sColor = getStatusColor(o.status);
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
                      {o.id}
                    </td>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: 500 }}>{o.customer}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{o.vendor}</td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#0F172A' }}>{o.amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: pColor.bg,
                          color: pColor.text,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {o.payment}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: sColor.bg,
                          color: sColor.text,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{o.fulfillment}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          showToast(`Viewing order ${o.id}`);
                          navigate('/admin/orders');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <div>Showing 1-5 of 3,842</div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={page === 1}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              &larr; Prev
            </button>
            {[1, 2, 3].map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                style={{
                  backgroundColor: page === pNum ? '#E63946' : '#FFFFFF',
                  color: page === pNum ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM 2 CARDS: Order Lifecycle Counts & Order Exceptions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Left Card: Order Lifecycle Counts */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Order Lifecycle Counts
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {lifecycleCounts.map((lc: any) => (
              <div key={lc.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{lc.label}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lc.note}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {lc.count.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Order Exceptions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Order Exceptions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orderExceptions.map((ex: any) => (
              <div key={ex.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{ex.label}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{ex.note}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{ex.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
