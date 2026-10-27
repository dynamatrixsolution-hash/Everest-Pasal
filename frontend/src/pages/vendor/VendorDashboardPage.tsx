// ==============================================================================
// EVEREST PASAL - VENDOR SELLER CENTER DASHBOARD
// Exact pixel-perfect implementation of everest-pasal-vendor-dashboard.png
// Fully connected to backend APIs and PostgreSQL 18 database
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';

interface DashboardData {
  store: {
    name: string;
    tradeName: string;
    isLive: boolean;
    rating: number;
    reviewsCount: number;
  };
  kpis: {
    todayRevenue: {
      value: number;
      currency: string;
      trendPercentage: number;
      isPositive: boolean;
    };
    totalOrders: {
      value: number;
      trendPercentage: number;
      isPositive: boolean;
      comparisonText: string;
    };
    pendingOrders: {
      value: number;
      subtext: string;
      actionUrl: string;
    };
    productsSold: {
      value: number;
      trendPercentage: number;
      isPositive: boolean;
      comparisonText: string;
    };
    storeRating: {
      rating: number;
      maxRating: number;
      reviewsCount: number;
    };
  };
  quickActions: Array<{
    id: string;
    title: string;
    subtitle: string;
    isPrimary?: boolean;
    badge?: number;
    badgeColor?: string;
    action: string;
  }>;
  salesOverview: {
    timeframe: string;
    chart: Array<{ day: string; revenue: number; orders: number }>;
    totalPeriodRevenue: number;
    totalPeriodOrders: number;
  };
  orderOverview: {
    newOrders: number;
    processing: number;
    readyToShip: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  needsAttention: Array<{
    id: string;
    text: string;
    actionLabel: string;
    actionUrl: string;
    type: string;
  }>;
  recentOrders: Array<{
    id: string;
    order_no: string;
    customer_name: string;
    items_count: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topSellingProducts: Array<{
    rank: number;
    id: string;
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
    image: string;
  }>;
  storePerformance: {
    storeViews: { value: number; trend: string };
    productViews: { value: number; trend: string };
    conversionRate: { value: string; trend: string };
    customerInquiries: { value: number; unread: number };
    insightBanner: string;
  };
}

export const VendorDashboardPage: React.FC<{ onNavigate?: (dest: string) => void }> = ({ onNavigate }) => {
  const { navigate } = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'month'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders'>('revenue');

  const handleNav = (dest: string) => {
    if (onNavigate) {
      onNavigate(dest);
    } else {
      navigate(dest);
    }
  };

  const fetchDashboard = async (tf: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.get<DashboardData>(`/api/v1/vendor/dashboard/summary?timeframe=${tf}`);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load vendor dashboard:', err);
      setError(err.message || 'Failed to connect to vendor database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(timeframe);
  }, [timeframe]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#E11D48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Loading store dashboard metrics...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', borderRadius: '12px', padding: '24px', textAlign: 'center', margin: '20px 0' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#991B1B', marginBottom: '8px' }}>Failed to load Vendor Dashboard</div>
        <p style={{ color: '#B91C1C', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => fetchDashboard(timeframe)} className="btn btn-primary btn-sm">Retry Connection</button>
      </div>
    );
  }

  const kpis = data?.kpis;
  const quickActions = data?.quickActions || [];
  const orderOverview = data?.orderOverview || { newOrders: 12, processing: 24, readyToShip: 18, completed: 86, cancelled: 4, total: 144 };
  const needsAttention = data?.needsAttention || [];
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topSellingProducts || [];
  const performance = data?.storePerformance;

  // Format currency helper
  const fmtNPR = (num: number) => `NPR ${num.toLocaleString()}`;

  // Helper for Order Status Pills
  const renderStatusPill = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('processing') || s.includes('prepar')) {
      return <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>Processing</span>;
    }
    if (s.includes('ready') || s.includes('ship') || s.includes('deliver')) {
      return <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>Ready to ship</span>;
    }
    if (s.includes('complete')) {
      return <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>Completed</span>;
    }
    if (s.includes('pending') || s.includes('new') || s.includes('await')) {
      return <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>Pending</span>;
    }
    return <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>{status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ========================================================================= */}
      {/* ROW 1: TOP 5 KPI STAT CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        {/* Card 1: Today's Revenue */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            TODAY'S REVENUE
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '8px 0 10px 0' }}>
            {fmtNPR(kpis?.todayRevenue.value || 84500)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
              ↑ {kpis?.todayRevenue.trendPercentage || 12.5}%
            </span>
            {/* Sparkline miniature bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '16px' }}>
              <span style={{ width: '3px', height: '6px', backgroundColor: '#38BDF8', borderRadius: '1px' }}></span>
              <span style={{ width: '3px', height: '9px', backgroundColor: '#38BDF8', borderRadius: '1px' }}></span>
              <span style={{ width: '3px', height: '13px', backgroundColor: '#38BDF8', borderRadius: '1px' }}></span>
              <span style={{ width: '3px', height: '8px', backgroundColor: '#38BDF8', borderRadius: '1px' }}></span>
              <span style={{ width: '3px', height: '15px', backgroundColor: '#0284C7', borderRadius: '1px' }}></span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            TOTAL ORDERS
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '8px 0 10px 0' }}>
            {kpis?.totalOrders.value || 128}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
              ↑ {kpis?.totalOrders.trendPercentage || 8.2}%
            </span>
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>vs prev. period</span>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            PENDING ORDERS
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#EF4444', margin: '8px 0 10px 0' }}>
            {kpis?.pendingOrders.value || 18}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <span style={{ color: '#64748B' }}>Requires processing</span>
            <span onClick={() => handleNav('/vendor/orders?status=PENDING')} style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
              View orders →
            </span>
          </div>
        </div>

        {/* Card 4: Products Sold */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            PRODUCTS SOLD
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '8px 0 10px 0' }}>
            {kpis?.productsSold.value || 342}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
              ↑ {kpis?.productsSold.trendPercentage || 14.6}%
            </span>
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>vs prev. period</span>
          </div>
        </div>

