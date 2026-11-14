// ==============================================================================
// EVEREST PASAL - VENDOR PRODUCTS MANAGEMENT PAGE
// Exact pixel-perfect implementation of:
// 1. products-table-view.png (Table view with 5 KPI cards, multi-filters, bulk selection, 8 rows, pagination)
// 2. products-grid-view.png (Grid 4x2 view with cards, image, title, SKU, category, price, stock, status, sales)
// 3. products-quick-view-drawer.png (Slide-over drawer with 3 sales metrics, gallery, specs, description, actions)
// 4. products-delete-modal.png (Delete confirmation modal with warning banner on stock & pending orders)
// 5. products-empty-state.png (Empty state view with package icon, call to action, and guide link)
// Typography: Poppins font family
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { Skeleton, SkeletonStatCards, SkeletonTable } from '../../components/Common/Skeleton.js';
import { uploadImageFile, exportToCsv } from '../../utils/documentExport.js';
import { UploadCloud, ImagePlus, Download } from 'lucide-react';

export interface VendorProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  sale_price?: number | null;
  original_price?: number | null;
  stock_units: number;
  stock_status: string;
  status: 'Published' | 'Pending review' | 'Draft' | 'Unpublished';
  approval_status: string;
  sales_count: number;
  revenue: string;
  brand: string;
  variants_count?: number;
  variants_label?: string;
  updated_at: string;
  image: string;
  images?: string[];
  description?: string;
  total_sold?: number;
  last_30_days_sold?: number;
  pending_orders?: number;
}

export interface ProductMetrics {
  totalProducts: number;
  published: number;
  drafts: number;
  lowStock: number;
  pendingApproval: number;
}

