// ==============================================================================
// EVEREST PASAL - VENDOR BRANCHES & OUTLET HUBS
// Multi-location store branches, warehouse depots, counters, and branch inventory
// ==============================================================================

import React, { useState } from 'react';

export const VendorBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState([
    { id: '1', name: 'Kathmandu Flagship Store', code: 'KTM-MAIN', location: 'Thamel, Kathmandu', type: 'RETAIL_STORE', staffCount: 4, activeCounters: 2, status: 'OPEN' },
    { id: '2', name: 'Pokhara Lakeside Outlet', code: 'PKR-LAKE', location: 'Lakeside-6, Pokhara', type: 'RETAIL_STORE', staffCount: 2, activeCounters: 1, status: 'OPEN' },
    { id: '3', name: 'Biratnagar Eastern Transit Hub', code: 'BRT-HUB', location: 'Main Road, Biratnagar', type: 'WAREHOUSE_DEPOT', staffCount: 3, activeCounters: 1, status: 'OPEN' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>🌿 Multi-Branch & Store Outlets</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage brick-and-mortar retail outlets, fulfillment warehouses, and regional depots
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Open New Branch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {branches.map((b) => (
          <div key={b.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '10px' }}>{b.code}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{b.name}</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {b.location}</div>
              </div>
              <span className="badge badge-success">{b.status}</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px', fontSize: '12px', color: '#475569' }}>
              <div>👥 <strong>{b.staffCount}</strong> Staff Assigned</div>
              <div>⚡ <strong>{b.activeCounters}</strong> Active POS</div>
              <div>🏢 <strong>{b.type.replace('_', ' ')}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>Branch Inventory</button>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>POS Terminals</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
