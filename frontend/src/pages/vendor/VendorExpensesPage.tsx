// ==============================================================================
// EVEREST PASAL - VENDOR EXPENSES & CASH OUTFLOW MANAGEMENT
// Track store rent, electricity, logistics, packaging materials, and petty cash
// ==============================================================================

import React, { useState } from 'react';

export const VendorExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState([
    { id: 'EXP-101', date: '2026-09-20', category: 'Rent & Premises', description: 'Kathmandu Store Monthly Rent (Bhadra)', amount: 45000, paidVia: 'BANK_TRANSFER', status: 'PAID' },
    { id: 'EXP-102', date: '2026-09-21', category: 'Logistics & Packaging', description: 'Eco-friendly Kraft delivery boxes (500 pcs)', amount: 12500, paidVia: 'ESEWA', status: 'PAID' },
    { id: 'EXP-103', date: '2026-09-21', category: 'Utilities', description: 'NEA Electricity & High-Speed Fiber Internet', amount: 4800, paidVia: 'FONEPAY', status: 'PAID' },
    { id: 'EXP-104', date: '2026-09-22', category: 'Petty Cash / Refreshments', description: 'Counter staff lunch & artisan tea supplies', amount: 1450, paidVia: 'CASH', status: 'PAID' },
  ]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>💵 Expense & Operating Cost Tracker</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Record store expenses, utility bills, packaging overheads, and petty cash outlays
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          ➕ Record Expense
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Expenses (This Month)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            NPR {totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Highest Expense Category</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
            🏢 Rent & Premises (70.5%)
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Voucher ID</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Payment Mode</th>
              <th>Amount (NPR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.id}</strong></td>
                <td style={{ color: '#64748b' }}>{e.date}</td>
                <td><span className="badge badge-secondary">{e.category}</span></td>
                <td>{e.description}</td>
                <td>{e.paidVia}</td>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>- NPR {e.amount.toLocaleString()}</td>
                <td><span className="badge badge-success">{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
