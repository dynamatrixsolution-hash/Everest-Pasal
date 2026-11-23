// ==============================================================================
// EVEREST PASAL - VENDOR SUPPLIER & VENDOR PARTNERS DIRECTORY
// Artisan co-operatives, wholesale distributors, contact details & balance ledgers
// ==============================================================================

import React, { useState } from 'react';
import { useRouter } from '../../router/index.js';
import { Truck, Plus, MapPin, Phone, Building2 } from 'lucide-react';

export const VendorSuppliersPage: React.FC = () => {
  const { navigate } = useRouter();
  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'Ilam Organic Tea Co-operative', contactPerson: 'Govinda Dahal', phone: '9852011223', location: 'Ilam, Koshi Province', suppliedCategory: 'Tea & Agro', pendingPayable: 0, status: 'ACTIVE' },
    { id: '2', name: 'Mustang Artisan & Handloom Guild', contactPerson: 'Tenzing Norbu', phone: '9846055443', location: 'Jomsom, Mustang', suppliedCategory: 'Yak Shawls & Textiles', pendingPayable: 60000, status: 'ACTIVE' },
    { id: '3', name: 'Bhaktapur Heritage Pottery Syndicate', contactPerson: 'Ratna Prajapati', phone: '9813098765', location: 'Bhaktapur Durbar, Bagmati', suppliedCategory: 'Clay Pottery & Ceramics', pendingPayable: 32000, status: 'ACTIVE' },
    { id: '4', name: 'Jumla High-Altitude Agro Hub', contactPerson: 'Laxman Rokaya', phone: '9868012345', location: 'Chandannath, Jumla', suppliedCategory: 'Organic Marshi Rice & Beans', pendingPayable: 0, status: 'ACTIVE' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    location: '',
    suppliedCategory: 'Tea & Agro',
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;
    setSuppliers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ...newSupplier,
        pendingPayable: 0,
        status: 'ACTIVE',
      },
    ]);
    setShowAddModal(false);
    setNewSupplier({ name: '', contactPerson: '', phone: '', location: '', suppliedCategory: 'Tea & Agro' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={22} color="#0B4EA2" /> Supplier & Artisan Guild Directory
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Direct manufacturer partnerships, cooperative contacts, and procurement ledgers
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#0B4EA2', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Supplier
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
                <td style={{ color: '#64748b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {s.location}
                  </span>
                </td>
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
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate('/vendor/purchases')}
                  >
                    Purchase History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Add Supplier / Cooperative</h3>
            <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Contact Person</label>
                <input
                  type="text"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                <input
                  type="text"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Origin / Hub Location</label>
                <input
                  type="text"
                  value={newSupplier.location}
                  onChange={(e) => setNewSupplier({ ...newSupplier, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0B4EA2', color: '#FFF', fontWeight: 600 }}>
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
