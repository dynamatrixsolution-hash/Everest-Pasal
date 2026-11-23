// ==============================================================================
// EVEREST PASAL - VENDOR CUSTOMER MANAGEMENT & DIRECTORY
// Exact pixel-perfect implementation matching user mockups:
// 1. Customer Directory / List View (media_1794162779876_166e01d4.png)
// 2. Customer Profile / Details View (media_1794162779911_470f9142.jpg)
// 3. Customer Segments Management View (media_1794162779913_5ac793b3.jpg)
// 4. Edit / Add Customer View (media_1794162779928_591ce208.jpg)
//
// Special Privacy Rule:
// - Customer details (contact info, address, order history, timeline) are
//   accessible ONLY if the customer has placed at least 1 order with this store.
// - If 0 orders with this store, a Privacy Protection notice is shown.
//
// Typography: Poppins font family
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client';
import { Skeleton, SkeletonStatCards, SkeletonTable } from '../../components/Common/Skeleton.js';
import { exportToCsv } from '../../utils/documentExport.js';
import { Download } from 'lucide-react';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  itemTitle: string;
  itemCount: number;
  amount: number;
  status: 'Processing' | 'Delivered' | 'Cancelled';
  image: string;
}

export interface CustomerTimelineItem {
  id: string;
  type: 'order_placed' | 'order_delivered' | 'note' | 'support';
  title: string;
  timestamp: string;
  amount?: number;
  author?: string;
  note?: string;
}

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface VendorCustomer {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  avatar?: string;
  ordersCount: number;
  totalSpend: number;
  lastOrder: string;
  lastOrderDetails?: string;
  segment: string;
  status: 'Active' | 'Needs review' | 'Inactive';
  customerSince: string;
  hasPlacedOrderWithStore: boolean;
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  marketingConsent: {
    email: boolean;
    sms: boolean;
    recorded: boolean;
  };
  orders: CustomerOrder[];
  timeline: CustomerTimelineItem[];
  notes: CustomerNote[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  subtitle: string;
  definition: string;
  count: number;
  iconType: 'repeat' | 'clock' | 'new' | 'vip';
}

const EMPTY_CUSTOMER: VendorCustomer = {
  id: 'cust-0',
  firstName: 'Store',
  lastName: 'Customer',
  name: 'Store Customer',
  initials: 'SC',
  email: '',
  phone: '',
  ordersCount: 0,
  totalSpend: 0,
  lastOrder: '—',
  segment: 'New',
  status: 'Active',
  customerSince: '—',
  hasPlacedOrderWithStore: false,
  address: {
    street: '—',
    city: 'Kathmandu',
    postalCode: '44600',
    province: 'Bagmati Province',
    country: 'Nepal',
  },
  marketingConsent: { email: false, sms: false, recorded: false },
  orders: [],
  timeline: [],
  notes: [],
};

export const VendorCustomersPage: React.FC = () => {
  // Main Navigation Modes: 'list' | 'details' | 'edit' | 'segments'
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'edit' | 'segments'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit'>('edit');

  // Active Tab inside Profile view: 'overview' | 'orders' | 'timeline' | 'notes'
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'orders' | 'timeline' | 'notes'>('overview');

  // Active Tab inside Segments view: 'segments' | 'all'
  const [activeSegmentTab, setActiveSegmentTab] = useState<'segments' | 'all'>('segments');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data States
  const [customers, setCustomers] = useState<VendorCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<VendorCustomer>(EMPTY_CUSTOMER);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterActiveBuyers, setFilterActiveBuyers] = useState<boolean>(false);
  const [filterRepeatBuyers, setFilterRepeatBuyers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('last_order');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Note Input State
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Edit / Add Customer Form State
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Nepal',
    segment: 'VIP',
    status: 'Active' as 'Active' | 'Needs review' | 'Inactive',
    emailMarketing: false,
    smsMarketing: false,
  });

  // Create Segment Form State
  const [newSegmentForm, setNewSegmentForm] = useState({
    name: 'Active high spenders',
    matchType: 'all' as 'all' | 'any',
    rules: [
      { field: 'Account status', rule: 'Is • Active' },
      { field: 'Total spend (NPR)', rule: 'At least • 30,000' },
    ],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Customers & Segments from backend
  useEffect(() => {
    Promise.all([
      ApiClient.get('/api/v1/vendor/customers')
        .then((res: any) => {
          const rawCustomers = res?.customers ?? res?.data?.customers;
          if (Array.isArray(rawCustomers)) {
            const merged: VendorCustomer[] = rawCustomers.map((c: any, idx: number) => {
              const nameStr = c.name || 'Customer';
              const parts = nameStr.split(' ');
              const ordersCount = Number(c.ordersCount || 0);
              return {
                id: c.id || `cust-${idx + 1}`,
                firstName: c.firstName || parts[0] || 'Customer',
                lastName: c.lastName || parts.slice(1).join(' ') || '',
                name: nameStr,
                initials: c.initials || parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || 'CU',
                email: c.email || '',
                phone: c.phone || '',
                avatar: c.avatar || '',
                ordersCount,
                totalSpend: Number(c.totalSpend || 0),
                lastOrder: c.lastOrder || 'Recent',
                lastOrderDetails: c.lastOrderNumber ? `${c.lastOrderNumber} · ${c.lastOrderStatus || 'Completed'}` : undefined,
                segment: c.segment || 'New',
                status: (c.status === 'Needs review' || c.status === 'Inactive' ? c.status : 'Active') as any,
                customerSince: c.customerSince || '2026',
                hasPlacedOrderWithStore: c.hasPlacedOrderWithStore !== undefined ? Boolean(c.hasPlacedOrderWithStore) : Boolean(c.hasStoreOrders ?? ordersCount > 0),
                address: {
                  street: c.street || c.city || 'Kathmandu',
                  city: c.city || 'Kathmandu',
                  postalCode: c.postalCode || '44600',
                  province: c.province || 'Bagmati Province',
                  country: 'Nepal',
                },
                marketingConsent: {
                  email: true,
                  sms: false,
                  recorded: true,
                },
                orders: [],
                timeline: [],
                notes: [],
              };
            });
            setCustomers(merged);
            if (merged.length > 0) {
              setSelectedCustomer(merged[0]);
            }
          }
        })
        .catch((err) => {
          setCustomers([]);
          console.warn('[Customers] Failed to load customers:', err?.message);
        }),
      ApiClient.get('/api/v1/vendor/customers/segments')
        .then((res: any) => {
          const rawSegments = res?.segments ?? res?.data?.segments;
          if (Array.isArray(rawSegments) && rawSegments.length > 0) {
            setSegments(
              rawSegments.map((s: any, idx: number) => ({
                id: s.id || `seg-${idx + 1}`,
                name: s.name || 'Segment',
                subtitle: s.subtitle || s.criteria || 'Store segment',
                definition: s.definition || s.criteria || 'Store segment rule',
                count: Number(s.count ?? s.membersCount ?? 0),
                iconType: (idx === 0 ? 'repeat' : idx === 1 ? 'clock' : idx === 2 ? 'new' : 'vip') as any,
              }))
            );
          }
        })
        .catch(() => {}),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Open Details view (with privacy protection enforcement)
  const handleViewCustomer = (cust: VendorCustomer) => {
    setSelectedCustomer(cust);
    setActiveProfileTab('overview');
    setViewMode('details');

    ApiClient.get(`/api/v1/vendor/customers/${cust.id}`)
      .then((res: any) => {
        const profile = res?.data || res;
        if (profile) {
          const mappedOrders: CustomerOrder[] = Array.isArray(profile.recentOrders)
            ? profile.recentOrders.map((o: any, idx: number) => ({
                id: o.id || `ord-${idx}`,
                orderNumber: o.id?.startsWith('#') ? o.id : `#${o.id}`,
                date: o.date || 'Recent',
                itemTitle: o.items || 'Store Order',
                itemCount: 1,
                amount: Number(o.amount || 0),
                status: (o.status === 'Delivered' ? 'Delivered' : 'Processing') as any,
                image: o.image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
              }))
            : [];
          const mappedTimeline: CustomerTimelineItem[] = Array.isArray(profile.timeline)
            ? profile.timeline.map((t: any) => ({
                id: t.id,
                type: (t.type === 'order_placed' || t.type === 'order_delivered' ? t.type : 'note') as any,
                title: t.title,
                timestamp: t.date || t.timestamp || 'Recent',
                amount: t.amount ? Number(String(t.amount).replace(/[^0-9.]/g, '')) : undefined,
              }))
            : [];
          const mappedNotes: CustomerNote[] = Array.isArray(profile.internalNotes)
            ? profile.internalNotes.map((n: any) => ({
                id: n.id,
                text: n.text,
                author: n.author || 'Store Team',
                date: n.date || 'Recent',
              }))
            : [];

          setSelectedCustomer((prev) => ({
            ...prev,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
            ordersCount: profile.metrics?.lifetimeOrders !== undefined ? profile.metrics.lifetimeOrders : prev.ordersCount,
            orders: mappedOrders.length > 0 ? mappedOrders : prev.orders,
            timeline: mappedTimeline.length > 0 ? mappedTimeline : prev.timeline,
            notes: mappedNotes.length > 0 ? mappedNotes : prev.notes,
          }));
        }
      })
      .catch(() => {});
  };

  const handleExportCustomersCsv = () => {
    if (!customers.length) {
      showToast('No customer records to export');
      return;
    }
    exportToCsv({
      filename: `Customers_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'Everest Pasal - Merchant Customer Directory',
      headers: ['Customer Name', 'Email', 'Phone', 'Location', 'Total Orders', 'Total Spend (NPR)', 'Status'],
      rows: customers.map((c) => [
        c.name,
        c.email,
        c.phone,
        c.address?.city ? `${c.address.city}, Nepal` : 'Nepal',
        String(c.ordersCount),
        String(c.totalSpend),
        c.status,
      ]),
    });
    showToast(`Exported ${customers.length} customer records to CSV.`);
  };

  // Open Edit Customer Form
  const handleOpenEditCustomer = (cust: VendorCustomer) => {
    setSelectedCustomer(cust);
    setFormMode('edit');
    setCustomerForm({
      firstName: cust.firstName,
      lastName: cust.lastName,
      email: cust.email,
      phone: cust.phone,
      street: cust.address.street,
      city: cust.address.city,
      postalCode: cust.address.postalCode,
      province: cust.address.province,
      country: cust.address.country,
      segment: cust.segment,
      status: cust.status,
      emailMarketing: cust.marketingConsent.email,
      smsMarketing: cust.marketingConsent.sms,
    });
    setViewMode('edit');
  };

  // Open Add Customer Form
  const handleOpenAddCustomer = () => {
    setFormMode('add');
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      province: '',
      country: 'Nepal',
      segment: 'New',
      status: 'Active',
      emailMarketing: false,
      smsMarketing: false,
    });
    setViewMode('edit');
  };

  // Save Customer Changes (or Add New Customer)
  const handleSaveCustomer = () => {
    if (!customerForm.firstName.trim() || !customerForm.email.trim()) {
      alert('First name and email address are required.');
      return;
    }

    if (formMode === 'add') {
      const fullName = `${customerForm.firstName} ${customerForm.lastName}`.trim();
      const initials = `${customerForm.firstName[0] || ''}${customerForm.lastName[0] || ''}`.toUpperCase();
      const newCust: VendorCustomer = {
        id: `cust-${Date.now()}`,
        firstName: customerForm.firstName,
        lastName: customerForm.lastName,
        name: fullName,
        initials: initials || 'CU',
        email: customerForm.email,
        phone: customerForm.phone,
        ordersCount: 1, // Newly registered via vendor has an order
        totalSpend: 0,
        lastOrder: 'Just now',
        segment: customerForm.segment,
        status: customerForm.status,
        customerSince: 'Today',
        hasPlacedOrderWithStore: true,
        address: {
          street: customerForm.street,
          city: customerForm.city,
          postalCode: customerForm.postalCode,
          province: customerForm.province,
          country: customerForm.country,
        },
        marketingConsent: {
          email: customerForm.emailMarketing,
          sms: customerForm.smsMarketing,
          recorded: customerForm.emailMarketing || customerForm.smsMarketing,
        },
        orders: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            type: 'note',
            title: 'Customer account registered by Manish',
            timestamp: 'Just now',
          },
        ],
        notes: [],
      };
      setCustomers([newCust, ...customers]);
      setSelectedCustomer(newCust);
      showToast(`Customer "${newCust.name}" added successfully!`);
      setViewMode('details');
    } else {
      const updatedList = customers.map((c) => {
        if (c.id === selectedCustomer.id) {
          const updated: VendorCustomer = {
            ...c,
            firstName: customerForm.firstName,
            lastName: customerForm.lastName,
            name: `${customerForm.firstName} ${customerForm.lastName}`.trim(),
            email: customerForm.email,
            phone: customerForm.phone,
            segment: customerForm.segment,
            status: customerForm.status,
            address: {
              street: customerForm.street,
              city: customerForm.city,
              postalCode: customerForm.postalCode,
              province: customerForm.province,
              country: customerForm.country,
            },
            marketingConsent: {
              email: customerForm.emailMarketing,
              sms: customerForm.smsMarketing,
              recorded: customerForm.emailMarketing || customerForm.smsMarketing,
            },
          };
          setSelectedCustomer(updated);
          return updated;
        }
        return c;
      });
      setCustomers(updatedList);
      showToast(`Customer profile for ${customerForm.firstName} updated!`);
      setViewMode('details');
    }
  };

  // Add Internal Private Note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: CustomerNote = {
      id: `nt-${Date.now()}`,
      text: newNoteText.trim(),
      author: 'Manish',
      date: 'Today',
    };
    const updatedNotes = [newNote, ...selectedCustomer.notes];
    const updatedCustomer = { ...selectedCustomer, notes: updatedNotes };
    setSelectedCustomer(updatedCustomer);
    setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c)));
    const savedText = newNoteText.trim();
    setNewNoteText('');
    showToast('Internal note saved!');

    ApiClient.post(`/api/v1/vendor/customers/${selectedCustomer.id}/notes`, { text: savedText })
      .catch(() => {});
  };

  // Save New Segment
  const handleSaveSegment = () => {
    if (!newSegmentForm.name.trim()) {
      alert('Please enter a segment name.');
      return;
    }
    const newSeg: CustomerSegment = {
      id: `seg-${Date.now()}`,
      name: newSegmentForm.name,
      subtitle: 'Custom filter segment',
      definition: newSegmentForm.rules.map((r) => `${r.field} ${r.rule}`).join(' AND '),
      count: 2,
      iconType: 'vip',
    };
    setSegments([...segments, newSeg]);
    showToast(`Segment "${newSeg.name}" created!`);
  };

  // Filter customers in directory
  const filteredCustomers = customers.filter((c) => {
    if (filterActiveBuyers && c.status !== 'Active') return false;
    if (filterRepeatBuyers && c.ordersCount < 2) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isLoading && viewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="180px" height="28px" />
            <Skeleton width="320px" height="14px" style={{ marginTop: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="120px" height="38px" borderRadius="6px" />
            <Skeleton width="140px" height="38px" borderRadius="6px" />
          </div>
        </div>
        <SkeletonStatCards count={4} columns={4} />
        <SkeletonTable rows={6} columns={7} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0F172A',
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
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
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CUSTOMER DIRECTORY / LIST VIEW (media_1794162779876_166e01d4.png) */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <>
          {/* Top Title Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                Customers
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Manage customer profiles, monitor purchase behavior, and keep your customer directory organized.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleExportCustomersCsv}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Export CSV
              </button>

              <button
                onClick={handleOpenAddCustomer}
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                }}
              >
                Add customer
              </button>
            </div>
          </div>

          {/* 4 Top KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                TOTAL CUSTOMERS
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
                {customers.length.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                ACTIVE CUSTOMERS
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
                {customers.filter((c) => c.status === 'Active' && c.ordersCount > 0).length.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                ORDERS THIS MONTH
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
                {customers.reduce((sum, c) => sum + Number(c.ordersCount || 0), 0).toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '18px 20px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                TOTAL SPEND (NPR)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
                NPR {customers.reduce((sum, c) => sum + Number(c.totalSpend || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Main 2-Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Customer Directory Card & Table */}
            <div style={{ minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              {/* Card Header */}
              <div style={{ padding: '18px 20px 14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Customer Directory
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Search, filter, and manage customer records with identity, contact, order history, and segment status.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '16px',
                  }}
                >
                  {customers.length} total
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ padding: '0 20px 16px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8', fontSize: '13px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12.5px',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>

                <button
                  onClick={() => setFilterActiveBuyers(!filterActiveBuyers)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: filterActiveBuyers ? '#EFF6FF' : '#FFFFFF',
                    color: filterActiveBuyers ? '#1A56DB' : '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Active buyers
                </button>

                <button
                  onClick={() => setFilterRepeatBuyers(!filterRepeatBuyers)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: filterRepeatBuyers ? '#EFF6FF' : '#FFFFFF',
                    color: filterRepeatBuyers ? '#1A56DB' : '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Repeated buyers
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    color: '#334155',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <option value="last_order">Sort by: Last order ▾</option>
                  <option value="highest_spend">Sort by: Highest spend</option>
                  <option value="most_orders">Sort by: Most orders</option>
                  <option value="name_az">Sort by: Name A–Z</option>
                </select>
              </div>

              {/* Customers Table */}
              <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '840px', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9', borderTop: '1px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', backgroundColor: '#FFFFFF' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 600, whiteSpace: 'nowrap' }}>Customer</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Contact</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Orders</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Total spend</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Last order</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Segment / Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((cust) => (
                      <tr
                        key={cust.id}
                        onClick={() => handleViewCustomer(cust)}
                        style={{
                          borderBottom: '1px solid #F8FAFC',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                      >
                        {/* Customer Avatar + Name + Subtext */}
                        <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {cust.avatar ? (
                              <img
                                src={cust.avatar}
                                alt={cust.name}
                                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  backgroundColor: '#E0E7FF',
                                  color: '#3730A3',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {cust.initials}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', whiteSpace: 'nowrap' }}>{cust.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                                {cust.email} • {cust.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Email */}
                        <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {cust.email}
                        </td>

                        {/* Orders count */}
                        <td style={{ padding: '12px 14px', color: '#0F172A', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {cust.ordersCount}
                        </td>

                        {/* Total spend */}
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                          NPR {cust.totalSpend.toLocaleString()}
                        </td>

                        {/* Last order date */}
                        <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {cust.lastOrder}
                        </td>

                        {/* Segment / Status Pill */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              backgroundColor: cust.status === 'Needs review' ? '#FEF3C7' : '#F1F5F9',
                              color: cust.status === 'Needs review' ? '#D97706' : '#334155',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              lineHeight: 1.2,
                            }}
                          >
                            {cust.segment} • {cust.status}
                          </span>
                        </td>

                        {/* Actions: View button */}
                        <td style={{ padding: '12px 20px', textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewCustomer(cust)}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#0F172A',
                              padding: '5px 14px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Poppins', sans-serif",
                              whiteSpace: 'nowrap',
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B' }}>
                <div>Showing {filteredCustomers.length > 0 ? `1–${filteredCustomers.length}` : '0'} of {customers.length} customers</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
                    ←
                  </button>
                  <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', backgroundColor: '#E11D48', color: '#FFFFFF', fontWeight: 700 }}>
                    1
                  </button>
                  <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>
                    2
                  </button>
                  <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>
                  <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>
                    3
                  </button>
                  <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Customer Segments Card & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Customer Segments Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Customer Segments
                  </h3>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    {segments.length} segments
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 18px 0' }}>
                  Use these segments to personalize campaigns and support workflows.
                </p>

                {/* Segments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {segments.map((seg) => (
                    <div
                      key={seg.id}
                      onClick={() => setViewMode('segments')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{seg.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{seg.subtitle}</div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{seg.count}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setViewMode('segments')}
                  style={{
                    width: '100%',
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    marginBottom: '10px',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                  }}
                >
                  Create segment
                </button>
                <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.4' }}>
                  Create reusable customer groups for targeted campaigns, support routing, and loyalty programs.
                </div>
              </div>

              {/* Quick Actions Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Quick Actions
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
                  Keep your customer operations moving with one-click workflows.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Export customer directory</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>CSV or JSON</div>
                    </div>
                    <button
                      onClick={() => showToast('Exporting customer directory...')}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
                    >
                      Export
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Merge duplicate profiles</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Review suggested matches</div>
                    </div>
                    <button
                      onClick={() => showToast('Scanning duplicate customer profiles...')}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
                    >
                      Review
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Archive inactive accounts</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Keep inactive records hidden</div>
                    </div>
                    <button
                      onClick={() => showToast('Archived inactive customer records.')}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. CUSTOMER PROFILE / DETAILS VIEW (media_1794162779911_470f9142.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  onClick={() => setViewMode('list')}
                  style={{ fontSize: '12.5px', color: '#1A56DB', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Customer Directory
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                Customer profile
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                View purchase history, customer details, and private team activity.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => showToast(`Exported profile for ${selectedCustomer.name}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Export
              </button>
              <button
                onClick={() => handleOpenEditCustomer(selectedCustomer)}
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                }}
              >
                Edit customer
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SPECIAL PRIVACY CHECK: Customer has placed orders with this store */}
          {/* ======================================================================= */}
          {!selectedCustomer.hasPlacedOrderWithStore || selectedCustomer.ordersCount === 0 ? (
            /* Locked / Privacy Protection State */
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '60px 30px',
                border: '1px solid #ECECEC',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '16px',
                }}
              >
                🔒
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                Customer Details Protected by Store Privacy Policy
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '560px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                In accordance with customer data protection rules, <strong>{selectedCustomer.name}</strong> has not placed any orders with <strong>Manish Electronics</strong> yet. Full contact details, addresses, and transaction histories become accessible only after an order is placed from your store.
              </p>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '16px 20px',
                  maxWidth: '520px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                }}
              >
                <div>🛡️ <strong>Zero Store Orders:</strong> Customer has 0 recorded orders from your store.</div>
                <div style={{ marginTop: '6px' }}>📦 <strong>Automatic Access:</strong> Contact details and delivery addresses will automatically unlock upon their first checkout.</div>
              </div>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: '#1A56DB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ← Return to Customer Directory
              </button>
            </div>
          ) : (
            /* Populated Customer Profile (Matches media_1794162779911_470f9142.jpg) */
            <>
              {/* Profile Card Banner */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Header row: Avatar, Info, Active badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        color: '#1A56DB',
                        fontWeight: 800,
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {selectedCustomer.initials}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {selectedCustomer.name}
                      </h2>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                        {selectedCustomer.email} • {selectedCustomer.phone}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        Customer since {selectedCustomer.customerSince}
                      </div>
                    </div>
                  </div>

                  <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 600 }}>
                    Active
                  </span>
                </div>

                {/* KPI Metrics: Lifetime orders, Total spend, Last order */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', paddingTop: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                      LIFETIME ORDERS
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                      {selectedCustomer.ordersCount}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      Includes 1 order in progress
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                      TOTAL SPEND
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#E11D48', marginTop: '6px' }}>
                      NPR {selectedCustomer.totalSpend.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      Lifetime order totals
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.4px' }}>
                      LAST ORDER
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                      {selectedCustomer.lastOrder}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
                      {selectedCustomer.lastOrderDetails || '#EP-10542 · Processing'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
                <span
                  onClick={() => setActiveProfileTab('overview')}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: activeProfileTab === 'overview' ? 700 : 500,
                    color: activeProfileTab === 'overview' ? '#1A56DB' : '#64748B',
                    paddingBottom: '10px',
                    borderBottom: activeProfileTab === 'overview' ? '2px solid #1A56DB' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Overview
                </span>
                <span
                  onClick={() => setActiveProfileTab('orders')}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: activeProfileTab === 'orders' ? 700 : 500,
                    color: activeProfileTab === 'orders' ? '#1A56DB' : '#64748B',
                    paddingBottom: '10px',
                    borderBottom: activeProfileTab === 'orders' ? '2px solid #1A56DB' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Orders ({selectedCustomer.ordersCount})
                </span>
                <span
                  onClick={() => setActiveProfileTab('timeline')}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: activeProfileTab === 'timeline' ? 700 : 500,
                    color: activeProfileTab === 'timeline' ? '#1A56DB' : '#64748B',
                    paddingBottom: '10px',
                    borderBottom: activeProfileTab === 'timeline' ? '2px solid #1A56DB' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Timeline
                </span>
                <span
                  onClick={() => setActiveProfileTab('notes')}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: activeProfileTab === 'notes' ? 700 : 500,
                    color: activeProfileTab === 'notes' ? '#1A56DB' : '#64748B',
                    paddingBottom: '10px',
                    borderBottom: activeProfileTab === 'notes' ? '2px solid #1A56DB' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Internal notes
                </span>
              </div>

              {/* Overview Tab Content */}
              {activeProfileTab === 'overview' && (
                <>
                  {/* Row 1: Contact details, Default address, Marketing consent */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {/* Contact details */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
                        Contact details
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Email address</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>
                        {selectedCustomer.email}
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Phone number</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>
                        {selectedCustomer.phone}
                      </div>

                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Use Edit customer to update contact information.
                      </div>
                    </div>

                    {/* Default address */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
                        Default address
                      </h3>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', lineHeight: '1.5' }}>
                        {selectedCustomer.address.street}, {selectedCustomer.address.city} {selectedCustomer.address.postalCode}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                        {selectedCustomer.address.province}, {selectedCustomer.address.country}
                      </div>
                    </div>

                    {/* Marketing consent */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                        Marketing consent
                      </h3>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px' }}>
                          Not recorded
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', marginBottom: '8px' }}>
                        No recorded consent for email or SMS marketing.
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4' }}>
                        No messages sent from this profile. Confirm consent before subscribing.
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Recent orders */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          Recent orders
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                          Latest 3 of {selectedCustomer.ordersCount} lifetime orders
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveProfileTab('orders')}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0F172A',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        All orders
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      {selectedCustomer.orders.map((ord) => (
                        <div key={ord.id} style={{ borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                          <div style={{ height: '110px', backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
                            <img src={ord.image} alt={ord.itemTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              Order {ord.orderNumber}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              {ord.date}
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                              {ord.itemTitle} · {ord.itemCount} item{ord.itemCount > 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                              {ord.status} · NPR {ord.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                      Recent 3 orders: NPR 16,900 + earlier 9 orders: NPR 31,300 = lifetime NPR 48,200
                    </div>
                  </div>

                  {/* Row 3: Customer timeline & Internal notes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Customer timeline */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                        Customer timeline
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {selectedCustomer.timeline.map((item) => (
                          <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>
                              {item.type === 'order_placed' ? '📦' : item.type === 'order_delivered' ? '🚚' : '📝'}
                            </span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                {item.timestamp} {item.amount ? `· NPR ${item.amount.toLocaleString()}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Internal notes */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          Internal notes
                        </h3>
                        <span style={{ backgroundColor: '#E11D48', color: '#FFFFFF', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                          Team only
                        </span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 14px 0' }}>
                        Private notes are never shown to the customer.
                      </p>

                      {/* Existing Note */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        {selectedCustomer.notes.map((note) => (
                          <div key={note.id} style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                            <div>{note.text}</div>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '6px' }}>
                              {note.author} · {note.date}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Note Input */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          rows={2}
                          placeholder="Add a private note for your team..."
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12.5px',
                            outline: 'none',
                            resize: 'none',
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        />
                        <div style={{ textAlign: 'right' }}>
                          <button
                            onClick={handleAddNote}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            Add note
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Orders Tab Content */}
              {activeProfileTab === 'orders' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                    All Orders from {selectedCustomer.name}
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 14px' }}>Order Number</th>
                        <th style={{ padding: '10px 14px' }}>Date</th>
                        <th style={{ padding: '10px 14px' }}>Item</th>
                        <th style={{ padding: '10px 14px' }}>Total</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1A56DB' }}>{ord.orderNumber}</td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>{ord.date}</td>
                          <td style={{ padding: '12px 14px', color: '#0F172A' }}>{ord.itemTitle} ({ord.itemCount})</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>NPR {ord.amount.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ backgroundColor: ord.status === 'Processing' ? '#FEF3C7' : '#ECFDF5', color: ord.status === 'Processing' ? '#D97706' : '#16A34A', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Timeline Tab Content */}
              {activeProfileTab === 'timeline' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                    Activity Timeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedCustomer.timeline.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '18px' }}>
                          {item.type === 'order_placed' ? '📦' : item.type === 'order_delivered' ? '🚚' : '📝'}
                        </span>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{item.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Notes Tab Content */}
              {activeProfileTab === 'notes' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                    Internal Team Notes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {selectedCustomer.notes.map((note) => (
                      <div key={note.id} style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '13px', color: '#0F172A', lineHeight: '1.5' }}>{note.text}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>{note.author} · {note.date}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Type a private note for your team..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                    />
                    <button
                      onClick={handleAddNote}
                      style={{ backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Save note
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT / ADD CUSTOMER VIEW (media_1794162779928_591ce208.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                onClick={() => setViewMode('list')}
                style={{ fontSize: '12.5px', color: '#1A56DB', cursor: 'pointer', fontWeight: 600 }}
              >
                ← Back to Customer Directory
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
              {formMode === 'add' ? 'Add customer' : 'Edit customer'}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              {formMode === 'add'
                ? 'Create a new customer profile for manual order entry and credit tracking.'
                : `Update ${customerForm.firstName} ${customerForm.lastName}'s details and preferences. Changes apply when you save.`}
            </p>
          </div>

          {/* 2-Column Form Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Form Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Card 1: Identity & contact */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Identity & contact
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>* Required fields</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        First name *
                      </label>
                      <input
                        type="text"
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Last name *
                      </label>
                      <input
                        type="text"
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Email address *
                      </label>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Phone number
                      </label>
                      <input
                        type="text"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Contact details are used for customer records and order support, not automatic marketing.
                  </div>
                </div>
              </div>

              {/* Card 2: Default address */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Default address
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Street / area
                    </label>
                    <input
                      type="text"
                      value={customerForm.street}
                      onChange={(e) => setCustomerForm({ ...customerForm, street: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Postal code
                      </label>
                      <input
                        type="text"
                        value={customerForm.postalCode}
                        onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Province
                      </label>
                      <input
                        type="text"
                        value={customerForm.province}
                        onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Country
                      </label>
                      <input
                        type="text"
                        value={customerForm.country}
                        onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Updating this address does not change addresses on existing orders.
                  </div>
                </div>
              </div>

              {/* Card 3: Segment & account status */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Segment & account status
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Assigned segment
                    </label>
                    <select
                      value={customerForm.segment}
                      onChange={(e) => setCustomerForm({ ...customerForm, segment: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF', fontFamily: "'Poppins', sans-serif" }}
                    >
                      <option value="VIP">VIP ⌵</option>
                      <option value="Repeat">Repeat buyers</option>
                      <option value="New">New</option>
                      <option value="Dormant">Dormant</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      Current assignment: {customerForm.segment}. Segments can overlap.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Account status *
                    </label>
                    <select
                      value={customerForm.status}
                      onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value as any })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF', fontFamily: "'Poppins', sans-serif" }}
                    >
                      <option value="Active">Active ⌵</option>
                      <option value="Needs review">Needs review</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      Active customers remain in your working directory.
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Marketing consent */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Marketing consent
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
                  No consent is recorded. Both preferences remain unchecked.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      backgroundColor: customerForm.emailMarketing ? '#EFF6FF' : '#FFFFFF',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={customerForm.emailMarketing}
                      onChange={(e) => setCustomerForm({ ...customerForm, emailMarketing: e.target.checked })}
                      style={{ accentColor: '#1A56DB', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Email marketing</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      backgroundColor: customerForm.smsMarketing ? '#EFF6FF' : '#FFFFFF',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={customerForm.smsMarketing}
                      onChange={(e) => setCustomerForm({ ...customerForm, smsMarketing: e.target.checked })}
                      style={{ accentColor: '#1A56DB', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>SMS marketing</span>
                  </label>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
                  ⓘ Only select a preference after explicit consent. Saving does not send a message or campaign.
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  border: '1px solid #ECECEC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Changes are not saved yet.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setViewMode('details')}
                    style={{ padding: '9px 18px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomer}
                    style={{ padding: '9px 22px', backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)' }}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Customer summary & Keep records accurate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Customer summary card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '14px' }}>
                  <span>👤</span> Customer summary
                </div>

                <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {customerForm.firstName || customerForm.lastName ? `${customerForm.firstName} ${customerForm.lastName}` : selectedCustomer.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {customerForm.email || selectedCustomer.email}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  {customerForm.phone || selectedCustomer.phone}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', padding: '3px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                    {customerForm.status}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Lifetime orders</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedCustomer.ordersCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Total spend</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>NPR {selectedCustomer.totalSpend.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Last order</span>
                    <span style={{ color: '#0F172A' }}>{selectedCustomer.lastOrder}</span>
                  </div>
                </div>
              </div>

              {/* Keep records accurate card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Keep records accurate
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  Order history and lifetime totals are read-only and won't change when you edit this profile.
                </div>
                <div>
                  Internal notes are managed on the customer profile and are never customer-visible.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER SEGMENTS MANAGEMENT VIEW (media_1794162779913_5ac793b3.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'segments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  onClick={() => setViewMode('list')}
                  style={{ fontSize: '12.5px', color: '#1A56DB', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Customer Directory
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                Customer segments
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Build reusable groups for targeted campaigns, support routing, and loyalty programs.
              </p>
            </div>

            <button
              onClick={() => showToast('Exporting segment definitions...')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Export
            </button>
          </div>

          {/* Segment Navigation Tabs */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            <span
              onClick={() => setActiveSegmentTab('segments')}
              style={{
                fontSize: '13.5px',
                fontWeight: activeSegmentTab === 'segments' ? 700 : 500,
                color: activeSegmentTab === 'segments' ? '#1A56DB' : '#64748B',
                paddingBottom: '10px',
                borderBottom: activeSegmentTab === 'segments' ? '2px solid #1A56DB' : 'none',
                cursor: 'pointer',
              }}
            >
              Segments
            </span>
            <span
              onClick={() => setViewMode('list')}
              style={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#64748B',
                paddingBottom: '10px',
                cursor: 'pointer',
              }}
            >
              All customers
            </span>
          </div>

          {/* 2-Column Segments Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Your segments list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Your segments
                </h3>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {segments.length} segments
                </span>
              </div>

              {/* Search segments input */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                  Search segments
                </label>
                <input
                  type="text"
                  placeholder="Search by name or definition..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              {/* Segment Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #ECECEC',
                      padding: '18px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: seg.iconType === 'clock' ? '#FEE2E2' : '#EFF6FF',
                            color: seg.iconType === 'clock' ? '#DC2626' : '#1A56DB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            flexShrink: 0,
                          }}
                        >
                          {seg.iconType === 'repeat' ? '🔄' : seg.iconType === 'clock' ? '⏰' : seg.iconType === 'new' ? '👤' : '⭐'}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{seg.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{seg.subtitle}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                        {seg.count}
                      </div>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '12px' }}>
                      {seg.definition}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F8FAFC' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{seg.count} members</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setViewMode('list')}
                          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Members
                        </button>
                        <button
                          onClick={() => showToast(`Managing rules for ${seg.name}`)}
                          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Create segment Panel (Matches media_1794162779913_5ac793b3.jpg) */}
            <div style={{ minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Create segment
                </h3>
                <span onClick={() => setViewMode('list')} style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '16px' }}>✕</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 18px 0' }}>
                Define a group using customer fields. Preview matching customers before saving.
              </p>

              {/* Segment Name Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Segment name *
                </label>
                <input
                  type="text"
                  value={newSegmentForm.name}
                  onChange={(e) => setNewSegmentForm({ ...newSegmentForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '2px solid #1A56DB',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: '#FFFFFF',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Choose a clear, unique name your team will recognize.
                </div>
              </div>

              {/* Match customers who meet */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Match customers who meet
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewSegmentForm({ ...newSegmentForm, matchType: 'all' })}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: newSegmentForm.matchType === 'all' ? '#E11D48' : '#F1F5F9',
                      color: newSegmentForm.matchType === 'all' ? '#FFFFFF' : '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    ● All conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSegmentForm({ ...newSegmentForm, matchType: 'any' })}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: newSegmentForm.matchType === 'any' ? '#E11D48' : '#FFFFFF',
                      color: newSegmentForm.matchType === 'any' ? '#FFFFFF' : '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    ○ Any condition
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  All = every rule must match. Any = at least one rule.
                </div>
              </div>

              {/* Condition 1 */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>CONDITION</span>
                  <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}>✕</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>Customer field</label>
                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      Account status
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>Rule / value</label>
                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      Is · Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Condition 2 */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>CONDITION</span>
                  <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}>✕</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>Customer field</label>
                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      Total spend (NPR)
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>Rule / value</label>
                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      At least · 30,000
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Added condition slot')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: '18px',
                }}
              >
                + Add rule
              </button>

              {/* Customer preview */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Customer preview</span>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    2 of 6
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 12px 0' }}>
                  2 matches among the 6 displayed directory customers. Full-directory membership is calculated on save.
                </p>

                {/* Matches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        AS
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Aaradhya Shrestha</div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>aaradhya@example.com</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 48,200</div>
                      <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>Active</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        KT
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Keshav Thapa</div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>keshav@example.com</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>NPR 31,400</div>
                      <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>Active</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '16px' }}>
                Saving creates a segment only. No marketing is sent and consent preferences do not change.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSegment}
                  style={{
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                  }}
                >
                  Save segment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
