// ==============================================================================
// EVEREST PASAL - OFFICIAL HOME PAGE
// Exact implementation matching Brand Presentation Mockup & Color Scheme
// Dynamic Data Integration with Robust Mockup Fidelity
// Himalayan Blue (#0B4EA2), Nepali Crimson (#E63946), Clean White Backgrounds
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useCart } from '../../context/CartContext.js';
import { Link, useRouter } from '../../router/index.js';
import { BrandLogo } from '../../components/Common/BrandLogo.js';

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

interface CategoryCard {
  id: string;
  tag: string;
  itemCount?: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
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

  // Category Carousel State
  const [catOffset, setCatOffset] = useState<number>(0);

  // 4 Carousel Slides
  const heroSlides = [
    {
      id: 'slide-1',
      brand: 'SUMMER MEGA SALE',
      title: '60% OFF ON ALL STREETWEAR & SNEAKERS',
      subtitle: 'Exclusive discounts on t-shirts, active wear, sneakers, and casual fashion.',
      buttonText: 'Shop Now',
      link: '/products?sale=flash',
      imageUrl: '/images/hero_mega_sale_banner.jpg',
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
        isRedPromo: b.bg_color === '#DC2626' || b.image_url?.includes('hero_sale_banner') || b.image_url?.includes('hero_mega_sale_banner'),
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

  // Default Mockup Categories matching exact image 2
  const defaultCategoryList: CategoryCard[] = [
    {
      id: 'cat-gadgets',
      tag: 'Electronics',
      itemCount: '1,245 Items',
      name: 'Smartphones, laptops, and gadgets',
      description: 'Compare top brands, fast delivery, and trusted seller reviews.',
      imageUrl: '/images/cat_earbuds.jpg',
      link: '/products?category=electronics',
    },
    {
      id: 'cat-groceries',
      tag: 'Groceries',
      itemCount: '840 Items',
      name: 'Fresh produce and daily essentials',
      description: 'Fresh picks, pantry staples, and household supplies in one place.',
      imageUrl: '/images/cat_coffee.jpg',
      link: '/products?category=tea',
    },
    {
      id: 'cat-fashion',
      tag: 'Fashion',
      itemCount: '2,180 Items',
      name: 'Local brands and everyday wear',
      description: 'Discover heritage weaves, streetwear, and wardrobe staples from local sellers.',
      imageUrl: '/images/cat_fashion.jpg',
      link: '/products?category=apparel',
    },
    {
      id: 'cat-home',
      tag: 'Home & Kitchen',
      itemCount: '1,010 Items',
      name: 'Decor, cookware, and home care',
      description: 'Curated essentials for modern homes and everyday living.',
      imageUrl: '/images/cat_smartwatch.jpg',
      link: '/products?category=handicrafts',
    },
  ];

  // Default Mockup Products matching exact 4 archetypes replicated across 3 rows (12 items total) as shown in Image 1 & 2
  const fallbackMockupProducts: Product[] = [
    // Row 1
    {
      id: 'mock-1',
      name: 'Wireless Earbuds Pro',
      slug: 'wireless-earbuds-pro',
      brand: 'AEROTECH NEPAL',
      categoryTag: 'AEROTECH NEPAL',
      imageUrl: '/images/cat_earbuds.jpg',
      discountBadge: '25% OFF',
      rating: 4.8,
      price: 4500,
      comparePrice: 6000,
    },
    {
      id: 'mock-2',
      name: 'Himalayan Coffee Blend',
      slug: 'himalayan-coffee-blend',
      brand: 'HIMALAYAN BREWS',
      categoryTag: 'HIMALAYAN BREWS',
      imageUrl: '/images/cat_coffee.jpg',
      rating: 4.9,
      price: 1200,
    },
    {
      id: 'mock-3',
      name: 'Silk Dhaka Topi',
      slug: 'silk-dhaka-topi',
      brand: 'HERITAGE WEAVES',
      categoryTag: 'HERITAGE WEAVES',
      imageUrl: '/images/product_dhaka_topi.jpg',
      discountBadge: '20% OFF',
      rating: 4.7,
      price: 2800,
      comparePrice: 3500,
    },
    {
      id: 'mock-4',
      name: 'Smart Fitness Band',
      slug: 'smart-fitness-band',
      brand: 'FITLIFE STORE',
      categoryTag: 'FITLIFE STORE',
      imageUrl: '/images/cat_smartwatch.jpg',
      rating: 4.5,
      price: 3999,
    },
    // Row 2
    {
      id: 'mock-5',
      name: 'Wireless Earbuds Pro',
      slug: 'wireless-earbuds-pro-2',
      brand: 'AEROTECH NEPAL',
      categoryTag: 'AEROTECH NEPAL',
      imageUrl: '/images/cat_earbuds.jpg',
      discountBadge: '25% OFF',
      rating: 4.8,
      price: 4500,
      comparePrice: 6000,
    },
    {
      id: 'mock-6',
      name: 'Himalayan Coffee Blend',
      slug: 'himalayan-coffee-blend-2',
      brand: 'HIMALAYAN BREWS',
      categoryTag: 'HIMALAYAN BREWS',
      imageUrl: '/images/cat_coffee.jpg',
      rating: 4.9,
      price: 1200,
    },
    {
      id: 'mock-7',
      name: 'Silk Dhaka Topi',
      slug: 'silk-dhaka-topi-2',
      brand: 'HERITAGE WEAVES',
      categoryTag: 'HERITAGE WEAVES',
      imageUrl: '/images/product_dhaka_topi.jpg',
      discountBadge: '20% OFF',
      rating: 4.7,
      price: 2800,
      comparePrice: 3500,
    },
    {
      id: 'mock-8',
      name: 'Smart Fitness Band',
      slug: 'smart-fitness-band-2',
      brand: 'FITLIFE STORE',
      categoryTag: 'FITLIFE STORE',
      imageUrl: '/images/cat_smartwatch.jpg',
      rating: 4.5,
      price: 3999,
    },
    // Row 3
    {
      id: 'mock-9',
      name: 'Wireless Earbuds Pro',
      slug: 'wireless-earbuds-pro-3',
      brand: 'AEROTECH NEPAL',
      categoryTag: 'AEROTECH NEPAL',
      imageUrl: '/images/cat_earbuds.jpg',
      discountBadge: '25% OFF',
      rating: 4.8,
      price: 4500,
      comparePrice: 6000,
    },
    {
      id: 'mock-10',
      name: 'Himalayan Coffee Blend',
      slug: 'himalayan-coffee-blend-3',
      brand: 'HIMALAYAN BREWS',
      categoryTag: 'HIMALAYAN BREWS',
      imageUrl: '/images/cat_coffee.jpg',
      rating: 4.9,
      price: 1200,
    },
    {
      id: 'mock-11',
      name: 'Silk Dhaka Topi',
      slug: 'silk-dhaka-topi-3',
      brand: 'HERITAGE WEAVES',
      categoryTag: 'HERITAGE WEAVES',
      imageUrl: '/images/product_dhaka_topi.jpg',
      discountBadge: '20% OFF',
      rating: 4.7,
      price: 2800,
      comparePrice: 3500,
    },
    {
      id: 'mock-12',
      name: 'Smart Fitness Band',
      slug: 'smart-fitness-band-3',
      brand: 'FITLIFE STORE',
      categoryTag: 'FITLIFE STORE',
      imageUrl: '/images/cat_smartwatch.jpg',
      rating: 4.5,
      price: 3999,
    },
  ];

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setProductsLoading(true);
        const res = await ApiClient.get<any>('/api/v1/products?limit=12&sortBy=newest');
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.data)) list = res.data;
        else if (res && Array.isArray(res.products)) list = res.products;

