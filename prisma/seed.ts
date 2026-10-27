// ==============================================================================
// EVEREST PASAL — PRODUCTION DATABASE SEED
// Populates all 38 tables with coherent, end-to-end e-commerce records
// Author: Senior Backend Engineer & Database Architect
// ==============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n[SEED] ══════════════════════════════════════════════════════');
  console.log('[SEED]  EVEREST PASAL — COMPLETE DATABASE SEED (46 TABLES)');
  console.log('[SEED] ══════════════════════════════════════════════════════\n');

  // Truncate tables for idempotent seeding
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "Session", "VerificationToken", "PasswordResetToken", "OtpRecord", "AccountIdentity",
      "RolePermission", "Permission", "AuthenticationEvent", "DelegationConsent", "Address",
      "VendorFulfillmentItem", "VendorFulfillmentUnit", "DeliveryEvent", "Shipment",
      "CancellationReturnItem", "CancellationReturnRequest", "Refund", "PaymentEvent", "PaymentAttempt",
      "OrderStatusHistory", "OrderItem", "Order", "PurchaseAttempt", "BasketItem", "Basket",
      "CampaignAttribution", "Campaign", "InventoryMovement", "InventoryPosition", "Offer",
      "ProductMedia", "ProductAttribute", "ProductCategory", "ProductVariant", "Product", "Category",
      "PayoutTransaction", "SettlementStatementItem", "EntitlementAdjustment", "StatementPayout",
      "SupportCaseMessage", "SupportCase", "Notification", "AuditEvent", "ConfigurationVersion",
      "RoleAssignment", "VendorProfile", "Organization", "Account"
    CASCADE;
  `);

  // ────────────────────────────────────────────────────────────────────────────
  // 01. ACCOUNTS & ROLES
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Accounts with secure bcrypt hashes...');

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  const adminAccount = await prisma.account.create({
    data: {
      email: 'admin@everestpasal.com.np',
      fullName: 'Everest Pasal Admin',
      passwordHash: defaultPasswordHash,
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  const vendorAccount = await prisma.account.create({
    data: {
      email: 'vendor@himalayan-goods.com.np',
      fullName: 'Himalayan Goods Vendor',
      passwordHash: defaultPasswordHash,
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  const customerAccount = await prisma.account.create({
    data: {
      email: 'ramesh.thapa@gmail.com',
      phone: '+977-9841234567',
      fullName: 'Ramesh Thapa',
      passwordHash: defaultPasswordHash,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: new Date(),
    },
  });

  const supportAccount = await prisma.account.create({
    data: {
      email: 'support@everestpasal.com.np',
      fullName: 'Support Agent Sita',
      passwordHash: defaultPasswordHash,
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  console.log(`[SEED]  ✓ Created 4 accounts`);

  // ────────────────────────────────────────────────────────────────────────────
  // 01B. PERMISSIONS & ROLE-PERMISSIONS (Phase 1 RBAC)
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Granular RBAC Permissions...');

  const permissionsData = [
    // Catalog
    { code: 'product:create', description: 'Create new catalog products', domain: 'CATALOG' },
    { code: 'product:read', description: 'Read product catalog', domain: 'CATALOG' },
    { code: 'product:update', description: 'Update product information', domain: 'CATALOG' },
    { code: 'product:delete', description: 'Archive or discontinue product', domain: 'CATALOG' },
    { code: 'category:manage', description: 'Manage product categories', domain: 'CATALOG' },
    // Vendor Offers & Inventory
    { code: 'offer:manage', description: 'Manage pricing and seller offers', domain: 'VENDOR' },
    { code: 'inventory:adjust', description: 'Perform manual stock adjustments', domain: 'INVENTORY' },
    { code: 'inventory:read', description: 'View stock levels and movements', domain: 'INVENTORY' },
    // Orders & Fulfillment
    { code: 'order:read', description: 'Read customer orders', domain: 'ORDER' },
    { code: 'order:manage', description: 'Manage order status and fulfillment', domain: 'ORDER' },
    { code: 'fulfillment:manage', description: 'Ship and dispatch orders', domain: 'FULFILLMENT' },
    // Financial & Settlements
    { code: 'settlement:read', description: 'Read settlement statements', domain: 'SETTLEMENT' },
    { code: 'settlement:approve', description: 'Approve vendor payouts', domain: 'SETTLEMENT' },
    // Customer Domain
    { code: 'profile:manage', description: 'Manage own user profile and addresses', domain: 'CUSTOMER' },
    { code: 'order:create', description: 'Place customer orders', domain: 'CUSTOMER' },
    // Support & Admin
    { code: 'support:manage', description: 'Manage customer support cases', domain: 'SUPPORT' },
    { code: 'admin:users', description: 'Manage platform accounts and roles', domain: 'ADMIN' },
    { code: 'admin:config', description: 'Manage system configurations and flags', domain: 'ADMIN' },
  ];

  const createdPermissions = await Promise.all(
    permissionsData.map((p) => prisma.permission.create({ data: p }))
  );
  const permMap = new Map(createdPermissions.map((p) => [p.code, p.id]));

  // Assign Role Permissions
  const rolePermissions: { role: any; permissionId: string }[] = [];

  // PLATFORM_ADMIN gets all permissions
  createdPermissions.forEach((p) => {
    rolePermissions.push({ role: 'PLATFORM_ADMIN', permissionId: p.id });
  });

  // VENDOR_ADMIN permissions
  ['offer:manage', 'inventory:adjust', 'inventory:read', 'order:read', 'order:manage', 'fulfillment:manage', 'settlement:read'].forEach((code) => {
    const id = permMap.get(code);
    if (id) rolePermissions.push({ role: 'VENDOR_ADMIN', permissionId: id });
  });

  // VENDOR_STAFF permissions
  ['offer:manage', 'inventory:read', 'order:read', 'fulfillment:manage'].forEach((code) => {
    const id = permMap.get(code);
    if (id) rolePermissions.push({ role: 'VENDOR_STAFF', permissionId: id });
  });

  // CUSTOMER permissions
  ['product:read', 'profile:manage', 'order:create', 'order:read'].forEach((code) => {
    const id = permMap.get(code);
    if (id) rolePermissions.push({ role: 'CUSTOMER', permissionId: id });
  });

  // SUPPORT_AGENT permissions
  ['product:read', 'order:read', 'support:manage'].forEach((code) => {
    const id = permMap.get(code);
    if (id) rolePermissions.push({ role: 'SUPPORT_AGENT', permissionId: id });
  });

  await prisma.rolePermission.createMany({ data: rolePermissions });
  console.log(`[SEED]  ✓ Created ${createdPermissions.length} permissions & ${rolePermissions.length} role grants`);

  // ────────────────────────────────────────────────────────────────────────────
  // 01C. SESSIONS, TOKENS, OAUTH, & AUTH EVENTS
  // ────────────────────────────────────────────────────────────────────────────
  const adminTokenRaw = 'adm_session_' + crypto.randomBytes(16).toString('hex');
  const adminTokenHash = crypto.createHash('sha256').update(adminTokenRaw).digest('hex');

  await prisma.session.create({
    data: {
      accountId: adminAccount.id,
      tokenHash: adminTokenHash,
      deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      ipAddress: '127.0.0.1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const verificationRaw = 'verify_' + crypto.randomBytes(16).toString('hex');
  const verificationHash = crypto.createHash('sha256').update(verificationRaw).digest('hex');

  await prisma.verificationToken.create({
    data: {
      accountId: customerAccount.id,
      purpose: 'EMAIL_VERIFICATION',
      tokenHash: verificationHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      usedAt: new Date(),
    },
  });

  const resetRaw = 'reset_' + crypto.randomBytes(16).toString('hex');
  const resetHash = crypto.createHash('sha256').update(resetRaw).digest('hex');

  await prisma.passwordResetToken.create({
    data: {
      accountId: customerAccount.id,
      tokenHash: resetHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const otpHash = crypto.createHash('sha256').update('123456').digest('hex');
  await prisma.otpRecord.create({
    data: {
      accountId: customerAccount.id,
      destination: '+977-9841234567',
      purpose: 'PHONE_VERIFICATION',
      otpHash: otpHash,
      attemptCount: 1,
      maxAttempts: 5,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: new Date(),
    },
  });

  await prisma.accountIdentity.create({
    data: {
      accountId: customerAccount.id,
      provider: 'GOOGLE',
      providerAccountId: 'google-oauth2-1083948572910394857',
    },
  });

  await prisma.authenticationEvent.createMany({
    data: [
      {
        accountId: adminAccount.id,
        eventType: 'LOGIN_SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'Admin-Browser-Seed',
        metadata: { loginType: 'PASSWORD' },
      },
      {
        accountId: customerAccount.id,
        eventType: 'REGISTER',
        ipAddress: '127.0.0.1',
        userAgent: 'Customer-App-Seed',
        metadata: { channel: 'WEB' },
      },
      {
        accountId: customerAccount.id,
        eventType: 'EMAIL_VERIFIED',
        ipAddress: '127.0.0.1',
        userAgent: 'Customer-App-Seed',
      },
    ],
  });

  console.log(`[SEED]  ✓ Created Auth sessions, tokens, OTP, OAuth, and Auth events`);

  // ────────────────────────────────────────────────────────────────────────────
  // 02. ORGANIZATIONS & VENDOR PROFILES
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Organization & VendorProfile...');

  const organization = await prisma.organization.create({
    data: {
      legalName: 'Himalayan Goods Pvt. Ltd.',
      tradeName: 'Himalayan Goods',
      registrationNo: 'REG-2024-HG-001',
      taxId: 'PAN-604321789',
      status: 'ACTIVE',
      country: 'NP',
    },
  });

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      organizationId: organization.id,
      displayName: 'Himalayan Goods',
      description: 'Premium handcrafted goods from the Himalayas',
      commissionRatePct: new Prisma.Decimal('8.50'),
      settlementCycleDays: 14,
      returnWindowDays: 7,
      isVerified: true,
      rating: new Prisma.Decimal('4.72'),
      totalSales: 1247,
    },
  });

  // Assign roles
  await prisma.roleAssignment.createMany({
    data: [
      { accountId: adminAccount.id, role: 'PLATFORM_ADMIN', organizationId: null },
      { accountId: vendorAccount.id, role: 'VENDOR_ADMIN', organizationId: organization.id },
      { accountId: customerAccount.id, role: 'CUSTOMER', organizationId: null },
      { accountId: supportAccount.id, role: 'SUPPORT_AGENT', organizationId: null },
    ],
  });

  console.log(`[SEED]  ✓ Organization: ${organization.legalName}`);
  console.log(`[SEED]  ✓ VendorProfile: ${vendorProfile.displayName}`);

  // ────────────────────────────────────────────────────────────────────────────
  // 03. ADDRESS
  // ────────────────────────────────────────────────────────────────────────────
  const address = await prisma.address.create({
    data: {
      accountId: customerAccount.id,
      label: 'Home',
      fullName: 'Ramesh Thapa',
      phone: '+977-9841234567',
      addressLine1: 'House 42, Lazimpat Road',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      country: 'NP',
      isDefault: true,
    },
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 04. DELEGATION CONSENT
  // ────────────────────────────────────────────────────────────────────────────
  await prisma.delegationConsent.create({
    data: {
      granterAccountId: customerAccount.id,
      granteeAccountId: supportAccount.id,
      scope: 'READ_ORDERS',
      status: 'ACTIVE',
    },
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 05. PRODUCT CATALOG — Categories
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Product Catalog...');

  const catHandicraft = await prisma.category.create({
    data: { name: 'Handicrafts', slug: 'handicrafts', description: 'Traditional Nepali handicrafts' },
  });
  const catTextile = await prisma.category.create({
    data: { name: 'Textiles & Clothing', slug: 'textiles-clothing', description: 'Hand-woven fabrics and traditional clothing', parentId: catHandicraft.id },
  });
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics', description: 'Gadgets and electronics' },
  });
  const catPhones = await prisma.category.create({
    data: { name: 'Mobile Phones', slug: 'mobile-phones', parentId: catElectronics.id },
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 06. PRODUCTS, MEDIA, ATTRIBUTES, VARIANTS
  // ────────────────────────────────────────────────────────────────────────────

  // Product 1: Traditional Dhaka Fabric
  const productDhaka = await prisma.product.create({
    data: {
      name: 'Dhaka Hand-Woven Fabric',
      slug: 'dhaka-hand-woven-fabric',
      description: 'Authentic Dhaka fabric hand-woven by artisans in Tehrathum, Nepal.',
      brand: 'Himalayan Goods',
      status: 'ACTIVE',
      tags: ['dhaka', 'handwoven', 'traditional', 'nepali'],
    },
  });

  await prisma.productCategory.createMany({
    data: [
      { productId: productDhaka.id, categoryId: catHandicraft.id, isPrimary: false },
      { productId: productDhaka.id, categoryId: catTextile.id, isPrimary: true },
    ],
  });

  await prisma.productMedia.createMany({
    data: [
      { productId: productDhaka.id, url: 'https://assets.everestpasal.com.np/products/dhaka-fabric-01.jpg', altText: 'Dhaka Fabric Primary', isPrimary: true, sortOrder: 1 },
      { productId: productDhaka.id, url: 'https://assets.everestpasal.com.np/products/dhaka-fabric-02.jpg', altText: 'Dhaka Fabric Detail', sortOrder: 2 },
    ],
  });

  await prisma.productAttribute.createMany({
    data: [
      { productId: productDhaka.id, name: 'Material', value: '100% Cotton' },
      { productId: productDhaka.id, name: 'Origin', value: 'Tehrathum, Nepal' },
      { productId: productDhaka.id, name: 'Weave', value: 'Hand-woven' },
    ],
  });

  const variantRed = await prisma.productVariant.create({
    data: { productId: productDhaka.id, name: 'Red - 1 meter', attributes: { color: 'Red', length: '1m' } },
  });
  const variantBlue = await prisma.productVariant.create({
    data: { productId: productDhaka.id, name: 'Blue - 1 meter', attributes: { color: 'Blue', length: '1m' } },
  });

  // Product 2: Pashmina Shawl
  const productPashmina = await prisma.product.create({
    data: {
      name: 'Pure Pashmina Shawl',
      slug: 'pure-pashmina-shawl',
      description: 'Luxuriously soft 100% Pashmina shawl from Himalayan Pashmina goats.',
      brand: 'Himalayan Goods',
      status: 'ACTIVE',
      tags: ['pashmina', 'shawl', 'luxury', 'wool'],
    },
  });
  await prisma.productCategory.create({
    data: { productId: productPashmina.id, categoryId: catTextile.id, isPrimary: true },
  });
  await prisma.productMedia.create({
    data: { productId: productPashmina.id, url: 'https://assets.everestpasal.com.np/products/pashmina-01.jpg', altText: 'Pashmina Shawl', isPrimary: true, sortOrder: 1 },
  });
  await prisma.productAttribute.createMany({
    data: [
      { productId: productPashmina.id, name: 'Material', value: '100% Pashmina' },
      { productId: productPashmina.id, name: 'Origin', value: 'Mustang, Nepal' },
    ],
  });
  const variantPashminaBeige = await prisma.productVariant.create({
    data: { productId: productPashmina.id, name: 'Beige', attributes: { color: 'Beige' } },
  });

  console.log(`[SEED]  ✓ 2 Products, 3 Variants, 4 Categories`);

  // ────────────────────────────────────────────────────────────────────────────
  // 07. OFFERS (SKU-level commercial items)
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Offers...');

  const offerDhakaRed = await prisma.offer.create({
    data: {
      organizationId: organization.id,
      productId: productDhaka.id,
      variantId: variantRed.id,
      sku: 'HG-DHAKA-RED-1M',
      title: 'Dhaka Hand-Woven Fabric — Red, 1 Meter',
      price: new Prisma.Decimal('1200.00'),
      compareAtPrice: new Prisma.Decimal('1500.00'),
      currency: 'NPR',
      status: 'ACTIVE',
      stockQuantity: 150,
    },
  });

  const offerDhakaBlue = await prisma.offer.create({
    data: {
      organizationId: organization.id,
      productId: productDhaka.id,
      variantId: variantBlue.id,
      sku: 'HG-DHAKA-BLUE-1M',
      title: 'Dhaka Hand-Woven Fabric — Blue, 1 Meter',
      price: new Prisma.Decimal('1200.00'),
      currency: 'NPR',
      status: 'ACTIVE',
      stockQuantity: 120,
    },
  });

  const offerPashmina = await prisma.offer.create({
    data: {
      organizationId: organization.id,
      productId: productPashmina.id,
      variantId: variantPashminaBeige.id,
      sku: 'HG-PASHM-BEIGE-REG',
      title: 'Pure Pashmina Shawl — Beige',
      price: new Prisma.Decimal('4500.00'),
      compareAtPrice: new Prisma.Decimal('5500.00'),
      currency: 'NPR',
      status: 'ACTIVE',
      stockQuantity: 40,
      weight: new Prisma.Decimal('0.250'),
    },
  });

  console.log(`[SEED]  ✓ 3 Offers created`);

  // ────────────────────────────────────────────────────────────────────────────
  // 08. INVENTORY POSITIONS & MOVEMENTS
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Inventory...');

  const invDhakaRed = await prisma.inventoryPosition.create({
    data: {
      offerId: offerDhakaRed.id,
      quantityOnHand: 150,
      quantityReserved: 5,
      quantityAvailable: 145,
      warehouseCode: 'KTM-MAIN',
    },
  });

  const invDhakaBlue = await prisma.inventoryPosition.create({
    data: {
      offerId: offerDhakaBlue.id,
      quantityOnHand: 120,
      quantityReserved: 0,
      quantityAvailable: 120,
      warehouseCode: 'KTM-MAIN',
    },
  });

  const invPashmina = await prisma.inventoryPosition.create({
    data: {
      offerId: offerPashmina.id,
      quantityOnHand: 40,
      quantityReserved: 2,
      quantityAvailable: 38,
      warehouseCode: 'KTM-MAIN',
    },
  });

  // Inventory Movements — receipts and a sale reserve
  await prisma.inventoryMovement.createMany({
    data: [
      {
        positionId: invDhakaRed.id,
        movementType: 'RECEIPT',
        quantityDelta: 150,
        quantityBefore: 0,
        quantityAfter: 150,
        referenceType: 'ADJUSTMENT',
        reason: 'Initial stock receipt',
        createdBySystem: true,
      },
      {
        positionId: invDhakaBlue.id,
        movementType: 'RECEIPT',
        quantityDelta: 120,
        quantityBefore: 0,
        quantityAfter: 120,
        referenceType: 'ADJUSTMENT',
        reason: 'Initial stock receipt',
        createdBySystem: true,
      },
      {
        positionId: invPashmina.id,
        movementType: 'RECEIPT',
        quantityDelta: 40,
        quantityBefore: 0,
        quantityAfter: 40,
        referenceType: 'ADJUSTMENT',
        reason: 'Initial stock receipt',
        createdBySystem: true,
      },
      {
        positionId: invDhakaRed.id,
        movementType: 'SALE_RESERVE',
        quantityDelta: -5,
        quantityBefore: 150,
        quantityAfter: 145,
        referenceType: 'ORDER',
        reason: 'Reserved for pending order',
        createdBySystem: true,
      },
    ],
  });

  console.log(`[SEED]  ✓ 3 Inventory Positions, 4 Movements`);

  // ────────────────────────────────────────────────────────────────────────────
  // 09. BASKET & BASKET ITEMS
  // ────────────────────────────────────────────────────────────────────────────
  const basket = await prisma.basket.create({
    data: {
      accountId: customerAccount.id,
      status: 'CHECKED_OUT',
      currency: 'NPR',
    },
  });

  await prisma.basketItem.createMany({
    data: [
      {
        basketId: basket.id,
        offerId: offerDhakaRed.id,
        quantity: 3,
        unitPrice: new Prisma.Decimal('1200.00'),
      },
      {
        basketId: basket.id,
        offerId: offerPashmina.id,
        quantity: 1,
        unitPrice: new Prisma.Decimal('4500.00'),
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 10. CAMPAIGN
  // ────────────────────────────────────────────────────────────────────────────
  const campaign = await prisma.campaign.create({
    data: {
      organizationId: organization.id,
      name: 'Dashain Festival Discount 2081',
      campaignType: 'VOUCHER',
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal('10.00'),
      code: 'DASHAIN2081',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-20'),
      isActive: false,
      usageLimit: 500,
      usageCount: 347,
    },
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 11. PURCHASE ATTEMPT → ORDER
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Purchase Flow...');

  const purchaseAttempt = await prisma.purchaseAttempt.create({
    data: {
      accountId: customerAccount.id,
      idempotencyKey: 'idem_20241015_ramesh_basket_001',
      status: 'COMPLETED',
      totalAmount: new Prisma.Decimal('8100.00'),
      currency: 'NPR',
      completedAt: new Date('2024-10-15T10:32:00Z'),
    },
  });

  const order = await prisma.order.create({
    data: {
      purchaseAttemptId: purchaseAttempt.id,
      accountId: customerAccount.id,
      addressId: address.id,
      orderNumber: 'EP-20241015-000001',
      status: 'DELIVERED',
      subtotal: new Prisma.Decimal('8100.00'),
      discountAmount: new Prisma.Decimal('810.00'),
      shippingAmount: new Prisma.Decimal('150.00'),
      taxAmount: new Prisma.Decimal('0.00'),
      totalAmount: new Prisma.Decimal('7440.00'),
      currency: 'NPR',
      notes: 'Please wrap as a gift.',
      placedAt: new Date('2024-10-15T10:32:00Z'),
    },
  });

  // Campaign attribution
  await prisma.campaignAttribution.create({
    data: {
      campaignId: campaign.id,
      orderId: order.id,
      offerId: offerDhakaRed.id,
      discountApplied: new Prisma.Decimal('810.00'),
    },
  });

  // Order Items (immutable commercial snapshot)
  const orderItemDhaka = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      offerId: offerDhakaRed.id,
      sku: 'HG-DHAKA-RED-1M',
      productName: 'Dhaka Hand-Woven Fabric',
      variantName: 'Red - 1 meter',
      quantity: 3,
      unitPrice: new Prisma.Decimal('1200.00'),
      discountAmount: new Prisma.Decimal('360.00'),
      lineTotal: new Prisma.Decimal('3240.00'),
      taxAmount: new Prisma.Decimal('0.00'),
      currency: 'NPR',
    },
  });

  const orderItemPashmina = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      offerId: offerPashmina.id,
      sku: 'HG-PASHM-BEIGE-REG',
      productName: 'Pure Pashmina Shawl',
      variantName: 'Beige',
      quantity: 1,
      unitPrice: new Prisma.Decimal('4500.00'),
      discountAmount: new Prisma.Decimal('450.00'),
      lineTotal: new Prisma.Decimal('4050.00'),
      taxAmount: new Prisma.Decimal('0.00'),
      currency: 'NPR',
    },
  });

  // Order Status History
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order.id, fromStatus: null, toStatus: 'PENDING_PAYMENT', changedAt: new Date('2024-10-15T10:32:00Z'), changedById: null },
      { orderId: order.id, fromStatus: 'PENDING_PAYMENT', toStatus: 'PAYMENT_CONFIRMED', changedAt: new Date('2024-10-15T10:34:15Z'), changedById: null, reason: 'eSewa payment confirmed' },
      { orderId: order.id, fromStatus: 'PAYMENT_CONFIRMED', toStatus: 'PROCESSING', changedAt: new Date('2024-10-15T10:35:00Z'), changedById: vendorAccount.id },
      { orderId: order.id, fromStatus: 'PROCESSING', toStatus: 'SHIPPED', changedAt: new Date('2024-10-16T09:00:00Z'), changedById: vendorAccount.id },
      { orderId: order.id, fromStatus: 'SHIPPED', toStatus: 'DELIVERED', changedAt: new Date('2024-10-17T14:20:00Z'), changedById: null, reason: 'Delivery confirmed by courier' },
    ],
  });

  console.log(`[SEED]  ✓ Order ${order.orderNumber} created with 2 items`);

  // ────────────────────────────────────────────────────────────────────────────
  // 12. PAYMENTS & EVENTS
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Payment records...');

  const paymentAttempt = await prisma.paymentAttempt.create({
    data: {
      purchaseAttemptId: purchaseAttempt.id,
      gateway: 'ESEWA',
      gatewayTxnRef: 'ESW-2024101500001',
      amount: new Prisma.Decimal('7440.00'),
      currency: 'NPR',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-10-15T10:34:15Z'),
      gatewayResponse: { status: 'COMPLETE', ref_id: 'ESW-2024101500001' },
    },
  });

  await prisma.paymentEvent.createMany({
    data: [
      {
        paymentAttemptId: paymentAttempt.id,
        eventType: 'INITIATED',
        eventReference: 'EVT-ESW-INIT-001',
        payload: { action: 'checkout_initiated', amount: 7440 },
        processedAt: new Date('2024-10-15T10:32:05Z'),
      },
      {
        paymentAttemptId: paymentAttempt.id,
        eventType: 'WEBHOOK_RECEIVED',
        eventReference: 'EVT-ESW-WH-001',
        payload: { status: 'COMPLETE', ref_id: 'ESW-2024101500001', amount: 7440 },
        processedAt: new Date('2024-10-15T10:34:10Z'),
      },
      {
        paymentAttemptId: paymentAttempt.id,
        eventType: 'CONFIRMED',
        eventReference: 'EVT-ESW-CONF-001',
        payload: { verified: true, order_id: order.id },
        processedAt: new Date('2024-10-15T10:34:15Z'),
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 13. FULFILLMENT
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Fulfillment...');

  const fulfillmentUnit = await prisma.vendorFulfillmentUnit.create({
    data: {
      orderId: order.id,
      organizationId: organization.id,
      status: 'DELIVERED',
      handledAt: new Date('2024-10-15T11:00:00Z'),
      shippedAt: new Date('2024-10-16T09:00:00Z'),
      deliveredAt: new Date('2024-10-17T14:20:00Z'),
    },
  });

  await prisma.vendorFulfillmentItem.createMany({
    data: [
      { fulfillmentUnitId: fulfillmentUnit.id, orderItemId: orderItemDhaka.id, quantity: 3 },
      { fulfillmentUnitId: fulfillmentUnit.id, orderItemId: orderItemPashmina.id, quantity: 1 },
    ],
  });

  const shipment = await prisma.shipment.create({
    data: {
      fulfillmentUnitId: fulfillmentUnit.id,
      carrier: 'Nepal Post',
      trackingNumber: 'NP-TRACK-20241016-00001',
      shippedAt: new Date('2024-10-16T09:00:00Z'),
      estimatedDelivery: new Date('2024-10-18T00:00:00Z'),
      actualDelivery: new Date('2024-10-17T14:20:00Z'),
      status: 'DELIVERED',
    },
  });

  await prisma.deliveryEvent.createMany({
    data: [
      { shipmentId: shipment.id, eventType: 'PICKED_UP', location: 'Himalayan Goods Warehouse, Kathmandu', description: 'Package picked up by Nepal Post', occurredAt: new Date('2024-10-16T09:00:00Z') },
      { shipmentId: shipment.id, eventType: 'IN_TRANSIT', location: 'Nepal Post Sorting Centre, Kathmandu', description: 'In transit', occurredAt: new Date('2024-10-16T14:30:00Z') },
      { shipmentId: shipment.id, eventType: 'OUT_FOR_DELIVERY', location: 'Lazimpat Post Office', description: 'Out for delivery', occurredAt: new Date('2024-10-17T09:00:00Z') },
      { shipmentId: shipment.id, eventType: 'DELIVERED', location: 'Lazimpat, Kathmandu', description: 'Delivered to recipient', occurredAt: new Date('2024-10-17T14:20:00Z') },
    ],
  });

  console.log(`[SEED]  ✓ Fulfillment Unit + Shipment + 4 Delivery Events`);

  // ────────────────────────────────────────────────────────────────────────────
  // 14. RETURNS & REFUNDS
  // ────────────────────────────────────────────────────────────────────────────
  const returnRequest = await prisma.cancellationReturnRequest.create({
    data: {
      orderId: order.id,
      requestedById: customerAccount.id,
      requestType: 'RETURN',
      reason: 'Fabric color does not match the photos shown on the website.',
      status: 'APPROVED',
      resolution: 'Approved for return. Refund will be processed within 5 business days.',
      resolvedAt: new Date('2024-10-19T10:00:00Z'),
    },
  });

  await prisma.cancellationReturnItem.create({
    data: {
      requestId: returnRequest.id,
      offerId: offerDhakaRed.id,
      sku: 'HG-DHAKA-RED-1M',
      quantity: 1,
      reason: 'Color mismatch',
    },
  });

  const refund = await prisma.refund.create({
    data: {
      paymentAttemptId: paymentAttempt.id,
      requestId: returnRequest.id,
      amount: new Prisma.Decimal('1080.00'),  // 1 unit @ 1200 - 10% discount = 1080
      currency: 'NPR',
      reason: 'Customer return approved: color mismatch',
      status: 'COMPLETED',
      gatewayRefundRef: 'ESW-REFUND-001',
      processedAt: new Date('2024-10-20T11:00:00Z'),
    },
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 15. SETTLEMENT & PAYOUT
  // ────────────────────────────────────────────────────────────────────────────
  console.log('[SEED] Creating Settlement & Payout...');

  // Entitlement ledger entries
  const earnEntry = await prisma.entitlementAdjustment.create({
    data: {
      organizationId: organization.id,
      adjustmentType: 'EARNING',
      amount: new Prisma.Decimal('7440.00'),
      referenceType: 'ORDER',
      referenceId: order.id,
      description: `Earnings for Order ${order.orderNumber}`,
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-10-31'),
      isSettled: true,
    },
  });

  const commissionEntry = await prisma.entitlementAdjustment.create({
    data: {
      organizationId: organization.id,
      adjustmentType: 'COMMISSION_DEBIT',
      amount: new Prisma.Decimal('-632.00'), // ~8.5% of 7440
      referenceType: 'ORDER',
      referenceId: order.id,
      description: `Platform commission for Order ${order.orderNumber}`,
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-10-31'),
      isSettled: true,
    },
  });

  const refundEntry = await prisma.entitlementAdjustment.create({
    data: {
      organizationId: organization.id,
      adjustmentType: 'REFUND_DEBIT',
      amount: new Prisma.Decimal('-1080.00'),
      referenceType: 'REFUND',
      referenceId: refund.id,
      description: `Refund deduction for RR-${returnRequest.id.substring(0, 8)}`,
      isSettled: true,
    },
  });

  const statement = await prisma.statementPayout.create({
    data: {
      organizationId: organization.id,
      batchNumber: 'SP-HG-2024-OCT-01',
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-10-31'),
      grossAmount: new Prisma.Decimal('7440.00'),
      commissionAmount: new Prisma.Decimal('632.00'),
      refundDeductions: new Prisma.Decimal('1080.00'),
      chargebacks: new Prisma.Decimal('0.00'),
      netAmount: new Prisma.Decimal('5728.00'),
      currency: 'NPR',
      status: 'DISBURSED',
      approvedAt: new Date('2024-11-01T10:00:00Z'),
      disbursedAt: new Date('2024-11-01T14:00:00Z'),
    },
  });

  // Update entitlements to link to statement
  await prisma.entitlementAdjustment.updateMany({
    where: { id: { in: [earnEntry.id, commissionEntry.id, refundEntry.id] } },
    data: { statementId: statement.id },
  });

  // Settlement line items
  await prisma.settlementStatementItem.createMany({
    data: [
      { statementId: statement.id, lineType: 'EARNING', referenceId: order.id, amount: new Prisma.Decimal('7440.00'), description: `Order ${order.orderNumber} revenue`, periodDate: new Date('2024-10-15') },
      { statementId: statement.id, lineType: 'COMMISSION', referenceId: order.id, amount: new Prisma.Decimal('-632.00'), description: 'Platform commission (8.5%)', periodDate: new Date('2024-10-15') },
      { statementId: statement.id, lineType: 'REFUND_DEBIT', referenceId: refund.id, amount: new Prisma.Decimal('-1080.00'), description: 'Customer return refund', periodDate: new Date('2024-10-20') },
    ],
  });

  const payoutTransaction = await prisma.payoutTransaction.create({
    data: {
      statementId: statement.id,
      bankAccount: 'NRB-****-7821',
      bankCode: 'NABIL',
      transactionRef: 'NABIL-RTGS-20241101-HG-001',
      amount: new Prisma.Decimal('5728.00'),
      currency: 'NPR',
      status: 'DISBURSED',
      completedAt: new Date('2024-11-01T14:00:00Z'),
    },
  });

  console.log(`[SEED]  ✓ Statement ${statement.batchNumber} | Net: NPR ${statement.netAmount}`);

  // ────────────────────────────────────────────────────────────────────────────
  // 16. SUPPORT CASE
  // ────────────────────────────────────────────────────────────────────────────
  const supportCase = await prisma.supportCase.create({
    data: {
      accountId: customerAccount.id,
      subject: 'Return request update needed',
      category: 'ORDER',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      referenceOrderId: order.id,
      resolution: 'Return approved and refund processed.',
      resolvedAt: new Date('2024-10-19T10:30:00Z'),
    },
  });

  await prisma.supportCaseMessage.createMany({
    data: [
      {
        caseId: supportCase.id,
        authorId: customerAccount.id,
        body: 'Hello, I would like to return one piece of the Dhaka fabric as the color is different from what was shown.',
        sentAt: new Date('2024-10-18T09:00:00Z'),
      },
      {
        caseId: supportCase.id,
        authorId: supportAccount.id,
        body: 'Hello Ramesh, we have reviewed your request and approved the return. A refund of NPR 1,080 will be processed within 5 business days.',
        sentAt: new Date('2024-10-19T10:00:00Z'),
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 17. NOTIFICATIONS
  // ────────────────────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        accountId: customerAccount.id,
        type: 'ORDER_CONFIRMED',
        channel: 'IN_APP',
        title: 'Order Confirmed!',
        body: `Your order ${order.orderNumber} has been confirmed. We are processing it now.`,
        referenceId: order.id,
        isRead: true,
        readAt: new Date('2024-10-15T11:00:00Z'),
        sentAt: new Date('2024-10-15T10:34:15Z'),
      },
      {
        accountId: customerAccount.id,
        type: 'ORDER_SHIPPED',
        channel: 'SMS',
        title: 'Your Order is on the Way!',
        body: `Order ${order.orderNumber} has been shipped via Nepal Post. Tracking: NP-TRACK-20241016-00001`,
        referenceId: order.id,
        isRead: true,
        readAt: new Date('2024-10-16T10:00:00Z'),
        sentAt: new Date('2024-10-16T09:05:00Z'),
      },
      {
        accountId: customerAccount.id,
        type: 'ORDER_DELIVERED',
        channel: 'IN_APP',
        title: 'Order Delivered!',
        body: `Your order ${order.orderNumber} has been delivered. Enjoy your purchase!`,
        referenceId: order.id,
        isRead: false,
        sentAt: new Date('2024-10-17T14:25:00Z'),
      },
      {
        accountId: customerAccount.id,
        type: 'REFUND_PROCESSED',
        channel: 'EMAIL',
        title: 'Refund Processed',
        body: `Your refund of NPR 1,080 for return has been processed and will reflect within 3-5 business days.`,
        referenceId: refund.id,
        isRead: true,
        readAt: new Date('2024-10-20T12:00:00Z'),
        sentAt: new Date('2024-10-20T11:05:00Z'),
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 18. AUDIT EVENTS
  // ────────────────────────────────────────────────────────────────────────────
  await prisma.auditEvent.createMany({
    data: [
      {
        eventType: 'DATABASE_SEED_COMPLETED',
        entityType: 'System',
        entityId: null,
        actorType: 'SYSTEM',
        payload: { message: 'Initial seed completed', tables: 38 },
        occurredAt: new Date(),
      },
      {
        eventType: 'ORDER_PLACED',
        entityType: 'Order',
        entityId: order.id,
        actorId: customerAccount.id,
        actorType: 'ACCOUNT',
        payload: { orderNumber: order.orderNumber, totalAmount: '7440.00' },
        occurredAt: new Date('2024-10-15T10:32:00Z'),
      },
      {
        eventType: 'PAYMENT_CONFIRMED',
        entityType: 'PaymentAttempt',
        entityId: paymentAttempt.id,
        actorType: 'GATEWAY_WEBHOOK',
        payload: { gateway: 'ESEWA', ref: 'ESW-2024101500001' },
        occurredAt: new Date('2024-10-15T10:34:15Z'),
      },
      {
        eventType: 'REFUND_ISSUED',
        entityType: 'Refund',
        entityId: refund.id,
        actorId: supportAccount.id,
        actorType: 'ACCOUNT',
        payload: { amount: '1080.00', gateway: 'ESEWA' },
        occurredAt: new Date('2024-10-20T11:00:00Z'),
      },
      {
        eventType: 'PAYOUT_DISBURSED',
        entityType: 'StatementPayout',
        entityId: statement.id,
        actorType: 'SYSTEM',
        payload: { batchNumber: statement.batchNumber, net: '5728.00' },
        occurredAt: new Date('2024-11-01T14:00:00Z'),
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 19. CONFIGURATION VERSIONS
  // ────────────────────────────────────────────────────────────────────────────
  await prisma.configurationVersion.createMany({
    data: [
      {
        key: 'platform.commission_rate_default',
        value: { percentage: 10.0, currency: 'NPR' },
        environment: 'production',
        version: 1,
        description: 'Default platform commission rate for all vendors',
        isActive: true,
      },
      {
        key: 'platform.settlement_cycle_days',
        value: { days: 14 },
        environment: 'production',
        version: 1,
        description: 'Default settlement cycle in days',
        isActive: true,
      },
      {
        key: 'platform.return_window_days',
        value: { days: 7 },
        environment: 'production',
        version: 1,
        description: 'Customer return window in days post-delivery',
        isActive: true,
      },
      {
        key: 'backup.retention_days',
        value: { days: 7 },
        environment: 'production',
        version: 1,
        description: 'Number of days to retain database backups',
        isActive: true,
      },
    ],
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ────────────────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.account.count(),
    prisma.organization.count(),
    prisma.vendorProfile.count(),
    prisma.address.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.offer.count(),
    prisma.inventoryPosition.count(),
    prisma.inventoryMovement.count(),
    prisma.basket.count(),
    prisma.basketItem.count(),
    prisma.campaign.count(),
    prisma.purchaseAttempt.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderStatusHistory.count(),
    prisma.paymentAttempt.count(),
    prisma.paymentEvent.count(),
    prisma.vendorFulfillmentUnit.count(),
    prisma.vendorFulfillmentItem.count(),
    prisma.shipment.count(),
    prisma.deliveryEvent.count(),
    prisma.cancellationReturnRequest.count(),
    prisma.cancellationReturnItem.count(),
    prisma.refund.count(),
    prisma.entitlementAdjustment.count(),
    prisma.statementPayout.count(),
    prisma.settlementStatementItem.count(),
    prisma.payoutTransaction.count(),
    prisma.supportCase.count(),
    prisma.supportCaseMessage.count(),
    prisma.notification.count(),
    prisma.auditEvent.count(),
    prisma.configurationVersion.count(),
    prisma.roleAssignment.count(),
    prisma.delegationConsent.count(),
    prisma.campaignAttribution.count(),
    prisma.session.count(),
    prisma.verificationToken.count(),
    prisma.passwordResetToken.count(),
    prisma.otpRecord.count(),
    prisma.accountIdentity.count(),
    prisma.permission.count(),
    prisma.rolePermission.count(),
    prisma.authenticationEvent.count(),
  ]);

  const tableNames = [
    'Account', 'Organization', 'VendorProfile', 'Address', 'Category',
    'Product', 'ProductVariant', 'Offer', 'InventoryPosition', 'InventoryMovement',
    'Basket', 'BasketItem', 'Campaign', 'PurchaseAttempt', 'Order',
    'OrderItem', 'OrderStatusHistory', 'PaymentAttempt', 'PaymentEvent',
    'VendorFulfillmentUnit', 'VendorFulfillmentItem', 'Shipment', 'DeliveryEvent',
    'CancellationReturnRequest', 'CancellationReturnItem', 'Refund',
    'EntitlementAdjustment', 'StatementPayout', 'SettlementStatementItem',
    'PayoutTransaction', 'SupportCase', 'SupportCaseMessage', 'Notification',
    'AuditEvent', 'ConfigurationVersion', 'RoleAssignment', 'DelegationConsent',
    'CampaignAttribution', 'Session', 'VerificationToken', 'PasswordResetToken',
    'OtpRecord', 'AccountIdentity', 'Permission', 'RolePermission', 'AuthenticationEvent',
  ];

  console.log('\n[SEED] ══════════════════════════════════════════════════════');
  console.log('[SEED]  SEED COMPLETE — TABLE ROW COUNTS (46 TABLES)');
  console.log('[SEED] ══════════════════════════════════════════════════════');
  tableNames.forEach((name, i) => {
    console.log(`[SEED]  ${name.padEnd(30)} ${counts[i]} rows`);
  });
  console.log('[SEED] ══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('[SEED-ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
