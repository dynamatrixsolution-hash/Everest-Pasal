// ==============================================================================
// EVEREST PASAL - VENDOR SETTINGS & STORE PROFILE
// Store details, PAN/VAT registration, POS thermal printer configs & payout accounts
// ==============================================================================

import React, { useState } from 'react';

export const VendorSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState('Himalayan Goods & Crafts Co.');
  const [panNumber, setPanNumber] = useState('609821435');
  const [contactEmail, setContactEmail] = useState('vendor@himalayan-goods.com.np');
  const [contactPhone, setContactPhone] = useState('+977 1 4423890');
  const [address, setAddress] = useState('Ward 29, Thamel Marg, Kathmandu');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for supporting authentic Nepali artisans! Visit again.');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>⚙️ Store Settings & Governance</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Merchant organization profile, legal PAN/VAT registration, and billing configurations
          </p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success">
          ✅ Store settings updated and synchronized across all POS counters!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* General Store Details */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            🏢 Store Business Profile
          </h2>

          <div>
            <label className="form-label">Store Trading Name</label>
            <input
              type="text"
              className="form-control"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">PAN / VAT Registration No.</label>
              <input
                type="text"
                className="form-control"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Official Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Support Email Address</label>
            <input
              type="email"
              className="form-control"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Physical Registered Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', backgroundColor: '#04382c' }}>
            Save Store Profile
          </button>
        </div>

        {/* POS & Receipt Customization */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            🖨️ POS Receipt & Thermal Printer
          </h2>

          <div>
            <label className="form-label">Thermal Printer Model</label>
            <select className="form-control">
              <option>80mm Standard Thermal Paper (ESC/POS)</option>
              <option>58mm Compact Receipt Printer</option>
              <option>A4 Laser / Inkjet Invoice</option>
            </select>
          </div>

          <div>
            <label className="form-label">Receipt Footer Message</label>
            <textarea
              className="form-control"
              rows={3}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
            />
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>VAT Invoice Compliance:</div>
            <div>• Auto-generates IRD compliant fiscal QR code</div>
            <div>• Synchronized with Everest Pasal audit trail engine</div>
          </div>
        </div>
      </form>
    </div>
  );
};
