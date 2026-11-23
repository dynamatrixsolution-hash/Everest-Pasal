// ==============================================================================
// EVEREST PASAL - VENDOR RETURNS & REFUNDS MANAGEMENT
// Exact pixel-perfect implementation of Returns & Refunds (Image 1)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/index.js';
import { ApiClient } from '../../api/client.js';
import { Skeleton, SkeletonStatCards, SkeletonTable } from '../../components/Common/Skeleton.js';
import { exportToPdf, exportToCsv } from '../../utils/documentExport.js';
import { Download, Printer, FileDown } from 'lucide-react';

interface ReturnRecord {
  id: string;
  title: string;
  order_no: string;
  category: string;
  reason: string;
  amount: number;
  status: 'Pending review' | 'Approved' | 'Refunded';
  updated_at: string;
  image: string;
}

const FALLBACK_RETURNS: ReturnRecord[] = [
  {
    id: 'ORD-10482',
    title: 'Premium Basmati Rice',
      order_no: '#ORD-10482',
      category: 'Groceries',
      reason: 'Wrong item',
      amount: 500,
      status: 'Pending review',
      updated_at: 'Today, 10:32 AM',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ORD-10471',
      title: 'Himalayan Organic Honey',
      order_no: '#ORD-10471',
      category: 'Food & Beverag...',
      reason: 'Damaged',
      amount: 850,
      status: 'Approved',
      updated_at: 'Today, 9:15 AM',
      image: '/images/hero_tea_coffee.jpg',
    },
    {
      id: 'ORD-10456',
      title: 'Nepali Green Tea',
      order_no: '#ORD-10456',
      category: 'Beverages',
      reason: 'Quality issue',
      amount: 280,
      status: 'Pending review',
      updated_at: 'Yesterday',
      image: '/images/hero_tea_coffee.jpg',
    },
    {
      id: 'ORD-10431',
      title: 'Wireless Bluetooth Earbu...',
      order_no: '#ORD-10431',
      category: 'Electronics',
      reason: 'Wrong item',
      amount: 1500,
      status: 'Approved',
      updated_at: 'Sep 14, 2026',
      image: '/images/cat_earbuds.jpg',
    },
    {
      id: 'ORD-10418',
      title: 'Cotton Kurta',
      order_no: '#ORD-10418',
      category: 'Clothing',
      reason: 'Size issue',
      amount: 700,
      status: 'Refunded',
      updated_at: 'Sep 13, 2026',
      image: '/images/cat_fashion.jpg',
    },
    {
      id: 'ORD-10405',
      title: 'Stainless Steel Water Bott...',
      order_no: '#ORD-10405',
      category: 'Home & Kitchen',
      reason: 'Missing part',
      amount: 450,
      status: 'Refunded',
      updated_at: 'Sep 12, 2026',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ORD-10394',
      title: 'Organic Mustard Oil',
      order_no: '#ORD-10394',
      category: 'Groceries',
      reason: 'Expired',
      amount: 350,
      status: 'Refunded',
      updated_at: 'Sep 11, 2026',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'ORD-10382',
      title: 'Handmade Dhaka Topi',
      order_no: '#ORD-10382',
      category: 'Accessories',
      reason: 'Quality issue',
      amount: 1200,
      status: 'Refunded',
      updated_at: 'Sep 10, 2026',
      image: '/images/product_dhaka_topi.jpg',
    },
  ];

