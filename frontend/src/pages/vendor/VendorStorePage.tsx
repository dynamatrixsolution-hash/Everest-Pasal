import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';

export const VendorStorePage: React.FC = () => {
  const { navigate } = useRouter();
  const [currentTab, setCurrentTab] = useState<'OVERVIEW' | 'PROFILE' | 'BRANDING' | 'POLICIES' | 'PREVIEW' | 'SETUP'>('OVERVIEW');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Store data state
  const [storeStatus, setStoreStatus] = useState<string>('Open');
  const [profile, setProfile] = useState({
    storeName: 'Everest Official Store',
    slug: 'everest-official-store',
    category: 'Electronics & Department Store',
    description:
      'Official flagship store on Everest Pasal. Serving our valued community with authentic products, certified warranties, and reliable delivery across Nepal.',
    phone: '+977 9801234567',
    email: 'store@everestpasal.com',
    website: 'https://everestpasal.com',
    streetAddress: 'New Road, Durbar Marg',
    city: 'Kathmandu',
    province: 'Bagmati Province',
    postalCode: '44600',
    registrationNumber: 'REG-948271A',
    panVatNumber: '109847281',
    verifiedVendor: true,
    memberSince: 'March 2025',
  });

  const [branding, setBranding] = useState({
    logoText: 'EO',
    logoUploadedAt: 'Jan 12, 2025',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#1455A0',
    secondaryColor: '#0B3B73',
    displaySettings: {
      showLogo: true,
      showCover: true,
      showDescription: true,
      showContact: false,
      showRating: true,
    },
  });

  const [policies, setPolicies] = useState({
    returnPolicy: {
      enabled: true,
      window: '7 Days after delivery',
      condition: 'Original packaging & tags intact',
      categories: ['Electronics', 'Accessories'],
      description:
        'Customers can return products within 7 days of receipt. The item must be in its original packaging, unused, and with all brand tags attached. The store will inspect the items before processing the replacement.',
    },
    refundPolicy: {
      enabled: true,
      description: 'Refunds are processed back to the original payment method within 5-7 business days of approved return.',
    },
    cancellationPolicy: {
      enabled: true,
      description: 'Orders can be canceled freely before they are dispatched. Shipped orders cannot be canceled.',
    },
    deliveryPolicy: {
      enabled: true,
      isIncomplete: false,
      deliveryAreas: ['Inside Kathmandu Valley', 'Lalitpur District', 'Bhaktapur District'],
      estimatedTime: '2-3 Business Days',
      standardCharge: 150,
      freeThreshold: 5000,
      details:
        'Deliveries inside Kathmandu Valley are executed via our in-house dispatch. Standard charges apply unless order exceeds NPR 5,000. Customer contact is required prior to courier arrival.',
    },
    paymentPolicy: {
      enabled: false,
      description: 'Enable payment policies to outline supported credit cards, digital wallets, or cash on delivery options.',
    },
  });

  const [performance, setPerformance] = useState({
    rating: 4.6,
    reviewsCount: 248,
    productsListed: 156,
    totalOrders: 1284,
    responseRate: 98,
    avgResponseTime: '2 hours',
  });

  // Fetch store data
  const fetchStoreInfo = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/vendor/store');
      if (res && res.data) {
        const d = res.data;
        if (d.profile) setProfile(d.profile);
        if (d.branding) setBranding(d.branding);
        if (d.policies) setPolicies(d.policies);
        if (d.performance) setPerformance(d.performance);
        if (d.status) setStoreStatus(d.status);
      }
    } catch (err: any) {
      console.error('Failed to load store data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  // Save Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await ApiClient.put('/api/v1/vendor/store/profile', profile);
      setSuccessToast('Store profile updated successfully!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await ApiClient.put('/api/v1/vendor/store/branding', branding);
      setSuccessToast('Store branding saved successfully!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await ApiClient.put('/api/v1/vendor/store/policies', policies);
      setSuccessToast('Store policies saved successfully!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* SUB-VIEW NAVIGATION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid #ECE7DE' }}>
          <button
            onClick={() => setCurrentTab('OVERVIEW')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'OVERVIEW' ? '#2563EB' : 'transparent',
              color: currentTab === 'OVERVIEW' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Overview
          </button>
          <button
            onClick={() => setCurrentTab('PROFILE')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'PROFILE' ? '#2563EB' : 'transparent',
              color: currentTab === 'PROFILE' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Profile
          </button>
          <button
            onClick={() => setCurrentTab('BRANDING')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'BRANDING' ? '#2563EB' : 'transparent',
              color: currentTab === 'BRANDING' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Branding
          </button>
          <button
            onClick={() => setCurrentTab('POLICIES')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'POLICIES' ? '#2563EB' : 'transparent',
              color: currentTab === 'POLICIES' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Policies
          </button>
          <button
            onClick={() => setCurrentTab('PREVIEW')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'PREVIEW' ? '#2563EB' : 'transparent',
              color: currentTab === 'PREVIEW' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Preview
          </button>
          <button
            onClick={() => setCurrentTab('SETUP')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: currentTab === 'SETUP' ? '#2563EB' : 'transparent',
              color: currentTab === 'SETUP' ? '#FFFFFF' : '#64748B',
            }}
          >
            Store Setup
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setSuccessToast('All store changes synchronized!');
              setTimeout(() => setSuccessToast(null), 3000);
            }}
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
            Save changes
          </button>

          <button
            onClick={() => setCurrentTab('PREVIEW')}
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
            Preview Store
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STORE OVERVIEW (store-overview.png) */}
      {/* ========================================================================= */}
      {currentTab === 'OVERVIEW' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Manage your store profile, branding, policies, and customer-facing information.
            </p>
          </div>

          {/* STORE STATUS BANNER */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Store status: Open</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Your store is live and visible to customers on Everest Pasal.</div>
              </div>
            </div>

            <button
              onClick={() => {
                setStoreStatus(storeStatus === 'Open' ? 'Closed' : 'Open');
                setSuccessToast(`Store status switched to ${storeStatus === 'Open' ? 'Closed' : 'Open'}`);
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {storeStatus === 'Open' ? 'Temporarily close store' : 'Re-open store'}
            </button>
          </div>

          {/* STORE SETUP PROGRESS CARD */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Store setup</h3>
                <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                  85% complete
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ width: '85%', height: '100%', backgroundColor: '#2563EB' }} />
            </div>

            {/* Checklist Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>Store profile</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>Basic info added</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>Cover image</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>Cover uploaded</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>Contact information</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>Phone & email added</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>Delivery information</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>Delivery areas set</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>Store logo</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>Logo uploaded</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94A3B8' }}>○</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2563EB' }}>Store policies</div>
                    <div style={{ color: '#64748B', fontSize: '12px' }}>Return & refund policies needed</div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('POLICIES')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Complete →
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('POLICIES')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Complete setup
            </button>
          </div>

          {/* 4 FEATURE NAVIGATION CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div
              onClick={() => setCurrentTab('PROFILE')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📝</span>
                <span style={{ color: '#94A3B8' }}>→</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Store Profile</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                Update your store name, description, and contact details.
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('BRANDING')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🎨</span>
                <span style={{ color: '#94A3B8' }}>→</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Store Branding</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                Customize logo, cover image, and brand colors.
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('POLICIES')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <span style={{ color: '#94A3B8' }}>→</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Store Policies</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                Set return, refund, cancellation, and delivery policies.
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('PREVIEW')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>👁️</span>
                <span style={{ color: '#94A3B8' }}>→</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Store Preview</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                See how customers will view your store.
              </div>
            </div>
          </div>

          {/* DUAL BOTTOM CARDS: STORE INFORMATION & PERFORMANCE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Store Information */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Store information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Store name</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{profile.storeName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Category</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{profile.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Location</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{profile.city}, Nepal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Phone</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{profile.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Email</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{profile.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Status</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                    Verified
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Member since</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{profile.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Store Performance */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Store performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Store rating</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{performance.rating} ★ <span style={{ color: '#94A3B8', fontWeight: 400 }}>({performance.reviewsCount} reviews)</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Products listed</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{performance.productsListed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Total orders</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{performance.totalOrders.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Response rate</span>
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>{performance.responseRate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Avg. response time</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{performance.avgResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STORE PROFILE FORM (store-profile.png) */}
      {/* ========================================================================= */}
      {currentTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store Profile</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Manage the information customers see when they visit your store.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px' }}>
            {/* Left Column Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Information */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Basic Information</h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Store name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.storeName}
                    onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Store slug *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECE7DE', borderRadius: '8px', overflow: 'hidden' }}>
                    <span style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', color: '#64748B', fontSize: '13px', borderRight: '1px solid #ECE7DE' }}>
                      everestpasal.com/
                    </span>
                    <input
                      type="text"
                      required
                      value={profile.slug}
                      onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
                      style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>This is your unique store web address.</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  >
                    <option value="Electronics & Accessories">Electronics & Accessories</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Groceries & Essentials">Groceries & Essentials</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px', resize: 'none' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                    <span>Describe your business, main products, and key features to attract customers.</span>
                    <span>{profile.description.length} / 500 characters</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Contact Information</h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Phone number *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Email address *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 90px 10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Website
                  </label>
                  <input
                    type="text"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com (optional)"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Location Information</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Street address *</label>
                  <input
                    type="text"
                    required
                    value={profile.streetAddress}
                    onChange={(e) => setProfile({ ...profile, streetAddress: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>City *</label>
                    <input
                      type="text"
                      required
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Province *</label>
                    <select
                      value={profile.province}
                      onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                    >
                      <option value="Bagmati Province">Bagmati Province</option>
                      <option value="Gandaki Province">Gandaki Province</option>
                      <option value="Lumbini Province">Lumbini Province</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Postal code *</label>
                  <input
                    type="text"
                    required
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Business Information</h3>
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#0369A1', marginBottom: '16px' }}>
                  ℹ️ Business registration details are kept strictly private and secure. They are only used to verify your business status on Everest Pasal.
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Registration number</label>
                  <input
                    type="text"
                    value={profile.registrationNumber}
                    onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>PAN / VAT number</label>
                  <input
                    type="text"
                    value={profile.panVatNumber}
                    onChange={(e) => setProfile({ ...profile, panVatNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Status */}
            <div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Store Preview</h3>
                <div style={{ backgroundColor: '#FFFDF9', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {branding.logoText}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B' }}>{profile.storeName}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{profile.category}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#1E293B', marginBottom: '8px' }}>
                    4.6 ★ <span style={{ color: '#64748B' }}>(248 reviews)</span> • {profile.city}, Nepal
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                    {profile.description.slice(0, 120)}...
                  </p>

                  <button
                    type="button"
                    onClick={() => setCurrentTab('PREVIEW')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
                  >
                    View storefront →
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>• Store is Open</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Live</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>✓ Verified Vendor</span>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setCurrentTab('OVERVIEW')}
              style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '8px', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{ padding: '10px 24px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. STORE BRANDING (store-branding.png) */}
      {/* ========================================================================= */}
      {currentTab === 'BRANDING' && (
        <form onSubmit={handleSaveBranding}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store Branding</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Customize how your store looks across Everest Pasal.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Store Logo */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Store Logo</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: branding.primaryColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                    {branding.logoText}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{profile.storeName}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Uploaded on {branding.logoUploadedAt}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => alert('Select logo')} style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Replace</button>
                      <button type="button" onClick={() => setSuccessToast('Logo removed')} style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', color: '#DC2626', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                    </div>
                  </div>
                </div>

                <div style={{ border: '2px dashed #CBD5E1', borderRadius: '10px', padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>☁️</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB', marginBottom: '4px' }}>Drag and drop or click to upload</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Requirements: Square, PNG or JPG, minimum 512x512px</div>
                </div>
              </div>

              {/* Cover Image */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Cover Image</h3>
                <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                  <img src={branding.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Recommended: 1440x400px, JPG/PNG, max 5MB</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => alert('Select cover')} style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Replace</button>
                    <button type="button" onClick={() => setSuccessToast('Cover removed')} style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', color: '#DC2626', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Brand Colors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Primary brand color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ECE7DE', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: branding.primaryColor }} />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Secondary color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ECE7DE', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: branding.secondaryColor }} />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>These colors appear on your storefront header and accents.</div>
              </div>

              {/* Display Settings */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Display Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Show store logo on storefront</span>
                    <input
                      type="checkbox"
                      checked={branding.displaySettings.showLogo}
                      onChange={(e) => setBranding({ ...branding, displaySettings: { ...branding.displaySettings, showLogo: e.target.checked } })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Show cover image</span>
                    <input
                      type="checkbox"
                      checked={branding.displaySettings.showCover}
                      onChange={(e) => setBranding({ ...branding, displaySettings: { ...branding.displaySettings, showCover: e.target.checked } })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Show store description</span>
                    <input
                      type="checkbox"
                      checked={branding.displaySettings.showDescription}
                      onChange={(e) => setBranding({ ...branding, displaySettings: { ...branding.displaySettings, showDescription: e.target.checked } })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Show contact information</span>
                    <input
                      type="checkbox"
                      checked={branding.displaySettings.showContact}
                      onChange={(e) => setBranding({ ...branding, displaySettings: { ...branding.displaySettings, showContact: e.target.checked } })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Show store rating</span>
                    <input
                      type="checkbox"
                      checked={branding.displaySettings.showRating}
                      onChange={(e) => setBranding({ ...branding, displaySettings: { ...branding.displaySettings, showRating: e.target.checked } })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Box */}
            <div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Store Preview</h3>
                <div style={{ border: '1px solid #ECE7DE', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '80px', backgroundColor: branding.secondaryColor }} />
                  <div style={{ padding: '16px', position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: branding.primaryColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, position: 'absolute', top: '-20px', left: '16px', border: '2px solid #FFFFFF' }}>
                      {branding.logoText}
                    </div>
                    <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '14px', color: '#1E293B' }}>{profile.storeName}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>{profile.category}</div>
                    <div style={{ fontSize: '11px', color: '#1E293B', marginBottom: '12px' }}>4.6 ★ (248 reviews) • Kathmandu, Nepal</div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', borderBottom: '1px solid #ECE7DE', paddingBottom: '6px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#2563EB' }}>Products</span>
                      <span style={{ color: '#64748B' }}>About</span>
                      <span style={{ color: '#64748B' }}>Reviews</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ border: '1px solid #ECE7DE', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ height: '60px', backgroundColor: '#F8FAFC', borderRadius: '4px', marginBottom: '4px' }} />
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>Smart LED TV 43"</div>
                        <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>Rs. 45,000</div>
                      </div>
                      <div style={{ border: '1px solid #ECE7DE', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ height: '60px', backgroundColor: '#F8FAFC', borderRadius: '4px', marginBottom: '4px' }} />
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>Buds Wireless</div>
                        <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>Rs. 3,200</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '12px' }}>
                  This is how your store appears to customers.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setCurrentTab('OVERVIEW')}
              style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '8px', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{ padding: '10px 24px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 4. STORE POLICIES (store-policies.png) */}
      {/* ========================================================================= */}
      {currentTab === 'POLICIES' && (
        <form onSubmit={handleSavePolicies}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store Policies</h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Set clear policies so customers know what to expect.</p>
            </div>
            <button
              type="submit"
              style={{ padding: '9px 20px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Save all changes
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* RETURN POLICY */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🔄</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>RETURN POLICY</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Enabled</span>
                </div>
                <input
                  type="checkbox"
                  checked={policies.returnPolicy.enabled}
                  onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, enabled: e.target.checked } })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Return window</label>
                  <select
                    value={policies.returnPolicy.window}
                    onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, window: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  >
                    <option value="7 Days after delivery">7 Days after delivery</option>
                    <option value="14 Days after delivery">14 Days after delivery</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Return condition required</label>
                  <select
                    value={policies.returnPolicy.condition}
                    onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, condition: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  >
                    <option value="Original packaging & tags intact">Original packaging & tags intact</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Policy description</label>
                <textarea
                  rows={3}
                  value={policies.returnPolicy.description}
                  onChange={(e) => setPolicies({ ...policies, returnPolicy: { ...policies.returnPolicy, description: e.target.value } })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>Preview policy page</span>
                <button type="submit" style={{ padding: '6px 14px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save policy</button>
              </div>
            </div>

            {/* REFUND POLICY */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>💳</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>REFUND POLICY</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Enabled</span>
                </div>
                <input
                  type="checkbox"
                  checked={policies.refundPolicy.enabled}
                  onChange={(e) => setPolicies({ ...policies, refundPolicy: { ...policies.refundPolicy, enabled: e.target.checked } })}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                {policies.refundPolicy.description}
              </div>
            </div>

            {/* CANCELLATION POLICY */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>ⓧ</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>CANCELLATION POLICY</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Enabled</span>
                </div>
                <input
                  type="checkbox"
                  checked={policies.cancellationPolicy.enabled}
                  onChange={(e) => setPolicies({ ...policies, cancellationPolicy: { ...policies.cancellationPolicy, enabled: e.target.checked } })}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                {policies.cancellationPolicy.description}
              </div>
            </div>

            {/* DELIVERY POLICY */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🚚</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>DELIVERY POLICY</span>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Active</span>
                </div>
                <input
                  type="checkbox"
                  checked={policies.deliveryPolicy.enabled}
                  onChange={(e) => setPolicies({ ...policies, deliveryPolicy: { ...policies.deliveryPolicy, enabled: e.target.checked } })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Estimated delivery time</label>
                  <input
                    type="text"
                    value={policies.deliveryPolicy.estimatedTime}
                    onChange={(e) => setPolicies({ ...policies, deliveryPolicy: { ...policies.deliveryPolicy, estimatedTime: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Standard delivery charge (NPR)</label>
                  <input
                    type="number"
                    value={policies.deliveryPolicy.standardCharge}
                    onChange={(e) => setPolicies({ ...policies, deliveryPolicy: { ...policies.deliveryPolicy, standardCharge: parseInt(e.target.value, 10) || 0 } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Free delivery threshold (NPR)</label>
                  <input
                    type="number"
                    value={policies.deliveryPolicy.freeThreshold}
                    onChange={(e) => setPolicies({ ...policies, deliveryPolicy: { ...policies.deliveryPolicy, freeThreshold: parseInt(e.target.value, 10) || 0 } })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>Delivery instructions & details</label>
                <textarea
                  rows={2}
                  value={policies.deliveryPolicy.details}
                  onChange={(e) => setPolicies({ ...policies, deliveryPolicy: { ...policies.deliveryPolicy, details: e.target.value } })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ECE7DE', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '6px 14px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save delivery policy</button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 5. STORE PREVIEW (store-preview.png) */}
      {/* ========================================================================= */}
      {currentTab === 'PREVIEW' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store Preview</h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>See how customers will view your store on Everest Pasal.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentTab('PROFILE')}
                style={{ padding: '9px 18px', backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '8px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              >
                Edit Store
              </button>
              <button
                onClick={() => {
                  setSuccessToast('Store changes published live to marketplace!');
                  setTimeout(() => setSuccessToast(null), 3000);
                }}
                style={{ padding: '9px 18px', backgroundColor: '#2563EB', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Publish Changes
              </button>
            </div>
          </div>

          {/* DEVICE SWITCHER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '8px', border: '1px solid #ECE7DE' }}>
              <button
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: previewDevice === 'desktop' ? '#EFF6FF' : 'transparent',
                  color: previewDevice === 'desktop' ? '#2563EB' : '#64748B',
                }}
              >
                🖥 Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: previewDevice === 'tablet' ? '#EFF6FF' : 'transparent',
                  color: previewDevice === 'tablet' ? '#2563EB' : '#64748B',
                }}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: previewDevice === 'mobile' ? '#EFF6FF' : 'transparent',
                  color: previewDevice === 'mobile' ? '#2563EB' : '#64748B',
                }}
              >
                📱 Mobile
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Preview resolution: <strong>{previewDevice === 'desktop' ? '1440 × 900 px' : previewDevice === 'tablet' ? '768 × 1024 px' : '375 × 812 px'}</strong>
            </div>
          </div>

          {/* STOREFRONT PREVIEW CONTAINER */}
          <div
            style={{
              maxWidth: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '420px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Banner Cover */}
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <img src={branding.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                Interactive Mockup
              </div>
            </div>

            {/* Store Header Bio */}
            <div style={{ padding: '0 32px 24px 32px', position: 'relative' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: branding.primaryColor,
                  color: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #FFFFFF',
                  marginTop: '-36px',
                  marginBottom: '14px',
                }}
              >
                {branding.logoText}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>
                    {profile.storeName}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>{profile.category}</div>
                  <div style={{ fontSize: '13px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>4.6 ★★★★★</span>
                    <span style={{ color: '#64748B' }}>({performance.reviewsCount} reviews)</span>
                    <span>•</span>
                    <span style={{ color: '#64748B' }}>📍 {profile.city}, Nepal</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '14px 0' }}>
                {profile.description}
              </p>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #ECE7DE', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ color: '#2563EB', borderBottom: '2px solid #2563EB', paddingBottom: '10px' }}>Home</span>
                <span style={{ color: '#64748B', paddingBottom: '10px' }}>Products</span>
                <span style={{ color: '#64748B', paddingBottom: '10px' }}>About</span>
                <span style={{ color: '#64748B', paddingBottom: '10px' }}>Reviews</span>
                <span style={{ color: '#64748B', paddingBottom: '10px' }}>Policies</span>
              </div>
            </div>

            {/* Featured Products Section */}
            <div style={{ padding: '0 32px 32px 32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>Featured Products</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { title: 'Smart LED TV 43 inch', price: 'NPR 45,000', rating: '4.5', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&auto=format&fit=crop&q=80' },
                  { title: 'Wireless Earbuds Pro', price: 'NPR 3,200', rating: '4.3', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80' },
                  { title: 'Laptop Stand Aluminum', price: 'NPR 2,800', rating: '4.7', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&auto=format&fit=crop&q=80' },
                  { title: 'USB-C Hub 7-in-1', price: 'NPR 4,500', rating: '4.4', image: 'https://images.unsplash.com/photo-1622445262464-84b14e3235b3?w=200&auto=format&fit=crop&q=80' },
                ].map((item, idx) => (
                  <div key={idx} style={{ border: '1px solid #ECE7DE', borderRadius: '10px', overflow: 'hidden', padding: '12px' }}>
                    <div style={{ height: '110px', backgroundColor: '#F8FAFC', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>★ {item.rating}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563EB' }}>{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 6. TAB: STORE SETUP (EMPTY STATE) */}
      {currentTab === 'SETUP' && (
        <div style={{ maxWidth: '820px', margin: '30px auto 60px auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>Store Setup</h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Complete your store setup to start selling on Everest Pasal.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
            {/* Step 1: Logo */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🏪
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '3px' }}>Add Your Store Logo</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Upload a logo to help customers recognize your store</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('BRANDING')}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #2563EB',
                  color: '#2563EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upload Logo
              </button>
            </div>

            {/* Step 2: Cover */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🖼️
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '3px' }}>Add a Store Cover Image</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>A cover image makes your storefront more attractive to shoppers</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('BRANDING')}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #2563EB',
                  color: '#2563EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upload Cover
              </button>
            </div>

            {/* Step 3: Policies */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  📄
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '3px' }}>Set Your Store Policies</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Define return, refund, and delivery policies to build customer trust</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('POLICIES')}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #2563EB',
                  color: '#2563EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Set Policies
              </button>
            </div>
          </div>

          {/* Progress pill & Subtext */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '999px',
                marginBottom: '10px',
              }}
            >
              0 of 3 completed
            </span>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Complete all steps to publish your store.
            </div>
          </div>

          {/* Store Illustration from screenshot */}
          <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.65 }}>
            <svg width="200" height="110" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="100,16 18,44 182,44" stroke="#94A3B8" strokeWidth="3" fill="none" strokeLinejoin="round" />
              <line x1="12" y1="46" x2="188" y2="46" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
              <rect x="28" y="50" width="12" height="46" stroke="#94A3B8" strokeWidth="3" fill="none" rx="2" />
              <rect x="72" y="50" width="12" height="46" stroke="#94A3B8" strokeWidth="3" fill="none" rx="2" />
              <rect x="116" y="50" width="12" height="46" stroke="#94A3B8" strokeWidth="3" fill="none" rx="2" />
              <rect x="160" y="50" width="12" height="46" stroke="#94A3B8" strokeWidth="3" fill="none" rx="2" />
              <line x1="12" y1="100" x2="188" y2="100" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
