// ==============================================================================
// EVEREST PASAL - ROUTE AUTHORIZATION GUARDS
// Enforces Customer, Vendor, and Admin security boundaries on client-side routes
// ==============================================================================

import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter, Link } from '../../router/index.js';

interface GuardProps {
  children: React.ReactNode;
}

/**
 * Customer Guard: Protects customer checkout, cart, and order history
 */
export const CustomerGuard: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
        Verifying customer session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '60px auto',
          padding: '32px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '8px' }}>
          Customer Login Required
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
          Please sign in to your Everest Pasal account to access your shopping cart, checkout, or track your orders.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontWeight: 600 }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontWeight: 600 }}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Vendor Guard: Protects /vendor/* Seller Center routes
 */
export const VendorGuard: React.FC<GuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
        Authorizing merchant credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '60px auto',
          padding: '32px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏬</div>
        <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '8px' }}>
          Vendor Seller Center Login
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
          You must be logged in with an authorized seller account to access the Vendor Management Panel.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/vendor')}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontWeight: 600 }}
        >
          Vendor Login
        </button>
      </div>
    );
  }

  const hasVendorRole = user?.roles?.some((r) => {
    const roleUpper = (r.role || '').toUpperCase();
    return (
      ['VENDOR', 'SELLER', 'VENDOR_SELLER', 'VENDOR_ADMIN', 'VENDOR_STAFF', 'PLATFORM_ADMIN', 'ADMIN', 'SUPER_ADMIN'].includes(roleUpper) ||
      roleUpper.startsWith('VENDOR') ||
      roleUpper.startsWith('SELLER')
    );
  });

  if (!hasVendorRole) {
    return (
      <div
        style={{
          maxWidth: '540px',
          margin: '60px auto',
          padding: '36px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #ef4444',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛔</div>
        <span
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          403 Forbidden • Access Denied
        </span>
        <h2 style={{ color: '#f8fafc', fontSize: '20px', margin: '14px 0 8px 0' }}>
          Vendor Authorization Required
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Your account (<strong>{user?.fullName}</strong>) is registered as a customer and does not have merchant seller privileges. To sell products on Everest Pasal, please submit a vendor onboarding application.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontWeight: 600 }}
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Admin Guard: Protects /admin/* Platform Control Center routes
 */
export const AdminGuard: React.FC<GuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
        Verifying administrator privileges...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '60px auto',
          padding: '32px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
        <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '8px' }}>
          Admin Control Center Login
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
          Platform management requires an authenticated Administrator session.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/admin')}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontWeight: 600 }}
        >
          Administrator Login
        </button>
      </div>
    );
  }

  const hasAdminRole = user?.roles?.some((r) => {
    const roleUpper = (r.role || '').toUpperCase();
    return (
      ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'PLATFORM_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT'].includes(roleUpper) ||
      roleUpper.startsWith('ADMIN') ||
      roleUpper.startsWith('SUPER_ADMIN')
    );
  });

  if (!hasAdminRole) {
    return (
      <div
        style={{
          maxWidth: '540px',
          margin: '60px auto',
          padding: '36px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #ef4444',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛔</div>
        <span
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          403 Forbidden • Access Denied
        </span>
        <h2 style={{ color: '#f8fafc', fontSize: '20px', margin: '14px 0 8px 0' }}>
          Platform Administrator Privileges Required
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Access to the Admin Control Center is restricted to verified system operators and platform administrators.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontWeight: 600 }}
        >
          ← Return to Storefront
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
