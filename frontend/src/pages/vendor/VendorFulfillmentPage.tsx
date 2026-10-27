// ==============================================================================
// EVEREST PASAL - VENDOR FULFILLMENT & ORDER DISPATCH
// Strict vendor-isolated order management, picking/packing, and courier tracking
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/Common/StatusBadge.js';

interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
}

interface VendorFulfillmentUnit {
  id: string;
  orderId: string;
  status: string;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    placedAt: string;
    account: {
      fullName: string;
      email?: string;
      phone?: string;
    };
    address?: {
      addressLine1: string;
      city: string;
      district: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    orderItem: OrderItem;
  }>;
  shipments: Array<{
    id: string;
    carrier?: string;
    trackingNumber?: string;
    status: string;
  }>;
}

export const VendorFulfillmentPage: React.FC = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<VendorFulfillmentUnit[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDispatchUnit, setActiveDispatchUnit] = useState<VendorFulfillmentUnit | null>(null);
  const [carrier, setCarrier] = useState<string>('Kathmandu Express Delivery');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const vendorRole = user?.roles?.find((r) => {
    const code = (r.role || '').toUpperCase();
    return code.includes('VENDOR') || code.includes('SELLER');
  });
  const vendorOrgId = vendorRole?.organizationId;

  const fetchUnits = async () => {
    try {
      const params = new URLSearchParams();
      if (vendorOrgId) params.append('organizationId', vendorOrgId);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const url = `/api/orders/vendor/fulfillment-units${queryStr}`;

      const res = await ApiClient.get<{ fulfillmentUnits: VendorFulfillmentUnit[] }>(url);
      setUnits(res.fulfillmentUnits || []);
    } catch (err: any) {
      console.error('Failed to fetch vendor fulfillment units:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [statusFilter, vendorOrgId]);

  const handleUpdateStatus = async (
    unitId: string,
    newStatus: string,
    tracking?: { carrier: string; trackingNumber: string }
  ) => {
    try {
      setIsUpdating(true);
      await ApiClient.patch(`/api/orders/vendor/fulfillment-units/${unitId}/status`, {
        organizationId: vendorOrgId,
        status: newStatus,
        carrier: tracking?.carrier,
        trackingNumber: tracking?.trackingNumber,
      });

      setActiveDispatchUnit(null);
      setTrackingNumber('');
      await fetchUnits();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDispatchUnit) return;
    handleUpdateStatus(activeDispatchUnit.id, 'SHIPPED', { carrier, trackingNumber });
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            📦 Store Fulfillment & Order Dispatch
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
            Process incoming orders assigned to your store, print manifests, and update live shipment tracking.
          </p>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
          {['ALL', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                backgroundColor: statusFilter === st ? '#2563eb' : 'transparent',
                color: statusFilter === st ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Loading your store's fulfillment packages...
        </div>
      ) : units.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📦</div>
          <h3 style={{ color: '#f8fafc', marginBottom: '4px' }}>No fulfillment units found</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>
            There are currently no packages matching the "{statusFilter}" status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {units.map((unit) => (
            <div
              key={unit.id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                overflow: 'hidden',
              }}
            >
              {/* Unit Card Header */}
              <div
                style={{
                  padding: '14px 20px',
                  backgroundColor: '#0f172a',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                      Order #{unit.order.orderNumber}
                    </span>
                    <StatusBadge status={unit.status} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Placed by {unit.order.account.fullName} ({unit.order.account.phone || 'No phone'}) on{' '}
                    {new Date(unit.order.placedAt).toLocaleString()}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {unit.status === 'AWAITING_CONFIRMATION' && (
                    <button
                      onClick={() => handleUpdateStatus(unit.id, 'CONFIRMED')}
                      disabled={isUpdating}
                      className="btn btn-primary btn-sm"
                    >
                      ✓ Confirm Package
                    </button>
                  )}

                  {unit.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(unit.id, 'PREPARING')}
                      disabled={isUpdating}
                      className="btn btn-secondary btn-sm"
                    >
                      📦 Start Packing
                    </button>
                  )}

                  {['CONFIRMED', 'PREPARING', 'READY_TO_SHIP'].includes(unit.status) && (
                    <button
                      onClick={() => {
                        setActiveDispatchUnit(unit);
                        setTrackingNumber(`TRK-${Math.floor(100000 + Math.random() * 900000)}`);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#059669' }}
                    >
                      🚚 Dispatch & Ship
                    </button>
                  )}

                  {unit.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleUpdateStatus(unit.id, 'DELIVERED')}
                      disabled={isUpdating}
                      className="btn btn-secondary btn-sm"
                    >
                      ✓ Mark as Delivered
                    </button>
                  )}
                </div>
              </div>

              {/* Package Content & Items */}
              <div style={{ padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ paddingBottom: '8px' }}>Store Item</th>
                      <th style={{ paddingBottom: '8px' }}>SKU</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.items.map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #334155' }}>
                        <td style={{ padding: '8px 0', color: '#f8fafc', fontWeight: 500 }}>
                          {item.orderItem.productName}
                        </td>
                        <td style={{ padding: '8px 0', color: '#94a3b8' }}>{item.orderItem.sku}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#f8fafc', fontWeight: 600 }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: '#cbd5e1' }}>
                          NPR {Number(item.orderItem.unitPrice).toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: '#38bdf8', fontWeight: 600 }}>
                          NPR {(Number(item.orderItem.unitPrice) * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tracking info banner if shipped */}
                {unit.shipments && unit.shipments.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: '#0f172a',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <span>
                      🚚 Courier: <strong>{unit.shipments[0].carrier || 'Standard Courier'}</strong>
                    </span>
                    <span>
                      Tracking Number: <strong style={{ color: '#38bdf8' }}>{unit.shipments[0].trackingNumber}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Modal Dialog */}
      {activeDispatchUnit && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '24px',
              maxWidth: '480px',
              width: '90%',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>
              Dispatch Package for Order #{activeDispatchUnit.order.orderNumber}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>
              Assign courier and tracking details so the customer can track this package in real time.
            </p>

            <form onSubmit={handleDispatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Courier / Logistics Partner
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Kathmandu Express Delivery, Sundar Courier"
                  required
                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Tracking Number / Waybill ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. KTN-TRACK-88910"
                  required
                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveDispatchUnit(null)}
                  className="btn btn-secondary"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                  style={{ backgroundColor: '#059669' }}
                >
                  {isUpdating ? 'Saving Dispatch...' : 'Confirm Shipment Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
