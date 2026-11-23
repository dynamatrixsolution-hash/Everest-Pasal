// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 13: Categories (Product & Catalog Management > Categories)
// Visual Source of Truth: media_1795248144041_e68f8b10.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Edit2,
  FileText,
  X,
  Check,
  CheckCircle2,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface CategoryItem {
  id: string;
  name: string;
  productsCount: number;
  parent: string;
  hierarchy: string;
  products: number;
  visibility: 'Visible' | 'Hidden';
  status: 'Active' | 'Pending' | 'Draft';
  updated: string;
  image: string;
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [metrics] = useState({
    totalCategories: 128,
    totalCategoriesChange: '+12 this month',
    activeCategories: 112,
    activeCategoriesPct: '87.5% of total',
    pendingReview: 16,
    pendingReviewNote: 'Needs approval',
    avgProductsPerCategory: 98,
    avgProductsChange: '+8 vs last month',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('All Visibility');
  const [parentFilter, setParentFilter] = useState<string>('All Parents');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [reviewingCategory, setReviewingCategory] = useState<CategoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: '',
    parent: 'Root',
    hierarchy: '',
    visibility: 'Visible' as 'Visible' | 'Hidden',
    status: 'Active' as 'Active' | 'Draft',
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialSeedCategories: CategoryItem[] = [
    {
      id: 'CAT-001',
      name: 'Grocery & Staples',
      productsCount: 1284,
      parent: 'Root',
      hierarchy: 'Food & Pantry',
      products: 1284,
      visibility: 'Visible',
      status: 'Active',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-002',
      name: 'Beverages',
      productsCount: 842,
      parent: 'Root',
      hierarchy: 'Drinks & Refreshments',
      products: 842,
      visibility: 'Visible',
      status: 'Active',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-003',
      name: 'Spices',
      productsCount: 1106,
      parent: 'Grocery & Staples',
      hierarchy: 'Pantry & Seasonings',
      products: 1106,
      visibility: 'Visible',
      status: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-004',
      name: 'Confectionery',
      productsCount: 312,
      parent: 'Snacks & Treats',
      hierarchy: 'Sweets & Chocolates',
      products: 312,
      visibility: 'Visible',
      status: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-005',
      name: 'Pantry',
      productsCount: 917,
      parent: 'Grocery & Staples',
      hierarchy: 'Kitchen Staples',
      products: 917,
      visibility: 'Visible',
      status: 'Active',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-006',
      name: 'Beverages',
      productsCount: 204,
      parent: 'Root',
      hierarchy: 'Drinks & Refreshments',
      products: 204,
      visibility: 'Visible',
      status: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-007',
      name: 'Natural & Wellness',
      productsCount: 1240,
      parent: 'Root',
      hierarchy: 'Health & Supplements',
      products: 1240,
      visibility: 'Visible',
      status: 'Active',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CAT-008',
      name: 'Condiments',
      productsCount: 756,
      parent: 'Pantry',
      hierarchy: 'Sauces & Marinades',
      products: 756,
      visibility: 'Visible',
      status: 'Active',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/admin/catalog/categories');
      if (res && res.categories && res.categories.length > 0) {
        setCategories(
          res.categories.map((c: any) => ({
            ...c,
            products: c.products || c.productsCount || 0,
          }))
        );
      } else {
        setCategories(initialSeedCategories);
      }
    } catch {
      setCategories(initialSeedCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hierarchy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.parent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchVisibility =
        visibilityFilter === 'All Visibility' ||
        c.visibility.toLowerCase() === visibilityFilter.toLowerCase();

      const matchParent =
        parentFilter === 'All Parents' ||
        c.parent.toLowerCase() === parentFilter.toLowerCase();

      return matchSearch && matchVisibility && matchParent;
    });
  }, [categories, searchQuery, visibilityFilter, parentFilter]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCategories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await ApiClient.post<any>('/admin/catalog/categories', {
        ...addForm,
        hierarchy: addForm.hierarchy || addForm.name,
      });

      const newCategory: CategoryItem = {
        id: res?.id || `CAT-${String(categories.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        productsCount: 0,
        parent: addForm.parent,
        hierarchy: addForm.hierarchy || addForm.name,
        products: 0,
        visibility: addForm.visibility,
        status: addForm.status,
        updated: 'Just now',
        image: addForm.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
      };

      setCategories((prev) => [newCategory, ...prev]);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        parent: 'Root',
        hierarchy: '',
        visibility: 'Visible',
        status: 'Active',
        image: '',
      });
      showToast('Category created successfully');
    } catch {
      // Optimistic fallback
      const newCategory: CategoryItem = {
        id: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        productsCount: 0,
        parent: addForm.parent,
        hierarchy: addForm.hierarchy || addForm.name,
        products: 0,
        visibility: addForm.visibility,
        status: addForm.status,
        updated: 'Just now',
        image: addForm.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
      };
      setCategories((prev) => [newCategory, ...prev]);
      setIsAddModalOpen(false);
      showToast('Category created successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Category Handler
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSubmitting(true);
    try {
      await ApiClient.put(`/admin/catalog/categories/${editingCategory.id}`, editingCategory);
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...editingCategory, updated: 'Just now' } : c))
      );
      setEditingCategory(null);
      showToast(`Category ${editingCategory.id} updated successfully`);
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...editingCategory, updated: 'Just now' } : c))
      );
      setEditingCategory(null);
      showToast(`Category ${editingCategory.id} updated`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review Category Handler
  const handleReviewCategory = async (action: 'APPROVE' | 'REJECT') => {
    if (!reviewingCategory) return;
    setIsSubmitting(true);
    try {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      await ApiClient.put(`/admin/catalog/categories/${reviewingCategory.id}`, {
        status: nextStatus,
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === reviewingCategory.id ? { ...c, status: nextStatus, updated: 'Just now' } : c
        )
      );
      setReviewingCategory(null);
      showToast(action === 'APPROVE' ? 'Category approved and activated' : 'Category rejected');
    } catch {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      setCategories((prev) =>
        prev.map((c) =>
          c.id === reviewingCategory.id ? { ...c, status: nextStatus, updated: 'Just now' } : c
        )
      );
      setReviewingCategory(null);
      showToast(action === 'APPROVE' ? 'Category approved' : 'Category rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest-pasal-categories-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — CATEGORY DIRECTORY & HIERARCHY',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Total Categories: ${metrics.totalCategories}`,
      metadata: {
        'Total Categories': metrics.totalCategories,
        'Active Categories': metrics.activeCategories,
        'Pending Review': metrics.pendingReview,
        'Avg Products / Category': metrics.avgProductsPerCategory,
      },
      headers: ['ID', 'Category Name', 'Parent Category', 'Hierarchy Path', 'Products Count', 'Visibility', 'Status', 'Updated'],
      rows: filteredCategories.map((c) => [
        c.id,
        c.name,
        c.parent,
        c.hierarchy,
        c.products,
        c.visibility,
        c.status,
        c.updated,
      ]),
    });
    showToast('Exported categories to CSV');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Categories
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Organize category hierarchy, manage visibility, and review product distribution across active catalog categories.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #E2E8F0',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Categories</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0B4EA2',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Total Categories */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Total Categories
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.totalCategories}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.totalCategoriesChange}
          </div>
        </div>

        {/* Card 2: Active Categories */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Active Categories
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.activeCategories}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.activeCategoriesPct}
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.pendingReview}
          </div>
          <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 500 }}>
            {metrics.pendingReviewNote}
          </div>
        </div>

        {/* Card 4: Avg. Products / Category */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Avg. Products / Category
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.avgProductsPerCategory}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.avgProductsChange}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Filters and Search Row */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                maxWidth: '420px',
              }}
            >
              <Search
                size={15}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search categories, parents, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Visibility Dropdown */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Visibility">All Visibility</option>
              <option value="Visible">Visible</option>
              <option value="Hidden">Hidden</option>
            </select>

            {/* Parent Dropdown */}
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Parents">All Parents</option>
              <option value="Root">Root</option>
              <option value="Grocery & Staples">Grocery & Staples</option>
              <option value="Pantry">Pantry</option>
              <option value="Snacks & Treats">Snacks & Treats</option>
            </select>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            {filteredCategories.length} categories found
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredCategories.length > 0 &&
                      selectedIds.length === filteredCategories.length
                    }
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#E63946' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  ID
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  CATEGORY
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  PARENT
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  HIERARCHY
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  PRODUCTS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  VISIBILITY
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  UPDATED
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#0B4EA2" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No categories found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #F8FAFC',
                        backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          style={{ cursor: 'pointer', accentColor: '#E63946' }}
                        />
                      </td>

                      {/* ID */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                        {c.id}
                      </td>

                      {/* Category & Products count */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={c.image}
                            alt={c.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                              {c.products.toLocaleString()} products
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Parent */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                        {c.parent}
                      </td>

                      {/* Hierarchy */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>
                        {c.hierarchy}
                      </td>

                      {/* Products */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                        {c.products.toLocaleString()}
                      </td>

                      {/* Visibility */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: c.visibility === 'Visible' ? '#F0FDF4' : '#F1F5F9',
                            color: c.visibility === 'Visible' ? '#166534' : '#64748B',
                            border: `1px solid ${c.visibility === 'Visible' ? '#DCFCE7' : '#E2E8F0'}`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                          }}
                        >
                          {c.visibility}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {c.status === 'Active' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Active
                          </span>
                        ) : c.status === 'Pending' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#FEF3C7',
                              color: '#D97706',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Pending
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Updated */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B' }}>
                        {c.updated}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {c.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewingCategory(c)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#F0F9FF',
                              color: '#0284C7',
                              border: '1px solid #BAE6FD',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <FileText size={13} color="#0284C7" />
                            <span>Review</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingCategory({ ...c })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'transparent',
                              color: '#0284C7',
                              border: 'none',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} color="#0284C7" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing 1-{filteredCategories.length} of {metrics.totalCategories} categories
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: currentPage === 1 ? '#CBD5E1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#E63946',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              1
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              2
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Create New Category
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Dairy & Eggs"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Parent Category
                  </label>
                  <select
                    value={addForm.parent}
                    onChange={(e) => setAddForm({ ...addForm, parent: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Root">Root (Top Level)</option>
                    <option value="Grocery & Staples">Grocery & Staples</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Snacks & Treats">Snacks & Treats</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Hierarchy Path / Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Food & Pantry"
                    value={addForm.hierarchy}
                    onChange={(e) => setAddForm({ ...addForm, hierarchy: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Visibility
                  </label>
                  <select
                    value={addForm.visibility}
                    onChange={(e) => setAddForm({ ...addForm, visibility: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Visible">Visible</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Initial Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={addForm.image}
                  onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Edit Category: {editingCategory.name}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Parent Category
                  </label>
                  <select
                    value={editingCategory.parent}
                    onChange={(e) => setEditingCategory({ ...editingCategory, parent: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Root">Root</option>
                    <option value="Grocery & Staples">Grocery & Staples</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Snacks & Treats">Snacks & Treats</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Hierarchy Path
                  </label>
                  <input
                    type="text"
                    value={editingCategory.hierarchy}
                    onChange={(e) => setEditingCategory({ ...editingCategory, hierarchy: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Visibility
                  </label>
                  <select
                    value={editingCategory.visibility}
                    onChange={(e) => setEditingCategory({ ...editingCategory, visibility: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Visible">Visible</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={editingCategory.status}
                    onChange={(e) => setEditingCategory({ ...editingCategory, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Category Modal */}
      {reviewingCategory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Review Category: {reviewingCategory.name}
              </h3>
              <button
                onClick={() => setReviewingCategory(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}
              >
                <img
                  src={reviewingCategory.image}
                  alt={reviewingCategory.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {reviewingCategory.name} ({reviewingCategory.id})
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                    Parent: {reviewingCategory.parent} • Hierarchy: {reviewingCategory.hierarchy}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600, marginTop: '2px' }}>
                    {reviewingCategory.products.toLocaleString()} mapped products
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                This category was proposed by vendor operations and is awaiting administrator verification before publishing to the live marketplace catalog.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleReviewCategory('REJECT')}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    color: '#DC2626',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reject to Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewCategory('APPROVE')}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Approve & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
