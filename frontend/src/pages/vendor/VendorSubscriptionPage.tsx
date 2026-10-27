// ==============================================================================
// EVEREST PASAL - VENDOR SUBSCRIPTION & MARKETPLACE PLAN
// Merchant plan tiers, commission rates, billing cycle, and feature entitlements
// ==============================================================================

import React from 'react';

export const VendorSubscriptionPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>💳 Merchant Subscription & Tier</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Everest Pasal marketplace tier, platform commission rates, and API quotas
          </p>
        </div>
      </div>

      {/* Current Active Plan Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #04382c 0%, #065f46 100%)',
          color: '#ffffff',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
              CURRENT ACTIVE PLAN
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
              Growth Merchant Tier
            </h2>
            <p style={{ fontSize: '13px', color: '#a7f3d0', marginTop: '4px' }}>
              Valid until <strong>2083 Ashoj 15 (October 1, 2026)</strong> • Auto-renew active
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>NPR 4,999<span style={{ fontSize: '14px', fontWeight: 400 }}>/month</span></div>
            <div style={{ fontSize: '12px', color: '#a7f3d0' }}>Marketplace Take Rate: <strong>3.5%</strong></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '13px' }}>
          <div>✓ Unlimited Products & SKUs</div>
          <div>✓ Multi-Branch POS Billing</div>
          <div>✓ Real-time Inventory Ledger</div>
          <div>✓ Automated VAT Invoicing</div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Starter Artisan</h3>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#04382c', margin: '8px 0' }}>NPR 1,499<span style={{ fontSize: '12px', color: '#64748b' }}>/mo</span></div>
            <ul style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Up to 50 active products</li>
              <li>1 Branch POS Terminal</li>
              <li>Standard Escrow Payouts (T+3)</li>
              <li>5.0% Marketplace Commission</li>
            </ul>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '16px' }}>Switch Plan</button>
        </div>

        <div className="card" style={{ padding: '20px', border: '2px solid #059669', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-success">Recommended</span>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>Growth Merchant</h3>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#04382c', margin: '8px 0' }}>NPR 4,999<span style={{ fontSize: '12px', color: '#64748b' }}>/mo</span></div>
            <ul style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Unlimited Products & SKUs</li>
              <li>Up to 5 Branch POS Outlets</li>
              <li>Fast Next-Day Payouts (T+1)</li>
              <li>3.5% Marketplace Commission</li>
            </ul>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '16px', backgroundColor: '#04382c' }} disabled>
            Current Plan
          </button>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Enterprise Hub</h3>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#04382c', margin: '8px 0' }}>NPR 14,999<span style={{ fontSize: '12px', color: '#64748b' }}>/mo</span></div>
            <ul style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Custom Multi-Warehouse Routing</li>
              <li>Unlimited Branches & Staff</li>
              <li>Same-Day Instant Settlements</li>
              <li>2.0% Marketplace Commission</li>
            </ul>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '16px' }}>Upgrade to Enterprise</button>
        </div>
      </div>
    </div>
  );
};
