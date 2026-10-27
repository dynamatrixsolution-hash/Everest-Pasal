// ==============================================================================
// EVEREST PASAL - DASHBOARD PAGE COMPONENT
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ApiClient } from '../api/client.js';
import { StatusBadge } from '../components/Common/StatusBadge.js';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    dbLatencyMs: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsRes, categoriesRes, dbHealth] = await Promise.all([
          ApiClient.get<{ pagination: { total: number } }>('/api/products?limit=1'),
          ApiClient.get<{ categories: any[] }>('/api/categories'),
          ApiClient.get<{ latencyMs: number }>('/health/db'),
        ]);

        setStats({
          productsCount: productsRes.pagination?.total || 0,
          categoriesCount: categoriesRes.categories?.length || 0,
          dbLatencyMs: dbHealth.latencyMs || 0,
          loading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>
              Welcome back, {user?.fullName}!
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              Everest Pasal Full-Stack Platform is active and connected to PostgreSQL.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('products')}
          >
            Manage Products &rarr;
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Products</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#0f172a' }}>
            {stats.loading ? '...' : stats.productsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Live in PostgreSQL
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Product Categories</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#0f172a' }}>
            {stats.loading ? '...' : stats.categoriesCount}
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
            Multi-level hierarchy
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>PostgreSQL Query Latency</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#0f172a' }}>
            {stats.loading ? '...' : `${stats.dbLatencyMs} ms`}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            ⚡ Low Latency Query OK
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Account Status</div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '12px' }}>
            <StatusBadge status={user?.status || 'ACTIVE'} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Session Verified
          </div>
        </div>
      </div>

      {/* Profile & Permissions Grid */}
      <div className="grid-2">
        {/* User Context Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">User Profile & Identity</h2>
              <p className="card-subtitle">Active session verified via JWT & Prisma</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Account ID:</span>
              <code style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                {user?.id}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Email:</span>
              <span style={{ fontWeight: 500 }}>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Phone:</span>
              <span style={{ fontWeight: 500 }}>{user?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Assigned Roles:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {user?.roles?.map((r, i) => (
                  <StatusBadge key={i} status={r.role} type="role" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RBAC Effective Permissions */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Assigned Permissions (RBAC)</h2>
              <p className="card-subtitle">Fine-grained permissions resolved from database</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user?.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <span
                  key={perm}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: '#334155',
                  }}
                >
                  ✓ {perm}
                </span>
              ))
            ) : (
              <span style={{ color: '#64748b', fontSize: '13px' }}>
                Standard customer permissions active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
