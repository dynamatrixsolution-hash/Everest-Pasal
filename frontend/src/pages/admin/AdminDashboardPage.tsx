// ==============================================================================
// EVEREST PASAL - ADMIN CONTROL CENTER DASHBOARD
// Marketplace-wide telemetry: GMV, Total Orders, Active Vendors, Customers
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';

interface MetricsData {
  metrics?: {
    totalGMV?: number;
    grossMarketplaceVolume?: number;
    totalOrders?: number;
    totalCustomers?: number;
    totalVendors?: number;
    totalProducts?: number;
    activeProducts?: number;
    currency?: string;
  };
  recentOrders?: any[];
  recentAudits?: any[];
  recentEvents?: any[];
}

export const AdminDashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({
  onNavigate,
}) => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.get<MetricsData>('/api/admin/metrics');
        setData(res);
      } catch (err: any) {
        console.error('Failed to load admin metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        Loading marketplace executive dashboard...
      </div>
    );
  }

  const metrics = data.metrics || {};
  const recentOrders = data.recentOrders || [];
  const recentAudits = data.recentAudits || data.recentEvents || [];
  const gmv = Number(metrics.totalGMV ?? metrics.grossMarketplaceVolume ?? 0);

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Executive Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            ADMIN EXECUTIVE OVERSIGHT
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '10px', marginBottom: '4px' }}>
            Everest Pasal Platform Control Center
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Unified governance across 21 schemas, multi-vendor commerce, and double-entry ledger.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate('admin-vendors')}
            className="btn btn-secondary btn-sm"
          >
            🏢 Vendors & KYC
          </button>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="btn btn-primary btn-sm"
          >
            📋 All Orders
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Gross Merch. Value (GMV)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
            NPR {gmv.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Platform transactions</div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Total Customer Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            {Number(metrics.totalOrders ?? 0)}
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>Multi-vendor checkouts</div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Merchant Organizations</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            {Number(metrics.totalVendors ?? 0)}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Active Nepali vendors</div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Registered Customers</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            {Number(metrics.totalCustomers ?? 0)}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Verified shopper accounts</div>
        </div>
      </div>

      {/* Grid for Recent Orders & Audit Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Recent Orders */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Recent Global Orders
            </h3>
            <button
              onClick={() => onNavigate('admin-orders')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
              No orders placed yet. Orders will appear here in real-time.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ paddingBottom: '8px' }}>Order #</th>
                  <th style={{ paddingBottom: '8px' }}>Customer</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600, color: '#f8fafc' }}>{o.orderNumber}</td>
                    <td style={{ padding: '8px 0', color: '#cbd5e1' }}>{o.account?.fullName || o.customerName || 'N/A'}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#38bdf8', fontWeight: 600 }}>
                      NPR {Number(o.totalAmount || o.grandTotal || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Live Audit Log Stream */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Governance Audit Events
            </h3>
            <button
              onClick={() => onNavigate('admin-audits')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
            >
              View Full Trail →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAudits.slice(0, 5).map((ev: any) => (
              <div
                key={ev.id}
                style={{
                  backgroundColor: '#0f172a',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>{ev.eventType}</span>
                  <span style={{ color: '#64748b' }}>
                    {new Date(ev.occurredAt || ev.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: '#94a3b8' }}>
                  Actor: {ev.actor?.fullName || ev.actorName || ev.actorType || 'SYSTEM'} • Module: {ev.moduleCode || ev.actorType || 'IDENTITY'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
