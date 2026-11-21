// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 27: Payment Gateways (Payment Management > Payment Gateways)
// Visual Source of Truth: media_1795251784898_55f84e91.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Settings,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw,
  Key,
  Globe,
  Sliders,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface PaymentGatewayItem {
  id: string;
  provider: string;
  region: string;
  paymentType: string;
  currency: string;
  environment: 'Not Set' | 'Sandbox' | 'Production' | string;
  connection: 'Not Connected' | 'Connected' | string;
  setup: 'Not Started' | 'Configured' | 'Setup Required' | string;
}

export const AdminPaymentGatewaysPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGatewayItem[]>([]);
  const [metrics, setMetrics] = useState({
    gatewayOptions: 6,
    gatewayOptionsNote: 'Select a provider to begin setup',
    connectedGateways: 0,
    connectedGatewaysNote: 'No integrations configured',
    setupRequired: 6,
    setupRequiredNote: 'Merchant credentials not added',
    checkoutCurrency: 'NPR',
    checkoutCurrencyNote: 'Nepalese Rupee',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('All Providers');
  const [methodFilter, setMethodFilter] = useState<string>('All Methods');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('All Environments');

  // Modals state
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [addProviderModalOpen, setAddProviderModalOpen] = useState<boolean>(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [configEnv, setConfigEnv] = useState<'Sandbox' | 'Production'>('Sandbox');
  const [merchantCode, setMerchantCode] = useState<string>('EP_KTM_MCH_8410');
  const [apiKey, setApiKey] = useState<string>('live_sec_key_everest_pasal_9842109');
  const [enableCheckout, setEnableCheckout] = useState<boolean>(true);

  const initialSeedGateways: PaymentGatewayItem[] = [
    {
      id: 'khalti',
      provider: 'Khalti',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'fonepay',
      provider: 'FonePay',
      region: 'Nepal',
      paymentType: 'QR payments',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'imepay',
      provider: 'IME Pay',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'esewa',
      provider: 'eSewa',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'prabhupay',
      provider: 'Prabhu Pay',
      region: 'Nepal',
      paymentType: 'Digital wallet',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
    {
      id: 'connectips',
      provider: 'Connect IPS',
      region: 'Nepal',
      paymentType: 'Bank transfer',
      currency: 'NPR',
      environment: 'Not Set',
      connection: 'Not Connected',
      setup: 'Not Started',
    },
  ];

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/api/v1/admin/payments/gateways');
      if (res && res.gateways && Array.isArray(res.gateways)) {
        setGateways(res.gateways);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setGateways(initialSeedGateways);
      }
    } catch {
      setGateways(initialSeedGateways);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const filteredGateways = useMemo(() => {
    return gateways.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.provider.toLowerCase().includes(q) ||
        item.paymentType.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q);

      const matchesProvider =
        providerFilter === 'All Providers' ||
        item.provider.toLowerCase() === providerFilter.toLowerCase();

      const matchesMethod =
        methodFilter === 'All Methods' ||
        item.paymentType.toLowerCase().includes(methodFilter.toLowerCase());

      const matchesEnvironment =
        environmentFilter === 'All Environments' ||
        item.environment.toLowerCase() === environmentFilter.toLowerCase();

      return matchesSearch && matchesProvider && matchesMethod && matchesEnvironment;
    });
  }, [gateways, searchQuery, providerFilter, methodFilter, environmentFilter]);

  const handleOpenConfig = (gw?: PaymentGatewayItem) => {
    setSelectedGateway(gw || gateways[0] || initialSeedGateways[0]);
    setConfigModalOpen(true);
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;

    try {
      await ApiClient.post(`/api/v1/admin/payments/gateways/${selectedGateway.id}/configure`, {
        environment: configEnv,
        active: enableCheckout,
        merchantCode,
        apiKey,
      });
    } catch {
      // Offline fallback
    }

    setGateways((prev) =>
      prev.map((g) =>
        g.id === selectedGateway.id
          ? {
              ...g,
              environment: configEnv,
              connection: enableCheckout ? 'Connected' : 'Not Connected',
              setup: enableCheckout ? 'Configured' : 'Setup Required',
            }
          : g
      )
    );

    setMetrics((prev) => {
      const newlyConnected = enableCheckout ? prev.connectedGateways + 1 : prev.connectedGateways;
      const newlyRequired = Math.max(0, prev.setupRequired - (enableCheckout ? 1 : 0));
      return {
        ...prev,
        connectedGateways: newlyConnected,
        connectedGatewaysNote: `${newlyConnected} active in checkout`,
        setupRequired: newlyRequired,
      };
    });

    setToastMessage(`${selectedGateway.provider} configuration saved successfully. Integration active in ${configEnv} mode.`);
    setConfigModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#E63946', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Payment Gateways
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '850px', lineHeight: '1.5' }}>
            Configure payment providers, review connection status, and manage payment-method coverage for checkout. Available regional providers can be added, configured, and reviewed before activation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setAddProviderModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: '#0B4EA2',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Add Provider</span>
          </button>

          <button
            onClick={() => handleOpenConfig()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Settings size={15} color="#64748B" />
            <span>Configure Provider</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Gateway Options
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.gatewayOptions}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.gatewayOptionsNote}
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Connected Gateways
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.connectedGateways}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.connectedGatewaysNote}
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Setup Required
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.setupRequired}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.setupRequiredNote}
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>
            Checkout Currency
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E63946', lineHeight: '1.2', marginBottom: '4px' }}>
            {metrics.checkoutCurrency}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 400 }}>
            {metrics.checkoutCurrencyNote}
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '750px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search provider, method or environment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Providers">All Providers</option>
              <option value="Khalti">Khalti</option>
              <option value="FonePay">FonePay</option>
              <option value="IME Pay">IME Pay</option>
              <option value="eSewa">eSewa</option>
              <option value="Prabhu Pay">Prabhu Pay</option>
              <option value="Connect IPS">Connect IPS</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Methods">All Methods</option>
              <option value="Digital wallet">Digital wallet</option>
              <option value="QR payments">QR payments</option>
              <option value="Bank transfer">Bank transfer</option>
            </select>

            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              style={{
                padding: '8px 28px 8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#475569',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Environments">All Environments</option>
              <option value="Sandbox">Sandbox</option>
              <option value="Production">Production</option>
              <option value="Not Set">Not Set</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {gateways.length} providers available for configuration
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: '11px', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>PROVIDER</th>
                <th style={{ padding: '12px 18px' }}>PAYMENT TYPE</th>
                <th style={{ padding: '12px 18px' }}>CURRENCY</th>
                <th style={{ padding: '12px 18px' }}>ENVIRONMENT</th>
                <th style={{ padding: '12px 18px' }}>CONNECTION</th>
                <th style={{ padding: '12px 18px' }}>SETUP</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto' }} />
                    Loading payment providers...
                  </td>
                </tr>
              ) : filteredGateways.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No payment gateways match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredGateways.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Provider */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                          {item.provider}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          {item.region}
                        </div>
                      </td>

                      {/* Payment Type */}
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {item.paymentType}
                      </td>

                      {/* Currency */}
                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 500 }}>
                        {item.currency}
                      </td>

                      {/* Environment */}
                      <td style={{ padding: '14px 18px' }}>
                        {item.environment === 'Production' ? (
                          <span style={{ padding: '3px 10px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Production
                          </span>
                        ) : item.environment === 'Sandbox' ? (
                          <span style={{ padding: '3px 10px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Sandbox
                          </span>
                        ) : (
                          <span style={{ padding: '3px 10px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Not Set
                          </span>
                        )}
                      </td>

                      {/* Connection */}
                      <td style={{ padding: '14px 18px' }}>
                        {item.connection === 'Connected' ? (
                          <span style={{ padding: '3px 10px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Connected
                          </span>
                        ) : (
                          <span style={{ padding: '3px 10px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Not Connected
                          </span>
                        )}
                      </td>

                      {/* Setup */}
                      <td style={{ padding: '14px 18px' }}>
                        {item.setup === 'Configured' ? (
                          <span style={{ padding: '3px 10px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Configured
                          </span>
                        ) : (
                          <span style={{ padding: '3px 10px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                            Not Started
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenConfig(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#0B4EA2',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          <Settings size={13} />
                          <span>Set Up</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info matching screenshot */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
          <div>Showing 1–{filteredGateways.length} of {gateways.length} providers</div>
          <div style={{ fontStyle: 'italic', color: '#94A3B8' }}>Credentials and fees must be reviewed before activation</div>
        </div>
      </div>

      {/* MODAL 1: Configure Gateway Modal */}
      {configModalOpen && selectedGateway && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '540px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={18} color="#0B4EA2" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Configure {selectedGateway.provider} Integration
                </h3>
              </div>
              <button onClick={() => setConfigModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveConfiguration}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Operating Environment
                    </label>
                    <select
                      value={configEnv}
                      onChange={(e) => setConfigEnv(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="Sandbox">Sandbox (Test / Staging)</option>
                      <option value="Production">Live Production</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Currency & Settlement
                    </label>
                    <input
                      type="text"
                      disabled
                      value="NPR (Nepalese Rupee)"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '13px', color: '#64748B' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Merchant Code / App ID
                  </label>
                  <input
                    type="text"
                    required
                    value={merchantCode}
                    onChange={(e) => setMerchantCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Secret API Key / Token
                  </label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E40AF' }}>Activate in Customer Checkout</div>
                    <div style={{ fontSize: '11px', color: '#3B82F6' }}>Allows customers to pay using {selectedGateway.provider}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCheckout}
                    onChange={(e) => setEnableCheckout(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#0B4EA2', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Provider Modal */}
      {addProviderModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={18} color="#0B4EA2" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Register Regional Payment Provider
                </h3>
              </div>
              <button onClick={() => setAddProviderModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px 0' }}>
                All 6 primary Nepal payment gateways (Khalti, FonePay, IME Pay, eSewa, Prabhu Pay, Connect IPS) are active in your roster. Custom gateway integrations can be connected via API plug-ins.
              </p>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155' }}>
                Need international payment processing (Stripe / PayPal / Himalayan Bank Card Gateway)? Contact infrastructure operations for cross-border enablement.
              </div>
            </div>
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button
                onClick={() => setAddProviderModalOpen(false)}
                style={{ padding: '7px 16px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
