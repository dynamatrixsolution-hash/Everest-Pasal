import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';

interface InventoryItem {
  id: string;
  product_id?: string;
  title: string;
  sku: string;
  category: string;
  available_units: number;
  reserved_units: number;
  total_units: number;
  threshold: number;
  status: 'In stock' | 'Low stock' | 'Out of stock';
  value: number;
  updated_at: string;
  image?: string;
  images?: string[];
  recentMovements?: Array<{
    type: string;
    description: string;
    change: string;
    date: string;
    isPositive: boolean;
  }>;
}

interface StockMovement {
  id: string;
  title: string;
  type: string;
  change: string;
  date: string;
  isPositive: boolean;
}

interface NeedsAttentionItem {
  id: string;
  title: string;
  subtitle: string;
  actionType: 'RESTOCK' | 'ADJUST';
}

// Crisp inline SVGs
const BoxIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const LayersIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const AlertTriangleIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const SlashIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

const DollarIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const PlusCircleIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const ClockIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DownloadIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const SearchIcon = ({ size = 16, color = '#94A3B8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SlidersIcon = ({ size = 16, color = '#64748B' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

export const VendorInventoryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('Stock low to high');
  
  // Data states
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 248,
    totalStockUnits: 4862,
    lowStock: 18,
    outOfStock: 7,
    inventoryValue: 1240500,
  });
  const [showAttentionAlert, setShowAttentionAlert] = useState<boolean>(true);

  // Drawer & Modal states
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<InventoryItem | null>(null);
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'Add stock' | 'Remove stock' | 'Set quantity'>('Add stock');
  const [adjustQty, setAdjustQty] = useState<number>(25);
  const [adjustReason, setAdjustReason] = useState<string>('Restock from supplier');
  const [adjustNotes, setAdjustNotes] = useState<string>('Received shipment from Himalayan Foods Co.');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch Inventory Data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(`/api/v1/vendor/inventory?tab=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
      if (res && res.data) {
        const d = res.data;
        setInventoryItems(d.items || []);
        if (d.metrics) setMetrics(d.metrics);
        if (d.recentMovements) setRecentMovements(d.recentMovements);
        if (d.needsAttention) setNeedsAttention(d.needsAttention);
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeTab]);

  // Handle Save Stock Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    try {
      setIsSubmittingAdjust(true);
      await ApiClient.post(`/api/v1/vendor/inventory/${adjustModalItem.id}/adjust`, {
        type: adjustType,
        quantity: adjustQty,
        reason: adjustReason,
        notes: adjustNotes,
      });

      // Update local state smoothly
      let newAvailable = adjustModalItem.available_units;
      if (adjustType === 'Add stock') {
        newAvailable += adjustQty;
      } else if (adjustType === 'Remove stock') {
        newAvailable = Math.max(0, newAvailable - adjustQty);
      } else {
        newAvailable = adjustQty;
      }

      const newStatus: 'In stock' | 'Low stock' | 'Out of stock' =
        newAvailable === 0 ? 'Out of stock' : newAvailable <= adjustModalItem.threshold ? 'Low stock' : 'In stock';

      setInventoryItems((prev) =>
        prev.map((item) =>
          item.id === adjustModalItem.id
            ? {
                ...item,
                available_units: newAvailable,
                total_units: newAvailable + item.reserved_units,
                status: newStatus,
                updated_at: 'Just now',
              }
            : item
        )
      );

      if (selectedDrawerItem && selectedDrawerItem.id === adjustModalItem.id) {
        setSelectedDrawerItem((prev) =>
          prev
            ? {
                ...prev,
                available_units: newAvailable,
                total_units: newAvailable + prev.reserved_units,
                status: newStatus,
              }
            : null
        );
      }

      setSuccessToast(`Stock adjusted successfully for ${adjustModalItem.title}!`);
      setAdjustModalItem(null);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message}`);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Calculate live preview stock
  const calculatePreviewStock = () => {
    if (!adjustModalItem) return 0;
    const current = adjustModalItem.available_units;
    if (adjustType === 'Add stock') return current + (adjustQty || 0);
    if (adjustType === 'Remove stock') return Math.max(0, current - (adjustQty || 0));
    return adjustQty || 0;
  };

  // Filter items locally by search and filters
  const filteredItems = inventoryItems.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = item.title.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div style={{ padding: '0 0 60px 0', minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      {/* Toast Feedback */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Inventory
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Monitor stock levels, manage availability, and keep your store ready for orders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["SKU,Title,Category,Available,Status", ...inventoryItems.map(i => `${i.sku},"${i.title}",${i.category},${i.available_units},${i.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setSuccessToast("Stock report exported successfully!");
              setTimeout(() => setSuccessToast(null), 3000);
            }}
            style={{
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Export
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('recent-movements-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Stock movements
          </button>

          <button
            onClick={() => {
              if (inventoryItems.length > 0) {
                setAdjustModalItem(inventoryItems[0]);
                setAdjustQty(25);
                setAdjustType('Add stock');
              }
            }}
            style={{
              padding: '9px 18px',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
          >
            + Adjust stock
          </button>
        </div>
      </div>

      {/* 5 KPI METRICS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* TOTAL PRODUCTS */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL PRODUCTS</span>
            <div style={{ color: '#94A3B8' }}><BoxIcon size={18} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
            {metrics.totalProducts}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Items tracked</div>
        </div>

        {/* TOTAL STOCK UNITS */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL STOCK UNITS</span>
            <div style={{ color: '#94A3B8' }}><LayersIcon size={18} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
            {metrics.totalStockUnits.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Across all products</div>
        </div>

        {/* LOW STOCK */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>LOW STOCK</span>
            <div style={{ color: '#2563EB' }}><AlertTriangleIcon size={18} color="#2563EB" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', marginBottom: '4px' }}>
            {metrics.lowStock}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Products need restocking</div>
        </div>

        {/* OUT OF STOCK */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>OUT OF STOCK</span>
            <div style={{ color: '#E5484D' }}><SlashIcon size={18} color="#E5484D" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#E5484D', marginBottom: '4px' }}>
            {metrics.outOfStock}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Products unavailable</div>
        </div>

        {/* INVENTORY VALUE */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>INVENTORY VALUE</span>
            <div style={{ color: '#94A3B8' }}><DollarIcon size={18} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
            NPR {metrics.inventoryValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>Estimated stock value</div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW (4 Cards) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {/* Action 1: Adjust stock */}
          <div
            onClick={() => {
              if (inventoryItems.length > 0) {
                setAdjustModalItem(inventoryItems[0]);
                setAdjustQty(25);
                setAdjustType('Add stock');
              }
            }}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircleIcon size={20} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Adjust stock</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Update product quantities</div>
            </div>
          </div>

          {/* Action 2: Stock movements */}
          <div
            onClick={() => {
              const el = document.getElementById('recent-movements-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockIcon size={20} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Stock movements</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Track inventory changes</div>
            </div>
          </div>

          {/* Action 3: Low-stock items */}
          <div
            onClick={() => setActiveTab('LOW_STOCK')}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangleIcon size={20} color="#2563EB" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Low-stock items</span>
                <span style={{ backgroundColor: '#E5484D', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                  {metrics.lowStock}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{metrics.lowStock} products need restock</div>
            </div>
          </div>

          {/* Action 4: Export inventory */}
          <div
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + ["SKU,Title,Category,Available,Status", ...inventoryItems.map(i => `${i.sku},"${i.title}",${i.category},${i.available_units},${i.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setSuccessToast("Stock report exported successfully!");
              setTimeout(() => setSuccessToast(null), 3000);
            }}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECE7DE',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DownloadIcon size={20} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Export inventory</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Download stock report</div>
            </div>
          </div>
        </div>
      </div>

      {/* ATTENTION BANNER */}
      {showAttentionAlert && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#2563EB' }}><AlertTriangleIcon size={18} color="#2563EB" /></div>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
              {metrics.lowStock} products are running low on stock and {metrics.outOfStock} are out of stock.{' '}
              <button
                onClick={() => setActiveTab('LOW_STOCK')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                View low-stock items →
              </button>
            </span>
          </div>

          <button
            onClick={() => setShowAttentionAlert(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN CONTENT CARD */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
        {/* TAB FILTER PILLS */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'ALL' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'ALL' ? '#2563EB' : '#64748B',
            }}
          >
            All ({metrics.totalProducts})
          </button>

          <button
            onClick={() => setActiveTab('IN_STOCK')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'IN_STOCK' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'IN_STOCK' ? '#2563EB' : '#64748B',
            }}
          >
            In stock ({metrics.totalProducts - metrics.lowStock - metrics.outOfStock})
          </button>

          <button
            onClick={() => setActiveTab('LOW_STOCK')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'LOW_STOCK' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'LOW_STOCK' ? '#2563EB' : '#64748B',
            }}
          >
            Low stock ({metrics.lowStock})
          </button>

          <button
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'OUT_OF_STOCK' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'OUT_OF_STOCK' ? '#2563EB' : '#64748B',
            }}
          >
            Out of stock ({metrics.outOfStock})
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <div style={{ position: 'absolute', left: '12px', top: '10px' }}><SearchIcon size={16} /></div>
              <input
                type="text"
                placeholder="Search by product name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid #ECE7DE',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                fontSize: '13px',
                color: '#334155',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="ALL">Category ▾</option>
              <option value="Groceries">Groceries</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Beverages">Beverages</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Accessories">Accessories</option>
            </select>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                fontSize: '13px',
                color: '#334155',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="ALL">Warehouse ▾</option>
              <option value="KATHMANDU_MAIN">Kathmandu Hub</option>
              <option value="POKHARA_CENTRAL">Pokhara Center</option>
            </select>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                fontSize: '13px',
                color: '#334155',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="ALL">Brand ▾</option>
              <option value="Royal Harvest">Royal Harvest</option>
              <option value="Himalayan Organics">Himalayan Organics</option>
            </select>

            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedWarehouse('ALL');
                setSelectedBrand('ALL');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 8px',
              }}
            >
              + More filters
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                fontSize: '13px',
                color: '#334155',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="Stock low to high">Sort by: Stock low to high ▾</option>
              <option value="Stock high to low">Sort by: Stock high to low ▾</option>
              <option value="Recently updated">Sort by: Recently updated ▾</option>
            </select>

            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #ECE7DE',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SlidersIcon size={16} />
            </button>
          </div>
        </div>

        {/* INVENTORY TABLE OR EMPTY STATE */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <div>Loading stock records...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY STATE MATCHING inventory-empty-state.png */
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <BoxIcon size={32} color="#2563EB" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
              Your inventory is empty
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Add products to begin tracking stock levels and managing your inventory.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => navigate('/vendor/products')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                + Add product
              </button>
              <button
                onClick={() => alert('Import products wizard')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #ECE7DE',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Import products
              </button>
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Learn about Everest Pasal multi-warehouse stock management.'); }}
              style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              Learn about inventory management →
            </a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ECE7DE', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '14px 16px' }}>PRODUCT</th>
                  <th style={{ padding: '14px 16px' }}>SKU</th>
                  <th style={{ padding: '14px 16px' }}>CATEGORY</th>
                  <th style={{ padding: '14px 16px' }}>AVAILABLE</th>
                  <th style={{ padding: '14px 16px' }}>RESERVED</th>
                  <th style={{ padding: '14px 16px' }}>THRESHOLD</th>
                  <th style={{ padding: '14px 16px' }}>STATUS</th>
                  <th style={{ padding: '14px 16px' }}>LAST UPDATED</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isChecked = selectedItems.includes(item.id);
                  const isLow = item.status === 'Low stock';
                  const isOut = item.status === 'Out of stock';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedDrawerItem(item)}
                      style={{
                        borderBottom: '1px solid #ECE7DE',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease',
                        backgroundColor: isChecked ? '#F8FAFC' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isChecked ? '#F8FAFC' : 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Product Thumbnail + Name + Sub SKU */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ECE7DE' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>{item.title}</div>
                            <div style={{ color: '#94A3B8', fontSize: '11px' }}>{item.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontWeight: 500 }}>
                        {item.sku}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        {item.category}
                      </td>

                      {/* Available */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isOut ? '#E5484D' : isLow ? '#2563EB' : '#1E293B',
                          }}
                        >
                          {item.available_units} units
                        </span>
                      </td>

                      {/* Reserved */}
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>
                        {item.reserved_units}
                      </td>

                      {/* Threshold */}
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>
                        {item.threshold}
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.status === 'In stock' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                            In stock
                          </span>
                        )}
                        {item.status === 'Low stock' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                            Low stock
                          </span>
                        )}
                        {item.status === 'Out of stock' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                            Out of stock
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px' }}>
                        {item.updated_at}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setAdjustModalItem(item);
                            setAdjustQty(item.status === 'Out of stock' ? 50 : 25);
                            setAdjustType('Add stock');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                          title="Adjust stock"
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {filteredItems.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #ECE7DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#64748B',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>Showing 1-{filteredItems.length} of {metrics.totalProducts} items</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                ←
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                3
              </button>
              <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                31
              </button>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Items per page:</span>
              <select
                defaultValue="25"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DE',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM DUAL CARDS SECTION */}
      <div
        id="recent-movements-section"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
        }}
      >
        {/* LEFT: Recent Stock Movements */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>
                Recent stock movements
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Track additions, removals, and reservations
              </p>
            </div>
            <button
              onClick={() => alert('View all stock audit log movements')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentMovements.map((m, idx) => (
              <div
                key={m.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: idx < recentMovements.length - 1 ? '1px solid #ECE7DE' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: m.isPositive ? '#DCFCE7' : '#FEE2E2',
                      color: m.isPositive ? '#166534' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {m.isPositive ? '↑' : '↓'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{m.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{m.type}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: m.isPositive ? '#10B981' : '#E5484D',
                    }}
                  >
                    {m.change}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Needs Attention */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DE', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>
                Needs attention
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Items requiring manual restock or adjust
              </p>
            </div>
            <div style={{ color: '#2563EB' }}><AlertTriangleIcon size={18} color="#2563EB" /></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            {needsAttention.map((item) => {
              const isRestock = item.actionType === 'RESTOCK';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isRestock ? '#E5484D' : '#2563EB',
                        marginTop: '5px',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const found = inventoryItems.find((i) => i.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 10)));
                      if (found) {
                        setAdjustModalItem(found);
                        setAdjustQty(isRestock ? 50 : 20);
                        setAdjustType('Add stock');
                      } else {
                        setAdjustModalItem({
                          id: item.id,
                          title: item.title,
                          sku: 'EP-AUTO-001',
                          category: 'General',
                          available_units: 0,
                          reserved_units: 0,
                          total_units: 0,
                          threshold: 10,
                          status: isRestock ? 'Out of stock' : 'Low stock',
                          value: 0,
                          updated_at: 'Just now',
                          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
                        });
                        setAdjustQty(25);
                        setAdjustType('Add stock');
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: isRestock ? '#E5484D' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isRestock ? 'Restock' : 'Adjust'}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <button
              onClick={() => setActiveTab('LOW_STOCK')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              View all 25 items →
            </button>
          </div>
        </div>
      </div>

      {/* INVENTORY DETAIL DRAWER (inventory-detail-drawer.png) */}
      {selectedDrawerItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedDrawerItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
                  {selectedDrawerItem.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{selectedDrawerItem.sku}</span>
                  {selectedDrawerItem.status === 'In stock' && (
                    <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                      • In stock
                    </span>
                  )}
                  {selectedDrawerItem.status === 'Low stock' && (
                    <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                      • Low stock
                    </span>
                  )}
                  {selectedDrawerItem.status === 'Out of stock' && (
                    <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                      • Out of stock
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedDrawerItem(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', flex: 1 }}>
              {/* Product Main Gallery Photo */}
              <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ECE7DE', marginBottom: '12px', backgroundColor: '#F8FAFC' }}>
                <img
                  src={selectedDrawerItem.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'}
                  alt={selectedDrawerItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Thumbnails row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      border: idx === 1 ? '2px solid #2563EB' : '1px solid #ECE7DE',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={selectedDrawerItem.images?.[idx - 1] || selectedDrawerItem.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80'}
                      alt="Thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>

              {/* STOCK DETAILS */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Stock Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Category</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedDrawerItem.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Available</span>
                    <span style={{ fontWeight: 700, color: '#10B981' }}>{selectedDrawerItem.available_units} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Reserved</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedDrawerItem.reserved_units} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Total</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedDrawerItem.total_units} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Threshold</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedDrawerItem.threshold} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Value</span>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>NPR {selectedDrawerItem.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RECENT MOVEMENTS FOR THIS PRODUCT */}
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Recent Movements
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedDrawerItem.recentMovements || [
                    { type: 'Restock', description: 'Restock', change: '+50 units', date: 'Today', isPositive: true },
                    { type: 'Order #EP-1048', description: 'Order reserved', change: '-3 units', date: 'Yesterday', isPositive: false },
                    { type: 'Return', description: 'Customer return', change: '+20 units', date: 'Sep 14', isPositive: true },
                    { type: 'Damaged', description: 'Damaged goods', change: '-8 units', date: 'Sep 12', isPositive: false },
                  ]).map((mv, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: mv.isPositive ? '#DCFCE7' : '#FEE2E2',
                            color: mv.isPositive ? '#166534' : '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {mv.isPositive ? '↑' : '↓'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>{mv.type}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{mv.date}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: mv.isPositive ? '#10B981' : '#E5484D' }}>
                        {mv.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #ECE7DE', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <button
                  onClick={() => {
                    setAdjustModalItem(selectedDrawerItem);
                    setAdjustQty(25);
                    setAdjustType('Add stock');
                  }}
                  style={{
                    padding: '11px 0',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Adjust stock
                </button>
                <button
                  onClick={() => navigate('/vendor/products')}
                  style={{
                    padding: '11px 0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    border: '1px solid #ECE7DE',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  View product
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Full stock history ledger for SKU ${selectedDrawerItem.sku}`); }}
                  style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                >
                  Full stock history →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL (inventory-adjust-stock-modal.png) */}
      {adjustModalItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAdjustModalItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Adjust stock
              </h2>
              <button
                onClick={() => setAdjustModalItem(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdjustment} style={{ padding: '24px' }}>
              {/* Product preview picker card */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Product
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ECE7DE',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={adjustModalItem.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80'}
                      alt={adjustModalItem.title}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{adjustModalItem.title}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>SKU: {adjustModalItem.sku}</div>
                    </div>
                  </div>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>▾</span>
                </div>
              </div>

              {/* Current Stock & Quantity row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                    Current stock
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${adjustModalItem.available_units} units`}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ECE7DE',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ECE7DE',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Adjustment type segment toggle */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Adjustment type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Add stock')}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: adjustType === 'Add stock' ? '#2563EB' : 'transparent',
                      color: adjustType === 'Add stock' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Add stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Remove stock')}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: adjustType === 'Remove stock' ? '#2563EB' : 'transparent',
                      color: adjustType === 'Remove stock' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Remove stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Set quantity')}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: adjustType === 'Set quantity' ? '#2563EB' : 'transparent',
                      color: adjustType === 'Set quantity' ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Set quantity
                  </button>
                </div>
              </div>

              {/* Reason dropdown */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ECE7DE',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                >
                  <option value="Restock from supplier">Restock from supplier</option>
                  <option value="Audit correction">Audit correction</option>
                  <option value="Damaged items">Damaged items</option>
                  <option value="Customer return">Customer return</option>
                  <option value="Inventory recount">Inventory recount</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes textarea */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Additional context or supplier invoice number..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ECE7DE',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* LIVE PREVIEW BOX */}
              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#0369A1', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Live Preview
                  </div>
                  <div style={{ fontSize: '13px', color: '#1E293B' }}>
                    Current stock: {adjustModalItem.available_units} →{' '}
                    <strong style={{ color: '#0284C7', fontWeight: 700 }}>
                      New stock: {calculatePreviewStock()}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                  }}
                >
                  {adjustType === 'Add stock'
                    ? `+${adjustQty} units`
                    : adjustType === 'Remove stock'
                    ? `-${adjustQty} units`
                    : `${calculatePreviewStock()} units`}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    border: '1px solid #ECE7DE',
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
                  disabled={isSubmittingAdjust}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmittingAdjust ? 'Saving...' : 'Save adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
