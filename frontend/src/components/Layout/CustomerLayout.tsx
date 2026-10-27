// ==============================================================================
// EVEREST PASAL - OFFICIAL STOREFRONT LAYOUT
// Exact implementation matching Brand Identity & Mockup (Image 1 & Image 2)
// Himalayan Blue (#0B4EA2), Nepali Crimson (#E63946), Saffron Amber (#F4A261)
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useRouter, Link } from '../../router/index.js';
import { BrandLogo } from '../Common/BrandLogo.js';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { navigate, path } = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug?: string }>>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await ApiClient.get<any>('/api/v1/categories');
        if (res && res.categories) {
          setCategories(res.categories);
        } else if (Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.warn('Failed to load dynamic nav categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isVendor = user?.roles?.some((r) => {
    const code = (r.role || '').toUpperCase();
    return code.includes('VENDOR') || code.includes('SELLER');
  });
  const isAdmin = user?.roles?.some((r) => {
    const code = (r.role || '').toUpperCase();
    return code.includes('ADMIN') || code.includes('OPERATOR');
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF3E9', color: '#0f172a', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 1. TOP RED ANNOUNCEMENT STRIP (Exact Image Mockup) */}
      <div
        className="site-announcement-strip"
        style={{
          backgroundColor: '#E63946',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 20px',
          textAlign: 'center',
          letterSpacing: '0.2px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!</span>
          <Link
            to="/products"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            ShopNow
          </Link>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header
        style={{
          backgroundColor: '#FAF3E9',
          borderBottom: '1px solid #ECE3D4',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          className="site-header-inner"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <BrandLogo variant="horizontal" height={40} />
          </Link>

          {/* Search Bar - Icon on LEFT, placeholder 'What are you looking for?' matching screenshot */}
          <form
            onSubmit={handleSearch}
            className="site-search-form"
            style={{
              flex: 1,
              maxWidth: '560px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 20px 10px 44px',
                borderRadius: '30px',
                border: '1.5px solid #dbe2ea',
                fontSize: '13.5px',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0A3871';
                e.target.style.boxShadow = '0 0 0 3px rgba(10, 56, 113, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dbe2ea';
                e.target.style.boxShadow = 'none';
              }}
            />
          </form>

          {/* Right Action Icons & Buttons */}
          <div className="site-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>

            {/* Wishlist Heart Icon */}
            <Link
              to="/account?tab=wishlist"
              title="Wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: '#1e293b',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </Link>

            {/* Shopping Cart Icon with Badge */}
            <Link
              to="/cart"
              title="Shopping Cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: '#1e293b',
                textDecoration: 'none',
                position: 'relative',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {(cart?.totalItems || 0) > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    backgroundColor: '#DC2626',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {cart?.totalItems}
                </span>
              )}
            </Link>

            {/* User Auth Buttons: Solid Red Sign In & Outlined Blue Track Order */}
            {!isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/login"
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#ffffff',
                    padding: '8px 22px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    letterSpacing: '0.2px',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                >
                  Sign In
                </Link>
                <Link
                  to="/track"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0A3871',
                    border: '1.5px solid #0A3871',
                    padding: '7px 18px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(10, 56, 113, 0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span>Track Order</span>
                  <span style={{ fontSize: '13px' }}>📍</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isVendor && (
                  <Link
                    to="/vendor"
                    style={{
                      backgroundColor: '#0A3871',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Vendor Panel
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    style={{
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Admin
                  </Link>
                )}

                {/* Profile Icon Dropdown Trigger Container */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    title="Account & Profile"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isProfileDropdownOpen ? '#EDF4FC' : '#FAF8F5',
                      border: isProfileDropdownOpen ? '1.5px solid #0A3871' : '1.5px solid #E2E8F0',
                      color: '#0A3871',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>

                  {/* Profile Dropdown Card */}
                  {isProfileDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #EDE8E1',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
                        padding: '16px 20px',
                        minWidth: '220px',
                        zIndex: 1000,
                      }}
                    >
                      {/* User Info Header */}
                      <div
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/account?tab=profile');
                        }}
                        style={{
                          cursor: 'pointer',
                          paddingBottom: '12px',
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 2px 0',
                          }}
                        >
                          {user?.fullName || 'Nirmal GC'}
                        </h4>
                        <p
                          style={{
                            fontSize: '12.5px',
                            color: '#4B5563',
                            margin: 0,
                          }}
                        >
                          Customer Account
                        </p>
                      </div>

                      {/* My Profile Link */}
                      <div style={{ paddingTop: '10px', paddingBottom: '4px' }}>
                        <Link
                          to="/account?tab=profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 0',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0A3871')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>My Profile</span>
                        </Link>
                      </div>

                      {/* Sign Out Button */}
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 0',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#DC2626',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="21" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. CATEGORY NAVIGATION SUB-BAR (No horizontal scrolling or scrollbars) */}
        <div
          style={{
            backgroundColor: '#FAF3E9',
            borderTop: '1px solid #ECE3D4',
            borderBottom: '1px solid #ECE3D4',
            padding: '10px 24px',
            overflow: 'hidden',
          }}
        >
          <div
            className="no-scrollbar"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontSize: '13px',
            }}
          >
            {/* All Categories */}
            <Link
              to="/categories"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#111827',
                fontWeight: 700,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span>All Categories</span>
            </Link>

            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  fontWeight: 500,
                  flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0A3871')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/categories"
              style={{
                color: '#DC2626',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                flexShrink: 0,
              }}
            >
              View More
            </Link>
          </div>
        </div>
      </header>

      {/* Main Storefront Body Content */}
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {/* 4. UNIFIED OFFICIAL FOOTER (Exact Navy Theme Matching Image Mockup) */}
      <footer
        style={{
          backgroundColor: '#0A4275',
          color: '#ffffff',
          marginTop: 'auto',
          padding: '52px 24px 0 24px',
        }}
      >
        <div
          className="site-footer-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.3fr',
            gap: '36px',
            paddingBottom: '44px',
          }}
        >
          {/* Col 1: Brand Logo Box, Description & Socials */}
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '16px',
              }}
            >
              <BrandLogo variant="horizontal" height={34} />
            </div>
            <p
              style={{
                fontSize: '13px',
                color: '#E2E8F0',
                lineHeight: 1.6,
                margin: '0 0 20px 0',
                maxWidth: '300px',
              }}
            >
              Nepal's full-scale multi-vendor marketplace connecting authentic producers with customers across the nation.
            </p>
            {/* Social Media Circular Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { name: 'Facebook', icon: 'f', link: 'https://facebook.com' },
                { name: 'Instagram', icon: '📸', link: 'https://instagram.com' },
                { name: 'LinkedIn', icon: 'in', link: 'https://linkedin.com' },
                { name: 'YouTube', icon: '▶', link: 'https://youtube.com' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#072A52',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#072A52')}
                  title={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: SHOP */}
          <div>
            <h5
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              SHOP
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
              <Link to="/categories" style={{ color: 'inherit', textDecoration: 'none' }}>All Categories</Link>
              <Link to="/products?category=apparel" style={{ color: 'inherit', textDecoration: 'none' }}>Clothing</Link>
              <Link to="/products?filter=new" style={{ color: 'inherit', textDecoration: 'none' }}>New Arrivals</Link>
              <Link to="/products?sale=flash" style={{ color: 'inherit', textDecoration: 'none' }}>Special Offers</Link>
            </div>
          </div>

          {/* Col 3: SUPPORT */}
          <div>
            <h5
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              SUPPORT
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
              <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Help Center</Link>
              <Link to="/track" style={{ color: 'inherit', textDecoration: 'none' }}>Track Order</Link>
              <Link to="/returns" style={{ color: 'inherit', textDecoration: 'none' }}>Returns &amp; Refunds</Link>
              <Link to="/faqs" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs</Link>
            </div>
          </div>

          {/* Col 4: SELL */}
          <div>
            <h5
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              SELL
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
              <Link to="/vendor" style={{ color: 'inherit', textDecoration: 'none' }}>Become a Seller</Link>
              <Link to="/login?redirect=/vendor" style={{ color: 'inherit', textDecoration: 'none' }}>Seller Login</Link>
              <Link to="/vendor" style={{ color: 'inherit', textDecoration: 'none' }}>Seller Support Guidelines</Link>
              <Link to="/vendor" style={{ color: 'inherit', textDecoration: 'none' }}>Partnering Terms</Link>
            </div>
          </div>

          {/* Col 5: DOWNLOAD APP */}
          <div>
            <h5
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              DOWNLOAD APP
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Google Play Button */}
              <div
                style={{
                  backgroundColor: '#072A52',
                  border: '1px solid #1E4976',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: '160px',
                }}
              >
                <span style={{ fontSize: '16px' }}>▶</span>
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase' }}>GET IT ON</div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>Google Play</div>
                </div>
              </div>
              {/* App Store Button */}
              <div
                style={{
                  backgroundColor: '#072A52',
                  border: '1px solid #1E4976',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: '160px',
                }}
              >
                <span style={{ fontSize: '17px' }}>🍏</span>
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Download on the</div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Bottom Bar */}
        <div
          style={{
            backgroundColor: '#062344',
            margin: '0 -24px',
            padding: '18px 24px',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              fontSize: '12px',
              color: '#94A3B8',
            }}
          >
            <div>© 2026 Everest Pasal. All rights reserved.</div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/terms" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Terms of Service</Link>
              <span>|</span>
              <Link to="/privacy" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#CBD5E1', letterSpacing: '0.5px' }}>SECURE CHECKOUT</span>
              <span style={{ backgroundColor: '#ffffff', color: '#1a1f71', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>VISA</span>
              <span style={{ backgroundColor: '#ffffff', color: '#eb001b', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>MASTERCARD</span>
              <span style={{ backgroundColor: '#60bb46', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>eSewa</span>
              <span style={{ backgroundColor: '#5d2e8e', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>Khalti</span>
              <span style={{ backgroundColor: '#005baa', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>ConnectIPS</span>
              <span style={{ backgroundColor: '#d9252c', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>Fonepay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


