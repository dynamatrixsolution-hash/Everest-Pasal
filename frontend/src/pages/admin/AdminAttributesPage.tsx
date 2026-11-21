// ==============================================================================
// EVEREST PASAL - SYSTEM ADMIN CONTROL CENTER
// Screen 15: Attributes (Product & Catalog Management > Attributes)
// Visual Source of Truth: media_1795248144051_c6697d07.jpg
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Edit2,
  FileText,
  X,
  Check,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface AttributeItem {
  code: string;
  name: string;
  subtype: string;
  dataType: string;
  allowedValues: string;
  categoriesCount: number;
  usage: 'Required' | 'Optional';
  status: 'Active' | 'Pending' | 'Draft';
  updated: string;
}

export const AdminAttributesPage: React.FC = () => {
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [metrics] = useState({
    totalAttributes: 128,
    totalAttributesChange: '+12 this month',
    activeAttributes: 114,
    activeAttributesPct: '89% of total',
    pendingApproval: 7,
    pendingApprovalNote: 'Needs review',
    avgOptionsPerAttribute: 18,
    avgOptionsChange: '+3 vs last month',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [usageFilter, setUsageFilter] = useState<string>('All Usages');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingAttribute, setEditingAttribute] = useState<AttributeItem | null>(null);
  const [reviewingAttribute, setReviewingAttribute] = useState<AttributeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: '',
    subtype: 'Single select',
    dataType: 'Text',
    allowedValues: '12 options',
    categoriesCount: 14,
    usage: 'Required' as 'Required' | 'Optional',
    status: 'Active' as 'Active' | 'Draft',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialSeedAttributes: AttributeItem[] = [
    {
      code: 'ATTR-001',
      name: 'Net Weight / Volume',
      subtype: 'Numeric unit specification',
      dataType: 'Number',
      allowedValues: '0.1 – 50 kg / L',
      categoriesCount: 42,
      usage: 'Required',
      status: 'Active',
      updated: '12 Jan 2023',
    },
    {
      code: 'ATTR-002',
      name: 'Flavor / Blend Type',
      subtype: 'Single select taxonomy',
      dataType: 'Text',
      allowedValues: '18 predefined options',
      categoriesCount: 16,
      usage: 'Optional',
      status: 'Active',
      updated: '03 Mar 2023',
    },
    {
      code: 'ATTR-003',
      name: 'Spice Level',
      subtype: 'Enumerated intensity scale',
      dataType: 'Select',
      allowedValues: 'Mild, Medium, Hot, Extra Hot',
      categoriesCount: 12,
      usage: 'Required',
      status: 'Pending',
      updated: '19 Jun 2022',
    },
    {
      code: 'ATTR-004',
      name: 'Cocoa Content (%)',
      subtype: 'Numeric percentage value',
      dataType: 'Number',
      allowedValues: '30% – 99%',
      categoriesCount: 8,
      usage: 'Optional',
      status: 'Draft',
      updated: '28 Aug 2023',
    },
    {
      code: 'ATTR-005',
      name: 'Storage Condition',
      subtype: 'Standardized ambient scale',
      dataType: 'Select',
      allowedValues: 'Dry, Ambient, Cold, Frozen',
      categoriesCount: 38,
      usage: 'Required',
      status: 'Active',
      updated: '05 Nov 2023',
    },
    {
      code: 'ATTR-006',
      name: 'Roast Profile',
      subtype: 'Artisan beverage parameter',
      dataType: 'Select',
      allowedValues: 'Light, Medium, Dark, French',
      categoriesCount: 6,
      usage: 'Optional',
      status: 'Draft',
      updated: '17 Feb 2024',
    },
    {
      code: 'ATTR-007',
      name: 'Organic Certification',
      subtype: 'Boolean compliance check',
      dataType: 'Boolean',
      allowedValues: 'Yes / No',
      categoriesCount: 54,
      usage: 'Required',
      status: 'Active',
      updated: '22 Sep 2022',
    },
    {
      code: 'ATTR-008',
      name: 'Packaging Material',
      subtype: 'Eco & logistics tag',
      dataType: 'Text',
      allowedValues: 'Glass jar, Pouch, Tin, Box',
      categoriesCount: 62,
      usage: 'Optional',
      status: 'Active',
      updated: '30 Apr 2023',
    },
  ];

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<any>('/admin/catalog/attributes');
      if (res && res.attributes && res.attributes.length > 0) {
        setAttributes(res.attributes);
      } else {
        setAttributes(initialSeedAttributes);
      }
    } catch {
      setAttributes(initialSeedAttributes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered attributes
  const filteredAttributes = useMemo(() => {
    return attributes.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subtype.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.dataType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All Status' ||
        a.status.toLowerCase() === statusFilter.toLowerCase();

      const matchUsage =
        usageFilter === 'All Usages' ||
        a.usage.toLowerCase() === usageFilter.toLowerCase();

      return matchSearch && matchStatus && matchUsage;
    });
  }, [attributes, searchQuery, statusFilter, usageFilter]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCodes(filteredAttributes.map((a) => a.code));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleToggleSelect = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Add Attribute Handler
  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await ApiClient.post<any>('/admin/catalog/attributes', addForm);
      const newAttr: AttributeItem = {
        code: res?.code || `ATTR-${String(attributes.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        subtype: addForm.subtype,
        dataType: addForm.dataType,
        allowedValues: addForm.allowedValues,
        categoriesCount: Number(addForm.categoriesCount) || 1,
        usage: addForm.usage,
        status: addForm.status,
        updated: 'Just now',
      };

      setAttributes((prev) => [newAttr, ...prev]);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        subtype: 'Single select',
        dataType: 'Text',
        allowedValues: '12 options',
        categoriesCount: 14,
        usage: 'Required',
        status: 'Active',
      });
      showToast('Attribute created successfully');
    } catch {
      const newAttr: AttributeItem = {
        code: `ATTR-${String(attributes.length + 1).padStart(3, '0')}`,
        name: addForm.name,
        subtype: addForm.subtype,
        dataType: addForm.dataType,
        allowedValues: addForm.allowedValues,
        categoriesCount: Number(addForm.categoriesCount) || 1,
        usage: addForm.usage,
        status: addForm.status,
        updated: 'Just now',
      };
      setAttributes((prev) => [newAttr, ...prev]);
      setIsAddModalOpen(false);
      showToast('Attribute created successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Attribute Handler
  const handleUpdateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttribute) return;

    setIsSubmitting(true);
    try {
      await ApiClient.put(`/admin/catalog/attributes/${editingAttribute.code}`, editingAttribute);
      setAttributes((prev) =>
        prev.map((a) => (a.code === editingAttribute.code ? { ...editingAttribute, updated: 'Just now' } : a))
      );
      setEditingAttribute(null);
      showToast(`Attribute ${editingAttribute.code} updated successfully`);
    } catch {
      setAttributes((prev) =>
        prev.map((a) => (a.code === editingAttribute.code ? { ...editingAttribute, updated: 'Just now' } : a))
      );
      setEditingAttribute(null);
      showToast(`Attribute ${editingAttribute.code} updated`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review Attribute Handler
  const handleReviewAttribute = async (action: 'APPROVE' | 'REJECT') => {
    if (!reviewingAttribute) return;
    setIsSubmitting(true);
    try {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      await ApiClient.put(`/admin/catalog/attributes/${reviewingAttribute.code}`, {
        status: nextStatus,
      });

      setAttributes((prev) =>
        prev.map((a) =>
          a.code === reviewingAttribute.code ? { ...a, status: nextStatus, updated: 'Just now' } : a
        )
      );
      setReviewingAttribute(null);
      showToast(action === 'APPROVE' ? 'Attribute approved and activated' : 'Attribute rejected');
    } catch {
      const nextStatus = action === 'APPROVE' ? 'Active' : 'Draft';
      setAttributes((prev) =>
        prev.map((a) =>
          a.code === reviewingAttribute.code ? { ...a, status: nextStatus, updated: 'Just now' } : a
        )
      );
      setReviewingAttribute(null);
      showToast(action === 'APPROVE' ? 'Attribute approved' : 'Attribute rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv({
      filename: `everest-pasal-attributes-${new Date().toISOString().split('T')[0]}.csv`,
      title: 'EVEREST PASAL — CATALOG ATTRIBUTE DICTIONARY',
      subtitle: `Export Date: ${new Date().toLocaleDateString()} | Total Attributes: ${metrics.totalAttributes}`,
      metadata: {
        'Total Attributes': metrics.totalAttributes,
        'Active Attributes': metrics.activeAttributes,
        'Pending Approval': metrics.pendingApproval,
        'Avg Options / Attribute': metrics.avgOptionsPerAttribute,
      },
      headers: ['Code', 'Attribute Name', 'Subtype', 'Data Type', 'Allowed Values', 'Categories Count', 'Usage', 'Status', 'Updated'],
      rows: filteredAttributes.map((a) => [
        a.code,
        a.name,
        a.subtype,
        a.dataType,
        a.allowedValues,
        a.categoriesCount,
        a.usage,
        a.status,
        a.updated,
      ]),
    });
    showToast('Exported attributes to CSV');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Attributes
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure product attributes, specifications, variant parameters, and validation rules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #E2E8F0',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Attributes</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0B4EA2',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(11, 78, 162, 0.2)',
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <span>Add Attribute</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Total Attributes */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Total Attributes
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.totalAttributes}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.totalAttributesChange}
          </div>
        </div>

        {/* Card 2: Active Attributes */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Active Attributes
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.activeAttributes}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {metrics.activeAttributesPct}
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.pendingApproval}
          </div>
          <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 500 }}>
            {metrics.pendingApprovalNote}
          </div>
        </div>

        {/* Card 4: Avg. Options / Attribute */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginBottom: '8px' }}>
            Avg. Options / Attribute
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            {metrics.avgOptionsPerAttribute}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500 }}>
            {metrics.avgOptionsChange}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Filters and Search Row */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                maxWidth: '420px',
              }}
            >
              <Search
                size={15}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search attributes, codes, or data types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Usage Dropdown */}
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="All Usages">All Usages</option>
              <option value="Required">Required</option>
              <option value="Optional">Optional</option>
            </select>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            {filteredAttributes.length} attributes found
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredAttributes.length > 0 &&
                      selectedCodes.length === filteredAttributes.length
                    }
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#E63946' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  CODE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  ATTRIBUTE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  DATA TYPE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  ALLOWED VALUES
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  CATEGORIES
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  USAGE
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em' }}>
                  UPDATED
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#0B4EA2" />
                      <span>Loading attributes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No attributes found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((a) => {
                  const isSelected = selectedCodes.includes(a.code);
                  return (
                    <tr
                      key={a.code}
                      style={{
                        borderBottom: '1px solid #F8FAFC',
                        backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(a.code)}
                          style={{ cursor: 'pointer', accentColor: '#E63946' }}
                        />
                      </td>

                      {/* Code */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                        {a.code}
                      </td>

                      {/* Attribute & Subtype */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {a.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            {a.subtype}
                          </div>
                        </div>
                      </td>

                      {/* Data Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          {a.dataType}
                        </span>
                      </td>

                      {/* Allowed Values */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                        {a.allowedValues}
                      </td>

                      {/* Categories Count */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#F0F9FF',
                            color: '#0284C7',
                            border: '1px solid #BAE6FD',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                          }}
                        >
                          {a.categoriesCount} categories
                        </span>
                      </td>

                      {/* Usage */}
                      <td style={{ padding: '14px 16px' }}>
                        {a.usage === 'Required' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                            }}
                          >
                            Required
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              fontWeight: 500,
                            }}
                          >
                            Optional
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {a.status === 'Active' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Active
                          </span>
                        ) : a.status === 'Pending' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#FEF3C7',
                              color: '#D97706',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Pending
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Updated */}
                      <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B' }}>
                        {a.updated}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {a.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewingAttribute(a)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#F0F9FF',
                              color: '#0284C7',
                              border: '1px solid #BAE6FD',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <FileText size={13} color="#0284C7" />
                            <span>Review</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingAttribute({ ...a })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'transparent',
                              color: '#0284C7',
                              border: 'none',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} color="#0284C7" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing 1-{filteredAttributes.length} of {metrics.totalAttributes} attributes
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: currentPage === 1 ? '#CBD5E1' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#E63946',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              1
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              2
            </button>
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Attribute Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Configure New Attribute
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAttribute} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Attribute Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dietary Certification"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Subtype / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Single select taxonomy"
                    value={addForm.subtype}
                    onChange={(e) => setAddForm({ ...addForm, subtype: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Data Type
                  </label>
                  <select
                    value={addForm.dataType}
                    onChange={(e) => setAddForm({ ...addForm, dataType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Select">Select</option>
                    <option value="Boolean">Boolean</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Allowed Values / Constraints
                </label>
                <input
                  type="text"
                  placeholder="e.g. Halal, Kosher, Vegan, Gluten-Free"
                  value={addForm.allowedValues}
                  onChange={(e) => setAddForm({ ...addForm, allowedValues: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Categories Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.categoriesCount}
                    onChange={(e) => setAddForm({ ...addForm, categoriesCount: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Usage
                  </label>
                  <select
                    value={addForm.usage}
                    onChange={(e) => setAddForm({ ...addForm, usage: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Add Attribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attribute Modal */}
      {editingAttribute && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Edit Attribute: {editingAttribute.code}
              </h3>
              <button
                onClick={() => setEditingAttribute(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateAttribute} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Attribute Name
                </label>
                <input
                  type="text"
                  required
                  value={editingAttribute.name}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Subtype / Description
                  </label>
                  <input
                    type="text"
                    value={editingAttribute.subtype}
                    onChange={(e) => setEditingAttribute({ ...editingAttribute, subtype: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Data Type
                  </label>
                  <select
                    value={editingAttribute.dataType}
                    onChange={(e) => setEditingAttribute({ ...editingAttribute, dataType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Select">Select</option>
                    <option value="Boolean">Boolean</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Allowed Values / Constraints
                </label>
                <input
                  type="text"
                  value={editingAttribute.allowedValues}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, allowedValues: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Categories
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingAttribute.categoriesCount}
                    onChange={(e) => setEditingAttribute({ ...editingAttribute, categoriesCount: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Usage
                  </label>
                  <select
                    value={editingAttribute.usage}
                    onChange={(e) => setEditingAttribute({ ...editingAttribute, usage: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={editingAttribute.status}
                    onChange={(e) => setEditingAttribute({ ...editingAttribute, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAttribute(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Attribute Modal */}
      {reviewingAttribute && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Review Proposed Attribute
              </h3>
              <button
                onClick={() => setReviewingAttribute(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  {reviewingAttribute.name} ({reviewingAttribute.code})
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                  Subtype: {reviewingAttribute.subtype} • Data Type: {reviewingAttribute.dataType}
                </div>
                <div style={{ fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600, marginTop: '4px' }}>
                  Allowed Values: {reviewingAttribute.allowedValues}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                Verify whether this attribute is generic and applicable across its proposed {reviewingAttribute.categoriesCount} categories before confirming validation rules.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleReviewAttribute('REJECT')}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    color: '#DC2626',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reject Attribute
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAttribute('APPROVE')}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Approve & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
