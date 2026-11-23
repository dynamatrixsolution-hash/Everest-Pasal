import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Clock,
  User,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Calendar,
  Filter,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';
import { exportToCsv } from '../../utils/documentExport.js';

interface ActivityEvent {
  id: string;
  eventId: string;
  timestamp: string;
  timeNPT: string;
  actor: string;
  actorRole: string;
  action: string;
  affectedRecord: string;
  recordDetail: string;
  outcome: string;
  outcomeContext: string;
  notes?: string;
}

export const AdminAgentActivitiesPage: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      id: '1',
      eventId: 'EVT-8108',
      timestamp: '01 Nov · 10:12:08',
      timeNPT: 'EVT-8108 · NPT',
      actor: 'Sujan Karki',
      actorRole: 'AGT-1001 · Agent',
      action: 'Payout requested',
      affectedRecord: 'PAY-301',
      recordDetail: 'NPR 1,000',
      outcome: 'Requested',
      outcomeContext: 'Awaiting finance review',
      notes: 'Agent requested withdrawal of available balance NPR 1,000 via eSewa.',
    },
    {
      id: '2',
      eventId: 'EVT-8107',
      timestamp: '01 Nov · 10:02:34',
      timeNPT: 'EVT-8107 · NPT',
      actor: 'Nirmala Rai',
      actorRole: 'AGT-1002 · Agent',
      action: 'Order created',
      affectedRecord: 'ORD-AG2010',
      recordDetail: 'Assisted attribution',
      outcome: 'Success',
      outcomeContext: 'Processing · payment pending',
      notes: 'Customer assisted checkout at Pokhara territory outlet.',
    },
    {
      id: '3',
      eventId: 'EVT-8106',
      timestamp: '01 Nov · 09:50:10',
      timeNPT: 'EVT-8106 · NPT',
      actor: 'Meera Joshi',
      actorRole: 'ADM-003 · Admin',
      action: 'Status changed',
      affectedRecord: 'AP-2042',
      recordDetail: 'Address proof verified',
      outcome: 'Success',
      outcomeContext: 'Application still Under Review',
      notes: 'Electricity bill document approved after Ward verification.',
    },
    {
      id: '4',
      eventId: 'EVT-8105',
      timestamp: '01 Nov · 09:42:19',
      timeNPT: 'EVT-8105 · NPT',
      actor: 'Sujan Karki',
      actorRole: 'AGT-1001 · Agent',
      action: 'Customer registered',
      affectedRecord: 'CUS-7301',
      recordDetail: 'Consent recorded',
      outcome: 'Success',
      outcomeContext: 'Mobile number verified',
      notes: 'New buyer onboarded with referral code AGT-1001.',
    },
    {
      id: '5',
      eventId: 'EVT-8104',
      timestamp: '01 Nov · 09:30:04',
      timeNPT: 'EVT-8104 · NPT',
      actor: 'Bikash Thapa',
      actorRole: 'AGT-1003 · Agent',
      action: 'Sign-in',
      affectedRecord: 'Agent portal',
      recordDetail: 'Session audit recorded',
      outcome: 'Success',
      outcomeContext: 'Password sign-in',
      notes: 'Successful login from mobile IP 27.34.20.12.',
    },
    {
      id: '6',
      eventId: 'EVT-8104-SYS',
      timestamp: '31 Oct · 17:25:41',
      timeNPT: 'EVT-8104 · NPT',
      actor: 'Commission rules',
      actorRole: 'SYS-001 · System',
      action: 'Commission adjusted',
      affectedRecord: 'ORD-AG2004',
      recordDetail: 'NPR 400 reversed',
      outcome: 'Success',
      outcomeContext: 'Cancelled order · never payable',
      notes:
        "System rule cancelled ORD-AG2004's provisional commission after the order was cancelled. Commission changed from NPR 400 to NPR 0 payable. Agent: Pratik Shrestha / AGT-1004. Reason: Order cancelled.",
    },
    {
      id: '7',
      eventId: 'EVT-8103',
      timestamp: '31 Oct · 16:40:12',
      timeNPT: 'EVT-8103 · NPT',
      actor: 'Rajesh Sharma',
      actorRole: 'ADM-001 · Admin',
      action: 'Order assigned',
      affectedRecord: 'ORD-AG2008',
      recordDetail: 'Deepak Adhikari',
      outcome: 'Success',
      outcomeContext: 'Assigned to Dharan coverage',
      notes: 'Manual attribution assignment for offline delivery.',
    },
    {
      id: '8',
      eventId: 'EVT-8102',
      timestamp: '31 Oct · 14:20:00',
      timeNPT: 'EVT-8102 · NPT',
      actor: 'Asha Tamang',
      actorRole: 'AP-2042 · Applicant',
      action: 'Document uploaded',
      affectedRecord: 'AP-2042',
      recordDetail: 'Address proof PDF',
      outcome: 'Submitted',
      outcomeContext: 'Upload received; not verification',
      notes: 'New document version submitted by candidate.',
    },
    {
      id: '9',
      eventId: 'EVT-8101',
      timestamp: '30 Oct · 15:10:03',
      timeNPT: 'EVT-8101 · NPT',
      actor: 'Meera Joshi',
      actorRole: 'ADM-003 · Admin',
      action: 'Status changed',
      affectedRecord: 'AP-2039',
      recordDetail: 'Needs information',
      outcome: 'Success',
      outcomeContext: 'Requested clearer address proof',
      notes: 'Notification sent requesting high resolution copy.',
    },
    {
      id: '10',
      eventId: 'EVT-8100',
      timestamp: '29 Oct · 11:05:20',
      timeNPT: 'EVT-8100 · NPT',
      actor: 'Rajesh Sharma',
      actorRole: 'ADM-001 · Admin',
      action: 'Status changed',
      affectedRecord: 'AGT-1004',
      recordDetail: 'Pratik Shrestha',
      outcome: 'Success',
      outcomeContext: 'Active → Suspended · policy review',
      notes: 'Account suspended following audit inquiry.',
    },
  ]);

  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('All');
  const [actorFilter, setActorFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent>(events[5]); // Default to EVT-8104 matching screenshot

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents/activities')
      .then((res) => {
        if (res?.data?.activities && Array.isArray(res.data.activities)) {
          setEvents(res.data.activities);
          if (res.data.activities.length > 5) {
            setSelectedEvent(res.data.activities[5]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    exportToCsv({
      filename: 'agent_activities_audit_log.csv',
      title: 'EVEREST PASAL — AGENT ACTIVITIES AUDIT LOG',
      headers: ['Event ID', 'Time NPT', 'Actor', 'Action', 'Record', 'Outcome', 'Notes'],
      rows: events.map((e) => [
        e.eventId,
        `${e.timestamp} NPT`,
        `${e.actor} (${e.actorRole})`,
        e.action,
        `${e.affectedRecord} - ${e.recordDetail}`,
        `${e.outcome} (${e.outcomeContext})`,
        e.notes || '',
      ]),
    });
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.actor.toLowerCase().includes(search.toLowerCase()) ||
      ev.eventId.toLowerCase().includes(search.toLowerCase()) ||
      ev.affectedRecord.toLowerCase().includes(search.toLowerCase()) ||
      ev.action.toLowerCase().includes(search.toLowerCase());
    const matchesActivity = activityFilter === 'All' || ev.action.includes(activityFilter);
    const matchesActor =
      actorFilter === 'All' ||
      (actorFilter === 'Agent' && ev.actorRole.includes('Agent')) ||
      (actorFilter === 'Admin' && ev.actorRole.includes('Admin')) ||
      (actorFilter === 'System' && ev.actorRole.includes('System'));
    return matchesSearch && matchesActivity && matchesActor;
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
            Agent Activities
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Trace agent and administrator actions with record-level context and an audit trail.
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
          <span>Export activity log</span>
        </button>
      </div>

      {/* Activity Log Filter Card */}
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
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            Activity log
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
            Recorded events · 01 Oct–01 Nov 2026 · Sorted newest first · Times shown in NPT
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
                placeholder="Search event, agent or record ID"
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
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
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
              <option value="All">All activities</option>
              <option value="Payout">Payout requested</option>
              <option value="Order">Order actions</option>
              <option value="Status">Status changes</option>
              <option value="Commission">Commission adjustments</option>
              <option value="Sign-in">Sign-ins</option>
            </select>

            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
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
              <option value="All">All actors</option>
              <option value="Agent">Agents</option>
              <option value="Admin">Admins</option>
              <option value="System">System Rules</option>
            </select>

            <select
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
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
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
                  EVENT TIME / ID
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ACTOR
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  ACTION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  AFFECTED RECORD
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  OUTCOME / CONTEXT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                  INSPECT
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => {
                const isSelected = selectedEvent.eventId === ev.eventId;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Timestamp / ID */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{ev.timestamp}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ev.timeNPT}
                      </div>
                    </td>

                    {/* Actor */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{ev.actor}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ev.actorRole}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                      {ev.action}
                    </td>

                    {/* Affected Record */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{ev.affectedRecord}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {ev.recordDetail}
                      </div>
                    </td>

                    {/* Outcome / Context */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            ev.outcome === 'Success'
                              ? '#DCFCE7'
                              : ev.outcome === 'Requested'
                              ? '#FEF3C7'
                              : '#DBEAFE',
                          color:
                            ev.outcome === 'Success'
                              ? '#15803D'
                              : ev.outcome === 'Requested'
                              ? '#92400E'
                              : '#1D4ED8',
                        }}
                      >
                        {ev.outcome}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                        {ev.outcomeContext}
                      </div>
                    </td>

                    {/* Inspect */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
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
                        <span style={{ fontSize: '8px' }}>●</span> View details
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
          <div>Showing 1–10 of 146 events</div>
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

      {/* Selected Event Detail Section (Matching Reference Screenshot) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Selected Event Detail */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
            Selected event · {selectedEvent.eventId}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
            {selectedEvent.action} · {selectedEvent.timestamp} NPT
          </div>

          <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '12px', lineHeight: 1.5 }}>
            {selectedEvent.notes ||
              `${selectedEvent.action} on ${selectedEvent.affectedRecord} by ${selectedEvent.actor} (${selectedEvent.actorRole}).`}
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
            Actor: <strong>{selectedEvent.actor}</strong> · Target: <strong>{selectedEvent.affectedRecord}</strong>
          </div>

          {/* Blue Info Notice Banner */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              padding: '12px 14px',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Info size={16} color="#1D4ED8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A8A' }}>
                No payout created
              </div>
              <div style={{ fontSize: '11.5px', color: '#1E40AF', marginTop: '2px', lineHeight: 1.4 }}>
                The reversal is excluded from approved, earned and available balances. Historical calculation remains in adjustment history.
              </div>
            </div>
          </div>
        </div>

        {/* Right Event Actions */}
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
              Event actions
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
              onClick={() => alert(`Detailed trace audit for ${selectedEvent.eventId}`)}
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
              View event details
            </div>
            <div
              onClick={() => (window.location.href = `/admin/agents`)}
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
              View agent
            </div>
            <div
              onClick={() =>
                exportToCsv({
                  filename: `event_${selectedEvent.eventId}.csv`,
                  title: `EVEREST PASAL — EVENT ${selectedEvent.eventId}`,
                  headers: ['Event ID', 'Time NPT', 'Actor', 'Action', 'Record', 'Outcome', 'Notes'],
                  rows: [[
                    selectedEvent.eventId,
                    `${selectedEvent.timestamp} NPT`,
                    `${selectedEvent.actor} (${selectedEvent.actorRole})`,
                    selectedEvent.action,
                    `${selectedEvent.affectedRecord} - ${selectedEvent.recordDetail}`,
                    `${selectedEvent.outcome} (${selectedEvent.outcomeContext})`,
                    selectedEvent.notes || '',
                  ]],
                })
              }
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
              Export event
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAgentActivitiesPage;