// ==============================================================================
// EVEREST PASAL - ADMIN VENDOR & MERCHANT GOVERNANCE
// Review vendor KYC, approve new stores, inspect PAN/tax details, manage merchant accounts
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';

interface VendorOrg {
  id: string;
  legalName: string;
  tradeName?: string;
  taxId?: string;
  status: string;
  totalOffers: number;
  activeOffers: number;
  totalFulfillments: number;
  members: Array<{
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
  }>;
  createdAt: string;
}

export const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorOrg[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ vendors: VendorOrg[] }>(
        `/api/admin/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`
      );
      setVendors(res.vendors || []);
    } catch (err: any) {
      console.error('Failed to load vendors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await ApiClient.patch(`/api/admin/vendors/${vendorId}/status`, { status: newStatus });
      await fetchVendors();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            🏢 Merchant Organizations & KYC Approvals
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
            Verify merchant tax registrations, review active catalog offers, and manage store operational statuses.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchVendors();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Search vendor by name, PAN/Tax ID..."
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
          Loading vendor directory...
        </div>
      ) : vendors.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏢</div>
          <h3 style={{ color: '#f8fafc', marginBottom: '4px' }}>No merchants found</h3>
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
                  <th style={{ padding: '12px 16px' }}>Merchant / Trade Name</th>
                  <th style={{ padding: '12px 16px' }}>Legal Entity</th>
                  <th style={{ padding: '12px 16px' }}>Tax / PAN #</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Active Offers</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Fulfillments</th>
                  <th style={{ padding: '12px 16px' }}>KYC Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                      {v.tradeName || v.legalName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{v.legalName}</td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {v.taxId || 'NOT_SUBMITTED'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#f8fafc' }}>
                      {v.activeOffers} / {v.totalOffers}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      {v.totalFulfillments}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={v.status} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {v.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'ACTIVE')}
                            disabled={isUpdating}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#059669', fontSize: '11px', padding: '4px 8px' }}
                          >
                            ✓ Approve
                          </button>
                        )}
                        {v.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'SUSPENDED')}
                            disabled={isUpdating}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444', fontSize: '11px', padding: '4px 8px' }}
                          >
                            Suspend
                          </button>
                        )}
                      </div>
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
