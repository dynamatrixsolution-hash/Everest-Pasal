// ==============================================================================
// EVEREST PASAL - ADMIN AUDIT TRAIL & GOVERNANCE LOG
// Immutable record of platform mutations, orders, and authentication events
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';

interface AuditEventItem {
  id: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  actorType?: string;
  payload?: any;
  occurredAt: string;
  actor?: {
    id: string;
    fullName: string;
    email?: string;
  };
}

export const AdminAuditPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ events: AuditEventItem[] }>(
        `/api/admin/audits${eventTypeFilter ? `?eventType=${encodeURIComponent(eventTypeFilter)}` : ''}`
      );
      setEvents(res.events || []);
    } catch (err: any) {
      console.error('Failed to load audit events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [eventTypeFilter]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            🛡️ Governance Audit Log & Event Stream
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
            Append-only historical records of orders, security events, vendor approvals, and system mutations.
          </p>
        </div>

        <button onClick={fetchAudits} className="btn btn-secondary btn-sm">
          🔄 Refresh Stream
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Loading audit trail...
        </div>
      ) : events.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛡️</div>
          <h3 style={{ color: '#f8fafc', marginBottom: '4px' }}>No audit events recorded</h3>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 16px' }}>Event Type</th>
                  <th style={{ padding: '12px 16px' }}>Actor</th>
                  <th style={{ padding: '12px 16px' }}>Target Entity</th>
                  <th style={{ padding: '12px 16px' }}>Payload Metadata</th>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#38bdf8' }}>
                      {ev.eventType}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#f8fafc' }}>
                      {ev.actor?.fullName || ev.actorType || 'SYSTEM'}
                      {ev.actor?.email && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                          {ev.actor.email}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {ev.entityType ? (
                        <span>
                          {ev.entityType} {ev.entityId ? `(#${ev.entityId.slice(0, 8)}...)` : ''}
                        </span>
                      ) : (
                        'PLATFORM'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
                      {ev.payload ? JSON.stringify(ev.payload) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(ev.occurredAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
