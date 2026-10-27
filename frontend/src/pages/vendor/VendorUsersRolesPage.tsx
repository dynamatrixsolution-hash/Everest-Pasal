// ==============================================================================
// EVEREST PASAL - VENDOR USERS & ROLES PERMISSIONS
// Store cashiers, inventory managers, branch operators, and RBAC privilege control
// ==============================================================================

import React, { useState } from 'react';

export const VendorUsersRolesPage: React.FC = () => {
  const [staff, setStaff] = useState([
    { id: '1', name: 'Pasang Sherpa', email: 'vendor@himalayan-goods.com.np', role: 'VENDOR_ADMIN', branch: 'All Branches', lastLogin: 'Just now', status: 'ACTIVE' },
    { id: '2', name: 'Nabin Tamang', email: 'nabin.pos@himalayan-goods.com.np', role: 'CASHIER_POS', branch: 'Kathmandu Store', lastLogin: '2026-09-22 09:30', status: 'ACTIVE' },
    { id: '3', name: 'Sunita Rai', email: 'sunita.inv@himalayan-goods.com.np', role: 'INVENTORY_MANAGER', branch: 'Kathmandu Store', lastLogin: '2026-09-21 17:45', status: 'ACTIVE' },
    { id: '4', name: 'Dipendra Karki', email: 'dipendra.pkr@himalayan-goods.com.np', role: 'BRANCH_MANAGER', branch: 'Pokhara Lakeside', lastLogin: '2026-09-22 11:10', status: 'ACTIVE' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>🛡️ Staff Users & Access Roles</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage staff members, cashier pin codes, and module access permissions
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Invite Staff Member
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Login Email</th>
              <th>Assigned Role</th>
              <th>Branch Scope</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td style={{ color: '#64748b' }}>{s.email}</td>
                <td>
                  <span
                    className={`badge ${
                      s.role === 'VENDOR_ADMIN'
                        ? 'badge-success'
                        : s.role === 'BRANCH_MANAGER'
                        ? 'badge-info'
                        : 'badge-secondary'
                    }`}
                  >
                    {s.role}
                  </span>
                </td>
                <td>{s.branch}</td>
                <td style={{ color: '#64748b' }}>{s.lastLogin}</td>
                <td><span className="badge badge-success">{s.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-secondary">Permissions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
