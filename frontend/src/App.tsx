// ==============================================================================
// EVEREST PASAL - FRONTEND MAIN APPLICATION ROOT
// Three Isolated Application Surfaces: Customer Website, Vendor Panel, Admin Panel
// Governed strictly by Authentication & Role-Based Access Control (RBAC)
// ==============================================================================

import React from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { RouterProvider, useRouter } from './router/index.js';

// Layouts for the 3 distinct application surfaces
import { CustomerLayout } from './components/Layout/CustomerLayout.js';
import { VendorLayout } from './components/Layout/VendorLayout.js';
import { AdminLayout } from './components/Layout/AdminLayout.js';

// Authorization Guards
import { CustomerGuard, VendorGuard, AdminGuard } from './components/Auth/AuthGuards.js';

// Public & Customer Pages
import { StorefrontPage } from './pages/customer/StorefrontPage.js';
import { ProductDetailPage } from './pages/customer/ProductDetailPage.js';
import { CartCheckoutPage } from './pages/customer/CartCheckoutPage.js';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage.js';
import { MyAccountPage } from './pages/customer/MyAccountPage.js';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { VerifyEmailPage } from './pages/VerifyEmailPage.js';

// Vendor Seller Center Pages
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage.js';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage.js';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage.js';
import { VendorPOSBillingPage } from './pages/vendor/VendorPOSBillingPage.js';
import { VendorCategoryUnitPage } from './pages/vendor/VendorCategoryUnitPage.js';
import { VendorPurchasesPage } from './pages/vendor/VendorPurchasesPage.js';
import { VendorCustomersPage } from './pages/vendor/VendorCustomersPage.js';
import { VendorSuppliersPage } from './pages/vendor/VendorSuppliersPage.js';
import { VendorPaymentsPage } from './pages/vendor/VendorPaymentsPage.js';
import { VendorFinancePage } from './pages/vendor/VendorFinancePage.js';
import { VendorPromotionsPage } from './pages/vendor/VendorPromotionsPage.js';
import { VendorReportsPage } from './pages/vendor/VendorReportsPage.js';
import { VendorExpensesPage } from './pages/vendor/VendorExpensesPage.js';
import { VendorBranchesPage } from './pages/vendor/VendorBranchesPage.js';
import { VendorUsersRolesPage } from './pages/vendor/VendorUsersRolesPage.js';
import { VendorSubscriptionPage } from './pages/vendor/VendorSubscriptionPage.js';
import { VendorSettingsPage } from './pages/vendor/VendorSettingsPage.js';
import { VendorFulfillmentPage } from './pages/vendor/VendorFulfillmentPage.js';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage.js';
import { VendorStorePage } from './pages/vendor/VendorStorePage.js';

// Admin Control Center Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.js';
import { AdminBannersPage } from './pages/admin/AdminBannersPage.js';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage.js';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.js';
import { SystemHealthPage } from './pages/SystemHealthPage.js';

import './styles/dev-theme.css';

