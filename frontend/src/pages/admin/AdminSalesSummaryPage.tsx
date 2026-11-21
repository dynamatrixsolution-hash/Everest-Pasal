// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN SALES SUMMARY
// Pixel-perfect implementation of media_1795244079054_acf9e0bb.jpg
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { exportToPdf, exportToCsv, exportToDocx } from '../../utils/documentExport.js';
import {
  Download,
  ChevronDown,
  Check,
  TrendingUp,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  Globe,
  Share2,
  Users,
} from 'lucide-react';

export const AdminSalesSummaryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [timeframe, setTimeframe] = useState('30_days');
  const [periodTab, setPeriodTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [analyticsMetric, setAnalyticsMetric] = useState<'Revenue' | 'Orders' | 'Avg Order Value'>('Revenue');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/admin/dashboard/sales-summary?timeframe=${periodTab.toLowerCase()}`
      );
      setData(res?.data || res);
    } catch (err: any) {
      console.warn('Failed to load sales summary:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesSummary();
  }, [timeframe, periodTab]);

  const handleExport = (format: 'pdf' | 'csv' | 'docx' = 'pdf') => {
    const filename = `Everest_Pasal_Sales_Summary_${Date.now()}`;
    const headers = ['Channel / Metric', 'Orders / Volume', 'Revenue Share', 'Growth Rate'];
    const rows = [
      ['Organic Search', '1,624 orders', '42.3% of total', '+12.5%'],
      ['Direct Traffic', '1,184 orders', '30.8% of total', '+8.1%'],
      ['Social Media', '690 orders', '18.0% of total', '-0.1%'],
      ['Referrals', '344 orders', '9.0% of total', '+4.2%'],
      ['Total Marketplace Volume', '3,842 orders', '100%', '+12.5% vs last month'],
      ['Average Order Value', 'NPR 3,343.96', '—', '+4.2%'],
      ['Gross Margin', '18.4%', '—', '+1.1%'],
    ];

    if (format === 'csv') {
      exportToCsv({
        filename: `${filename}.csv`,
        title: 'Everest Pasal - Platform Sales Summary',
        subtitle: `Timeframe: ${periodTab} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else if (format === 'docx') {
      exportToDocx({
        filename: `${filename}.docx`,
        title: 'Everest Pasal - Platform Sales Summary',
        subtitle: `Timeframe: ${periodTab} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    } else {
      exportToPdf({
        filename: `${filename}.pdf`,
        title: 'Everest Pasal - Platform Sales Summary',
        subtitle: `Timeframe: ${periodTab} • Generated ${new Date().toLocaleDateString()}`,
        headers,
        rows,
      });
    }
    showToast(`Sales summary report exported (${format.toUpperCase()})`);
  };

  const revenueAnalytics = data?.revenueAnalytics || {
    totalRevenueFormatted: 'NPR 12,847,500',
    growthPct: 12.5,
    comparisonPeriod: 'vs last month',
  };

  const performanceInsights = data?.performanceInsights || {
    topChannel: { name: 'Organic Search', value: '42% of total revenue' },
    bestDay: { name: 'Saturday', value: 'Peak checkout window' },
    fastestSku: { name: 'Handwoven Dhaka Topi', value: '18% of completed orders' },
    averageBasket: { name: '2.4 items', value: 'Cross-sell opportunity' },
    checkoutRate: { name: '3.4%', value: 'Improvement needed at payment step' },
    revenueShare: { name: '85% from repeat buyers', value: 'Retention is driving growth' },
  };

  const salesPerformance = data?.salesPerformance || {
    completedOrders: { count: 2891, growth: '+12.5%', note: 'Delivered and settled orders' },
    averageOrderValue: { value: 'NPR 3,343.96', growth: '+4.2%', note: 'Average basket value' },
    refundRate: { value: '0.8%', growth: '-0.1%', note: 'Returned orders as a percentage' },
    returningCustomers: { count: 1284, growth: '+8.1%', note: 'Repeat buyers in the last 30 days' },
    grossMargin: { value: '18.4%', growth: '+1.1%', note: 'Estimated contribution margin' },
  };

  const channelMix = data?.salesChannelMix || {
    totalOrders: 3842,
    channels: [
      { name: 'Organic Search', orders: 1624, sharePct: '42.3%', growth: '+12.5%' },
      { name: 'Direct Traffic', orders: 1184, sharePct: '30.8%', growth: '+8.1%' },
      { name: 'Social Media', orders: 690, sharePct: '18.0%', growth: '-0.1%' },
      { name: 'Referrals', orders: 344, sharePct: '9.0%', growth: '+4.2%' },
    ],
  };

  const vendorReports = data?.vendorSalesReports || [
    { id: 'vsr-1', name: 'Himalayan Crafts Co.', owner: 'Rohan Giri', category: 'Handicrafts & Decor', period: 'Last 30 days' },
    { id: 'vsr-2', name: 'Nepal Tea Collective', owner: 'Sujana Baral', category: 'Organic Beverages', period: 'Last 30 days' },
    { id: 'vsr-3', name: 'Salleri Metal Works', owner: 'Kiran Shakya', category: 'Kitchenware', period: 'Last 30 days' },
  ];

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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#E63946', margin: '0 0 4px 0' }}>Sales Summary</h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Track revenue, order performance, and sales health across Everest Pasal.
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

      {/* SECTION 1: Revenue Analytics & Performance Insights (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Left: Revenue Analytics Chart Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* Card Top Row: Metric Tabs & High-level stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Revenue Analytics
              </div>
              {/* Metric Sub-Tabs */}
              <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px' }}>
                {(['Revenue', 'Orders', 'Avg Order Value'] as const).map((tab) => (
                  <span
                    key={tab}
                    onClick={() => setAnalyticsMetric(tab)}
                    style={{
                      cursor: 'pointer',
                      fontWeight: analyticsMetric === tab ? 600 : 500,
                      color: analyticsMetric === tab ? '#E63946' : '#64748B',
                      borderBottom: analyticsMetric === tab ? '2px solid #E63946' : '2px solid transparent',
                      paddingBottom: '3px',
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Value + Growth + Daily/Weekly/Monthly/Yearly pills */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  {revenueAnalytics.totalRevenueFormatted}
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                  +{revenueAnalytics.growthPct}% vs last month
                </span>
              </div>

              {/* Period Pills */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'flex-end' }}>
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
                        padding: '3px 8px',
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

          {/* SVG DUAL LINE CHART (Jul - Jun) */}
          <div style={{ height: '200px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Y Axis Grid lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="170" x2="680" y2="170" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#94A3B8" fontSize="10" fontFamily="'Poppins', sans-serif">15M</text>
              <text x="10" y="74" fill="#94A3B8" fontSize="10" fontFamily="'Poppins', sans-serif">10M</text>
              <text x="10" y="124" fill="#94A3B8" fontSize="10" fontFamily="'Poppins', sans-serif">5M</text>
              <text x="25" y="174" fill="#94A3B8" fontSize="10" fontFamily="'Poppins', sans-serif">0</text>

              {/* Previous Year Line (Dashed Light Blue) */}
              <polyline
                fill="none"
                stroke="#93C5FD"
                strokeWidth="1.8"
                strokeDasharray="4,4"
                points="60,170 112,150 164,155 216,90 268,140 320,105 372,130 424,95 476,108 528,90 580,88 632,95"
              />

              {/* Current Year Line (Solid Dark Blue) */}
              <polyline
                fill="none"
                stroke="#0B4EA2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="60,165 112,130 164,150 216,40 268,120 320,60 372,110 424,35 476,55 528,75 580,68 632,80"
              />

              {/* Data points for current year peak */}
              <circle cx="216" cy="40" r="3.5" fill="#0B4EA2" />
              <circle cx="424" cy="35" r="3.5" fill="#0B4EA2" />

              {/* X Axis Month Labels */}
              {[
                { m: 'Jul', x: 60 },
                { m: 'Aug', x: 112 },
                { m: 'Sep', x: 164 },
                { m: 'Oct', x: 216 },
                { m: 'Nov', x: 268 },
                { m: 'Dec', x: 320 },
                { m: 'Jan', x: 372 },
                { m: 'Feb', x: 424 },
                { m: 'Mar', x: 476 },
                { m: 'Apr', x: 528 },
                { m: 'May', x: 580 },
                { m: 'Jun', x: 632 },
              ].map((pt) => (
                <text
                  key={pt.m}
                  x={pt.x}
                  y="190"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="'Poppins', sans-serif"
                >
                  {pt.m}
                </text>
              ))}
            </svg>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', fontSize: '11px', color: '#64748B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#0B4EA2', borderRadius: '2px' }} />
              <span>Current Year</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '0px', borderTop: '2px dashed #93C5FD' }} />
              <span>Previous Year</span>
            </div>
          </div>
        </div>

        {/* Right: Performance Insights Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Performance Insights</div>
            <span
              onClick={() => navigate('/admin/orders')}
              style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              View All Sales
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Top Channel</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.topChannel.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.topChannel.value}</div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Best Day</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.bestDay.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.bestDay.value}</div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Fastest SKU</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.fastestSku.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.fastestSku.value}</div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Average Basket</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.averageBasket.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.averageBasket.value}</div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Checkout Rate</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.checkoutRate.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.checkoutRate.value}</div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Revenue Share</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {performanceInsights.revenueShare.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{performanceInsights.revenueShare.value}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Sales Performance & Sales Channel Mix (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Left Card: Sales Performance */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Sales Performance</div>
            <span
              onClick={() => navigate('/admin/orders')}
              style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              View All Sales
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Completed Orders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Completed Orders</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{salesPerformance.completedOrders.note}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {salesPerformance.completedOrders.count.toLocaleString()}
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginLeft: '8px' }}>
                  {salesPerformance.completedOrders.growth}
                </span>
              </div>
            </div>

            {/* Average Order Value */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Average Order Value</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{salesPerformance.averageOrderValue.note}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {salesPerformance.averageOrderValue.value}
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginLeft: '8px' }}>
                  {salesPerformance.averageOrderValue.growth}
                </span>
              </div>
            </div>

            {/* Refund Rate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Refund Rate</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{salesPerformance.refundRate.note}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {salesPerformance.refundRate.value}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginLeft: '8px' }}>
                  {salesPerformance.refundRate.growth}
                </span>
              </div>
            </div>

            {/* Returning Customers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Returning Customers</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{salesPerformance.returningCustomers.note}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {salesPerformance.returningCustomers.count.toLocaleString()}
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginLeft: '8px' }}>
                  {salesPerformance.returningCustomers.growth}
                </span>
              </div>
            </div>

            {/* Gross Margin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Gross Margin</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{salesPerformance.grossMargin.note}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {salesPerformance.grossMargin.value}
                </span>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginLeft: '8px' }}>
                  {salesPerformance.grossMargin.growth}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Sales Channel Mix */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: '10px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Sales Channel Mix</div>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {channelMix.totalOrders.toLocaleString()} orders
              </span>
            </div>
            <span
              onClick={() => navigate('/admin/orders')}
              style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              View all
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {channelMix.channels.map((ch: any) => (
              <div key={ch.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{ch.name}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{ch.sharePct} of total orders</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {ch.orders.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      marginLeft: '8px',
                      color: ch.growth.startsWith('+') ? '#16A34A' : '#94A3B8',
                    }}
                  >
                    {ch.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Vendor Sales Reports */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          borderRadius: '10px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Vendor Sales Reports</div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>156</span>
          </div>
          <span
            onClick={() => navigate('/admin/vendors')}
            style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
          >
            View All Vendors
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {vendorReports.map((vr: any) => (
            <div
              key={vr.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid #F1F5F9',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{vr.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {vr.owner} • {vr.category}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '9.5px',
                      fontWeight: 600,
                    }}
                  >
                    Sales report
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{vr.period}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast(`Viewing sales ledger for ${vr.name}`);
                  navigate('/admin/orders');
                }}
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View sales
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
