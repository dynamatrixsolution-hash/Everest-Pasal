// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 19: Stock Reservations (Inventory Management > Stock Reservations)
// Visual Source of Truth: media_1795249534740_b9dd0706.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface StockReservationItem {
  sku: string;
  name: string;
  variant: string;
  vendor: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  pendingRelease: number;
  availableToSell: number;
  reservationStatus: 'Reserved' | 'Unreserved' | 'Fully Reserved' | 'Unavailable';
  lastUpdated: string;
  image: string;
}

export const AdminStockReservationsPage: React.FC = () => {
  const [items, setItems] = useState<StockReservationItem[]>([]);
  const [metrics] = useState({
    reservedStock: 1284,
    reservedStockNote: 'Allocated for orders',
    pendingRelease: 184,
    pendingReleaseNote: 'Awaiting release',
    overReserved: 36,
    overReservedNote: 'Exceeds on-hand',
    releasedCleared: 1102,
    releasedClearedNote: 'Released from allocation',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('All Reservation States');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All Warehouses');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inspectingItem, setInspectingItem] = useState<StockReservationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialSeedItems: StockReservationItem[] = [
    {
      sku: 'PRD-001',
      name: 'Himalayan Gold Basmati Rice',
      variant: '2 kg • Grocery',
      vendor: 'Himalayan Mart',
      warehouse: 'Kathmandu',
      onHand: 1284,
      reserved: 120,
      pendingRelease: 0,
      availableToSell: 1164,
      reservationStatus: 'Reserved',
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
      reserved: 96,
      pendingRelease: 0,
      availableToSell: 746,
      reservationStatus: 'Reserved',
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
      reserved: 0,
      pendingRelease: 0,
      availableToSell: 4,
      reservationStatus: 'Unreserved',
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
      reserved: 48,
      pendingRelease: 0,
      availableToSell: 0,
      reservationStatus: 'Fully Reserved',
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
      reserved: 72,
      pendingRelease: 0,
      availableToSell: 845,
      reservationStatus: 'Reserved',
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
      reserved: 0,
      pendingRelease: 0,
      availableToSell: 0,
      reservationStatus: 'Unavailable',
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
      reserved: 0,
      pendingRelease: 0,
      availableToSell: 1240,
      reservationStatus: 'Unreserved',
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
      reserved: 0,
      pendingRelease: 0,
      availableToSell: 756,
      reservationStatus: 'Unreserved',
      lastUpdated: 'Today, 09:49',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/admin/inventory/reservations');
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
    fetchReservations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.warehouse.toLowerCase().includes(searchQuery.toLowerCase());

      const matchState =
        stateFilter === 'All Reservation States' ||
        i.reservationStatus.toLowerCase() === stateFilter.toLowerCase();

      const matchWarehouse =
        warehouseFilter === 'All Warehouses' ||
        i.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

      return matchSearch && matchState && matchWarehouse;
    });
  }, [items, searchQuery, stateFilter, warehouseFilter]);

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest-pasal-stock-reservations-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — STOCK RESERVATION REPORT',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Reserved Stock: ${metrics.reservedStock}`,
      metadata: {
        'Reserved Stock': metrics.reservedStock,
        'Pending Release': metrics.pendingRelease,
        'Over-Reserved': metrics.overReserved,
        'Released / Cleared': metrics.releasedCleared,
      },
      headers: ['SKU', 'Product Name', 'Variant', 'Vendor / Warehouse', 'On-Hand', 'Reserved', 'Pending Release', 'Available to Sell', 'Status', 'Last Updated'],
      rows: filteredItems.map((i) => [
        i.sku,
        i.name,
        i.variant,
        `${i.vendor} / ${i.warehouse}`,
        i.onHand,
        i.reserved,
        i.pendingRelease,
        i.availableToSell,
        i.reservationStatus,
        i.lastUpdated,
      ]),
    });
    showToast('Exported reservation report to CSV');
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
            Stock Reservations
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Review SKU-level reservation coverage across warehouses, including allocated order quantities, pending releases, and reserved stock states.
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
            <span>Export Reservation Report</span>
          </button>

          <button
            onClick={() => {
              if (filteredItems.length > 0) setInspectingItem(filteredItems[0]);
            }}
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
            <Eye size={16} color="#FFFFFF" />
            <span>Inspect Reservations</span>
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
        {/* Card 1: Reserved Stock */}
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
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.reservedStockNote}
          </div>
        </div>

        {/* Card 2: Pending Release */}
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
            Pending Release
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.pendingRelease}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.pendingReleaseNote}
          </div>
        </div>

        {/* Card 3: Over-Reserved */}
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
            Over-Reserved
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', marginBottom: '6px' }}>
            {metrics.overReserved}
          </div>
          <div style={{ fontSize: '12px', color: '#E63946', fontWeight: 500 }}>
            {metrics.overReservedNote}
          </div>
        </div>

        {/* Card 4: Released / Cleared */}
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
            Released / Cleared
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.releasedCleared.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.releasedClearedNote}
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

            {/* Reservation States Dropdown */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
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
              <option value="All Reservation States">All Reservation States</option>
              <option value="Reserved">Reserved</option>
              <option value="Unreserved">Unreserved</option>
              <option value="Fully Reserved">Fully Reserved</option>
              <option value="Unavailable">Unavailable</option>
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
            {filteredItems.length} SKUs • 8 warehouses
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
                  ON-HAND
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  RESERVED
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  PENDING RELEASE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  AVAILABLE TO SELL
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>
                  LAST UPDATED
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#0B4EA2" />
                      <span>Loading reservations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No reservation items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.sku}
                    onClick={() => setInspectingItem(item)}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {/* SKU */}
                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                      {item.sku}
                    </td>

                    {/* Product */}
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

                    {/* On-Hand */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                      {item.onHand.toLocaleString()}
                    </td>

                    {/* Reserved */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1D4ED8', fontWeight: 600 }}>
                      {item.reserved}
                    </td>

                    {/* Pending Release */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>
                      {item.pendingRelease}
                    </td>

                    {/* Available to Sell */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                      {item.availableToSell.toLocaleString()}
                    </td>

                    {/* Reservation Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {item.reservationStatus === 'Reserved' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Reserved
                        </span>
                      ) : item.reservationStatus === 'Unreserved' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#F1F5F9',
                            color: '#64748B',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Unreserved
                        </span>
                      ) : item.reservationStatus === 'Fully Reserved' ? (
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
                          Fully Reserved
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
                          Unavailable
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', textAlign: 'right' }}>
                      {item.lastUpdated}
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
            Showing 1-{filteredItems.length} of {metrics.reservedStock.toLocaleString()} SKUs
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

      {/* Inspect Item Modal */}
      {inspectingItem && (
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
              maxWidth: '560px',
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
                Stock Reservation Dossier: {inspectingItem.sku}
              </h3>
              <button
                onClick={() => setInspectingItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}
              >
                <img
                  src={inspectingItem.image}
                  alt={inspectingItem.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    {inspectingItem.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    {inspectingItem.variant} • {inspectingItem.vendor}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600, marginTop: '2px' }}>
                    State: {inspectingItem.reservationStatus} • Warehouse: {inspectingItem.warehouse}
                  </div>
                </div>
              </div>

              {/* Allocation Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#F1F5F9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ON-HAND</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {inspectingItem.onHand}
                  </div>
                </div>
                <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 600 }}>RESERVED</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1D4ED8', marginTop: '4px' }}>
                    {inspectingItem.reserved}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>AVAILABLE</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#166534', marginTop: '4px' }}>
                    {inspectingItem.availableToSell}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
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
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
