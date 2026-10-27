// ==============================================================================
// EVEREST PASAL - ADMIN GLOBAL ORDER MANAGER
// Platform-wide order inspection with multi-vendor package breakdown
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number | string;
  shippingAmount: number | string;
  totalAmount: number | string;
  currency: string;
  placedAt: string;
  account: {
    id: string;
    fullName: string;
    email?: string;
  };
  items: any[];
  fulfillmentUnits: Array<{
    id: string;
    organization: {
      tradeName?: string;
    };
    shipments: any[];
  }>;
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ orders: AdminOrder[] }>(
        `/api/orders/admin/all${search ? `?search=${encodeURIComponent(search)}` : ''}`
      );
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('Failed to load admin orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            📋 Global Platform Orders
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
            Comprehensive marketplace order tracking, fulfillment monitoring, and financial totals.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Search order #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Loading marketplace orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📦</div>
          <h3 style={{ color: '#f8fafc', marginBottom: '4px' }}>No orders found</h3>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 16px' }}>Order #</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Vendor Packages</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Overall Status</th>
                  <th style={{ padding: '12px 16px' }}>Placed Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                      {o.orderNumber}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {o.account?.fullName || 'Guest Customer'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8' }}>
                      {o.fulfillmentUnits?.map((u) => u.organization?.tradeName || 'Vendor').join(', ') || 'N/A'} (
                      {o.fulfillmentUnits.length} pkg)
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#f8fafc' }}>
                      NPR {Number(o.totalAmount).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      {new Date(o.placedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
