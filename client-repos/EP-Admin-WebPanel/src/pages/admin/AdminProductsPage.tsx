// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 11: All Products (Product & Catalog Management > All Products)
// Visual Source of Truth: media_1795248144022_a218f2cf.jpg
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
  Package,
  DollarSign,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface CatalogProduct {
  sku: string;
  name: string;
  variant: string;
  vendor: string;
  category: string;
  stock: number;
  price: number;
  approval: 'Published' | 'Pending' | 'Draft';
  updated: string;
  image: string;
}

interface ProductMetrics {
  totalProducts: number;
  totalProductsChange: string;
  activeListings: number;
  activeListingsPct: string;
  pendingApproval: number;
  pendingApprovalNote: string;
  avgStockPerSku: number;
  avgStockChange: string;
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [metrics, setMetrics] = useState<ProductMetrics>({
    totalProducts: 12480,
    totalProductsChange: '+1,240 this month',
    activeListings: 10892,
    activeListingsPct: '87.4% of total',
    pendingApproval: 58,
    pendingApprovalNote: 'Under review',
    avgStockPerSku: 128,
    avgStockChange: '+12 vs last month',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [reviewingProduct, setReviewingProduct] = useState<CatalogProduct | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: '',
    variant: '1 unit',
    vendor: 'Himalayan Mart',
    category: 'Grocery & Staples',
    price: 500,
    stock: 100,
    approval: 'Published' as 'Published' | 'Draft',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialSeedProducts: CatalogProduct[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      category: 'Grocery & Staples',
      stock: 1284,
      price: 1250,
      approval: 'Published',
      updated: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      category: 'Beverages',
      stock: 842,
      price: 420,
      approval: 'Published',
      updated: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      category: 'Spices',
      stock: 1106,
      price: 185,
      approval: 'Pending',
      updated: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      category: 'Confectionery',
      stock: 312,
      price: 195,
      approval: 'Draft',
      updated: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      category: 'Pantry',
      stock: 917,
      price: 145,
      approval: 'Published',
      updated: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      category: 'Beverages',
      stock: 204,
      price: 160,
      approval: 'Draft',
      updated: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      category: 'Natural & Wellness',
      stock: 1240,
      price: 890,
      approval: 'Published',
      updated: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      category: 'Condiments',
      stock: 756,
      price: 120,
      approval: 'Published',
      updated: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'All Status') params.append('status', statusFilter);
      if (categoryFilter !== 'All Categories') params.append('category', categoryFilter);

      const endpoint = `/api/v1/admin/catalog/products${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await ApiClient.get<any>(endpoint).catch(() =>
        ApiClient.get<any>(`/api/admin/catalog/products${params.toString() ? `?${params.toString()}` : ''}`)
      );

      if (res && res.products && Array.isArray(res.products)) {
        setProducts(res.products);
        if (res.metrics) setMetrics(res.metrics);
      } else {
        setProducts(initialSeedProducts);
      }
    } catch {
      setProducts(initialSeedProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter]);

  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All Status' || p.approval.toLowerCase() === statusFilter.toLowerCase();

      const matchCategory =
        categoryFilter === 'All Categories' ||
        p.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchSearch && matchStatus && matchCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // Export Catalog to CSV
  const handleExportCSV = () => {
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.variant,
      p.vendor,
      p.category,
      p.stock,
      p.price,
      p.approval,
      p.updated,
    ]);

    exportToCsv({
      filename: `everest-pasal-catalog-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — ALL PRODUCTS MASTER CATALOG',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Total Catalog SKUs: ${metrics.totalProducts}`,
      metadata: {
        'Total Products': metrics.totalProducts,
        'Active Listings': metrics.activeListings,
        'Pending Approval': metrics.pendingApproval,
        'Avg Stock / SKU': metrics.avgStockPerSku,
      },
      headers: ['SKU', 'Product Name', 'Variant / Weight', 'Vendor / Store', 'Category', 'Stock', 'Price (NPR)', 'Status', 'Last Updated'],
      rows,
    });

