// ==============================================================================
// EVEREST PASAL - ADMIN CUSTOMER MANAGEMENT
// Directory of registered customers, lifetime spend, order history, identity verification
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';

interface CustomerItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  roles: string[];
  createdAt: string;
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ customers: CustomerItem[] }>(
        `/api/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`
      );
      setCustomers(res.customers || []);
    } catch (err: any) {
      console.error('Failed to load customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            👥 Customer Directory & Account Governance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
            Inspect registered customer identities, order frequencies, and lifetime platform spend.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCustomers();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Search customer by name, email, phone..."
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
          Loading customer records...
        </div>
      ) : customers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
          <h3 style={{ color: '#f8fafc', marginBottom: '4px' }}>No customers found</h3>
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
                  <th style={{ padding: '12px 16px' }}>Customer Name</th>
                  <th style={{ padding: '12px 16px' }}>Contact Info</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total Orders</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Lifetime Spend</th>
                  <th style={{ padding: '12px 16px' }}>Account Status</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                      {c.fullName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      <div>{c.email || 'No email'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#f8fafc', fontWeight: 600 }}>
                      {c.totalOrders}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      NPR {c.totalSpent.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
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
