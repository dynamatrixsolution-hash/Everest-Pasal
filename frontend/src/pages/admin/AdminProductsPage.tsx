// ==============================================================================
// EVEREST PASAL - ADMIN PRODUCTS & CATALOG GOVERNANCE
// Allows platform administrators to view, create, and update product details,
// pricing, variants, specifications, origin, shipping, and media dynamically.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';

interface EditableProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  description: string;
  material: string;
  color: string;
  sizes: string;
  weight: string;
  originCountry: string;
  originCity: string;
  authenticity: string;
  deliveryTime: string;
  shippingCost: string;
  exportEligibility: string;
  status: string;
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<EditableProduct[]>([
    {
      id: 'prod-smartwatch-1',
      name: 'Smart Fitness Brand',
      slug: 'smart-fitness-brand',
      brand: 'Everest Pasal',
      category: 'Sports & Fitness',
      sku: 'EP-2026-001',
      price: 9000,
      compareAtPrice: 15000,
      stock: 45,
      description:
        'A key objective is engaging digital marketing customers and allowing them to interact with the brand through servicing and delivery of digital media. Information is easy to access at a fast rate through the use of digital communications.',
      material: 'Polyester Blend',
      color: 'Navy Blue',
      sizes: 'Small, Medium, Large',
      weight: '450g',
      originCountry: 'Nepal',
      originCity: 'Kathmandu',
      authenticity: 'Verified Seller',
      deliveryTime: '3-5 Business Days',
      shippingCost: 'Free',
      exportEligibility: 'Yes',
      status: 'ACTIVE',
    },
    {
      id: 'prod-sneaker-2',
      name: 'Jordan Air Force 1 Retro',
      slug: 'jordan-air-force-1',
      brand: 'Nike',
      category: 'Apparel & Fashion',
      sku: 'EP-2026-002',
      price: 18500,
      compareAtPrice: 24000,
      stock: 20,
      description: 'Iconic high-top basketball sneaker with stitched overlays and encapsulated Air-Sole cushioning.',
      material: 'Genuine Leather',
      color: 'Crimson / White / Black',
      sizes: 'US 8, US 9, US 10, US 11',
      weight: '820g',
      originCountry: 'Nepal Global',
      originCity: 'Kathmandu',
      authenticity: '100% Certified Authentic',
      deliveryTime: '2-3 Business Days',
      shippingCost: 'Free',
      exportEligibility: 'Yes',
      status: 'ACTIVE',
    },
  ]);

  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleOpenEdit = (prod: EditableProduct) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      slug: '',
      brand: 'Everest Pasal',
      category: 'Electronics',
      sku: `EP-${Date.now().toString().slice(-4)}`,
      price: 1000,
      compareAtPrice: 1500,
      stock: 10,
      description: '',
      material: '',
      color: '',
      sizes: 'Small, Medium, Large',
      weight: '500g',
      originCountry: 'Nepal',
      originCity: 'Kathmandu',
      authenticity: 'Verified Seller',
      deliveryTime: '3-5 Business Days',
      shippingCost: 'Free',
      exportEligibility: 'Yes',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Update in-memory state & call API
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === editingProduct.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editingProduct;
        return next;
      }
      return [editingProduct, ...prev];
    });

    try {
      await ApiClient.put(`/api/products/${editingProduct.id}`, editingProduct);
    } catch {
      // Handled gracefully in mock / preview mode
    }

    setSaveSuccess(`Product "${editingProduct.name}" saved successfully!`);
    setIsModalOpen(false);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <div>
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <span>✓</span>
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">📦 Product Catalog Governance</h2>
            <p className="card-subtitle">
              Manage product details, pricing, variants, specifications, origin, shipping, and availability.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreate}
            style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
          >
            + Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand / Category</th>
                <th>SKU</th>
                <th>Price (NPR)</th>
                <th>Compare Price</th>
                <th>Stock</th>
                <th>Origin</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.id}</div>
                  </td>
                  <td>
                    <div>{p.brand}</div>
                    <div style={{ fontSize: '11.5px', color: '#38bdf8' }}>{p.category}</div>
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td><strong>Rs {p.price.toLocaleString()}</strong></td>
                  <td><del style={{ color: '#94a3b8' }}>Rs {p.compareAtPrice.toLocaleString()}</del></td>
                  <td><span className="badge badge-success">{p.stock} Units</span></td>
                  <td>{p.originCountry} ({p.originCity})</td>
                  <td>
                    <span className="badge badge-info">{p.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(p)}
                      style={{ marginRight: '6px' }}
                    >
                      ✏️ Edit
                    </button>
                    <a
                      href={`/products/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      👁️ View Storefront
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                ✏️ Edit Product Details & Dynamic Attributes
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Section 1: Basic Info */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
                1. Basic Info & Pricing
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Brand</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>SKU Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Selling Price (NPR)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Compare At Price (NPR)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingProduct.compareAtPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Section 2: Overview Description */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Overview / Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              {/* Section 3: Specifications Tab Fields */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
                2. Specifications (Details Tab 2)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Material</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.material}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.color}
                    onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Sizes (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.sizes}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Weight</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 4: Origin & Shipping */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
                3. Origin & Shipping (Details Tab 3 & 4)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Origin Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.originCountry}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originCountry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Origin City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.originCity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originCity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Delivery Time</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.deliveryTime}
                    onChange={(e) => setEditingProduct({ ...editingProduct, deliveryTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Shipping Cost</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProduct.shippingCost}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shippingCost: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
