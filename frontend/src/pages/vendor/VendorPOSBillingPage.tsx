// ==============================================================================
// EVEREST PASAL - VENDOR POINT OF SALE (POS) BILLING
// Real-time counter billing, barcode/SKU search, discounts, payment splits & receipts
// ==============================================================================

import React, { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  taxRate: number;
}

export const VendorPOSBillingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CARD'>('CASH');
  const [posCart, setPosCart] = useState<CartItem[]>([
    { id: '1', name: 'Mustang Organic Black Tea (100g)', sku: 'TEA-MUST-01', price: 450, qty: 2, taxRate: 0.13 },
    { id: '2', name: 'Handwoven Himalayan Yak Shawl', sku: 'SHW-YAK-02', price: 2800, qty: 1, taxRate: 0.13 },
  ]);
  const [billSuccess, setBillSuccess] = useState<string | null>(null);

  const inventoryItems = [
    { id: '1', name: 'Mustang Organic Black Tea (100g)', sku: 'TEA-MUST-01', category: 'Tea & Agro', price: 450, stock: 48 },
    { id: '2', name: 'Handwoven Himalayan Yak Shawl', sku: 'SHW-YAK-02', category: 'Handicrafts', price: 2800, stock: 15 },
    { id: '3', name: 'Ilam Golden Tips Green Tea (250g)', sku: 'TEA-ILM-03', category: 'Tea & Agro', price: 650, stock: 32 },
    { id: '4', name: 'Patan Handmade Singing Bowl 7-Metal', sku: 'BWL-PAT-04', category: 'Handicrafts', price: 3400, stock: 9 },
    { id: '5', name: 'Authentic Jumla Organic Marshi Rice (5kg)', sku: 'RIC-JUM-05', category: 'Organic Grains', price: 1250, stock: 24 },
    { id: '6', name: 'Bhaktapur Natural Clay Pot Set', sku: 'POT-BHK-06', category: 'Handicrafts', price: 850, stock: 18 },
  ];

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (item: typeof inventoryItems[0]) => {
    setPosCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, sku: item.sku, price: item.price, qty: 1, taxRate: 0.13 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setPosCart((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const vatAmount = taxableAmount * 0.13;
  const grandTotal = taxableAmount + vatAmount;

  const handleCompleteSale = () => {
    if (posCart.length === 0) return;
    const invoiceNo = `INV-POS-${Math.floor(100000 + Math.random() * 900000)}`;
    setBillSuccess(invoiceNo);
    setPosCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* POS Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>⚡ POS Terminal & Fast Billing</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Instant barcode lookup, multi-tender settlement, VAT invoice printing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            🟢 Counter: Kathmandu Flagship Store (Terminal #01)
          </span>
        </div>
      </div>

      {billSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>✅ Invoice Created Successfully!</strong> Invoice #{billSuccess} generated and sent to customer receipt printer.
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setBillSuccess(null)}>
            New Order
          </button>
        </div>
      )}

      {/* POS Grid: Product Catalog Left + Cart Summary Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Product Selector */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search product by Name or scan Barcode (SKU)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Tea & Agro">Tea & Agro</option>
              <option value="Handicrafts">Handicrafts</option>
              <option value="Organic Grains">Organic Grains</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.category}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', margin: '4px 0' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>SKU: {item.sku}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#04382c', fontSize: '14px' }}>NPR {item.price.toLocaleString()}</span>
                  <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    {item.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Current Bill & Checkout */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            🛒 Current Sale ({posCart.reduce((sum, i) => sum + i.qty, 0)} Items)
          </h2>

          {/* Customer Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ fontSize: '12px' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Phone (98XXXXXXXX)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Cart Item List */}
          <div style={{ minHeight: '180px', maxHeight: '240px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '8px' }}>
            {posCart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px' }}>
                Cart is empty. Click products from catalog to bill.
              </div>
            ) : (
              posCart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 4px',
                    borderBottom: '1px solid #f8fafc',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '10px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>NPR {item.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px' }} onClick={() => updateQty(item.id, -1)}>
                      -
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px' }} onClick={() => updateQty(item.id, 1)}>
                      +
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right', color: '#04382c' }}>
                      NPR {(item.price * item.qty).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Math */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>NPR {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
              <span>Discount %</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  style={{ width: '60px', padding: '2px 6px', fontSize: '12px' }}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
                <span>(-NPR {discountAmount.toLocaleString()})</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>13% VAT Tax</span>
              <span>NPR {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', color: '#04382c', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              <span>Grand Total</span>
              <span>NPR {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tender Payment Method:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['CASH', 'ESEWA', 'KHALTI', 'FONEPAY', 'CARD'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: paymentMethod === method ? '2px solid #059669' : '1px solid #cbd5e1',
                    backgroundColor: paymentMethod === method ? '#ecfdf5' : '#ffffff',
                    color: paymentMethod === method ? '#065f46' : '#334155',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {method === 'CASH' && '💵 '}
                  {method === 'ESEWA' && '🟢 '}
                  {method === 'KHALTI' && '🟣 '}
                  {method === 'FONEPAY' && '🔴 '}
                  {method === 'CARD' && '💳 '}
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Complete Bill Action */}
          <button
            onClick={handleCompleteSale}
            disabled={posCart.length === 0}
            style={{
              backgroundColor: '#04382c',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              cursor: posCart.length === 0 ? 'not-allowed' : 'pointer',
              opacity: posCart.length === 0 ? 0.6 : 1,
              marginTop: '4px',
            }}
          >
            🖨️ Pay & Print Bill (NPR {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })})
          </button>
        </div>
      </div>
    </div>
  );
};
