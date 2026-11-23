import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  DollarSign,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface AgentOrderRecord {
  id: string;
  orderId: string;
  customer: string;
  agentName: string;
  agentId: string;
  agentChannel: string;
  region: string;
  attributionMethod: string;
  totalAmount: number;
  itemsCount: number;
  orderStatus: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  paymentState: string;
  commissionEligibility: string;
  commissionAmount: number;
}

export const AdminAgentOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AgentOrderRecord[]>([
    {
      id: '1',
      orderId: 'ORD-AG2001',
      customer: 'Aarav Thapa · Kathmandu',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      agentChannel: 'Field Direct',
      region: 'Kathmandu Central',
      attributionMethod: 'QR Code scan',
      totalAmount: 10800,
      itemsCount: 3,
      orderStatus: 'Delivered',
      paymentState: 'Paid (Card)',
      commissionEligibility: 'Eligible · NPR 500',
      commissionAmount: 500,
    },
    {
      id: '2',
      orderId: 'ORD-AG2002',
      customer: 'Priya Shrestha · Pokhara',
      agentName: 'Nirmala Rai',
      agentId: 'AGT-1002',
      agentChannel: 'Field Direct',
      region: 'Pokhara Lakeside',
      attributionMethod: 'Assisted Link',
      totalAmount: 8400,
      itemsCount: 2,
      orderStatus: 'In Transit',
      paymentState: 'COD Pending',
      commissionEligibility: 'Pending Delivery',
      commissionAmount: 420,
    },
    {
      id: '3',
      orderId: 'ORD-AG2003',
      customer: 'Kishor Regmi · Lalitpur',
      agentName: 'Bikash Thapa',
      agentId: 'AGT-1003',
      agentChannel: 'Field Direct',
      region: 'Lalitpur Patan',
      attributionMethod: 'Direct Referral',
      totalAmount: 14200,
      itemsCount: 5,
      orderStatus: 'Delivered',
      paymentState: 'Paid (eSewa)',
      commissionEligibility: 'Eligible · NPR 710',
      commissionAmount: 710,
    },
    {
      id: '4',
      orderId: 'ORD-AG2004',
      customer: 'Pradip Adhikari · Butwal',
      agentName: 'Pratik Shrestha',
      agentId: 'AGT-1004',
      agentChannel: 'Field Direct',
      region: 'Butwal Traffic Chowk',
      attributionMethod: 'Assisted Link',
      totalAmount: 8000,
      itemsCount: 2,
      orderStatus: 'Cancelled',
      paymentState: 'Refunded',
      commissionEligibility: 'Excluded (Cancelled)',
      commissionAmount: 0,
    },
    {
      id: '5',
      orderId: 'ORD-AG2005',
      customer: 'Sarita Gurung · Biratnagar',
      agentName: 'Sarita Gurung',
      agentId: 'AGT-1005',
      agentChannel: 'Field Direct',
      region: 'Biratnagar Main Road',
      attributionMethod: 'Direct Referral',
      totalAmount: 6500,
      itemsCount: 2,
      orderStatus: 'Processing',
      paymentState: 'Paid (Card)',
      commissionEligibility: 'Pending Delivery',
      commissionAmount: 325,
    },
    {
      id: '6',
      orderId: 'ORD-AG2006',
      customer: 'Bikram Shah · Kathmandu',
      agentName: 'Roshani Lama',
      agentId: 'AGT-1007',
      agentChannel: 'Field Direct',
      region: 'Kathmandu New Road',
      attributionMethod: 'QR Code scan',
      totalAmount: 12500,
      itemsCount: 4,
      orderStatus: 'Delivered',
      paymentState: 'Paid (Khalti)',
      commissionEligibility: 'Eligible · NPR 625',
      commissionAmount: 625,
    },
    {
      id: '7',
      orderId: 'ORD-AG2007',
      customer: 'Anita Karki · Kathmandu',
      agentName: 'Sujan Karki',
      agentId: 'AGT-1001',
      agentChannel: 'Field Direct',
      region: 'Kathmandu Baneshwor',
      attributionMethod: 'Assisted Link',
      totalAmount: 5200,
      itemsCount: 1,
      orderStatus: 'Delivered',
      paymentState: 'Paid (eSewa)',
      commissionEligibility: 'Eligible · NPR 260',
      commissionAmount: 260,
    },
    {
      id: '8',
      orderId: 'ORD-AG2008',
      customer: 'Deepak Joshi · Dharan',
      agentName: 'Deepak Adhikari',
      agentId: 'AGT-1006',
      agentChannel: 'Field Direct',
      region: 'Dharan Clock Tower',
      attributionMethod: 'Direct Referral',
      totalAmount: 7000,
      itemsCount: 2,
      orderStatus: 'In Transit',
      paymentState: 'COD Pending',
      commissionEligibility: 'Pending Delivery',
      commissionAmount: 350,
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<AgentOrderRecord>(orders[0]);

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents/orders')
      .then((res) => {
        if (res?.data?.orders && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
          if (res.data.orders.length > 0) {
            setSelectedOrder(res.data.orders[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    exportToCsv({
      filename: 'agent_attributed_orders.csv',
      title: 'EVEREST PASAL — AGENT ATTRIBUTED ORDERS',
      headers: ['Order ID', 'Customer', 'Agent', 'Region', 'Attribution', 'Total', 'Order Status', 'Payment State', 'Commission Eligibility'],
      rows: orders.map((o) => [
        o.orderId,
        o.customer,
        `${o.agentName} (${o.agentId})`,
        o.region,
        o.attributionMethod,
        `NPR ${o.totalAmount}`,
        o.orderStatus,
        o.paymentState,
        o.commissionEligibility,
      ]),
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.agentName.toLowerCase().includes(search.toLowerCase()) ||
      o.agentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'All' || o.paymentState.includes(paymentFilter);
    const matchesEligibility =
      eligibilityFilter === 'All' || o.commissionEligibility.includes(eligibilityFilter);
    return matchesSearch && matchesStatus && matchesPayment && matchesEligibility;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Poppins', sans-serif",
        color: '#0F172A',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
            Agent Orders
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Track orders attributed to sales agents, fulfillment states and commission eligibility.
          </p>
        </div>

        <button
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0B4EA2',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Download size={15} />
          <span>Export orders</span>
        </button>
      </div>

      {/* 5 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Attributed orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Attributed orders · Last 30 days
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            56
          </div>
        </div>

        {/* Delivered */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Delivered
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>
            34
          </div>
        </div>

        {/* In Transit */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            In Transit
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284C7', marginTop: '4px' }}>
            10
          </div>
        </div>

        {/* Processing */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Processing
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>
            8
          </div>
        </div>

        {/* Cancelled */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Cancelled
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#E63946', marginTop: '4px' }}>
            4
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              padding: '7px 12px',
              gap: '8px',
              flex: 1,
              maxWidth: '380px',
            }}
          >
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search order ID, customer or agent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              fontSize: '12.5px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="All">All order statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="In Transit">In Transit</option>
            <option value="Processing">Processing</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              fontSize: '12.5px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="All">All payment states</option>
            <option value="Paid">Paid</option>
            <option value="COD">COD</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '7px',
              fontSize: '12.5px',
              color: '#334155',
              backgroundColor: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="All">All commission eligibility</option>
            <option value="Eligible">Eligible</option>
            <option value="Pending">Pending Delivery</option>
            <option value="Excluded">Excluded</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ORDER / CUSTOMER
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ATTRIBUTED AGENT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  REGION / ATTRIBUTION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ORDER TOTAL
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ORDER STATUS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  PAYMENT STATE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  COMMISSION ELIGIBILITY
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder.orderId === ord.orderId;
                return (
                  <tr
                    key={ord.orderId}
                    onClick={() => setSelectedOrder(ord)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Order / Customer */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{ord.orderId}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ord.customer}
                      </div>
                    </td>

                    {/* Attributed Agent */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{ord.agentName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ord.agentId} · {ord.agentChannel}
                      </div>
                    </td>

                    {/* Region / Attribution */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#1E293B' }}>{ord.region}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ord.attributionMethod}
                      </div>
                    </td>

                    {/* Order Total */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        NPR {ord.totalAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ord.itemsCount} items
                      </div>
                    </td>

                    {/* Order Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            ord.orderStatus === 'Delivered'
                              ? '#DCFCE7'
                              : ord.orderStatus === 'In Transit'
                              ? '#E0F2FE'
                              : ord.orderStatus === 'Processing'
                              ? '#FEF3C7'
                              : '#FEE2E2',
                          color:
                            ord.orderStatus === 'Delivered'
                              ? '#15803D'
                              : ord.orderStatus === 'In Transit'
                              ? '#0369A1'
                              : ord.orderStatus === 'Processing'
                              ? '#92400E'
                              : '#B91C1C',
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    {/* Payment State */}
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {ord.paymentState}
                    </td>

                    {/* Commission Eligibility */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            ord.commissionEligibility.startsWith('Eligible')
                              ? '#DCFCE7'
                              : ord.commissionEligibility.startsWith('Pending')
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          color:
                            ord.commissionEligibility.startsWith('Eligible')
                              ? '#15803D'
                              : ord.commissionEligibility.startsWith('Pending')
                              ? '#92400E'
                              : '#64748B',
                        }}
                      >
                        {ord.commissionEligibility}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#0B4EA2',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '8px' }}>●</span> View order
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748B',
          }}
        >
          <div>Showing 1–8 of 56 attributed orders</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Previous
            </button>
            <button
              style={{
                border: '1px solid #0B4EA2',
                background: '#0B4EA2',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              1
            </button>
            <button
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              2
            </button>
            <button
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Drawer (Matching Reference Screenshot) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Callout Card */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: '10px',
            border: '1px solid #BFDBFE',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Info size={20} color="#1D4ED8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A8A' }}>
              Delivery and settlement are separate checks
            </div>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px', lineHeight: 1.5 }}>
              Commissions transition to 'Approved' only after the return window expires on delivered orders. Cancelled or returned items automatically revert provisional commissions.
            </div>
          </div>
        </div>

        {/* Right Order Actions Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Order actions · {selectedOrder.orderId}
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>^</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              onClick={() => alert(`Showing breakdown for ${selectedOrder.orderId}: Total NPR ${selectedOrder.totalAmount}, Commission NPR ${selectedOrder.commissionAmount}`)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              View order breakdown
            </div>
            <div
              onClick={() => (window.location.href = `/admin/agents/activities`)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Audit attribution ({selectedOrder.attributionMethod})
            </div>
            <div
              onClick={() => (window.location.href = `/admin/agents/commissions`)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Review commission
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAgentOrdersPage;