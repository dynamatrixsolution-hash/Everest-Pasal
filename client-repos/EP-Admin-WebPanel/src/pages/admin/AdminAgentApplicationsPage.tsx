import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  FileText,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  UserPlus,
  Send,
  Eye,
  X,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface ApplicationRecord {
  id: string;
  appId: string;
  applicant: string;
  email: string;
  region: string;
  source: string;
  submittedAt: string;
  status: 'Under Review' | 'Submitted' | 'Needs Information' | 'Approved';
  docsCount: string;
  docsNote: string;
  reviewer: string;
  nextAction: string;
}

export const AdminAgentApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([
    {
      id: '1',
      appId: 'AP-2042',
      applicant: 'Asha Tamang',
      email: 'asha.t@example.test',
      region: 'Kathmandu',
      source: 'Mobile',
      submittedAt: '31 Oct 2026 14:20 NPT',
      status: 'Under Review',
      docsCount: '3 of 3 submitted',
      docsNote: 'Verification pending',
      reviewer: 'Meera Joshi',
      nextAction: 'Review application',
    },
    {
      id: '2',
      appId: 'AP-2041',
      applicant: 'Manoj Poudel',
      email: 'manoj.p@example.test',
      region: 'Pokhara',
      source: 'Web',
      submittedAt: '31 Oct 2026 11:05 NPT',
      status: 'Submitted',
      docsCount: '2 of 3 submitted',
      docsNote: 'PAN missing',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
    {
      id: '3',
      appId: 'AP-2040',
      applicant: 'Sita Magar',
      email: 'sita.m@example.test',
      region: 'Butwal',
      source: 'Referral',
      submittedAt: '30 Oct 2026 16:40 NPT',
      status: 'Under Review',
      docsCount: '3 of 3 submitted',
      docsNote: 'Identity check pending',
      reviewer: 'Rajesh Sharma',
      nextAction: 'Review application',
    },
    {
      id: '4',
      appId: 'AP-2039',
      applicant: 'Rajan Neupane',
      email: 'rajan.n@example.test',
      region: 'Lalitpur',
      source: 'Web',
      submittedAt: '30 Oct 2026 09:10 NPT',
      status: 'Needs Information',
      docsCount: '2 of 3 submitted',
      docsNote: 'Address proof unclear',
      reviewer: 'Meera Joshi',
      nextAction: 'View request',
    },
    {
      id: '5',
      appId: 'AP-2038',
      applicant: 'Pema Sherpa',
      email: 'pema.s@example.test',
      region: 'Dharan',
      source: 'Mobile',
      submittedAt: '29 Oct 2026 15:35 NPT',
      status: 'Under Review',
      docsCount: '2 of 3 submitted',
      docsNote: 'Awaiting PAN upload',
      reviewer: 'Meera Joshi',
      nextAction: 'Review application',
    },
    {
      id: '6',
      appId: 'AP-2037',
      applicant: 'Anil Chaudhary',
      email: 'anil.c@example.test',
      region: 'Biratnagar',
      source: 'Referral',
      submittedAt: '29 Oct 2026 12:00 NPT',
      status: 'Under Review',
      docsCount: '3 of 3 submitted',
      docsNote: 'Address mismatch',
      reviewer: 'Unassigned',
      nextAction: 'Review application',
    },
    {
      id: '7',
      appId: 'AP-2036',
      applicant: 'Ritu Acharya',
      email: 'ritu.a@example.test',
      region: 'Kathmandu',
      source: 'Web',
      submittedAt: '28 Oct 2026 10:30 NPT',
      status: 'Approved',
      docsCount: '3 of 3 verified',
      docsNote: 'Decision 30 Oct',
      reviewer: 'Rajesh Sharma',
      nextAction: 'View application',
    },
    {
      id: '8',
      appId: 'AP-2035',
      applicant: 'Sunil Khadka',
      email: 'sunil.k@example.test',
      region: 'Pokhara',
      source: 'Mobile',
      submittedAt: '28 Oct 2026 08:20 NPT',
      status: 'Submitted',
      docsCount: '1 of 3 submitted',
      docsNote: 'ID and PAN missing',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
    {
      id: '9',
      appId: 'AP-2034',
      applicant: 'Bina Bhandari',
      email: 'bina.b@example.test',
      region: 'Butwal',
      source: 'Web',
      submittedAt: '27 Oct 2026 16:45 NPT',
      status: 'Needs Information',
      docsCount: '2 of 3 submitted',
      docsNote: 'Replace expired ID',
      reviewer: 'Meera Joshi',
      nextAction: 'View request',
    },
    {
      id: '10',
      appId: 'AP-2033',
      applicant: 'Dinesh K.C.',
      email: 'dinesh.k@example.test',
      region: 'Dharan',
      source: 'Referral',
      submittedAt: '27 Oct 2026 14:00 NPT',
      status: 'Submitted',
      docsCount: '3 of 3 submitted',
      docsNote: 'Not yet reviewed',
      reviewer: 'Unassigned',
      nextAction: 'Assign reviewer',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord>(applications[0]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState('Meera Joshi');

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents/applications')
      .then((res) => {
        if (res?.data?.applications && Array.isArray(res.data.applications)) {
          setApplications(res.data.applications);
          if (res.data.applications.length > 0) {
            setSelectedApp(res.data.applications[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleAssignReviewer = () => {
    ApiClient.put(`/api/v1/admin/agents/applications/${selectedApp.appId}/assign`, {
      reviewer: selectedReviewer,
    }).catch(() => {});

    const updated = applications.map((a) =>
      a.appId === selectedApp.appId ? { ...a, reviewer: selectedReviewer, status: 'Under Review' as any } : a
    );
    setApplications(updated);
    setSelectedApp({ ...selectedApp, reviewer: selectedReviewer, status: 'Under Review' });
    setIsAssignModalOpen(false);
  };

  const handleExport = () => {
    exportToCsv({
      filename: 'agent_applications_export.csv',
      title: 'EVEREST PASAL — AGENT APPLICATIONS',
      headers: ['Application ID', 'Applicant', 'Email', 'Region', 'Source', 'Submitted At', 'Status', 'Documents', 'Reviewer'],
      rows: applications.map((a) => [
        a.appId,
        a.applicant,
        a.email,
        a.region,
        a.source,
        a.submittedAt,
        a.status,
        `${a.docsCount} - ${a.docsNote}`,
        a.reviewer,
      ]),
    });
  };

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.applicant.toLowerCase().includes(search.toLowerCase()) ||
      a.appId.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || a.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
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
            Agent Applications
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Triage applications, collect missing information and assign the right reviewer.
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
          <span>Export applications</span>
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
        {/* Recent applications */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Recent applications
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            12
          </div>
        </div>

        {/* Submitted */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Submitted
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            5
          </div>
        </div>

        {/* Under Review */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Under Review
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            4
          </div>
        </div>

        {/* Needs Information */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Needs Information
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            2
          </div>
        </div>

        {/* Approved */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Approved
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>
            1
          </div>
          <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>
            Awaiting onboarding
          </div>
        </div>
      </div>

      {/* Intake section & Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Application intake
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
              Newest submissions first · 10 of 12 recent applications shown
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '6px',
            borderTop: '1px solid #F1F5F9',
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
                placeholder="Search applicant or application ID"
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
              <option value="All">All application statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Needs Information">Needs Information</option>
              <option value="Approved">Approved</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
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
              <option value="All">All sources</option>
              <option value="Mobile">Mobile</option>
              <option value="Web">Web</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
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
                  APPLICANT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  REGION / SOURCE
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  SUBMITTED
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  DOCUMENT COMPLETENESS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  REVIEWER
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  NEXT ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const isSelected = selectedApp.appId === app.appId;
                return (
                  <tr
                    key={app.appId}
                    onClick={() => setSelectedApp(app)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Applicant */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.applicant}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {app.appId} · {app.email}
                      </div>
                    </td>

                    {/* Region / Source */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#1E293B' }}>{app.region}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{app.source}</div>
                    </td>

                    {/* Submitted */}
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                      {app.submittedAt}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            app.status === 'Approved'
                              ? '#DCFCE7'
                              : app.status === 'Under Review'
                              ? '#FEF3C7'
                              : app.status === 'Needs Information'
                              ? '#FFEDD5'
                              : '#DBEAFE',
                          color:
                            app.status === 'Approved'
                              ? '#15803D'
                              : app.status === 'Under Review'
                              ? '#92400E'
                              : app.status === 'Needs Information'
                              ? '#C2410C'
                              : '#1D4ED8',
                        }}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Document Completeness */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#0F172A', fontWeight: 500 }}>{app.docsCount}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {app.docsNote}
                      </div>
                    </td>

                    {/* Reviewer */}
                    <td style={{ padding: '14px 16px', color: app.reviewer === 'Unassigned' ? '#94A3B8' : '#1E293B', fontWeight: app.reviewer === 'Unassigned' ? 400 : 500 }}>
                      {app.reviewer}
                    </td>

                    {/* Next Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                          if (app.nextAction === 'Assign reviewer') {
                            setIsAssignModalOpen(true);
                          } else {
                            window.location.href = `/admin/agents/approvals?appId=${app.appId}`;
                          }
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
                        <FileText size={13} />
                        <span>{app.nextAction}</span>
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
          <div>Showing 1–10 of 12 applications</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ marginRight: '8px' }}>10 per page</span>
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
              Page 1
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

      {/* Bottom Drawer (Selected Application Info & Actions) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Information Callout Card */}
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
              Submitted does not mean verified
            </div>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px', lineHeight: 1.5 }}>
              Document completeness counts uploads only. Identity, tax details and regional eligibility must be checked in Agent Approvals before a decision is recorded.
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '8px' }}>
              {selectedApp.appId} · {selectedApp.applicant} remains {selectedApp.status}. No agent ID, orders or earnings are assigned before onboarding.
            </div>
          </div>
        </div>

        {/* Right Application Actions Card */}
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
              Application actions · {selectedApp.appId}
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
              onClick={() => (window.location.href = `/admin/agents/approvals?appId=${selectedApp.appId}`)}
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
              View application
            </div>
            <div
              onClick={() => (window.location.href = `/admin/agents/approvals?appId=${selectedApp.appId}`)}
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
              Review documents
            </div>
            <div
              onClick={() => alert(`Requesting missing information from ${selectedApp.applicant} (${selectedApp.email})`)}
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
              Request information
            </div>
            <div
              onClick={() => setIsAssignModalOpen(true)}
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
              Assign reviewer
            </div>
          </div>
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {isAssignModalOpen && (
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
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Assign Reviewer to {selectedApp.appId}
              </h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px 0' }}>
              Applicant: <strong>{selectedApp.applicant}</strong> ({selectedApp.region})
            </p>

            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Select Admin Reviewer
            </label>
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                marginBottom: '18px',
              }}
            >
              <option value="Meera Joshi">Meera Joshi (Operations Officer)</option>
              <option value="Rajesh Sharma">Rajesh Sharma (Super Admin)</option>
              <option value="Compliance Team">Compliance Review Desk</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignReviewer}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#0B4EA2',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAgentApplicationsPage;