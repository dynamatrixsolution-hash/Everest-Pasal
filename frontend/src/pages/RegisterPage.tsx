// ==============================================================================
// EVEREST PASAL - REGISTER PAGE (Image 4 Mockup)
// Split screen layout: Creative packaging photography (left) + Register Card (right)
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useRouter, Link } from '../router/index.js';
import { BrandLogo } from '../components/Common/BrandLogo.js';

interface RegisterPageProps {
  onSwitchToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { navigate } = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the terms and privacy policy to continue.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName || 'Valued Customer',
      });
      // Redirect to Email Verification page
      navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
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
      {/* 1. LEFT COLUMN: PACKAGING LIFESTYLE PHOTOGRAPHY (Image 4 Left) */}
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
          src="/images/auth_signup_lifestyle.jpg"
          alt="Everest Pasal Artisanal Products"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            minHeight: '100vh',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)',
          }}
        />
      </div>

      {/* 2. RIGHT COLUMN: REGISTER AUTH CARD (Image 4 Right) */}
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
            padding: '40px 38px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
            <BrandLogo variant="horizontal" height={38} />
          </div>

          {/* Heading & Subtitle */}
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            Create an account
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: 1.4,
            }}
          >
            Join Everest Pasal and start shopping in seconds.
          </p>

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
            {/* First Name */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '5px',
                }}
              >
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #d9d2c5',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d2c5')}
              />
            </div>

            {/* Last Name */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '5px',
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #d9d2c5',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d2c5')}
              />
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '5px',
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
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #d9d2c5',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d2c5')}
              />
            </div>

            {/* Create Password with Eye Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '5px',
                }}
              >
                Create Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #d9d2c5',
                    backgroundColor: '#ffffff',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
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

            {/* Terms Agreement Checkbox */}
            <div style={{ marginBottom: '20px', fontSize: '12.5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: '#E63946', cursor: 'pointer' }}
                />
                <span>I agree to the terms and privacy policy</span>
              </label>
            </div>

            {/* Main Create Account Button */}
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
                marginBottom: '16px',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Creating account...' : 'Create an account'}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            <span>Already have an account? </span>
            <Link
              to="/login"
              onClick={onSwitchToLogin}
              style={{
                color: '#0B4EA2',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '11.5px',
              color: '#94a3b8',
              marginBottom: '18px',
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
            }}
          >
            {/* Google */}
            <button
              type="button"
              aria-label="Register with Google"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
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
              aria-label="Register with Facebook"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Instagram */}
            <button
              type="button"
              aria-label="Register with Instagram"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #dcd5c9',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <radialGradient id="ig-grad-reg" r="150%" cx="30%" cy="107%">
                  <stop stopColor="#fdf497" offset="0%" />
                  <stop stopColor="#fdf497" offset="5%" />
                  <stop stopColor="#fd5949" offset="45%" />
                  <stop stopColor="#d6249f" offset="60%" />
                  <stop stopColor="#285AEB" offset="90%" />
                </radialGradient>
                <path fill="url(#ig-grad-reg)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