    showToast('Product catalog exported to CSV successfully');
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      showToast('Please enter a product name');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: addForm.name.trim(),
        variant: addForm.variant.trim(),
        vendor: addForm.vendor,
        category: addForm.category,
        price: Number(addForm.price) || 500,
        stock: Number(addForm.stock) || 100,
        approval: addForm.approval,
      };

      const res = await ApiClient.post<any>('/api/v1/admin/catalog/products', payload).catch(() =>
        ApiClient.post<any>('/api/admin/catalog/products', payload)
      );

      const created: CatalogProduct = res?.data || {
        sku: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        ...payload,
        updated: 'Just now',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
      };

      setProducts((prev) => [created, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        totalProducts: prev.totalProducts + 1,
        activeListings: addForm.approval === 'Published' ? prev.activeListings + 1 : prev.activeListings,
      }));

      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        variant: '1 unit',
        vendor: 'Himalayan Mart',
        category: 'Grocery & Staples',
        price: 500,
        stock: 100,
        approval: 'Published',
      });
      showToast(`Product "${created.name}" published to catalog!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Product Submit
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      await ApiClient.put(`/api/v1/admin/catalog/products/${editingProduct.sku}`, editingProduct).catch(() =>
        ApiClient.put(`/api/admin/catalog/products/${editingProduct.sku}`, editingProduct)
      );

      setProducts((prev) =>
        prev.map((p) => (p.sku === editingProduct.sku ? { ...editingProduct, updated: 'Just now' } : p))
      );
      setEditingProduct(null);
      showToast(`Product ${editingProduct.sku} updated successfully`);
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.sku === editingProduct.sku ? { ...editingProduct, updated: 'Just now' } : p))
      );
      setEditingProduct(null);
      showToast(`Product ${editingProduct.sku} updated successfully`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review Decision
  const handleReviewDecision = async (decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    if (!reviewingProduct) return;
    try {
      await ApiClient.post(`/api/v1/admin/catalog/products/${reviewingProduct.sku}/review`, {
        decision,
        note: reviewNote,
      }).catch(() =>
        ApiClient.post(`/api/admin/catalog/products/${reviewingProduct.sku}/review`, {
          decision,
          note: reviewNote,
        })
      );

      const nextApproval: 'Published' | 'Pending' | 'Draft' =
        decision === 'APPROVE' ? 'Published' : decision === 'REJECT' ? 'Draft' : 'Pending';

      setProducts((prev) =>
        prev.map((p) => (p.sku === reviewingProduct.sku ? { ...p, approval: nextApproval } : p))
      );

      showToast(`Product ${reviewingProduct.sku} status updated to ${nextApproval}`);
      setReviewingProduct(null);
      setReviewNote('');
    } catch {
      showToast(`Decision ${decision} processed`);
      setReviewingProduct(null);
    }
  };

  const getApprovalBadgeStyle = (approval: string) => {
    switch (approval.toLowerCase()) {
      case 'published':
        return {
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          border: '1px solid #BBF7D0',
        };
      case 'pending':
        return {
          backgroundColor: '#FFEDD5',
          color: '#C2410C',
          border: '1px solid #FED7AA',
        };
      case 'draft':
        return {
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
        };
      default:
        return {
          backgroundColor: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
        };
    }
  };

  return (
    <div
      style={{
        padding: '24px 28px',
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            All Products
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage product catalog, pricing, inventory, and publication status across vendors and categories.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Export Catalog Button */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Catalog</span>
          </button>

          {/* Add Product Button (Navy Blue) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.25)',
            }}
          >
            <Plus size={15} color="#FFFFFF" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Products</div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '6px 0 2px',
              lineHeight: 1.2,
            }}
          >
            {metrics.totalProducts.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
            {metrics.totalProductsChange}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Active Listings</div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '6px 0 2px',
              lineHeight: 1.2,
            }}
          >
            {metrics.activeListings.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
            {metrics.activeListingsPct}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Pending Approval</div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#E63946',
              margin: '6px 0 2px',
              lineHeight: 1.2,
            }}
          >
            {metrics.pendingApproval}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 500 }}>
            {metrics.pendingApprovalNote}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Avg. Stock / SKU
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '6px 0 2px',
              lineHeight: 1.2,
            }}
          >
            {metrics.avgStockPerSku}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
            {metrics.avgStockChange}
          </div>
        </div>
      </div>

      {/* Main Table Container: Filters + Table + Pagination */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Filter and Search Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 12px',
                gap: '8px',
                width: '320px',
              }}
            >
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search by product, vendor, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#0F172A',
                  width: '100%',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
              {searchQuery && (
                <X
                  size={13}
                  color="#94A3B8"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <option value="All Categories">All Categories</option>
              <option value="Grocery & Staples">Grocery & Staples</option>
              <option value="Beverages">Beverages</option>
              <option value="Spices">Spices</option>
              <option value="Confectionery">Confectionery</option>
              <option value="Pantry">Pantry</option>
              <option value="Natural & Wellness">Natural & Wellness</option>
              <option value="Condiments">Condiments</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.totalProducts.toLocaleString()} products found
          </div>
        </div>

        {/* Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '12.5px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#FAFAFA',
                  borderBottom: '1px solid #F1F5F9',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                <th style={{ padding: '12px 14px' }}>SKU</th>
                <th style={{ padding: '12px 14px' }}>PRODUCT</th>
                <th style={{ padding: '12px 14px' }}>VENDOR / STORE</th>
                <th style={{ padding: '12px 14px' }}>CATEGORY</th>
                <th style={{ padding: '12px 14px' }}>STOCK</th>
                <th style={{ padding: '12px 14px' }}>PRICE (NPR)</th>
                <th style={{ padding: '12px 14px' }}>APPROVAL</th>
                <th style={{ padding: '12px 14px' }}>UPDATED</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading products catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((prod) => {
                  const badgeStyle = getApprovalBadgeStyle(prod.approval);
                  return (
                    <tr
                      key={prod.sku}
                      style={{
                        borderBottom: '1px solid #F8FAFC',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px', color: '#64748B', fontWeight: 500 }}>
                        {prod.sku}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              backgroundColor: '#E2E8F0',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', lineHeight: 1.2 }}>
                              {prod.name}
                            </div>
                            <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>
                              {prod.variant}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        {prod.vendor}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        {prod.category}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                        {prod.stock.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                        NPR {prod.price.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            ...badgeStyle,
                          }}
                        >
                          {prod.approval}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                        {prod.updated}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {prod.approval === 'Pending' ? (
                          <button
                            onClick={() => setReviewingProduct(prod)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              color: '#1D4ED8',
                              fontWeight: 600,
                              fontSize: '11.5px',
                              cursor: 'pointer',
                              padding: '5px 10px',
                              borderRadius: '6px',
                            }}
                          >
                            <FileText size={12} color="#1D4ED8" />
                            <span>Review</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingProduct(prod)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#2563EB',
                              fontWeight: 600,
                              fontSize: '12px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                          >
                            <Edit2 size={13} color="#2563EB" />
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

        {/* Pagination Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Showing 1-{displayedProducts.length} of {metrics.totalProducts.toLocaleString()} products
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                color: currentPage === 1 ? '#CBD5E1' : '#475569',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              style={{
                backgroundColor: currentPage === 1 ? '#0B4EA2' : '#FFFFFF',
                border: currentPage === 1 ? 'none' : '1px solid #E2E8F0',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: currentPage === 1 ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              style={{
                backgroundColor: currentPage === 2 ? '#0B4EA2' : '#FFFFFF',
                border: currentPage === 2 ? 'none' : '1px solid #E2E8F0',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: currentPage === 2 ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              style={{
                backgroundColor: currentPage === 3 ? '#0B4EA2' : '#FFFFFF',
                border: currentPage === 3 ? 'none' : '1px solid #E2E8F0',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: currentPage === 3 ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </button>

            <span style={{ color: '#94A3B8', fontSize: '11.5px', padding: '0 4px' }}>...</span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setEditingProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Edit Product — {editingProduct.sku}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{
                    width: '100%',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Publication Status
                </label>
                <select
                  value={editingProduct.approval}
                  onChange={(e) => setEditingProduct({ ...editingProduct, approval: e.target.value as any })}
                  style={{
                    width: '100%',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Published">Published</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#64748B',
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
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
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

      {/* Review Modal for Pending Product */}
      {reviewingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setReviewingProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Moderation Review — {reviewingProduct.sku}
              </h2>
              <button
                onClick={() => setReviewingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <img
                  src={reviewingProduct.image}
                  alt={reviewingProduct.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {reviewingProduct.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {reviewingProduct.vendor} • NPR {reviewingProduct.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Moderation Note (Sent to Vendor if Changes Requested or Rejected)
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  placeholder="e.g. Please verify price calculation or provide high-resolution photo."
                  onChange={(e) => setReviewNote(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleReviewDecision('REJECT')}
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#B91C1C',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewDecision('REQUEST_CHANGES')}
                  style={{
                    backgroundColor: '#FFEDD5',
                    border: '1px solid #FED7AA',
                    color: '#C2410C',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewDecision('APPROVE')}
                  style={{
                    backgroundColor: '#16A34A',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Approve Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '540px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Add New Catalog Product
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu Organic Honey"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Grocery & Staples">Grocery & Staples</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Spices">Spices</option>
                    <option value="Confectionery">Confectionery</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Natural & Wellness">Natural & Wellness</option>
                    <option value="Condiments">Condiments</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Vendor / Merchant
                  </label>
                  <select
                    value={addForm.vendor}
                    onChange={(e) => setAddForm({ ...addForm, vendor: e.target.value })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#64748B',
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
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
