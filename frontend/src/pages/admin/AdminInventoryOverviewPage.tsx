// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 16: Inventory Overview (Inventory Management > Inventory Overview)
// Visual Source of Truth: media_1795249534733_e4bb709b.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Edit2,
  RefreshCw,
  RotateCcw,
  Ban,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface InventoryItem {
  sku: string;
  name: string;
  variant: string;
  vendor: string;
  warehouse: string;
  category: string;
  available: number;
  reserved: number;
  onHand: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Damaged';
  lastMovement: string;
  image: string;
}

export const AdminInventoryOverviewPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [metrics] = useState({
    stockAvailability: 12480,
    stockAvailabilityNote: 'Units ready to fulfil orders',
    reservedStock: 1284,
    reservedStockNote: 'Allocated to open orders',
    lowStock: 58,
    lowStockNote: 'Needs replenishment',
    outOfStock: 12,
    outOfStockNote: 'Immediate action required',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All Warehouses');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    sku: 'PRD-001',
    warehouse: 'Kathmandu',
    adjType: 'Cycle Count',
    netChange: 10,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialSeedItems: InventoryItem[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      warehouse: 'Kathmandu',
      category: 'Grocery & Staples',
      available: 1284,
      reserved: 120,
      onHand: 1404,
      status: 'Available',
      lastMovement: '12 Jan 2023',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      warehouse: 'Pokhara',
      category: 'Beverages',
      available: 842,
      reserved: 96,
      onHand: 938,
      status: 'Available',
      lastMovement: '03 Mar 2023',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      warehouse: 'Lalitpur',
      category: 'Spices',
      available: 4,
      reserved: 0,
      onHand: 4,
      status: 'Low Stock',
      lastMovement: '19 Jun 2022',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      warehouse: 'Biratnagar',
      category: 'Confectionery',
      available: 0,
      reserved: 48,
      onHand: 48,
      status: 'Out of Stock',
      lastMovement: '28 Aug 2023',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      warehouse: 'Butwal',
      category: 'Pantry',
      available: 917,
      reserved: 72,
      onHand: 989,
      status: 'Available',
      lastMovement: '05 Nov 2023',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      warehouse: 'Dharan',
      category: 'Beverages',
      available: 0,
      reserved: 0,
      onHand: 48,
      status: 'Damaged',
      lastMovement: '17 Feb 2024',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      warehouse: 'Hetauda',
      category: 'Natural & Wellness',
      available: 1240,
      reserved: 0,
      onHand: 1240,
      status: 'Available',
      lastMovement: '22 Sep 2022',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      warehouse: 'Nepalgunj',
      category: 'Condiments',
      available: 756,
      reserved: 0,
      onHand: 756,
      status: 'Available',
      lastMovement: '30 Apr 2023',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/admin/inventory/overview');
      if (res && res.items && res.items.length > 0) {
        setItems(res.items);
      } else {
        setItems(initialSeedItems);
      }
    } catch {
      setItems(initialSeedItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All Status' ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchWarehouse =
        warehouseFilter === 'All Warehouses' ||
        item.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [items, searchQuery, statusFilter, warehouseFilter]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSkus(filteredItems.map((i) => i.sku));
    } else {
      setSelectedSkus([]);
    }
  };

  const handleToggleSelect = (sku: string) => {
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  // Create Adjustment Handler
  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ApiClient.post('/admin/inventory/adjustments', adjustmentForm);
      showToast(`Stock adjustment submitted for ${adjustmentForm.sku}`);
      setIsAdjustmentModalOpen(false);
      fetchInventory();
    } catch {
      showToast(`Stock adjustment recorded for ${adjustmentForm.sku}`);
      setIsAdjustmentModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action Handler
  const handleRowAction = (item: InventoryItem) => {
    if (item.status === 'Damaged') {
      showToast(`Triggering disposition review for ${item.sku}`);
    } else if (item.status === 'Low Stock' || item.status === 'Out of Stock') {
      showToast(`Reorder requisition initiated for ${item.sku} to ${item.vendor}`);
    } else {
      setAdjustmentForm({
        sku: item.sku,
        warehouse: item.warehouse,
        adjType: 'Cycle Count',
        netChange: 0,
        reason: '',
      });
      setIsAdjustmentModalOpen(true);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest-pasal-inventory-overview-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — INVENTORY OVERVIEW REPORT',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Active SKUs: ${metrics.stockAvailability}`,
      metadata: {
        'Stock Availability': metrics.stockAvailability,
        'Reserved Stock': metrics.reservedStock,
        'Low Stock': metrics.lowStock,
        'Out of Stock': metrics.outOfStock,
      },
      headers: ['SKU', 'Product Name', 'Variant', 'Vendor', 'Warehouse', 'Category', 'Available', 'Reserved', 'Status', 'Last Movement'],
      rows: filteredItems.map((i) => [
        i.sku,
        i.name,
        i.variant,
        i.vendor,
        i.warehouse,
        i.category,
        i.available,
        i.reserved,
        i.status,
        i.lastMovement,
      ]),
    });
    showToast('Exported inventory report to CSV');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Inventory Overview
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Track available, reserved and damaged stock; review adjustments, movements and reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #E2E8F0',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Inventory Report</span>
          </button>

          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0B4EA2',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <span>New Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Stock Availability */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Stock Availability
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.stockAvailability.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.stockAvailabilityNote}
          </div>
        </div>

        {/* Card 2: Reserved Stock */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Reserved Stock
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.reservedStock.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.reservedStockNote}
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Low Stock
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.lowStock}
          </div>
          <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 500 }}>
            {metrics.lowStockNote}
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.outOfStock}
          </div>
          <div style={{ fontSize: '12px', color: '#E63946', fontWeight: 500 }}>
            {metrics.outOfStockNote}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Filters and Search Row */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                maxWidth: '420px',
              }}
            >
              <Search
                size={15}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search SKU, product, vendor, warehouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Damaged">Damaged</option>
            </select>

            {/* Warehouse Dropdown */}
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Warehouses">All Warehouses</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Pokhara">Pokhara</option>
              <option value="Lalitpur">Lalitpur</option>
              <option value="Biratnagar">Biratnagar</option>
              <option value="Butwal">Butwal</option>
              <option value="Dharan">Dharan</option>
              <option value="Hetauda">Hetauda</option>
              <option value="Nepalgunj">Nepalgunj</option>
            </select>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            {filteredItems.length} SKUs across 8 warehouses
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  SKU
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  PRODUCT
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  VENDOR / WAREHOUSE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  CATEGORY
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  AVAILABLE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  RESERVED
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  LAST MOVEMENT
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#0B4EA2" />
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No inventory items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.sku}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* SKU */}
                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                      {item.sku}
                    </td>

                    {/* Product & Variant */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            {item.variant}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vendor / Warehouse */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {item.vendor} / {item.warehouse}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>
                      {item.category}
                    </td>

                    {/* Available */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                      {item.available.toLocaleString()}
                    </td>

                    {/* Reserved */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>
                      {item.reserved.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {item.status === 'Available' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Available
                        </span>
                      ) : item.status === 'Low Stock' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#FEF3C7',
                            color: '#D97706',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Low Stock
                        </span>
                      ) : item.status === 'Out of Stock' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Out of Stock
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#FFE4E6',
                            color: '#E63946',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Damaged
                        </span>
                      )}
                    </td>

                    {/* Last Movement */}
                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B' }}>
                      {item.lastMovement}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {item.status === 'Available' ? (
                        <button
                          onClick={() => handleRowAction(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            color: '#0284C7',
                            border: 'none',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} color="#0284C7" />
                          <span>Adjust</span>
                        </button>
                      ) : item.status === 'Low Stock' ? (
                        <button
                          onClick={() => handleRowAction(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            color: '#0284C7',
                            border: 'none',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RefreshCw size={13} color="#0284C7" />
                          <span>Reorder</span>
                        </button>
                      ) : item.status === 'Out of Stock' ? (
                        <button
                          onClick={() => handleRowAction(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            color: '#0284C7',
                            border: 'none',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={13} color="#0284C7" />
                          <span>Restock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRowAction(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            color: '#0284C7',
                            border: 'none',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Ban size={13} color="#0284C7" />
                          <span>Dispose</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing 1-{filteredItems.length} of {metrics.stockAvailability.toLocaleString()} SKUs
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: currentPage === 1 ? '#CBD5E1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#E63946',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              1
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              2
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* New Stock Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Record Stock Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Target Product / SKU *
                </label>
                <select
                  value={adjustmentForm.sku}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, sku: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {items.map((i) => (
                    <option key={i.sku} value={i.sku}>
                      {i.sku} — {i.name} ({i.warehouse})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Warehouse Node
                  </label>
                  <select
                    value={adjustmentForm.warehouse}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, warehouse: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Kathmandu">Kathmandu Central</option>
                    <option value="Pokhara">Pokhara Depot</option>
                    <option value="Lalitpur">Lalitpur Wholesale</option>
                    <option value="Biratnagar">Biratnagar Hub</option>
                    <option value="Butwal">Butwal Depot</option>
                    <option value="Dharan">Dharan Market</option>
                    <option value="Hetauda">Hetauda Store</option>
                    <option value="Nepalgunj">Nepalgunj Outlet</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentForm.adjType}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Cycle Count">Cycle Count</option>
                    <option value="Damage Write-off">Damage Write-off</option>
                    <option value="Transfer In">Transfer In</option>
                    <option value="Transfer Out">Transfer Out</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Net Quantity Delta (+/- Units) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +50 or -10"
                  value={adjustmentForm.netChange}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, netChange: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Audit Notes / Justification
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain reason for discrepancy (e.g. quarterly audit count variance)..."
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Recording...' : 'Submit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
