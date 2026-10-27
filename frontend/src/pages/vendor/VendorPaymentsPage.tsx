// ==============================================================================
// EVEREST PASAL - VENDOR PAYMENTS & FINANCIAL SETTLEMENTS
// Tender payment collection, marketplace escrow payouts, bank settlements & digital logs
// ==============================================================================

import React, { useState } from 'react';

export const VendorPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState([
    { id: 'TXN-88219', date: '2026-09-22 12:45', customer: 'Suman Shrestha', channel: 'FONEPAY (QR)', amount: 4850, type: 'POS_SALE', status: 'SETTLED' },
    { id: 'TXN-88218', date: '2026-09-22 11:20', customer: 'Aayush Adhikari', channel: 'ESEWA', amount: 2800, type: 'ONLINE_ORDER', status: 'SETTLED' },
    { id: 'TXN-88217', date: '2026-09-21 16:30', customer: 'Pooja Gurung', channel: 'CASH', amount: 1250, type: 'POS_SALE', status: 'SETTLED' },
    { id: 'TXN-88216', date: '2026-09-21 14:15', customer: 'Bikash Maharjan', channel: 'KHALTI', amount: 3400, type: 'POS_SALE', status: 'SETTLED' },
    { id: 'TXN-88215', date: '2026-09-20 09:00', customer: 'Everest Pasal Escrow Payout', channel: 'BANK_TRANSFER', amount: 78500, type: 'MARKETPLACE_PAYOUT', status: 'TRANSFERRED' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>💳 Payments, Tenders & Settlement Hub</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Real-time digital payment reconciliation, bank account payouts, and digital wallet logs
          </p>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#04382c' }}>
          🏦 Request Bank Payout (NPR 45,200 Available)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Collected (Today)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#04382c', marginTop: '4px' }}>NPR 12,300</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Escrow Balance (Unwithdrawn)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>NPR 45,200</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Bank Account Connected</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>Nabil Bank •••• 4892</div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Txn Reference</th>
              <th>Date & Time</th>
              <th>Customer / Entity</th>
              <th>Channel / Gateway</th>
              <th>Type</th>
              <th>Amount (NPR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td><strong>{tx.id}</strong></td>
                <td style={{ color: '#64748b' }}>{tx.date}</td>
                <td>{tx.customer}</td>
                <td>
                  <span className="badge badge-secondary">{tx.channel}</span>
                </td>
                <td><span className="badge badge-info">{tx.type}</span></td>
                <td style={{ fontWeight: 800, color: '#04382c' }}>NPR {tx.amount.toLocaleString()}</td>
                <td>
                  <span className="badge badge-success">{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
