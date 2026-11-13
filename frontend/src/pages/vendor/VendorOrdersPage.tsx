// ==============================================================================
// EVEREST PASAL - VENDOR ORDERS & FULFILLMENT MANAGEMENT
// Pixel-perfect match to:
// 1. Orders Main Table View (Image 3)
// 2. Order Detail & Pick/Pack Drawer (Image 2)
// 3. RMA Return & Replacement Audit Drawer (Image 1)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/index.js';
import { ApiClient } from '../../api/client.js';
import { Skeleton, SkeletonStatCards, SkeletonTable } from '../../components/Common/Skeleton.js';

interface OrderItem {
  id: string;
  title: string;
  sku: string;
  vendor: string;
  qty: number;
  price: number;
  total: number;
  image: string;
  stockRemaining?: number;
  picked?: boolean;
}

interface OrderRecord {
  id: string;
  order_no: string;
  items_count: number;
  customer_name: string;
  customer_location: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Refunded';
  payment_method?: string;
  fulfillment_status: 'Processing' | 'Ready to ship' | 'Delivered' | 'New' | 'Shipped' | 'Cancelled' | 'Returned';
  created_at: string;
  items: OrderItem[];
  isRMA?: boolean;
}

const FALLBACK_ORDERS: OrderRecord[] = [
  {
    id: 'EP-1048',
    order_no: 'EP-1048',
    items_count: 3,
    customer_name: 'Suman Thapa',
      customer_location: 'Kathmandu',
      customer_phone: '+977 9841234567',
      customer_address: '123 Durbar Marg, Kathmandu, Nepal',
      total_amount: 4250,
      payment_status: 'Paid',
      payment_method: 'eSewa',
      fulfillment_status: 'Processing',
      created_at: 'Sep 16, 2026 10:32 AM',
      items: [
        {
          id: 'it-1',
          title: 'Traditional Dhaka Topi × 2',
          sku: 'EP-TEA-003',
          vendor: 'Orthodox Tea Estate',
          qty: 2,
          price: 1000,
          total: 1000,
          stockRemaining: 40,
          image: '/images/product_dhaka_topi.jpg',
        },
        {
          id: 'it-2',
          title: 'Organic Ilam Green Tea 250g × 1',
          sku: 'EP-TEA-003',
          vendor: 'Orthodox Tea Estate',
          qty: 1,
          price: 840,
          total: 840,
          stockRemaining: 40,
          image: '/images/hero_tea_coffee.jpg',
        },
      ],
    },
    {
      id: 'EP-1047',
      order_no: 'EP-1047',
      items_count: 2,
      customer_name: 'Anisha Rai',
      customer_location: 'Pokhara',
      customer_phone: '+977 9812345678',
      customer_address: 'Lakeside, Pokhara, Nepal',
      total_amount: 2800,
      payment_status: 'Paid',
      payment_method: 'Khalti',
      fulfillment_status: 'Ready to ship',
      created_at: 'Sep 16, 2026 9:15 AM',
      items: [
        {
          id: 'it-3',
          title: 'Organic Mustard Oil',
          sku: 'EP-OIL-001',
          vendor: 'Himalayan Organics',
          qty: 1,
          price: 1400,
          total: 1400,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
        },
        {
          id: 'it-4',
          title: 'Wireless Earbuds',
          sku: 'EP-EAR-002',
          vendor: 'Everest Tech',
          qty: 1,
          price: 1400,
          total: 1400,
          image: '/images/cat_earbuds.jpg',
        },
      ],
    },
    {
      id: 'EP-1046',
      order_no: 'EP-1046',
      items_count: 5,
      customer_name: 'Bikash Gurung',
      customer_location: 'Lalitpur',
      customer_phone: '+977 9801122334',
      customer_address: 'Jhamsikhel, Lalitpur, Nepal',
      total_amount: 8400,
      payment_status: 'Paid',
      payment_method: 'eSewa',
      fulfillment_status: 'Delivered',
      created_at: 'Sep 15, 2026',
      items: [
        {
          id: 'it-5',
          title: 'Premium Basmati Rice',
          sku: 'EP-RICE-001',
          vendor: 'Terai Mills',
          qty: 2,
          price: 2500,
          total: 5000,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
        },
        {
          id: 'it-6',
          title: 'Organic Mustard Oil',
          sku: 'EP-OIL-001',
          vendor: 'Himalayan Organics',
          qty: 2,
          price: 1200,
          total: 2400,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
        },
        {
          id: 'it-7',
          title: 'Chyawanprash Jar',
          sku: 'EP-HLT-004',
          vendor: 'Dabur Nepal',
          qty: 1,
          price: 1000,
          total: 1000,
          image: '/images/hero_tea_coffee.jpg',
        },
      ],
    },
    {
      id: 'EP-1045',
      order_no: 'EP-1045',
      items_count: 1,
      customer_name: 'Riya Sharma',
      customer_location: 'Bhaktapur',
      customer_phone: '+977 9860123456',
      customer_address: 'Durbar Square, Bhaktapur',
      total_amount: 1200,
      payment_status: 'Pending',
      payment_method: 'COD',
      fulfillment_status: 'New',
      created_at: 'Sep 15, 2026',
      items: [
        {
          id: 'it-8',
          title: 'Wireless Earbuds',
          sku: 'EP-EAR-002',
          vendor: 'Everest Tech',
          qty: 1,
          price: 1200,
          total: 1200,
          image: '/images/cat_earbuds.jpg',
        },
      ],
    },
    {
      id: 'EP-1044',
      order_no: 'EP-1044',
      items_count: 4,
      customer_name: 'Prakash KC',
      customer_location: 'Kathmandu',
      customer_phone: '+977 9849887766',
      customer_address: 'Baneshwor, Kathmandu',
      total_amount: 6750,
      payment_status: 'Paid',
      payment_method: 'Fonepay',
      fulfillment_status: 'Shipped',
      created_at: 'Sep 14, 2026',
      items: [
        {
          id: 'it-9',
          title: 'Cotton Kurta & Pajama',
          sku: 'EP-FSH-001',
          vendor: 'Nepal Weaves',
          qty: 2,
          price: 2500,
          total: 5000,
          image: '/images/cat_fashion.jpg',
        },
        {
          id: 'it-10',
          title: 'Dhaka Shawl',
          sku: 'EP-FSH-002',
          vendor: 'Palpa Handloom',
          qty: 2,
          price: 875,
          total: 1750,
          image: '/images/promo_sweater.jpg',
        },
      ],
    },
    {
      id: 'EP-1043',
      order_no: 'EP-1043',
      items_count: 2,
      customer_name: 'Sunita Tamang',
      customer_location: 'Chitwan',
      customer_phone: '+977 9811224455',
      customer_address: 'Bharatpur-10, Chitwan',
      total_amount: 3200,
      payment_status: 'Paid',
      payment_method: 'eSewa',
      fulfillment_status: 'Delivered',
      created_at: 'Sep 13, 2026',
      items: [
        {
          id: 'it-11',
          title: 'Handcrafted Pashmina Scarf',
          sku: 'EP-PSH-001',
          vendor: 'Himalayan Silk',
          qty: 1,
          price: 2200,
          total: 2200,
          image: '/images/hero_pashmina.jpg',
        },
        {
          id: 'it-12',
          title: 'Himalayan Green Tea',
          sku: 'EP-TEA-001',
          vendor: 'Orthodox Tea',
          qty: 1,
          price: 1000,
          total: 1000,
          image: '/images/hero_tea_coffee.jpg',
        },
      ],
    },
    {
      id: 'EP-1042',
      order_no: 'EP-1042',
      items_count: 3,
      customer_name: 'Ram Basnet',
      customer_location: 'Biratnagar',
      customer_phone: '+977 9803344556',
      customer_address: 'Main Road, Biratnagar',
      total_amount: 5100,
      payment_status: 'Refunded',
      payment_method: 'eSewa',
      fulfillment_status: 'Cancelled',
      created_at: 'Sep 12, 2026',
      items: [
        {
          id: 'it-13',
          title: 'Organic Cold Pressed Mustard Oil',
          sku: 'EP-OIL-002',
          vendor: 'Himalayan Organics',
          qty: 3,
          price: 1700,
          total: 5100,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'EP-1041',
      order_no: 'EP-1041',
      items_count: 1,
      customer_name: 'Deepa Shrestha',
      customer_location: 'Kathmandu',
      customer_phone: '+977 9841892011',
      customer_address: 'Thamel, Kathmandu, Nepal',
      total_amount: 1800,
      payment_status: 'Paid',
      payment_method: 'Khalti',
      fulfillment_status: 'Returned',
      created_at: 'Sep 11, 2026',
      isRMA: true,
      items: [
        {
          id: 'it-14',
          title: 'Handcrafted Woolen Sweater',
          sku: 'EP-SWT-001',
          vendor: 'Patan Knits',
          qty: 1,
          price: 1800,
          total: 1800,
          image: '/images/promo_sweater.jpg',
        },
      ],
    },
  ];

export const VendorOrdersPage: React.FC = () => {
  const { navigate } = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Slide-over Drawer States
  const [activeOrderDrawer, setActiveOrderDrawer] = useState<OrderRecord | null>(null);
  const [activeRMADrawer, setActiveRMADrawer] = useState<boolean>(false);

  // Pick & Pack verification state
  const [pickedItems, setPickedItems] = useState<{ [key: string]: boolean }>({});

  // Courier partner selection
  const [selectedCourier, setSelectedCourier] = useState<'NCM' | 'PATHAO'>('NCM');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Dynamic orders list
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    newOrders: 0,
    processing: 0,
    readyToShip: 0,
    completed: 0,
    shipped: 0,
    cancelled: 0,
    returns: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ApiClient.get<any>('/api/v1/vendor/orders');
        const rawOrders = res?.orders ?? res?.data?.orders;
        const rawMetrics = res?.metrics ?? res?.data?.metrics;
        if (Array.isArray(rawOrders)) {
          const mapped: OrderRecord[] = rawOrders.map((o: any) => ({
            id: o.id,
            order_no: String(o.order_no || o.id).replace(/^#/, ''),
            items_count: Number(o.items_count ?? (Array.isArray(o.items) ? o.items.length : 1)),
            customer_name: o.customer_name || 'Walk-in Customer',
            customer_location: o.customer_location || 'Kathmandu',
            customer_phone: o.customer_phone || '+977 9800000000',
            customer_address: o.customer_address || o.customer_location || 'Kathmandu, Nepal',
            total_amount: Number(o.total_amount || 0),
            payment_status: (o.payment_status as any) || 'Paid',
            payment_method: o.payment_method || 'eSewa',
            fulfillment_status: (o.fulfillment_status as any) || 'Processing',
            created_at: o.created_at || 'Just now',
            isRMA: o.fulfillment_status === 'Returned',
            items: Array.isArray(o.items) && o.items.length > 0
              ? o.items.map((it: any, idx: number) => ({
                  id: it.id || `it-${idx}`,
                  title: it.title || 'Marketplace Item',
                  sku: it.sku || 'EP-SKU-001',
                  vendor: it.vendor || 'Everest Store',
                  qty: Number(it.qty || 1),
                  price: Number(it.price || o.total_amount || 0),
                  total: Number(it.total || o.total_amount || 0),
                  image: it.image || '/images/hero_tea_coffee.jpg',
                }))
              : [
                  {
                    id: `it-${o.id}`,
                    title: `${o.items_count || 1}x Store Item`,
                    sku: 'EP-SKU-001',
                    vendor: 'Everest Store',
                    qty: Number(o.items_count || 1),
                    price: Number(o.total_amount || 0),
                    total: Number(o.total_amount || 0),
                    image: '/images/hero_tea_coffee.jpg',
                  },
                ],
          }));
          setOrders(mapped);
          setSelectedIds(mapped.slice(0, 3).map((m) => m.id));
        }
        if (rawMetrics) {
          setOrderMetrics({
            totalOrders: Number(rawMetrics.totalOrders ?? 0),
            newOrders: Number(rawMetrics.newOrders ?? 0),
            processing: Number(rawMetrics.processing ?? 0),
            readyToShip: Number(rawMetrics.readyToShip ?? 0),
            completed: Number(rawMetrics.completed ?? 0),
            shipped: Number(rawMetrics.shipped ?? 0),
            cancelled: Number(rawMetrics.cancelled ?? 0),
            returns: Number(rawMetrics.returns ?? 0),
          });
        }
      } catch {
        setOrders(FALLBACK_ORDERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (order: OrderRecord) => {
    if (order.fulfillment_status === 'Returned' || order.isRMA) {
      setActiveRMADrawer(true);
    } else {
      setActiveOrderDrawer(order);
    }
  };

  const dynamicCounts = {
    ALL: orders.length,
    NEW: orders.filter((o) => o.fulfillment_status === 'New').length,
    PROCESSING: orders.filter((o) => o.fulfillment_status === 'Processing').length,
    READY_TO_SHIP: orders.filter((o) => o.fulfillment_status === 'Ready to ship').length,
    SHIPPED: orders.filter((o) => o.fulfillment_status === 'Shipped').length,
    DELIVERED: orders.filter((o) => o.fulfillment_status === 'Delivered').length,
    CANCELLED: orders.filter((o) => o.fulfillment_status === 'Cancelled').length,
    RETURNS: orders.filter((o) => o.fulfillment_status === 'Returned' || o.isRMA).length,
  };

  const tabs = [
    { id: 'ALL', label: 'All', count: String(dynamicCounts.ALL) },
    { id: 'NEW', label: 'New', count: String(dynamicCounts.NEW) },
    { id: 'PROCESSING', label: 'Processing', count: String(dynamicCounts.PROCESSING) },
    { id: 'READY_TO_SHIP', label: 'Ready to ship', count: String(dynamicCounts.READY_TO_SHIP) },
    { id: 'SHIPPED', label: 'Shipped', count: String(dynamicCounts.SHIPPED) },
    { id: 'DELIVERED', label: 'Delivered', count: String(dynamicCounts.DELIVERED) },
    { id: 'CANCELLED', label: 'Cancelled', count: String(dynamicCounts.CANCELLED), isRed: true },
    { id: 'RETURNS', label: 'Returns', count: String(dynamicCounts.RETURNS) },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'NEW' && o.fulfillment_status === 'New') ||
      (activeTab === 'PROCESSING' && o.fulfillment_status === 'Processing') ||
      (activeTab === 'READY_TO_SHIP' && o.fulfillment_status === 'Ready to ship') ||
      (activeTab === 'SHIPPED' && o.fulfillment_status === 'Shipped') ||
      (activeTab === 'DELIVERED' && o.fulfillment_status === 'Delivered') ||
      (activeTab === 'CANCELLED' && o.fulfillment_status === 'Cancelled') ||
      (activeTab === 'RETURNS' && (o.fulfillment_status === 'Returned' || o.isRMA));
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.order_no.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_location.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Pending
          </span>
        );
      case 'Refunded':
      default:
        return (
          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Refunded
          </span>
        );
    }
  };

  const renderFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'Processing':
        return (
          <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Processing
          </span>
        );
      case 'Ready to ship':
        return (
          <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Ready to ship
          </span>
        );
      case 'Delivered':
        return (
          <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Delivered
          </span>
        );
      case 'New':
        return (
          <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            New
          </span>
        );
      case 'Shipped':
        return (
          <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Cancelled
          </span>
        );
      case 'Returned':
      default:
        return (
          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
            Returned
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="160px" height="28px" />
            <Skeleton width="260px" height="14px" style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="110px" height="38px" borderRadius="6px" />
            <Skeleton width="130px" height="38px" borderRadius="6px" />
          </div>
        </div>

        {/* Stat Cards Skeleton (5 cards) */}
        <SkeletonStatCards count={5} columns={5} />

        {/* Tab Bar Skeleton */}
        <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width="100px" height="36px" borderRadius="6px" />
          ))}
        </div>

        {/* Orders Table Skeleton */}
        <SkeletonTable rows={7} columns={8} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ========================================================================= */}
      {/* HEADER SECTION (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Orders
          </h1>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
            Manage customer orders, track fulfillment, and keep your store running smoothly.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => alert('Exporting orders CSV')}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Export orders
          </button>
          <button
            onClick={() => navigate('/vendor/pos')}
            style={{
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(225, 29, 72, 0.2)',
            }}
          >
            <span>+</span> Create order
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP 5 METRIC STAT CARDS (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>Total Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{dynamicCounts.ALL.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>New Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{dynamicCounts.NEW.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>Processing</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{dynamicCounts.PROCESSING.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>Ready to Ship</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{dynamicCounts.READY_TO_SHIP.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px 16px', border: '1px solid #ECECEC' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>Completed</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{dynamicCounts.DELIVERED.toLocaleString()}</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATUS TABS BAR (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECECEC', gap: '24px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                borderBottom: isActive ? '2px solid #1A56DB' : '2px solid transparent',
                color: isActive ? '#1A56DB' : tab.isRed ? '#DC2626' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: tab.isRed ? '#DC2626' : isActive ? '#1A56DB' : '#64748B',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* BULK ACTION BAR (Image 3) */}
      {/* ========================================================================= */}
      {selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={selectedIds.length === orders.length}
              onChange={handleSelectAll}
              style={{ accentColor: '#1A56DB', cursor: 'pointer', width: '15px', height: '15px' }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
              {selectedIds.length} orders selected
            </span>
            <span
              onClick={() => setSelectedIds([])}
              style={{ fontSize: '11.5px', color: '#1A56DB', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear selection
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveOrderDrawer(orders[0])}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Update status
            </button>
            <button
              onClick={() => alert('Printing invoices')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Print invoices
            </button>
            <button
              onClick={() => alert('Printing packing slips')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Print packing slips
            </button>
            <button
              onClick={() => alert('Export selected')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
            >
              Export
            </button>
            <button
              onClick={() => alert('Cancel selected')}
              style={{ backgroundColor: '#DC2626', border: 'none', color: '#FFFFFF', padding: '6px 14px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDERS DATA TABLE (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '10.5px', textAlign: 'left', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '10px 14px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === orders.length}
                    onChange={handleSelectAll}
                    style={{ accentColor: '#1A56DB', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Order</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Items</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Payment</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Fulfillment</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const isChecked = selectedIds.includes(o.id);
                return (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: '1px solid #F8FAFC',
                      backgroundColor: isChecked ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(o.id)}
                        style={{ accentColor: '#1A56DB', cursor: 'pointer' }}
                      />
                    </td>

                    {/* Order ID */}
                    <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleRowClick(o)}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>#{o.order_no}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>{o.items_count} item{o.items_count > 1 ? 's' : ''}</div>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleRowClick(o)}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>{o.customer_location}</div>
                    </td>

                    {/* Items Thumbnails Stack */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {o.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img
                              src={it.image}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>
                      NPR {o.total_amount.toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '10px 12px' }}>
                      {renderPaymentBadge(o.payment_status)}
                    </td>

                    {/* Fulfillment Status */}
                    <td style={{ padding: '10px 12px' }}>
                      {renderFulfillmentBadge(o.fulfillment_status)}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px' }}>
                      {o.created_at}
                    </td>

                    {/* Action Icon */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRowClick(o)}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '15px', cursor: 'pointer', padding: '2px' }}
                      >
                        ≡
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER BAR (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '180px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '11.5px',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '8px', top: '7px', color: '#94A3B8', fontSize: '11px' }}>🔍</span>
          </div>

          {/* Date pill */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📅</span>
            <span>Sep 1 – Sep 16, 2026</span>
          </div>

          {/* Payment dropdown */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Payment ▾
          </div>

          {/* Fulfillment dropdown */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Fulfillment ▾
          </div>

          {/* Delivery method dropdown */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Delivery method ▾
          </div>

          {/* More filters */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            + More filters
          </div>
        </div>

        {/* Sort by */}
        <div style={{ fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}>
          Sort by: Newest first ▾
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGINATION BAR (Image 3) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
          Showing {filteredOrders.length > 0 ? `1–${filteredOrders.length}` : '0'} of {orders.length.toLocaleString()} orders
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontSize: '11px' }}>←</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 600, fontSize: '11px' }}>1</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '11px' }}>2</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '11px' }}>3</button>
          <span style={{ padding: '0 2px', color: '#94A3B8', fontSize: '11px' }}>...</span>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '11px' }}>161</button>
          <button style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontSize: '11px' }}>→</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
          <span>Items per page:</span>
          <select
            style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '11.5px' }}
          >
            <option value="25">25 ▾</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ORDER DETAIL DRAWER (Image 2: Order #EP-1048) */}
      {/* ========================================================================= */}
      {activeOrderDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div
            style={{
              width: '460px',
              maxWidth: '94vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px 12px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Order #{activeOrderDrawer.order_no}
                  </h2>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ cursor: 'pointer' }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
                    Processing
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => alert('Printing order')}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px' }}
                    title="Print"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveOrderDrawer(null)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>👤</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeOrderDrawer.customer_name}</span>
                  <span>•</span>
                  <span>{activeOrderDrawer.customer_location}</span>
                </div>
                <span>16 Sept, 10:32 AM</span>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* FULFILLMENT STAGE (Stepper) */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    FULFILLMENT STAGE
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                    Step 3 of 8 (Picking)
                  </span>
                </div>

                {/* Stepper Progress Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#10B981', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#10B981' }}>✔ Confirmed</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#10B981', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#10B981' }}>✔ Reserved</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#1E40AF', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#1E40AF' }}>● Picking</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Packed</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Courier</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Out for Deliv.</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Delivered</div>
                  </div>
                  <div>
                    <div style={{ height: '3.5px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Settled</div>
                  </div>
                </div>
              </div>

              {/* Two Info Cards: Payment status & Stock Allocation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Payment status</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>NPR 2,640</div>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      Paid (eSewa)
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Stock Allocation</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Central Hub</div>
                    <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      Reserved (3)
                    </span>
                  </div>
                </div>
              </div>

              {/* Pick & Pack Verification */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Pick & Pack Verification</div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    {Object.values(pickedItems).filter(Boolean).length} / 2 Picked
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '12px' }}>
                  Tick every verified physical item before packing.
                </div>

                {/* Items to verify */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Item 1 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <input
                      type="checkbox"
                      checked={!!pickedItems['it-1']}
                      onChange={(e) => setPickedItems({ ...pickedItems, 'it-1': e.target.checked })}
                      style={{ accentColor: '#1A56DB', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ width: '38px', height: '38px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/images/product_dhaka_topi.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Traditional Dhaka Topi × 2</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>SKU: EP-TEA-003 • Orthodox Tea Estate</div>
                      <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>✔ 40 units remaining in stock</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 1,000</div>
                  </div>

                  {/* Item 2 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <input
                      type="checkbox"
                      checked={!!pickedItems['it-2']}
                      onChange={(e) => setPickedItems({ ...pickedItems, 'it-2': e.target.checked })}
                      style={{ accentColor: '#1A56DB', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ width: '38px', height: '38px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/images/hero_tea_coffee.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Organic Ilam Green Tea 250g × 1</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>SKU: EP-TEA-003 • Orthodox Tea Estate</div>
                      <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>✔ 40 units remaining in stock</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 840</div>
                  </div>
                </div>

                {/* Info Notice */}
                <div style={{ backgroundColor: '#EFF6FF', borderRadius: '4px', padding: '8px 10px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#1E40AF' }}>
                  <span>ⓘ</span>
                  <span>Both items must be checked before proceeding to the "Packed" state.</span>
                </div>
              </div>

              {/* Logistics & Courier Service */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Logistics & Courier Service</div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    Not Shipped
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
                  Assigned Delivery Partner
                </div>

                {/* Two Courier Radio Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  {/* Nepal Can Move */}
                  <div
                    onClick={() => setSelectedCourier('NCM')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: selectedCourier === 'NCM' ? '1.5px solid #1A56DB' : '1px solid #E2E8F0',
                      backgroundColor: selectedCourier === 'NCM' ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <input
                      type="radio"
                      checked={selectedCourier === 'NCM'}
                      onChange={() => setSelectedCourier('NCM')}
                      style={{ accentColor: '#1A56DB' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Nepal Can Move</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Standard Dispatch</div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>NPR 95</div>
                  </div>

                  {/* Pathao */}
                  <div
                    onClick={() => setSelectedCourier('PATHAO')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: selectedCourier === 'PATHAO' ? '1.5px solid #1A56DB' : '1px solid #E2E8F0',
                      backgroundColor: selectedCourier === 'PATHAO' ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <input
                      type="radio"
                      checked={selectedCourier === 'PATHAO'}
                      onChange={() => setSelectedCourier('PATHAO')}
                      style={{ accentColor: '#1A56DB' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Pathao</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Express Bike</div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>NPR 110</div>
                  </div>
                </div>

                {/* Consignment Tracking ID Container */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Consignment Tracking ID</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>EP1048NP165</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ cursor: 'pointer' }}>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Downloading AWB Label')}
                      style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>📥</span> AWB / Shipping Label
                    </button>
                  </div>

                  {/* Barcode Graphic */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '24px', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #CBD5E1' }}>
                    {[2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2].map((w, i) => (
                      <span key={i} style={{ width: `${w}px`, height: '100%', backgroundColor: '#0F172A' }}></span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Activity & Audit Trail */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Order Activity & Audit Trail</div>
                  <span style={{ fontSize: '10.5px', color: '#64748B' }}>4 logged events</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  {/* Event 1 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A56DB', marginTop: '4px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>Assigned Nepal Can Move</span>
                        <span style={{ color: '#64748B', fontSize: '10.5px' }}>Today, 19:43</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                        Tracking AWB #EP1048NP165 auto-generated by Manish Sharma
                      </div>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A56DB', marginTop: '4px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>Stock Allocated</span>
                        <span style={{ color: '#64748B', fontSize: '10.5px' }}>16 Sept, 10:40</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                        Automated reservation locked at Kathmandu Central Warehouse
                      </div>
                    </div>
                  </div>

                  {/* Event 3 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginTop: '4px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>Payment Settled</span>
                        <span style={{ color: '#64748B', fontSize: '10.5px' }}>16 Sept, 10:33</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                        NPR 2,640 captured via eSewa digital wallet (Ref: ESW-989201)
                      </div>
                    </div>
                  </div>

                  {/* Event 4 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1A56DB', marginTop: '4px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>Order Placed</span>
                        <span style={{ color: '#64748B', fontSize: '10.5px' }}>16 Sept, 10:32</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                        Submitted via Everest Pasal Android Mobile App by Suman Thapa
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact Footer Card */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#E0E7FF', color: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>
                    ST
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Suman Thapa</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>123 Durbar Marg, Kathmandu, Nepal</div>
                  </div>
                </div>
                <a href="tel:+9779841234567" style={{ fontSize: '11px', fontWeight: 600, color: '#1A56DB', textDecoration: 'none' }}>
                  📞 +977 9841234567
                </a>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #ECECEC', backgroundColor: '#FFFFFF', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <button
                  onClick={() => alert('Order moved to Packed!')}
                  style={{
                    flex: 1,
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>📦</span> Move to Packed
                </button>
                <button
                  onClick={() => setActiveOrderDrawer(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#DC2626',
                    border: '1px solid #FCA5A5',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🚫</span> Cancel
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => alert('Printing packing slip')}>
                  🖨 Print Packing Slip
                </span>
                <span>Estimated Dispatch: Today 17:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RMA / RETURN & REPLACEMENT DRAWER (Image 1: RMA #RET-41048-01) */}
      {/* ========================================================================= */}
      {activeRMADrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div
            style={{
              width: '490px',
              maxWidth: '94vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px 12px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    RMA #RET-41048-01
                  </h2>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ cursor: 'pointer' }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                    RETURN & REPLACEMENT
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => alert('Printing RMA Slip')}
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🖨 Print Slip
                  </button>
                  <button
                    onClick={() => setActiveRMADrawer(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '6px' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                  Priority RMA
                </span>
              </div>
            </div>

            {/* RMA Content Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Customer Box */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#0A2540', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      ST
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Suman Thapa</span>
                        <span style={{ color: '#1A56DB', fontSize: '12px' }}>✔</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>Kathmandu, Bagmati • +977 9841892011</div>
                      <div style={{ fontSize: '10.5px', color: '#1A56DB', cursor: 'pointer', marginTop: '2px' }}>Order History (4)</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Original Order: <strong style={{ color: '#0F172A' }}>#EP-048</strong> 16 Sept, 2024
                    </div>
                    <div style={{ backgroundColor: '#FEF9C3', color: '#854D0E', fontSize: '10.5px', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                      Reason: Size / Fit Issue & Packaging Damage
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>Received at Hub: Today, 11:20 AM</div>
                  </div>
                </div>
              </div>

              {/* WORKFLOW PROGRESS */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    WORKFLOW PROGRESS
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                    Stage 4 of 5 (Replacement Generation)
                  </span>
                </div>

                {/* 5 Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>1. Request</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>17 Sept</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>2. Approval</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>18 Sept</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✓</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>3. Inspect</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>Passed</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#1A56DB', color: '#FFFFFF', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⇄</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#1A56DB', marginTop: '3px' }}>4. Replacement</div>
                    <div style={{ fontSize: '9px', color: '#1A56DB', fontWeight: 600 }}>#EP-41048-REP</div>
                  </div>
                  <div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🚚</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '3px' }}>5. Dispatch</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>Nepal Can Move</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                    <span>In-person inspection passed · Ready for <strong>Zero-Charge Replacement Dispatch</strong></span>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    InspectionApproved
                  </span>
                </div>
              </div>

              {/* Eligibility & Everest Return Policy Audit */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    <span>🛡</span> Eligibility & Everest Return Policy Audit
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    Compliant
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Policy Window</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>4 of 7 Days</div>
                    <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>Valid & in-time</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Return Categories</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>Textile & Sealed Tea</div>
                    <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>Approved for RMA</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Customer Proofs</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>2 Photos Uploaded</div>
                    <div style={{ fontSize: '9px', color: '#1A56DB', fontWeight: 600, cursor: 'pointer' }}>Inspect Proofs</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Reverse Freight</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', margin: '2px 0' }}>NPR 95 (Waived)</div>
                    <div style={{ fontSize: '9px', color: '#64748B' }}>Paid by Platform</div>
                  </div>
                </div>
              </div>

              {/* Physical Item Inspection & Stock Disposition */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECECEC', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    <span>📦</span> Physical Item Inspection & Stock Disposition
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#64748B' }}>2 Returned / 3 Ordered</span>
                </div>

                {/* Item 1 */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/images/product_dhaka_topi.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                          Handcrafted Traditional Dhaka Topi (Size: 58cm)
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 1,000</span>
                          <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>
                            QC Passed
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                        SKU: EP-TOP-004 • Unit: NPR 1,000 • Returning: 1 of 2 Units
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155' }}>
                      Original Palpa Tag & Weave Intact
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: '10px', color: '#334155' }}>
                      Unworn Condition & No Blemish
                    </div>
                  </div>

                  {/* Disposition Routing */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', padding: '6px 10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                      <span>🏠</span>
                      <span>Select Disposition Routing:</span>
                    </div>
                    <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                      Restock to Central Hub (Sellable Inventory +1)
                    </span>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/images/hero_tea_coffee.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                          Organic Ilam Green Tea 250g Tin Canister
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 840</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #ECECEC', backgroundColor: '#FFFFFF', marginTop: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '8px', marginBottom: '10px' }}>
                <button
                  onClick={() => alert('Switched to monetary refund')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🔄</span> Switch to Monetary Refund
                </button>
                <button
                  onClick={() => alert('Generated replacement order')}
                  style={{
                    backgroundColor: '#0A2540',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🔄</span> Generate Replacement Order & Dispatch
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10.5px', color: '#334155' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1A56DB' }} />
                  <span>Auto-reserve inventory in Central Hub</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1A56DB' }} />
                  <span>WhatsApp Dispatch Alert (+977 9841892011)</span>
                </label>
              </div>

              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <span onClick={() => alert('Downloading Audit PDF')} style={{ fontSize: '10.5px', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}>
                  📥 Download Audit PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
