import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  ExternalLink,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  MapPin,
  X,
  Phone,
  Package,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface Shipment {
  shipmentId: string;
  recipient: string;
  phone: string;
  route: string;
  partner: string;
  status: string;
  eta: string;
  orderId: string;
  address: string;
  items: number;
  weight: string;
  zone: string;
  placedOn: string;
  failureReason?: string;
  notes?: string;
}

interface DeliveryKpis {
  onTimeDelivery: string;
  onTimeDeliveryNote: string;
  shipments: string;
  shipmentsNote: string;
  deliveryPartners: string;
  deliveryPartnersNote: string;
  deliveryZones: string;
  deliveryZonesNote: string;
}

export const AdminDeliveryDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<DeliveryKpis>({
    onTimeDelivery: '96.8%',
    onTimeDeliveryNote: '1,105 of 1,142 delivered on time',
    shipments: '1,284',
    shipmentsNote: '1,142 delivered • 128 in transit • 14 exceptions',
    deliveryPartners: '12',
    deliveryPartnersNote: '8 active • 3 onboarding • 1 paused',
    deliveryZones: '24',
    deliveryZonesNote: '18 standard • 4 express • 2 rural',
  });

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [deliveryCharges, setDeliveryCharges] = useState<{ name: string; fee: string }[]>([]);
  const [trackingTelemetry, setTrackingTelemetry] = useState<{ label: string; value: string }[]>([]);
  const [failedDeliveries, setFailedDeliveries] = useState<{ label: string; count: number }[]>([]);
  const [returnToOrigin, setReturnToOrigin] = useState<{ label: string; count: number }[]>([]);
  const [partnerOnTimeRate, setPartnerOnTimeRate] = useState<{ partner: string; rate: string }[]>([]);
  const [shipmentShareByZone, setShipmentShareByZone] = useState<{ zone: string; share: string }[]>([]);
  const [exceptionsByZone, setExceptionsByZone] = useState<{ zone: string; count: number }[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [partnerFilter, setPartnerFilter] = useState('All Partners');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTrackShipment, setSelectedTrackShipment] = useState<Shipment | null>(null);
  const [selectedReviewShipment, setSelectedReviewShipment] = useState<Shipment | null>(null);

  // New Shipment Form State
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoute, setNewRoute] = useState('Kathmandu → Lalitpur');
  const [newPartner, setNewPartner] = useState('Valley Courier');
  const [newEta, setNewEta] = useState('Today, 16:00');
  const [newOrderId, setNewOrderId] = useState('ORD-1009');
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState('Kathmandu Valley');
  const [newWeight, setNewWeight] = useState('1.0 kg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDeliveryData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'All Status') params.append('status', statusFilter);
      if (partnerFilter !== 'All Partners') params.append('partner', partnerFilter);

      const res: any = await ApiClient.get(`/admin/delivery/dashboard?${params.toString()}`);

      if (res && res.data) {
        if (res.data.kpis) setKpis(res.data.kpis);
        if (res.data.recentShipments) setShipments(res.data.recentShipments);
        if (res.data.deliveryCharges) setDeliveryCharges(res.data.deliveryCharges);
        if (res.data.tracking) setTrackingTelemetry(res.data.tracking);
        if (res.data.failedDeliveries) setFailedDeliveries(res.data.failedDeliveries);
        if (res.data.returnToOrigin) setReturnToOrigin(res.data.returnToOrigin);
        if (res.data.partnerOnTimeRate) setPartnerOnTimeRate(res.data.partnerOnTimeRate);
        if (res.data.shipmentShareByZone) setShipmentShareByZone(res.data.shipmentShareByZone);
        if (res.data.exceptionsByZone) setExceptionsByZone(res.data.exceptionsByZone);
      }
    } catch (err) {
      console.error('Failed to load delivery dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, [searchQuery, statusFilter, partnerFilter]);

  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest_pasal_logistics_report_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'EVEREST PASAL — DELIVERY & LOGISTICS REPORT',
      subtitle: 'Generated from Everest Pasal System Admin Control Center',
      metadata: {
        'On-Time Delivery Rate': kpis.onTimeDelivery,
        'Total Shipments (30d)': kpis.shipments,
        'Delivery Partners': kpis.deliveryPartners,
        'Coverage Zones': kpis.deliveryZones,
        'Export Date': new Date().toLocaleString(),
      },
      headers: [
        'SHIPMENT ID',
        'RECIPIENT',
        'PHONE',
        'ROUTE',
        'PARTNER',
        'STATUS',
        'ETA',
        'ORDER ID',
        'ZONE',
        'ADDRESS',
      ],
      rows: shipments.map((s) => [
        s.shipmentId,
        s.recipient,
        s.phone,
        s.route,
        s.partner,
        s.status,
        s.eta,
        s.orderId,
        s.zone,
        s.address,
      ]),
    });
  };

  const handleAssignShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() || !newAddress.trim()) {
      setFormError('Please enter recipient name and complete delivery address.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await ApiClient.post('/admin/delivery/assign', {
        recipient: newRecipient,
        phone: newPhone || '+977 98-4100-0000',
        route: newRoute,
        partner: newPartner,
        eta: newEta,
        orderId: newOrderId,
        address: newAddress,
        zone: newZone,
        weight: newWeight,
        status: 'In Transit',
      });
      setShowAssignModal(false);
      setNewRecipient('');
      setNewAddress('');
      await fetchDeliveryData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to assign shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, status: string, eta?: string) => {
    try {
      await ApiClient.put(`/admin/delivery/shipments/${shipmentId}/status`, { status, eta });
      await fetchDeliveryData();
      if (selectedTrackShipment) {
        setSelectedTrackShipment((prev) => (prev ? { ...prev, status, eta: eta || prev.eta } : null));
      }
      if (selectedReviewShipment) {
        setSelectedReviewShipment((prev) => (prev ? { ...prev, status, eta: eta || prev.eta } : null));
      }
    } catch (err) {
      console.error('Failed to update shipment status:', err);
    }
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795252684063_13a5efec.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Delivery & Logistics Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Example data · Last 30 days. Monitor shipments, partners, coverage, charges and delivery exceptions across Everest Pasal.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Download size={14} color="#0F172A" />
            <span>Export Logistics Report</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Plus size={14} color="#FFFFFF" />
            <span>Assign Shipment</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards matching media_1795252684063_13a5efec.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {/* On-Time Delivery */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>On-Time Delivery</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.onTimeDelivery}</div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 500, marginTop: '8px' }}>
            {kpis.onTimeDeliveryNote}
          </div>
        </div>

        {/* Shipments */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>Shipments</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.shipments}</div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, marginTop: '8px' }}>
            {kpis.shipmentsNote}
          </div>
        </div>

        {/* Delivery Partners */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>Delivery Partners</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.deliveryPartners}</div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, marginTop: '8px' }}>
            {kpis.deliveryPartnersNote}
          </div>
        </div>

        {/* Delivery Zones */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '6px' }}>Delivery Zones</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{kpis.deliveryZones}</div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, marginTop: '8px' }}>
            {kpis.deliveryZonesNote}
          </div>
        </div>
      </div>

      {/* 3. Filter Bar matching media_1795252684063_13a5efec.jpg */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              padding: '7px 12px',
              gap: '8px',
              width: '320px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipment, partner or zone..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                color: '#0F172A',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              padding: '7px 12px',
              fontSize: '12.5px',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <option value="All Status">All Status</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="In Transit">In Transit</option>
            <option value="Failed Delivery">Failed Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>

          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              padding: '7px 12px',
              fontSize: '12.5px',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <option value="All Partners">All Partners</option>
            <option value="Valley Courier">Valley Courier</option>
            <option value="Western Parcel">Western Parcel</option>
            <option value="Eastern Dispatch">Eastern Dispatch</option>
            <option value="Terai Logistics">Terai Logistics</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
          1,284 shipments • 12 partners • 24 zones
        </div>
      </div>

      {/* 4. Recent Shipments Table Section matching media_1795252684063_13a5efec.jpg */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Recent Shipments</div>
          <button
            onClick={() => {
              setStatusFilter('All Status');
              setPartnerFilter('All Partners');
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0B4EA2',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            View all shipments
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  SHIPMENT
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  RECIPIENT
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  ROUTE
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  PARTNER
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  STATUS
                </th>
                <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  ETA
                </th>
                <th style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 3).map((shipment, index) => (
                <tr
                  key={shipment.shipmentId}
                  style={{
                    borderBottom: index < 2 ? '1px solid #F1F5F9' : 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {shipment.shipmentId}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                    {shipment.recipient}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                    {shipment.route}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                    {shipment.partner}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {shipment.status === 'Out for Delivery' ? (
                      <span style={{ color: '#0B4EA2', fontWeight: 600 }}>Out for Delivery</span>
                    ) : shipment.status === 'In Transit' ? (
                      <span style={{ color: '#0B4EA2', fontWeight: 600 }}>In Transit</span>
                    ) : shipment.status === 'Failed Delivery' ? (
                      <span style={{ color: '#DC2626', fontWeight: 600 }}>Failed Delivery</span>
                    ) : (
                      <span style={{ color: '#16A34A', fontWeight: 600 }}>{shipment.status}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: shipment.eta === 'Review needed' ? '#DC2626' : '#475569' }}>
                    {shipment.eta}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {shipment.status === 'Failed Delivery' ? (
                      <button
                        onClick={() => setSelectedReviewShipment(shipment)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={12} color="#64748B" />
                        <span>Review</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTrackShipment(shipment)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          cursor: 'pointer',
                        }}
                      >
                        <ExternalLink size={12} color="#64748B" />
                        <span>Track</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Middle Grid (4 Breakdown Cards) matching media_1795252684063_13a5efec.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {/* Delivery Charges */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Delivery Charges
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {deliveryCharges.map((item) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.name}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.fee}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Tracking
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {trackingTelemetry.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Deliveries */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Failed Deliveries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {failedDeliveries.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Return to Origin */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Return to Origin
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {returnToOrigin.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bottom Row (3 Performance Breakdown Cards) matching media_1795252684063_13a5efec.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Partner On-Time Rate */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Partner On-Time Rate
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {partnerOnTimeRate.map((item) => (
              <div key={item.partner} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.partner}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipment Share by Zone */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Shipment Share by Zone
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shipmentShareByZone.map((item) => (
              <div key={item.zone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.zone}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.share}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exceptions by Zone */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            Exceptions by Zone
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {exceptionsByZone.map((item) => (
              <div key={item.zone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ color: '#475569' }}>{item.zone}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODAL 1: Assign Shipment Modal */}
      {/* ================================================================ */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                  <Truck size={18} color="#0B4EA2" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Assign New Shipment</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Dispatch package through regional courier partners
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', color: '#DC2626', fontSize: '12px', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAssignShipment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mina Rai"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+977 98-XXXX-XXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Delivery Route *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu → Lalitpur"
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Courier Partner *
                  </label>
                  <select
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Valley Courier">Valley Courier (Kathmandu)</option>
                    <option value="Western Parcel">Western Parcel (Gandaki & Lumbini)</option>
                    <option value="Eastern Dispatch">Eastern Dispatch (Koshi & Madhesh)</option>
                    <option value="Terai Logistics">Terai Logistics (Terai belt)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Zone Coverage
                  </label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Kathmandu Valley">Kathmandu Valley</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Butwal">Butwal</option>
                    <option value="Rural / Other">Rural / Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Estimated Arrival (ETA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today, 16:00"
                    value={newEta}
                    onChange={(e) => setNewEta(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Full Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street address, ward, landmark, city"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12.5px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 2: Live Tracking Modal */}
      {/* ================================================================ */}
      {selectedTrackShipment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                  <Truck size={18} color="#0B4EA2" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    Live Tracking: {selectedTrackShipment.shipmentId}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Order {selectedTrackShipment.orderId} • {selectedTrackShipment.partner}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrackShipment(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Recipient: </span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTrackShipment.recipient}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Phone: </span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTrackShipment.phone}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Route: </span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTrackShipment.route}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Estimated Arrival: </span>
                  <span style={{ fontWeight: 600, color: '#0B4EA2' }}>{selectedTrackShipment.eta}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748B' }}>Address: </span>
                  <span style={{ fontWeight: 500, color: '#0F172A' }}>{selectedTrackShipment.address}</span>
                </div>
              </div>
            </div>

            {/* Tracking Progress Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
                Shipment Status Checkpoints
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Package Picked Up from Vendor</span>
                    <div style={{ color: '#64748B', fontSize: '11px' }}>Sorted at Kathmandu Logistics Hub</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>In Regional Transit</span>
                    <div style={{ color: '#64748B', fontSize: '11px' }}>Handed to {selectedTrackShipment.partner}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} color="#0B4EA2" />
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0B4EA2' }}>
                      Current Status: {selectedTrackShipment.status}
                    </span>
                    <div style={{ color: '#64748B', fontSize: '11px' }}>ETA: {selectedTrackShipment.eta}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedTrackShipment.shipmentId, 'Delivered', 'Delivered')}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#16A34A',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Mark Delivered
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrackShipment(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 3: Delivery Exception Review Modal */}
      {/* ================================================================ */}
      {selectedReviewShipment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
              width: '100%',
              maxWidth: '540px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                  <AlertTriangle size={18} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    Delivery Exception Review
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Shipment {selectedReviewShipment.shipmentId} • Order {selectedReviewShipment.orderId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReviewShipment(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#991B1B', marginBottom: '4px' }}>
                Failure Reason: {selectedReviewShipment.failureReason || 'Address not found after 2 attempts'}
              </div>
              <div style={{ fontSize: '12px', color: '#B91C1C' }}>
                Recipient could not be reached via telephone (+977 98-5345-6789) or street landmark.
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#334155' }}>
              <div><strong>Recipient:</strong> {selectedReviewShipment.recipient}</div>
              <div><strong>Route:</strong> {selectedReviewShipment.route}</div>
              <div><strong>Courier:</strong> {selectedReviewShipment.partner}</div>
              <div><strong>Address on File:</strong> {selectedReviewShipment.address}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedReviewShipment.shipmentId, 'In Transit', 'Tomorrow, 11:00');
                  setSelectedReviewShipment(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>Retry Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedReviewShipment.shipmentId, 'Return to Origin', 'RTO in Transit');
                  setSelectedReviewShipment(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Package size={13} />
                <span>Return to Origin (RTO)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
