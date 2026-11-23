import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  FileCheck,
  FileText,
  ExternalLink,
  ShieldCheck,
  Check,
  User,
  MapPin,
  Clock,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface ApprovalQueueItem {
  id: string;
  appId: string;
  applicant: string;
  region: string;
  source: string;
  submittedDate: string;
  docsSummary: string;
  reviewer: string;
  status: 'Under Review' | 'Approved' | 'Rejected';
  documents: {
    type: string;
    details: string;
    status: 'Verified' | 'Pending check' | 'Missing';
  }[];
  checklist: {
    id: string;
    label: string;
    checked: boolean;
  }[];
  reviewerNotes?: string;
}

export const AdminAgentApprovalsPage: React.FC = () => {
  const [queue, setQueue] = useState<ApprovalQueueItem[]>([
    {
      id: '1',
      appId: 'AP-2042',
      applicant: 'Asha Tamang',
      region: 'Kathmandu',
      source: 'Referral',
      submittedDate: '31 Oct 2026',
      docsSummary: '3/3 documents submitted',
      reviewer: 'Meera Joshi',
      status: 'Under Review',
      documents: [
        { type: 'Citizenship / National ID', details: 'Front & Back uploaded', status: 'Verified' },
        { type: 'PAN Certificate', details: 'PAN 109283746 · Verified with IRD', status: 'Verified' },
        { type: 'Address Proof', details: 'Electricity bill (Kathmandu Central)', status: 'Pending check' },
      ],
      checklist: [
        { id: 'c1', label: 'Identity matches citizenship document', checked: true },
        { id: 'c2', label: 'Tax registration (PAN) validated', checked: true },
        { id: 'c3', label: 'Residential proof verified in designated territory', checked: true },
        { id: 'c4', label: 'Conflict of interest / existing vendor cross-check passed', checked: false },
        { id: 'c5', label: 'Training / onboarding material acknowledged', checked: false },
      ],
      reviewerNotes: 'Address proof electricity bill submitted matches Ward 4 Kathmandu. Ready for final onboarding approval.',
    },
    {
      id: '2',
      appId: 'AP-2040',
      applicant: 'Sita Magar',
      region: 'Butwal',
      source: 'Referral',
      submittedDate: '30 Oct 2026',
      docsSummary: '3/3 documents submitted',
      reviewer: 'Rajesh Sharma',
      status: 'Under Review',
      documents: [
        { type: 'Citizenship / National ID', details: 'Citizenship No. 44-01-78-01294', status: 'Verified' },
        { type: 'PAN Certificate', details: 'PAN 309812745', status: 'Verified' },
        { type: 'Address Proof', details: 'Ward recommendation letter', status: 'Verified' },
      ],
      checklist: [
        { id: 'c1', label: 'Identity matches citizenship document', checked: true },
        { id: 'c2', label: 'Tax registration (PAN) validated', checked: true },
        { id: 'c3', label: 'Residential proof verified in designated territory', checked: true },
        { id: 'c4', label: 'Conflict of interest / existing vendor cross-check passed', checked: true },
        { id: 'c5', label: 'Training / onboarding material acknowledged', checked: true },
      ],
      reviewerNotes: 'All Butwal field checks satisfied.',
    },
    {
      id: '3',
      appId: 'AP-2038',
      applicant: 'Pema Sherpa',
      region: 'Dharan',
      source: 'Mobile',
      submittedDate: '29 Oct 2026',
      docsSummary: '2/3 documents submitted',
      reviewer: 'Meera Joshi',
      status: 'Under Review',
      documents: [
        { type: 'Citizenship / National ID', details: 'Citizenship verified', status: 'Verified' },
        { type: 'PAN Certificate', details: 'PAN pending upload', status: 'Missing' },
        { type: 'Address Proof', details: 'Water supply bill', status: 'Pending check' },
      ],
      checklist: [
        { id: 'c1', label: 'Identity matches citizenship document', checked: true },
        { id: 'c2', label: 'Tax registration (PAN) validated', checked: false },
        { id: 'c3', label: 'Residential proof verified in designated territory', checked: false },
        { id: 'c4', label: 'Conflict of interest / existing vendor cross-check passed', checked: false },
        { id: 'c5', label: 'Training / onboarding material acknowledged', checked: false },
      ],
      reviewerNotes: 'Awaiting PAN card upload before approval.',
    },
    {
      id: '4',
      appId: 'AP-2037',
      applicant: 'Anil Chaudhary',
      region: 'Biratnagar',
      source: 'Referral',
      submittedDate: '29 Oct 2026',
      docsSummary: '3/3 documents submitted',
      reviewer: 'Unassigned',
      status: 'Under Review',
      documents: [
        { type: 'Citizenship / National ID', details: 'Citizenship scanned copy', status: 'Verified' },
        { type: 'PAN Certificate', details: 'PAN 209845112', status: 'Verified' },
        { type: 'Address Proof', details: 'House rent contract', status: 'Pending check' },
      ],
      checklist: [
        { id: 'c1', label: 'Identity matches citizenship document', checked: true },
        { id: 'c2', label: 'Tax registration (PAN) validated', checked: true },
        { id: 'c3', label: 'Residential proof verified in designated territory', checked: false },
        { id: 'c4', label: 'Conflict of interest / existing vendor cross-check passed', checked: false },
        { id: 'c5', label: 'Training / onboarding material acknowledged', checked: false },
      ],
      reviewerNotes: 'Rental contract address differs from citizenship district.',
    },
  ]);

  const [selectedAppId, setSelectedAppId] = useState<string>('AP-2042');
  const [search, setSearch] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');

  const currentItem = queue.find((q) => q.appId === selectedAppId) || queue[0];

  useEffect(() => {
    if (currentItem?.reviewerNotes) {
      setDecisionNotes(currentItem.reviewerNotes);
    }
  }, [selectedAppId]);

  const handleToggleChecklist = (checkId: string) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.appId === selectedAppId) {
          return {
            ...item,
            checklist: item.checklist.map((c) =>
              c.id === checkId ? { ...c, checked: !c.checked } : c
            ),
          };
        }
        return item;
      })
    );
  };

  const handleApprove = () => {
    ApiClient.put(`/api/v1/admin/agents/approvals/${currentItem.appId}/approve`, {
      notes: decisionNotes,
    }).catch(() => {});

    setQueue((prev) =>
      prev.map((q) =>
        q.appId === currentItem.appId ? { ...q, status: 'Approved' } : q
      )
    );
    alert(`Application ${currentItem.appId} for ${currentItem.applicant} has been APPROVED! Agent ID provisioned.`);
  };

  const handleReject = () => {
    const reason = prompt('Please enter rejection reason:', 'Document verification failed or incomplete.') || 'Rejected';
    ApiClient.put(`/api/v1/admin/agents/approvals/${currentItem.appId}/reject`, {
      reason,
    }).catch(() => {});

    setQueue((prev) =>
      prev.map((q) =>
        q.appId === currentItem.appId ? { ...q, status: 'Rejected' } : q
      )
    );
    alert(`Application ${currentItem.appId} REJECTED.`);
  };

  const handleRequestMoreInfo = () => {
    alert(`Request for additional documents sent to ${currentItem.applicant}`);
  };

  const handleExport = () => {
    exportToCsv({
      filename: 'agent_approvals_log.csv',
      title: 'EVEREST PASAL — AGENT APPROVALS LOG',
      headers: ['Application ID', 'Applicant', 'Region', 'Source', 'Submitted Date', 'Status', 'Reviewer'],
      rows: queue.map((q) => [
        q.appId,
        q.applicant,
        q.region,
        q.source,
        q.submittedDate,
        q.status,
        q.reviewer,
      ]),
    });
  };

  const filteredQueue = queue.filter(
    (q) =>
      q.applicant.toLowerCase().includes(search.toLowerCase()) ||
      q.appId.toLowerCase().includes(search.toLowerCase()) ||
      q.region.toLowerCase().includes(search.toLowerCase())
  );

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
            Agent Approvals
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Review KYC documents, verify background eligibility, and authorize field sales credentials.
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
          <span>Export decision log</span>
        </button>
      </div>

      {/* Info Notice Banner */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          borderRadius: '10px',
          border: '1px solid #BFDBFE',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Info size={18} color="#1D4ED8" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12.5px', color: '#1E40AF', fontWeight: 500 }}>
          {queue.filter((q) => q.status === 'Under Review').length} applications Under Review require decision. Review applicant documents against compliance requirements.
        </div>
      </div>

      {/* Master-Detail Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Review Queue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
              Review queue ({queue.length})
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '7px',
                padding: '6px 10px',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search queue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '12px',
                  color: '#1E293B',
                  width: '100%',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredQueue.map((item) => {
              const isSelected = item.appId === selectedAppId;
              return (
                <div
                  key={item.appId}
                  onClick={() => setSelectedAppId(item.appId)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    borderLeft: isSelected ? '4px solid #0B4EA2' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                      {item.applicant}
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        backgroundColor:
                          item.status === 'Approved'
                            ? '#DCFCE7'
                            : item.status === 'Rejected'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          item.status === 'Approved'
                            ? '#15803D'
                            : item.status === 'Rejected'
                            ? '#B91C1C'
                            : '#92400E',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                    {item.appId} · {item.region} · {item.source}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#475569',
                    }}
                  >
                    <span>{item.docsSummary}</span>
                    <span style={{ color: '#94A3B8' }}>{item.submittedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Dossier */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Dossier Header Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  {currentItem.applicant} · {currentItem.appId}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Submitted: {currentItem.submittedDate} · Territory: <strong>{currentItem.region}</strong> · Channel: {currentItem.source}
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor:
                    currentItem.status === 'Approved'
                      ? '#DCFCE7'
                      : currentItem.status === 'Rejected'
                      ? '#FEE2E2'
                      : '#FEF3C7',
                  color:
                    currentItem.status === 'Approved'
                      ? '#15803D'
                      : currentItem.status === 'Rejected'
                      ? '#B91C1C'
                      : '#92400E',
                }}
              >
                {currentItem.status}
              </span>
            </div>
          </div>

          {/* Section 1: Documents Verification */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
              Identity & Document Verification
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentItem.documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileCheck size={18} color="#0B4EA2" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        {doc.type}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        {doc.details}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor:
                          doc.status === 'Verified'
                            ? '#DCFCE7'
                            : doc.status === 'Missing'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          doc.status === 'Verified'
                            ? '#15803D'
                            : doc.status === 'Missing'
                            ? '#B91C1C'
                            : '#92400E',
                      }}
                    >
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Opening ${doc.type} preview for ${currentItem.applicant}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0B4EA2',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Verification Checklist */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
              Verification Checklist
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentItem.checklist.map((c) => (
                <label
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={c.checked}
                    onChange={() => handleToggleChecklist(c.id)}
                    style={{ width: '15px', height: '15px', accentColor: '#0B4EA2', cursor: 'pointer' }}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Reviewer Notes & Action Buttons */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Reviewer Notes & Decision
            </div>

            <textarea
              rows={3}
              placeholder="Add reviewer comments or reason for decision..."
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontFamily: "'Poppins', sans-serif",
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <button
                onClick={handleRequestMoreInfo}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Request information
              </button>

              <button
                onClick={handleReject}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E63946',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#E63946',
                  cursor: 'pointer',
                }}
              >
                ✕ Reject application
              </button>

              <button
                onClick={handleApprove}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                ✓ Approve application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAgentApprovalsPage;