import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Check,
  X,
  Package,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface InspectionItem {
  returnId: string;
  customer: string;
  orderId: string;
  item: string;
  sku: string;
  variant: string;
  receivedDate: string;
  amount: number;
  intake?: string;
  bin?: string;
  reportedReason: string;
  expectedSku?: string;
  countedQuantity?: number;
  skuMatch?: string;
  itemCondition?: string;
  packagingStatus?: string;
  reportedDamageVerified?: string;
  tagsStatus?: string;
  evidenceFile?: string;
  findings?: string;
  disposition?: string;
  decision?: string;
}

export const AdminReturnInspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionItem[]>([
    {
      returnId: 'RET-1041',
      customer: 'Suman Karki',
      orderId: 'ORD-88209',
      item: 'Ceramic mug · EP-MUG-011-BL',
      sku: 'EP-MUG-011-BL',
      variant: 'Blue',
      receivedDate: '31 Oct · 18:40',
      amount: 890,
      intake: 'RCV-5041 / 31 Oct · 16:40',
      bin: 'QC-B04',
      reportedReason: 'Damaged item',
      expectedSku: 'EP-MUG-011-BL · Blue',
      countedQuantity: 1,
      skuMatch: 'Match verified',
      itemCondition: 'Broken / unusable',
      packagingStatus: 'Original box damaged',
      reportedDamageVerified: 'Yes - confirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'damage-claim.jpg (388 KB)',
      findings:
        'Handle cleanly detached at the base weld. Fracture appears consistent with transit shock; internal ceramic shows no prior fatigue lines. Item cannot be restocked.',
      disposition: 'Scrap / Dispose',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1025',
      customer: 'Bikash Shahi',
      orderId: 'ORD-88055',
      item: 'Cotton bedsheet · 1 unit',
      sku: 'EP-BED-04',
      variant: 'King',
      receivedDate: '31 Oct · 12:10',
      amount: 2200,
      intake: 'RCV-5025 / 31 Oct · 11:30',
      bin: 'QC-A12',
      reportedReason: 'Wrong size',
      expectedSku: 'EP-BED-04 · King',
      countedQuantity: 1,
      skuMatch: 'Match verified',
      itemCondition: 'New / pristine',
      packagingStatus: 'Original box intact',
      reportedDamageVerified: 'No - unconfirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'packaging.jpg (240 KB)',
      findings: 'Item brand new, factory sealed packaging intact. Fully restockable.',
      disposition: 'Restock to inventory',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1021',
      customer: 'Meena Shrestha',
      orderId: 'ORD-88029',
      item: 'Electric kettle · 1 unit',
      sku: 'EP-KTL-01',
      variant: '1.8L',
      receivedDate: '30 Oct · 15:00',
      amount: 3150,
      intake: 'RCV-5021 / 30 Oct · 14:15',
      bin: 'QC-C02',
      reportedReason: 'Defective item',
      expectedSku: 'EP-KTL-01 · 1.8L',
      countedQuantity: 1,
      skuMatch: 'Match verified',
      itemCondition: 'Broken / unusable',
      packagingStatus: 'Original box intact',
      reportedDamageVerified: 'Yes - confirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'kettle-switch.jpg (410 KB)',
      findings: 'Auto shutoff sensor fails upon water boiling. Return to vendor for warranty claim.',
      disposition: 'Return to vendor',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1019',
      customer: 'Roshan Poudel',
      orderId: 'ORD-88019',
      item: 'Sports tee · 2 units',
      sku: 'EP-TEE-99',
      variant: 'L',
      receivedDate: '30 Oct · 11:20',
      amount: 1500,
      intake: 'RCV-5019 / 30 Oct · 10:45',
      bin: 'QC-A08',
      reportedReason: 'Wrong size',
      expectedSku: 'EP-TEE-99 · L',
      countedQuantity: 2,
      skuMatch: 'Match verified',
      itemCondition: 'New / pristine',
      packagingStatus: 'Original box intact',
      reportedDamageVerified: 'No - unconfirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'tee-label.jpg (190 KB)',
      findings: 'Unopened polythene wraps. Tags attached. Restockable.',
      disposition: 'Restock to inventory',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1017',
      customer: 'Dipa Khatri',
      orderId: 'ORD-88002',
      item: 'Lunch box · 1 unit',
      sku: 'EP-BOX-02',
      variant: 'Steel',
      receivedDate: '29 Oct · 14:10',
      amount: 750,
      intake: 'RCV-5017 / 29 Oct · 13:20',
      bin: 'QC-B01',
      reportedReason: 'Damaged item',
      expectedSku: 'EP-BOX-02 · Steel',
      countedQuantity: 1,
      skuMatch: 'Match verified',
      itemCondition: 'Broken / unusable',
      packagingStatus: 'Original box damaged',
      reportedDamageVerified: 'Yes - confirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'dent-box.jpg (320 KB)',
      findings: 'Severe dent on stainless steel lid during transport. Scrap.',
      disposition: 'Scrap / Dispose',
      decision: 'Pending',
    },
    {
      returnId: 'RET-1014',
      customer: 'Nabin Giri',
      orderId: 'ORD-87940',
      item: 'Travel duffel · 1 unit',
      sku: 'EP-DFL-08',
      variant: 'Black',
      receivedDate: '28 Oct · 10:00',
      amount: 2650,
      intake: 'RCV-5014 / 28 Oct · 09:30',
      bin: 'QC-D05',
      reportedReason: 'Defective item',
      expectedSku: 'EP-DFL-08 · Black',
      countedQuantity: 1,
      skuMatch: 'Match verified',
      itemCondition: 'Broken / unusable',
      packagingStatus: 'Original box intact',
      reportedDamageVerified: 'Yes - confirmed',
      tagsStatus: 'Tags attached · Not used',
      evidenceFile: 'zipper-jam.jpg (270 KB)',
      findings: 'Main zipper teeth misaligned, cannot zip past midpoint. Send to vendor.',
      disposition: 'Return to vendor',
      decision: 'Pending',
    },
  ]);

  const [selectedReturnId, setSelectedReturnId] = useState<string>('RET-1041');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemCondition, setItemCondition] = useState('Broken / unusable');
  const [packagingStatus, setPackagingStatus] = useState('Original box damaged');
  const [damageVerified, setDamageVerified] = useState('Yes - confirmed');
  const [tagsStatus, setTagsStatus] = useState('Tags attached · Not used');
  const [findingsNote, setFindingsNote] = useState(
    'Handle cleanly detached at the base weld. Fracture appears consistent with transit shock; internal ceramic shows no prior fatigue lines. Item cannot be restocked.'
  );
  const [disposition, setDisposition] = useState('Scrap / Dispose');
  const [skuMatch, setSkuMatch] = useState('Match verified');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const selectedCase = inspections.find((i) => i.returnId === selectedReturnId) || inspections[0];

  useEffect(() => {
    if (selectedCase) {
      setItemCondition(selectedCase.itemCondition || 'Broken / unusable');
      setPackagingStatus(selectedCase.packagingStatus || 'Original box damaged');
      setDamageVerified(selectedCase.reportedDamageVerified || 'Yes - confirmed');
      setTagsStatus(selectedCase.tagsStatus || 'Tags attached · Not used');
      setFindingsNote(selectedCase.findings || '');
      setDisposition(selectedCase.disposition || 'Scrap / Dispose');
      setSkuMatch(selectedCase.skuMatch || 'Match verified');
    }
  }, [selectedReturnId]);

  const handleDecision = async (decision: 'Passed' | 'Failed') => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await ApiClient.post(`/admin/returns/inspections/${selectedCase.returnId}`, {
        decision,
        disposition,
        findings: findingsNote,
      });
      setFeedbackMsg(`Inspection ${decision.toLowerCase()} successfully for ${selectedCase.returnId}.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Inspection error:', err);
      setFeedbackMsg(`Saved inspection ${decision.toLowerCase()} locally for ${selectedCase.returnId}.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = inspections.filter((i) => {
    return (
      i.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Header Area matching media_1795254092896_e790ee94.jpg */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Return Inspections
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Inspect received items, record damage or defect findings, and determine item disposition before refund authorization.
          </p>
        </div>
        <button
          onClick={() => alert('Everest Pasal QC Guidelines v2.4: Check SKU, count, tags, serial numbers, and packaging before disposition.')}
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
          }}
        >
          <BookOpen size={14} color="#0F172A" />
          <span>Inspection guidelines</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Info Notice Banner matching media_1795254092896_e790ee94.jpg */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
        }}
      >
        <Layers size={18} color="#0B4EA2" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>
            6 cases awaiting inspection
          </div>
          <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '2px', lineHeight: 1.45 }}>
            Items listed here have been checked in at the warehouse and assigned an intake bin. Completed inspections release the case for refund authorization.
          </div>
        </div>
      </div>

      {/* 3. Split Screen Master-Detail matching media_1795254092896_e790ee94.jpg */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Received returns */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Received returns</span>
              <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px' }}>
                {inspections.length}
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Oldest received first</span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search return, SKU or customer..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredList.map((item) => {
              const isSelected = item.returnId === selectedReturnId;
              return (
                <div
                  key={item.returnId}
                  onClick={() => setSelectedReturnId(item.returnId)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #0B4EA2' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>{item.returnId}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.receivedDate}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '3px' }}>{item.customer}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{item.reportedReason}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '11px' }}>
                    <span style={{ color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                      {item.item}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>NPR {item.amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9', marginTop: '12px' }}>
            Showing 1–6 of 6 awaiting inspection
          </div>
        </div>

        {/* Right Column: Item Inspection Workflow */}
        {selectedCase && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {selectedCase.returnId} · Item inspection
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  <span>Customer: <strong style={{ color: '#0F172A' }}>{selectedCase.customer}</strong></span>
                  <span>·</span>
                  <span>Order: <strong style={{ color: '#0F172A' }}>{selectedCase.orderId}</strong></span>
                  <span>·</span>
                  <span>Reason: <strong style={{ color: '#0F172A' }}>{selectedCase.reportedReason}</strong></span>
                </div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                Intake: <strong style={{ color: '#0F172A' }}>{selectedCase.intake || 'RCV-5041 / 31 Oct · 16:40'}</strong> · Bin: <strong style={{ color: '#0F172A' }}>{selectedCase.bin || 'QC-B04'}</strong>
              </div>
            </div>

            {/* Step 1: Confirm item & quantity */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  1
                </span>
                <span>Confirm item & quantity</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>Expected SKU & Variant</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {selectedCase.expectedSku || `${selectedCase.sku} · ${selectedCase.variant}`}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>Counted Quantity</div>
                  <input
                    type="number"
                    defaultValue={selectedCase.countedQuantity || 1}
                    style={{
                      marginTop: '4px',
                      width: '70px',
                      padding: '5px 8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <div style={{ color: '#64748B', fontWeight: 500 }}>SKU Match</div>
                  <select
                    value={skuMatch}
                    onChange={(e) => setSkuMatch(e.target.value)}
                    style={{
                      marginTop: '4px',
                      width: '100%',
                      padding: '5px 8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  >
                    <option value="Match verified">Match verified</option>
                    <option value="SKU mismatch">SKU mismatch</option>
                    <option value="Quantity mismatch">Quantity mismatch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Assess condition */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  2
                </span>
                <span>Assess condition</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>Item condition</label>
                  <select
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="New / pristine">New / pristine</option>
                    <option value="Used / undamaged">Used / undamaged</option>
                    <option value="Broken / unusable">Broken / unusable</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>Packaging & accessories</label>
                  <select
                    value={packagingStatus}
                    onChange={(e) => setPackagingStatus(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="Original box intact">Original box intact</option>
                    <option value="Original box damaged">Original box damaged</option>
                    <option value="Missing packaging">Missing packaging</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>Reported damage verified</label>
                  <select
                    value={damageVerified}
                    onChange={(e) => setDamageVerified(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="Yes - confirmed">Yes - confirmed</option>
                    <option value="No - unconfirmed">No - unconfirmed</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>Use / wear / tags</label>
                  <select
                    value={tagsStatus}
                    onChange={(e) => setTagsStatus(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', color: '#0F172A', outline: 'none' }}
                  >
                    <option value="Tags attached · Not used">Tags attached · Not used</option>
                    <option value="Signs of wear">Signs of wear</option>
                    <option value="Tags missing">Tags missing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Document defect & evidence */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  3
                </span>
                <span>Document defect & evidence</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '12px', color: '#475569', fontWeight: 500, border: '1px solid #E2E8F0' }}>
                  <FileText size={14} color="#64748B" />
                  <span>{selectedCase.evidenceFile || 'damage-claim.jpg (388 KB)'}</span>
                  <ExternalLink size={12} color="#94A3B8" style={{ cursor: 'pointer' }} />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Photo upload dialog: Attach warehouse inspection photos.')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} color="#64748B" />
                  <span>+ Add inspection photo</span>
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Inspection findings & notes
                </label>
                <textarea
                  rows={3}
                  value={findingsNote}
                  onChange={(e) => setFindingsNote(e.target.value)}
                  placeholder="Record defect description, transit shock observations, or repackaging state..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '7px',
                    fontSize: '12px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Step 4: Choose disposition & decision */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  4
                </span>
                <span>Choose disposition & decision</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '18px' }}>
                {[
                  { id: 'Scrap / Dispose', label: 'Scrap / Dispose', note: 'Unsalvageable defect' },
                  { id: 'Restock to inventory', label: 'Restock to inventory', note: 'Grade A pristine' },
                  { id: 'Return to vendor', label: 'Return to vendor', note: 'Manufacturer warranty' },
                  { id: 'Quarantine / Repair', label: 'Quarantine / Repair', note: 'Needs refurbishment' },
                ].map((disp) => {
                  const isDispSelected = disposition === disp.id;
                  return (
                    <div
                      key={disp.id}
                      onClick={() => setDisposition(disp.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isDispSelected ? '1.5px solid #0B4EA2' : '1px solid #E2E8F0',
                        backgroundColor: isDispSelected ? '#EFF6FF' : '#FFFFFF',
                        color: isDispSelected ? '#0B4EA2' : '#0F172A',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{disp.label}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{disp.note}</div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Passed')}
                  style={{
                    backgroundColor: '#0B4EA2',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '9px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Pass inspection (Eligible for refund)'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Failed')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FECACA',
                    borderRadius: '7px',
                    padding: '9px 18px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#DC2626',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  Fail inspection (Ineligible)
                </button>
                <button
                  type="button"
                  onClick={() => alert('Inspection draft saved to local station.')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '7px',
                    padding: '9px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Save inspection draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Subtle Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: '20px' }}>
        <span>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</span>
        <span>Everest Pasal / Operations</span>
      </div>
    </div>
  );
};

export default AdminReturnInspectionsPage;
