// ==============================================================================
// EVEREST PASAL - APPLICATION LAYOUT COMPONENT
// Multi-Surface Workspace Switcher: Customer Web | Vendor Center | Admin Control
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../Common/StatusBadge.js';

export type WorkspaceSurface = 'customer' | 'vendor' | 'admin';

interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  surface: WorkspaceSurface;
  onSurfaceChange: (surface: WorkspaceSurface) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  surface,
  onSurfaceChange,
  children,
}) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CHECKING'>('CHECKING');
  const [apiStatus, setApiStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await ApiClient.get<{ status: string }>('/health');
        setApiStatus(health.status === 'UP' ? 'UP' : 'DOWN');
      } catch {
        setApiStatus('DOWN');
      }

      try {
        const dbHealth = await ApiClient.get<{ status: string }>('/health/db');
        setDbStatus(dbHealth.status === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED');
      } catch {
        setDbStatus('DISCONNECTED');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">EP</div>
          <div>
            <div className="brand-title">EVEREST PASAL</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Multi-Vendor Marketplace</div>
          </div>
        </div>

        {/* Workspace Mode Badge */}
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#38bdf8',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {surface === 'customer' && '🛍️ Customer Store'}
              {surface === 'vendor' && '🏬 Vendor Center'}
              {surface === 'admin' && '⚙️ Admin Center'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Active Surface</span>
          </div>
        </div>

        {/* Navigation Tabs based on active Surface */}
        <nav className="sidebar-nav">
          {surface === 'customer' && (
            <>
              <div
                className={`nav-item ${currentTab === 'storefront' ? 'active' : ''}`}
                onClick={() => onTabChange('storefront')}
              >
                🛍️ Browse Catalog
              </div>
              <div
                className={`nav-item ${currentTab === 'cart' ? 'active' : ''}`}
                onClick={() => onTabChange('cart')}
              >
                🛒 Cart & Checkout {cart && cart.totalItems > 0 ? `(${cart.totalItems})` : ''}
              </div>
              <div
                className={`nav-item ${currentTab === 'my-orders' ? 'active' : ''}`}
                onClick={() => onTabChange('my-orders')}
              >
                📦 My Orders & Tracking
              </div>
            </>
          )}

          {surface === 'vendor' && (
            <>
              <div
                className={`nav-item ${currentTab === 'vendor-dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('vendor-dashboard')}
              >
                📊 Store Overview
              </div>
              <div
                className={`nav-item ${currentTab === 'vendor-fulfillment' ? 'active' : ''}`}
                onClick={() => onTabChange('vendor-fulfillment')}
              >
                📦 Package Orders & Ship
              </div>
              <div
                className={`nav-item ${currentTab === 'vendor-inventory' ? 'active' : ''}`}
                onClick={() => onTabChange('vendor-inventory')}
              >
                📊 Stock Levels Ledger
              </div>
              <div
                className={`nav-item ${currentTab === 'products' ? 'active' : ''}`}
                onClick={() => onTabChange('products')}
              >
                🏷️ Products & Offers CRUD
              </div>
              <div
                className={`nav-item ${currentTab === 'categories' ? 'active' : ''}`}
                onClick={() => onTabChange('categories')}
              >
                🗂️ Categories
              </div>
            </>
          )}

          {surface === 'admin' && (
            <>
              <div
                className={`nav-item ${currentTab === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-dashboard')}
              >
                📊 Executive Telemetry
              </div>
              <div
                className={`nav-item ${currentTab === 'admin-vendors' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-vendors')}
              >
                🏢 Merchant KYC Approvals
              </div>
              <div
                className={`nav-item ${currentTab === 'admin-customers' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-customers')}
              >
                👥 Customer Accounts
              </div>
              <div
                className={`nav-item ${currentTab === 'admin-orders' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-orders')}
              >
                📋 Global Marketplace Orders
              </div>
              <div
                className={`nav-item ${currentTab === 'admin-audits' ? 'active' : ''}`}
                onClick={() => onTabChange('admin-audits')}
              >
                🛡️ Audit Trail Events
              </div>
              <div
                className={`nav-item ${currentTab === 'health' ? 'active' : ''}`}
                onClick={() => onTabChange('health')}
              >
                🩺 System & DB Health
              </div>
            </>
          )}
        </nav>

        {/* Sidebar System Health Footprint */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Backend API:</span>
            <StatusBadge status={apiStatus} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>PostgreSQL:</span>
            <StatusBadge status={dbStatus} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Workspace Selector & Header */}
        <header className="header">
          <div className="header-left">
            {/* Workspace Surface Switcher Pills */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                backgroundColor: '#0f172a',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <button
                onClick={() => {
                  onSurfaceChange('customer');
                  onTabChange('storefront');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: surface === 'customer' ? '#2563eb' : 'transparent',
                  color: surface === 'customer' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                }}
              >
                🛍️ Customer Web
              </button>

              <button
                onClick={() => {
                  onSurfaceChange('vendor');
                  onTabChange('vendor-dashboard');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: surface === 'vendor' ? '#2563eb' : 'transparent',
                  color: surface === 'vendor' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                }}
              >
                🏬 Vendor Seller Center
              </button>

              <button
                onClick={() => {
                  onSurfaceChange('admin');
                  onTabChange('admin-dashboard');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: surface === 'admin' ? '#2563eb' : 'transparent',
                  color: surface === 'admin' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                }}
              >
                ⚙️ Admin Control Center
              </button>
            </div>
          </div>

          <div className="header-right">
            {/* Cart shortcut in customer surface */}
            {surface === 'customer' && cart && cart.totalItems > 0 && (
              <button
                onClick={() => onTabChange('cart')}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🛒 Cart ({cart.totalItems})</span>
              </button>
            )}

            {user && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{user.email || user.phone}</div>
                  </div>
                  {user.roles && user.roles[0] && (
                    <StatusBadge status={user.roles[0].role} type="role" />
                  )}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => logout()}
                  title="Log out of session"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};
