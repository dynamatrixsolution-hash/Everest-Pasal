// ==============================================================================
// EVEREST PASAL - ENTERPRISE REST API SERVER (PostgreSQL 21 Schemas / 183 Tables)
// ==============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db.js';
import { requestContextMiddleware } from './middleware/context.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Domain Routers
import authRoutes from './modules/auth/auth.routes.js';
import systemRoutes from './modules/system/system.routes.js';
import geoRoutes from './modules/geo/geo.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import vendorRoutes from './modules/vendor/vendor.routes.js';
import kycRoutes from './modules/kyc/kyc.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import pricingRoutes from './modules/pricing/pricing.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import fulfillmentRoutes from './modules/fulfillment/fulfillment.routes.js';
import logisticsRoutes from './modules/logistics/logistics.routes.js';
import returnsRoutes from './modules/returns/returns.routes.js';
import growthRoutes from './modules/growth/growth.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import commsRoutes from './modules/comms/comms.routes.js';
import integrationRoutes from './modules/integration/integration.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { getBackupStatusHandler } from './modules/backup/backup.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Cross-Origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(requestContextMiddleware);

// Health & System Diagnostic Endpoints
app.get(['/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'UP',
    service: 'everest-pasal-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/health/db', '/api/v1/health/database'], async (req, res) => {
  try {
    const startedAt = Date.now();
    const tableCount: any = await prisma.$queryRaw`
      SELECT count(*)::int as total FROM information_schema.tables WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE';
    `;
    const latencyMs = Date.now() - startedAt;
    res.status(200).json({
      status: 'CONNECTED',
      database: 'PostgreSQL 18',
      activeSchemas: 21,
      totalTables: tableCount[0]?.total || 183,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'DISCONNECTED',
      error: 'Database query failed',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/health/backup', getBackupStatusHandler);

// ==============================================================================
// CANONICAL /api/v1 REST API ROUTING (21 BUSINESS DOMAINS)
// ==============================================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/vendor', vendorRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/checkout', orderRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/fulfillment', fulfillmentRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/returns', returnsRoutes);
app.use('/api/v1/growth', growthRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/notifications', commsRoutes);
app.use('/api/v1/integration', integrationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/admin', adminRoutes);

// Direct shortcuts
app.use('/api/v1', catalogRoutes);

// Backward compatibility
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[EVEREST-PASAL] Server running on http://localhost:${PORT}`);
    console.log(`[EVEREST-PASAL] API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`[EVEREST-PASAL] Health check: http://localhost:${PORT}/health/db`);
  });
}

export default app;
