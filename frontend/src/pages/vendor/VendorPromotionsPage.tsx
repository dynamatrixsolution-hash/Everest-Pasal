import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';

interface PromotionItem {
  id: string;
  title: string;
  description: string;
  type: string;
  products_count: string;
  discount: string;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Scheduled' | 'Draft' | 'Expired' | 'Paused';
}

interface CouponItem {
  id: string;
  code: string;
  description: string;
  discount: string;
  used: number;
  limit: number;
  min_order: string;
  expiry: string;
  status: string;
}

interface CampaignItem {
  id: string;
  title: string;
  tag: string;
  badgeColor: string;
  dates: string;
  description: string;
  eligibility: string;
  commissionNote?: string;
  submittedProducts?: number;
  participatingProducts?: number;
  salesPerformance?: string;
  fee?: string;
  status: string;
  buttonLabel: string;
  buttonAction: string;
}

interface SponsoredProduct {
  id: string;
  title: string;
  image: string;
  placement: string;
  budget: string;
  duration: string;
  spent: string;
  spentPct: number;
  status: string;
  performance: string;
}

interface FeaturedProduct {
  id: string;
  title: string;
  image: string;
  placement: string;
  startDate: string;
  endDate: string;
  status: string;
  views: number;
  clicks: number;
}

export const VendorPromotionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [subView, setSubView] = useState<'OVERVIEW' | 'COUPONS' | 'CAMPAIGNS' | 'SPONSORED' | 'CREATE_WIZARD'>('OVERVIEW');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [discountFilter, setDiscountFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('Newest first');

  // Multi-selection states
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>(['promo-1', 'promo-2', 'promo-3', 'promo-4']);
  const [selectedCouponIds, setSelectedCouponIds] = useState<string[]>(['cpn-1', 'cpn-2']);

  // Data states
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<SponsoredProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<number>(2);
  const [wizardTitle, setWizardTitle] = useState<string>('Dashain Festive Special');
  const [wizardDiscountType, setWizardDiscountType] = useState<string>('Percentage discount');
  const [wizardDiscountValue, setWizardDiscountValue] = useState<number>(20);
  const [wizardDiscountCap, setWizardDiscountCap] = useState<number>(1000);
  const [wizardMinOrder, setWizardMinOrder] = useState<number>(2000);
  const [wizardStackable, setWizardStackable] = useState<boolean>(false);
  const [isSubmittingWizard, setIsSubmittingWizard] = useState<boolean>(false);

  // Quick stats & metrics
  const [metrics, setMetrics] = useState({
    activePromotions: 12,
    scheduled: 5,
    coupons: 24,
    productsPromoted: 86,
    promotionSales: 284500,
  });

  const [quickStats, setQuickStats] = useState({
    ordersFromPromotions: 128,
    discountGiven: 42800,
    productsSold: 246,
    avgOrderValue: 2222,
  });

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch data depending on active sub-view
  const fetchPromotionsData = async () => {
    try {
      setLoading(true);
      const [promoRes, couponRes, campRes, sponRes] = await Promise.all([
        ApiClient.get<any>(`/api/v1/vendor/promotions?tab=${activeTab}&search=${encodeURIComponent(searchQuery)}`),
        ApiClient.get<any>('/api/v1/vendor/promotions/coupons'),
        ApiClient.get<any>('/api/v1/vendor/promotions/campaigns'),
        ApiClient.get<any>('/api/v1/vendor/promotions/sponsored'),
      ]);

      if (promoRes?.data) {
        setPromotions(promoRes.data.promotions || []);
        if (promoRes.data.metrics) setMetrics(promoRes.data.metrics);
        if (promoRes.data.quickStats) setQuickStats(promoRes.data.quickStats);
      }
      if (couponRes?.data) {
        setCoupons(couponRes.data.coupons || []);
      }
      if (campRes?.data) {
        setCampaigns(campRes.data.campaigns || []);
      }
      if (sponRes?.data) {
        setSponsoredProducts(sponRes.data.sponsoredProducts || []);
        setFeaturedProducts(sponRes.data.featuredProducts || []);
      }
    } catch (err: any) {
      console.error('Failed to load promotions data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotionsData();
  }, [activeTab]);

  // Handle Wizard Submit
  const handleWizardSubmit = async () => {
    try {
      setIsSubmittingWizard(true);
      await ApiClient.post('/api/v1/vendor/promotions', {
        title: wizardTitle,
        type: wizardDiscountType,
        discountValue: wizardDiscountValue,
        discountCap: wizardDiscountCap,
        minOrder: wizardMinOrder,
        stackable: wizardStackable,
      });

      setSuccessToast(`Promotion "${wizardTitle}" created successfully!`);
      setSubView('OVERVIEW');
      await fetchPromotionsData();
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Failed to create promotion: ${err.message}`);
    } finally {
      setIsSubmittingWizard(false);
    }
  };

  // Helper calculations for wizard preview
  const calculatedDiscountAmount = (wizardMinOrder * wizardDiscountValue) / 100;
  const finalPrice = Math.max(0, wizardMinOrder - Math.min(calculatedDiscountAmount, wizardDiscountCap));

  return (
    <div style={{ padding: '0 0 60px 0', minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      {/* Toast Feedback */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP NAVIGATION BREADCRUMBS & SUB-VIEW TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid #ECE7DE' }}>
            <button
              onClick={() => setSubView('OVERVIEW')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: subView === 'OVERVIEW' ? '#2563EB' : 'transparent',
                color: subView === 'OVERVIEW' ? '#FFFFFF' : '#64748B',
              }}
            >
              Promotions
            </button>
            <button
              onClick={() => setSubView('COUPONS')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: subView === 'COUPONS' ? '#2563EB' : 'transparent',
                color: subView === 'COUPONS' ? '#FFFFFF' : '#64748B',
              }}
            >
              Coupons
            </button>
            <button
              onClick={() => setSubView('CAMPAIGNS')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: subView === 'CAMPAIGNS' ? '#2563EB' : 'transparent',
                color: subView === 'CAMPAIGNS' ? '#FFFFFF' : '#64748B',
              }}
            >
              Campaign Participation
            </button>
            <button
              onClick={() => setSubView('SPONSORED')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: subView === 'SPONSORED' ? '#2563EB' : 'transparent',
                color: subView === 'SPONSORED' ? '#FFFFFF' : '#64748B',
              }}
            >
              Sponsored & Featured
            </button>
          </div>
        </div>

        {subView !== 'CREATE_WIZARD' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => alert('Viewing campaign analytics performance dashboard')}
              style={{
                padding: '9px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View performance
            </button>

            <button
              onClick={() => setSubView('COUPONS')}
              style={{
                padding: '9px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create coupon
            </button>

            <button
              onClick={() => {
                setSubView('CREATE_WIZARD');
                setWizardStep(2);
              }}
              style={{
                padding: '9px 18px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              }}
            >
              + Create promotion
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PROMOTIONS MAIN OVERVIEW (promotions-overview.png) */}
      {/* ========================================================================= */}
      {subView === 'OVERVIEW' && (
        <div>
          {/* Page Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Promotions
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Create campaigns, manage discounts, and increase product visibility.
            </p>
          </div>

          {/* 5 KPI METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderLeft: '4px solid #16A34A', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>ACTIVE PROMOTIONS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{metrics.activePromotions}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Currently running</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderLeft: '4px solid #2563EB', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>SCHEDULED</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{metrics.scheduled}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Upcoming promotions</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderLeft: '4px solid #2563EB', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>COUPONS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{metrics.coupons}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Active coupon codes</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>PRODUCTS PROMOTED</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{metrics.productsPromoted}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Products included</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>PROMOTION SALES</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginBottom: '4px' }}>NPR {metrics.promotionSales.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Sales from promotions</div>
            </div>
          </div>

          {/* DUAL CARDS: PROMOTION SALES CHART & QUICK STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Left: Chart */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>Promotion sales</h3>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Sales driven by active campaigns</div>
                </div>
                <select style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ECE7DE', fontSize: '12px', color: '#334155' }}>
                  <option>Last 14 days ▾</option>
                  <option>Last 30 days ▾</option>
                </select>
              </div>

              {/* Interactive SVG spline chart */}
              <div style={{ height: '180px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeDasharray="4 4" />
                  
                  {/* Spline line */}
                  <path
                    d="M 20 140 Q 80 120, 140 145 T 260 115 T 380 90 T 500 70 T 580 40"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                  />
                  {/* Data points */}
                  {[
                    { cx: 20, cy: 140 },
                    { cx: 100, cy: 130 },
                    { cx: 180, cy: 145 },
                    { cx: 260, cy: 115 },
                    { cx: 340, cy: 100 },
                    { cx: 420, cy: 90 },
                    { cx: 500, cy: 75 },
                    { cx: 580, cy: 40 },
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  ))}
                </svg>

                {/* Date labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                  <span>Sep 3</span>
                  <span>Sep 5</span>
                  <span>Sep 7</span>
                  <span>Sep 9</span>
                  <span>Sep 11</span>
                  <span>Sep 13</span>
                  <span>Sep 15</span>
                </div>
              </div>
            </div>

            {/* Right: Quick stats */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 20px 0' }}>Quick stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Orders from promotions</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{quickStats.ordersFromPromotions}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Discount given</span>
                  <span style={{ fontWeight: 700, color: '#E5484D' }}>NPR {quickStats.discountGiven.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Products sold</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{quickStats.productsSold}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Avg. order value</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>NPR {quickStats.avgOrderValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROMOTIONS TABLE CARD */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Status tabs */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['All', 'Active', 'Scheduled', 'Draft', 'Expired', 'Paused'].map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                      color: isSelected ? '#2563EB' : '#64748B',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Filter Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Search promotions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ECE7DE',
                    fontSize: '13px',
                    width: '260px',
                    outline: 'none',
                  }}
                />

                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px', color: '#334155' }}>
                  <option>Type ▾</option>
                  <option>Percentage</option>
                  <option>Coupon</option>
                  <option>Buy X Get Y</option>
                  <option>Free Delivery</option>
                </select>

                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px', color: '#334155' }}>
                  <option>Discount ▾</option>
                </select>

                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px', color: '#334155' }}>
                  <option>Date range ▾</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px', color: '#334155' }}>
                  <option>Sort by: Newest first ▾</option>
                </select>
                <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
                  ⚙
                </button>
              </div>
            </div>

            {/* Selection Bar */}
            {selectedPromoIds.length > 0 && (
              <div style={{ backgroundColor: '#EFF6FF', borderBottom: '1px solid #BFDBFE', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" checked={selectedPromoIds.length > 0} onChange={() => setSelectedPromoIds([])} />
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedPromoIds.length} promotions selected</span>
                  <button onClick={() => setSelectedPromoIds([])} style={{ background: 'none', border: 'none', color: '#2563EB', textDecoration: 'underline', cursor: 'pointer' }}>
                    Clear selection
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSuccessToast('Promotions paused')} style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Pause
                  </button>
                  <button onClick={() => setSuccessToast('Promotions activated')} style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Activate
                  </button>
                  <button onClick={() => setSuccessToast('Promotions deleted')} style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Delete
                  </button>
                  <button onClick={() => setSuccessToast('Exported')} style={{ padding: '5px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Export
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ECE7DE', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 16px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedPromoIds.length === promotions.length && promotions.length > 0}
                        onChange={() => {
                          if (selectedPromoIds.length === promotions.length) setSelectedPromoIds([]);
                          else setSelectedPromoIds(promotions.map((p) => p.id));
                        }}
                      />
                    </th>
                    <th style={{ padding: '14px 16px' }}>Promotion</th>
                    <th style={{ padding: '14px 16px' }}>Type</th>
                    <th style={{ padding: '14px 16px' }}>Products</th>
                    <th style={{ padding: '14px 16px' }}>Discount</th>
                    <th style={{ padding: '14px 16px' }}>Start Date</th>
                    <th style={{ padding: '14px 16px' }}>End Date</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => {
                    const isChecked = selectedPromoIds.includes(p.id);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #ECE7DE', backgroundColor: isChecked ? '#F8FAFC' : 'transparent' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedPromoIds((prev) => (prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]))
                            }
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>{p.title}</div>
                          <div style={{ color: '#64748B', fontSize: '11px' }}>{p.description}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            {p.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{p.products_count}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                            {p.discount}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>{p.start_date}</td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>{p.end_date}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {p.status === 'Active' && <span style={{ color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Active</span>}
                          {p.status === 'Scheduled' && <span style={{ color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Scheduled</span>}
                          {p.status === 'Draft' && <span style={{ color: '#475569', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Draft</span>}
                          {p.status === 'Expired' && <span style={{ color: '#991B1B', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Expired</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
              <div>Showing 1-{promotions.length} of 24 promotions</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>←</button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600 }}>1</button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>2</button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>3</button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>4</button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>→</button>
              </div>
              <div>Items per page: 25 ▾</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COUPONS MANAGEMENT (promotions-coupons.png) */}
      {/* ========================================================================= */}
      {subView === 'COUPONS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Coupons</h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Create and manage discount codes for your customers.</p>
            </div>
            <button
              onClick={() => {
                const code = prompt('Enter new coupon code (e.g. FESTIVE20):');
                if (code) {
                  setSuccessToast(`Coupon code ${code.toUpperCase()} generated!`);
                  setTimeout(() => setSuccessToast(null), 3000);
                }
              }}
              style={{ padding: '9px 18px', backgroundColor: '#2563EB', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
            >
              + Create coupon
            </button>
          </div>

          {/* 4 COUPON KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #86EFAC', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>ACTIVE COUPONS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>24</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Currently active</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>TOTAL REDEMPTIONS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>312</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>All time usage</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>REVENUE FROM COUPONS</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B' }}>NPR 1,56,000</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Sales with coupons</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>AVG. DISCOUNT</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>NPR 502</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Per redemption</div>
            </div>
          </div>

          {/* COUPONS TABLE */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ECE7DE', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 16px', width: '40px' }}>
                      <input type="checkbox" checked={selectedCouponIds.length === coupons.length} onChange={() => setSelectedCouponIds([])} />
                    </th>
                    <th style={{ padding: '14px 16px' }}>Coupon Code</th>
                    <th style={{ padding: '14px 16px' }}>Discount</th>
                    <th style={{ padding: '14px 16px' }}>Usage</th>
                    <th style={{ padding: '14px 16px' }}>Limit</th>
                    <th style={{ padding: '14px 16px' }}>Min. Order</th>
                    <th style={{ padding: '14px 16px' }}>Expiry</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #ECE7DE' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCouponIds.includes(c.id)}
                          onChange={() =>
                            setSelectedCouponIds((prev) => (prev.includes(c.id) ? prev.filter((i) => i !== c.id) : [...prev, c.id]))
                          }
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{c.code}</div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>{c.description}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          {c.discount}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(c.used / c.limit) * 100}%`, height: '100%', backgroundColor: '#2563EB' }} />
                          </div>
                          <span style={{ color: '#64748B', fontSize: '12px' }}>{c.used}/{c.limit}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{c.limit} uses</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{c.min_order}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{c.expiry}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: c.status === 'Active' ? '#DCFCE7' : '#F1F5F9', color: c.status === 'Active' ? '#166534' : '#64748B', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#94A3B8' }}>
                        📈
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CAMPAIGN PARTICIPATION (campaign-participation.png) */}
      {/* ========================================================================= */}
      {subView === 'CAMPAIGNS' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Campaign Participation</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Discover marketplace campaigns and submit eligible products.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #ECE7DE',
                  borderTop: camp.id === 'camp-1' ? '4px solid #E5484D' : '1px solid #ECE7DE',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>{camp.title}</h3>
                    <span style={{ backgroundColor: '#F0F9FF', color: '#0369A1', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                      {camp.tag}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                    📅 {camp.dates}
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                    {camp.description}
                  </p>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>ELIGIBILITY</div>
                    <div style={{ color: '#1E293B', fontWeight: 600 }}>{camp.eligibility}</div>
                    {camp.commissionNote && <div style={{ color: '#64748B', marginTop: '4px' }}>Commission Note: {camp.commissionNote}</div>}
                    {camp.submittedProducts && <div style={{ color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>Products submitted: {camp.submittedProducts} products</div>}
                    {camp.participatingProducts && <div style={{ color: '#16A34A', marginTop: '4px', fontWeight: 600 }}>{camp.participatingProducts} products participating • {camp.salesPerformance}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: camp.status.includes('Open') ? '#16A34A' : '#64748B' }}>
                    {camp.status}
                  </span>
                  <button
                    onClick={() => {
                      setSuccessToast(`Action submitted for ${camp.title}!`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    style={{
                      padding: '8px 18px',
                      backgroundColor: camp.buttonAction === 'VIEW' ? '#FFFFFF' : '#2563EB',
                      color: camp.buttonAction === 'VIEW' ? '#334155' : '#FFFFFF',
                      border: camp.buttonAction === 'VIEW' ? '1px solid #ECE7DE' : 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {camp.buttonLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SPONSORED & FEATURED (sponsored-featured.png) */}
      {/* ========================================================================= */}
      {subView === 'SPONSORED' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Sponsored & Featured</h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Increase product visibility across Everest Pasal.</p>
            </div>
            <button
              onClick={() => alert('Sponsor product wizard dialog')}
              style={{ padding: '9px 18px', backgroundColor: '#2563EB', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
            >
              + Sponsor a product
            </button>
          </div>

          {/* 4 Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #86EFAC', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>ACTIVE SPONSORED</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>4</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Products being promoted</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>FEATURED PRODUCTS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>6</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Marketplace featured</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>TOTAL BUDGET</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B' }}>NPR 28,000</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Active spend</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>TOTAL IMPRESSIONS</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>12,480</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Views this month</div>
            </div>
          </div>

          {/* Sponsored products table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>Sponsored products</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ECE7DE', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Product</th>
                    <th style={{ padding: '10px 14px' }}>Placement</th>
                    <th style={{ padding: '10px 14px' }}>Budget</th>
                    <th style={{ padding: '10px 14px' }}>Duration</th>
                    <th style={{ padding: '10px 14px' }}>Spent</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsoredProducts.map((sp) => (
                    <tr key={sp.id} style={{ borderBottom: '1px solid #ECE7DE' }}>
                      <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={sp.image} alt={sp.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 700, color: '#1E293B' }}>{sp.title}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{sp.placement}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{sp.budget}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{sp.duration}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{sp.spent} ({sp.spentPct}%)</div>
                        <div style={{ width: '80px', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${sp.spentPct}%`, height: '100%', backgroundColor: '#2563EB' }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                          {sp.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#16A34A', fontWeight: 600 }}>{sp.performance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: CREATE PROMOTION WIZARD (create-promotion-wizard.png) */}
      {/* ========================================================================= */}
      {subView === 'CREATE_WIZARD' && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Create promotion</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Set up a discount campaign and choose which products will participate.</p>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: 600, fontSize: '13px' }}>
              <span>✓</span>
              <span>Basic information</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#86EFAC', margin: '0 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700, fontSize: '13px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
              <span>Discount</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#E2E8F0', margin: '0 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
              <span>3</span>
              <span>Products</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#E2E8F0', margin: '0 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
              <span>4</span>
              <span>Schedule</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#E2E8F0', margin: '0 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
              <span>5</span>
              <span>Review</span>
            </div>
          </div>

          {/* Wizard Content Dual Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {/* Left Form: Discount Details */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 20px 0' }}>Discount details</h3>

              {/* Discount Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>Discount Type</label>
                <select
                  value={wizardDiscountType}
                  onChange={(e) => setWizardDiscountType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #2563EB', fontSize: '13px', fontWeight: 600, color: '#1E293B', outline: 'none' }}
                >
                  <option value="Percentage discount">Percentage discount</option>
                  <option value="Fixed amount discount">Fixed amount discount</option>
                  <option value="Buy X Get Y (Bundle)">Buy X Get Y (Bundle)</option>
                  <option value="Free delivery">Free delivery</option>
                </select>
              </div>

              {/* Discount Value */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>Discount Value</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={wizardDiscountValue}
                    onChange={(e) => setWizardDiscountValue(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '100%', padding: '10px 36px 10px 14px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '14px', fontWeight: 600 }}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '10px', color: '#64748B', fontWeight: 700 }}>%</span>
                </div>
              </div>

              {/* Maximum Discount Cap */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Maximum Discount Cap</label>
                <input
                  type="text"
                  value={`NPR ${wizardDiscountCap.toLocaleString()}`}
                  onChange={(e) => setWizardDiscountCap(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                />
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Maximum discount amount per order</div>
              </div>

              {/* Minimum Order Value */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Minimum Order Value</label>
                <input
                  type="text"
                  value={`NPR ${wizardMinOrder.toLocaleString()}`}
                  onChange={(e) => setWizardMinOrder(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                />
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Customer must spend at least this amount</div>
              </div>

              {/* Stackable promotion toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #ECE7DE' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Stackable promotion</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Allow combining with other promotions</div>
                </div>
                <input
                  type="checkbox"
                  checked={wizardStackable}
                  onChange={(e) => setWizardStackable(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Right Preview Card */}
            <div>
              {/* Discount preview */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Discount preview</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Customer pays</span>
                  <span style={{ fontWeight: 600 }}>NPR {wizardMinOrder.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '14px' }}>
                  <span style={{ color: '#64748B' }}>Discount ({wizardDiscountValue}%)</span>
                  <span style={{ fontWeight: 600, color: '#E5484D' }}>- NPR {calculatedDiscountAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', paddingTop: '10px', borderTop: '1px solid #ECE7DE', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 800, color: '#1E293B' }}>Final price</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>NPR {finalPrice.toLocaleString()}</span>
                </div>
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#0369A1' }}>
                  ℹ️ Maximum discount capped at NPR {wizardDiscountCap.toLocaleString()}
                </div>
              </div>

              {/* How customers will see this */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', margin: '0 0 14px 0' }}>How customers will see this</h4>
                <div style={{ border: '1px solid #ECE7DE', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '140px', backgroundColor: '#F8FAFC', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#1E293B', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      {wizardDiscountValue}% OFF
                    </span>
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80"
                      alt="Headphones preview"
                      style={{ height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Premium Noise-Cancelling Headphones</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B' }}>NPR {finalPrice.toLocaleString()}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>NPR {wizardMinOrder.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wizard Bottom Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #ECE7DE' }}>
            <button
              onClick={() => setSubView('OVERVIEW')}
              style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSubView('OVERVIEW')}
                style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '8px', color: '#334155', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={handleWizardSubmit}
                disabled={isSubmittingWizard}
                style={{ padding: '10px 24px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                {isSubmittingWizard ? 'Saving...' : 'Continue to Products →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
