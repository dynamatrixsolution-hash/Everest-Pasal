// ==============================================================================
// EVEREST PASAL - ADMIN CONTROL CENTER LAYOUT
// Dedicated platform administration layout with governance sidebar and system telemetry
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter, Link } from '../../router/index.js';
import { StatusBadge } from '../Common/StatusBadge.js';
import { ApiClient } from '../../api/client.js';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { path } = useRouter();
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CHECKING'>('CHECKING');
  const [apiStatus, setApiStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [apiRes, dbRes] = await Promise.all([
          ApiClient.get<{ status: string }>('/health'),
          ApiClient.get<{ status: string }>('/health/db'),
        ]);
        setApiStatus(apiRes.status === 'UP' ? 'UP' : 'DOWN');
        setDbStatus(dbRes.status === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED');
      } catch {
        setApiStatus('DOWN');
        setDbStatus('DISCONNECTED');
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="app-container">
      {/* Admin Sidebar */}
      <aside className="sidebar" style={{ backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }}>
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ backgroundColor: '#7c3aed' }}>
            AC
          </div>
          <div>
            <div className="brand-title">ADMIN CONTROL</div>
            <div style={{ fontSize: '11px', color: '#c4b5fd' }}>Platform Governance</div>
          </div>
        </div>

        {/* Platform Operator Badge */}
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div
            style={{
              backgroundColor: '#4c1d95',
              border: '1px solid #6d28d9',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#ede9fe',
              fontWeight: 600,
            }}
          >
            ⚙️ Platform Administration
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`nav-item ${path === '/admin' || path === '/admin/dashboard' ? 'active' : ''}`}
          >
            📊 Executive Telemetry
          </Link>
          <Link
            to="/admin/products"
            className={`nav-item ${path === '/admin/products' ? 'active' : ''}`}
          >
            📦 Products & Catalog
          </Link>
          <Link
            to="/admin/banners"
            className={`nav-item ${path === '/admin/banners' ? 'active' : ''}`}
          >
            🖼️ Hero Banners &amp; Slider
          </Link>
          <Link
            to="/admin/vendors"
            className={`nav-item ${path === '/admin/vendors' ? 'active' : ''}`}
          >
            🏢 Merchant KYC Approvals
          </Link>
          <Link
            to="/admin/customers"
            className={`nav-item ${path === '/admin/customers' ? 'active' : ''}`}
          >
            👥 Customer Accounts
          </Link>
          <Link
            to="/admin/orders"
            className={`nav-item ${path === '/admin/orders' ? 'active' : ''}`}
          >
            📋 Global Orders Manager
          </Link>
          <Link
            to="/admin/audits"
            className={`nav-item ${path === '/admin/audits' ? 'active' : ''}`}
          >
            🛡️ Audit Trail Events
          </Link>
          <Link
            to="/admin/health"
            className={`nav-item ${path === '/admin/health' ? 'active' : ''}`}
          >
            🩺 System & DB Health
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Link
            to="/"
            style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: '#1e293b',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#38bdf8',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          >
            ← View Customer Storefront
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Backend:</span>
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
        <header className="header" style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div className="header-left">
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Governance Domain: <strong style={{ color: '#c4b5fd' }}>PLATFORM_SUPER_ADMIN</strong>
            </span>
          </div>

          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.fullName}</div>
                <div style={{ fontSize: '11px', color: '#c4b5fd' }}>Platform Administrator</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => logout()}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};