export const VendorReturnsPage: React.FC = () => {
  const { navigate } = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRMADrawer, setActiveRMADrawer] = useState<ReturnRecord | null>(null);
  const [isProcessRefundModalOpen, setIsProcessRefundModalOpen] = useState<boolean>(false);
  const [activeMenuRecord, setActiveMenuRecord] = useState<ReturnRecord | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Refund Form State
  const [refundForm, setRefundForm] = useState({
    orderId: '#ORD-10482',
    amount: '500',
    reason: 'Wrong item shipped',
    refundMethod: 'Original Payment Method (eSewa)',
    restockItem: true,
  });

  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await ApiClient.get<any>('/api/v1/vendor/returns');
        const rawReturns = res?.returns ?? res?.data?.returns;
        if (Array.isArray(rawReturns)) {
          setReturnRecords(rawReturns);
          setSelectedIds(rawReturns.slice(0, 3).map((r: any) => r.id));
        }
      } catch {
        setReturnRecords(FALLBACK_RETURNS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const filteredReturns = returnRecords.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.order_no.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  const dynamicOpenReturns = returnRecords.filter((r) => r.status !== 'Refunded').length;
  const dynamicPendingReview = returnRecords.filter((r) => r.status === 'Pending review').length;
  const dynamicRefundsIssued = returnRecords.filter((r) => r.status === 'Refunded').length;
  const dynamicRefundAmount = returnRecords
    .filter((r) => r.status === 'Refunded')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(returnRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleActionClick = (e: React.MouseEvent, record: ReturnRecord) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (activeMenuRecord?.id === record.id) {
      setActiveMenuRecord(null);
      setMenuPosition(null);
    } else {
      setActiveMenuRecord(record);
      setMenuPosition({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending review':
        return (
          <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Pending review
          </span>
        );
      case 'Approved':
        return (
          <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Approved
          </span>
        );
      case 'Refunded':
      default:
        return (
          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Refunded
          </span>
        );
    }
  };

  const handleExportReturnsCsv = () => {
    if (!returnRecords.length) return;
    exportToCsv({
      filename: `Returns_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Merchant Customer Returns & Refunds',
      headers: ['Order No', 'Product Title', 'Category', 'Return Reason', 'Amount (NPR)', 'Status', 'Updated At'],
      rows: returnRecords.map((r: ReturnRecord) => [
        r.order_no,
        r.title,
        r.category,
        r.reason,
        String(r.amount),
        r.status,
        r.updated_at,
      ]),
    });
  };

  const handlePrintRmaSlip = (record?: ReturnRecord | null) => {
    const target = record || returnRecords[0];
    if (!target) return;
    exportToPdf({
      filename: `RMA_Slip_${target.order_no}.pdf`,
      title: `RETURN MERCHANDISE AUTHORIZATION (RMA) - ${target.order_no}`,
      subtitle: 'Everest Pasal Merchant Return & Quality Triage Slip',
      metadata: {
        'Order No': target.order_no,
        'Product': target.title,
        'Category': target.category,
        'Reason for Return': target.reason,
        'Refund Amount': `NPR ${target.amount.toLocaleString()}`,
        'Status': target.status,
      },
      headers: ['Component', 'Detail'],
      rows: [
        ['Product Inspected', target.title],
        ['Return Eligibility', 'Within 7-day warranty window'],
        ['Restocking Location', 'Kathmandu Return Hub (Bay #04)'],
      ],
      totals: [
        { label: 'Refund Base Amount', value: `NPR ${target.amount.toLocaleString()}` },
      ],
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="180px" height="28px" />
            <Skeleton width="280px" height="14px" style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="120px" height="38px" borderRadius="6px" />
            <Skeleton width="140px" height="38px" borderRadius="6px" />
          </div>
        </div>
        <SkeletonStatCards count={4} columns={4} />
        <SkeletonTable rows={6} columns={7} />
      </div>
    );
  }

  return (
    <div
      onClick={() => setActiveMenuRecord(null)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: 'relative',
      }}
    >
      {/* ========================================================================= */}
      {/* TOP HEADER SECTION */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Returns & Refunds
          </h1>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
            Manage return requests, issue refunds, and keep customer satisfaction high.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportReturnsCsv}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} /> Export report
          </button>
          <button
            onClick={() => setIsProcessRefundModalOpen(true)}
            style={{
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(225, 29, 72, 0.2)',
            }}
          >
            Process refund
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 TOP METRIC KPI STAT CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {/* Card 1: OPEN RETURNS */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            OPEN RETURNS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {dynamicOpenReturns}
          </div>
        </div>

        {/* Card 2: PENDING REVIEW */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
              PENDING REVIEW
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F97316' }}></span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {dynamicPendingReview}
          </div>
        </div>

        {/* Card 3: REFUNDS ISSUED */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
              REFUNDS ISSUED
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {dynamicRefundsIssued}
          </div>
        </div>

        {/* Card 4: REFUND AMOUNT */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            REFUND AMOUNT
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            NPR {dynamicRefundAmount.toLocaleString()}
          </div>
        </div>

        {/* Card 5: AVG. RESOLUTION */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
            AVG. RESOLUTION
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            2.4 days
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH AND FILTERS ROW */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '0 1 300px' }}>
            <input
              type="text"
              placeholder="Search by order, customer, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 30px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '11.5px',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#94A3B8', fontSize: '11px' }}>🔍</span>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Status ▾
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Reason ▾
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Channel ▾
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Date range ▾
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            + More filters
          </div>
        </div>

        {/* Right Sort & View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}>
            Sort by: Newest ▾
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '2px', backgroundColor: '#FFFFFF' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#F1F5F9' : 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#0F172A',
                fontSize: '12px',
              }}
              title="Table view"
            >
              ≡
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#F1F5F9' : 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '12px',
              }}
              title="Grid view"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BULK ACTION BAR */}
      {/* ========================================================================= */}
      {selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={selectedIds.length === returnRecords.length}
              onChange={handleSelectAll}
              style={{ accentColor: '#1A56DB', cursor: 'pointer', width: '15px', height: '15px' }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
              {selectedIds.length} returns selected
            </span>
            <span
              onClick={() => setSelectedIds([])}
              style={{ fontSize: '11.5px', color: '#1A56DB', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear selection
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                setReturnRecords((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'Approved' } : r)));
                setSelectedIds([]);
              }}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Approve return
            </button>
            <button
              onClick={() => {
                setReturnRecords((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'Refunded' } : r)));
                setSelectedIds([]);
              }}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Reject return
            </button>
            <button
              onClick={() => setIsProcessRefundModalOpen(true)}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Issue refund
            </button>
            <button
              onClick={() => setSelectedIds([])}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Request pickup
            </button>
            <button
              onClick={handleExportReturnsCsv}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Export
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETURNS DATA TABLE */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '10.5px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '10px 14px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === returnRecords.length}
                    onChange={handleSelectAll}
                    style={{ accentColor: '#1A56DB', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Return request</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Order</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Updated</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((r) => {
                const isChecked = selectedIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: isChecked ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(r.id)}
                        style={{ accentColor: '#1A56DB', cursor: 'pointer' }}
                      />
                    </td>

                    {/* Return Request Title & Thumbnail */}
                    <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setActiveRMADrawer(r)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <img
                            src={r.image}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>{r.title}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>#{r.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Order */}
                    <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 500, cursor: 'pointer' }} onClick={() => setActiveRMADrawer(r)}>
                      {r.order_no}
                    </td>

                    {/* Product Category */}
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {r.category}
                    </td>

                    {/* Reason */}
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {r.reason}
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                      NPR {r.amount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 12px' }}>
                      {renderStatusBadge(r.status)}
                    </td>

                    {/* Updated */}
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px' }}>
                      {r.updated_at}
                    </td>

                    {/* Actions Menu */}
                    <td style={{ padding: '10px 14px', textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={(e) => handleActionClick(e, r)}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '15px', cursor: 'pointer', padding: '2px' }}
                      >
                        ≡
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGINATION */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
          Showing {filteredReturns.length > 0 ? `1–${filteredReturns.length}` : '0'} of {returnRecords.length} returns
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontSize: '11px' }}>←</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', backgroundColor: '#E11D48', color: '#FFFFFF', fontWeight: 600, fontSize: '11px' }}>1</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '11px' }}>2</button>
          <span style={{ padding: '0 2px', color: '#94A3B8', fontSize: '11px' }}>..</span>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '11px' }}>2</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontSize: '11px' }}>→</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
          <span>Items per page:</span>
          <select
            style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '11.5px' }}
          >
            <option value="8">8 ▾</option>
            <option value="16">16</option>
            <option value="24">24</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTEXT MENU ACTION DROPDOWN */}
      {/* ========================================================================= */}
      {activeMenuRecord && menuPosition && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: `${menuPosition.top - 60}px`,
            right: `${menuPosition.right}px`,
            width: '230px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #ECECEC',
            zIndex: 100,
            padding: '12px 0 8px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                {activeMenuRecord.order_no}
              </div>
              {renderStatusBadge(activeMenuRecord.status)}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              {activeMenuRecord.reason} • NPR {activeMenuRecord.amount}
            </div>
          </div>

          <div style={{ padding: '6px 8px' }}>
            <div
              onClick={() => {
                setActiveRMADrawer(activeMenuRecord);
                setActiveMenuRecord(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#1A56DB',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>🔍</span>
              <span>View return audit & RMA</span>
            </div>

            <div
              onClick={() => {
                alert(`Approved return for ${activeMenuRecord.order_no}`);
                setActiveMenuRecord(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>✔</span>
              <span>Approve return</span>
            </div>

            <div
              onClick={() => {
                setIsProcessRefundModalOpen(true);
                setActiveMenuRecord(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>💳</span>
              <span>Process refund</span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }}></div>

            <div
              onClick={() => {
                alert(`Rejected return for ${activeMenuRecord.order_no}`);
                setActiveMenuRecord(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>🚫</span>
              <span>Reject return</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RMA RETURN & REPLACEMENT AUDIT DRAWER */}
      {/* ========================================================================= */}
      {activeRMADrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div
            style={{
              width: '490px',
              maxWidth: '94vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px 12px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    RMA #RET-41048-01
                  </h2>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ cursor: 'pointer' }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                    RETURN & REPLACEMENT
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handlePrintRmaSlip(activeMenuRecord)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Slip
                  </button>
                  <button
                    onClick={() => setActiveRMADrawer(null)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', fontSize: '15px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '6px' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                  Priority RMA
                </span>
              </div>
            </div>

            {/* Customer Box */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#0A2540', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      ST
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Suman Thapa</span>
                        <span style={{ color: '#1A56DB', fontSize: '12px' }}>✔</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>Kathmandu, Bagmati • +977 9841892011</div>
                      <div style={{ fontSize: '10.5px', color: '#1A56DB', cursor: 'pointer', marginTop: '2px' }}>Order History (4)</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Original Order: <strong style={{ color: '#0F172A' }}>#EP-048</strong> 16 Sept, 2024
                    </div>
                    <div style={{ backgroundColor: '#FEF9C3', color: '#854D0E', fontSize: '10.5px', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                      Reason: Size / Fit Issue & Packaging Damage
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>Received at Hub: Today, 11:20 AM</div>
                  </div>
                </div>
              </div>

              {/* WORKFLOW PROGRESS */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    WORKFLOW PROGRESS
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                    Stage 4 of 5 (Replacement Generation)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>1. Request</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>17 Sept</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>2. Approval</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>18 Sept</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>3. Inspect</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>Passed</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#1A56DB', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 1l4 4-4 4" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <path d="M7 23l-4-4 4-4" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#1A56DB', marginTop: '3px' }}>4. Replacement</div>
                    <div style={{ fontSize: '9px', color: '#1A56DB', fontWeight: 600 }}>#EP-41048-REP</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#64748B', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '3px' }}>5. Dispatch</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>Nepal Can Move</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                    <span>In-person inspection passed · Ready for <strong>Zero-Charge Replacement Dispatch</strong></span>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    InspectionApproved
                  </span>
                </div>
              </div>

              {/* Eligibility & Everest Return Policy Audit */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Eligibility & Everest Return Policy Audit
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    Compliant
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Policy Window</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>4 of 7 Days</div>
                    <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>Valid & in-time</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Return Categories</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>Textile & Sealed Tea</div>
                    <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>Approved for RMA</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Customer Proofs</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>2 Photos Uploaded</div>
                    <div style={{ fontSize: '9px', color: '#1A56DB', fontWeight: 600, cursor: 'pointer' }}>Inspect Proofs</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Reverse Freight</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>NPR 95 (Waived)</div>
                    <div style={{ fontSize: '9px', color: '#64748B' }}>Paid by Platform</div>
                  </div>
                </div>
              </div>

              {/* Physical Item Inspection */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '14px', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                      <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
                      <circle cx="8" cy="18" r="2" />
                      <circle cx="18" cy="18" r="2" />
                    </svg>
                    Physical Item Inspection & Stock Disposition
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>2 Returned / 3 Ordered</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Item 1: Handcrafted Traditional Dhaka Topi */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                        <img src="/images/product_dhaka_topi.jpg" alt="Dhaka Topi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', lineHeight: '1.3' }}>
                            Handcrafted Traditional Dhaka Topi (Size: 58cm)
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>NPR 1,000</div>
                            <div style={{ color: '#16A34A', fontSize: '10.5px', fontWeight: 700, marginTop: '1px' }}>
                              QC Passed
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                          SKU: EP-TOP-004 &nbsp;•&nbsp; Unit: NPR 1,000 &nbsp;•&nbsp; Returning: 1 of 2 Units
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155', fontWeight: 500, textAlign: 'center' }}>
                        Original Palpa Tag & Weave Intact
                      </div>
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155', fontWeight: 500, textAlign: 'center' }}>
                        Unworn Condition & No Blemish
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '7px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Select Disposition Routing:</span>
                      </div>
                      <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        Restock to Central Hub (Sellable Inventory +1)
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Organic Ilam Green Tea 250g Tin Canister */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                        <img src="/images/hero_tea_coffee.jpg" alt="Green Tea" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', lineHeight: '1.3' }}>
                            Organic Ilam Green Tea 250g Tin Canister
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>NPR 840</div>
                            <div style={{ color: '#16A34A', fontSize: '10.5px', fontWeight: 700, marginTop: '1px' }}>
                              QC Passed
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                          SKU: EP-TEA-002 &nbsp;•&nbsp; Unit: NPR 840 &nbsp;•&nbsp; Returning: 1 of 1 Unit
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155', fontWeight: 500, textAlign: 'center' }}>
                        Factory Seal Intact
                      </div>
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155', fontWeight: 500, textAlign: 'center' }}>
                        Aroma & Packaging Verified
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '7px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Select Disposition Routing:</span>
                      </div>
                      <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        Restock to Central Hub (Sellable Inventory +1)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #ECECEC', backgroundColor: '#FFFFFF', marginTop: 'auto', fontFamily: "'Poppins', sans-serif" }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setIsProcessRefundModalOpen(true)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Switch to Monetary Refund
                </button>
                <button
                  onClick={() => {
                    alert('Replacement order generated and queued for dispatch.');
                    setActiveRMADrawer(null);
                  }}
                  style={{
                    backgroundColor: '#0A2540',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  Generate Replacement Order & Dispatch
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#334155' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1A56DB', width: '15px', height: '15px' }} />
                  <span>Auto-reserve inventory in Central Hub</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1A56DB', width: '15px', height: '15px' }} />
                  <span>WhatsApp Dispatch Alert (+977 9841892011)</span>
                </label>
              </div>

              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <span
                  onClick={() => handlePrintRmaSlip(activeMenuRecord)}
                  style={{
                    fontSize: '11px',
                    color: '#0F172A',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Audit PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROCESS REFUND MODAL */}
      {/* ========================================================================= */}
      {isProcessRefundModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.55)', padding: '20px' }}>
          <div
            style={{
              width: '480px',
              maxWidth: '96vw',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
              position: 'relative',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Process Customer Refund
                </h2>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Issue an instant refund for approved return requests.
                </p>
              </div>
              <button
                onClick={() => setIsProcessRefundModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Order Reference</label>
                <input
                  type="text"
                  value={refundForm.orderId}
                  onChange={(e) => setRefundForm({ ...refundForm, orderId: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Refund Amount (NPR)</label>
                <input
                  type="number"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Refund Method</label>
                <select
                  value={refundForm.refundMethod}
                  onChange={(e) => setRefundForm({ ...refundForm, refundMethod: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                >
                  <option value="Original Payment Method (eSewa)">Original Payment Method (eSewa)</option>
                  <option value="Khalti Digital Wallet">Khalti Digital Wallet</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Store Credit Voucher">Store Credit Voucher</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Refund Reason Note</label>
                <textarea
                  rows={2}
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={refundForm.restockItem}
                  onChange={(e) => setRefundForm({ ...refundForm, restockItem: e.target.checked })}
                  style={{ accentColor: '#1A56DB' }}
                />
                <span>Restock verified item into Central Hub inventory</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                onClick={() => setIsProcessRefundModalOpen(false)}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const cleanId = refundForm.orderId.replace(/^#/, '');
                  try {
                    await ApiClient.patch(`/api/v1/vendor/returns/${cleanId}`, {
                      status: 'Refunded',
                      amount: Number(refundForm.amount),
                      reason: refundForm.reason,
                    });
                  } catch {
                    // Optimistic update
                  }
                  setReturnRecords((prev) => {
                    const exists = prev.some((r) => r.id === cleanId || r.order_no === refundForm.orderId);
                    if (exists) {
                      return prev.map((r) =>
                        r.id === cleanId || r.order_no === refundForm.orderId
                          ? { ...r, status: 'Refunded', amount: Number(refundForm.amount) || r.amount, updated_at: 'Just now' }
                          : r
                      );
                    }
                    return [
                      {
                        id: cleanId,
                        title: 'Refunded Order Item',
                        order_no: `#${cleanId}`,
                        category: 'General',
                        reason: refundForm.reason || 'Customer Refund',
                        amount: Number(refundForm.amount) || 500,
                        status: 'Refunded',
                        updated_at: 'Just now',
                        image: '/images/hero_tea_coffee.jpg',
                      },
                      ...prev,
                    ];
                  });
                  setIsProcessRefundModalOpen(false);
                }}
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

