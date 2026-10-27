// ==============================================================================
// EVEREST PASAL - VENDOR CATEGORY & MEASUREMENT UNIT MANAGEMENT
// Multi-level category trees, measurement units (kg, pcs, boxes, litres), and tax rates
// ==============================================================================

import React, { useState } from 'react';

export const VendorCategoryUnitPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'UNITS'>('CATEGORIES');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');

  const [categories, setCategories] = useState([
    { id: '1', name: 'Tea & Himalayan Agro', slug: 'tea-agro', productCount: 42, vatRate: '13%', status: 'ACTIVE' },
    { id: '2', name: 'Handmade Crafts & Statues', slug: 'handicrafts', productCount: 68, vatRate: '13%', status: 'ACTIVE' },
    { id: '3', name: 'Organic Grains & Spices', slug: 'organic-grains', productCount: 29, vatRate: '0% (Exempt)', status: 'ACTIVE' },
    { id: '4', name: 'Yak Wool Textiles & Shawls', slug: 'wool-textiles', productCount: 35, vatRate: '13%', status: 'ACTIVE' },
    { id: '5', name: 'Herbal Wellness & Oils', slug: 'herbal-oils', productCount: 19, vatRate: '13%', status: 'ACTIVE' },
  ]);

  const [units, setUnits] = useState([
    { id: '1', name: 'Pieces (Standard Single)', code: 'PCS', precision: 0, status: 'ACTIVE' },
    { id: '2', name: 'Kilograms', code: 'KG', precision: 2, status: 'ACTIVE' },
    { id: '3', name: 'Grams', code: 'GM', precision: 1, status: 'ACTIVE' },
    { id: '4', name: 'Litres', code: 'LTR', precision: 2, status: 'ACTIVE' },
    { id: '5', name: 'Carton / Box (Pack of 12)', code: 'BOX-12', precision: 0, status: 'ACTIVE' },
    { id: '6', name: 'Bundle / Dozen', code: 'DOZ', precision: 0, status: 'ACTIVE' },
  ]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories([
      ...categories,
      {
        id: String(Date.now()),
        name: newCatName,
        slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        vatRate: '13%',
        status: 'ACTIVE',
      },
    ]);
    setNewCatName('');
    setNewCatSlug('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    setUnits([
      ...units,
      {
        id: String(Date.now()),
        name: newUnitName,
        code: (newUnitCode || newUnitName.substring(0, 3)).toUpperCase(),
        precision: 0,
        status: 'ACTIVE',
      },
    ]);
    setNewUnitName('');
    setNewUnitCode('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#04382c' }}>📚 Category & Unit Specifications</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Configure product taxonomy, taxonomy groups, and standard inventory measurement units
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'CATEGORIES' ? '#04382c' : 'transparent',
              color: activeTab === 'CATEGORIES' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🗂️ Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('UNITS')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'UNITS' ? '#04382c' : 'transparent',
              color: activeTab === 'UNITS' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ⚖️ Measurement Units ({units.length})
          </button>
        </div>
      </div>

      {activeTab === 'CATEGORIES' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Categories Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 700, color: '#0f172a' }}>
              Active Category Taxonomies
            </div>
            <table className="table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug URL</th>
                  <th>Products</th>
                  <th>VAT Scheme</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td style={{ color: '#64748b' }}>/{cat.slug}</td>
                    <td><span className="badge badge-info">{cat.productCount} items</span></td>
                    <td>{cat.vatRate}</td>
                    <td><span className="badge badge-success">{cat.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Category Form */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>➕ Add New Category</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Category Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Traditional Nepali Jewellery"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>URL Slug</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. nepali-jewellery"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', backgroundColor: '#04382c' }}>
                Save Category
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Units Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 700, color: '#0f172a' }}>
              Standard Inventory Units of Measurement
            </div>
            <table className="table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Short Code</th>
                  <th>Decimal Precision</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><span className="badge badge-secondary">{u.code}</span></td>
                    <td>{u.precision} decimals</td>
                    <td><span className="badge badge-success">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Unit Form */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>➕ Register Measurement Unit</h3>
            <form onSubmit={handleAddUnit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Unit Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Metric Tonnes / Grams"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Short Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MT / GM"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', backgroundColor: '#04382c' }}>
                Save Unit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
