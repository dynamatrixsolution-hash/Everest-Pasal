// ==============================================================================
// EVEREST PASAL - VENDOR REPORTS & ANALYTICS
// Sales reports, daily revenue charts, profit & loss, and IRD Tax/VAT export
// ==============================================================================

import React, { useState } from 'react';

export const VendorReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>📊 Financial & Sales Intelligence Reports</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Daily turnover, top grossing SKUs, net profit margins, and VAT filing summaries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-control"
            style={{ width: '160px', fontSize: '13px' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month (Bhadra 2083)</option>
            <option value="THIS_YEAR">Fiscal Year 2083/84</option>
          </select>
          <button className="btn btn-secondary" style={{ fontSize: '13px' }}>
            📥 Export Excel / PDF
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Gross Merchandise Value (GMV)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#04382c', marginTop: '4px' }}>NPR 584,200</div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>↑ +18.4% vs last month</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Cost of Goods Sold (COGS)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569', marginTop: '4px' }}>NPR 342,000</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>58.5% of gross revenue</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Net Gross Profit</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>NPR 242,200</div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Margin: 41.5%</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>13% VAT Collected</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>NPR 75,946</div>
          <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>Ready for IRD E-Filing</div>
        </div>
      </div>

      {/* Top Selling Products Breakdown */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          🏆 Best Performing Products by Revenue
        </h3>
        <table className="table" style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product SKU & Title</th>
              <th>Units Sold</th>
              <th>Avg Price</th>
              <th>Total Revenue</th>
              <th>Gross Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge-success">#1</span></td>
              <td><strong>Handwoven Himalayan Yak Shawl</strong> (SHW-YAK-02)</td>
              <td>64 pcs</td>
              <td>NPR 2,800</td>
              <td style={{ fontWeight: 700, color: '#04382c' }}>NPR 179,200</td>
              <td><span className="badge badge-success">48%</span></td>
            </tr>
            <tr>
              <td><span className="badge badge-success">#2</span></td>
              <td><strong>Mustang Organic Black Tea (100g)</strong> (TEA-MUST-01)</td>
              <td>240 pcs</td>
              <td>NPR 450</td>
              <td style={{ fontWeight: 700, color: '#04382c' }}>NPR 108,000</td>
              <td><span className="badge badge-success">52%</span></td>
            </tr>
            <tr>
              <td><span className="badge badge-success">#3</span></td>
              <td><strong>Patan 7-Metal Singing Bowl</strong> (BWL-PAT-04)</td>
              <td>28 pcs</td>
              <td>NPR 3,400</td>
              <td style={{ fontWeight: 700, color: '#04382c' }}>NPR 95,200</td>
              <td><span className="badge badge-success">44%</span></td>
            </tr>
            <tr>
              <td><span className="badge badge-success">#4</span></td>
              <td><strong>Jumla Organic Marshi Rice (5kg)</strong> (RIC-JUM-05)</td>
              <td>60 pcs</td>
              <td>NPR 1,250</td>
              <td style={{ fontWeight: 700, color: '#04382c' }}>NPR 75,000</td>
              <td><span className="badge badge-success">35%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