const INITIAL_MOCK_PRODUCTS: VendorProduct[] = [
  {
    id: 'prd-001',
    title: 'Premium Basmati Rice',
    sku: 'EP-RICE-001',
    category: 'Groceries',
    price: 500,
    sale_price: 450,
    original_price: 500,
    stock_units: 124,
    stock_status: 'In stock',
    status: 'Published',
    approval_status: 'Approved',
    sales_count: 124,
    revenue: 'NPR 62K',
    brand: 'Himalayan Harvest',
    variants_label: '2 sizes (1kg, 5kg)',
    updated_at: 'Today, 10:32 AM',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Premium long-grain basmati rice sourced from the fertile plains of Nepal. Perfect for biryani, pulao, and everyday cooking.',
    total_sold: 124,
    last_30_days_sold: 42,
    pending_orders: 12,
  },
  {
    id: 'prd-002',
    title: 'Himalayan Organic Honey',
    sku: 'EP-HONEY-002',
    category: 'Food & Beverages',
    price: 850,
    stock_units: 45,
    stock_status: 'In stock',
    status: 'Published',
    approval_status: 'Approved',
    sales_count: 98,
    revenue: 'NPR 83.3K',
    brand: 'Annapurna Organics',
    variants_label: '500g Jar',
    updated_at: 'Today, 9:15 AM',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Pure wildflower organic honey ethically gathered from high-altitude Himalayan beehives with natural enzymes and aroma.',
    total_sold: 98,
    last_30_days_sold: 34,
    pending_orders: 6,
  },
  {
    id: 'prd-003',
    title: 'Nepali Green Tea',
    sku: 'EP-TEA-003',
    category: 'Beverages',
    price: 280,
    original_price: 320,
    sale_price: 280,
    stock_units: 6,
    stock_status: 'Low stock',
    status: 'Published',
    approval_status: 'Approved',
    sales_count: 76,
    revenue: 'NPR 21.2K',
    brand: 'Ilam Tea Garden',
    variants_label: '250g Tin Canister',
    updated_at: 'Yesterday',
    image: '/images/hero_tea_coffee.jpg',
    images: [
      '/images/hero_tea_coffee.jpg',
    ],
    description: 'First flush organic orthodox green tea handpicked in the misty hills of Ilam. Rich in natural antioxidants.',
    total_sold: 76,
    last_30_days_sold: 22,
    pending_orders: 4,
  },
  {
    id: 'prd-004',
    title: 'Wireless Bluetooth Earbuds',
    sku: 'EP-ELEC-004',
    category: 'Electronics',
    price: 1500,
    stock_units: 54,
    stock_status: 'In stock',
    status: 'Published',
    approval_status: 'Approved',
    sales_count: 54,
    revenue: 'NPR 81K',
    brand: 'SoundCraft Nepal',
    variants_label: 'Matte Black',
    updated_at: 'Sep 14, 2026',
    image: '/images/cat_earbuds.jpg',
    images: [
      '/images/cat_earbuds.jpg',
    ],
    description: 'True wireless stereo earbuds with active environmental noise cancellation, IPX5 sweat resistance, and 28-hour playtime.',
    total_sold: 54,
    last_30_days_sold: 19,
    pending_orders: 8,
  },
  {
    id: 'prd-005',
    title: 'Cotton Kurta',
    sku: 'EP-CLOTH-005',
    category: 'Clothing',
    price: 700,
    stock_units: 32,
    stock_status: 'In stock',
    status: 'Pending review',
    approval_status: 'Pending',
    sales_count: 42,
    revenue: 'NPR 29.4K',
    brand: 'Kathmandu Weaves',
    variants_count: 3,
    variants_label: '3 variants (M, L, XL)',
    updated_at: 'Sep 13, 2026',
    image: '/images/cat_fashion.jpg',
    images: [
      '/images/cat_fashion.jpg',
    ],
    description: '100% breathable organic Nepali cotton hand-stitched everyday kurta featuring classic button collar and tailored cuffs.',
    total_sold: 42,
    last_30_days_sold: 15,
    pending_orders: 2,
  },
  {
    id: 'prd-006',
    title: 'Stainless Steel Water Bottle',
    sku: 'EP-HOME-006',
    category: 'Home & Kitchen',
    price: 450,
    stock_units: 0,
    stock_status: 'Out of stock',
    status: 'Published',
    approval_status: 'Approved',
    sales_count: 38,
    revenue: 'NPR 17.1K',
    brand: 'Everest Gear',
    variants_label: '750ml Vacuum Insulated',
    updated_at: 'Sep 12, 2026',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Double-walled vacuum insulated stainless steel canteen keeps beverages iced for 24 hours or steaming hot for 12 hours.',
    total_sold: 38,
    last_30_days_sold: 11,
    pending_orders: 0,
  },
  {
    id: 'prd-007',
    title: 'Organic Mustard Oil',
    sku: 'EP-OIL-007',
    category: 'Groceries',
    price: 350,
    stock_units: 89,
    stock_status: 'In stock',
    status: 'Draft',
    approval_status: 'Draft',
    sales_count: 0,
    revenue: 'NPR 0',
    brand: 'Terai Pure',
    variants_label: '1L Cold-Pressed Bottle',
    updated_at: 'Sep 11, 2026',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Traditional wood-pressed unfiltered yellow mustard seed oil cold-extracted without chemical preservatives.',
    total_sold: 0,
    last_30_days_sold: 0,
    pending_orders: 0,
  },
  {
    id: 'prd-008',
    title: 'Handmade Dhaka Topi',
    sku: 'EP-ACC-008',
    category: 'Accessories',
    price: 1200,
    stock_units: 15,
    stock_status: 'In stock',
    status: 'Unpublished',
    approval_status: 'Unpublished',
    sales_count: 28,
    revenue: 'NPR 33.6K',
    brand: 'Palpa Crafts',
    variants_label: 'Size: 58cm Traditional Weave',
    updated_at: 'Sep 10, 2026',
    image: '/images/product_dhaka_topi.jpg',
    images: [
      '/images/product_dhaka_topi.jpg',
    ],
    description: 'Authentic Palpali Dhaka fabric ceremonial cap handwoven on traditional wooden looms by master Nepali artisans.',
    total_sold: 28,
    last_30_days_sold: 8,
    pending_orders: 1,
  },
];

