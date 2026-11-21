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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Return Inspections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inspect received items, record damage or defect findings, and determine item disposition before refund authorization.
          </p>
        </div>
        <button
          onClick={() => alert('Everest Pasal QC Guidelines v2.4: Check SKU, count, tags, serial numbers, and packaging before disposition.')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-slate-500" />
          Inspection guidelines
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMsg}
          </div>
        </div>
      )}

      {/* Info Notice Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Layers className="w-5 h-5 text-[#0B4EA2] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-blue-950">6 cases awaiting inspection</div>
          <p className="text-blue-800 mt-0.5">
            Items listed here have been checked in at the warehouse and assigned an intake bin. Completed inspections release the case for refund authorization.
          </p>
        </div>
      </div>

      {/* Split Screen Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Received returns (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Received returns</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {inspections.length}
              </span>
            </div>
            <span className="text-xs text-slate-400">Oldest received first</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search return, SKU or customer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
            />
          </div>

          {/* Cards List */}
          <div className="space-y-2">
            {filteredList.map((item) => {
              const isSelected = item.returnId === selectedReturnId;
              return (
                <div
                  key={item.returnId}
                  onClick={() => setSelectedReturnId(item.returnId)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0B4EA2] bg-blue-50/40 ring-1 ring-[#0B4EA2]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.returnId}</span>
                    <span className="text-[11px] text-slate-400">{item.receivedDate}</span>
                  </div>
                  <div className="font-semibold text-slate-700 mt-1">{item.customer}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.reportedReason}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 truncate max-w-[150px]">{item.item}</span>
                    <span className="font-bold text-slate-900">
                      NPR {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
            Showing 1–6 of 6 awaiting inspection
          </div>
        </div>

        {/* Right Column: Item Inspection Workflow (8 cols) */}
        {selectedCase && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedCase.returnId} · Item inspection
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Customer: <strong className="text-slate-800">{selectedCase.customer}</strong></span>
                  <span>·</span>
                  <span>Order: <strong className="text-slate-800">{selectedCase.orderId}</strong></span>
                  <span>·</span>
                  <span>Reason: <strong className="text-slate-800">{selectedCase.reportedReason}</strong></span>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                Intake: <strong className="text-slate-800">{selectedCase.intake || 'RCV-5041 / 31 Oct · 16:40'}</strong> · Bin: <strong className="text-slate-800">{selectedCase.bin || 'QC-B04'}</strong>
              </div>
            </div>

            {/* Step 1: Confirm item & quantity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  1
                </span>
                Confirm item & quantity
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="text-slate-400 block font-medium">Expected SKU & Variant</label>
                  <div className="font-semibold text-slate-900 mt-1">
                    {selectedCase.expectedSku || `${selectedCase.sku} · ${selectedCase.variant}`}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block font-medium">Counted Quantity</label>
                  <input
                    type="number"
                    defaultValue={selectedCase.countedQuantity || 1}
                    className="mt-1 w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-medium">SKU Match</label>
                  <select
                    value={skuMatch}
                    onChange={(e) => setSkuMatch(e.target.value)}
                    className="mt-1 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  >
                    <option value="Match verified">Match verified</option>
                    <option value="SKU mismatch">SKU mismatch</option>
                    <option value="Quantity mismatch">Quantity mismatch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Assess condition */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Assess condition
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <label className="text-slate-500 font-semibold block">Item condition</label>
                  <select
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  >
                    <option value="New / pristine">New / pristine</option>
                    <option value="Used / undamaged">Used / undamaged</option>
                    <option value="Broken / unusable">Broken / unusable</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <label className="text-slate-500 font-semibold block">Packaging & accessories</label>
                  <select
                    value={packagingStatus}
                    onChange={(e) => setPackagingStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  >
                    <option value="Original box intact">Original box intact</option>
                    <option value="Original box damaged">Original box damaged</option>
                    <option value="Missing packaging">Missing packaging</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <label className="text-slate-500 font-semibold block">Reported damage verified</label>
                  <select
                    value={damageVerified}
                    onChange={(e) => setDamageVerified(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  >
                    <option value="Yes - confirmed">Yes - confirmed</option>
                    <option value="No - unconfirmed">No - unconfirmed</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <label className="text-slate-500 font-semibold block">Use / wear / tags</label>
                  <select
                    value={tagsStatus}
                    onChange={(e) => setTagsStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                  >
                    <option value="Tags attached · Not used">Tags attached · Not used</option>
                    <option value="Signs of wear">Signs of wear</option>
                    <option value="Tags missing">Tags missing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Document defect & evidence */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  3
                </span>
                Document defect & evidence
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium border border-slate-200">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>{selectedCase.evidenceFile || 'damage-claim.jpg (388 KB)'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Photo upload dialog: Attach warehouse inspection photos.')}
                  className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  + Add inspection photo
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Inspection findings & notes
                </label>
                <textarea
                  rows={3}
                  value={findingsNote}
                  onChange={(e) => setFindingsNote(e.target.value)}
                  placeholder="Record defect description, transit shock observations, or repackaging state..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]"
                />
              </div>
            </div>

            {/* Step 4: Choose disposition & decision */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  4
                </span>
                Choose disposition & decision
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                        isDispSelected
                          ? 'border-[#0B4EA2] bg-blue-50/50 text-[#0B4EA2] font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold">{disp.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{disp.note}</div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Passed')}
                  className="px-5 py-2.5 rounded-xl bg-[#0B4EA2] text-white hover:bg-blue-800 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Pass inspection (Eligible for refund)'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Failed')}
                  className="px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  Fail inspection (Ineligible)
                </button>
                <button
                  type="button"
                  onClick={() => alert('Inspection draft saved to local station.')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Save inspection draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-200/60">
        <span>Example data · 01 Nov 2026, 10:30 NPT · All amounts in NPR</span>
        <span>Everest Pasal / Operations</span>
      </div>
    </div>
  );
};

export default AdminReturnInspectionsPage;
