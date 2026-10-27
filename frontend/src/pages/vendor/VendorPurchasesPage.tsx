// ==============================================================================
// EVEREST PASAL - VENDOR PURCHASE & SUPPLIER PROCUREMENT
// Purchase orders, GRN (Goods Received Notes), supplier bills, and inventory receiving
// ==============================================================================

import React, { useState } from 'react';

export const VendorPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState([
    { id: 'PO-2026-001', supplier: 'Ilam Tea Planters Co-op', date: '2026-09-18', items: 3, totalAmount: 45000, paidAmount: 45000, paymentStatus: 'PAID', status: 'RECEIVED' },
    { id: 'PO-2026-002', supplier: 'Mustang Artisan Guild', date: '2026-09-20', items: 8, totalAmount: 120000, paidAmount: 60000, paymentStatus: 'PARTIAL', status: 'RECEIVED' },
    { id: 'PO-2026-003', supplier: 'Bhaktapur Pottery Syndicate', date: '2026-09-21', items: 5, totalAmount: 32000, paidAmount: 0, paymentStatus: 'UNPAID', status: 'ORDERED' },
    { id: 'PO-2026-004', supplier: 'Jumla Agro Organic Producers', date: '2026-09-22', items: 12, totalAmount: 85000, paidAmount: 85000, paymentStatus: 'PAID', status: 'RECEIVED' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>🛒 Purchase & Inward Procurement</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage supplier purchase orders, stock receipts (GRN), and wholesale bills
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Create Purchase Order
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Purchases (This Month)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#04382c', marginTop: '4px' }}>NPR 282,000</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Paid to Suppliers</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>NPR 190,000</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Accounts Payable (Pending)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>NPR 92,000</div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier Name</th>
              <th>Order Date</th>
              <th>Items Count</th>
              <th>Total Bill</th>
              <th>Payment Status</th>
              <th>Receipt Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((po) => (
              <tr key={po.id}>
                <td><strong>{po.id}</strong></td>
                <td>{po.supplier}</td>
                <td style={{ color: '#64748b' }}>{po.date}</td>
                <td>{po.items} SKUs</td>
                <td style={{ fontWeight: 700 }}>NPR {po.totalAmount.toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      po.paymentStatus === 'PAID' ? 'badge-success' : po.paymentStatus === 'PARTIAL' ? 'badge-warning' : 'badge-danger'
                    }`}
                  >
                    {po.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${po.status === 'RECEIVED' ? 'badge-success' : 'badge-info'}`}>
                    {po.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary">View Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