export const VendorProductsPage: React.FC = () => {
  const { navigate } = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Primary Data State
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [metrics, setMetrics] = useState<ProductMetrics>({
    totalProducts: 0,
    published: 0,
    drafts: 0,
    lowStock: 0,
    pendingApproval: 0,
  });

  // View States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showEmptyStateDemo, setShowEmptyStateDemo] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedStock, setSelectedStock] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('recently_added');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<VendorProduct | null>(null);
  const [selectedDrawerImageIdx, setSelectedDrawerImageIdx] = useState<number>(0);
  const [deleteModalProduct, setDeleteModalProduct] = useState<VendorProduct | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    category: 'Groceries',
    brand: '',
    price: '',
    salePrice: '',
    stock: '',
    description: '',
    imageUrl: '',
    publish: true,
  });

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await uploadImageFile(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload product image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleExportProductsCsv = () => {
    if (!products.length) return;
    exportToCsv({
      filename: `Products_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Merchant Product Catalog',
      headers: ['SKU', 'Product Title', 'Category', 'Price (NPR)', 'Sale Price (NPR)', 'Stock Units', 'Status', 'Sales Count'],
      rows: products.map((p) => [
        p.sku,
        p.title,
        p.category,
        String(p.price),
        String(p.sale_price || ''),
        String(p.stock_units),
        p.status,
        String(p.sales_count || 0),
      ]),
    });
  };

  // Try fetching dynamic backend data if available, with graceful fallback
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const queryParams = new URLSearchParams({
          search: searchQuery,
          status: selectedStatus,
          category: selectedCategory,
          stock: selectedStock,
          sort: sortBy,
          page: String(currentPage),
          pageSize: String(pageSize),
        });

        const res = await ApiClient.get<{
          metrics?: ProductMetrics;
          products?: VendorProduct[];
        }>(`/api/v1/vendor/products?${queryParams.toString()}`);

        if (res && Array.isArray(res.products)) {
          setProducts(res.products);
        }
        if (res?.metrics) {
          setMetrics(res.metrics);
        }
      } catch (err) {
        setProducts(INITIAL_MOCK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [searchQuery, selectedCategory, selectedStatus, selectedStock, sortBy, currentPage, pageSize]);

  // Bulk Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Open Quick View Drawer
  const handleOpenQuickView = (product: VendorProduct) => {
    setQuickViewProduct(product);
    setSelectedDrawerImageIdx(0);
  };

  // Delete product action
  const handleConfirmDelete = async () => {
    if (!deleteModalProduct) return;
    try {
      await ApiClient.delete(`/api/v1/vendor/products/${deleteModalProduct.id}`);
    } catch {
      // Local state deletion fallback
    }
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== deleteModalProduct.id);
      setMetrics({
        totalProducts: next.length,
        published: next.filter((p) => p.status === 'Published').length,
        drafts: next.filter((p) => p.status === 'Draft').length,
        lowStock: next.filter((p) => p.stock_units > 0 && p.stock_units <= 10).length,
        pendingApproval: next.filter((p) => p.status === 'Pending review').length,
      });
      return next;
    });
    setSelectedIds((prev) => prev.filter((id) => id !== deleteModalProduct.id));
    if (quickViewProduct?.id === deleteModalProduct.id) {
      setQuickViewProduct(null);
    }
    setDeleteModalProduct(null);
  };

  // Add Product Form Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('Please fill in title and price.');
      return;
    }

    setIsSubmitting(true);
    const stockNum = formData.stock !== '' ? Number(formData.stock) : 10;
    const newProduct: VendorProduct = {
      id: `prd-${Date.now()}`,
      title: formData.title,
      sku: formData.sku || `EP-SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: formData.category,
      price: Number(formData.price),
      sale_price: formData.salePrice ? Number(formData.salePrice) : null,
      stock_units: stockNum,
      stock_status: stockNum <= 0 ? 'Out of stock' : stockNum <= 10 ? 'Low stock' : 'In stock',
      status: formData.publish ? 'Published' : 'Draft',
      approval_status: formData.publish ? 'Approved' : 'Draft',
      sales_count: 0,
      revenue: 'NPR 0',
      brand: formData.brand || 'Everest Vendor',
      updated_at: 'Just now',
      image: formData.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      images: [
        formData.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      ],
      description: formData.description || 'Quality product listed on Everest Pasal.',
      total_sold: 0,
      last_30_days_sold: 0,
      pending_orders: 0,
    };

    try {
      const created = await ApiClient.post<any>('/api/v1/vendor/products', {
        title: formData.title,
        sku: newProduct.sku,
        category: formData.category,
        brand: formData.brand,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stock: stockNum,
        description: formData.description,
        imageUrl: formData.imageUrl,
        publish: formData.publish,
      });
      if (created?.id) {
        newProduct.id = created.id;
      }
    } catch {
      // Local addition fallback
    }

    setProducts((prev) => {
      const next = [newProduct, ...prev];
      setMetrics({
        totalProducts: next.length,
        published: next.filter((p) => p.status === 'Published').length,
        drafts: next.filter((p) => p.status === 'Draft').length,
        lowStock: next.filter((p) => p.stock_units > 0 && p.stock_units <= 10).length,
        pendingApproval: next.filter((p) => p.status === 'Pending review').length,
      });
      return next;
    });
    setIsAddModalOpen(false);
    setIsSubmitting(false);
    setFormData({
      title: '',
      sku: '',
      category: 'Groceries',
      brand: '',
      price: '',
      salePrice: '',
      stock: '',
      description: '',
      imageUrl: '',
      publish: true,
    });
  };

  // Status Badge Renderer
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('published')) {
      return (
        <span
          style={{
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          Published
        </span>
      );
    }
    if (s.includes('pending')) {
      return (
        <span
          style={{
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          Pending review
        </span>
      );
    }
    if (s.includes('draft')) {
      return (
        <span
          style={{
            backgroundColor: '#F1F5F9',
            color: '#475569',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          Draft
        </span>
      );
    }
    return (
      <span
        style={{
          backgroundColor: '#F1F5F9',
          color: '#475569',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        Unpublished
      </span>
    );
  };

  // Stock Dot Indicator
  const renderStockIndicator = (units: number) => {
    let dotColor = '#10B981'; // green
    let textColor = '#0F172A';

    if (units === 0) {
      dotColor = '#EF4444'; // red
      textColor = '#0F172A';
    } else if (units <= 10) {
      dotColor = '#F59E0B'; // amber/orange
      textColor = '#0F172A';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, color: textColor, fontSize: '13px' }}>
          {units} units
        </span>
      </div>
    );
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSku && !matchCat) return false;
    }
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'Published' && p.status !== 'Published') return false;
      if (selectedStatus === 'Pending review' && p.status !== 'Pending review') return false;
      if (selectedStatus === 'Draft' && p.status !== 'Draft') return false;
      if (selectedStatus === 'Unpublished' && p.status !== 'Unpublished') return false;
    }
    if (selectedStock === 'LOW' && (p.stock_units > 10 || p.stock_units === 0)) return false;
    if (selectedStock === 'OUT' && p.stock_units !== 0) return false;
    return true;
  });

  const isAllSelected = filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="180px" height="28px" />
            <Skeleton width="280px" height="14px" style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="120px" height="38px" borderRadius="6px" />
            <Skeleton width="140px" height="38px" borderRadius="6px" />
          </div>
        </div>
        <SkeletonStatCards count={5} columns={5} />
        <SkeletonTable rows={8} columns={9} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0F172A',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP TITLE HEADER & ACTIONS */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
            Products
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage your catalog, pricing, inventory, and product listings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Demo toggle button to preview Empty State view easily */}
          <button
            onClick={() => setShowEmptyStateDemo((prev) => !prev)}
            style={{
              backgroundColor: showEmptyStateDemo ? '#FEE2E2' : '#F1F5F9',
              color: showEmptyStateDemo ? '#DC2626' : '#475569',
              border: '1px solid #E2E8F0',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title="Toggle between Empty State and Table/Grid View"
          >
            {showEmptyStateDemo ? 'Show Products View' : 'Preview Empty State'}
          </button>

          <button
            onClick={() => alert('Import CSV product catalog')}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            Import products
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
              transition: 'background-color 0.15s',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 800 }}>+</span> Add product
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 KPI STAT CARDS (Shown when not in empty state demo) */}
      {/* ========================================================================= */}
      {!showEmptyStateDemo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
          {/* Card 1: Total Products */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #ECECEC',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
              TOTAL PRODUCTS
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
              {metrics.totalProducts}
            </div>
          </div>

          {/* Card 2: Published */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #ECECEC',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                PUBLISHED
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
              {metrics.published}
            </div>
          </div>

          {/* Card 3: Drafts */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #ECECEC',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                DRAFTS
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#94A3B8',
                }}
              />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
              {metrics.drafts}
            </div>
          </div>

          {/* Card 4: Low Stock (Highlighted with red border) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1.5px solid #FCA5A5',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#DC2626', letterSpacing: '0.4px' }}>
                LOW STOCK
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
              {metrics.lowStock}
            </div>
          </div>

          {/* Card 5: Pending Approval */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #ECECEC',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                PENDING APPROVAL
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
              {metrics.pendingApproval}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEARCH & FILTER TOOLBAR + VIEW SWITCHER */}
      {/* ========================================================================= */}
      {!showEmptyStateDemo && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '320px', flexWrap: 'wrap' }}>
            {/* Search Input Box */}
            <div style={{ position: 'relative', minWidth: '280px', flex: '0 1 320px' }}>
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 34px',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12.5px',
                  outline: 'none',
                  color: '#0F172A',
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8', fontSize: '13px' }}>
                🔍
              </span>
            </div>

            {/* Filter Pills */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Category ▾</option>
              <option value="Groceries">Groceries</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Beverages">Beverages</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Status ▾</option>
              <option value="Published">Published</option>
              <option value="Pending review">Pending review</option>
              <option value="Draft">Draft</option>
              <option value="Unpublished">Unpublished</option>
            </select>

            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Stock ▾</option>
              <option value="LOW">Low Stock (≤10)</option>
              <option value="OUT">Out of Stock (0)</option>
            </select>

            <button
              onClick={() => alert('Filter by brand')}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Brand ▾
            </button>

            <button
              onClick={() => alert('Filter by price range')}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Price range ▾
            </button>

            <button
              onClick={() => alert('More filters')}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              + More filters
            </button>
          </div>

          {/* Right Sort & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12.5px',
                color: '#0F172A',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="recently_added">Sort by: Recently added ▾</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="sales">Top Selling</option>
            </select>

            {/* View Mode Switcher: Table vs Grid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: viewMode === 'table' ? '#0F172A' : '#FFFFFF',
                  color: viewMode === 'table' ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Table View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: viewMode === 'grid' ? '#0F172A' : '#FFFFFF',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Grid View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BULK ACTION TOOLBAR (When items are selected) */}
      {/* ========================================================================= */}
      {!showEmptyStateDemo && selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #2563EB',
            borderRadius: '10px',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              style={{ accentColor: '#2563EB', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8' }}>
              {selectedIds.length} products selected
            </span>
            <span
              onClick={handleClearSelection}
              style={{ fontSize: '12px', color: '#2563EB', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear selection
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => alert(`Bulk publish ${selectedIds.length} items`)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              Publish
            </button>
            <button
              onClick={() => alert(`Bulk unpublish ${selectedIds.length} items`)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              Unpublish
            </button>
            <button
              onClick={() => alert('Bulk update price')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              Update price
            </button>
            <button
              onClick={() => alert('Bulk change category')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              Change category
            </button>
            <button
              onClick={handleExportProductsCsv}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Download size={13} /> Export to CSV
            </button>
            <button
              onClick={() => {
                const target = products.find((p) => selectedIds.includes(p.id)) || products[0];
                if (target) setDeleteModalProduct(target);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DC2626',
                color: '#DC2626',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN VIEW AREA (Empty State vs Table View vs Grid View) */}
      {/* ========================================================================= */}
      {showEmptyStateDemo || filteredProducts.length === 0 ? (
        /* Empty State Card (matches media_1794159242271_cabce82b.png) */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '90px 24px',
            border: '1px solid #ECECEC',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '480px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          {/* Light Pink Circle with Red 3D Package Plus Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#FFF1F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
              <circle cx="18" cy="18" r="4" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
              <path d="M18 16v4" stroke="#E11D48" strokeWidth="2" />
              <path d="M16 18h4" stroke="#E11D48" strokeWidth="2" />
            </svg>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
            Start building your catalog
          </h2>

          <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
            Add your first product to start selling on Everest Pasal.
            <br />
            You can add products individually or import them in bulk.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
              }}
            >
              + Add product
            </button>
            <button
              onClick={() => alert('Import CSV product catalog')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Import products
            </button>
          </div>

          <div style={{ marginTop: '24px' }}>
            <span
              onClick={() => alert('Opening product listing guidelines')}
              style={{
                fontSize: '13px',
                color: '#E11D48',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Need help? View our product listing guide →
            </span>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View (matches media_1794159242273_c050e88d.png) */
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ accentColor: '#2563EB', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Product</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>SKU</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Category</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Price</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Stock</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Sales</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Updated</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', fontFamily: "'Poppins', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenQuickView(p)}
                      style={{
                        borderBottom: '1px solid #F8FAFC',
                        backgroundColor: isChecked ? '#F8FAFC' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Checkbox column */}
                      <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelect(p.id, e as any)}
                          style={{ accentColor: '#2563EB', cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>

                      {/* Product Thumbnail + Name + Subtitle */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image}
                            alt={p.title}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #E2E8F0',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px', lineHeight: '1.25', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }} title={p.title}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              {p.variants_count && p.variants_count > 1 ? (
                                <span style={{ color: '#64748B' }}>{p.variants_count} variants</span>
                              ) : (
                                p.sku
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px' }}>
                        {p.sku}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {p.category}
                      </td>

                      {/* Price (with strikethrough if sale price) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                          NPR {p.price.toLocaleString()}
                        </div>
                        {p.original_price && p.original_price !== p.price && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            NPR {p.original_price.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock with colored dot */}
                      <td style={{ padding: '12px 14px' }}>
                        {renderStockIndicator(p.stock_units)}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 14px' }}>
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Sales */}
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {p.sales_count > 0 ? `${p.sales_count} sold` : '—'}
                      </td>

                      {/* Updated */}
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                        {p.updated_at}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenQuickView(p)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1,
                          }}
                          title="Actions"
                        >
                          ≡
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View (matches media_1794160066839_b1a4e090.png) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'stretch' }}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenQuickView(p)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #ECECEC',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              {/* Product Top Image - Equal Fixed Height */}
              <div style={{ height: '200px', minHeight: '200px', maxHeight: '200px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Card Body - Equal Flex Growth */}
              <div style={{ padding: '18px 20px 16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Title - Semi-Bold (600), Overflow Hidden with Ellipsis */}
                <h3
                  title={p.title}
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: '0 0 6px 0',
                    lineHeight: '1.3',
                    fontFamily: "'Poppins', sans-serif",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    display: 'block',
                  }}
                >
                  {p.title}
                </h3>

                {/* SKU & Category Row - Overflow Protected */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                  <span
                    title={p.sku}
                    style={{
                      fontSize: '13px',
                      color: '#64748B',
                      fontWeight: 400,
                      fontFamily: "'Poppins', sans-serif",
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                    }}
                  >
                    {p.sku}
                  </span>
                  <span
                    title={p.category}
                    style={{
                      fontSize: '12px',
                      color: '#64748B',
                      backgroundColor: '#F8FAFC',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      fontFamily: "'Poppins', sans-serif",
                      border: '1px solid #F1F5F9',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px',
                      flexShrink: 0,
                    }}
                  >
                    {p.category}
                  </span>
                </div>

                {/* Price & Stock Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                      NPR {p.price.toLocaleString()}
                    </span>
                    {p.original_price && p.original_price !== p.price && (
                      <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                        NPR {p.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: p.stock_units === 0 ? '#EF4444' : p.stock_units <= 10 ? '#F59E0B' : '#10B981',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                      {p.stock_units} units
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <div style={{ borderTop: '1px solid #CBD5E1', marginBottom: '14px' }} />

                {/* Footer: Status (Clean Text) & Sales + Action Menu */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {/* Status as Clean Semi-Bold Text */}
                  <div>
                    {p.status === 'Published' && (
                      <span style={{ color: '#10B981', fontWeight: 600, fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                        Published
                      </span>
                    )}
                    {p.status === 'Pending review' && (
                      <span style={{ color: '#D97706', fontWeight: 600, fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                        Pending review
                      </span>
                    )}
                    {p.status === 'Draft' && (
                      <span style={{ color: '#64748B', fontWeight: 600, fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                        Draft
                      </span>
                    )}
                    {p.status === 'Unpublished' && (
                      <span style={{ color: '#64748B', fontWeight: 600, fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                        Unpublished
                      </span>
                    )}
                  </div>

                  {/* Sales Count & 3-line Action Menu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                      {p.sales_count > 0 ? `${p.sales_count} sold` : '—'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenQuickView(p);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Product Actions"
                    >
                      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <line x1="1" y1="1.5" x2="19" y2="1.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                        <line x1="1" y1="7" x2="19" y2="7" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                        <line x1="1" y1="12.5" x2="19" y2="12.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PAGINATION FOOTER */}
      {/* ========================================================================= */}
      {!showEmptyStateDemo && filteredProducts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '12.5px', color: '#64748B' }}>
            Showing 1–{filteredProducts.length} of {metrics.totalProducts} products
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              ←
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              1
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
              2
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
              3
            </button>
            <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
              31
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748B' }}>
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#0F172A',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PRODUCT QUICK VIEW DRAWER (matches media_1794159242270_9779ba63.png) */}
      {/* ========================================================================= */}
      {quickViewProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            style={{
              width: '400px',
              maxWidth: '92vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header: Badge + Close Icon */}
            <div style={{ padding: '20px 24px 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {renderStatusBadge(quickViewProduct.status)}
              <button
                onClick={() => setQuickViewProduct(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Product Title & SKU */}
            <div style={{ padding: '0 24px 16px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                {quickViewProduct.title}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                SKU: {quickViewProduct.sku}
              </div>
            </div>

            {/* SALES PERFORMANCE Section */}
            <div style={{ padding: '0 24px 18px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '10px' }}>
                SALES PERFORMANCE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', border: '1px solid #ECECEC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Total Sold</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {quickViewProduct.total_sold ?? 124}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', border: '1px solid #ECECEC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Revenue</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {quickViewProduct.revenue || 'NPR 62K'}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', border: '1px solid #ECECEC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Last 30 Days</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {quickViewProduct.last_30_days_sold ?? 42}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Image + Gallery Thumbnails */}
            <div style={{ padding: '0 24px 20px 24px' }}>
              <div style={{ height: '190px', width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F8FAFC', marginBottom: '10px' }}>
                <img
                  src={
                    quickViewProduct.images && quickViewProduct.images[selectedDrawerImageIdx]
                      ? quickViewProduct.images[selectedDrawerImageIdx]
                      : quickViewProduct.image
                  }
                  alt={quickViewProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {quickViewProduct.images && quickViewProduct.images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {quickViewProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDrawerImageIdx(idx)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: idx === selectedDrawerImageIdx ? '2px solid #2563EB' : '1px solid #ECECEC',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key-Value Specifications */}
            <div style={{ padding: '0 24px 20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Category</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{quickViewProduct.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Brand</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{quickViewProduct.brand}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Price</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>NPR {quickViewProduct.price.toLocaleString()}</span>
              </div>
              {quickViewProduct.sale_price && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Sale price</span>
                  <div>
                    <span style={{ color: '#94A3B8', textDecoration: 'line-through', fontSize: '12px', marginRight: '8px' }}>
                      NPR {quickViewProduct.price.toLocaleString()}
                    </span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>
                      NPR {quickViewProduct.sale_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Stock</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {quickViewProduct.stock_units} units ({quickViewProduct.stock_status})
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Variants</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {quickViewProduct.variants_label || 'Single SKU'}
                </span>
              </div>
            </div>

            {/* DESCRIPTION Section */}
            <div style={{ padding: '0 24px 20px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '6px' }}>
                DESCRIPTION
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                {quickViewProduct.description || 'Premium long-grain basmati rice sourced from the fertile plains of Nepal. Perfect for biryani, pulao, and everyday cooking.'}
              </p>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '14px' }}>
                Last updated: {quickViewProduct.updated_at}
              </div>
            </div>

            {/* Sticky Bottom Drawer Actions */}
            <div
              style={{
                marginTop: 'auto',
                padding: '20px 24px',
                borderTop: '1px solid #ECECEC',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => alert(`Editing ${quickViewProduct.title}`)}
                  style={{
                    flex: 1,
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Edit product
                </button>
                <button
                  onClick={() => alert(`View ${quickViewProduct.title} on storefront`)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View in store
                </button>
              </div>

              <button
                onClick={() => alert(`Duplicated product ${quickViewProduct.title}`)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFBEB',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PRODUCT DELETE CONFIRMATION MODAL (matches media_1794159242244_f29824fe.png) */}
      {/* ========================================================================= */}
      {deleteModalProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
          onClick={() => setDeleteModalProduct(null)}
        >
          <div
            style={{
              width: '460px',
              maxWidth: '92vw',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Icon */}
            <button
              onClick={() => setDeleteModalProduct(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Red Circle with Trash Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
              Delete product?
            </h3>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 18px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{deleteModalProduct.title}"</strong>? This action cannot be undone. The product will be removed from your catalog and will no longer be visible to customers.
            </p>

            {/* Warning Alert Box */}
            <div
              style={{
                backgroundColor: '#FFF1F2',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                color: '#DC2626',
                marginBottom: '4px',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontWeight: 500 }}>
                This product has {deleteModalProduct.stock_units} units in stock and {deleteModalProduct.pending_orders || 12} pending orders.
              </span>
            </div>

            {/* Horizontal line divider */}
            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '22px -24px 18px -24px' }} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setDeleteModalProduct(null)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #E2E8F0',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)',
                }}
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. ADD PRODUCT MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              width: '560px',
              maxWidth: '92vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Mustard Oil 1L"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. EP-OIL-009"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', backgroundColor: '#FFFFFF', outline: 'none' }}
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Price (NPR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={productFileInputRef}
                  onChange={handleProductImageUpload}
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Product Image</label>
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ImagePlus size={12} /> {isUploadingImage ? 'Uploading...' : 'Browse Image File'}
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="Paste URL or click Browse above"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    />
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>Image ready</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="publishCheck"
                  checked={formData.publish}
                  onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
                  style={{ accentColor: '#E11D48', cursor: 'pointer' }}
                />
                <label htmlFor="publishCheck" style={{ fontSize: '13px', color: '#1E293B', cursor: 'pointer' }}>
                  Publish to storefront immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', padding: '9px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
