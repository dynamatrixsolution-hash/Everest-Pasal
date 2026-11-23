// ==============================================================================
// EVEREST PASAL - CLIENT REPOSITORY DISTRIBUTION & MODULARIZATION ENGINE
// Splits the unified codebase into 4 standalone client repositories matching:
// 1. EP-Admin-WebPanel
// 2. EP-Vendor-WebPanel
// 3. EP-Customer-WebPanel
// 4. EP-Customer-Application
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const OUTPUT_ROOT = path.join(ROOT_DIR, 'client-repos');

function copyDirSync(src, dest, exclude = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const COMMON_GITIGNORE = `# Environment variables & secrets
.env
.env.*
!.env.example
*.pem
*.key
*.cert
*.crt
*.pfx
*.keystore
credentials.json
token.json
client_secret*.json
service-account*.json

# Dependencies & Build outputs
node_modules/
dist/
dist-ssr/
build/
out/
coverage/
*.tsbuildinfo
.turbo/
.cache/

# AI Generated Files & Tool Metadata
.gemini/
.claude/
.cursor/
.cursorrules
.windsurf/
.copilot/
.ai/
brain/
scratch/
.system_generated/
transcripts/
*.jsonl

# Logs & OS / IDE Clutter
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
.DS_Store
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp
*~
`;

const TS_CONFIG = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client"],
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`;

const VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
`;

function getIndexHtml(title) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function getPackageJson(repoName, description) {
  return JSON.stringify(
    {
      name: repoName.toLowerCase(),
      description,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        'lucide-react': '^1.16.0',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      },
      devDependencies: {
        '@types/react': '^18.3.18',
        '@types/react-dom': '^18.3.5',
        '@vitejs/plugin-react': '^4.3.4',
        typescript: '^5.7.3',
        vite: '^6.2.0',
      },
    },
    null,
    2
  );
}

function copySharedSource(targetSrcDir) {
  ensureDir(targetSrcDir);
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'api'), path.join(targetSrcDir, 'api'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'context'), path.join(targetSrcDir, 'context'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'router'), path.join(targetSrcDir, 'router'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'styles'), path.join(targetSrcDir, 'styles'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'utils'), path.join(targetSrcDir, 'utils'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'components', 'Common'), path.join(targetSrcDir, 'components', 'Common'));
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'components', 'Auth'), path.join(targetSrcDir, 'components', 'Auth'));

  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'vite-env.d.ts'), path.join(targetSrcDir, 'vite-env.d.ts'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'main.tsx'), path.join(targetSrcDir, 'main.tsx'));
}

