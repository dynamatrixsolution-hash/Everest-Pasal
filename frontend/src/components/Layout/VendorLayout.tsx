// ==============================================================================
// EVEREST PASAL - VENDOR SELLER CENTER LAYOUT
// Exact match to Everest Pasal Vendor Panel Design Specifications
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter, Link } from '../../router/index.js';
import { ApiClient } from '../../api/client.js';

interface VendorLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();
  const [storeData, setStoreData] = useState<any>({
    name: user?.fullName ? `${user.fullName.split(' ')[0]}'s Store` : 'Vendor Store',
    isLive: true,
    pendingOrders: 0,
    totalOrders: 0,
    productsListed: 0,
  });

  const userName = user?.fullName || 'Vendor';
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Vendor';

  const storeInitials =
    (storeData.name || 'VS')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('') || 'VS';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    let isMounted = true;
    const fetchVendorProfile = async () => {
      try {
        const [storeRes, dashRes] = await Promise.all([
          ApiClient.get<any>('/api/v1/vendor/store').catch(() => null),
          ApiClient.get<any>('/api/v1/vendor/dashboard/summary').catch(() => null),
        ]);

        if (!isMounted) return;

        const resolvedName =
          storeRes?.profile?.storeName ||
          dashRes?.store?.name ||
          (user?.fullName ? `${user.fullName.split(' ')[0]}'s Store` : 'Vendor Store');

        setStoreData({
          name: resolvedName,
          isLive: storeRes?.isOpen ?? dashRes?.store?.isLive ?? true,
          pendingOrders: Number(dashRes?.kpis?.pendingOrders?.value ?? 0),
          totalOrders: Number(dashRes?.kpis?.totalOrders?.value ?? storeRes?.performance?.totalOrders ?? 0),
          productsListed: Number(storeRes?.performance?.productsListed ?? 0),
        });
      } catch (e) {
        // Keep current state
      }
    };
    fetchVendorProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id, path]);

  const navGroups: NavGroup[] = [
    {
      title: 'SALES & ORDERS',
      items: [
        {
          to: '/vendor/orders',
          label: 'Orders',
          badge: storeData.pendingOrders > 0 ? storeData.pendingOrders : undefined,
          badgeColor: '#EF4444',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          ),
        },
        {
          to: '/vendor/fulfillment',
          label: 'Shipping & Fulfillment',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          ),
        },
        {
          to: '/vendor/returns',
          label: 'Returns & Refunds',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'CATALOG & INVENTORY',
      items: [
        {
          to: '/vendor/products',
          label: 'Products',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          ),
        },
        {
          to: '/vendor/inventory',
          label: 'Inventory',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          ),
        },
        {
          to: '/vendor/categories-units',
          label: 'Categories & Attributes',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          ),
        },
        {
          to: '/vendor/promotions',
          label: 'Discounts & Promotions',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'CUSTOMER ENGAGEMENT',
      items: [
        {
          to: '/vendor/customers',
          label: 'Customers',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          ),
        },
        {
          to: '/vendor/reviews',
          label: 'Reviews & Ratings',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          ),
        },
        {
          to: '/vendor/inquiries',
          label: 'Customer Inquiries',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'BUSINESS & FINANCE',
      items: [
        {
          to: '/vendor/reports',
          label: 'Analytics & Reports',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          ),
        },
        {
          to: '/vendor/finance',
          label: 'Earnings & Payouts',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          ),
        },
        {
          to: '/vendor/purchases',
          label: 'Purchase',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          ),
        },
        {
          to: '/vendor/payments',
          label: 'Transactions',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'STORE MANAGEMENT',
      items: [
        {
          to: '/vendor/store',
          label: 'My Store',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          ),
        },
        {
          to: '/vendor/users-roles',
          label: 'Team & Permissions',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          ),
        },
        {
          to: '/vendor/settings',
          label: 'Store Settings',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
        {
          to: '/vendor/help',
          label: 'Help & Support',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
        },
      ],
    },
  ];

  const isDashboardActive = path === '/vendor' || path === '/vendor/dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Light Clean Vendor Sidebar - Fixed on Left */}
      <aside
        style={{
          width: '230px',
          minWidth: '230px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #ECECEC',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ padding: '18px 20px 14px 20px', display: 'flex', alignItems: 'center' }}>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/vendor')}
          >
            <img
              src="/logo.png"
              alt="Everest Pasal - Nepal to the World"
              style={{
                height: '38px',
                maxWidth: '180px',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e: any) => {
                e.currentTarget.src = '/logo-horizontal.png';
              }}
            />
          </div>
        </div>

        {/* Merchant Store Selector Card */}
        <div style={{ padding: '0 14px 10px 14px' }}>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  backgroundColor: '#E0E7FF',
                  color: '#1E3A8A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  flexShrink: 0,
                }}
              >
                {storeInitials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                  title={storeData.name}
                >
                  {storeData.name}
                </div>
                <div style={{ fontSize: '10.5px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                  Store is live
                </div>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Primary Dashboard Link */}
        <div style={{ padding: '0 14px 8px 14px' }}>
          <Link
            to="/vendor"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '6px',
              color: isDashboardActive ? '#FFFFFF' : '#475569',
              backgroundColor: isDashboardActive ? '#1A56DB' : 'transparent',
              fontSize: '13px',
              fontWeight: isDashboardActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              <span>Dashboard</span>
            </div>
            {isDashboardActive && (
              <span style={{ width: '6px', height: '6px', backgroundColor: '#FFFFFF', borderRadius: '1.5px', opacity: 0.9 }}></span>
            )}
          </Link>
        </div>

        {/* Scrollable Grouped Navigation */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 14px 18px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#94A3B8',
                  padding: '6px 8px 4px 8px',
                }}
              >
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => {
                  const isActive = path === item.to || path.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        color: isActive ? '#FFFFFF' : '#475569',
                        backgroundColor: isActive ? '#1A56DB' : 'transparent',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#FFFFFF' : '#64748B' }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          style={{
                            backgroundColor: item.badgeColor || '#EF4444',
                            color: '#FFFFFF',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            padding: '1px 6px',
                            lineHeight: '1.2',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '230px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header matching exact screenshot */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 28px 14px 28px',
            borderBottom: '1px solid #ECECEC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#E11D48', margin: 0, letterSpacing: '-0.2px' }}>
              {greeting}, {firstName}
            </h1>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0 0' }}>
              {storeData.name} • {storeData.productsListed} product(s) listed / Check {storeData.pendingOrders} pending order(s)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search anything..."
                style={{
                  width: '230px',
                  padding: '7px 14px 7px 32px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12.5px',
                  outline: 'none',
                  color: '#1E293B',
                }}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '11px', top: '9px' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Help Button */}
            <button
              onClick={() => navigate('/vendor/help')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12.5px',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 500,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Help
            </button>

            {/* Notification Bell with Red Badge */}
            <div
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => navigate('/vendor/notifications')}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                1
              </span>
            </div>

            {/* Profile Avatar */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={() => logout()}
              title="Click to logout"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#CBD5E1',
                  border: '1px solid #E2E8F0',
                }}
              >
                <img
                  src="/images/vendor_avatar.jpg"
                  alt={userName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: '20px 28px 36px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
