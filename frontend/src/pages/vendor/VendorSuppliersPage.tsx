// ==============================================================================
// EVEREST PASAL - VENDOR SUPPLIER & VENDOR PARTNERS DIRECTORY
// Artisan co-operatives, wholesale distributors, contact details & balance ledgers
// ==============================================================================

import React, { useState } from 'react';

export const VendorSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'Ilam Organic Tea Co-operative', contactPerson: 'Govinda Dahal', phone: '9852011223', location: 'Ilam, Koshi Province', suppliedCategory: 'Tea & Agro', pendingPayable: 0, status: 'ACTIVE' },
    { id: '2', name: 'Mustang Artisan & Handloom Guild', contactPerson: 'Tenzing Norbu', phone: '9846055443', location: 'Jomsom, Mustang', suppliedCategory: 'Yak Shawls & Textiles', pendingPayable: 60000, status: 'ACTIVE' },
    { id: '3', name: 'Bhaktapur Heritage Pottery Syndicate', contactPerson: 'Ratna Prajapati', phone: '9813098765', location: 'Bhaktapur Durbar, Bagmati', suppliedCategory: 'Clay Pottery & Ceramics', pendingPayable: 32000, status: 'ACTIVE' },
    { id: '4', name: 'Jumla High-Altitude Agro Hub', contactPerson: 'Laxman Rokaya', phone: '9868012345', location: 'Chandannath, Jumla', suppliedCategory: 'Organic Marshi Rice & Beans', pendingPayable: 0, status: 'ACTIVE' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>🚚 Supplier & Artisan Guild Directory</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Direct manufacturer partnerships, cooperative contacts, and procurement ledgers
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Add Supplier
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Supplier / Artisan Partner</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Origin Location</th>
              <th>Supply Category</th>
              <th>Pending Payables</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.contactPerson}</td>
                <td>{s.phone}</td>
                <td style={{ color: '#64748b' }}>📍 {s.location}</td>
                <td><span className="badge badge-info">{s.suppliedCategory}</span></td>
                <td>
                  {s.pendingPayable > 0 ? (
                    <span className="badge badge-warning">Payable: NPR {s.pendingPayable.toLocaleString()}</span>
                  ) : (
                    <span className="badge badge-success">Settled (NPR 0)</span>
                  )}
                </td>
                <td><span className="badge badge-success">{s.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-secondary">Purchase History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
