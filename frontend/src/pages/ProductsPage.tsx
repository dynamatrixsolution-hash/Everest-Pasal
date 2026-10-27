// ==============================================================================
// EVEREST PASAL - ALL CATEGORIES & PRODUCTS CATALOG PAGE
// Sidebar Filters + 4-in-a-row Product Cards matching target design
// Unified layout inheriting official CustomerLayout footer
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client.js';
import { useCart } from '../context/CartContext.js';
import { Link, useRouter } from '../router/index.js';

interface CatalogProduct {
  id: string;
  name: string;
  seller: string;
  rating: number;
  reviewsCount?: number;
  price: number;
  imageUrl: string;
  category?: string;
  categoryId?: string;
  description?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  code?: string;
  slug?: string;
}

export const ProductsPage: React.FC = () => {
  const { addToCart } = useCart();
  const { navigate, query } = useRouter();

  // Filters State
  const initialCategory = query.get('categoryId') || query.get('category') || 'all';
  const initialSearch = query.get('search') || query.get('q') || '';

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Data States
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category or search when query string changes
  useEffect(() => {
    const cat = query.get('categoryId') || query.get('category') || 'all';
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
      setCurrentPage(1);
    }
  }, [query]);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiClient.get<{ categories: CategoryItem[] }>('/api/v1/categories');
        if (res && res.categories) {
          setCategories(res.categories);
        } else if (Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.warn('Failed to load dynamic categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch dynamic products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '16');

      if (selectedCategory && selectedCategory !== 'all') {
        params.set('categoryId', selectedCategory);
      }

      if (initialSearch) {
        params.set('search', initialSearch);
      }

      if (sortBy) {
        params.set('sortBy', sortBy);
      }

      const res = await ApiClient.get<any>(`/api/v1/products?${params.toString()}`);
      let productList: any[] = [];
      let pages = 1;
      let total = 0;

      if (Array.isArray(res)) {
        productList = res;
        total = res.length;
      } else if (res && Array.isArray(res.data)) {
        productList = res.data;
        pages = res.meta?.totalPages || res.pagination?.totalPages || 1;
        total = res.meta?.total || res.pagination?.total || productList.length;
      } else if (res && Array.isArray(res.products)) {
        productList = res.products;
        total = res.total || productList.length;
      }

      const mapped: CatalogProduct[] = productList.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || 'Product',
        seller: p.brand || p.seller || 'FITLIFE STORE',
        rating: 4.5,
        price: Number(p.price || p.min_price || 0),
        imageUrl: p.imageUrl || p.image || '/images/cat_smartwatch.jpg',
        category: p.category,
        categoryId: p.categoryId,
        description: p.description,
      }));

      // In-memory filter for price range if specified
      const filteredByPrice = mapped.filter((p) => {
        if (minPrice > 0 && p.price < minPrice) return false;
        if (maxPrice < 500000 && p.price > maxPrice) return false;
        return true;
      });

      setProducts(filteredByPrice);
      setTotalPages(pages);
      setTotalCount(total);
    } catch (err: any) {
      console.error('Failed to fetch dynamic products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, currentPage, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(500000);
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedDelivery('');
    setSelectedOrigin('');
    setSortBy('newest');
    setCurrentPage(1);
    navigate('/products');
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (prod: CatalogProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setAddingId(prod.id);
      try {
        await addToCart(prod.id, 1);
      } catch {
        // Handled in CartContext
      }
      setToastMessage(`Added "${prod.name}" to cart!`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  const renderStars = (rating: number = 4.5) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((i) => {
          const isFilled = i <= Math.floor(rating);
          const strokeColor = isFilled ? '#F59E0B' : '#CBD5E1';
          return (
            <svg
              key={i}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginLeft: '3px' }}>
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0B4EA2',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '13.5px',
            boxShadow: '0 8px 24px rgba(11, 78, 162, 0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Widened to 1400px so 4 cards fit with plenty of room */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 48px 24px', boxSizing: 'border-box' }}>
        
        {/* Title Header & Sort dropdown */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #EBE5DB',
          }}
        >
          <div>
            <div
              style={{
                color: '#E63946',
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              BROWSE CATALOG
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: 0 }}>
              {selectedCategory === 'all'
                ? 'All Products'
                : categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory || c.name === selectedCategory)?.name || 'Filtered Products'}
            </h1>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
              Showing {products.length} {products.length === 1 ? 'item' : 'items'}
              {totalCount > 0 && ` (Total ${totalCount} available)`}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1.5px solid #dcd5c9',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* 2-Column Catalog Layout: Sidebar + Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          {/* ================================================================ */}
          {/* LEFT SIDEBAR: FILTERS */}
          {/* ================================================================ */}
          <aside
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #EBE5DB',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              boxSizing: 'border-box',
              width: '240px',
            }}
          >
            {/* Header: Filters + Reset all */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>Filters</span>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E63946',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Reset all
              </button>
            </div>

            {/* 1. Category */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#111827', letterSpacing: '0.4px' }}>CATEGORIES</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#475569', maxHeight: '280px', overflowY: 'auto' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: selectedCategory === 'all' ? 700 : 500, color: selectedCategory === 'all' ? '#0B4EA2' : 'inherit' }}>
                  <input
                    type="radio"
                    name="cat"
                    checked={selectedCategory === 'all'}
                    onChange={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    style={{ accentColor: '#0B4EA2' }}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => {
                  const isChecked = selectedCategory === cat.id || selectedCategory === cat.slug || selectedCategory === cat.name;
                  return (
                    <label
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? '#0B4EA2' : 'inherit',
                      }}
                    >
                      <input
                        type="radio"
                        name="cat"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedCategory(cat.id);
                          setCurrentPage(1);
                        }}
                        style={{ accentColor: '#0B4EA2' }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Range */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#111827', letterSpacing: '0.4px', marginBottom: '10px' }}>
                PRICE RANGE (NPR)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #dcd5c9',
                    backgroundColor: '#fafafa',
                    fontSize: '11.5px',
                    color: '#64748b',
                  }}
                >
                  <span style={{ fontSize: '10px', display: 'block', color: '#94a3b8' }}>Min</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '12px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <span style={{ color: '#94a3b8' }}>–</span>
                <div
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #dcd5c9',
                    backgroundColor: '#fafafa',
                    fontSize: '11.5px',
                    color: '#64748b',
                  }}
                >
                  <span style={{ fontSize: '10px', display: 'block', color: '#94a3b8' }}>Max</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 500000)}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '12px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentPage(1);
                fetchProducts();
              }}
              style={{
                width: '100%',
                backgroundColor: '#0B4EA2',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(11, 78, 162, 0.25)',
              }}
            >
              Apply Filters
            </button>
          </aside>

          {/* ================================================================ */}
          {/* RIGHT PRODUCT GRID (Strictly 4-in-a-row with Image 2 Design) */}
          {/* ================================================================ */}
          <div style={{ minWidth: 0, width: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏔️</div>
                <div>Loading dynamic products...</div>
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #EBE5DB',
                  color: '#64748b',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>No Products Found</h3>
                <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>No products match your selected filters. Try resetting the filters or selecting another category.</p>
                <button
                  onClick={handleResetFilters}
                  style={{
                    backgroundColor: '#0B4EA2',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '18px',
                  marginBottom: '36px',
                  width: '100%',
                }}
              >
                {products.map((prod) => {
                  const isWishlisted = !!wishlist[prod.id];
                  return (
                    <div
                      key={prod.id}
                      onClick={() => navigate(`/products/${prod.id}`)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #EDE9E1',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        minWidth: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                        e.currentTarget.style.borderColor = '#EDE9E1';
                      }}
                    >
                      {/* Top Flush Image Container with Neutral Grey Background (Matching Image 2) */}
                      <div
                        style={{
                          width: '100%',
                          height: '210px',
                          backgroundColor: '#EBEAE8',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Circular Floating White Wishlist Button (Matching Image 2 Top-Right) */}
                        <button
                          onClick={(e) => toggleWishlist(prod.id, e)}
                          aria-label="Add to Wishlist"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 2,
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isWishlisted ? '#E63946' : 'none'}
                            stroke={isWishlisted ? '#E63946' : '#94A3B8'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>

                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/cat_smartwatch.jpg';
                          }}
                        />
                      </div>

                      {/* Content Area (Matching Image 2 Structure) */}
                      <div
                        style={{
                          padding: '16px 18px 18px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        {/* Seller Name (Bold serif uppercase in dark slate) */}
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#1E293B',
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            fontFamily: "'Playfair Display', Georgia, serif",
                            marginBottom: '6px',
                          }}
                        >
                          {prod.seller || prod.category || 'FITLIFE STORE'}
                        </div>

                        {/* Product Title (Bold, clean typography) */}
                        <h3
                          style={{
                            fontSize: '16.5px',
                            fontWeight: 800,
                            color: '#0F172A',
                            margin: '0 0 8px 0',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={prod.name}
                        >
                          {prod.name}
                        </h3>

                        {/* Star Rating (Amber stars + (4.5)) */}
                        <div style={{ marginBottom: '16px' }}>
                          {renderStars(prod.rating || 4.5)}
                        </div>

                        {/* Price & Blue Cart Button Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 'auto',
                            paddingTop: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '21px',
                              fontWeight: 900,
                              color: '#0F172A',
                              letterSpacing: '-0.3px',
                            }}
                          >
                            Rs. {prod.price.toLocaleString()}
                          </span>

                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            disabled={addingId === prod.id}
                            aria-label="Add to cart"
                            style={{
                              backgroundColor: '#155E9C',
                              color: '#ffffff',
                              border: 'none',
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(21, 94, 156, 0.28)',
                              transition: 'background-color 0.15s ease, transform 0.15s ease',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#0F4878';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#155E9C';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {addingId === prod.id ? (
                              '…'
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dynamic Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#64748b',
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: currentPage === pg ? 'none' : '1px solid #dcd5c9',
                      backgroundColor: currentPage === pg ? '#0B4EA2' : '#ffffff',
                      color: currentPage === pg ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {pg}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #dcd5c9',
                      backgroundColor: '#ffffff',
                      color: '#0B4EA2',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Next ›
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
