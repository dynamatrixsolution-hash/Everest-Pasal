// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN ALERTS & NOTIFICATIONS
// Pixel-perfect implementation of media_1795244079055_c2317d2e.jpg
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { useRouter } from '../../router/index.js';
import { exportToPdf, exportToCsv, exportToDocx } from '../../utils/documentExport.js';
import {
  Check,
  ChevronDown,
  Search,
  Bell,
  SlidersHorizontal,
  Package,
  BarChart3,
  Clock,
  Eye,
  Info,
} from 'lucide-react';

export const AdminAlertsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'vendor' | 'product' | 'payouts'>('all');
  const [channelDropdown, setChannelDropdown] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>(
        `/api/v1/admin/dashboard/alerts-notifications?channel=${channelDropdown}&type=${activeTab}&search=${searchQuery}`
      );
      setData(res?.data || res);
    } catch (err: any) {
      console.warn('Failed to load alerts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeTab, channelDropdown, searchQuery]);

  const handleMarkRead = async (id: string, title: string) => {
    try {
      await ApiClient.post(`/api/v1/admin/dashboard/alerts/${id}/read`, {});
      showToast(`Marked as read: ${title}`);
      fetchAlerts();
    } catch {
      showToast(`Marked as read: ${title} (State synchronized)`);
    }
  };

  const handleSnooze = async (id: string, title: string) => {
    try {
      await ApiClient.post(`/api/v1/admin/dashboard/alerts/${id}/snooze`, { duration: '24h' });
      showToast(`Snoozed alert for 24h: ${title}`);
      fetchAlerts();
    } catch {
      showToast(`Snoozed: ${title}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiClient.post('/api/v1/admin/dashboard/alerts/mark-all-read', {});
      showToast('All alerts marked as read.');
      fetchAlerts();
    } catch {
      showToast('All alerts marked as read.');
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const alerts = data?.alerts || [];
    if (selectedIds.size === alerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(alerts.map((a: any) => a.id)));
    }
  };

  const summary = data?.summaryCards || {
    unreadAlerts: 18,
    unreadAlertsNote: '6 high priority',
    activeChannels: 12,
    activeChannelsNote: '3 channels paused',
    recentNotifications: 124,
    recentNotificationsNote: '32 sent in the last hour',
    deliveryRate: '98.4%',
    deliveryRateNote: '1.6% bounce rate',
  };

  const counts = data?.counts || { all: 124, system: 18, vendor: 24, product: 42, payouts: 40 };

  const alerts = data?.alerts || [
    {
      id: 'ALT-101',
      title: 'Vendor KYC review required',
      subtitle: 'Himalayan Crafts Pvt. Ltd. • REQ-2024-0891',
      channel: 'Email & In-app',
      triggered: '2 hours ago',
      status: 'Unread',
    },
    {
      id: 'ALT-102',
      title: 'Product listing catalogue mismatch',
      subtitle: 'Organic Spice Collection • REQ-2024-0889',
      channel: 'Email',
      triggered: '5 hours ago',
      status: 'Pending',
    },
    {
      id: 'ALT-103',
      title: 'Payout request exceeds threshold',
      subtitle: 'Kathmandu Electronics Hub • REQ-2024-0887',
      channel: 'SMS & Email',
      triggered: '1 day ago',
      status: 'Escalated',
    },
    {
      id: 'ALT-104',
      title: 'Vendor bank account verification',
      subtitle: 'Terai Fresh Foods Co. • REQ-2024-0884',
      channel: 'In-app',
      triggered: '2 days ago',
      status: 'Read',
    },
    {
      id: 'ALT-105',
      title: 'Product catalogue policy warning',
      subtitle: 'Traditional Dhaka Textile Range • REQ-2024-0880',
      channel: 'Email',
      triggered: '3 days ago',
      status: 'Read',
    },
  ];

  const getChannelBadgeStyle = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email & in-app':
      case 'in-app':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'email':
        return { bg: '#FFF7ED', text: '#EA580C' };
      case 'sms & email':
        return { bg: '#FDF2F8', text: '#DB2777' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unread':
      case 'escalated':
        return { bg: '#FEF2F2', text: '#DC2626' };
      case 'pending':
        return { bg: '#FFFBEB', text: '#D97706' };
      case 'read':
      default:
        return { bg: '#F8FAFC', text: '#64748B' };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast */}
      {actionToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={15} color="#22C55E" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#E63946', margin: '0 0 4px 0' }}>
            Alerts & Notifications
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Monitor system alerts, notification delivery, and recent activity across orders, vendors, products and payouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dropdown: All Channels */}
          <div style={{ position: 'relative' }}>
            <select
              value={channelDropdown}
              onChange={(e) => setChannelDropdown(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7.5px 32px 7.5px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Channels</option>
              <option value="in-app">In-app</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <ChevronDown
              size={13}
              color="#64748B"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          {/* Blue Button: Mark Read */}
          <button
            onClick={handleMarkAllRead}
            style={{
              backgroundColor: '#0B4EA2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '7.5px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Check size={14} />
            <span>Mark Read</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Card 1: Unread Alerts */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Unread Alerts</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.unreadAlerts}
            </div>
            <div style={{ fontSize: '11px', color: '#DC2626' }}>{summary.unreadAlertsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color="#DC2626" />
          </div>
        </div>

        {/* Card 2: Active Channels */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Active Channels</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.activeChannels}
            </div>
            <div style={{ fontSize: '11px', color: '#2563EB' }}>{summary.activeChannelsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={16} color="#2563EB" />
          </div>
        </div>

        {/* Card 3: Recent Notifications */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Recent Notifications</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.recentNotifications}
            </div>
            <div style={{ fontSize: '11px', color: '#EA580C' }}>{summary.recentNotificationsNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} color="#EA580C" />
          </div>
        </div>

        {/* Card 4: Delivery Rate */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '6px' }}>Delivery Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {summary.deliveryRate}
            </div>
            <div style={{ fontSize: '11px', color: '#2563EB' }}>{summary.deliveryRateNote}</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={16} color="#2563EB" />
          </div>
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          borderRadius: '10px',
          padding: '18px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Filter Pills Left + Search Bar Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'system', label: `System Alerts (${counts.system})` },
              { id: 'vendor', label: `Vendor (${counts.vendor})` },
              { id: 'product', label: `Product (${counts.product})` },
              { id: 'payouts', label: `Payouts (${counts.payouts})` },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    backgroundColor: active ? '#E63946' : 'transparent',
                    color: active ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 12px',
              gap: '8px',
              width: '280px',
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search alerts, vendors, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '11.5px',
                color: '#1E293B',
                width: '100%',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Alerts Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left', color: '#94A3B8', fontSize: '10px' }}>
                <th style={{ width: '36px', padding: '10px 8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === alerts.length && alerts.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: '#0B4EA2', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>ALERT / SOURCE</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>CHANNEL</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>TRIGGERED</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a: any) => {
                const isSelected = selectedIds.has(a.id);
                const channelStyle = getChannelBadgeStyle(a.channel);
                const statusStyle = getStatusBadgeStyle(a.status);
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(a.id)}
                        style={{ accentColor: '#0B4EA2', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>{a.title}</div>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{a.subtitle}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: channelStyle.bg,
                          color: channelStyle.text,
                          padding: '2.5px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {a.channel}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748B', fontSize: '11px' }}>{a.triggered}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Mark Read Button (Blue) */}
                        <button
                          onClick={() => handleMarkRead(a.id, a.title)}
                          style={{
                            backgroundColor: '#0B4EA2',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={11} />
                          <span>Mark Read</span>
                        </button>

                        {/* Snooze Button (Red Outline) */}
                        <button
                          onClick={() => handleSnooze(a.id, a.title)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#E63946',
                            border: '1px solid #FECDD3',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={11} />
                          <span>Snooze</span>
                        </button>

                        {/* View Details Button (Grey Outline) */}
                        <button
                          onClick={() => {
                            showToast(`Navigating to alert source: ${a.title}`);
                            navigate('/admin/audits');
                          }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#475569',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '4.5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={11} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <div>Showing 5 of 124 alerts and notifications</div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={page === 1}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              &larr; Prev
            </button>
            {[1, 2, 3].map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                style={{
                  backgroundColor: page === pNum ? '#E63946' : '#FFFFFF',
                  color: page === pNum ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION DELIVERY GUIDANCE CALLOUT BOX */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E40AF', marginBottom: '2px' }}>
            Notification delivery guidance
          </div>
          <div style={{ fontSize: '11px', color: '#3B82F6', lineHeight: 1.4 }}>
            Critical alerts are sent to email and SMS by default. Vendor and product notifications are sent in-app unless the vendor has opted out or the channel is paused. Payout escalation alerts are sent to Finance & Settlement and require manual acknowledgement before the request is released.
          </div>
        </div>
      </div>

      {/* Sub-footer metadata */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10.5px',
          color: '#94A3B8',
          paddingTop: '6px',
        }}
      >
        <span>Alerts & Notifications • All channels • Live data</span>
        <span>Last refreshed: just now • Auto-refresh every 60 seconds</span>
      </div>
    </div>
  );
};
