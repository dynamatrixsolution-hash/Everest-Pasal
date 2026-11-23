// ==============================================================================
// EVEREST PASAL - VENDOR BRANCHES & OUTLET HUBS
// Multi-location store branches, warehouse depots, counters, and branch inventory
// ==============================================================================

import React, { useState } from 'react';
import { useRouter } from '../../router/index.js';
import { GitBranch, Plus, MapPin, Users, Zap, Building2 } from 'lucide-react';

export const VendorBranchesPage: React.FC = () => {
  const { navigate } = useRouter();
  const [branches, setBranches] = useState([
    { id: '1', name: 'Kathmandu Flagship Store', code: 'KTM-MAIN', location: 'Thamel, Kathmandu', type: 'RETAIL_STORE', staffCount: 4, activeCounters: 2, status: 'OPEN' },
    { id: '2', name: 'Pokhara Lakeside Outlet', code: 'PKR-LAKE', location: 'Lakeside-6, Pokhara', type: 'RETAIL_STORE', staffCount: 2, activeCounters: 1, status: 'OPEN' },
    { id: '3', name: 'Biratnagar Eastern Transit Hub', code: 'BRT-HUB', location: 'Main Road, Biratnagar', type: 'WAREHOUSE_DEPOT', staffCount: 3, activeCounters: 1, status: 'OPEN' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    location: '',
    type: 'RETAIL_STORE',
  });

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.code.trim()) return;
    setBranches((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ...newBranch,
        staffCount: 1,
        activeCounters: 1,
        status: 'OPEN',
      },
    ]);
    setShowAddModal(false);
    setNewBranch({ name: '', code: '', location: '', type: 'RETAIL_STORE' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={22} color="#0B4EA2" /> Multi-Branch & Store Outlets
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage brick-and-mortar retail outlets, fulfillment warehouses, and regional depots
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#0B4EA2', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Open New Branch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {branches.map((b) => (
          <div key={b.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '10px' }}>{b.code}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{b.name}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={12} /> {b.location}
                </div>
              </div>
              <span className="badge badge-success">{b.status}</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px', fontSize: '12px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> <strong>{b.staffCount}</strong> Staff
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={13} /> <strong>{b.activeCounters}</strong> POS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={13} /> <strong>{b.type.replace('_', ' ')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => navigate('/vendor/inventory')}
                style={{ flex: 1 }}
              >
                Branch Inventory
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => navigate('/vendor/pos')}
                style={{ flex: 1 }}
              >
                POS Terminals
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Open New Store Branch / Depot</h3>
            <form onSubmit={handleAddBranch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lalitpur Hub Store"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Branch Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LLT-01"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pulchowk, Lalitpur"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Branch Type</label>
                <select
                  className="form-control"
                  value={newBranch.type}
                  onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                >
                  <option value="RETAIL_STORE">Retail Flagship Store</option>
                  <option value="WAREHOUSE_DEPOT">Warehouse & Dispatch Depot</option>
                  <option value="EXPRESS_COUNTER">Express Pickup Counter</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0B4EA2', color: '#FFF', fontWeight: 600 }}>
                  Open Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
