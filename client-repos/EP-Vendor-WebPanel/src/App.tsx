import React from 'react';
import { RouterProvider, useRouter } from './router/index.js';
import { AuthProvider } from './context/AuthContext.js';
import { VendorGuard } from './components/Auth/AuthGuards.js';
import { VendorLayout } from './components/Layout/VendorLayout.js';

import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage.js';
import { VendorPOSBillingPage } from './pages/vendor/VendorPOSBillingPage.js';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage.js';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage.js';
import { VendorCategoryUnitPage } from './pages/vendor/VendorCategoryUnitPage.js';
import { VendorPurchasesPage } from './pages/vendor/VendorPurchasesPage.js';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage.js';
import { VendorCustomersPage } from './pages/vendor/VendorCustomersPage.js';
import { VendorSuppliersPage } from './pages/vendor/VendorSuppliersPage.js';
import { VendorFinancePage } from './pages/vendor/VendorFinancePage.js';
import { VendorPaymentsPage } from './pages/vendor/VendorPaymentsPage.js';
import { VendorPromotionsPage } from './pages/vendor/VendorPromotionsPage.js';
import { VendorStorePage } from './pages/vendor/VendorStorePage.js';
import { VendorReportsPage } from './pages/vendor/VendorReportsPage.js';
import { VendorExpensesPage } from './pages/vendor/VendorExpensesPage.js';
import { VendorBranchesPage } from './pages/vendor/VendorBranchesPage.js';
import { VendorUsersRolesPage } from './pages/vendor/VendorUsersRolesPage.js';
import { VendorSubscriptionPage } from './pages/vendor/VendorSubscriptionPage.js';
import { VendorSettingsPage } from './pages/vendor/VendorSettingsPage.js';
import { VendorFulfillmentPage } from './pages/vendor/VendorFulfillmentPage.js';
import { VendorReturnsPage } from './pages/vendor/VendorReturnsPage.js';
import { VendorInquiriesPage } from './pages/vendor/VendorInquiriesPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { VerifyEmailPage } from './pages/VerifyEmailPage.js';

import './styles/dev-theme.css';

const VendorRouterContent: React.FC = () => {
  const { path, navigate } = useRouter();

  if (path === '/login') {
    return <LoginPage onSwitchToRegister={() => navigate('/register')} />;
  }
  if (path === '/register') {
    return <RegisterPage onSwitchToLogin={() => navigate('/login')} />;
  }
  if (path === '/verify-email') {
    return <VerifyEmailPage />;
  }

  return (
    <VendorGuard>
      <VendorLayout>
        {(path === '/' || path === '/vendor' || path === '/vendor/dashboard') && (
          <VendorDashboardPage onNavigate={(dest) => navigate(dest.startsWith('/vendor') ? dest : `/vendor/${dest.replace('vendor-', '')}`)} />
        )}
        {path === '/vendor/pos' && <VendorPOSBillingPage />}
        {(path === '/vendor/products' || path.startsWith('/vendor/products')) && <VendorProductsPage />}
        {(path === '/vendor/orders' || path.startsWith('/vendor/orders')) && <VendorOrdersPage />}
        {(path === '/vendor/categories-units' || path.startsWith('/vendor/categories')) && <VendorCategoryUnitPage />}
        {(path === '/vendor/purchases' || path.startsWith('/vendor/purchases')) && <VendorPurchasesPage />}
        {(path === '/vendor/inventory' || path.startsWith('/vendor/inventory')) && <VendorInventoryPage />}
        {(path === '/vendor/customers' || path.startsWith('/vendor/customers')) && <VendorCustomersPage />}
        {path === '/vendor/suppliers' && <VendorSuppliersPage />}
        {(path === '/vendor/finance' || path.startsWith('/vendor/finance')) && <VendorFinancePage />}
        {(path === '/vendor/transactions' || path === '/vendor/payments') && <VendorPaymentsPage />}
        {(path === '/vendor/promotions' || path.startsWith('/vendor/promotions')) && <VendorPromotionsPage />}
        {(path === '/vendor/store' || path.startsWith('/vendor/store')) && <VendorStorePage />}
        {path === '/vendor/reviews' && <VendorCustomersPage />}
        {(path === '/vendor/reports' || path.startsWith('/vendor/reports')) && <VendorReportsPage />}
        {path === '/vendor/expenses' && <VendorExpensesPage />}
        {path === '/vendor/branches' && <VendorBranchesPage />}
        {(path === '/vendor/users-roles' || path.startsWith('/vendor/users-roles')) && <VendorUsersRolesPage />}
        {path === '/vendor/subscription' && <VendorSubscriptionPage />}
        {path === '/vendor/settings' && <VendorSettingsPage />}
        {path === '/vendor/fulfillment' && <VendorFulfillmentPage />}
        {(path === '/vendor/returns' || path.startsWith('/vendor/returns')) && <VendorReturnsPage />}
        {(path === '/vendor/inquiries' || path.startsWith('/vendor/inquiries')) && <VendorInquiriesPage />}
        {path === '/vendor/help' && <VendorSettingsPage />}
      </VendorLayout>
    </VendorGuard>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider>
        <VendorRouterContent />
      </RouterProvider>
    </AuthProvider>
  );
};
export default App;
