// ==============================================================================
// EVEREST PASAL - VENDOR SELLER CENTER DASHBOARD
// Pixel-perfect match to Everest Pasal Vendor Panel Design Specifications
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { Skeleton, SkeletonStatCards } from '../../components/Common/Skeleton.js';

interface DashboardData {
  store?: {
    name: string;
    tradeName: string;
    isLive: boolean;
    rating: number;
    reviewsCount: number;
  };
  kpis?: {
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
  orderOverview?: {
    newOrders: number;
    processing: number;
    readyToShip: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  needsAttention?: Array<{
    id: string;
    text: string;
    actionLabel: string;
    actionUrl: string;
    type: string;
  }>;
  recentOrders?: Array<{
    id: string;
    order_no: string;
    customer_name: string;
    items_count: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topSellingProducts?: Array<{
    rank: number;
    id: string;
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
    image: string;
  }>;
  storePerformance?: {
    storeViews: { value: number; trend: string };
    productViews: { value: number; trend: string };
    conversionRate: { value: string; trend: string };
    customerInquiries: { value: number; unread: number };
  };
}

export const VendorDashboardPage: React.FC<{ onNavigate?: (dest: string) => void }> = ({ onNavigate }) => {
  const { navigate } = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'month'>('7d');

  const handleNav = (dest: string) => {
    if (onNavigate) {
      onNavigate(dest);
    } else {
      navigate(dest);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await ApiClient.get<DashboardData>(`/api/v1/vendor/dashboard/summary?timeframe=${timeframe}`);
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        // Fallback gracefully to design mock data
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  const fmtNPR = (num: number) => `NPR ${num.toLocaleString()}`;

  // Dynamic values from backend API (preserving 0 values with ?? instead of ||)
  const kpis = {
    todayRevenue: data ? (data.kpis?.todayRevenue?.value ?? 0) : 0,
    todayRevenueTrend: data ? (data.kpis?.todayRevenue?.trendPercentage ?? 0) : 0,
    totalOrders: data ? (data.kpis?.totalOrders?.value ?? 0) : 0,
    totalOrdersTrend: data ? (data.kpis?.totalOrders?.trendPercentage ?? 0) : 0,
    pendingOrders: data ? (data.kpis?.pendingOrders?.value ?? 0) : 0,
    productsSold: data ? (data.kpis?.productsSold?.value ?? 0) : 0,
    productsSoldTrend: data ? (data.kpis?.productsSold?.trendPercentage ?? 0) : 0,
    rating: data ? (data.kpis?.storeRating?.rating ?? 4.8) : 4.8,
    reviewsCount: data ? (data.kpis?.storeRating?.reviewsCount ?? 0) : 0,
  };

  const orderOverview = data?.orderOverview ?? {
    newOrders: 0,
    processing: 0,
    readyToShip: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  };

  const needsAttentionList =
    data?.needsAttention && data.needsAttention.length > 0
      ? data.needsAttention
      : [
          {
            id: 'all-clear',
            text: 'All store operations are up to date',
            actionLabel: '[View Products]',
            actionUrl: '/vendor/products',
            type: 'info',
          },
        ];

  const recentOrdersList = data?.recentOrders ?? [];

  const topProductsList = data?.topSellingProducts ?? [];

  const perf = {
    storeViews: data?.storePerformance?.storeViews?.value ?? 0,
    storeViewsTrend: data?.storePerformance?.storeViews?.trend ?? '↑ 0% this week',
    productViews: data?.storePerformance?.productViews?.value ?? 0,
    productViewsTrend: data?.storePerformance?.productViews?.trend ?? '↑ 0% this week',
    conversionRate: data?.storePerformance?.conversionRate?.value ?? '0.0%',
    conversionRateTrend: data?.storePerformance?.conversionRate?.trend ?? '0.0% vs last week',
    customerInquiries: data?.storePerformance?.customerInquiries?.value ?? 0,
    unreadInquiries: data?.storePerformance?.customerInquiries?.unread ?? 0,
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('processing')) {
      return (
        <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
          Processing
        </span>
      );
    }
    if (s.includes('ready')) {
      return (
        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
          Ready to ship
        </span>
      );
    }
    if (s.includes('complete')) {
      return (
        <span style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
          Completed
        </span>
      );
    }
    if (s.includes('pending')) {
      return (
        <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
          Pending
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Row 1: Top 5 KPI Stat Cards */}
        <SkeletonStatCards count={5} columns={5} />

        {/* Row 2: Store Alert Banner */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #ECECEC' }}>
          <Skeleton width="40%" height="18px" />
          <Skeleton width="70%" height="12px" style={{ marginTop: '8px' }} />
        </div>

        {/* Row 3: Order Overview & Needs Attention */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '18px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="30%" height="16px" />
            <Skeleton width="100%" height="80px" />
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '18px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="40%" height="16px" />
            <Skeleton width="100%" height="80px" />
          </div>
        </div>

        {/* Row 4: Recent Orders & Top Selling Products */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '18px', border: '1px solid #ECECEC' }}>
            <Skeleton width="30%" height="18px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="25%" height="14px" />
                  <Skeleton width="30%" height="14px" />
                  <Skeleton width="20%" height="14px" />
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '18px', border: '1px solid #ECECEC' }}>
            <Skeleton width="40%" height="18px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Skeleton width="40px" height="40px" borderRadius="6px" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton width="70%" height="14px" />
                    <Skeleton width="40%" height="11px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 5: Store Performance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton width="50%" height="12px" />
              <Skeleton width="70%" height="22px" />
              <Skeleton width="40%" height="10px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ========================================================================= */}
      {/* ROW 1: TOP 5 KPI STAT CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {/* Card 1: Today's Revenue */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '92px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748B' }}>
            TODAY'S REVENUE
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {fmtNPR(kpis.todayRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A' }}>
              ↑ {kpis.todayRevenueTrend}%
            </span>
            {/* Sparkline miniature bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
              <span style={{ width: '2.5px', height: '5px', backgroundColor: '#60A5FA', borderRadius: '1px' }}></span>
              <span style={{ width: '2.5px', height: '8px', backgroundColor: '#60A5FA', borderRadius: '1px' }}></span>
              <span style={{ width: '2.5px', height: '11px', backgroundColor: '#3B82F6', borderRadius: '1px' }}></span>
              <span style={{ width: '2.5px', height: '7px', backgroundColor: '#3B82F6', borderRadius: '1px' }}></span>
              <span style={{ width: '2.5px', height: '14px', backgroundColor: '#1D4ED8', borderRadius: '1px' }}></span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '92px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748B' }}>
            TOTAL ORDERS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {kpis.totalOrders}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#DC2626' }}>
              ↓ {kpis.totalOrdersTrend}%
            </span>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>vs prev. period</span>
          </div>
        </div>

        {/* Card 3: Pending Orders (Highlighted Red Border) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1.5px solid #FCA5A5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '92px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#DC2626' }}>
            PENDING ORDERS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', margin: '4px 0' }}>
            {kpis.pendingOrders}
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748B' }}>
            Requires processing
          </div>
        </div>

        {/* Card 4: Products Sold */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '92px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748B' }}>
            PRODUCTS SOLD
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {kpis.productsSold}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A' }}>
              ↑ {kpis.productsSoldTrend}%
            </span>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>vs prev. period</span>
          </div>
        </div>

        {/* Card 5: Store Rating */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '92px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748B' }}>
            STORE RATING
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {kpis.rating} / 5
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '2px', color: '#F59E0B', fontSize: '12px' }}>
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>({kpis.reviewsCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F172A', marginBottom: '8px' }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {/* Action 1: Add product (Red button) */}
          <button
            onClick={() => handleNav('/vendor/products')}
            style={{
              backgroundColor: '#E11D48',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(225, 29, 72, 0.2)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add product</span>
          </button>

          {/* Action 2: Create order */}
          <button
            onClick={() => handleNav('/vendor/orders')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create order</span>
          </button>

          {/* Action 3: Update inventory */}
          <button
            onClick={() => handleNav('/vendor/inventory')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span>Update inventory</span>
          </button>

          {/* Action 4: View pending */}
          <button
            onClick={() => handleNav('/vendor/orders')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>View pending</span>
          </button>

          {/* Action 5: Create promotion */}
          <button
            onClick={() => handleNav('/vendor/promotions')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Create promotion</span>
          </button>

          {/* Action 6: View storefront */}
          <button
            onClick={() => handleNav('/')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 500,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>View storefront</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: SALES OVERVIEW + (NEEDS ATTENTION & ORDER OVERVIEW) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '14px' }}>
        {/* Left: Sales overview chart */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '18px 20px', border: '1px solid #ECECEC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Sales overview</h2>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Track your store performance</p>
            </div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setTimeframe('7d')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === '7d' ? '#1A56DB' : 'transparent',
                  color: timeframe === '7d' ? '#FFFFFF' : '#64748B',
                  fontWeight: timeframe === '7d' ? 600 : 500,
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === '30d' ? '#1A56DB' : 'transparent',
                  color: timeframe === '30d' ? '#FFFFFF' : '#64748B',
                  fontWeight: timeframe === '30d' ? 600 : 500,
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setTimeframe('month')}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === 'month' ? '#1A56DB' : 'transparent',
                  color: timeframe === 'month' ? '#FFFFFF' : '#64748B',
                  fontWeight: timeframe === 'month' ? 600 : 500,
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                This month
              </button>
            </div>
          </div>

          {/* SVG Chart exactly as in user image */}
          <div style={{ height: '175px', width: '100%', position: 'relative', margin: '12px 0 4px 0' }}>
            <svg viewBox="0 0 520 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* L-shaped line matching image */}
              <path
                d="M 60 70 L 60 125 L 360 125"
                fill="none"
                stroke="#1A56DB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Smooth spline wave */}
              <path
                d="M 125 110 C 160 85, 200 100, 240 105 C 280 110, 320 85, 360 75"
                fill="none"
                stroke="#1A56DB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points matching image layout */}
              <circle cx="20" cy="98" r="2.5" fill="#1A56DB" />
              <circle cx="75" cy="84" r="2.5" fill="#1A56DB" />
              <circle cx="140" cy="92" r="2.5" fill="#1A56DB" />
              <circle cx="230" cy="65" r="2.5" fill="#1A56DB" />
              <circle cx="305" cy="78" r="2.5" fill="#1A56DB" />
              <circle cx="365" cy="52" r="2.5" fill="#1A56DB" />
              <circle cx="420" cy="60" r="2.5" fill="#1A56DB" />
            </svg>
          </div>

          {/* X Axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', padding: '0 10px' }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A56DB' }}></span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Revenue (NPR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Orders count</span>
            </div>
          </div>
        </div>

        {/* Right: Needs Attention & Order Overview Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Top: Needs attention (Red border) */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1.5px solid #FCA5A5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Needs attention</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
              {needsAttentionList.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#334155' }}>
                    • {item.text.replace('• ', '')}
                  </div>
                  <span
                    onClick={() => handleNav(item.actionUrl)}
                    style={{ color: '#1A56DB', fontWeight: 600, cursor: 'pointer', fontSize: '11px' }}
                  >
                    {item.actionLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Order overview */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>Order overview</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* New orders */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', width: '100px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                  New orders
                </div>
                <div style={{ flex: 1, margin: '0 10px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: '#2563EB', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', width: '16px', textAlign: 'right' }}>{orderOverview.newOrders}</span>
              </div>

              {/* Processing */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', width: '100px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1E40AF' }}></span>
                  Processing
                </div>
                <div style={{ flex: 1, margin: '0 10px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', backgroundColor: '#1E40AF', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', width: '16px', textAlign: 'right' }}>{orderOverview.processing}</span>
              </div>

              {/* Ready to ship */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', width: '100px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                  Ready to ship
                </div>
                <div style={{ flex: 1, margin: '0 10px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '22%', height: '100%', backgroundColor: '#16A34A', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', width: '16px', textAlign: 'right' }}>{orderOverview.readyToShip}</span>
              </div>

              {/* Completed */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', width: '100px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#475569' }}></span>
                  Completed
                </div>
                <div style={{ flex: 1, margin: '0 10px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', backgroundColor: '#475569', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', width: '16px', textAlign: 'right' }}>{orderOverview.completed}</span>
              </div>

              {/* Cancelled */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', width: '100px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
                  Cancelled
                </div>
                <div style={{ flex: 1, margin: '0 10px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '6%', height: '100%', backgroundColor: '#DC2626', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', width: '16px', textAlign: 'right' }}>{orderOverview.cancelled}</span>
              </div>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <span onClick={() => handleNav('/vendor/orders')} style={{ color: '#1A56DB', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                View all orders →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 4: RECENT ORDERS TABLE + TOP-SELLING PRODUCTS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '14px' }}>
        {/* Left: Recent Orders Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent orders</h2>
            <span onClick={() => handleNav('/vendor/orders')} style={{ color: '#1A56DB', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
              View all orders →
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid #F1F5F9', fontSize: '10.5px' }}>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Order ID</th>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Items</th>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Total</th>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '6px 8px 8px 0', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '6px 0 8px 0', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                      No orders received for this store yet.
                    </td>
                  </tr>
                ) : (
                  recentOrdersList.map((o) => (
                    <tr key={o.id || o.order_no} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '10px 8px 10px 0', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }} onClick={() => handleNav(`/vendor/orders?id=${o.id}`)}>
                        #{o.order_no}
                      </td>
                      <td style={{ padding: '10px 8px 10px 0', fontWeight: 500, color: '#1E293B' }}>
                        {o.customer_name}
                      </td>
                      <td style={{ padding: '10px 8px 10px 0', color: '#64748B' }}>
                        {o.items_count} item{o.items_count > 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '10px 8px 10px 0', fontWeight: 600, color: '#0F172A' }}>
                        {fmtNPR(Number(o.total_amount))}
                      </td>
                      <td style={{ padding: '10px 8px 10px 0' }}>
                        {renderStatusBadge(o.status)}
                      </td>
                      <td style={{ padding: '10px 8px 10px 0', color: '#64748B', fontSize: '11px' }}>
                        {o.created_at}
                      </td>
                      <td style={{ padding: '10px 0 10px 0', textAlign: 'right', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>
                        ⋮
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top-selling products */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #ECECEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Top-selling products</h2>
            <span onClick={() => handleNav('/vendor/reports')} style={{ color: '#1A56DB', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
              View analytics →
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProductsList.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                No products sold yet. Add products to your store catalog.
              </div>
            ) : (
              topProductsList.map((p) => (
                <div key={p.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', width: '10px' }}>{p.rank}</span>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', lineHeight: '1.2' }}>{p.name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>{p.category} • {p.unitsSold} sold</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {fmtNPR(p.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 5: STORE PERFORMANCE */}
      {/* ========================================================================= */}
      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F172A', marginBottom: '8px' }}>
          STORE PERFORMANCE
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {/* Card 1: Store Views */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>STORE VIEWS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{perf.storeViews.toLocaleString()}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#16A34A' }}>{perf.storeViewsTrend}</div>
            </div>
          </div>

          {/* Card 2: Product Views */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>PRODUCT VIEWS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{perf.productViews.toLocaleString()}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#16A34A' }}>{perf.productViewsTrend}</div>
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>CONVERSION RATE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{perf.conversionRate}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#16A34A' }}>{perf.conversionRateTrend}</div>
            </div>
          </div>

          {/* Card 4: Customer Inquiries (Highlighted Red Border) */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1.5px solid #FCA5A5' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', letterSpacing: '0.4px' }}>CUSTOMER INQUIRIES</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{perf.customerInquiries}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#DC2626' }}>{perf.unreadInquiries} unread</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
