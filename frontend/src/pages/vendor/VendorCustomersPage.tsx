// ==============================================================================
// EVEREST PASAL - VENDOR CUSTOMER DIRECTORY & CREDIT (UDHARO) LEDGER
// Customer contact cards, loyalty reward points, sales history, and credit balance
// ==============================================================================

import React, { useState } from 'react';

export const VendorCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Suman Shrestha', phone: '9841234567', email: 'suman.shrestha@gmail.com', totalOrders: 14, totalSpent: 42500, creditBalance: 0, loyaltyPoints: 420 },
    { id: '2', name: 'Aayush Adhikari', phone: '9851098765', email: 'aayush.a@outlook.com', totalOrders: 8, totalSpent: 28400, creditBalance: 3200, loyaltyPoints: 280 },
    { id: '3', name: 'Pooja Gurung', phone: '9803112233', email: 'pooja.g@gmail.com', totalOrders: 21, totalSpent: 89000, creditBalance: 0, loyaltyPoints: 890 },
    { id: '4', name: 'Bikash Maharjan', phone: '9818445566', email: 'bikash.m@hotmail.com', totalOrders: 5, totalSpent: 12500, creditBalance: 1500, loyaltyPoints: 120 },
  ]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>👥 Customer Directory & Loyalty</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Track customer contact books, lifetime value (LTV), store credit, and loyalty points
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Register Customer
        </button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search customer by name, phone number, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Total Orders</th>
              <th>Lifetime Spend</th>
              <th>Credit / Udharo</th>
              <th>Loyalty Points</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td style={{ color: '#64748b' }}>{c.email}</td>
                <td><span className="badge badge-info">{c.totalOrders} bills</span></td>
                <td style={{ fontWeight: 700, color: '#04382c' }}>NPR {c.totalSpent.toLocaleString()}</td>
                <td>
                  {c.creditBalance > 0 ? (
                    <span className="badge badge-danger">Due: NPR {c.creditBalance.toLocaleString()}</span>
                  ) : (
                    <span className="badge badge-success">Clear (NPR 0)</span>
                  )}
                </td>
                <td>⭐ {c.loyaltyPoints} pts</td>
                <td>
                  <button className="btn btn-sm btn-secondary">Ledger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