// ==============================================================================
// 1. REPO: EP-Admin-WebPanel
// ==============================================================================
function buildAdminWebPanel() {
  const repoName = 'EP-Admin-WebPanel';
  const targetDir = path.join(OUTPUT_ROOT, repoName);
  console.log(`[1/4] Generating ${repoName}...`);

  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'package.json'), getPackageJson(repoName, 'Everest Pasal — System Admin Control Center Web Panel'));
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), TS_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'vite.config.ts'), VITE_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'index.html'), getIndexHtml('Everest Pasal — System Admin Control Center'));
  fs.writeFileSync(path.join(targetDir, '.gitignore'), COMMON_GITIGNORE);
  fs.writeFileSync(path.join(targetDir, '.env.example'), 'VITE_API_URL=https://api.everestpasal.com\n');

  const targetSrc = path.join(targetDir, 'src');
  copySharedSource(targetSrc);

  // Copy Admin Layout & Pages
  ensureDir(path.join(targetSrc, 'components', 'Layout'));
  fs.copyFileSync(
    path.join(FRONTEND_DIR, 'src', 'components', 'Layout', 'AdminLayout.tsx'),
    path.join(targetSrc, 'components', 'Layout', 'AdminLayout.tsx')
  );
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'pages', 'admin'), path.join(targetSrc, 'pages', 'admin'));

  // Copy Auth & System pages
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'LoginPage.tsx'), path.join(targetSrc, 'pages', 'LoginPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'SystemHealthPage.tsx'), path.join(targetSrc, 'pages', 'SystemHealthPage.tsx'));

  // Dedicated Admin App.tsx
  const adminAppTsx = `import React from 'react';
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
`;
  fs.writeFileSync(path.join(targetSrc, 'App.tsx'), adminAppTsx);

  const readme = `# EP-Admin-WebPanel

Enterprise System Admin Control Center Web Panel for Everest Pasal.

## Overview
- Complete administrative dashboard, vendor management, catalog control, delivery dispatch, return & refund lifecycle, and agent management suite.
- Built with **React 18 + TypeScript + Vite**.
- **100% Native Inline Styling** matching Everest Pasal design standards.

## Setup & Running
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Pushing to Client GitHub Repository
\`\`\`bash
git init
git add .
git commit -m "feat(admin): initialize EP-Admin-WebPanel repository"
git branch -M main
git remote add origin https://github.com/<YOUR-ORG-OR-USERNAME>/EP-Admin-WebPanel.git
git push -u origin main --force
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  console.log(`✓ ${repoName} generated successfully.`);
}

// ==============================================================================
// 2. REPO: EP-Vendor-WebPanel
// ==============================================================================
function buildVendorWebPanel() {
  const repoName = 'EP-Vendor-WebPanel';
  const targetDir = path.join(OUTPUT_ROOT, repoName);
  console.log(`[2/4] Generating ${repoName}...`);

  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'package.json'), getPackageJson(repoName, 'Everest Pasal — Vendor Seller Center Web Panel'));
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), TS_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'vite.config.ts'), VITE_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'index.html'), getIndexHtml('Everest Pasal — Vendor Seller Center'));
  fs.writeFileSync(path.join(targetDir, '.gitignore'), COMMON_GITIGNORE);
  fs.writeFileSync(path.join(targetDir, '.env.example'), 'VITE_API_URL=https://api.everestpasal.com\n');

  const targetSrc = path.join(targetDir, 'src');
  copySharedSource(targetSrc);

  // Copy Vendor Layout & Pages
  ensureDir(path.join(targetSrc, 'components', 'Layout'));
  fs.copyFileSync(
    path.join(FRONTEND_DIR, 'src', 'components', 'Layout', 'VendorLayout.tsx'),
    path.join(targetSrc, 'components', 'Layout', 'VendorLayout.tsx')
  );
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'pages', 'vendor'), path.join(targetSrc, 'pages', 'vendor'));

  // Auth pages
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'LoginPage.tsx'), path.join(targetSrc, 'pages', 'LoginPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'RegisterPage.tsx'), path.join(targetSrc, 'pages', 'RegisterPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'VerifyEmailPage.tsx'), path.join(targetSrc, 'pages', 'VerifyEmailPage.tsx'));

  // Dedicated Vendor App.tsx
  const vendorAppTsx = `import React from 'react';
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
          <VendorDashboardPage onNavigate={(dest) => navigate(dest.startsWith('/vendor') ? dest : \`/vendor/\${dest.replace('vendor-', '')}\`)} />
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
`;
  fs.writeFileSync(path.join(targetSrc, 'App.tsx'), vendorAppTsx);

  const readme = `# EP-Vendor-WebPanel

Vendor / Seller Center Web Panel for Everest Pasal.

## Overview
- Complete self-service seller portal: POS billing, multi-warehouse stock management, orders, financials, customer inquiries, promotions, and delivery fulfillment.
- Built with **React 18 + TypeScript + Vite**.

## Setup & Running
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Pushing to Client GitHub Repository
\`\`\`bash
git init
git add .
git commit -m "feat(vendor): initialize EP-Vendor-WebPanel repository"
git branch -M main
git remote add origin https://github.com/<YOUR-ORG-OR-USERNAME>/EP-Vendor-WebPanel.git
git push -u origin main --force
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  console.log(`✓ ${repoName} generated successfully.`);
}

// ==============================================================================
// 3. REPO: EP-Customer-WebPanel
// ==============================================================================
function buildCustomerWebPanel() {
  const repoName = 'EP-Customer-WebPanel';
  const targetDir = path.join(OUTPUT_ROOT, repoName);
  console.log(`[3/4] Generating ${repoName}...`);

  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'package.json'), getPackageJson(repoName, 'Everest Pasal — Customer E-Commerce Storefront Web Panel'));
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), TS_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'vite.config.ts'), VITE_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'index.html'), getIndexHtml('Everest Pasal — Nepal to the World'));
  fs.writeFileSync(path.join(targetDir, '.gitignore'), COMMON_GITIGNORE);
  fs.writeFileSync(path.join(targetDir, '.env.example'), 'VITE_API_URL=https://api.everestpasal.com\n');

  const targetSrc = path.join(targetDir, 'src');
  copySharedSource(targetSrc);

  // Customer Layout & Pages
  ensureDir(path.join(targetSrc, 'components', 'Layout'));
  fs.copyFileSync(
    path.join(FRONTEND_DIR, 'src', 'components', 'Layout', 'CustomerLayout.tsx'),
    path.join(targetSrc, 'components', 'Layout', 'CustomerLayout.tsx')
  );
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'pages', 'customer'), path.join(targetSrc, 'pages', 'customer'));

  // Common customer pages
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'ProductsPage.tsx'), path.join(targetSrc, 'pages', 'ProductsPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'CategoriesPage.tsx'), path.join(targetSrc, 'pages', 'CategoriesPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'LoginPage.tsx'), path.join(targetSrc, 'pages', 'LoginPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'RegisterPage.tsx'), path.join(targetSrc, 'pages', 'RegisterPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'VerifyEmailPage.tsx'), path.join(targetSrc, 'pages', 'VerifyEmailPage.tsx'));

  // Dedicated Customer App.tsx
  const customerAppTsx = `import React from 'react';
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

const CustomerRouterContent: React.FC = () => {
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
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider>
          <CustomerRouterContent />
        </RouterProvider>
      </CartProvider>
    </AuthProvider>
  );
};
export default App;
`;
  fs.writeFileSync(path.join(targetSrc, 'App.tsx'), customerAppTsx);

  const readme = `# EP-Customer-WebPanel

Customer E-Commerce Storefront Web Panel for Everest Pasal.

## Overview
- Customer discovery, search, filtering, product catalog, cart checkout (eSewa / Khalti / COD / Card), customer orders, and profile management.
- Built with **React 18 + TypeScript + Vite**.

## Setup & Running
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Pushing to Client GitHub Repository
\`\`\`bash
git init
git add .
git commit -m "feat(customer): initialize EP-Customer-WebPanel repository"
git branch -M main
git remote add origin https://github.com/<YOUR-ORG-OR-USERNAME>/EP-Customer-WebPanel.git
git push -u origin main --force
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  console.log(`✓ ${repoName} generated successfully.`);
}

// ==============================================================================
// 4. REPO: EP-Customer-Application
// ==============================================================================
function buildCustomerApplication() {
  const repoName = 'EP-Customer-Application';
  const targetDir = path.join(OUTPUT_ROOT, repoName);
  console.log(`[4/4] Generating ${repoName}...`);

  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'package.json'), getPackageJson(repoName, 'Everest Pasal — Customer Mobile Application & PWA'));
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), TS_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'vite.config.ts'), VITE_CONFIG);
  fs.writeFileSync(path.join(targetDir, 'index.html'), getIndexHtml('Everest Pasal App — Nepal to the World'));
  fs.writeFileSync(path.join(targetDir, '.gitignore'), COMMON_GITIGNORE);
  fs.writeFileSync(path.join(targetDir, '.env.example'), 'VITE_API_URL=https://api.everestpasal.com\n');

  const targetSrc = path.join(targetDir, 'src');
  copySharedSource(targetSrc);

  // Layout & Pages
  ensureDir(path.join(targetSrc, 'components', 'Layout'));
  fs.copyFileSync(
    path.join(FRONTEND_DIR, 'src', 'components', 'Layout', 'CustomerLayout.tsx'),
    path.join(targetSrc, 'components', 'Layout', 'CustomerLayout.tsx')
  );
  copyDirSync(path.join(FRONTEND_DIR, 'src', 'pages', 'customer'), path.join(targetSrc, 'pages', 'customer'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'ProductsPage.tsx'), path.join(targetSrc, 'pages', 'ProductsPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'CategoriesPage.tsx'), path.join(targetSrc, 'pages', 'CategoriesPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'LoginPage.tsx'), path.join(targetSrc, 'pages', 'LoginPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'RegisterPage.tsx'), path.join(targetSrc, 'pages', 'RegisterPage.tsx'));
  fs.copyFileSync(path.join(FRONTEND_DIR, 'src', 'pages', 'VerifyEmailPage.tsx'), path.join(targetSrc, 'pages', 'VerifyEmailPage.tsx'));

  // Dedicated App View
  const appTsx = `import React from 'react';
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
`;
  fs.writeFileSync(path.join(targetSrc, 'App.tsx'), appTsx);

  const readme = `# EP-Customer-Application

Customer Mobile Application and Progressive Web App (PWA) client for Everest Pasal.

## Overview
- Mobile-first, fast touch-optimized shopping application with seamless local caching and Nepali payment gateway checkout.
- Built with **React 18 + TypeScript + Vite**.

## Setup & Running
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Pushing to Client GitHub Repository
\`\`\`bash
git init
git add .
git commit -m "feat(app): initialize EP-Customer-Application repository"
git branch -M main
git remote add origin https://github.com/<YOUR-ORG-OR-USERNAME>/EP-Customer-Application.git
git push -u origin main --force
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  console.log(`✓ ${repoName} generated successfully.`);
}

// Master execution
function main() {
  console.log('================================================================');
  console.log('Starting Everest Pasal Client Repositories Generation');
  console.log('Target Repositories:');
  console.log('  1. EP-Admin-WebPanel');
  console.log('  2. EP-Vendor-WebPanel');
  console.log('  3. EP-Customer-WebPanel');
  console.log('  4. EP-Customer-Application');
  console.log('================================================================');

  buildAdminWebPanel();
  buildVendorWebPanel();
  buildCustomerWebPanel();
  buildCustomerApplication();

  console.log('================================================================');
  console.log('All 4 client repositories generated in ./client-repos/');
  console.log('================================================================');
}

main();
