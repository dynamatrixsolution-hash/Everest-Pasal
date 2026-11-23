import React from 'react';
import { RouterProvider, useRouter } from './router/index.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { CustomerLayout } from './components/Layout/CustomerLayout.js';

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

import './styles/dev-theme.css';

const AppRouterContent: React.FC = () => {
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
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#FFFFFF', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
      <CustomerLayout>
        {path.startsWith('/products/') && path !== '/products/' && (
          <ProductDetailPage productId={path.replace('/products/', '')} />
        )}
        {(path === '/products' || path === '/catalog' || path === '/shop') && <ProductsPage />}
        {path === '/categories' && <CategoriesPage />}
        {(path === '/cart' || path === '/checkout') && <CartCheckoutPage />}
        {(path === '/account/orders' || path === '/my-orders') && <CustomerOrdersPage />}
        {(path === '/account' || path === '/profile') && <MyAccountPage />}
        {(path === '/track-order' || path === '/track') && <OrderTrackingPage />}
        {(path === '/' || path === '') && <StorefrontPage />}
      </CustomerLayout>
    </div>
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
