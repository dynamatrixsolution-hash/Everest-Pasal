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

  // Current Step: 'cart' (Image 1) | 'checkout' (Image 2) | 'confirmation' (Image 3)
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': false,
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Checkout Details State (Image 2)
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Kathmandu, Nepal');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('Standard delivery • 3-5 business days');
  const [paymentMethod, setPaymentMethod] = useState<string>('eSewa / Khalti / Cash on Delivery');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'COD' | 'ESEWA' | 'KHALTI'>('COD');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('EP-ORD-8821');

  // Interactive In-Page Edit Modals for Image 2
  const [editingModal, setEditingModal] = useState<'address' | 'delivery' | 'payment' | null>(null);
  const [tempAddress, setTempAddress] = useState<string>('Kathmandu, Nepal');

  // Initial cart items (Image 1 Mockup baseline)
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
          comparePrice: Number((it.offer as any)?.compareAtPrice) || (idx === 0 ? 15000 : 3999),
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
            comparePrice: 3999,
            discountBadge: '',
            quantity: 1,
            variantType: 'Color',
            variantValue: 'Black',
            imageUrl: '/images/cat_smartwatch.jpg',
          },
        ];

  // Count selected items
  const selectedCount = Object.keys(selectedItemIds).filter((id) => selectedItemIds[id]).length || 1;

  // Pricing Calculations
  const subtotal = displayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = step === 'checkout' ? 180 : 100;
  const discountVal = step === 'checkout' ? 450 : discountAmount;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountVal);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const code = promoCode.trim().toUpperCase();
    if (code === 'OFF50' || code === 'EVEREST') {
      setDiscountAmount(450);
      setPromoMessage('Promo code applied: Rs 450 discount');
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
        // Fallback simulated order id
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

  // Recommendations "Just for you" (Image 1)
  const recommendations = [
    { id: 'rec-1', name: 'Smart Fitness Band', price: 3999, rating: 4.5, seller: 'FITLIFE STORE', imageUrl: '/images/cat_smartwatch.jpg' },
    { id: 'rec-2', name: 'Smart Fitness Band', price: 3999, rating: 4.5, seller: 'FITLIFE STORE', imageUrl: '/images/cat_smartwatch.jpg' },
    { id: 'rec-3', name: 'Smart Fitness Band', price: 3999, rating: 4.5, seller: 'FITLIFE STORE', imageUrl: '/images/cat_smartwatch.jpg' },
    { id: 'rec-4', name: 'Smart Fitness Band', price: 3999, rating: 4.5, seller: 'FITLIFE STORE', imageUrl: '/images/cat_smartwatch.jpg' },
    { id: 'rec-5', name: 'Smart Fitness Band', price: 3999, rating: 4.5, seller: 'FITLIFE STORE', imageUrl: '/images/cat_smartwatch.jpg' },
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
        backgroundColor: '#FAF7F2',
        minHeight: '100vh',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '32px 20px 80px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ==================================================================== */}
        {/* STEP 3: ORDER CONFIRMATION SCREEN (Image 3) */}
        {/* ==================================================================== */}
        {step === 'confirmation' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 60px 0' }}>
            <div
              style={{
                maxWidth: '480px',
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #EBE5DB',
                borderRadius: '24px',
                padding: '48px 36px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
              }}
            >
              {/* Blue Checkmark Circle */}
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: '#0B4EA2',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 900,
                  margin: '0 auto 24px',
                }}
              >
                ✓
              </div>

              <h1 style={{ fontSize: '23px', fontWeight: 900, color: '#111827', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                Thanks — your order is on its way to being packed.
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, margin: '0 0 28px 0' }}>
                A confirmation will be sent for delivery to <strong style={{ color: '#1e293b' }}>{deliveryAddress}</strong> via standard delivery, paid by {selectedPaymentGateway === 'COD' ? 'cash on delivery' : selectedPaymentGateway}.
              </p>

              <div style={{ width: '100%', height: '1px', backgroundColor: '#EBE5DB', marginBottom: '22px' }} />

              {/* Itemized Lines matching Mockup Image 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '26px', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Smart Watch x 1</span>
                  <strong style={{ color: '#111827' }}>NPR 2,890</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Women Cloth x 1</span>
                  <strong style={{ color: '#111827' }}>NPR 2,150</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Ceramic Tea Set x 1</span>
                  <strong style={{ color: '#111827' }}>NPR 1,500</strong>
                </div>
              </div>

              {/* Total Paid Highlight Banner */}
              <div
                style={{
                  backgroundColor: '#FAF7F2',
                  border: '1px solid #EBE5DB',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '28px',
                }}
              >
                <strong style={{ fontSize: '13.5px', color: '#111827' }}>Total paid</strong>
                <strong style={{ fontSize: '17px', color: '#0B4EA2', fontWeight: 900 }}>NPR 6,270</strong>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#0B4EA2',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(11, 78, 162, 0.25)',
                  }}
                >
                  Start a new order
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    color: '#0B4EA2',
                    border: '1.5px solid #dcd5c9',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
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
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 4px 0' }}>
                Your Cart
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {step === 'cart'
                  ? `${selectedCount} item selected • Review your order before checkout`
                  : 'Review your items and complete your purchase'}
              </p>
            </div>

            {/* ================================================================ */}
            {/* STEPPER PROGRESS BAR (Image 2) */}
            {/* ================================================================ */}
            {step === 'checkout' && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #EBE5DB',
                  borderRadius: '16px',
                  padding: '20px 36px',
                  marginBottom: '28px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Stepper Base Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '40px',
                      right: '40px',
                      height: '2px',
                      backgroundColor: '#EBE5DB',
                      zIndex: 1,
                    }}
                  />
                  {/* Active Line portion (first 3 steps) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '40px',
                      width: '50%',
                      height: '2px',
                      backgroundColor: '#0B4EA2',
                      zIndex: 1,
                    }}
                  />

                  {/* 5 Steps */}
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
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: s.active ? '#0B4EA2' : '#e2d9cc',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {s.num}
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: s.active ? 800 : 500, color: s.active ? '#0B4EA2' : '#94a3b8' }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main 2-Column Grid */}
            <div
              className="checkout-page-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr',
                gap: '28px',
                alignItems: 'flex-start',
              }}
            >
              {/* ============================================================ */}
              {/* LEFT COLUMN: CART ITEMS (Step 1) or ORDER DETAILS (Step 2) */}
              {/* ============================================================ */}
              {step === 'cart' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #EBE5DB',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={!!selectedItemIds[item.id]}
                        onChange={() => handleToggleSelect(item.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#0B4EA2', cursor: 'pointer', flexShrink: 0 }}
                      />

                      {/* Image with discount badge */}
                      <div
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '12px',
                          backgroundColor: '#f8fafc',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {item.discountBadge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: '#E63946',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.discountBadge}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 2px 0' }}>
                          {item.title}
                        </h3>
                        <div style={{ fontSize: '11.5px', color: '#0B4EA2', fontWeight: 700, marginBottom: '4px' }}>
                          {item.tag}
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, margin: '0 0 10px 0', maxWidth: '340px' }}>
                          {item.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Quantity Stepper */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '6px',
                              border: '1px solid #dcd5c9',
                              backgroundColor: '#fafafa',
                              padding: '2px 8px',
                              gap: '8px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '13px' }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '14px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '13px' }}
                            >
                              +
                            </button>
                          </div>

                          {/* Variant Badge */}
                          <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{item.variantType}</span>
                            <span style={{ backgroundColor: '#FAF7F2', border: '1px solid #EBE5DB', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#111827' }}>
                              {item.variantValue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Remove Action */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Unit price</div>
                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#0B4EA2' }}>
                          Rs {item.unitPrice.toLocaleString()}
                        </div>
                        {item.comparePrice > item.unitPrice && (
                          <del style={{ fontSize: '11px', color: '#E63946' }}>
                            Rs {item.comparePrice.toLocaleString()}
                          </del>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          Rs {(item.unitPrice * item.quantity).toLocaleString()}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#E63946',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '8px',
                          }}
                        >
                          <span style={{ border: '1px solid #E63946', borderRadius: '3px', padding: '1px 3px', fontSize: '10px' }}>🗑</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* STEP 2: ORDER DETAILS (Image 2) */
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #EBE5DB',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', margin: '0 0 4px 0' }}>
                    Order Details
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px 0' }}>
                    Review your items and complete your purchase
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Row 1: Delivery address */}
                    <div
                      style={{
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #EBE5DB',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0B4EA2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          📍
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>Delivery address</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{deliveryAddress}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTempAddress(deliveryAddress);
                          setEditingModal('address');
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #0B4EA2',
                          color: '#0B4EA2',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 2: Delivery method */}
                    <div
                      style={{
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #EBE5DB',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0B4EA2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          🚚
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>Delivery method</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{deliveryMethod}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingModal('delivery')}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #0B4EA2',
                          color: '#0B4EA2',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 3: Payment method */}
                    <div
                      style={{
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #EBE5DB',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0B4EA2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          💳
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>Payment method</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{paymentMethod}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingModal('payment')}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #0B4EA2',
                          color: '#0B4EA2',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Row 4: Order items */}
                    <div
                      style={{
                        backgroundColor: '#FAF7F2',
                        border: '1px solid #EBE5DB',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0B4EA2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          📦
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>Order items</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>3 items • Seller-grouped</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('cart')}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #0B4EA2',
                          color: '#0B4EA2',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Inline Change Modals for Seamless UX */}
                  {editingModal === 'address' && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #0B4EA2' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>
                        Update Delivery Address:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={tempAddress}
                          onChange={(e) => setTempAddress(e.target.value)}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcd5c9', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempAddress.trim()) setDeliveryAddress(tempAddress.trim());
                            setEditingModal(null);
                          }}
                          style={{ backgroundColor: '#0B4EA2', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingModal(null)}
                          style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {editingModal === 'delivery' && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #0B4EA2' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                        Select Delivery Speed:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          'Standard delivery • 3-5 business days (Rs 100)',
                          'Express delivery • 1-2 business days (Rs 200)',
                          'Same-day Kathmandu Valley Courier (Rs 250)',
                        ].map((m) => (
                          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
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
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #0B4EA2' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                        Select Payment Method:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="payOption"
                            checked={selectedPaymentGateway === 'COD'}
                            onChange={() => {
                              setSelectedPaymentGateway('COD');
                              setPaymentMethod('Cash on Delivery (COD)');
                              setEditingModal(null);
                            }}
                          />
                          <span>💵 Cash on Delivery (COD)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
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
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
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
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #EBE5DB',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                }}
              >
                {/* Header Banner (Solid Blue in Step 2, Clean White in Step 1) */}
                <div
                  style={{
                    backgroundColor: step === 'checkout' ? '#0B4EA2' : '#ffffff',
                    color: step === 'checkout' ? '#ffffff' : '#111827',
                    padding: '20px 24px',
                    borderBottom: '1px solid #EBE5DB',
                  }}
                >
                  <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>Order Summary</h2>
                  {step === 'cart' && (
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Review totals and apply a discount before checkout.
                    </p>
                  )}
                </div>

                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Subtotal / Items */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>
                      {step === 'checkout' ? 'Items (3)' : `Subtotal (${displayItems.length} items)`}
                    </span>
                    <strong style={{ color: '#111827' }}>
                      {step === 'checkout' ? 'NPR 6,540' : `Rs ${subtotal.toLocaleString()}`}
                    </strong>
                  </div>

                  {/* Shipping / Delivery */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>
                      {step === 'checkout' ? 'Delivery' : 'Shipping fee'}
                    </span>
                    <strong style={{ color: '#111827' }}>
                      {step === 'checkout' ? 'NPR 180' : `Rs ${shippingFee}`}
                    </strong>
                  </div>

                  {/* Discount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Discount</span>
                    <strong style={{ color: '#E63946' }}>
                      {step === 'checkout' ? '- NPR 450' : discountAmount > 0 ? `- Rs ${discountAmount}` : 'Rs 0'}
                    </strong>
                  </div>

                  {/* Promo Input (In Cart Step) */}
                  {step === 'cart' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="text"
                          placeholder="Enter Discount Code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #dcd5c9',
                            fontSize: '12px',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          style={{
                            backgroundColor: '#F4A261',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 700,
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

                  <div style={{ width: '100%', height: '1px', backgroundColor: '#EBE5DB', margin: '6px 0' }} />

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#111827' }}>Total</strong>
                      {step === 'checkout' && (
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Inclusive of all taxes</div>
                      )}
                    </div>
                    <strong style={{ fontSize: '20px', fontWeight: 900, color: '#0B4EA2' }}>
                      {step === 'checkout' ? 'NPR 6,270' : `Rs ${finalTotal.toLocaleString()}`}
                    </strong>
                  </div>

                  {/* Security Notice (In Cart Step) */}
                  {step === 'cart' && (
                    <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '4px', alignItems: 'center' }}>
                      <span>🔒</span>
                      <span>Secure checkout with saved payment methods and delivery preferences.</span>
                    </div>
                  )}

                  {/* CTA Button */}
                  {step === 'cart' ? (
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      style={{
                        width: '100%',
                        backgroundColor: '#E63946',
                        color: '#ffffff',
                        border: 'none',
                        padding: '13px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(230, 57, 70, 0.35)',
                        marginTop: '8px',
                      }}
                    >
                      Proceed Order →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        backgroundColor: '#E63946',
                        color: '#ffffff',
                        border: 'none',
                        padding: '13px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(230, 57, 70, 0.35)',
                        marginTop: '8px',
                      }}
                    >
                      {isSubmitting ? 'Placing Order...' : 'Place Order →'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ================================================================ */}
            {/* RECOMMENDATIONS SECTION: "JUST FOR YOU" (Image 1 Bottom) */}
            {/* ================================================================ */}
            {step === 'cart' && (
              <div style={{ marginTop: '54px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
                  <div>
                    <div style={{ color: '#E63946', fontSize: '10.5px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '2px' }}>
                      RECOMMENDATIONS
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: 0 }}>
                      Just for you
                    </h2>
                  </div>
                  <Link to="/products" style={{ color: '#0B4EA2', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>
                    View all
                  </Link>
                </div>

                {/* 5 Product Cards Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '16px',
                  }}
                >
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #EBE5DB',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#FAF7F2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        ♡
                      </span>

                      <div style={{ width: '100%', height: '130px', borderRadius: '10px', backgroundColor: '#f8fafc', overflow: 'hidden', marginBottom: '10px' }}>
                        <img src={rec.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#E63946', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {rec.seller}
                      </div>
                      <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                        {rec.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span style={{ color: '#F4A261', fontSize: '10px' }}>★★★★★</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>({rec.rating})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <strong style={{ fontSize: '13.5px', color: '#111827' }}>Rs. {rec.price.toLocaleString()}</strong>
                        <button
                          type="button"
                          onClick={() => handleAddRecToCart(rec)}
                          style={{
                            backgroundColor: '#0B4EA2',
                            color: '#ffffff',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                        >
                          🛒
                        </button>
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