        if (list.length > 0) {
          setProducts(
            list.map((p: any) => ({
              id: p.id,
              name: p.name || p.title || 'Product',
              slug: p.slug || p.id,
              categoryTag: (p.category || p.brand || 'AEROTECH NEPAL').toUpperCase(),
              imageUrl: p.imageUrl || p.image || '/images/cat_smartwatch.jpg',
              price: Number(p.price || p.min_price || 0),
              comparePrice: p.price ? Math.round(Number(p.price) * 1.25) : undefined,
              rating: p.rating || 4.8,
              brand: (p.brand || 'AEROTECH NEPAL').toUpperCase(),
              description: p.description,
              discountBadge: p.discountBadge || (p.price && Math.random() > 0.4 ? '25% OFF' : undefined),
            }))
          );
        }
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

  // Merge dynamic backend products with mockup fallback items to always display 12 cards
  const displayProducts = [...products, ...fallbackMockupProducts].slice(0, 12);

  // Map dynamic categories with fallback
  const displayCategories: CategoryCard[] = categories.length >= 4
    ? categories.map((cat, i) => {
        const fallback = defaultCategoryList[i % defaultCategoryList.length];
        const s = `${cat.name} ${cat.slug || ''}`.toLowerCase();
        let thumbnail = fallback.imageUrl;
        if (s.includes('gadget') || s.includes('phone') || s.includes('tech') || s.includes('laptop') || s.includes('elect')) thumbnail = '/images/cat_earbuds.jpg';
        else if (s.includes('food') || s.includes('groc') || s.includes('agro') || s.includes('tea') || s.includes('coffee')) thumbnail = '/images/cat_coffee.jpg';
        else if (s.includes('fash') || s.includes('wear') || s.includes('cloth') || s.includes('shoe')) thumbnail = '/images/cat_fashion.jpg';
        else if (s.includes('home') || s.includes('decor') || s.includes('cook') || s.includes('care')) thumbnail = '/images/cat_smartwatch.jpg';

        return {
          id: cat.id,
          tag: cat.code || fallback.tag,
          itemCount: fallback.itemCount,
          name: cat.name || fallback.name,
          description: cat.description || fallback.description,
          imageUrl: thumbnail,
          link: `/products?categoryId=${cat.id}`,
        };
      })
    : defaultCategoryList;

