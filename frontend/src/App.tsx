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
import { VendorReturnsPage } from './pages/vendor/VendorReturnsPage.js';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage.js';
import { VendorStorePage } from './pages/vendor/VendorStorePage.js';
import { VendorInquiriesPage } from './pages/vendor/VendorInquiriesPage.js';

// Admin Control Center Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage.js';
import { AdminSalesSummaryPage } from './pages/admin/AdminSalesSummaryPage.js';
import { AdminOrdersSummaryPage } from './pages/admin/AdminOrdersSummaryPage.js';
import { AdminRevenueSummaryPage } from './pages/admin/AdminRevenueSummaryPage.js';
import { AdminPendingApprovalsPage } from './pages/admin/AdminPendingApprovalsPage.js';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage.js';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.js';
import { AdminProductApprovalsPage } from './pages/admin/AdminProductApprovalsPage.js';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.js';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage.js';
import { AdminAttributesPage } from './pages/admin/AdminAttributesPage.js';
import { AdminInventoryOverviewPage } from './pages/admin/AdminInventoryOverviewPage.js';
import { AdminStockAdjustmentsPage } from './pages/admin/AdminStockAdjustmentsPage.js';
import { AdminStockAvailabilityPage } from './pages/admin/AdminStockAvailabilityPage.js';
import { AdminStockReservationsPage } from './pages/admin/AdminStockReservationsPage.js';
import { AdminLowStockPage } from './pages/admin/AdminLowStockPage.js';
import { AdminOutOfStockPage } from './pages/admin/AdminOutOfStockPage.js';
import { AdminDamagedStockPage } from './pages/admin/AdminDamagedStockPage.js';
import { AdminBannersPage } from './pages/admin/AdminBannersPage.js';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage.js';
import { AdminVendorApplicationsPage } from './pages/admin/AdminVendorApplicationsPage.js';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminOrderExceptionsPage } from './pages/admin/AdminOrderExceptionsPage.js';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage.js';
import { AdminPaymentReconciliationPage } from './pages/admin/AdminPaymentReconciliationPage.js';
import { AdminPaymentGatewaysPage } from './pages/admin/AdminPaymentGatewaysPage.js';
import { AdminDeliveryDashboardPage } from './pages/admin/AdminDeliveryDashboardPage.js';
import { AdminReturnRequestsPage } from './pages/admin/AdminReturnRequestsPage.js';
import { AdminReturnApprovalsPage } from './pages/admin/AdminReturnApprovalsPage.js';
import { AdminRefundRequestsPage } from './pages/admin/AdminRefundRequestsPage.js';
import { AdminRefundProcessingPage } from './pages/admin/AdminRefundProcessingPage.js';
import { AdminReturnInspectionsPage } from './pages/admin/AdminReturnInspectionsPage.js';
import { AdminRefundHistoryPage } from './pages/admin/AdminRefundHistoryPage.js';
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage.js';
import { AdminAgentApplicationsPage } from './pages/admin/AdminAgentApplicationsPage.js';
import { AdminAgentApprovalsPage } from './pages/admin/AdminAgentApprovalsPage.js';
import { AdminAgentActivitiesPage } from './pages/admin/AdminAgentActivitiesPage.js';
import { AdminAgentOrdersPage } from './pages/admin/AdminAgentOrdersPage.js';
import { AdminAgentCommissionsPage } from './pages/admin/AdminAgentCommissionsPage.js';
import { AdminAgentEarningsPage } from './pages/admin/AdminAgentEarningsPage.js';
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
          {(path === '/vendor/categories-units' || path.startsWith('/vendor/categories') || path.startsWith('/vendor/attributes')) && <VendorCategoryUnitPage />}
          {(path === '/vendor/purchases' || path === '/vendor/purchase' || path.startsWith('/vendor/purchases')) && <VendorPurchasesPage />}
          {(path === '/vendor/inventory' || path.startsWith('/vendor/inventory')) && <VendorInventoryPage />}
          {(path === '/vendor/customers' || path.startsWith('/vendor/customers') || path.startsWith('/vendor/customer-segments')) && <VendorCustomersPage />}
          {path === '/vendor/suppliers' && <VendorSuppliersPage />}
          {(path === '/vendor/finance' || path === '/vendor/earnings' || path === '/vendor/payouts' || path.startsWith('/vendor/finance') || path.startsWith('/vendor/earnings') || path.startsWith('/vendor/payouts')) && <VendorFinancePage />}
          {(path === '/vendor/transactions' || path === '/vendor/payments' || path.startsWith('/vendor/transactions') || path.startsWith('/vendor/payments')) && <VendorPaymentsPage />}
          {(path === '/vendor/promotions' || path === '/vendor/coupons' || path === '/vendor/campaigns' || path === '/vendor/sponsored' || path.startsWith('/vendor/promotions') || path.startsWith('/vendor/coupons') || path.startsWith('/vendor/campaigns') || path.startsWith('/vendor/sponsored')) && <VendorPromotionsPage />}
          {(path === '/vendor/store' || path.startsWith('/vendor/store')) && <VendorStorePage />}
          {path === '/vendor/reviews' && <VendorCustomersPage />}
          {(path === '/vendor/reports' || path === '/vendor/analytics' || path === '/vendor/export' || path.startsWith('/vendor/reports') || path.startsWith('/vendor/analytics')) && <VendorReportsPage />}
          {path === '/vendor/expenses' && <VendorExpensesPage />}
          {path === '/vendor/branches' && <VendorBranchesPage />}
          {(path === '/vendor/users-roles' || path === '/vendor/team' || path === '/vendor/permissions' || path.startsWith('/vendor/users-roles') || path.startsWith('/vendor/team')) && <VendorUsersRolesPage />}
          {path === '/vendor/subscription' && <VendorSubscriptionPage />}
          {path === '/vendor/settings' && <VendorSettingsPage />}
          {path === '/vendor/fulfillment' && <VendorFulfillmentPage />}
          {(path === '/vendor/returns' || path.startsWith('/vendor/returns')) && <VendorReturnsPage />}
          {(path === '/vendor/inquiries' || path.startsWith('/vendor/inquiries')) && <VendorInquiriesPage />}
          {path === '/vendor/help' && <VendorSettingsPage />}
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
          {(path === '/admin' || path === '/admin/' || path === '/admin/overview' || path === '/admin/dashboard') && (
            <AdminOverviewPage />
          )}
          {(path === '/admin/sales-summary' || path === '/admin/sales') && <AdminSalesSummaryPage />}
          {path === '/admin/orders-summary' && <AdminOrdersSummaryPage />}
          {(path === '/admin/revenue-summary' || path === '/admin/revenue') && <AdminRevenueSummaryPage />}
          {(path === '/admin/pending-approvals' || path === '/admin/approvals') && <AdminPendingApprovalsPage />}
          {(path === '/admin/alerts-notifications' || path === '/admin/alerts') && <AdminAlertsPage />}
          {path === '/admin/products' && <AdminProductsPage />}
          {(path === '/admin/product-approvals' || path.startsWith('/admin/product-approvals')) && (
            <AdminProductApprovalsPage />
          )}
          {(path === '/admin/categories' || path.startsWith('/admin/categories')) && (
            <AdminCategoriesPage />
          )}
          {(path === '/admin/brands' || path.startsWith('/admin/brands')) && (
            <AdminBrandsPage />
          )}
          {(path === '/admin/attributes' || path.startsWith('/admin/attributes')) && (
            <AdminAttributesPage />
          )}
          {(path === '/admin/inventory' || path === '/admin/inventory/overview') && (
            <AdminInventoryOverviewPage />
          )}
          {path === '/admin/inventory/availability' && <AdminStockAvailabilityPage />}
          {path === '/admin/inventory/adjustments' && <AdminStockAdjustmentsPage />}
          {path === '/admin/inventory/reservations' && <AdminStockReservationsPage />}
          {path === '/admin/inventory/low-stock' && <AdminLowStockPage />}
          {path === '/admin/inventory/out-of-stock' && <AdminOutOfStockPage />}
          {path === '/admin/inventory/damaged' && <AdminDamagedStockPage />}
          {path === '/admin/banners' && <AdminBannersPage />}
          {path === '/admin/vendors' && <AdminVendorsPage />}
          {(path === '/admin/vendor-applications' ||
            path.startsWith('/admin/vendor-applications') ||
            path === '/admin/vendors/applications' ||
            path.startsWith('/admin/vendors/applications')) && <AdminVendorApplicationsPage />}
          {(path === '/admin/customers' || path.startsWith('/admin/customers')) && <AdminCustomersPage />}
          {(path === '/admin/orders' || path === '/admin/orders/all') && <AdminOrdersPage />}
          {(path === '/admin/orders/exceptions' || path.startsWith('/admin/orders/exceptions')) && (
            <AdminOrderExceptionsPage />
          )}
          {(path === '/admin/payments' || path === '/admin/payments/all') && <AdminPaymentsPage />}
          {(path === '/admin/payments/reconciliation' ||
            path.startsWith('/admin/payments/reconciliation')) && <AdminPaymentReconciliationPage />}
          {(path === '/admin/payments/gateways' ||
            path.startsWith('/admin/payments/gateways')) && <AdminPaymentGatewaysPage />}
          {(path === '/admin/delivery' ||
            path === '/admin/delivery/dashboard' ||
            path.startsWith('/admin/delivery') ||
            path === '/admin/logistics' ||
            path.startsWith('/admin/logistics')) && <AdminDeliveryDashboardPage />}
          {(path === '/admin/returns' ||
            path === '/admin/returns/requests' ||
            path.startsWith('/admin/returns/requests')) && <AdminReturnRequestsPage />}
          {(path === '/admin/returns/approvals' ||
            path.startsWith('/admin/returns/approvals')) && <AdminReturnApprovalsPage />}
          {(path === '/admin/returns/refund-requests' ||
            path.startsWith('/admin/returns/refund-requests')) && <AdminRefundRequestsPage />}
          {(path === '/admin/returns/processing' ||
            path.startsWith('/admin/returns/processing')) && <AdminRefundProcessingPage />}
          {(path === '/admin/returns/inspections' ||
            path.startsWith('/admin/returns/inspections')) && <AdminReturnInspectionsPage />}
          {(path === '/admin/returns/refund-history' ||
            path.startsWith('/admin/returns/refund-history') ||
            path === '/admin/returns/history') && <AdminRefundHistoryPage />}
          {(path === '/admin/agents' || path === '/admin/agents/all') && <AdminAgentsPage />}
          {(path === '/admin/agents/applications' || path.startsWith('/admin/agents/applications')) && (
            <AdminAgentApplicationsPage />
          )}
          {(path === '/admin/agents/approvals' || path.startsWith('/admin/agents/approvals')) && (
            <AdminAgentApprovalsPage />
          )}
          {(path === '/admin/agents/activities' || path.startsWith('/admin/agents/activities')) && (
            <AdminAgentActivitiesPage />
          )}
          {(path === '/admin/agents/orders' || path.startsWith('/admin/agents/orders')) && (
            <AdminAgentOrdersPage />
          )}
          {(path === '/admin/agents/commissions' || path.startsWith('/admin/agents/commissions')) && (
            <AdminAgentCommissionsPage />
          )}
          {(path === '/admin/agents/earnings' || path.startsWith('/admin/agents/earnings')) && (
            <AdminAgentEarningsPage />
          )}
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
      {(path === '/products' ||
        path === '/categories' ||
        path.startsWith('/category') ||
        path.startsWith('/categories/')) && <ProductsPage />}

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
