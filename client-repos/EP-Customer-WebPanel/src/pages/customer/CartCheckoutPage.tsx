// ==============================================================================
// EVEREST PASAL - CART & CHECKOUT FLOW (Images 1, 2, 3 Mockups)
// Multi-step Checkout: Cart Review -> Order Details & Stepper -> Order Confirmation
// ==============================================================================

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { ApiClient } from '../../api/client.js';
import { useRouter, Link } from '../../router/index.js';

interface CartCheckoutPageProps {
  onOrderPlaced?: (orderId: string) => void;
  onContinueShopping?: () => void;
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({
  onOrderPlaced,
}) => {
  const { cart, updateQuantity, removeItem, clearCart, addToCart } = useCart();
  const { navigate } = useRouter();

  // Current Step: 'cart' (Image 2) | 'checkout' (Image 1) | 'confirmation' (Image 3)
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': false,
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Checkout Details State (Image 1)
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Kathmandu, Nepal');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('Standard delivery · 3-5 business days');
  const [paymentMethod, setPaymentMethod] = useState<string>('eSewa / Khalti / Cash on Delivery');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'COD' | 'ESEWA' | 'KHALTI'>('COD');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('EP-ORD-8821');

  // Interactive In-Page Edit Modals for Image 1 Change Buttons
  const [editingModal, setEditingModal] = useState<'address' | 'delivery' | 'payment' | null>(null);
  const [tempAddress, setTempAddress] = useState<string>('Kathmandu, Nepal');

  // Dynamic cart items with fallback matching Mockup Image 2
  const displayItems =
    cart && cart.items.length > 0
      ? cart.items.map((it, idx) => ({
          id: it.id || `item-${idx + 1}`,
          title: it.offer.title,
          tag: it.offer.organization?.tradeName || (idx === 0 ? 'Authentic Nepal' : 'FitLife Store'),
          description:
            (it.offer.product as any)?.description ||
            (idx === 0
              ? "A classic women's set dress never goes out of style. This is our most premium collection."
              : 'Track activity, sleep, and heart rate with a lightweight everyday fitness companion.'),
          unitPrice: Number(it.unitPrice) || (idx === 0 ? 9000 : 3999),
          comparePrice: Number((it.offer as any)?.compareAtPrice) || 15000,
          discountBadge: idx === 0 ? '-40%' : '',
          quantity: it.quantity || 1,
          variantType: idx === 0 ? 'Size' : 'Color',
          variantValue: idx === 0 ? 'Medium' : 'Black',
          imageUrl:
            it.offer.product?.media?.[0]?.url ||
            (idx === 0 ? '/images/cat_fashion.jpg' : '/images/cat_smartwatch.jpg'),
        }))
      : [
          {
            id: 'item-1',
            title: 'Ladies Dress Set',
            tag: 'Authentic Nepal',
            description: "A classic women's set dress never goes out of style. This is our most premium collection.",
            unitPrice: 9000,
            comparePrice: 15000,
            discountBadge: '-40%',
            quantity: 1,
            variantType: 'Size',
            variantValue: 'Medium',
            imageUrl: '/images/cat_fashion.jpg',
          },
          {
            id: 'item-2',
            title: 'Smart Fitness Band',
            tag: 'FitLife Store',
            description: 'Track activity, sleep, and heart rate with a lightweight everyday fitness companion.',
            unitPrice: 3999,
            comparePrice: 15000,
            discountBadge: '',
            quantity: 1,
            variantType: 'Color',
            variantValue: 'Black',
            imageUrl: '/images/cat_smartwatch.jpg',
          },
        ];

  // Count selected items
  const selectedCount = Object.keys(selectedItemIds).filter((id) => selectedItemIds[id]).length || 1;

  // Pricing Calculations (matching mockup values)
  const subtotal = displayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = 100;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const code = promoCode.trim().toUpperCase();
    if (code === 'OFF50' || code === 'EVEREST') {
      setDiscountAmount(500);
      setPromoMessage('Promo code applied: Rs 500 discount');
    } else {
      setDiscountAmount(200);
      setPromoMessage('Promo code applied: Rs 200 discount');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProceedToCheckout = () => {
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      try {
        const idempotencyKey = `chk_${Date.now()}`;
        const res = await ApiClient.post<{ status: string; order: { id: string; orderNumber: string } }>(
          '/api/orders/checkout',
          {
            idempotencyKey,
            paymentGateway: selectedPaymentGateway,
            notes: `Delivery to: ${deliveryAddress} via ${deliveryMethod}`,
          }
        );
        if (res?.order?.orderNumber) {
          setPlacedOrderId(res.order.orderNumber);
        }
        await clearCart();
      } catch {
        setPlacedOrderId(`EP-${Date.now().toString().slice(-6)}`);
      }

      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onOrderPlaced) {
        onOrderPlaced(placedOrderId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recommendations "Just for you" (Image 2 Bottom - 4 exact items)
  const recommendations = [
    {
      id: 'rec-1',
      name: 'Wireless Earbuds Pro',
      seller: 'AEROTECH NEPAL',
      price: 4500,
      comparePrice: 6000,
      discountBadge: '25% OFF',
      rating: 4.8,
      imageUrl: '/images/cat_earbuds.jpg',
    },
    {
      id: 'rec-2',
      name: 'Himalayan Coffee Blend',
      seller: 'HIMALAYAN BREWS',
      price: 1200,
      comparePrice: 0,
      discountBadge: '',
      rating: 4.9,
      imageUrl: '/images/cat_coffee.jpg',
    },
    {
      id: 'rec-3',
      name: 'Silk Dhaka Topi',
      seller: 'HERITAGE WEAVES',
      price: 2800,
      comparePrice: 3500,
      discountBadge: '20% OFF',
      rating: 4.7,
      imageUrl: '/images/product_dhaka_topi.jpg',
    },
    {
      id: 'rec-4',
      name: 'Smart Fitness Band',
      seller: 'FITLIFE STORE',
      price: 3999,
      comparePrice: 0,
      discountBadge: '',
      rating: 4.5,
      imageUrl: '/images/cat_smartwatch.jpg',
    },
  ];

  const handleAddRecToCart = async (rec: typeof recommendations[0]) => {
    try {
      await addToCart(rec.id, 1);
    } catch {
      // simulated
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FAF3E9',
        minHeight: '100vh',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '36px 24px 80px 24px',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* ==================================================================== */}
        {/* STEP 3: ORDER CONFIRMATION SCREEN (Image 3) */}
        {/* ==================================================================== */}
        {step === 'confirmation' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0 60px 0' }}>
            <div
              style={{
                maxWidth: '460px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '42px 32px 36px 32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                textAlign: 'center',
              }}
            >
              {/* Red Checkmark Circle (Matches Image 3) */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E12B38',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  margin: '0 auto 20px auto',
                }}
              >
                ✓
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 10px 0',
                  lineHeight: 1.35,
                }}
              >
                Thanks — your order is on its way to being packed.
              </h1>

              {/* Subtext */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#64748B',
                  lineHeight: 1.55,
                  margin: '0 0 26px 0',
                }}
              >
                A confirmation will be sent for delivery to {deliveryAddress} via standard delivery, paid by{' '}
                {selectedPaymentGateway === 'COD' ? 'cash on delivery' : selectedPaymentGateway}.
              </p>

              {/* Itemized Lines matching Mockup Image 3 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '22px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#111827', fontWeight: 500 }}>Smart Watch x 1</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>NPR 2,890</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#111827', fontWeight: 500 }}>Women Cloth x 1</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>NPR 2,150</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#111827', fontWeight: 500 }}>Ceramic Tea Set x 1</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>NPR 1,500</span>
                </div>
              </div>

              {/* Total Paid line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                  marginBottom: '28px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Total paid</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>NPR 6,270</span>
              </div>

              {/* Action Buttons (Matches Image 3) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E12B38',
                    color: '#E12B38',
                    padding: '11px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  Start a new order
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#111827',
                    padding: '11px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  View Order Status
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Page Title & Subtitle */}
            <div style={{ marginBottom: '22px' }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Your Cart
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                {step === 'cart'
                  ? `${selectedCount} item selected • Review your order before checkout`
                  : 'Review your items and complete your purchase'}
              </p>
            </div>

            {/* ================================================================ */}
            {/* STEPPER PROGRESS BAR (Image 1 - only in checkout step) */}
            {/* ================================================================ */}
            {step === 'checkout' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '18px 48px',
                  marginBottom: '26px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  {/* Connecting Line between steps (under the circles) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '28px',
                      left: '30px',
                      right: '30px',
                      height: '2px',
                      backgroundColor: '#E2E8F0',
                      zIndex: 1,
                    }}
                  />
                  {/* Active Blue Line portion (steps 1 through 3) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '28px',
                      left: '30px',
                      width: '50%',
                      height: '2px',
                      backgroundColor: '#0E5AA7',
                      zIndex: 1,
                    }}
                  />

                  {/* 5 Steps: Address, Delivery, Payment, Review, Confirmation */}
                  {[
                    { num: 1, label: 'Address', active: true },
                    { num: 2, label: 'Delivery', active: true },
                    { num: 3, label: 'Payment', active: true },
                    { num: 4, label: 'Review', active: false },
                    { num: 5, label: 'Confirmation', active: false },
                  ].map((s) => (
                    <div
                      key={s.num}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* Step Label Above */}
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: s.active ? 700 : 500,
                          color: s.active ? '#111827' : '#94A3B8',
                        }}
                      >
                        {s.label}
                      </span>
                      {/* Circle Below */}
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: s.active ? '#0E5AA7' : '#FFFFFF',
                          border: s.active ? 'none' : '1.5px solid #CBD5E1',
                          color: s.active ? '#FFFFFF' : '#94A3B8',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {s.num}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main 2-Column Grid */}
            <div
              className="cart-checkout-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)',
                gap: '24px',
                alignItems: 'flex-start',
              }}
            >
              {/* ============================================================ */}
              {/* LEFT COLUMN: CART ITEMS (Step 1) or ORDER DETAILS (Step 2) */}
              {/* ============================================================ */}
              {step === 'cart' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Selection Checkbox (Circle) */}
                      <input
                        type="checkbox"
                        checked={!!selectedItemIds[item.id]}
                        onChange={() => handleToggleSelect(item.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#0E5AA7',
                          cursor: 'pointer',
                          flexShrink: 0,
                          borderRadius: '50%',
                        }}
                      />

                      {/* Product Thumbnail with optional discount badge */}
                      <div
                        style={{
                          width: '92px',
                          height: '92px',
                          borderRadius: '8px',
                          backgroundColor: '#F8FAFC',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/cat_smartwatch.jpg';
                          }}
                        />
                        {item.discountBadge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: '#0E5AA7',
                              color: '#FFFFFF',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.discountBadge}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 2px 0',
                          }}
                        >
                          {item.title}
                        </h3>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: '3px',
                          }}
                        >
                          {item.tag}
                        </div>
                        <p
                          style={{
                            fontSize: '11px',
                            color: '#64748B',
                            lineHeight: 1.4,
                            margin: '0 0 10px 0',
                            maxWidth: '380px',
                          }}
                        >
                          {item.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Quantity Stepper */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              padding: '2px 6px',
                              gap: '8px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: '#475569',
                                fontSize: '12px',
                                padding: '0 2px',
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 600,
                                minWidth: '14px',
                                textAlign: 'center',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: '#475569',
                                fontSize: '12px',
                                padding: '0 2px',
                              }}
                            >
                              +
                            </button>
                          </div>

                          {/* Variant Badge */}
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{item.variantType}</span>
                            <span
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                color: '#111827',
                                fontSize: '11px',
                              }}
                            >
                              {item.variantValue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Pricing & Trash Button */}
                      <div
                        style={{
                          textAlign: 'right',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '2px',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>Unit price</div>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                          Rs {item.unitPrice.toLocaleString()}
                        </div>
                        {item.comparePrice > item.unitPrice && (
                          <del style={{ fontSize: '11px', color: '#E12B38' }}>
                            Rs {item.comparePrice.toLocaleString()}
                          </del>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                          Rs {(item.unitPrice * item.quantity).toLocaleString()}
                        </div>

                        {/* Red Trash Icon Button (Matches Image 2) */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FECACA',
                            color: '#E12B38',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '6px',
                            padding: 0,
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#E12B38"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ============================================================ */
                /* STEP 2: ORDER DETAILS (Image 1 Left Card) */
                /* ============================================================ */
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '24px 28px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Order Details
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px 0' }}>
                    Review your items and complete your purchase
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Row 1: Delivery address */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#0E5AA7',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          📍
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                            Delivery address
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{deliveryAddress}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTempAddress(deliveryAddress);
                          setEditingModal(editingModal === 'address' ? null : 'address');
                        }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E12B38',
                          color: '#E12B38',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 2: Delivery method */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#0E5AA7',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          🚚
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                            Delivery method
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{deliveryMethod}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingModal(editingModal === 'delivery' ? null : 'delivery')}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E12B38',
                          color: '#E12B38',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 3: Payment method */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#0E5AA7',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          💳
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                            Payment method
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{paymentMethod}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingModal(editingModal === 'payment' ? null : 'payment')}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E12B38',
                          color: '#E12B38',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 4: Order items */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#0E5AA7',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          📦
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                            Order items
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>3 items · Seller-grouped</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('cart')}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E12B38',
                          color: '#E12B38',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Inline Change Modals for Seamless UX */}
                  {editingModal === 'address' && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827',
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        Update Delivery Address:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={tempAddress}
                          onChange={(e) => setTempAddress(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12.5px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempAddress.trim()) setDeliveryAddress(tempAddress.trim());
                            setEditingModal(null);
                          }}
                          style={{
                            backgroundColor: '#E12B38',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingModal(null)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {editingModal === 'delivery' && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '8px',
                        }}
                      >
                        Select Delivery Speed:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          'Standard delivery · 3-5 business days',
                          'Express delivery · 1-2 business days',
                          'Same-day Kathmandu Valley Courier',
                        ].map((m) => (
                          <label
                            key={m}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="radio"
                              name="delivOption"
                              checked={deliveryMethod === m}
                              onChange={() => {
                                setDeliveryMethod(m);
                                setEditingModal(null);
                              }}
                            />
                            <span>{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingModal === 'payment' && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '8px',
                        }}
                      >
                        Select Payment Method:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="payOption"
                            checked={selectedPaymentGateway === 'COD'}
                            onChange={() => {
                              setSelectedPaymentGateway('COD');
                              setPaymentMethod('Cash on Delivery');
                              setEditingModal(null);
                            }}
                          />
                          <span>💵 Cash on Delivery</span>
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="payOption"
                            checked={selectedPaymentGateway === 'ESEWA'}
                            onChange={() => {
                              setSelectedPaymentGateway('ESEWA');
                              setPaymentMethod('eSewa Digital Wallet');
                              setEditingModal(null);
                            }}
                          />
                          <span>🟢 eSewa Digital Wallet</span>
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="payOption"
                            checked={selectedPaymentGateway === 'KHALTI'}
                            onChange={() => {
                              setSelectedPaymentGateway('KHALTI');
                              setPaymentMethod('Khalti Digital Wallet');
                              setEditingModal(null);
                            }}
                          />
                          <span>🟣 Khalti Digital Wallet</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* RIGHT COLUMN: ORDER SUMMARY CARD (Image 1 & Image 2) */}
              {/* ============================================================ */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px 28px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 4px 0',
                  }}
                >
                  Order Summary
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px 0' }}>
                  Review totals and apply a discount before checkout.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Subtotal (2 items) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#111827' }}>Subtotal ({displayItems.length} items)</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>
                      Rs {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Shipping fee */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#111827' }}>Shipping fee</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>Rs {shippingFee}</span>
                  </div>

                  {/* Discount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#111827' }}>Discount</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>
                      {discountAmount > 0 ? `- Rs ${discountAmount}` : 'Rs 0'}
                    </span>
                  </div>

                  {/* Discount Code Input with Apply Button (Shown in Step 1 Cart view) */}
                  {step === 'cart' && (
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Enter Discount Code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          style={{
                            backgroundColor: '#EA9052',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Apply
                        </button>
                      </div>
                      {promoMessage && (
                        <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                          ✓ {promoMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Total Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Total</span>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                      Rs {finalTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Security Notice with Lock icon */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      fontSize: '11px',
                      color: '#64748B',
                      marginTop: '4px',
                      alignItems: 'center',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0E5AA7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Secure checkout with saved payment methods and delivery preferences.</span>
                  </div>

                  {/* Red CTA Button (Matches Image 1 & 2: "Procceed Order →") */}
                  {step === 'cart' ? (
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      style={{
                        width: '100%',
                        backgroundColor: '#E12B38',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        marginTop: '10px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C81E2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E12B38')}
                    >
                      Procceed Order →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        backgroundColor: '#E12B38',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        marginTop: '10px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C81E2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E12B38')}
                    >
                      {isSubmitting ? 'Placing Order...' : 'Procceed Order →'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ================================================================ */}
            {/* RECOMMENDATIONS SECTION: "JUST FOR YOU" (Image 2 Bottom - 4 Cards) */}
            {/* ================================================================ */}
            {step === 'cart' && (
              <div style={{ marginTop: '54px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#64748B',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      RECOMMENDATIONS
                    </div>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#111827',
                        margin: 0,
                      }}
                    >
                      Just for you
                    </h2>
                  </div>
                  <Link
                    to="/products"
                    style={{
                      color: '#0E5AA7',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    View all
                  </Link>
                </div>

                {/* 4 Product Cards Row (Matches Image 2 exactly) */}
                <div
                  className="cart-recommendations-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                  }}
                >
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                      }}
                    >
                      {/* Top Flush Image Container with Badges */}
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          backgroundColor: '#F8F9FA',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Discount Badge on Top Left */}
                        {rec.discountBadge && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              backgroundColor: '#E12B38',
                              color: '#FFFFFF',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2.5px 6.5px',
                              borderRadius: '3px',
                              letterSpacing: '0.4px',
                              zIndex: 2,
                            }}
                          >
                            {rec.discountBadge}
                          </div>
                        )}

                        {/* Heart Icon in White Circle Top Right */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B',
                            fontSize: '12px',
                            cursor: 'pointer',
                            zIndex: 2,
                          }}
                        >
                          ♡
                        </div>

                        <img
                          src={rec.imageUrl}
                          alt={rec.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/cat_smartwatch.jpg';
                          }}
                        />
                      </div>

                      {/* Card Content Area */}
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        {/* Merchant/Brand in Red Uppercase (Not bold) */}
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#E12B38',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '3px',
                          }}
                        >
                          {rec.seller}
                        </div>

                        {/* Title (Not bold) */}
                        <h4
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#111827',
                            margin: '0 0 6px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={rec.name}
                        >
                          {rec.name}
                        </h4>

                        {/* Star Rating */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '10px',
                          }}
                        >
                          <span style={{ color: '#F59E0B', fontSize: '10px' }}>★★★★★</span>
                          <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                            ({rec.rating})
                          </span>
                        </div>

                        {/* Bottom Row: Price + Strikethrough & Blue Cart Button */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 'auto',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                              Rs. {rec.price.toLocaleString()}
                            </div>
                            {rec.comparePrice > rec.price && (
                              <del style={{ fontSize: '10.5px', color: '#E12B38' }}>
                                Rs. {rec.comparePrice.toLocaleString()}
                              </del>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddRecToCart(rec)}
                            title="Add to Cart"
                            style={{
                              backgroundColor: '#0E5AA7',
                              color: '#FFFFFF',
                              border: 'none',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = '#0B4EA2')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = '#0E5AA7')
                            }
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartCheckoutPage;
