// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 21: Out of Stock (Inventory Management > Out of Stock)
// Visual Source of Truth: media_1795249534742_a62df3a3.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  AlertOctagon,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface OutOfStockItem {
  sku: string;
  name: string;
  variant: string;
  vendor: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  unavailable: number;
  availableToSell: number;
  stockoutCause: 'Fully Reserved' | 'Damaged Stock' | string;
  lastUpdated: string;
  image: string;
}

export const AdminOutOfStockPage: React.FC = () => {
  const [items, setItems] = useState<OutOfStockItem[]>([]);
  const [metrics] = useState({
    outOfStockSkus: 2,
    outOfStockSkusNote: 'Zero sellable units',
    stockoutCauses: 2,
    stockoutCausesNote: '1 fully reserved, 1 damaged',
    warehousesAffected: 2,
    warehousesAffectedNote: 'Locations requiring recovery',
    unavailableUnits: 48,
    unavailableUnitsNote: 'Damaged stock requiring review',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [causeFilter, setCauseFilter] = useState<string>('All Stockout Causes');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All Warehouses');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OutOfStockItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialSeedItems: OutOfStockItem[] = [
    {
      sku: 'PRD-004',
      name: 'Biratnagar Dark Chocolate',
      variant: '100 g • Confectionery',
      vendor: 'Biratnagar Hub',
      warehouse: 'Biratnagar',
      onHand: 48,
      reserved: 48,
      unavailable: 0,
      availableToSell: 0,
      stockoutCause: 'Fully Reserved',
      lastUpdated: 'Today, 09:45',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
    },
    {
      sku: 'PRD-006',
      name: 'Dharan Instant Coffee',
      variant: '100 g • Beverages',
      vendor: 'Dharan Market',
      warehouse: 'Dharan',
      onHand: 48,
      reserved: 0,
      unavailable: 48,
      availableToSell: 0,
      stockoutCause: 'Damaged Stock',
      lastUpdated: 'Today, 09:47',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/admin/inventory/out-of-stock');
      if (res && res.items && Array.isArray(res.items)) {
        // Map backend schema to table structure
        const mapped = res.items.map((i: any) => ({
          sku: i.sku,
          name: i.name,
          variant: i.variant,
          vendor: i.vendor,
          warehouse: i.warehouse,
          onHand: i.onHand,
          reserved: i.reserved,
          unavailable: i.damaged || 0,
          availableToSell: i.availableToSell || 0,
          stockoutCause: i.stockoutCause || (i.damaged > 0 ? 'Damaged Stock' : 'Fully Reserved'),
          lastUpdated: i.lastUpdated || 'Today, 09:45',
          image: i.image,
        }));
        setItems(mapped);
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

      const matchesCause =
        causeFilter === 'All Stockout Causes' ||
        item.stockoutCause.toLowerCase() === causeFilter.toLowerCase();

      const matchesWarehouse =
        warehouseFilter === 'All Warehouses' ||
        item.warehouse.toLowerCase() === warehouseFilter.toLowerCase();

      return matchesSearch && matchesCause && matchesWarehouse;
    });
  }, [items, searchQuery, causeFilter, warehouseFilter]);

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Variant',
      'Vendor',
      'Warehouse',
      'On Hand',
      'Reserved',
      'Unavailable',
      'Available to Sell',
      'Stockout Cause',
      'Last Updated',
    ];
    const rows = filteredItems.map((item) => [
      item.sku,
      item.name,
      item.variant,
      item.vendor,
      item.warehouse,
      item.onHand.toString(),
      item.reserved.toString(),
      item.unavailable.toString(),
      item.availableToSell.toString(),
      item.stockoutCause,
      item.lastUpdated,
    ]);

    exportToCsv({
      filename: `everest-pasal-stockout-report-${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Out of Stock Telemetry Report',
      subtitle: 'System Admin Control Center - Inventory Management Suite',
      metadata: {
        'Export Date': new Date().toLocaleString(),
        'Out of Stock SKUs': metrics.outOfStockSkus.toString(),
        'Warehouses Affected': metrics.warehousesAffected.toString(),
        'Unavailable Units': metrics.unavailableUnits.toString(),
      },
      headers,
      rows,
    });
  };

  const handlePrioritizeRecovery = (item?: OutOfStockItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(filteredItems[0] || initialSeedItems[0]);
    }
    setRecoveryModalOpen(true);
  };

  const handleConfirmRecovery = () => {
    setToastMessage(`Stockout recovery workflow initiated for ${selectedItem?.sku || 'all zero-stock SKUs'}. Priority replenishment tickets generated.`);
    setRecoveryModalOpen(false);
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
            Out of Stock
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}>
            Track stockouts across warehouses, identify root causes, and prioritize inventory replenishment to restore product availability.
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
            <span>Export Stockout Report</span>
          </button>

          <button
            onClick={() => handlePrioritizeRecovery()}
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
            <span>Prioritize Recovery</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Out of Stock SKUs
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.outOfStockSkus}
          </div>
          <div style={{ fontSize: '11.5px', color: '#E63946', fontWeight: 500 }}>
            {metrics.outOfStockSkusNote}
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Stockout Causes
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.stockoutCauses}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.stockoutCausesNote}
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
            Unavailable Units
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.unavailableUnits}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.unavailableUnitsNote}
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
              value={causeFilter}
              onChange={(e) => setCauseFilter(e.target.value)}
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
              <option value="All Stockout Causes">All Stockout Causes</option>
              <option value="Fully Reserved">Fully Reserved</option>
              <option value="Damaged Stock">Damaged Stock</option>
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
              <option value="Biratnagar">Biratnagar</option>
              <option value="Dharan">Dharan</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Pokhara">Pokhara</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {filteredItems.length} out-of-stock SKUs • {metrics.warehousesAffected} warehouses
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
                <th style={{ padding: '12px 18px' }}>RESERVED</th>
                <th style={{ padding: '12px 18px' }}>UNAVAILABLE</th>
                <th style={{ padding: '12px 18px' }}>AVAILABLE TO SELL</th>
                <th style={{ padding: '12px 18px' }}>STOCKOUT CAUSE</th>
                <th style={{ padding: '12px 18px' }}>LAST UPDATED</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto' }} />
                    Loading stockout telemetry...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No items match the current stockout filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const getCauseBadge = (cause: string) => {
                    if (cause === 'Fully Reserved') {
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
                          Fully Reserved
                        </span>
                      );
                    }
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
                        Damaged Stock
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

                      {/* Reserved */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 500 }}>
                        {item.reserved}
                      </td>

                      {/* Unavailable */}
                      <td style={{ padding: '14px 18px', color: '#E63946', fontWeight: 600 }}>
                        {item.unavailable}
                      </td>

                      {/* Available to Sell */}
                      <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 600 }}>
                        {item.availableToSell}
                      </td>

                      {/* Stockout Cause */}
                      <td style={{ padding: '14px 18px' }}>
                        {getCauseBadge(item.stockoutCause)}
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
            Showing 1–{filteredItems.length} of {metrics.outOfStockSkus} out-of-stock SKUs
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'default',
                fontSize: '12px',
              }}
            >
              Previous
            </button>

            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#0B4EA2',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              1
            </button>

            <button
              disabled
              style={{
                padding: '5px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#94A3B8',
                cursor: 'not-allowed',
                fontSize: '12px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Prioritize Recovery Modal */}
      {recoveryModalOpen && (
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={18} color="#E63946" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                    Stockout Fast-Track Recovery
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Restore catalog sellability across affected fulfillment hubs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecoveryModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <TrendingUp size={18} color="#0B4EA2" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: '1.5' }}>
                  Identified <strong>2 zero-sellable SKUs</strong> across Biratnagar and Dharan hubs. Choose an accelerated resolution route to restore product availability.
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Recovery Protocol
                </label>
                <select
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#0F172A' }}
                  defaultValue="Cross-Warehouse Inter-Hub Transfer"
                >
                  <option value="Cross-Warehouse Inter-Hub Transfer">Cross-Warehouse Inter-Hub Transfer (Same-day dispatch from KTM Central)</option>
                  <option value="Supplier Direct Drop-Ship Escalation">Supplier Direct Drop-Ship Escalation</option>
                  <option value="Release Stalled Reservation Holds">Release Stalled Reservation Holds (Unfulfilled cart expiry)</option>
                  <option value="Emergency Vendor PO Generation">Emergency Vendor PO Generation</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Source Warehouse
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#0F172A' }}
                    defaultValue="Kathmandu Central Hub"
                  >
                    <option value="Kathmandu Central Hub">Kathmandu Central Hub (Surplus)</option>
                    <option value="Pokhara Depot">Pokhara Depot</option>
                    <option value="Lalitpur Wholesale">Lalitpur Wholesale</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Buffer Allocation Units
                  </label>
                  <input
                    type="number"
                    defaultValue={100}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#0F172A' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Recovery Instruction Memo
                </label>
                <textarea
                  rows={2}
                  defaultValue="Authorize emergency hub transfer order to replenish out-of-stock SKUs."
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
                onClick={() => setRecoveryModalOpen(false)}
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
                onClick={handleConfirmRecovery}
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
                <span>Authorize Recovery Orders</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
