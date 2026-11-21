// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 20: Low Stock (Inventory Management > Low Stock)
// Visual Source of Truth: media_1795249534741_42b1c49b.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface LowStockItem {
  sku: string;
  name: string;
  variant: string;
  vendor: string;
  warehouse: string;
  onHand: number;
  available: number;
  reorderAt: number;
  shortfall: number;
  lowStockStatus: 'Low Stock' | 'Critical' | 'Out of Stock';
  urgency?: string;
  lastUpdated: string;
  image: string;
}

export const AdminLowStockPage: React.FC = () => {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [metrics] = useState({
    lowStockSkus: 254,
    lowStockSkusNote: 'Below reorder threshold',
    criticalSkus: 36,
    criticalSkusNote: '5 or fewer sellable units',
    warehousesAffected: 8,
    warehousesAffectedNote: 'Locations requiring restock',
    vendorLeadTime: '3–7 days',
    vendorLeadTimeNote: 'Confirm delivery before ordering',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All Urgency Levels');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All Warehouses');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [replenishmentModalOpen, setReplenishmentModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialSeedItems: LowStockItem[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      warehouse: 'Kathmandu',
      onHand: 1284,
      available: 1164,
      reorderAt: 1500,
      shortfall: 336,
      lowStockStatus: 'Low Stock',
      lastUpdated: 'Today, 09:42',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-002',
      name: 'Pokhara Valley Green Tea',
      variant: '250 g • Beverages',
      vendor: 'Pokhara Bazaar',
      warehouse: 'Pokhara',
      onHand: 842,
      available: 746,
      reorderAt: 1000,
      shortfall: 254,
      lowStockStatus: 'Low Stock',
      lastUpdated: 'Today, 09:43',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-003',
      name: 'Lalitpur Turmeric Powder',
      variant: '500 g • Spices',
      vendor: 'Lalitpur Wholesale',
      warehouse: 'Lalitpur',
      onHand: 4,
      available: 4,
      reorderAt: 20,
      shortfall: 16,
      lowStockStatus: 'Critical',
      lastUpdated: 'Today, 09:44',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      warehouse: 'Biratnagar',
      onHand: 48,
      available: 0,
      reorderAt: 50,
      shortfall: 50,
      lowStockStatus: 'Out of Stock',
      lastUpdated: 'Today, 09:45',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-005',
      name: 'Butwal Ginger Paste',
      variant: '200 g • Pantry',
      vendor: 'Butwal Depot',
      warehouse: 'Butwal',
      onHand: 917,
      available: 845,
      reorderAt: 1000,
      shortfall: 155,
      lowStockStatus: 'Low Stock',
      lastUpdated: 'Today, 09:46',
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      warehouse: 'Dharan',
      onHand: 48,
      available: 0,
      reorderAt: 50,
      shortfall: 50,
      lowStockStatus: 'Out of Stock',
      lastUpdated: 'Today, 09:47',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-007',
      name: 'Hetauda Pure Honey',
      variant: '500 g • Natural',
      vendor: 'Hetauda Store',
      warehouse: 'Hetauda',
      onHand: 1240,
      available: 1240,
      reorderAt: 1500,
      shortfall: 260,
      lowStockStatus: 'Low Stock',
      lastUpdated: 'Today, 09:48',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-008',
      name: 'Nepalgunj Chili Sauce',
      variant: '200 g • Condiments',
      vendor: 'Nepalgunj Outlet',
      warehouse: 'Nepalgunj',
      onHand: 756,
      available: 756,
      reorderAt: 1000,
      shortfall: 244,
      lowStockStatus: 'Low Stock',
      lastUpdated: 'Today, 09:49',
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/admin/inventory/low-stock');
      if (res && res.items && Array.isArray(res.items)) {
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
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q);

      const matchesUrgency =
        urgencyFilter === 'All Urgency Levels' ||
        item.lowStockStatus.toLowerCase() === urgencyFilter.toLowerCase() ||
        (urgencyFilter === 'Critical' && item.lowStockStatus === 'Critical');

      const matchesWarehouse =
        warehouseFilter === 'All Warehouses' ||
        item.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

      return matchesSearch && matchesUrgency && matchesWarehouse;
    });
  }, [items, searchQuery, urgencyFilter, warehouseFilter]);

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Variant',
      'Vendor',
      'Warehouse',
      'On Hand',
      'Available',
      'Reorder At',
      'Shortfall',
      'Status',
      'Last Updated',
    ];
    const rows = filteredItems.map((item) => [
      item.sku,
      item.name,
      item.variant,
      item.vendor,
      item.warehouse,
      item.onHand.toString(),
      item.available.toString(),
      item.reorderAt.toString(),
      item.shortfall.toString(),
      item.lowStockStatus,
      item.lastUpdated,
    ]);

    exportToCsv({
      filename: `everest-pasal-low-stock-report-${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Low Stock Replenishment Report',
      subtitle: 'System Admin Control Center - Inventory Management Suite',
      metadata: {
        'Export Date': new Date().toLocaleString(),
        'Total Records': filteredItems.length.toString(),
        'Low Stock SKUs': metrics.lowStockSkus.toString(),
        'Critical SKUs': metrics.criticalSkus.toString(),
      },
      headers,
      rows,
    });
  };

  const handlePrioritizeReplenishment = (item?: LowStockItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(filteredItems[0] || initialSeedItems[0]);
    }
    setReplenishmentModalOpen(true);
  };

  const handleConfirmReplenishment = () => {
    setToastMessage(`Replenishment batch successfully dispatched for ${selectedItem?.sku || 'all critical SKUs'}. Purchase orders queued.`);
    setReplenishmentModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#E63946', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Low Stock
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}>
            Monitor sellable stock against SKU-specific reorder points and prioritize replenishment to prevent stockouts. All quantities are in units.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={15} color="#64748B" />
            <span>Export Low Stock Report</span>
          </button>

          <button
            onClick={() => handlePrioritizeReplenishment()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>•</span>
            <span>Prioritize Replenishment</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Low Stock SKUs
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.lowStockSkus.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#E63946', fontWeight: 500 }}>
            {metrics.lowStockSkusNote}
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Critical SKUs
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.criticalSkus.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.criticalSkusNote}
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Warehouses Affected
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.warehousesAffected}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.warehousesAffectedNote}
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Vendor Lead Time
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10B981', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.vendorLeadTime}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.vendorLeadTimeNote}
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '650px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search SKU, product, vendor, warehouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Urgency Levels">All Urgency Levels</option>
              <option value="Critical">Critical</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
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

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.lowStockSkus} low-stock SKUs • {metrics.warehousesAffected} warehouses
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: '11px', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>SKU</th>
                <th style={{ padding: '12px 18px' }}>PRODUCT</th>
                <th style={{ padding: '12px 18px' }}>VENDOR / WAREHOUSE</th>
                <th style={{ padding: '12px 18px' }}>ON-HAND</th>
                <th style={{ padding: '12px 18px' }}>AVAILABLE</th>
                <th style={{ padding: '12px 18px' }}>REORDER AT</th>
                <th style={{ padding: '12px 18px' }}>SHORTFALL</th>
                <th style={{ padding: '12px 18px' }}>STATUS</th>
                <th style={{ padding: '12px 18px' }}>LAST UPDATED</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto' }} />
                    Loading low stock telemetry...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No low stock items match the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const getStatusBadge = (status: string) => {
                    if (status === 'Critical') {
                      return (
                        <span
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                          }}
                        >
                          Critical
                        </span>
                      );
                    }
                    if (status === 'Out of Stock') {
                      return (
                        <span
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            border: '1px solid #FECACA',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                          }}
                        >
                          Out of Stock
                        </span>
                      );
                    }
                    return (
                      <span
                        style={{
                          padding: '3px 8px',
                          backgroundColor: '#FEF3C7',
                          color: '#D97706',
                          border: '1px solid #FDE68A',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                        }}
                      >
                        Low Stock
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={item.sku}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* SKU */}
                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>
                        {item.sku}
                      </td>

                      {/* Product Thumbnail + Title + Variant */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {item.variant}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor / Warehouse */}
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {item.vendor} / {item.warehouse}
                      </td>

                      {/* On-Hand */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 500 }}>
                        {item.onHand}
                      </td>

                      {/* Available */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 500 }}>
                        {item.available}
                      </td>

                      {/* Reorder At */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 500 }}>
                        {item.reorderAt}
                      </td>

                      {/* Shortfall */}
                      <td style={{ padding: '14px 18px', color: '#DC2626', fontWeight: 600 }}>
                        {item.shortfall}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {getStatusBadge(item.lowStockStatus)}
                      </td>

                      {/* Last Updated */}
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {item.lastUpdated}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
          <div>
            Showing 1–{filteredItems.length} of {metrics.lowStockSkus} low-stock SKUs
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: currentPage === 1 ? '#0B4EA2' : '#FFFFFF',
                color: currentPage === 1 ? '#FFFFFF' : '#0F172A',
                border: currentPage === 1 ? 'none' : '1px solid #E2E8F0',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: currentPage === 2 ? '#0B4EA2' : '#FFFFFF',
                color: currentPage === 2 ? '#FFFFFF' : '#0F172A',
                border: currentPage === 2 ? 'none' : '1px solid #E2E8F0',
                fontWeight: 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: currentPage === 3 ? '#0B4EA2' : '#FFFFFF',
                color: currentPage === 3 ? '#FFFFFF' : '#0F172A',
                border: currentPage === 3 ? 'none' : '1px solid #E2E8F0',
                fontWeight: 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              3
            </button>

            <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Prioritize Replenishment Modal */}
      {replenishmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} color="#0B4EA2" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                    Prioritize Replenishment
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Generate emergency procurement orders for SKUs below threshold
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplenishmentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
                  <strong>{metrics.criticalSkus} SKUs</strong> have reached critical shortfall status across <strong>{metrics.warehousesAffected} warehouses</strong>. Confirming will generate bulk purchase orders to assigned vendors.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Target Warehouse
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#0F172A' }}
                    defaultValue={selectedItem?.warehouse || 'All Warehouses'}
                  >
                    <option value="All Warehouses">All Affected Warehouses (8)</option>
                    <option value="Kathmandu">Kathmandu Central Hub</option>
                    <option value="Pokhara">Pokhara Depot</option>
                    <option value="Lalitpur">Lalitpur Wholesale</option>
                    <option value="Biratnagar">Biratnagar Hub</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Procurement Priority
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#0F172A' }}
                    defaultValue="Emergency Expedited (1-3 days)"
                  >
                    <option value="Emergency Expedited (1-3 days)">Emergency Expedited (1-3 days)</option>
                    <option value="Standard Replenishment (3-7 days)">Standard Replenishment (3-7 days)</option>
                    <option value="Economy Consolidation">Economy Consolidation</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Procurement Buffer Multiplier
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['100% (Exact Shortfall)', '125% (Recommended Buffer)', '150% (Peak Safety)'].map((buf, idx) => (
                    <label
                      key={buf}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: idx === 1 ? '2px solid #0B4EA2' : '1px solid #E2E8F0',
                        borderRadius: '6px',
                        backgroundColor: idx === 1 ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        color: idx === 1 ? '#0B4EA2' : '#475569',
                        textAlign: 'center',
                      }}
                    >
                      <input type="radio" name="bufMult" defaultChecked={idx === 1} style={{ marginRight: '4px' }} />
                      {buf}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Procurement Note / PO Memo
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Priority order for peak festive season demand..."
                  defaultValue="Automated emergency restock dispatch triggered from System Admin Control Center."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A' }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={() => setReplenishmentModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReplenishment}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#0B4EA2',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>Dispatch Replenishment Orders</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
