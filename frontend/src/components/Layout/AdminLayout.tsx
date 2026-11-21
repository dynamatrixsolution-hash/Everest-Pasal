// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER LAYOUT
// Pixel-perfect reproduction of Master Admin screenshots
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter, Link } from '../../router/index.js';
import { BrandLogo } from '../Common/BrandLogo.js';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Warehouse,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Headphones,
  Star,
  Wallet,
  Tag,
  FileText,
  Bell,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  Settings,
  ShieldAlert,
  Cpu,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();

  // Navigation search filter
  const [navSearch, setNavSearch] = useState('');
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isVendorOpen, setIsVendorOpen] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const [isOrderOpen, setIsOrderOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [isReturnsOpen, setIsReturnsOpen] = useState(true);

  const isCustomerPath = path.startsWith('/admin/customers');
  const isVendorPath =
    path.startsWith('/admin/vendors') ||
    path.startsWith('/admin/vendor-applications');
  const isCatalogPath =
    path.startsWith('/admin/products') ||
    path.startsWith('/admin/product-approvals') ||
    path.startsWith('/admin/categories') ||
    path.startsWith('/admin/brands') ||
    path.startsWith('/admin/attributes');
  const isInventoryPath = path.startsWith('/admin/inventory');
  const isOrderPath = path.startsWith('/admin/orders');
  const isPaymentPath = path.startsWith('/admin/payments');
  const isDeliveryPath = path.startsWith('/admin/delivery') || path.startsWith('/admin/logistics');
  const isReturnsPath = path.startsWith('/admin/returns');
  const isDashboardPath =
    path === '/admin' ||
    path === '/admin/' ||
    path === '/admin/overview' ||
    path === '/admin/dashboard' ||
    path.startsWith('/admin/sales-summary') ||
    path.startsWith('/admin/orders-summary') ||
    path.startsWith('/admin/revenue-summary') ||
    path.startsWith('/admin/pending-approvals') ||
    path.startsWith('/admin/alerts-notifications');

  // Determine current page title for breadcrumb
  const getBreadcrumbTitle = () => {
    if (path === '/admin/sales-summary') return 'Sales Summary';
    if (path === '/admin/orders-summary') return 'Orders Summary';
    if (path === '/admin/revenue-summary') return 'Revenue Summary';
    if (path === '/admin/pending-approvals') return 'Pending Approvals';
    if (path === '/admin/alerts-notifications') return 'Alerts & Notifications';
    if (path === '/admin/products') return 'Products & Catalog';
    if (path === '/admin/banners') return 'Content Management (CMS)';
    if (path === '/admin/vendors') return 'Vendor Management';
    if (path === '/admin/customers') return 'Customer Management';
    if (path === '/admin/orders') return 'Order Management';
    if (path === '/admin/audits') return 'Security & Audit';
    if (path === '/admin/health') return 'System Operations';
    return 'Dashboard';
  };

  const dashboardSubItems = [
    { label: 'Overview', to: '/admin' },
    { label: 'Sales Summary', to: '/admin/sales-summary' },
    { label: 'Orders Summary', to: '/admin/orders-summary' },
    { label: 'Revenue Summary', to: '/admin/revenue-summary' },
    { label: 'Pending Approvals', to: '/admin/pending-approvals' },
    { label: 'Alerts & Notifications', to: '/admin/alerts-notifications' },
  ];

  const marketplaceItems: { label: string; to: string; icon: any }[] = [];

  const businessItems = [
    { label: 'Agent Management', to: '/admin/agents', icon: Headphones },
    { label: 'Influencer Management', to: '/admin/influencers', icon: Star },
    { label: 'Finance & Settlements', to: '/admin/finance', icon: Wallet },
    { label: 'Promotions & Marketing', to: '/admin/promotions', icon: Tag },
  ];

  const contentItems = [
    { label: 'Content Management (CM...', to: '/admin/banners', icon: FileText },
    { label: 'Notifications & Communica...', to: '/admin/notifications', icon: Bell },
    { label: 'Support Management', to: '/admin/support', icon: HelpCircle },
  ];

  const analyticsItems = [
    { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { label: 'User & Access Management', to: '/admin/users', icon: ShieldCheck },
    { label: 'System Settings', to: '/admin/settings', icon: Settings },
    { label: 'Security & Audit', to: '/admin/audits', icon: ShieldAlert },
    { label: 'System Operations', to: '/admin/health', icon: Cpu },
  ];

  const isCurrentSubItem = (itemTo: string) => {
    if (itemTo === '/admin') {
      return path === '/admin' || path === '/admin/' || path === '/admin/overview' || path === '/admin/dashboard';
    }
    return path === itemTo;
  };

  const isCurrentParent = (itemTo: string) => path.startsWith(itemTo);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ================================================================ */}
      {/* LEFT SIDEBAR (Width 260px, White, Clean Borders) */}
      {/* ================================================================ */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #F8FAFC',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <BrandLogo variant="horizontal" height={36} />
        </div>

        {/* Navigation Search */}
        <div style={{ padding: '12px 16px 8px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 10px',
              gap: '8px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search navigation"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px 24px 12px',
          }}
        >
          {/* GROUP 1: MARKETPLACE MANAGEMENT */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                padding: '6px 8px',
                textTransform: 'uppercase',
              }}
            >
              MARKETPLACE MANAGEMENT
            </div>

            {/* Dashboard Navigation Group */}
            {isDashboardPath ? (
              <div style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutDashboard size={16} color="#FFFFFF" />
                    <span>Dashboard</span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#FFFFFF"
                    style={{
                      transform: isDashboardOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Dashboard Sub-Items */}
                {isDashboardOpen && (
                  <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                    {dashboardSubItems.map((sub) => {
                      const active = isCurrentSubItem(sub.to);
                      return (
                        <div
                          key={sub.to}
                          onClick={() => navigate(sub.to)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '7.5px 12px',
                            margin: '2px 0',
                            fontSize: '12.5px',
                            fontWeight: active ? 600 : 500,
                            color: active ? '#E63946' : '#475569',
                            borderLeft: active ? '3px solid #E63946' : '3px solid transparent',
                            borderRadius: '0 6px 6px 0',
                            backgroundColor: active ? '#FFF1F2' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {sub.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LayoutDashboard size={15} color="#64748B" />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* Customer Management Navigation Group */}
            {isCustomerPath ? (
              <div style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} color="#FFFFFF" />
                    <span>Customer Management</span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#FFFFFF"
                    style={{
                      transform: isCustomerOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Customer Management Sub-Items */}
                {isCustomerOpen && (
                  <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                    <div
                      onClick={() => navigate('/admin/customers')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#E63946',
                        borderLeft: '3px solid #E63946',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: '#FFF1F2',
                        cursor: 'pointer',
                      }}
                    >
                      All Customers
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/customers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={15} color="#64748B" />
                  <span>Customer Management</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* Vendor Management Navigation Group */}
            {isVendorPath ? (
              <div style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => setIsVendorOpen(!isVendorOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Store size={16} color="#FFFFFF" />
                    <span>Vendor Management</span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#FFFFFF"
                    style={{
                      transform: isVendorOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Vendor Management Sub-Items */}
                {isVendorOpen && (
                  <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                    {/* All Vendors */}
                    <div
                      onClick={() => navigate('/admin/vendors')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/vendors' ? 600 : 500,
                        color: path === '/admin/vendors' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/vendors' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/vendors' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>All Vendors</span>
                    </div>

                    {/* Vendor Applications with Pink Badge 37 */}
                    <div
                      onClick={() => navigate('/admin/vendor-applications')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight:
                          path.startsWith('/admin/vendor-applications') ||
                          path.startsWith('/admin/vendors/applications')
                            ? 600
                            : 500,
                        color:
                          path.startsWith('/admin/vendor-applications') ||
                          path.startsWith('/admin/vendors/applications')
                            ? '#E63946'
                            : '#475569',
                        borderLeft:
                          path.startsWith('/admin/vendor-applications') ||
                          path.startsWith('/admin/vendors/applications')
                            ? '3px solid #E63946'
                            : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor:
                          path.startsWith('/admin/vendor-applications') ||
                          path.startsWith('/admin/vendors/applications')
                            ? '#FFF1F2'
                            : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Vendor Applications</span>
                      <span
                        style={{
                          backgroundColor: '#FFE4E6',
                          color: '#E63946',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '9999px',
                        }}
                      >
                        37
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/vendors')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Store size={15} color="#64748B" />
                  <span>Vendor Management</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* Product & Catalog Management Navigation Group */}
            {isCatalogPath ? (
              <div style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={16} color="#FFFFFF" />
                    <span>Product & Catalog Man...</span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#FFFFFF"
                    style={{
                      transform: isCatalogOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Sub-Items */}
                {isCatalogOpen && (
                  <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                    {/* All Products */}
                    <div
                      onClick={() => navigate('/admin/products')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/products' ? 600 : 500,
                        color: path === '/admin/products' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/products' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/products' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>All Products</span>
                    </div>

                    {/* Product Approvals with Pink Badge 58 */}
                    <div
                      onClick={() => navigate('/admin/product-approvals')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/product-approvals') ? 600 : 500,
                        color: path.startsWith('/admin/product-approvals') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/product-approvals') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/product-approvals') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Product Approvals</span>
                      <span
                        style={{
                          backgroundColor: '#FFE4E6',
                          color: '#E63946',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '9999px',
                        }}
                      >
                        58
                      </span>
                    </div>

                    {/* Categories */}
                    <div
                      onClick={() => navigate('/admin/categories')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/categories') ? 600 : 500,
                        color: path.startsWith('/admin/categories') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/categories') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/categories') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Categories</span>
                    </div>

                    {/* Brands */}
                    <div
                      onClick={() => navigate('/admin/brands')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/brands') ? 600 : 500,
                        color: path.startsWith('/admin/brands') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/brands') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/brands') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Brands</span>
                    </div>

                    {/* Attributes */}
                    <div
                      onClick={() => navigate('/admin/attributes')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/attributes') ? 600 : 500,
                        color: path.startsWith('/admin/attributes') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/attributes') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/attributes') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Attributes</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={15} color="#64748B" />
                  <span>Product & Catalog Man...</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* Inventory Management Navigation Group */}
            {isInventoryPath ? (
              <div style={{ marginBottom: '6px' }}>
                <div
                  onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Warehouse size={16} color="#FFFFFF" />
                    <span>Inventory Management</span>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#FFFFFF"
                    style={{
                      transform: isInventoryOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Sub-Items */}
                {isInventoryOpen && (
                  <div style={{ marginTop: '4px', paddingLeft: '8px' }}>
                    {/* Inventory Overview */}
                    <div
                      onClick={() => navigate('/admin/inventory')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/inventory' || path === '/admin/inventory/overview' ? 600 : 500,
                        color: path === '/admin/inventory' || path === '/admin/inventory/overview' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/inventory' || path === '/admin/inventory/overview' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/inventory' || path === '/admin/inventory/overview' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Inventory Overview</span>
                    </div>

                    {/* Stock Availability */}
                    <div
                      onClick={() => navigate('/admin/inventory/availability')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/availability') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/availability') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/availability') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/availability') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Stock Availability</span>
                    </div>

                    {/* Stock Adjustments */}
                    <div
                      onClick={() => navigate('/admin/inventory/adjustments')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/adjustments') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/adjustments') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/adjustments') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/adjustments') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Stock Adjustments</span>
                    </div>

                    {/* Stock Reservations */}
                    <div
                      onClick={() => navigate('/admin/inventory/reservations')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/reservations') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/reservations') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/reservations') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/reservations') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Stock Reservations</span>
                    </div>

                    {/* Low Stock */}
                    <div
                      onClick={() => navigate('/admin/inventory/low-stock')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/low-stock') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/low-stock') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/low-stock') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/low-stock') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Low Stock</span>
                    </div>

                    {/* Out of Stock */}
                    <div
                      onClick={() => navigate('/admin/inventory/out-of-stock')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/out-of-stock') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/out-of-stock') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/out-of-stock') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/out-of-stock') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Out of Stock</span>
                    </div>

                    {/* Damaged Stock */}
                    <div
                      onClick={() => navigate('/admin/inventory/damaged')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/damaged') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/damaged') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/damaged') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/damaged') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Damaged Stock</span>
                    </div>

                    {/* Inventory Movements */}
                    <div
                      onClick={() => navigate('/admin/inventory/movements')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/movements') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/movements') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/movements') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/movements') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Inventory Movements</span>
                    </div>

                    {/* Stock Reconciliation */}
                    <div
                      onClick={() => navigate('/admin/inventory/reconciliation')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.startsWith('/admin/inventory/reconciliation') ? 600 : 500,
                        color: path.startsWith('/admin/inventory/reconciliation') ? '#E63946' : '#475569',
                        borderLeft: path.startsWith('/admin/inventory/reconciliation') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.startsWith('/admin/inventory/reconciliation') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Stock Reconciliation</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/inventory')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Warehouse size={15} color="#64748B" />
                  <span>Inventory Management</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* ORDER MANAGEMENT NAVIGATION GROUP (Screens 23 & 24) */}
            {isOrderPath ? (
              <div style={{ margin: '2px 0' }}>
                <div
                  onClick={() => setIsOrderOpen(!isOrderOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#E63946',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={15} color="#FFFFFF" />
                    <span>Order Management</span>
                  </div>
                  <ChevronDown size={14} color="#FFFFFF" />
                </div>

                {isOrderOpen && (
                  <div style={{ paddingLeft: '8px', marginTop: '2px' }}>
                    {/* All Orders */}
                    <div
                      onClick={() => navigate('/admin/orders')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: !path.includes('/exceptions') ? 600 : 500,
                        color: !path.includes('/exceptions') ? '#E63946' : '#475569',
                        borderLeft: !path.includes('/exceptions') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: !path.includes('/exceptions') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>All Orders</span>
                    </div>

                    {/* Order Exceptions */}
                    <div
                      onClick={() => navigate('/admin/orders/exceptions')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/exceptions') ? 600 : 500,
                        color: path.includes('/exceptions') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/exceptions') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/exceptions') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Order Exceptions</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingCart size={15} color="#64748B" />
                  <span>Order Management</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}


            {/* PAYMENT MANAGEMENT NAVIGATION GROUP (Screens 25, 26, 27) */}
            {isPaymentPath ? (
              <div style={{ margin: '2px 0' }}>
                <div
                  onClick={() => setIsPaymentOpen(!isPaymentOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#E63946',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={15} color="#FFFFFF" />
                    <span>Payment Management</span>
                  </div>
                  <ChevronDown size={14} color="#FFFFFF" />
                </div>

                {isPaymentOpen && (
                  <div style={{ paddingLeft: '8px', marginTop: '2px' }}>
                    {/* All Payments */}
                    <div
                      onClick={() => navigate('/admin/payments')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/payments' || path === '/admin/payments/all' ? 600 : 500,
                        color: path === '/admin/payments' || path === '/admin/payments/all' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/payments' || path === '/admin/payments/all' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/payments' || path === '/admin/payments/all' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>All Payments</span>
                    </div>

                    {/* Payment Reconciliation */}
                    <div
                      onClick={() => navigate('/admin/payments/reconciliation')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/reconciliation') ? 600 : 500,
                        color: path.includes('/reconciliation') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/reconciliation') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/reconciliation') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Payment Reconciliation</span>
                    </div>

                    {/* Payment Gateways */}
                    <div
                      onClick={() => navigate('/admin/payments/gateways')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/gateways') ? 600 : 500,
                        color: path.includes('/gateways') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/gateways') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/gateways') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Payment Gateways</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/payments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={15} color="#64748B" />
                  <span>Payment Management</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}

            {/* DELIVERY & LOGISTICS NAVIGATION GROUP (Screen 28: Delivery Dashboard) */}
            {isDeliveryPath ? (
              <div style={{ margin: '2px 0' }}>
                <div
                  onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#E63946',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={15} color="#FFFFFF" />
                    <span>Delivery & Logistics</span>
                  </div>
                  <ChevronDown size={14} color="#FFFFFF" />
                </div>

                {isDeliveryOpen && (
                  <div style={{ paddingLeft: '8px', marginTop: '2px' }}>
                    {/* Delivery Dashboard */}
                    <div
                      onClick={() => navigate('/admin/delivery')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/delivery' || path === '/admin/delivery/dashboard' || path === '/admin/logistics' ? 600 : 500,
                        color: path === '/admin/delivery' || path === '/admin/delivery/dashboard' || path === '/admin/logistics' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/delivery' || path === '/admin/delivery/dashboard' || path === '/admin/logistics' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/delivery' || path === '/admin/delivery/dashboard' || path === '/admin/logistics' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Delivery Dashboard</span>
                    </div>

                    {/* Shipments */}
                    <div
                      onClick={() => navigate('/admin/delivery/shipments')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/shipments') ? 600 : 500,
                        color: path.includes('/shipments') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/shipments') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/shipments') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Shipments</span>
                    </div>

                    {/* Delivery Partners */}
                    <div
                      onClick={() => navigate('/admin/delivery/partners')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/partners') ? 600 : 500,
                        color: path.includes('/partners') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/partners') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/partners') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Delivery Partners</span>
                    </div>

                    {/* Delivery Zones */}
                    <div
                      onClick={() => navigate('/admin/delivery/zones')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/zones') ? 600 : 500,
                        color: path.includes('/zones') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/zones') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/zones') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Delivery Zones</span>
                    </div>

                    {/* Delivery Charges */}
                    <div
                      onClick={() => navigate('/admin/delivery/charges')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/charges') ? 600 : 500,
                        color: path.includes('/charges') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/charges') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/charges') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Delivery Charges</span>
                    </div>

                    {/* Tracking */}
                    <div
                      onClick={() => navigate('/admin/delivery/tracking')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/tracking') ? 600 : 500,
                        color: path.includes('/tracking') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/tracking') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/tracking') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Tracking</span>
                    </div>

                    {/* Failed Deliveries */}
                    <div
                      onClick={() => navigate('/admin/delivery/failed')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/failed') ? 600 : 500,
                        color: path.includes('/failed') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/failed') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/failed') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Failed Deliveries</span>
                    </div>

                    {/* Return to Origin */}
                    <div
                      onClick={() => navigate('/admin/delivery/returns')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/returns') ? 600 : 500,
                        color: path.includes('/returns') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/returns') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/returns') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Return to Origin</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/delivery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={15} color="#64748B" />
                  <span>Delivery & Logistics</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}

            {/* RETURNS & REFUNDS NAVIGATION GROUP (Screens 29, 30, 31, 32, 33, 34) */}
            {isReturnsPath ? (
              <div style={{ margin: '2px 0' }}>
                <div
                  onClick={() => setIsReturnsOpen(!isReturnsOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#E63946',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RotateCcw size={15} color="#FFFFFF" />
                    <span>Returns & Refunds</span>
                  </div>
                  <ChevronDown size={14} color="#FFFFFF" />
                </div>

                {isReturnsOpen && (
                  <div style={{ paddingLeft: '8px', marginTop: '2px' }}>
                    {/* Return Requests */}
                    <div
                      onClick={() => navigate('/admin/returns')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path === '/admin/returns' || path === '/admin/returns/requests' ? 600 : 500,
                        color: path === '/admin/returns' || path === '/admin/returns/requests' ? '#E63946' : '#475569',
                        borderLeft: path === '/admin/returns' || path === '/admin/returns/requests' ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path === '/admin/returns' || path === '/admin/returns/requests' ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Return Requests</span>
                    </div>

                    {/* Return Approvals */}
                    <div
                      onClick={() => navigate('/admin/returns/approvals')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/approvals') ? 600 : 500,
                        color: path.includes('/approvals') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/approvals') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/approvals') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Return Approvals</span>
                    </div>

                    {/* Refund Requests */}
                    <div
                      onClick={() => navigate('/admin/returns/refund-requests')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/refund-requests') ? 600 : 500,
                        color: path.includes('/refund-requests') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/refund-requests') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/refund-requests') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Refund Requests</span>
                    </div>

                    {/* Refund Processing */}
                    <div
                      onClick={() => navigate('/admin/returns/processing')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/processing') ? 600 : 500,
                        color: path.includes('/processing') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/processing') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/processing') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Refund Processing</span>
                    </div>

                    {/* Return Inspections */}
                    <div
                      onClick={() => navigate('/admin/returns/inspections')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/inspections') ? 600 : 500,
                        color: path.includes('/inspections') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/inspections') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/inspections') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Return Inspections</span>
                    </div>

                    {/* Refund History */}
                    <div
                      onClick={() => navigate('/admin/returns/refund-history')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 12px',
                        margin: '2px 0',
                        fontSize: '12.5px',
                        fontWeight: path.includes('/refund-history') ? 600 : 500,
                        color: path.includes('/refund-history') ? '#E63946' : '#475569',
                        borderLeft: path.includes('/refund-history') ? '3px solid #E63946' : '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: path.includes('/refund-history') ? '#FFF1F2' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Refund History</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => navigate('/admin/returns')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  margin: '2px 0',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RotateCcw size={15} color="#64748B" />
                  <span>Returns & Refunds</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            )}
          </div>

          {/* GROUP 2: BUSINESS & PARTNERS */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                padding: '6px 8px',
                textTransform: 'uppercase',
              }}
            >
              BUSINESS & PARTNERS
            </div>
            {businessItems.map((item) => {
              const IconComp = item.icon;
              const active = isCurrentParent(item.to);
              return (
                <div
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    margin: '2px 0',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#0F172A' : '#475569',
                    backgroundColor: active ? '#F1F5F9' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={15} color={active ? '#E63946' : '#64748B'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={13} color="#94A3B8" />
                </div>
              );
            })}
          </div>

          {/* GROUP 3: CONTENT & COMMUNICATION */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                padding: '6px 8px',
                textTransform: 'uppercase',
              }}
            >
              CONTENT & COMMUNICATION
            </div>
            {contentItems.map((item) => {
              const IconComp = item.icon;
              const active = isCurrentParent(item.to);
              return (
                <div
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    margin: '2px 0',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#0F172A' : '#475569',
                    backgroundColor: active ? '#F1F5F9' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={15} color={active ? '#E63946' : '#64748B'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={13} color="#94A3B8" />
                </div>
              );
            })}
          </div>

          {/* GROUP 4: ANALYTICS & ADMINISTRATION */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                padding: '6px 8px',
                textTransform: 'uppercase',
              }}
            >
              ANALYTICS & ADMINISTRATION
            </div>
            {analyticsItems.map((item) => {
              const IconComp = item.icon;
              const active = isCurrentParent(item.to);
              return (
                <div
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    margin: '2px 0',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#0F172A' : '#475569',
                    backgroundColor: active ? '#F1F5F9' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={15} color={active ? '#E63946' : '#64748B'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={13} color="#94A3B8" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Rajesh Sharma"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #E2E8F0',
              }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                {user?.fullName || 'Rajesh Sharma'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748B' }}>Super Admin</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ================================================================ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Everest Pasal</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            {isCustomerPath ? (
              <>
                <span>Customer Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>All Customers</span>
              </>
            ) : path.startsWith('/admin/vendor-applications') || path.startsWith('/admin/vendors/applications') ? (
              <>
                <span>Vendor Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Vendor Applications</span>
              </>
            ) : path.startsWith('/admin/vendors') ? (
              <>
                <span>Vendor Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>All Vendors</span>
              </>
            ) : path.startsWith('/admin/product-approvals') ? (
              <>
                <span>Product & Catalog Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Product Approvals</span>
              </>
            ) : path.startsWith('/admin/categories') ? (
              <>
                <span>Product & Catalog Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Categories</span>
              </>
            ) : path.startsWith('/admin/brands') ? (
              <>
                <span>Product & Catalog Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Brands</span>
              </>
            ) : path.startsWith('/admin/attributes') ? (
              <>
                <span>Product & Catalog Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Attributes</span>
              </>
            ) : path.startsWith('/admin/products') ? (
              <>
                <span>Product & Catalog Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>All Products</span>
              </>
            ) : isInventoryPath ? (
              <>
                <span>Inventory Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {path.includes('/adjustments')
                    ? 'Stock Adjustments'
                    : path.includes('/availability')
                    ? 'Stock Availability'
                    : path.includes('/reservations')
                    ? 'Stock Reservations'
                    : path.includes('/low-stock')
                    ? 'Low Stock'
                    : path.includes('/out-of-stock')
                    ? 'Out of Stock'
                    : path.includes('/damaged')
                    ? 'Damaged Stock'
                    : 'Inventory Overview'}
                </span>
              </>
            ) : isOrderPath ? (
              <>
                <span>Order Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {path.includes('/exceptions') ? 'Order Exceptions' : 'All Orders'}
                </span>
              </>
            ) : isPaymentPath ? (
              <>
                <span>Payment Management</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {path.includes('/reconciliation')
                    ? 'Payment Reconciliation'
                    : path.includes('/gateways')
                    ? 'Payment Gateways'
                    : 'All Payments'}
                </span>
              </>
            ) : isDeliveryPath ? (
              <>
                <span>Delivery & Logistics</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {path.includes('/shipments')
                    ? 'Shipments'
                    : path.includes('/partners')
                    ? 'Delivery Partners'
                    : path.includes('/zones')
                    ? 'Delivery Zones'
                    : path.includes('/charges')
                    ? 'Delivery Charges'
                    : path.includes('/tracking')
                    ? 'Tracking'
                    : path.includes('/failed')
                    ? 'Failed Deliveries'
                    : path.includes('/returns')
                    ? 'Return to Origin'
                    : 'Delivery Dashboard'}
                </span>
              </>
            ) : isReturnsPath ? (
              <>
                <span>Returns & Refunds</span>
                <span style={{ color: '#CBD5E1' }}>/</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {path.includes('/approvals')
                    ? 'Return Approvals'
                    : path.includes('/refund-requests')
                    ? 'Refund Requests'
                    : path.includes('/processing')
                    ? 'Refund Processing'
                    : path.includes('/inspections')
                    ? 'Return Inspections'
                    : path.includes('/refund-history')
                    ? 'Refund History'
                    : 'Return Requests'}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{getBreadcrumbTitle()}</span>
            )}
          </div>

          {/* Right Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Global Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 12px',
                gap: '8px',
                width: '260px',
              }}
            >
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder={
                  isReturnsPath
                    ? 'Search return ID, order or customer...'
                    : isDeliveryPath
                    ? 'Search shipment, partner or zone...'
                    : isPaymentPath
                    ? path.includes('/gateways')
                      ? 'Search gateways or payment metho...'
                      : 'Search payment, order or customer...'
                    : isOrderPath
                    ? 'Search order ID, customer or vendor...'
                    : isInventoryPath
                    ? 'Search SKU, product, vendor, wareho...'
                    : path.startsWith('/admin/vendor-applications') || path.startsWith('/admin/vendors/applications')
                    ? 'Search applications by vendor, store...'
                    : path.startsWith('/admin/vendors')
                    ? 'Search vendors, stores, contacts...'
                    : isCatalogPath
                    ? 'Search vendors, stores, contacts...'
                    : isCustomerPath
                    ? 'Search customers, emails, phone...'
                    : 'Search orders, vendors, products...'
                }
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '12px',
                  color: '#1E293B',
                  width: '100%',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Notification Bell with Red Badge */}
            <div style={{ position: 'relative', cursor: 'pointer', color: '#64748B' }}>
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#E63946',
                  borderRadius: '50%',
                  border: '1px solid #FFFFFF',
                }}
              />
            </div>

            {/* Help Icon */}
            <div style={{ cursor: 'pointer', color: '#64748B' }}>
              <HelpCircle size={18} />
            </div>

            {/* User Avatar + Dropdown Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Rajesh Sharma"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  {user?.fullName || 'Rajesh Sharma'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B' }}>Super Admin</div>
              </div>
              <ChevronDown size={13} color="#64748B" />
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main style={{ flex: 1, padding: '24px 28px', minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
};
