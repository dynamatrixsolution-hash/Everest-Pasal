// ==============================================================================
// EVEREST PASAL - CUSTOMER ORDERS & TRACKING TIMELINE (WF-001, WF-005, WF-006)
// Transparent multi-vendor package tracking, courier tracking, and order cancellation
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';
import { Modal } from '../../components/Common/Modal.js';

interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  offer?: {
    product?: {
      media?: Array<{ url: string }>;
    };
  };
}

interface Shipment {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status: string;
  shippedAt?: string;
  deliveryEvents?: Array<{
    id: string;
    eventType: string;
    description?: string;
    location?: string;
    occurredAt: string;
  }>;
}

interface VendorFulfillmentUnit {
  id: string;
  organization: {
    id: string;
    legalName: string;
    tradeName?: string;
  };
  status: string;
  handledAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shipments: Shipment[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number | string;
  shippingAmount: number | string;
  totalAmount: number | string;
  currency: string;
  notes?: string;
  placedAt: string;
  items: OrderItem[];
  fulfillmentUnits: VendorFulfillmentUnit[];
  statusHistory: Array<{
    id: string;
    fromStatus?: string;
    toStatus: string;
    reason?: string;
    changedAt: string;
  }>;
}

export const CustomerOrdersPage: React.FC<{ initialOrderId?: string | null }> = ({
  initialOrderId,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Ordered by mistake');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ orders: Order[] }>('/api/orders/my-orders');
      setOrders(res.orders || []);

      if (initialOrderId) {
        const match = res.orders?.find((o) => o.id === initialOrderId);
        if (match) {
          setSelectedOrder(match);
        } else if (res.orders && res.orders.length > 0) {
          setSelectedOrder(res.orders[0]);
        }
      } else if (res.orders && res.orders.length > 0) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch customer orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [initialOrderId]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsCancelling(true);
      await ApiClient.post(`/api/orders/${selectedOrder.id}/cancel`, {
        reason: cancelReason,
      });
      setIsCancelModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      alert(`Could not cancel order: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        Loading your orders and live tracking...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          maxWidth: '600px',
          margin: '40px auto',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <h2 style={{ color: '#f8fafc', marginBottom: '8px' }}>No Orders Found</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          You haven't placed any orders yet. Explore our storefront and start shopping!
        </p>
      </div>
    );
  }

  const isCancellable =
    selectedOrder &&
    ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(selectedOrder.status) &&
    !selectedOrder.fulfillmentUnits.some((u) => ['SHIPPED', 'DELIVERED'].includes(u.status));

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: '0 0 20px 0' }}>
        📦 My Orders & Multi-Package Tracking
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left List of Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{
                  backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    {order.orderNumber}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  Placed on {new Date(order.placedAt).toLocaleDateString()} at {new Date(order.placedAt).toLocaleTimeString()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {order.items.length} item(s) • {order.fulfillmentUnits.length} package(s)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>
                    NPR {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane: Live Multi-Vendor Tracking & Order Summary */}
        {selectedOrder && (
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '24px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid #334155',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Order Details & Live Shipment Timeline
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '4px 0 0 0' }}>
                  {selectedOrder.orderNumber}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusBadge status={selectedOrder.status} />

                {isCancellable && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Vendor Fulfillment Packages (Multi-Vendor Splitting View) */}
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: '0 0 12px 0' }}>
              🏬 Fulfillment Packages by Vendor ({selectedOrder.fulfillmentUnits.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {selectedOrder.fulfillmentUnits.map((unit, idx) => (
                <div
                  key={unit.id}
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                        Package {idx + 1}: {unit.organization.tradeName || unit.organization.legalName}
                      </span>
                    </div>
                    <StatusBadge status={unit.status} />
                  </div>

                  {/* Shipments / Tracking numbers */}
                  {unit.shipments && unit.shipments.length > 0 ? (
                    unit.shipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        style={{
                          backgroundColor: '#1e293b',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          fontSize: '12px',
                          color: '#f8fafc',
                          marginTop: '8px',
                          border: '1px solid #334155',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>🚚 Carrier: <strong>{shipment.carrier || 'Direct Vendor Courier'}</strong></span>
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                            Tracking #{shipment.trackingNumber || 'PENDING'}
                          </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                          Status: {shipment.status} {shipment.shippedAt ? `• Shipped on ${new Date(shipment.shippedAt).toLocaleString()}` : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                      {unit.status === 'CANCELLED' ? '❌ Package cancelled' : '⏳ Seller is preparing package for shipment dispatch...'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Items (Commercial Snapshots) */}
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: '0 0 12px 0' }}>
              📋 Commercial Item Snapshots
            </h3>

            <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 14px' }}>Item</th>
                    <th style={{ padding: '10px 14px' }}>SKU</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} style={{ borderTop: '1px solid #334155' }}>
                      <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 500 }}>
                        {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.sku}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#cbd5e1' }}>
                        NPR {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#f8fafc' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#38bdf8', fontWeight: 600 }}>
                        NPR {Number(item.lineTotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div
              style={{
                backgroundColor: '#0f172a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>NPR {Number(selectedOrder.subtotal).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Shipping & Handling</span>
                <span>NPR {Number(selectedOrder.shippingAmount).toLocaleString()}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  borderTop: '1px solid #334155',
                  paddingTop: '8px',
                  marginTop: '6px',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: '#38bdf8' }}>
                  NPR {Number(selectedOrder.totalAmount).toLocaleString()} {selectedOrder.currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title={`Cancel Order #${selectedOrder.orderNumber}`}
        >
          <form onSubmit={handleCancelOrder}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px' }}>
              Are you sure you want to cancel this order? All reserved items will be released back to inventory.
            </p>

            <div className="form-group">
              <label className="form-label">Reason for cancellation *</label>
              <select
                className="form-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Need to change delivery address">Need to change delivery address</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
              >
                Keep Order
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626' }}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
