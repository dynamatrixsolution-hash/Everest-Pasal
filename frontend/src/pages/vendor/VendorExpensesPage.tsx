// ==============================================================================
// EVEREST PASAL - VENDOR EXPENSES & CASH OUTFLOW MANAGEMENT
// Track store rent, electricity, logistics, packaging materials, and petty cash
// ==============================================================================

import React, { useState } from 'react';
import { Receipt, Plus, Building2, TrendingDown } from 'lucide-react';

export const VendorExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState([
    { id: 'EXP-101', date: '2026-09-20', category: 'Rent & Premises', description: 'Kathmandu Store Monthly Rent (Bhadra)', amount: 45000, paidVia: 'BANK_TRANSFER', status: 'PAID' },
    { id: 'EXP-102', date: '2026-09-21', category: 'Logistics & Packaging', description: 'Eco-friendly Kraft delivery boxes (500 pcs)', amount: 12500, paidVia: 'ESEWA', status: 'PAID' },
    { id: 'EXP-103', date: '2026-09-21', category: 'Utilities', description: 'NEA Electricity & High-Speed Fiber Internet', amount: 4800, paidVia: 'FONEPAY', status: 'PAID' },
    { id: 'EXP-104', date: '2026-09-22', category: 'Petty Cash / Refreshments', description: 'Counter staff lunch & artisan tea supplies', amount: 1450, paidVia: 'CASH', status: 'PAID' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Logistics & Packaging',
    description: '',
    amount: '',
    paidVia: 'ESEWA',
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description.trim() || !newExp.amount) return;
    const item = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      category: newExp.category,
      description: newExp.description,
      amount: Number(newExp.amount),
      paidVia: newExp.paidVia,
      status: 'PAID',
    };
    setExpenses([item, ...expenses]);
    setShowAddModal(false);
    setNewExp({ category: 'Logistics & Packaging', description: '', amount: '', paidVia: 'ESEWA' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={22} color="#0B4EA2" /> Expense & Operating Cost Tracker
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Record store expenses, utility bills, packaging overheads, and petty cash outlays
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: '#0B4EA2', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Record Expense
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
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#475569" /> Rent & Premises (70.5%)
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

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Record Operating Expense</h3>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Expense Category *</label>
                <select
                  className="form-control"
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                >
                  <option value="Rent & Premises">Rent & Premises</option>
                  <option value="Logistics & Packaging">Logistics & Packaging</option>
                  <option value="Utilities">Utilities & Internet</option>
                  <option value="Petty Cash / Refreshments">Petty Cash / Refreshments</option>
                  <option value="Marketing & Promotion">Marketing & Promotion</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Description / Note *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier packaging tape and bubble wraps"
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Amount (NPR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2500"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Payment Mode</label>
                <select
                  className="form-control"
                  value={newExp.paidVia}
                  onChange={(e) => setNewExp({ ...newExp, paidVia: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                >
                  <option value="ESEWA">eSewa Wallet</option>
                  <option value="FONEPAY">Fonepay QR</option>
                  <option value="BANK_TRANSFER">Bank Direct Transfer</option>
                  <option value="CASH">Cash Drawer</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0B4EA2', color: '#FFF', fontWeight: 600 }}>
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
