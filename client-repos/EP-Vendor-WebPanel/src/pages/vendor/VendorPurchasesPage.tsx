import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client';
import { Skeleton, SkeletonTable } from '../../components/Common/Skeleton.js';
import { Printer, FileDown, Download } from 'lucide-react';
import { exportToPdf, exportToCsv } from '../../utils/documentExport.js';

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplier: string;
  supplierContact?: string;
  date: string;
  itemsCount: number;
  primaryItem?: string;
  sku?: string;
  unitCost?: number;
  amount: number;
  formattedAmount: string;
  status: string;
  payment: string;
  notes?: string;
}

export const VendorPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseOrderItem[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalPurchases: 0,
    totalPurchasesFormatted: 'NPR 0',
    totalPaid: 0,
    totalPaidFormatted: 'NPR 0',
    accountsPayable: 0,
    accountsPayableFormatted: 'NPR 0',
    totalOrdersCount: 0,
    settledCount: 0,
    pendingCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseOrderItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newPoForm, setNewPoForm] = useState({
    supplier: '',
    supplierContact: '+977 9851000000',
    primaryItem: '',
    sku: '',
    itemsCount: '10',
    amount: '',
    status: 'Ordered',
    payment: 'Pending',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPurchases = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (paymentFilter !== 'ALL') params.set('paymentStatus', paymentFilter);

    ApiClient.get<any>(`/api/v1/vendor/purchases?${params.toString()}`)
      .then((res: any) => {
        const payload = res?.purchases ? res : res?.data ?? res;
        if (payload) {
          setPurchases(Array.isArray(payload.purchases) ? payload.purchases : []);
          if (payload.kpis) {
            setKpis(payload.kpis);
          }
        }
      })
      .catch((err) => {
        console.warn('[Purchases] Failed to fetch purchases:', err?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPurchases();
  }, [search, statusFilter, paymentFilter]);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoForm.supplier.trim() || !newPoForm.amount) {
      showToast('Please enter supplier name and total amount.');
      return;
    }

    ApiClient.post<any>('/api/v1/vendor/purchases', {
      supplier: newPoForm.supplier.trim(),
      supplierContact: newPoForm.supplierContact.trim(),
      primaryItem: newPoForm.primaryItem.trim() || 'Inventory Stock Batch',
      sku: newPoForm.sku.trim(),
      itemsCount: Number(newPoForm.itemsCount || 1),
      amount: Number(newPoForm.amount || 0),
      status: newPoForm.status,
      payment: newPoForm.payment,
      notes: newPoForm.notes.trim(),
    })
      .then(() => {
        setShowCreateModal(false);
        setNewPoForm({
          supplier: '',
          supplierContact: '+977 9851000000',
          primaryItem: '',
          sku: '',
          itemsCount: '10',
          amount: '',
          status: 'Ordered',
          payment: 'Pending',
          notes: '',
        });
        showToast('Purchase Order created and added to procurement ledger.');
        fetchPurchases();
      })
      .catch((err: any) => {
        showToast(err?.message || 'Failed to create purchase order');
      });
  };

  const handleUpdatePurchase = (id: string, updates: { status?: string; payment?: string }) => {
    ApiClient.patch<any>(`/api/v1/vendor/purchases/${encodeURIComponent(id)}`, updates)
      .then(() => {
        showToast(`Updated ${id} successfully.`);
        fetchPurchases();
        if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice({ ...selectedInvoice, ...updates });
        }
      })
      .catch((err: any) => {
        showToast(err?.message || 'Failed to update purchase order');
      });
  };

  if (isLoading && purchases.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="260px" height="32px" />
          <Skeleton width="200px" height="40px" borderRadius="8px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Skeleton width="50%" height="14px" />
              <Skeleton width="80%" height="28px" style={{ marginTop: '8px' }} />
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} columns={7} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#0F172A' }}>
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
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Purchases & Supplier Invoices
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Track raw material procurement, supplier purchase orders, and wholesale inventory restocking.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#1A56DB',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
          }}
        >
          + Create Purchase Order
        </button>
      </div>

      {/* 3 Dynamic KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            TOTAL PURCHASES ({kpis.totalOrdersCount} POs)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
            {kpis.totalPurchasesFormatted || `NPR ${Number(kpis.totalPurchases || 0).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Across {kpis.totalOrdersCount} active purchase orders
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            TOTAL PAID
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A', marginTop: '8px' }}>
            {kpis.totalPaidFormatted || `NPR ${Number(kpis.totalPaid || 0).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px' }}>
            {kpis.settledCount} settled supplier invoices
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            ACCOUNTS PAYABLE
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '8px' }}>
            {kpis.accountsPayableFormatted || `NPR ${Number(kpis.accountsPayable || 0).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            {kpis.pendingCount} pending supplier settlement(s)
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search PO number, supplier, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              width: '260px',
              outline: 'none',
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="Received">Received</option>
            <option value="In Transit">In Transit</option>
            <option value="Ordered">Ordered</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          Showing {purchases.length} purchase order(s)
        </span>
      </div>

      {/* Purchase Orders Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 20px' }}>PO Number</th>
              <th style={{ padding: '14px 16px' }}>Supplier & Item</th>
              <th style={{ padding: '14px 16px' }}>Order Date</th>
              <th style={{ padding: '14px 16px' }}>Units</th>
              <th style={{ padding: '14px 16px' }}>Total Amount</th>
              <th style={{ padding: '14px 16px' }}>Delivery Status</th>
              <th style={{ padding: '14px 16px' }}>Payment</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                  No purchase orders found matching your criteria.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1A56DB' }}>{p.poNumber || p.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.supplier}</div>
                    {p.primaryItem && (
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        {p.primaryItem} {p.sku ? `(${p.sku})` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748B' }}>{p.date}</td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>{p.itemsCount} units</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0F172A' }}>
                    {p.formattedAmount || `NPR ${Number(p.amount || 0).toLocaleString()}`}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        backgroundColor: p.status === 'Received' ? '#DCFCE7' : '#DBEAFE',
                        color: p.status === 'Received' ? '#166534' : '#1E40AF',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        backgroundColor: p.payment === 'Paid' ? '#F0FDF4' : '#FEF3C7',
                        color: p.payment === 'Paid' ? '#15803D' : '#B45309',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {p.payment}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {p.status !== 'Received' && (
                        <button
                          onClick={() => handleUpdatePurchase(p.id, { status: 'Received' })}
                          style={{
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            color: '#047857',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Received
                        </button>
                      )}
                      {p.payment !== 'Paid' && (
                        <button
                          onClick={() => handleUpdatePurchase(p.id, { payment: 'Paid' })}
                          style={{
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #CBD5E1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#0F172A',
                        }}
                      >
                        View Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <form
            onSubmit={handleCreatePurchase}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Create Purchase Order
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Himalayan Wholesale Distributors"
                  value={newPoForm.supplier}
                  onChange={(e) => setNewPoForm({ ...newPoForm, supplier: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Primary Product / Item</label>
                  <input
                    type="text"
                    placeholder="e.g., Smart TV 43-inch Batch"
                    value={newPoForm.primaryItem}
                    onChange={(e) => setNewPoForm({ ...newPoForm, primaryItem: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g., EP-TV-43"
                    value={newPoForm.sku}
                    onChange={(e) => setNewPoForm({ ...newPoForm, sku: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPoForm.itemsCount}
                    onChange={(e) => setNewPoForm({ ...newPoForm, itemsCount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Total Amount (NPR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g., 85000"
                    value={newPoForm.amount}
                    onChange={(e) => setNewPoForm({ ...newPoForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Delivery Status</label>
                  <select
                    value={newPoForm.status}
                    onChange={(e) => setNewPoForm({ ...newPoForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Ordered">Ordered</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payment Status</label>
                  <select
                    value={newPoForm.payment}
                    onChange={(e) => setNewPoForm({ ...newPoForm, payment: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Supplier Invoice · {selectedInvoice.poNumber || selectedInvoice.id}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748B' }}>Issued on {selectedInvoice.date}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Supplier</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedInvoice.supplier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Item Description</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedInvoice.primaryItem || 'Wholesale Inventory'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Quantity</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedInvoice.itemsCount} units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Delivery Status</span>
                <span style={{ fontWeight: 700, color: '#1A56DB' }}>{selectedInvoice.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payment Status</span>
                <span style={{ fontWeight: 700, color: selectedInvoice.payment === 'Paid' ? '#16A34A' : '#D97706' }}>{selectedInvoice.payment}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '15px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Total Invoice Amount</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                  {selectedInvoice.formattedAmount || `NPR ${Number(selectedInvoice.amount || 0).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const poNum = selectedInvoice.poNumber || selectedInvoice.id;
                  exportToPdf({
                    filename: `Purchase_Invoice_${poNum}.pdf`,
                    title: `PURCHASE ORDER & TAX INVOICE - ${poNum}`,
                    subtitle: 'Everest Pasal Merchant Procurement & Supplier Settlement Voucher',
                    metadata: {
                      'PO Number': poNum,
                      'Supplier': selectedInvoice.supplier,
                      'Supplier Contact': selectedInvoice.supplierContact || 'Kathmandu, Nepal',
                      'Invoice Date': selectedInvoice.date,
                      'Payment Status': selectedInvoice.payment,
                      'Fulfillment Status': selectedInvoice.status,
                    },
                    headers: ['Item Description', 'SKU', 'Quantity', 'Unit Cost (NPR)', 'Line Total (NPR)'],
                    rows: [
                      [
                        selectedInvoice.primaryItem || 'Procurement Line Items',
                        selectedInvoice.sku || 'SKU-GEN',
                        String(selectedInvoice.itemsCount || 1),
                        (selectedInvoice.unitCost || selectedInvoice.amount).toLocaleString(),
                        selectedInvoice.amount.toLocaleString(),
                      ],
                    ],
                    totals: [
                      { label: 'Subtotal', value: selectedInvoice.formattedAmount || `NPR ${selectedInvoice.amount.toLocaleString()}` },
                      { label: 'Total Payable', value: selectedInvoice.formattedAmount || `NPR ${selectedInvoice.amount.toLocaleString()}` },
                    ],
                    footerNotes: [
                      'Official purchase invoice for inventory procurement and TDS accounting.',
                      'Verified by Everest Pasal Merchant Operations Unit.',
                    ],
                    branding: {
                      storeName: 'Manish Electronics Pvt. Ltd.',
                      vatPan: '609821435',
                      address: 'New Road, Kathmandu, Bagmati Province, Nepal',
                    },
                  });
                  showToast(`Downloaded PDF invoice for ${poNum}`);
                  setSelectedInvoice(null);
                }}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileDown size={15} /> Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
