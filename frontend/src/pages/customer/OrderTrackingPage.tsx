// ==============================================================================
// EVEREST PASAL - ORDER TRACKING TIMELINE PAGE
// Exact Implementation matching Official Design Mockup (Image 1)
// Breadcrumbs: Home > My Orders > Order #EP-1048
// ==============================================================================

import React, { useState } from 'react';
import { useRouter, Link } from '../../router/index.js';

interface TrackingEvent {
  title: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
  iconType: 'check' | 'truck' | 'clock' | 'delivered';
}

export const OrderTrackingPage: React.FC<{ orderId?: string }> = ({ orderId = 'EP-1048' }) => {
  const { navigate } = useRouter();
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  const trackingTimeline: TrackingEvent[] = [
    {
      title: 'Order Placed',
      timestamp: '12 Oct 2026, 10:45 AM',
      completed: true,
      iconType: 'check',
    },
    {
      title: 'Order Confirmed',
      timestamp: '12 Oct 2026, 11:10 AM',
      completed: true,
      iconType: 'check',
    },
    {
      title: 'Processing',
      timestamp: '12 Oct 2026, 02:30 PM',
      completed: true,
      iconType: 'check',
    },
    {
      title: 'Shipped',
      timestamp: '13 Oct 2026, 09:00 AM',
      completed: true,
      active: true,
      iconType: 'truck',
    },
    {
      title: 'Out for Delivery',
      timestamp: 'Pending',
      completed: false,
      iconType: 'clock',
    },
    {
      title: 'Delivered',
      timestamp: 'Pending',
      completed: false,
      iconType: 'delivered',
    },
  ];

  const orderedItems = [
    {
      id: 'item-1',
      name: 'Ceramic Coffee Mug',
      qty: 1,
      price: 'Rs 499.00',
      image: '/images/cat_coffee.jpg',
      fallbackEmoji: '☕',
    },
    {
      id: 'item-2',
      name: 'Organic Cotton T-Shirt',
      qty: 2,
      price: 'Rs 1,299.00',
      image: '/images/cat_fashion.jpg',
      fallbackEmoji: '👕',
    },
    {
      id: 'item-3',
      name: 'Wireless Earbuds',
      qty: 1,
      price: 'Rs 2,501.00',
      image: '/images/cat_earbuds.jpg',
      fallbackEmoji: '🎧',
    },
  ];

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText('EP-TRK-9928374');
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: 'calc(100vh - 200px)', padding: '28px 20px 60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation (Exact Mockup) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '22px',
          }}
        >
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            Home
          </Link>
          <span>&gt;</span>
          <Link to="/account?tab=orders" style={{ color: '#64748b', textDecoration: 'none' }}>
            My Orders
          </Link>
          <span>&gt;</span>
          <span style={{ color: '#0B4EA2', fontWeight: 700 }}>
            Order #{orderId}
          </span>
        </div>

        {/* 1. ORDER SUMMARY CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E1',
            padding: '24px 32px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
            Order Summary
          </h2>

          <div
            className="responsive-grid-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                ORDER ID
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                {orderId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                DATE PLACED
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                12 Oct 2026, 10:45 AM
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                TOTAL AMOUNT
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#E63946', marginTop: '4px' }}>
                Rs 4,299.00
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                PAYMENT METHOD
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                ESEWA Wallet
              </div>
            </div>
          </div>
        </div>

        {/* 2. TRACKING STATUS CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E1',
            padding: '28px 32px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>
            Tracking Status
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {trackingTimeline.map((step, idx) => {
              const isLast = idx === trackingTimeline.length - 1;
              const isCompleted = step.completed;
              const isActive = step.active;

              return (
                <div
                  key={step.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    position: 'relative',
                    paddingBottom: isLast ? '0px' : '28px',
                  }}
                >
                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '15px',
                        top: '30px',
                        bottom: '0px',
                        width: '2px',
                        backgroundColor: isCompleted && trackingTimeline[idx + 1].completed ? '#0B4EA2' : '#E2E8F0',
                      }}
                    />
                  )}

                  {/* Step Icon Badge */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isActive
                        ? '#0B4EA2'
                        : isCompleted
                        ? '#047857'
                        : '#F1F5F9',
                      border: isActive
                        ? '3px solid #BFDBFE'
                        : isCompleted
                        ? 'none'
                        : '1.5px solid #CBD5E1',
                      color: isCompleted || isActive ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    {step.iconType === 'check' && '✓'}
                    {step.iconType === 'truck' && '🚚'}
                    {step.iconType === 'clock' && '⏱'}
                    {step.iconType === 'delivered' && '✓'}
                  </div>

                  {/* Step Label & Date */}
                  <div style={{ paddingTop: '4px' }}>
                    <div
                      style={{
                        fontSize: '14.5px',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#0B4EA2' : isCompleted ? '#111827' : '#94A3B8',
                        marginBottom: '3px',
                      }}
                    >
                      {step.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: isActive ? '#0B4EA2' : '#64748B',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {step.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SHIPPING DETAILS CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E1',
            padding: '24px 32px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
            Shipping Details
          </h2>

          <div
            className="responsive-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                CARRIER NAME
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                Everest Pasal Logistics
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                TRACKING NUMBER
              </div>
              <div
                onClick={handleCopyTracking}
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#0B4EA2',
                  marginTop: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Click to copy tracking code"
              >
                <span>EP-TRK-9928374</span>
                <span style={{ fontSize: '11px', color: copiedTracking ? '#16A34A' : '#64748b' }}>
                  {copiedTracking ? '✓ Copied' : '📋'}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                ESTIMATED DELIVERY
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                15 Oct 2026
              </div>
            </div>
          </div>
        </div>

        {/* 4. ORDERED ITEMS CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E1',
            padding: '24px 32px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 20px 0' }}>
            Ordered Items
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {orderedItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: index < orderedItems.length - 1 ? '16px' : '0px',
                  borderBottom: index < orderedItems.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Item Image Thumbnail */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #EDE8E1',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827', marginBottom: '3px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                      Qty: {item.qty}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DELIVERY ADDRESS CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E1',
            padding: '24px 32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 14px 0' }}>
            Delivery Address
          </h2>

          <div style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '15px', marginBottom: '2px' }}>
              Aarav Sharma
            </div>
            <div>House No. 42, Everest Colony, Thamel</div>
            <div>Kathmandu, Nepal - 44600</div>
            <div style={{ color: '#64748b', marginTop: '2px' }}>+977 9841 234 567</div>
          </div>
        </div>
      </div>
    </div>
  );
};
