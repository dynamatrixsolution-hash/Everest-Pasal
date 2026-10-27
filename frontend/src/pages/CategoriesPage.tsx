// ==============================================================================
// EVEREST PASAL - CATEGORIES PAGE COMPONENT (WF-001, FR-001)
// Public hierarchical taxonomy browsing with one-click catalog drilldown & admin creation
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useRouter, Link } from '../router/index.js';
import { StatusBadge } from '../components/Common/StatusBadge.js';
import { Modal } from '../components/Common/Modal.js';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  parent?: { name: string } | null;
  _count?: { productCategories: number };
}

export const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'VENDOR'].includes(r.role));

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<{ categories: CategoryItem[] }>('/api/categories');
      setCategories(res.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await ApiClient.post('/api/categories', {
        name,
        parentId: parentId || undefined,
        description: description || undefined,
      });
      setIsModalOpen(false);
      setName('');
      setParentId('');
      setDescription('');
      setSuccess('Category created successfully in database!');
      loadCategories();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '12px',
          padding: '24px 32px',
          marginBottom: '24px',
          border: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#38bdf8', fontWeight: 700 }}>
            🗂️ Marketplace Taxonomy
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', margin: '6px 0' }}>
            Product Categories & Collections
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '600px', margin: 0 }}>
            Explore authentic Nepali craft, agro-produce, Himalayan teas, handwoven textiles, and certified electronics by category.
          </p>
        </div>

        {canManage && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Category
          </button>
        )}
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <span>✅</span>
          <div>{success}</div>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {/* Grid of Interactive Category Cards */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
        Featured Collections
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Loading category collections...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/products?categoryId=${c.id}`)}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '10px',
                border: '1px solid #334155',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '28px' }}>🏔️</span>
                <span
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {c._count?.productCategories ?? 0} Products
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
                {c.name}
              </h3>

              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0', flex: 1, lineHeight: 1.4 }}>
                {c.description || 'Explore authentic handcrafted selections curated directly from Nepali artisans.'}
              </p>

              <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 600, marginTop: 'auto' }}>
                Browse Collection →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Category */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handmade Pottery"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category (Optional)</label>
            <select
              className="form-select"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Top Level Root Category)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
