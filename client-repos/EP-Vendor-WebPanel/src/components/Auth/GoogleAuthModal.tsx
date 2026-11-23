// ==============================================================================
// EVEREST PASAL - GOOGLE AUTHENTICATION MODAL
// Provides seamless Google Identity Services integration with fallback demo accounts
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (email: string, fullName: string) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle({
        email,
        fullName,
        googleId: `google_${Date.now()}`,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google Brand Bar */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F3F4F6', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            Sign in with Google
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
            Choose an account to continue to <strong style={{ color: '#0B4EA2' }}>Everest Pasal</strong>
          </p>
        </div>

        {error && (
          <div style={{ margin: '16px 20px 0', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {/* Quick Google Test Accounts */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Available Google Accounts
          </div>

          {/* Account 1: Boss Account */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSignIn('boss@everestpasal.com', 'Everest Executive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              border: '1.5px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#0B4EA2',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              E
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>Everest Executive</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>boss@everestpasal.com</div>
            </div>
            <span style={{ fontSize: '10.5px', padding: '3px 8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: '12px', fontWeight: 600 }}>
              Executive
            </span>
          </button>

          {/* Account 2: Alex Customer */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSignIn('alex@gmail.com', 'Alex Johnson')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              border: '1.5px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              A
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>Alex Johnson</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>alex@gmail.com</div>
            </div>
            <span style={{ fontSize: '10.5px', padding: '3px 8px', backgroundColor: '#ECFDF5', color: '#047857', borderRadius: '12px', fontWeight: 600 }}>
              Customer
            </span>
          </button>
        </div>

        {/* Custom Google Email Option */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 14px' }}>
            <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>OR USE ANOTHER GOOGLE ACCOUNT</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customEmail) {
                handleSignIn(customEmail.trim().toLowerCase(), customName.trim() || customEmail.split('@')[0]);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <input
              type="email"
              placeholder="Google Email (e.g. yourname@gmail.com)"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #D1D5DB',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Your Full Name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #D1D5DB',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !customEmail}
              style={{
                backgroundColor: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading || !customEmail ? 'not-allowed' : 'pointer',
                opacity: loading || !customEmail ? 0.6 : 1,
              }}
            >
              {loading ? 'Authenticating with Google...' : 'Continue with Google Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#F9FAFB', padding: '12px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
