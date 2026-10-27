// ==============================================================================
// EVEREST PASAL - OFFICIAL HOME PAGE
// Exact implementation matching Brand Presentation Mockup & Color Scheme
// Himalayan Blue (#0B4EA2), Nepali Crimson (#E63946), Saffron Amber (#F4A261)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useCart } from '../../context/CartContext.js';
import { Link, useRouter } from '../../router/index.js';
import { BrandLogo } from '../../components/Common/BrandLogo.js';

interface Offer {
  id: string;
  sku: string;
  title: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  currency: string;
  status: string;
  stockQuantity: number;
  organization?: {
    id: string;
    legalName: string;
    tradeName?: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  categoryTag?: string;
  rating?: number;
  discountBadge?: string;
  imageUrl?: string;
  price?: number;
  comparePrice?: number;
  primaryOfferId?: string;
}

export const StorefrontPage: React.FC<{ onNavigateToCheckout?: () => void }> = () => {
  const { addToCart } = useCart();
  const { navigate } = useRouter();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // 4 Carousel Slides
  const heroSlides = [
    {
      id: 'slide-1',
      brand: 'SUMMER MEGA SALE',
      title: '60% OFF ON ALL STREETWEAR & SNEAKERS',
      subtitle: 'Exclusive discounts on t-shirts, active wear, sneakers, and casual fashion.',
      buttonText: 'Shop Now',
      link: '/products?sale=flash',
      imageUrl: '/images/hero_sale_banner.jpg',
      bgColor: '#DC2626',
      isRedPromo: true,
      hasNikeLogo: false,
    },
    {
      id: 'slide-2',
      brand: 'Himalayan Heritage',
      title: 'Authentic Cashmere & Pashmina Collection',
      subtitle: 'Pure authentic handwoven luxury straight from local artisans.',
      buttonText: 'Explore Shawls',
      link: '/products?category=apparel',
      imageUrl: '/images/hero_pashmina.jpg',
      bgColor: '#F7F4F0',
      isRedPromo: false,
      hasNikeLogo: false,
    },
    {
      id: 'slide-3',
      brand: 'Tech & Wearables',
      title: 'Next-Gen Smartwatches & Fitness Trackers',
      subtitle: 'Real-time health telemetry, sports modes, and long battery life.',
      buttonText: 'Discover Tech',
      link: '/products?category=electronics',
      imageUrl: '/images/hero_smartwatch.jpg',
      bgColor: '#F3F6F9',
      isRedPromo: false,
      hasNikeLogo: false,
    },
    {
      id: 'slide-4',
      brand: 'Organic Agro',
      title: 'Pure Orthodox Tea & Roasted Himalayan Coffee',
      subtitle: 'Fresh single-origin roast from eastern hills delivered nationwide.',
      buttonText: 'Taste The Peaks',
      link: '/products?category=tea',
      imageUrl: '/images/hero_tea_coffee.jpg',
      bgColor: '#F6F4ED',
      isRedPromo: false,
      hasNikeLogo: false,
    },
  ];

  // Dynamic Banners fetched from Super Admin CMS
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const res = await ApiClient.get('/api/v1/content/banners');
        if (Array.isArray(res) && res.length > 0) {
          setDynamicBanners(res);
        }
      } catch (err) {
        console.warn('Could not load dynamic banners, using local defaults', err);
      }
    };
    fetchHeroBanners();
  }, []);

  const activeSlides = dynamicBanners.length > 0
    ? dynamicBanners.map((b) => ({
        id: b.id,
        brand: b.banner_code?.replace('HERO_SLIDE_', '').replace(/_/g, ' ') || 'EVEREST PASAL',
        title: b.banner_name,
        subtitle: b.subtitle || 'Exclusive deals and curated selections',
        buttonText: b.button_text || 'Shop Now',
        link: b.target_url || '/',
        imageUrl: b.image_url,
        bgColor: b.bg_color || '#DC2626',
        isRedPromo: b.bg_color === '#DC2626' || b.image_url?.includes('hero_sale_banner'),
      }))
    : heroSlides;

  // Auto-play timer (5 seconds), pauses on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, activeSlides.length]);

  const activeHero = activeSlides[currentSlide % activeSlides.length] || activeSlides[0];

  // Dynamic Storefront Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setProductsLoading(true);
        const res = await ApiClient.get<any>('/api/v1/products?limit=12&sortBy=newest');
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.data)) list = res.data;
        else if (res && Array.isArray(res.products)) list = res.products;

        setProducts(
          list.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || 'Product',
            slug: p.slug || p.id,
            categoryTag: p.category || 'GENERAL',
            imageUrl: p.imageUrl || p.image || '/images/cat_smartwatch.jpg',
            price: Number(p.price || p.min_price || 0),
            comparePrice: p.price ? Math.round(Number(p.price) * 1.15) : undefined,
            rating: 4.8,
            brand: p.brand || 'Everest Direct',
            description: p.description,
          }))
        );
      } catch (err) {
        console.warn('Failed to load dynamic storefront products:', err);
      } finally {
        setProductsLoading(false);
      }

      try {
        setCategoriesLoading(true);
        const cRes = await ApiClient.get<any>('/api/v1/categories');
        if (cRes && Array.isArray(cRes.categories)) {
          setCategories(cRes.categories);
        } else if (Array.isArray(cRes)) {
          setCategories(cRes);
        }
      } catch (err) {
        console.warn('Failed to load dynamic storefront categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchDynamicData();
  }, []);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (item: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setAddingId(item.id);
      try {
        await addToCart(item.id, 1);
      } catch {
        // Fallback smooth toast
      }
      setAddedToast(`Added "${item.name}" to cart!`);
      setTimeout(() => setAddedToast(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF3E9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {addedToast && (
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
          <span>{addedToast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HERO BANNER CAROUSEL (Strict Equal 480px Height for Every Slider) */}
      {/* ==================================================================== */}
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          height: '480px',
          minHeight: '480px',
          maxHeight: '480px',
          backgroundColor: activeHero.bgColor,
          backgroundImage: activeHero.isRedPromo
            ? 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)'
            : 'none',
          backgroundSize: '24px 24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background-color 0.4s ease',
        }}
      >
        {activeHero.isRedPromo ? (
          /* Slide: Exact Flatlay Composition matching Mockup Image */
          <div
            onClick={() => navigate(activeHero.link)}
            style={{
              width: '100%',
              height: '480px',
              maxHeight: '480px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '16px 20px 48px 20px',
              boxSizing: 'border-box',
            }}
          >
            <img
              key={activeHero.imageUrl}
              src={activeHero.imageUrl}
              alt={activeHero.title}
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '430px',
                objectFit: 'contain',
                display: 'block',
                animation: 'fadeIn 0.3s ease',
              }}
            />
          </div>
        ) : (
          /* Slides 2, 3, 4+: Rich 2-column Presentation Strictly Equal 480px */
          <div
            style={{
              maxWidth: '1240px',
              height: '480px',
              maxHeight: '480px',
              margin: '0 auto',
              padding: '30px 24px 50px 24px',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              alignItems: 'center',
              gap: '40px',
              boxSizing: 'border-box',
            }}
          >
            {/* Left Text & CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px' }}>🏔️</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  {activeHero.brand}
                </span>
              </div>

              <h1
                className="hero-slide-title"
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#111827',
                  lineHeight: 1.18,
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                  maxWidth: '480px',
                }}
              >
                {activeHero.title}
              </h1>

              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                  maxWidth: '440px',
                }}
              >
                {activeHero.subtitle}
              </p>

              <Link
                to={activeHero.link}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14.5px',
                  padding: '11px 28px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>{activeHero.buttonText}</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </Link>
            </div>

            {/* Right Slide Photo */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', maxHeight: '380px' }}>
              <div
                style={{
                  width: '100%',
                  maxHeight: '340px',
                  height: '340px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <img
                  key={activeHero.imageUrl}
                  src={activeHero.imageUrl}
                  alt={activeHero.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    animation: 'fadeIn 0.35s ease-in-out',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Clickable Carousel Navigation Dots (Centered at bottom, matching screenshot) */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                border: currentSlide === idx ? '2.5px solid #ffffff' : 'none',
                backgroundColor: currentSlide === idx ? 'transparent' : 'rgba(255, 255, 255, 0.55)',
                width: currentSlide === idx ? '13px' : '10px',
                height: currentSlide === idx ? '13px' : '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            />
          ))}
        </div>

        {/* Carousel Left/Right Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
          aria-label="Previous slide"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease, background-color 0.15s ease',
            zIndex: 10,
          }}
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
          aria-label="Next slide"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease, background-color 0.15s ease',
            zIndex: 10,
          }}
        >
          ›
        </button>
      </section>

      {/* Main Container Wrapper for Products & Categories */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '44px 20px 60px 20px' }}>

        {/* ==================================================================== */}
        {/* 2. SHOP BY CATEGORY (Dynamic from API) */}
        {/* ==================================================================== */}
        <section style={{ marginTop: '54px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
            <div>
              <div
                style={{
                  color: '#E63946',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                CATEGORY
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Shop by category
              </h2>
              <div style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
                Looking for specific items to elevate your lifestyle
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/categories"
                style={{
                  color: '#0B4EA2',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                View all categories →
              </Link>
            </div>
          </div>

          {/* Dynamic Category Cards Grid */}
          {categoriesLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Loading categories...
            </div>
          ) : (
            <div
              className="responsive-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {categories.slice(0, 8).map((cat) => {
                const s = `${cat.name} ${cat.slug || ''}`.toLowerCase();
                let thumbnail = '/images/cat_earbuds.jpg';
                if (s.includes('fash') || s.includes('apparel') || s.includes('cloth')) thumbnail = '/images/cat_fashion.jpg';
                else if (s.includes('food') || s.includes('groc') || s.includes('agro') || s.includes('tea') || s.includes('coffee')) thumbnail = '/images/cat_coffee.jpg';
                else if (s.includes('hand') || s.includes('craft') || s.includes('nepal')) thumbnail = '/images/product_dhaka_topi.jpg';
                else if (s.includes('home') || s.includes('kitchen')) thumbnail = '/images/cat_smartwatch.jpg';

                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #edf2f7',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '14px' }}>
                      <span style={{ color: '#111827' }}>{cat.name}</span>
                      <span style={{ color: '#0B4EA2' }}>Explore →</span>
                    </div>
                    <div style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', marginBottom: '14px' }}>
                      <img
                        src={thumbnail}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4, flex: 1 }}>
                      Discover authentic items and top selections in {cat.name}.
                    </p>
                    <div style={{ color: '#0B4EA2', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Shop category</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================================== */}
        {/* 3. TRENDING PRODUCTS (Dynamic from API) */}
        {/* ==================================================================== */}
        <section style={{ marginTop: '54px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
            <div>
              <div
                style={{
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                TOP SELECTIONS
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Trending Products
              </h2>
              <div style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
                Discover all the latest trend items right on your doorstep!
              </div>
            </div>

            <Link
              to="/products"
              style={{
                backgroundColor: '#0A3871',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                padding: '9px 22px',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(10, 56, 113, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#072A52')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A3871')}
            >
              View all products
            </Link>
          </div>

          {/* Dynamic Products Grid */}
          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏔️</div>
              <div>Loading dynamic products...</div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px solid #edf2f7', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📦</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>No products available yet.</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Products published by sellers will appear here instantly!</div>
            </div>
          ) : (
            <div
              className="responsive-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '20px',
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
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
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
                      {/* Circular Floating White Wishlist Button */}
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
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/cat_smartwatch.jpg';
                        }}
                      />
                    </div>

                    {/* Content Area */}
                    <div
                      style={{
                        padding: '16px 18px 18px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      {/* Seller / Category Name (Uppercase Serif) */}
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
                        {prod.brand || prod.categoryTag || 'FITLIFE STORE'}
                      </div>

                      {/* Product Title */}
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

                      {/* Outline Star Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                        {[1, 2, 3, 4, 5].map((i) => {
                          const isFilled = i <= Math.floor(prod.rating || 4.5);
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
                          ({(prod.rating || 4.5).toFixed(1)})
                        </span>
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
                          Rs. {prod.price?.toLocaleString()}
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
        </section>
      </div>

      {/* ==================================================================== */}
      {/* 4. RELIABLE DELIVERY ACROSS NEPAL (Exact Text & Stats from Mockup) */}
      {/* ==================================================================== */}
      <section
        style={{
          backgroundColor: '#FAF7F2',
          padding: '52px 24px',
          marginTop: '60px',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', marginBottom: '8px' }}>
            Reliable Delivery Across Nepal
          </h2>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 34px 0' }}>
            Fast &amp; Safe delivery to Pokhara, Biratnagar, Kathmandu, and 70+ districts in Nepal
          </p>

          {/* 4 Stat Cards */}
          <div
            className="responsive-grid-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '18px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #f1ece4',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                📦
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827' }}>50,000+</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Products Sold</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #f1ece4',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🚚
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827' }}>24hr - 72hrs</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Express Delivery</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #f1ece4',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                ⭐
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827' }}>99.2%</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Positive Reviews</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                border: '1px solid #f1ece4',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🎧
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827' }}>24/7 Support</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Dedicated Helpline</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container Wrapper for Remaining Sections */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '48px 20px 0 20px' }}>

        {/* ==================================================================== */}
        {/* 5. NEW ARRIVAL PRODUCTS & MAN'S COLLECTION (Image 1) */}
        {/* ==================================================================== */}
        <section>
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              TOP SELECTIONS
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
              New Arrival Products
            </h2>
            <div style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
              Curated products loved by modern trendsetters.
            </div>
          </div>

          {/* Large Black Men's Collection Banner */}
          <div
            style={{
              backgroundColor: '#16191E',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.2fr',
              alignItems: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              marginBottom: '32px',
            }}
          >
            {/* Left Copy */}
            <div style={{ padding: '48px 48px' }}>
              <h3
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Man's Collections
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '14.5px', marginBottom: '24px', maxWidth: '340px', lineHeight: 1.4 }}>
                Features man collections that give you another vibe.
              </p>
              <Link
                to="/products?category=apparel"
                style={{
                  backgroundColor: '#DC2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
              >
                <span>Shop now</span>
                <span>→</span>
              </Link>
            </div>

            {/* Right Sweater Image */}
            <div style={{ height: '320px', overflow: 'hidden' }}>
              <img
                src="/images/promo_sweater.jpg"
                alt="Man's Collections Knitted Sweater"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Merchant Partner Spotlight Banner (Grow Your Business with Everest Pasal) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #edf2f7',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '0.9fr 1.3fr',
              alignItems: 'center',
              gap: '36px',
              padding: '28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              marginBottom: '54px',
            }}
          >
            {/* Left Artisan Photo */}
            <div style={{ height: '300px', borderRadius: '14px', overflow: 'hidden' }}>
              <img
                src="/images/merchant_artisan.jpg"
                alt="Grow your business with Everest Pasal artisan merchant"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Right Merchant Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  padding: '3px 12px',
                  borderRadius: '16px',
                  marginBottom: '10px',
                }}
              >
                Partner With Us
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: '0 0 10px 0' }}>
                Grow Your Business with Everest Pasal
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                Join thousands of local businesses and independent sellers reaching millions across Nepal and worldwide.
                We provide seamless shipping, zero listing fees for 30 days, and dedicated merchant support.
              </p>

              {/* 3 Value bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px', fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#EA580C', fontWeight: 800 }}>✓</span>
                  <span>Zero setup &amp; registration fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#EA580C', fontWeight: 800 }}>✓</span>
                  <span>Reach over 100,000+ active customers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#EA580C', fontWeight: 800 }}>✓</span>
                  <span>Quick &amp; weekly automated payouts</span>
                </div>
              </div>

              <Link
                to="/vendor"
                style={{
                  backgroundColor: '#0A3871',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  padding: '11px 24px',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(10, 56, 113, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#072A52')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A3871')}
              >
                <span>Start Selling Today</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. THREE VALUE PROPOSITIONS (Image 1 Circular Badges) */}
        {/* ==================================================================== */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            textAlign: 'center',
            padding: '36px 0 54px 0',
            borderTop: '1px solid #edf2f7',
          }}
        >
          {/* Badge 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
              }}
            >
              🚚
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              FREE AND FAST DELIVERY
            </h4>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Free delivery for all orders over Rs. 2,000
            </div>
          </div>

          {/* Badge 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
              }}
            >
              🎧
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              24/7 CUSTOMER SERVICE
            </h4>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Friendly 24/7 customer support
            </div>
          </div>

          {/* Badge 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
              }}
            >
              🛡️
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              MONEY BACK GUARANTEE
            </h4>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              We return money within 7 days
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
