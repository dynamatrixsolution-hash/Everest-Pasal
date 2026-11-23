import React from 'react';
import { RouterProvider, useRouter } from './router/index.js';
import { AuthProvider } from './context/AuthContext.js';
import { AdminGuard } from './components/Auth/AuthGuards.js';
import { AdminLayout } from './components/Layout/AdminLayout.js';

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
import { LoginPage } from './pages/LoginPage.js';

import './styles/dev-theme.css';

const AdminRouterContent: React.FC = () => {
  const { path } = useRouter();

  if (path === '/login') {
    return <LoginPage onSwitchToRegister={() => {}} />;
  }

  return (
    <AdminGuard>
      <AdminLayout>
        {(path === '/' || path === '/admin' || path === '/admin/' || path === '/admin/overview' || path === '/admin/dashboard') && (
          <AdminOverviewPage />
        )}
        {(path === '/admin/sales-summary' || path === '/admin/sales') && <AdminSalesSummaryPage />}
        {path === '/admin/orders-summary' && <AdminOrdersSummaryPage />}
        {(path === '/admin/revenue-summary' || path === '/admin/revenue') && <AdminRevenueSummaryPage />}
        {(path === '/admin/pending-approvals' || path === '/admin/approvals') && <AdminPendingApprovalsPage />}
        {(path === '/admin/alerts-notifications' || path === '/admin/alerts') && <AdminAlertsPage />}
        {path === '/admin/products' && <AdminProductsPage />}
        {(path === '/admin/product-approvals' || path.startsWith('/admin/product-approvals')) && <AdminProductApprovalsPage />}
        {(path === '/admin/categories' || path.startsWith('/admin/categories')) && <AdminCategoriesPage />}
        {(path === '/admin/brands' || path.startsWith('/admin/brands')) && <AdminBrandsPage />}
        {(path === '/admin/attributes' || path.startsWith('/admin/attributes')) && <AdminAttributesPage />}
        {path === '/admin/inventory' && <AdminInventoryOverviewPage />}
        {path === '/admin/inventory/adjustments' && <AdminStockAdjustmentsPage />}
        {path === '/admin/inventory/availability' && <AdminStockAvailabilityPage />}
        {path === '/admin/inventory/reservations' && <AdminStockReservationsPage />}
        {path === '/admin/inventory/low-stock' && <AdminLowStockPage />}
        {path === '/admin/inventory/out-of-stock' && <AdminOutOfStockPage />}
        {path === '/admin/inventory/damaged' && <AdminDamagedStockPage />}
        {path === '/admin/banners' && <AdminBannersPage />}
        {(path === '/admin/vendors' || path === '/admin/vendors/all') && <AdminVendorsPage />}
        {(path === '/admin/vendor-applications' || path.startsWith('/admin/vendor-applications')) && <AdminVendorApplicationsPage />}
        {(path === '/admin/customers' || path.startsWith('/admin/customers')) && <AdminCustomersPage />}
        {(path === '/admin/orders' || path === '/admin/orders/all') && <AdminOrdersPage />}
        {(path === '/admin/orders/exceptions' || path.startsWith('/admin/orders/exceptions')) && <AdminOrderExceptionsPage />}
        {(path === '/admin/payments' || path === '/admin/payments/all') && <AdminPaymentsPage />}
        {(path === '/admin/payments/reconciliation' || path.startsWith('/admin/payments/reconciliation')) && <AdminPaymentReconciliationPage />}
        {(path === '/admin/payments/gateways' || path.startsWith('/admin/payments/gateways')) && <AdminPaymentGatewaysPage />}
        {(path === '/admin/delivery' || path.startsWith('/admin/delivery') || path.startsWith('/admin/logistics')) && <AdminDeliveryDashboardPage />}
        {(path === '/admin/returns' || path === '/admin/returns/requests' || path.startsWith('/admin/returns/requests')) && <AdminReturnRequestsPage />}
        {(path === '/admin/returns/approvals' || path.startsWith('/admin/returns/approvals')) && <AdminReturnApprovalsPage />}
        {(path === '/admin/returns/refund-requests' || path.startsWith('/admin/returns/refund-requests')) && <AdminRefundRequestsPage />}
        {(path === '/admin/returns/processing' || path.startsWith('/admin/returns/processing')) && <AdminRefundProcessingPage />}
        {(path === '/admin/returns/inspections' || path.startsWith('/admin/returns/inspections')) && <AdminReturnInspectionsPage />}
        {(path === '/admin/returns/refund-history' || path.startsWith('/admin/returns/refund-history') || path === '/admin/returns/history') && <AdminRefundHistoryPage />}
        {(path === '/admin/agents' || path === '/admin/agents/all') && <AdminAgentsPage />}
        {(path === '/admin/agents/applications' || path.startsWith('/admin/agents/applications')) && <AdminAgentApplicationsPage />}
        {(path === '/admin/agents/approvals' || path.startsWith('/admin/agents/approvals')) && <AdminAgentApprovalsPage />}
        {(path === '/admin/agents/activities' || path.startsWith('/admin/agents/activities')) && <AdminAgentActivitiesPage />}
        {(path === '/admin/agents/orders' || path.startsWith('/admin/agents/orders')) && <AdminAgentOrdersPage />}
        {(path === '/admin/agents/commissions' || path.startsWith('/admin/agents/commissions')) && <AdminAgentCommissionsPage />}
        {(path === '/admin/agents/earnings' || path.startsWith('/admin/agents/earnings')) && <AdminAgentEarningsPage />}
        {path === '/admin/audits' && <AdminAuditPage />}
        {path === '/admin/health' && <SystemHealthPage />}
      </AdminLayout>
    </AdminGuard>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider>
        <AdminRouterContent />
      </RouterProvider>
    </AuthProvider>
  );
};
export default App;
