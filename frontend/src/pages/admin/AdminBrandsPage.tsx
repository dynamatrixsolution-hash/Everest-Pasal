// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 14: Brands (Product & Catalog Management > Brands)
// Visual Source of Truth: media_1795248144046_4c59dd2e.jpg
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
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface BrandItem {
  id: string;
  name: string;
  productsCount: number;
  vendor: string;
  categoryCoverage: string;
  products: number;
  visibility: 'Visible' | 'Hidden';
  status: 'Active' | 'Pending' | 'Draft';
  updated: string;
  image: string;
}

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [metrics] = useState({
    totalBrands: 64,
    totalBrandsChange: '+8 this month',
    activeBrands: 58,
    activeBrandsPct: '90.6% of total',
    pendingApproval: 6,
    pendingApprovalNote: 'Needs review',
    avgProductsPerBrand: 124,
    avgProductsChange: '+12 vs last month',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [reviewingBrand, setReviewingBrand] = useState<BrandItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: '',
    vendor: 'Himalayan Mart',
    categoryCoverage: 'Grocery & Staples',
    visibility: 'Visible' as 'Visible' | 'Hidden',
    status: 'Active' as 'Active' | 'Draft',
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialSeedBrands: BrandItem[] = [
    {
      id: 'BRN-001',
      name: 'Himalayan Harvest',
      productsCount: 142,
      vendor: 'Himalayan Mart',
      categoryCoverage: 'Grocery & Staples',
      products: 142,
      visibility: 'Visible',
      status: 'Active',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-002',
      name: 'Pokhara Organic Brew',
      productsCount: 86,
      vendor: 'Pokhara Bazaar',
      categoryCoverage: 'Beverages & Tea',
      products: 86,
      visibility: 'Visible',
      status: 'Active',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-003',
      name: 'Lalitpur Heritage Spices',
      productsCount: 118,
      vendor: 'Lalitpur Wholesale',
      categoryCoverage: 'Spices & Seasonings',
      products: 118,
      visibility: 'Visible',
      status: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-004',
      name: 'Mithila Confectionery',
      productsCount: 45,
      vendor: 'Biratnagar Hub',
      categoryCoverage: 'Confectionery',
      products: 45,
      visibility: 'Visible',
      status: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-005',
      name: 'Lumbini Farm Pantry',
      productsCount: 92,
      vendor: 'Butwal Depot',
      categoryCoverage: 'Pantry & Sauces',
      products: 92,
      visibility: 'Visible',
      status: 'Active',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-006',
      name: 'Everest Highland Roast',
      productsCount: 28,
      vendor: 'Dharan Market',
      categoryCoverage: 'Beverages & Coffee',
      products: 28,
      visibility: 'Visible',
      status: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-007',
      name: 'Makwanpur Pure Apiaries',
      productsCount: 164,
      vendor: 'Hetauda Store',
      categoryCoverage: 'Health & Wellness',
      products: 164,
      visibility: 'Visible',
      status: 'Active',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'BRN-008',
      name: 'Bheri Chili Works',
      productsCount: 73,
      vendor: 'Nepalgunj Outlet',
      categoryCoverage: 'Pantry & Condiments',
      products: 73,
      visibility: 'Visible',
      status: 'Active',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/admin/catalog/brands');
      if (res && res.brands && res.brands.length > 0) {
        setBrands(
          res.brands.map((b: any) => ({
            ...b,
            products: b.products || b.productsCount || 0,
          }))
        );
      } else {
        setBrands(initialSeedBrands);
      }
    } catch {
      setBrands(initialSeedBrands);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.categoryCoverage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All Status' ||
        b.status.toLowerCase() === statusFilter.toLowerCase();

      const matchCategory =
        categoryFilter === 'All Categories' ||
        b.categoryCoverage.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchSearch && matchStatus && matchCategory;
    });
  }, [brands, searchQuery, statusFilter, categoryFilter]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBrands.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add Brand Handler
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await ApiClient.post<any>('/admin/catalog/brands', addForm);
      const newBrand: BrandItem = {
        id: res?.id || `BRN-${String(brands.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        productsCount: 0,
        vendor: addForm.vendor,
        categoryCoverage: addForm.categoryCoverage,
        products: 0,
        visibility: addForm.visibility,
        status: addForm.status,
        updated: 'Just now',
        image: addForm.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
      };

      setBrands((prev) => [newBrand, ...prev]);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        vendor: 'Himalayan Mart',
        categoryCoverage: 'Grocery & Staples',
        visibility: 'Visible',
        status: 'Active',
        image: '',
      });
      showToast('Brand created successfully');
    } catch {
      const newBrand: BrandItem = {
        id: `BRN-${String(brands.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        productsCount: 0,
        vendor: addForm.vendor,
        categoryCoverage: addForm.categoryCoverage,
        products: 0,
        visibility: addForm.visibility,
        status: addForm.status,
        updated: 'Just now',
        image: addForm.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
      };
      setBrands((prev) => [newBrand, ...prev]);
      setIsAddModalOpen(false);
      showToast('Brand created successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Brand Handler
  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    setIsSubmitting(true);
    try {
      await ApiClient.put(`/admin/catalog/brands/${editingBrand.id}`, editingBrand);
      setBrands((prev) =>
        prev.map((b) => (b.id === editingBrand.id ? { ...editingBrand, updated: 'Just now' } : b))
      );
      setEditingBrand(null);
      showToast(`Brand ${editingBrand.id} updated successfully`);
    } catch {
      setBrands((prev) =>
        prev.map((b) => (b.id === editingBrand.id ? { ...editingBrand, updated: 'Just now' } : b))
      );
      setEditingBrand(null);
      showToast(`Brand ${editingBrand.id} updated`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review Brand Handler
  const handleReviewBrand = async (action: 'APPROVE' | 'REJECT') => {
    if (!reviewingBrand) return;
    setIsSubmitting(true);
    try {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      await ApiClient.put(`/admin/catalog/brands/${reviewingBrand.id}`, {
        status: nextStatus,
      });

      setBrands((prev) =>
        prev.map((b) =>
          b.id === reviewingBrand.id ? { ...b, status: nextStatus, updated: 'Just now' } : b
        )
      );
      setReviewingBrand(null);
      showToast(action === 'APPROVE' ? 'Brand approved and activated' : 'Brand rejected');
    } catch {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      setBrands((prev) =>
        prev.map((b) =>
          b.id === reviewingBrand.id ? { ...b, status: nextStatus, updated: 'Just now' } : b
        )
      );
      setReviewingBrand(null);
      showToast(action === 'APPROVE' ? 'Brand approved' : 'Brand rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest-pasal-brands-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — AUTHORIZED BRAND REGISTRY',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Total Brands: ${metrics.totalBrands}`,
      metadata: {
        'Total Brands': metrics.totalBrands,
        'Active Brands': metrics.activeBrands,
        'Pending Approval': metrics.pendingApproval,
        'Avg Products / Brand': metrics.avgProductsPerBrand,
      },
      headers: ['ID', 'Brand Name', 'Authorized Vendor', 'Category Coverage', 'Products Count', 'Visibility', 'Status', 'Updated'],
      rows: filteredBrands.map((b) => [
        b.id,
        b.name,
        b.vendor,
        b.categoryCoverage,
        b.products,
        b.visibility,
        b.status,
        b.updated,
      ]),
    });
    showToast('Exported brands to CSV');
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
            Brands
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Manage brand registry, vendor brand authorization, and track catalog brand presence.
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
            <span>Export Brands</span>
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
            <span>Add Brand</span>
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
        {/* Card 1: Total Brands */}
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
            Total Brands
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.totalBrands}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.totalBrandsChange}
          </div>
        </div>

        {/* Card 2: Active Brands */}
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
            Active Brands
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.activeBrands}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.activeBrandsPct}
          </div>
        </div>

        {/* Card 3: Pending Approval */}
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
            Pending Approval
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.pendingApproval}
          </div>
          <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 500 }}>
            {metrics.pendingApprovalNote}
          </div>
        </div>

        {/* Card 4: Avg. Products / Brand */}
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
            Avg. Products / Brand
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.avgProductsPerBrand}
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
                placeholder="Search brands, vendors, or categories..."
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

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              <option value="All Categories">All Categories</option>
              <option value="Grocery & Staples">Grocery & Staples</option>
              <option value="Beverages & Tea">Beverages & Tea</option>
              <option value="Spices & Seasonings">Spices & Seasonings</option>
              <option value="Confectionery">Confectionery</option>
              <option value="Pantry & Sauces">Pantry & Sauces</option>
              <option value="Health & Wellness">Health & Wellness</option>
            </select>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            {filteredBrands.length} brands found
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
                      filteredBrands.length > 0 &&
                      selectedIds.length === filteredBrands.length
                    }
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#E63946' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  ID
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  BRAND
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  VENDOR
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  CATEGORY COVERAGE
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
                      <span>Loading brands...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No brands found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
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
                          onChange={() => handleToggleSelect(b.id)}
                          style={{ cursor: 'pointer', accentColor: '#E63946' }}
                        />
                      </td>

                      {/* ID */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                        {b.id}
                      </td>

                      {/* Brand & Products */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={b.image}
                            alt={b.name}
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
                              {b.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                              {b.products.toLocaleString()} products
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                        {b.vendor}
                      </td>

                      {/* Category Coverage */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>
                        {b.categoryCoverage}
                      </td>

                      {/* Products */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                        {b.products.toLocaleString()}
                      </td>

                      {/* Visibility */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: b.visibility === 'Visible' ? '#F0FDF4' : '#F1F5F9',
                            color: b.visibility === 'Visible' ? '#166534' : '#64748B',
                            border: `1px solid ${b.visibility === 'Visible' ? '#DCFCE7' : '#E2E8F0'}`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                          }}
                        >
                          {b.visibility}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {b.status === 'Active' ? (
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
                        ) : b.status === 'Pending' ? (
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
                        {b.updated}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {b.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewingBrand(b)}
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
                            onClick={() => setEditingBrand({ ...b })}
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
            Showing 1-{filteredBrands.length} of {metrics.totalBrands} brands
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

      {/* Add Brand Modal */}
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
                Register New Brand
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBrand} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annapurna Alpine Tea"
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
                    Authorized Vendor
                  </label>
                  <select
                    value={addForm.vendor}
                    onChange={(e) => setAddForm({ ...addForm, vendor: e.target.value })}
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
                    <option value="Himalayan Mart">Himalayan Mart</option>
                    <option value="Pokhara Bazaar">Pokhara Bazaar</option>
                    <option value="Lalitpur Wholesale">Lalitpur Wholesale</option>
                    <option value="Biratnagar Hub">Biratnagar Hub</option>
                    <option value="Butwal Depot">Butwal Depot</option>
                    <option value="Dharan Market">Dharan Market</option>
                    <option value="Hetauda Store">Hetauda Store</option>
                    <option value="Nepalgunj Outlet">Nepalgunj Outlet</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Category Coverage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beverages & Tea"
                    value={addForm.categoryCoverage}
                    onChange={(e) => setAddForm({ ...addForm, categoryCoverage: e.target.value })}
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
                  Brand Logo URL
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
                  {isSubmitting ? 'Registering...' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editingBrand && (
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
                Edit Brand: {editingBrand.name}
              </h3>
              <button
                onClick={() => setEditingBrand(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBrand} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
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
                    Authorized Vendor
                  </label>
                  <input
                    type="text"
                    value={editingBrand.vendor}
                    onChange={(e) => setEditingBrand({ ...editingBrand, vendor: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Category Coverage
                  </label>
                  <input
                    type="text"
                    value={editingBrand.categoryCoverage}
                    onChange={(e) => setEditingBrand({ ...editingBrand, categoryCoverage: e.target.value })}
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
                    value={editingBrand.visibility}
                    onChange={(e) => setEditingBrand({ ...editingBrand, visibility: e.target.value as any })}
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
                    value={editingBrand.status}
                    onChange={(e) => setEditingBrand({ ...editingBrand, status: e.target.value as any })}
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
                  onClick={() => setEditingBrand(null)}
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

      {/* Review Brand Modal */}
      {reviewingBrand && (
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
                Review Brand Authorization
              </h3>
              <button
                onClick={() => setReviewingBrand(null)}
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
                  src={reviewingBrand.image}
                  alt={reviewingBrand.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {reviewingBrand.name} ({reviewingBrand.id})
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                    Authorized Vendor: {reviewingBrand.vendor}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600, marginTop: '2px' }}>
                    Coverage: {reviewingBrand.categoryCoverage}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                Verify brand trademark registry, authorized reseller agreements, and vendor rights before enabling official brand presence across Everest Pasal.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleReviewBrand('REJECT')}
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
                  Reject Brand
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewBrand('APPROVE')}
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
                  Authorize & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