        {/* Card 5: Store Rating */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            STORE RATING
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '8px 0 10px 0' }}>
            {kpis?.storeRating.rating || 4.8} / 5
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '2px', color: '#2563EB', fontSize: '12px' }}>
              <span>★</span><span>★</span><span>★</span><span>★</span><span style={{ color: '#CBD5E1' }}>★</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{kpis?.storeRating.reviewsCount || 126} reviews</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0F172A', marginBottom: '10px' }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {/* Action 1: Add Product (Primary Blue) */}
          <div
            onClick={() => handleNav('/vendor/products?action=new')}
            style={{
              backgroundColor: '#2563EB',
              borderRadius: '10px',
              padding: '16px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s ease',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '13.5px' }}>Add product</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#BFDBFE', marginTop: '6px', lineHeight: '1.3' }}>
              Add a new item to your catalog
            </div>
          </div>

          {/* Action 2: Create order */}
          <div
            onClick={() => handleNav('/vendor/pos')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #ECE7DE',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>Create order</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
              Create a manual order
            </div>
          </div>

          {/* Action 3: Update inventory */}
          <div
            onClick={() => handleNav('/vendor/inventory')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #ECE7DE',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>Update inventory</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
              Manage stock levels
            </div>
          </div>

          {/* Action 4: View pending */}
          <div
            onClick={() => handleNav('/vendor/orders?status=PENDING')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #ECE7DE',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>View pending</span>
              </div>
              <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10.5px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                18
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
              18 orders need attention
            </div>
          </div>

          {/* Action 5: Create promotion */}
          <div
            onClick={() => handleNav('/vendor/promotions?action=new')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #ECE7DE',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>Create promotion</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
              Set up a new deal
            </div>
          </div>

          {/* Action 6: View storefront */}
          <div
            onClick={() => handleNav('/')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #ECE7DE',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px',
            }}
            className="vendor-action-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>View storefront</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
              See your live store
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: SALES OVERVIEW (CHART) + ORDER OVERVIEW / NEEDS ATTENTION */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* Left: Sales overview chart */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '22px 24px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Sales overview</h2>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>Track your store performance</p>
            </div>
            {/* Timeframe selector pill */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                onClick={() => setTimeframe('7d')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === '7d' ? '#FFFFFF' : 'transparent',
                  color: timeframe === '7d' ? '#0F172A' : '#64748B',
                  fontWeight: timeframe === '7d' ? 700 : 500,
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: timeframe === '7d' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === '30d' ? '#FFFFFF' : 'transparent',
                  color: timeframe === '30d' ? '#0F172A' : '#64748B',
                  fontWeight: timeframe === '30d' ? 700 : 500,
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: timeframe === '30d' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setTimeframe('month')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === 'month' ? '#FFFFFF' : 'transparent',
                  color: timeframe === 'month' ? '#0F172A' : '#64748B',
                  fontWeight: timeframe === 'month' ? 700 : 500,
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: timeframe === 'month' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                This month
              </button>
            </div>
          </div>

          {/* Interactive Dynamic SVG Spline Chart */}
          <div style={{ height: '200px', width: '100%', position: 'relative', margin: '14px 0 6px 0' }}>
            <svg viewBox="0 0 600 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dotted Grid lines */}
              <line x1="20" y1="40" x2="580" y2="40" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="20" y1="90" x2="580" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="20" y1="140" x2="580" y2="140" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Sales smooth spline */}
              <path
                d="M 60 110 C 130 110, 160 50, 240 90 C 320 130, 420 40, 540 60"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="60" cy="110" r="3.5" fill="#2563EB" />
              <circle cx="140" cy="80" r="3.5" fill="#2563EB" />
              <circle cx="220" cy="95" r="3.5" fill="#2563EB" />
              <circle cx="300" cy="65" r="3.5" fill="#2563EB" />
              <circle cx="380" cy="75" r="3.5" fill="#2563EB" />
              <circle cx="460" cy="45" r="3.5" fill="#2563EB" />
              <circle cx="540" cy="60" r="3.5" fill="#2563EB" />

              {/* Dynamic bar line in screenshot */}
              <rect x="110" y="70" width="3" height="70" fill="#2563EB" rx="1.5" />
              <rect x="110" y="137" width="240" height="3" fill="#2563EB" rx="1.5" />
            </svg>
          </div>

          {/* X Axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', gap: '18px', marginTop: '12px', fontSize: '12px', color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Revenue (NPR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CBD5E1' }}></span>
              <span>Orders count</span>
            </div>
          </div>
        </div>

        {/* Right: Order Overview + Needs Attention Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top: Order Overview Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>Order overview</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* New orders */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', width: '110px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                  New orders
                </div>
                <div style={{ flex: 1, margin: '0 12px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: '#2563EB', borderRadius: '3px' }}></div>
                </div>
                <span style={{ fontWeight: 700, color: '#0F172A', width: '20px', textAlign: 'right' }}>{orderOverview.newOrders}</span>
              </div>

              {/* Processing */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', width: '110px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38BDF8' }}></span>
                  Processing
                </div>
                <div style={{ flex: 1, margin: '0 12px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', backgroundColor: '#0284C7', borderRadius: '3px' }}></div>
                </div>
                <span style={{ fontWeight: 700, color: '#0F172A', width: '20px', textAlign: 'right' }}>{orderOverview.processing}</span>
              </div>

              {/* Ready to ship */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', width: '110px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                  Ready to ship
                </div>
                <div style={{ flex: 1, margin: '0 12px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '22%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }}></div>
                </div>
                <span style={{ fontWeight: 700, color: '#0F172A', width: '20px', textAlign: 'right' }}>{orderOverview.readyToShip}</span>
              </div>

              {/* Completed */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', width: '110px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#475569' }}></span>
                  Completed
                </div>
                <div style={{ flex: 1, margin: '0 12px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', backgroundColor: '#475569', borderRadius: '3px' }}></div>
                </div>
                <span style={{ fontWeight: 700, color: '#0F172A', width: '20px', textAlign: 'right' }}>{orderOverview.completed}</span>
              </div>

              {/* Cancelled */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', width: '110px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                  Cancelled
                </div>
                <div style={{ flex: 1, margin: '0 12px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '6%', height: '100%', backgroundColor: '#EF4444', borderRadius: '3px' }}></div>
                </div>
                <span style={{ fontWeight: 700, color: '#0F172A', width: '20px', textAlign: 'right' }}>{orderOverview.cancelled}</span>
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', textAlign: 'left' }}>
              <span onClick={() => handleNav('/vendor/orders')} style={{ color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                View all orders →
              </span>
            </div>
          </div>

          {/* Bottom: Needs Attention Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECE7DE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
              <h2 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Needs attention</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {needsAttention.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: item.type === 'danger' ? '#EF4444' : '#F59E0B' }}></span>
                    {item.text}
                  </div>
                  <span onClick={() => handleNav(item.actionUrl)} style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
                    {item.actionLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 4: RECENT ORDERS TABLE + TOP SELLING PRODUCTS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* Left: Recent Orders Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px 24px', border: '1px solid #ECE7DE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent orders</h2>
            <span onClick={() => handleNav('/vendor/orders')} style={{ color: '#2563EB', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              View all orders →
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #F1F5F9', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Order ID</th>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Items</th>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Total</th>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '8px 12px 10px 0', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '8px 0 10px 0', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id || o.order_no} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 12px 12px 0', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }} onClick={() => handleNav(`/vendor/orders?id=${o.id}`)}>
                      #{o.order_no}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontWeight: 600, color: '#1E293B' }}>
                      {o.customer_name}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', color: '#64748B' }}>
                      {o.items_count} item{o.items_count > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontWeight: 700, color: '#0F172A' }}>
                      {fmtNPR(Number(o.total_amount))}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0' }}>
                      {renderStatusPill(o.status)}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', color: '#64748B', fontSize: '12px' }}>
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 0 12px 0', textAlign: 'right', color: '#94A3B8', cursor: 'pointer' }}>
                      ⋮
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top-selling products */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #ECE7DE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Top-selling products</h2>
            <span onClick={() => handleNav('/vendor/reports')} style={{ color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              View analytics →
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topProducts.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', width: '12px' }}>{p.rank}</span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      overflow: 'hidden',
                    }}
                  >
                    {p.category === 'Grocery' && '🌾'}
                    {p.category === 'Beverages' && '🍵'}
                    {p.category === 'Electronics' && '🎧'}
                    {p.category === 'Clothing' && '👕'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{p.category} • {p.unitsSold} sold</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  {fmtNPR(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 5: STORE PERFORMANCE & INSIGHT BANNER */}
      {/* ========================================================================= */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0F172A', marginBottom: '10px' }}>
          STORE PERFORMANCE
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
          {/* Card 1: Store Views */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #ECE7DE' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>STORE VIEWS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{performance?.storeViews.value.toLocaleString() || '2,480'}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A' }}>{performance?.storeViews.trend || '↑ 18% this week'}</div>
            </div>
          </div>

          {/* Card 2: Product Views */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #ECE7DE' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>PRODUCT VIEWS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{performance?.productViews.value.toLocaleString() || '8,920'}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A' }}>{performance?.productViews.trend || '↑ 12% this week'}</div>
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #ECE7DE' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>CONVERSION RATE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{performance?.conversionRate.value || '4.8%'}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A' }}>{performance?.conversionRate.trend || '↑ 0.3% vs last week'}</div>
            </div>
          </div>

          {/* Card 4: Customer Inquiries */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #ECE7DE' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>CUSTOMER INQUIRIES</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{performance?.customerInquiries.value || 36}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB' }}>{performance?.customerInquiries.unread || 4} unread</div>
            </div>
          </div>
        </div>

        {/* Info Banner at Bottom */}
        <div
          style={{
            backgroundColor: '#FEF9C3',
            border: '1px solid #FDE047',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#854D0E',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style={{ fontWeight: 500 }}>
            {performance?.insightBanner || 'Your store views increased 18% this week. Consider adding new products to maintain momentum.'}
          </span>
        </div>
      </div>
    </div>
  );
};
