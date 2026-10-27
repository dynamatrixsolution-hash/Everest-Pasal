// ==============================================================================
// EVEREST PASAL - LOGIN PAGE (Image 3 Mockup)
// Split screen layout: Creative workspace photography (left) + Auth Card (right)
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useRouter, Link } from '../router/index.js';
import { BrandLogo } from '../components/Common/BrandLogo.js';

interface LoginPageProps {
  onSwitchToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const { navigate, query } = useRouter();

  const [email, setEmail] = useState('alex@email.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const redirectTarget = query.get('redirect');

  const executeLogin = async (emailVal: string, passVal: string, directRoute?: string) => {
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(emailVal, passVal);
      if (directRoute) {
        navigate(directRoute);
      } else if (redirectTarget) {
        navigate(redirectTarget);
      } else {
        const hasAdmin = loggedUser?.roles?.some((r) => {
          const roleUpper = (r.role || '').toUpperCase();
          return (
            ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'PLATFORM_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT'].includes(roleUpper) ||
            roleUpper.startsWith('ADMIN')
          );
        });
        const hasVendor = loggedUser?.roles?.some((r) => {
          const roleUpper = (r.role || '').toUpperCase();
          return (
            ['VENDOR', 'SELLER', 'VENDOR_SELLER', 'VENDOR_ADMIN', 'VENDOR_STAFF'].includes(roleUpper) ||
            roleUpper.startsWith('VENDOR') ||
            roleUpper.startsWith('SELLER')
          );
        });

        if (hasAdmin) {
          navigate('/admin');
        } else if (hasVendor) {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        backgroundColor: '#F7F4EE',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. LEFT COLUMN: LIFESTYLE PHOTOGRAPHY (Image 3 Left) */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1c1917',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/images/auth_login_lifestyle.jpg"
          alt="Everest Pasal Creative Workspace"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            minHeight: '100vh',
          }}
        />
        {/* Subtle gradient vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>

      {/* 2. RIGHT COLUMN: AUTHENTICATION CARD (Image 3 Right) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#FAF7F2',
            border: '1px solid #EBE5DB',
            borderRadius: '24px',
            padding: '44px 38px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <BrandLogo variant="horizontal" height={38} />
          </div>

          {/* Heading & Subtitle */}
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              marginBottom: '28px',
              lineHeight: 1.4,
            }}
          >
            Sign in to your Everest Pasal account and continue where you left off.
          </p>

          {/* Active Session Notice */}
          {isAuthenticated && user && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '12.5px',
                color: '#065f46',
                textAlign: 'left',
              }}
            >
              <div>Signed in as <strong>{user.fullName}</strong></div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                  }}
                >
                  Storefront →
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                marginBottom: '18px',
                textAlign: 'left',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #d9d2c5',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d2c5')}
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #d9d2c5',
                    backgroundColor: '#ffffff',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#d9d2c5')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '22px',
                fontSize: '12.5px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#E63946', cursor: 'pointer' }}
                />
                <span>Keep me logged in</span>
              </label>

              <Link
                to="/forgot-password"
                style={{
                  color: '#E63946',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Main Log In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#0B4EA2',
                color: '#ffffff',
                padding: '13px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(11, 78, 162, 0.3)',
                marginBottom: '18px',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>
            <span>Don't have an account? </span>
            <Link
              to="/register"
              onClick={onSwitchToRegister}
              style={{
                color: '#0B4EA2',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Create an account
            </Link>
          </div>

          {/* Or continue with divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '11.5px',
              color: '#94a3b8',
              marginBottom: '20px',
            }}
          >
            <span style={{ flex: 1, height: '1px', backgroundColor: '#e2d9cc' }} />
            <span>Or continue with</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: '#e2d9cc' }} />
          </div>

          {/* 3 Social Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {/* Google */}
            <button
              type="button"
              aria-label="Continue with Google"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              aria-label="Continue with Facebook"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Instagram */}
            <button
              type="button"
              aria-label="Continue with Instagram"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
                  <stop stopColor="#fdf497" offset="0%" />
                  <stop stopColor="#fdf497" offset="5%" />
                  <stop stopColor="#fd5949" offset="45%" />
                  <stop stopColor="#d6249f" offset="60%" />
                  <stop stopColor="#285AEB" offset="90%" />
                </radialGradient>
                <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
          </div>

          {/* Quick Demo Switcher */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #e2d9cc',
              fontSize: '11.5px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
              ⚡ 1-Click Demo Accounts:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => executeLogin('vendor@everestpasal.com', 'Password@123', '/vendor')}
                title="Everest Official Store (4 products, 2 orders)"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#0d9488',
                }}
              >
                🏬 Everest Direct
              </button>
              <button
                type="button"
                onClick={() => executeLogin('sherpa@everestpasal.com', 'Password@123', '/vendor')}
                title="Sherpa Adventure Outfitters (2 products, 5 orders)"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#2563eb',
                }}
              >
                🏔️ Sherpa Gear
              </button>
              <button
                type="button"
                onClick={() => executeLogin('himalaya@everestpasal.com', 'Password@123', '/vendor')}
                title="Himalayan Organic Traders (2 products, 0 orders)"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#16a34a',
                }}
              >
                🌿 Himalayan Herbs
              </button>
              <button
                type="button"
                onClick={() => executeLogin('crafts@everestpasal.com', 'Password@123', '/vendor')}
                title="Patan Heritage Crafts (0 products, 0 orders)"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#d97706',
                }}
              >
                🏺 Patan Crafts
              </button>
              <button
                type="button"
                onClick={() => executeLogin('admin@everestpasal.com', 'Password@123', '/admin')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#7c3aed',
                }}
              >
                ⚙️ Admin
              </button>
              <button
                type="button"
                onClick={() => executeLogin('customer@everestpasal.com', 'Password@123', '/')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#0B4EA2',
                }}
              >
                👤 Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