const AppRouterContent: React.FC = () => {
  const { path, navigate } = useRouter();

  // ============================================================================
  // SURFACE 1: VENDOR SELLER CENTER (/vendor/*)
  // Protected by VendorGuard: Requires authenticated VENDOR / SELLER role
  // ============================================================================
  if (path.startsWith('/vendor')) {
    return (
      <VendorGuard>
        <VendorLayout>
          {(path === '/vendor' || path === '/vendor/dashboard') && (
            <VendorDashboardPage onNavigate={(dest) => navigate(dest.startsWith('/vendor') ? dest : `/vendor/${dest.replace('vendor-', '')}`)} />
          )}
          {path === '/vendor/pos' && <VendorPOSBillingPage />}
          {(path === '/vendor/products' || path.startsWith('/vendor/products')) && <VendorProductsPage />}
          {(path === '/vendor/orders' || path.startsWith('/vendor/orders')) && <VendorOrdersPage />}
          {path === '/vendor/categories-units' && <VendorCategoryUnitPage />}
          {path === '/vendor/purchases' && <VendorPurchasesPage />}
          {(path === '/vendor/inventory' || path.startsWith('/vendor/inventory')) && <VendorInventoryPage />}
          {path === '/vendor/customers' && <VendorCustomersPage />}
          {path === '/vendor/suppliers' && <VendorSuppliersPage />}
          {(path === '/vendor/payments' || path === '/vendor/finance' || path.startsWith('/vendor/finance')) && <VendorFinancePage />}
          {(path === '/vendor/promotions' || path.startsWith('/vendor/promotions')) && <VendorPromotionsPage />}
          {(path === '/vendor/store' || path.startsWith('/vendor/store')) && <VendorStorePage />}
          {path === '/vendor/reviews' && <VendorCustomersPage />}
          {path === '/vendor/export' && <VendorReportsPage />}
          {path === '/vendor/reports' && <VendorReportsPage />}
          {path === '/vendor/expenses' && <VendorExpensesPage />}
          {path === '/vendor/branches' && <VendorBranchesPage />}
          {path === '/vendor/users-roles' && <VendorUsersRolesPage />}
          {path === '/vendor/subscription' && <VendorSubscriptionPage />}
          {path === '/vendor/settings' && <VendorSettingsPage />}
          {path === '/vendor/fulfillment' && <VendorFulfillmentPage />}
        </VendorLayout>
      </VendorGuard>
    );
  }

  // ============================================================================
  // SURFACE 2: ADMIN CONTROL CENTER (/admin/*)
  // Protected by AdminGuard: Requires authenticated ADMIN / SUPER_ADMIN role
  // ============================================================================
  if (path.startsWith('/admin')) {
    return (
      <AdminGuard>
        <AdminLayout>
          {(path === '/admin' || path === '/admin/dashboard') && (
            <AdminDashboardPage onNavigate={(dest) => navigate(dest.startsWith('/admin') ? dest : `/admin/${dest.replace('admin-', '')}`)} />
          )}
          {path === '/admin/products' && <AdminProductsPage />}
          {path === '/admin/banners' && <AdminBannersPage />}
          {path === '/admin/vendors' && <AdminVendorsPage />}
          {path === '/admin/customers' && <AdminCustomersPage />}
          {path === '/admin/orders' && <AdminOrdersPage />}
          {path === '/admin/audits' && <AdminAuditPage />}
          {path === '/admin/health' && <SystemHealthPage />}
        </AdminLayout>
      </AdminGuard>
    );
  }

  // Dedicated Standalone Auth & Verification Pages
  if (path === '/login') {
    return <LoginPage onSwitchToRegister={() => navigate('/register')} />;
  }
  if (path === '/register') {
    return <RegisterPage onSwitchToLogin={() => navigate('/login')} />;
  }
  if (path === '/verify-email' || path === '/verify') {
    return <VerifyEmailPage />;
  }

  // ============================================================================
  // SURFACE 3: CUSTOMER PUBLIC WEBSITE & SHOPPING STOREFRONT (Default)
  // Public discovery + Protected customer checkout/orders
  // ============================================================================
  return (
    <CustomerLayout>
      {/* Dynamic Product Detail Route */}
      {path.startsWith('/products/') && path !== '/products/' && (
        <ProductDetailPage productId={path.replace('/products/', '')} />
      )}

      {/* Public Storefront Routes */}
      {path === '/' && (
        <StorefrontPage onNavigateToCheckout={() => navigate('/cart')} />
      )}
      {(path === '/products' || path === '/categories') && <ProductsPage />}

      {/* Customer Routes */}
      {path === '/cart' && (
        <CartCheckoutPage
          onOrderPlaced={(orderId) => navigate('/orders')}
          onContinueShopping={() => navigate('/')}
        />
      )}
      {/* Order Live Tracking Route */}
      {(path.startsWith('/orders/') && path.includes('/track')) && (
        <OrderTrackingPage
          orderId={path.replace('/orders/', '').replace('/track', '') || 'EP-1048'}
        />
      )}
      {(path === '/track' || path === '/track-order') && (
        <OrderTrackingPage orderId="EP-1048" />
      )}

      {/* Customer Account Routes */}
      {(path === '/account' || path === '/my-account' || path === '/orders' || path === '/profile' || path === '/wishlist' || path === '/addresses' || path === '/notifications') && (
        <MyAccountPage />
      )}
      {path === '/orders-legacy' && (
        <CustomerGuard>
          <CustomerOrdersPage />
        </CustomerGuard>
      )}
    </CustomerLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider>
          <AppRouterContent />
        </RouterProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