  // 4 visible categories per page
  const visibleCategories = displayCategories.slice(catOffset, catOffset + 4);
  if (visibleCategories.length < 4 && displayCategories.length >= 4) {
    visibleCategories.push(...displayCategories.slice(0, 4 - visibleCategories.length));
  }

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
        // Handled seamlessly in context
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
      {/* 1. HERO BANNER CAROUSEL (Exact Red Banner with 60% OFF Mockup) */}
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
          position: 'relative',
          overflow: 'hidden',
          transition: 'background-color 0.4s ease',
        }}
      >
        {activeHero.isRedPromo ? (
          /* Slide 1: Exact Flatlay Composition matching Mockup Image */
          <div
            onClick={() => navigate(activeHero.link)}
            style={{
              width: '100%',
              height: '480px',
              maxHeight: '480px',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: '#C8102E',
              overflow: 'hidden',
            }}
          >
            {/* White Logo Overlay at top-left inside banner */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '48px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'none',
              }}
            >
              <BrandLogo variant="white" height={36} />
            </div>

            <img
              key={activeHero.imageUrl}
              src={activeHero.imageUrl}
              alt={activeHero.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
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

        {/* Clickable Carousel Navigation Dots (Centered at bottom with active ring) */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
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
                border: 'none',
                outline: currentSlide === idx ? '2px solid #ffffff' : 'none',
                outlineOffset: currentSlide === idx ? '3px' : '0',
                backgroundColor: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease',
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

      {/* ==================================================================== */}
      {/* 2. PURE WHITE CONTAINER: SHOP BY CATEGORY & TRENDING PRODUCTS (Image 2) */}
      {/* ==================================================================== */}
      <div style={{ backgroundColor: '#ffffff', width: '100%', padding: '48px 0 60px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px' }}>

          {/* SHOP BY CATEGORY */}
          <section>
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
                  CATEGORIES
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Shop by Category
                </h2>
                <div style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
                  Curated picks loved by shoppers across Nepal
                </div>
              </div>

              {/* Carousel Navigation Arrows `<` and `>` matching screenshot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCatOffset((prev) => Math.max(0, prev - 1))}
                  disabled={catOffset === 0}
                  aria-label="Previous categories"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#ffffff',
                    color: catOffset === 0 ? '#94a3b8' : '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: catOffset === 0 ? 'default' : 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setCatOffset((prev) => (prev + 1) % displayCategories.length)}
                  aria-label="Next categories"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#0B4EA2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(11, 78, 162, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div
              className="responsive-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '20px',
              }}
            >
              {visibleCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(cat.link)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #EAE5DE',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#EAE5DE';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                    <span style={{ color: '#475569', backgroundColor: '#F8FAFC', padding: '3px 8px', borderRadius: '4px', border: '1px solid #EEF2F6' }}>
                      {cat.tag}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                      {cat.itemCount || 'Curated'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', marginBottom: '14px' }}>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4, flex: 1 }}>
                    {cat.description}
                  </p>
                  <div style={{ color: '#0B4EA2', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Explore</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ==================================================================== */}
          {/* TRENDING PRODUCTS (12 Products in 4x3 Grid Matching Mockup Image 1 & 2) */}
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
                  TOP SELECTIONS
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Trending Products
                </h2>
                <div style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
                  Curated picks loved by shoppers across Nepal
                </div>
              </div>

              <Link
                to="/products"
                style={{
                  backgroundColor: '#0B4EA2',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '9px 22px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(11, 78, 162, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#083B7A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B4EA2')}
              >
                See all products
              </Link>
            </div>

            {/* Dynamic & Mockup 4x3 Grid (12 Items) Matching Image 1 Exactly */}
            <div
              className="responsive-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '20px',
              }}
            >
              {displayProducts.map((prod) => {
                const isWishlisted = !!wishlist[prod.id];
                return (
                  <div
                    key={prod.id}
                    onClick={() => navigate(`/products/${prod.id}`)}
                    style={{
                      backgroundColor: '#FCFBF8',
                      border: '1.5px solid #EDE8E1',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      minWidth: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = '#EDE8E1';
                    }}
                  >
                    {/* Top Flush Image Container with Pure White Background */}
                    <div
                      style={{
                        width: '100%',
                        height: '190px',
                        backgroundColor: '#ffffff',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Red Discount Badge (Top-Left) */}
                      {prod.discountBadge && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: '#E63946',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 7px',
                            borderRadius: '4px',
                            zIndex: 2,
                            letterSpacing: '0.2px',
                          }}
                        >
                          {prod.discountBadge}
                        </div>
                      )}

                      {/* Circular Floating Wishlist Button (Top-Right) */}
                      <button
                        onClick={(e) => toggleWishlist(prod.id, e)}
                        aria-label="Add to Wishlist"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          padding: 0,
                          zIndex: 2,
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill={isWishlisted ? '#E63946' : 'none'}
                          stroke={isWishlisted ? '#E63946' : '#1E293B'}
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
                        style={{ maxWidth: '82%', maxHeight: '150px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/cat_smartwatch.jpg';
                        }}
                      />
                    </div>

                    {/* Content Area with Soft Warm White Tone */}
                    <div
                      style={{
                        padding: '12px 14px 14px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        backgroundColor: '#FCFBF8',
                        borderTop: '1px solid #F5EFE8',
                      }}
                    >
                      {/* Merchant Tag (Crimson Red Uppercase, Not bold) */}
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          color: '#E63946',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          marginBottom: '3px',
                        }}
                      >
                        {prod.categoryTag || prod.brand || 'AEROTECH NEPAL'}
                      </div>

                      {/* Product Title (Not bold) */}
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 500,
                          color: '#111827',
                          margin: '0 0 6px 0',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={prod.name}
                      >
                        {prod.name}
                      </h3>

                      {/* Outline Star Rating with Orange Border */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px' }}>
                        {[1, 2, 3, 4, 5].map((i) => {
                          const isFilled = i <= Math.floor(prod.rating || 4.5);
                          const strokeColor = isFilled ? '#EA580C' : '#CBD5E1';
                          return (
                            <svg
                              key={i}
                              width="12"
                              height="12"
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
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginLeft: '3px' }}>
                          ({(prod.rating || 4.5).toFixed(1)})
                        </span>
                      </div>

                      {/* Price & Blue Cart Button Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: '2px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 800,
                              color: '#111827',
                              letterSpacing: '-0.2px',
                            }}
                          >
                            Rs. {prod.price?.toLocaleString()}
                          </span>
                          {prod.comparePrice && (
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#E63946',
                                textDecoration: 'line-through',
                                fontWeight: 500,
                                marginTop: '1px',
                              }}
                            >
                              Rs. {prod.comparePrice?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={addingId === prod.id}
                          aria-label="Add to cart"
                          style={{
                            backgroundColor: '#0B4EA2',
                            color: '#ffffff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(11, 78, 162, 0.25)',
                            transition: 'background-color 0.15s ease, transform 0.15s ease',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#083B7A';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0B4EA2';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {addingId === prod.id ? (
                            '…'
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
          </section>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. RELIABLE DELIVERY ACROSS NEPAL (Soft Cream Band) */}
      {/* ==================================================================== */}
      <section
        style={{
          backgroundColor: '#FAF7F2',
          padding: '52px 24px',
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

      {/* ==================================================================== */}
      {/* 4. NEW ARRIVALS & MERCHANT PARTNERSHIP (Image 3) */}
      {/* ==================================================================== */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '48px 20px 60px 20px' }}>

          {/* NEW ARRIVAL PRODUCTS (Man's Collections) */}
          <section>
            <div style={{ marginBottom: '22px' }}>
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
                marginBottom: '48px',
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

            {/* Merchant Partnership Banner (Exact match to Image 3) */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #EAE5DE',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '0.95fr 1.25fr',
                alignItems: 'center',
                gap: '40px',
                padding: '32px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                marginBottom: '54px',
              }}
            >
              {/* Left Artisan Photo with Rounded Corners (Image 3) */}
              <div style={{ height: '340px', borderRadius: '16px', overflow: 'hidden' }}>
                <img
                  src="/images/merchant_artisan.jpg"
                  alt="Grow your business with Everest Pasal artisan merchant"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Right Merchant Content (Image 3) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #DBEAFE',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    padding: '4px 14px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                  }}
                >
                  Merchant Partnership
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                  Grow Your Business with Everest Pasal
                </h3>
                <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.55, margin: '0 0 22px 0' }}>
                  Join thousands of local businesses and independent sellers reaching eager customers across all of Nepal.
                  Benefit from easy onboarding, robust analytical toolsets, and our seamless fast-track logistics.
                </p>

                {/* 3 Value bullets with orange circular outline icons (Image 3) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '26px', fontSize: '13.5px', color: '#334155', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid #EA580C',
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      🏷️
                    </div>
                    <span>Free seller registration</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid #EA580C',
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      🚚
                    </div>
                    <span>Nationwide delivery network</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid #EA580C',
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      📊
                    </div>
                    <span>Real-time analytics dashboard</span>
                  </div>
                </div>

                <Link
                  to="/vendor"
                  style={{
                    backgroundColor: '#0B4EA2',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(11, 78, 162, 0.25)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#083B7A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B4EA2')}
                >
                  <span>Start Selling Today</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ==================================================================== */}
          {/* 5. THREE VALUE PROPOSITIONS (Image 1 Circular Badges on Pure White) */}
          {/* ==================================================================== */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              textAlign: 'center',
              padding: '36px 0 20px 0',
              borderTop: '1px solid #F1ECE4',
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

export default StorefrontPage;
