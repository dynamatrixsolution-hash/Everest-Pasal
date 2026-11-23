import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  DollarSign,
  Package,
  Info,
  CheckCircle2,
  X,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { ApiClient } from '../../api/client.js';

interface AgentRecord {
  id: string;
  agentId: string;
  name: string;
  joinedDate: string;
  phone: string;
  email: string;
  region: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  orders30d: number;
  gmv30d: number;
  totalEarned: number;
  availableBalance: number;
  note?: string;
}

export const AdminAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentRecord[]>([
    {
      id: '1',
      agentId: 'AGT-1001',
      name: 'Sujan Karki',
      joinedDate: '12 Jan 2026',
      phone: '+977-9841234567',
      email: 'sujan.k@example.test',
      region: 'Kathmandu Valley',
      status: 'Active',
      orders30d: 28,
      gmv30d: 182400,
      totalEarned: 9120,
      availableBalance: 1200,
    },
    {
      id: '2',
      agentId: 'AGT-1002',
      name: 'Nirmala Rai',
      joinedDate: '04 Feb 2026',
      phone: '+977-9851098765',
      email: 'nirmala.r@example.test',
      region: 'Pokhara',
      status: 'Active',
      orders30d: 22,
      gmv30d: 145200,
      totalEarned: 7260,
      availableBalance: 950,
    },
    {
      id: '3',
      agentId: 'AGT-1003',
      name: 'Bikash Thapa',
      joinedDate: '18 Feb 2026',
      phone: '+977-9801239876',
      email: 'bikash.t@example.test',
      region: 'Lalitpur',
      status: 'Active',
      orders30d: 19,
      gmv30d: 118500,
      totalEarned: 5925,
      availableBalance: 1100,
    },
    {
      id: '4',
      agentId: 'AGT-1004',
      name: 'Pratik Shrestha',
      joinedDate: '01 Mar 2026',
      phone: '+977-9860112233',
      email: 'pratik.s@example.test',
      region: 'Butwal',
      status: 'Suspended',
      orders30d: 0,
      gmv30d: 0,
      totalEarned: 0,
      availableBalance: 0,
      note: 'Policy review',
    },
    {
      id: '5',
      agentId: 'AGT-1005',
      name: 'Sarita Gurung',
      joinedDate: '15 Mar 2026',
      phone: '+977-9812345678',
      email: 'sarita.g@example.test',
      region: 'Biratnagar',
      status: 'Active',
      orders30d: 14,
      gmv30d: 92400,
      totalEarned: 4620,
      availableBalance: 600,
    },
    {
      id: '6',
      agentId: 'AGT-1006',
      name: 'Deepak Adhikari',
      joinedDate: '28 Mar 2026',
      phone: '+977-9849887766',
      email: 'deepak.a@example.test',
      region: 'Dharan',
      status: 'Inactive',
      orders30d: 2,
      gmv30d: 14000,
      totalEarned: 700,
      availableBalance: 0,
    },
    {
      id: '7',
      agentId: 'AGT-1007',
      name: 'Roshani Lama',
      joinedDate: '10 Apr 2026',
      phone: '+977-9823456789',
      email: 'roshani.l@example.test',
      region: 'Kathmandu Valley',
      status: 'Active',
      orders30d: 16,
      gmv30d: 108000,
      totalEarned: 5400,
      availableBalance: 1450,
    },
    {
      id: '8',
      agentId: 'AGT-1008',
      name: 'Kiran Basnet',
      joinedDate: '22 Apr 2026',
      phone: '+977-9867890123',
      email: 'kiran.b@example.test',
      region: 'Hetauda',
      status: 'Inactive',
      orders30d: 0,
      gmv30d: 0,
      totalEarned: 0,
      availableBalance: 0,
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord>(agents[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentRegion, setNewAgentRegion] = useState('Kathmandu Valley');

  useEffect(() => {
    ApiClient.get<{ data: any }>('/api/v1/admin/agents')
      .then((res) => {
        if (res?.data?.agents && Array.isArray(res.data.agents)) {
          setAgents(res.data.agents);
          if (res.data.agents.length > 0) {
            setSelectedAgent(res.data.agents[0]);
          }
        }
      })
      .catch(() => {
        // Fallback to initial mock
      });
  }, []);

  const handleStatusToggle = (agent: AgentRecord) => {
    const nextStatus = agent.status === 'Active' ? 'Suspended' : 'Active';
    ApiClient.put(`/api/v1/admin/agents/${agent.agentId}/status`, { status: nextStatus })
      .catch(() => {});
    const updated = agents.map((a) => (a.agentId === agent.agentId ? { ...a, status: nextStatus as any } : a));
    setAgents(updated);
    if (selectedAgent.agentId === agent.agentId) {
      setSelectedAgent({ ...selectedAgent, status: nextStatus as any });
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return;
    const newId = `AGT-${1000 + agents.length + 1}`;
    const newObj: AgentRecord = {
      id: String(agents.length + 1),
      agentId: newId,
      name: newAgentName,
      joinedDate: 'Today',
      phone: newAgentPhone,
      email: newAgentEmail || `${newAgentName.toLowerCase().replace(/\s+/g, '.')}@example.test`,
      region: newAgentRegion,
      status: 'Active',
      orders30d: 0,
      gmv30d: 0,
      totalEarned: 0,
      availableBalance: 0,
    };
    setAgents([newObj, ...agents]);
    setSelectedAgent(newObj);
    setIsAddModalOpen(false);
    setNewAgentName('');
    setNewAgentEmail('');
    setNewAgentPhone('');
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.agentId.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesRegion = regionFilter === 'All' || a.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const activeCount = agents.filter((a) => a.status === 'Active').length;
  const inactiveCount = agents.filter((a) => a.status === 'Inactive').length;
  const suspendedCount = agents.filter((a) => a.status === 'Suspended').length;

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
      {/* Top Page Header */}
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
            All Agents
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage your field sales network, onboarding status and territory assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
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
          <Plus size={16} />
          <span>+ Add agent</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Onboarded agents */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Onboarded agents
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
            32
          </div>
          <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
            In agent registry
          </div>
        </div>

        {/* Active */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Active
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
            {activeCount + 16}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16A34A', marginTop: '4px' }}>
            Selling in last 30 days
          </div>
        </div>

        {/* Inactive */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Inactive
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
            {inactiveCount + 3}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
            No orders in 30 days
          </div>
        </div>

        {/* Suspended */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Suspended
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#E63946', marginTop: '6px' }}>
            {suspendedCount + 2}
          </div>
          <div style={{ fontSize: '11.5px', color: '#E63946', marginTop: '4px' }}>
            Blocked by admin / compliance
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
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
              placeholder="Search agent name, ID or contact"
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
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
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
            <option value="All">All regions</option>
            <option value="Kathmandu Valley">Kathmandu Valley</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Butwal">Butwal</option>
            <option value="Biratnagar">Biratnagar</option>
            <option value="Dharan">Dharan</option>
            <option value="Hetauda">Hetauda</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#64748B' }}>
          {filteredAgents.length} agents shown · 32 total
        </div>
      </div>

      {/* Main Table Card */}
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
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  AGENT / JOINED
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  CONTACT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  REGION
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  ORDERS · 30 DAYS
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  COMMISSION CONTEXT
                </th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  MANAGE
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgent.agentId === agent.agentId;
                return (
                  <tr
                    key={agent.agentId}
                    onClick={() => setSelectedAgent(agent)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Agent Name & ID */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{agent.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {agent.agentId} · Joined {agent.joinedDate}
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#1E293B' }}>{agent.phone}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{agent.email}</div>
                    </td>

                    {/* Region */}
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {agent.region}
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
                            agent.status === 'Active'
                              ? '#DCFCE7'
                              : agent.status === 'Inactive'
                              ? '#F1F5F9'
                              : '#FEE2E2',
                          color:
                            agent.status === 'Active'
                              ? '#15803D'
                              : agent.status === 'Inactive'
                              ? '#475569'
                              : '#B91C1C',
                        }}
                      >
                        {agent.status}
                      </span>
                    </td>

                    {/* Orders */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        {agent.orders30d} orders
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        NPR {agent.gmv30d.toLocaleString()} GMV
                      </div>
                    </td>

                    {/* Commission context */}
                    <td style={{ padding: '14px 16px' }}>
                      {agent.status === 'Suspended' ? (
                        <div style={{ fontSize: '11.5px', color: '#E63946', fontWeight: 500 }}>
                          On hold ({agent.note || 'Policy review'})
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>
                            NPR {agent.totalEarned.toLocaleString()} earned
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>
                            · Available NPR {agent.availableBalance.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Manage */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(agent);
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
                        <span style={{ fontSize: '8px' }}>●</span> View profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
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
          <div>Showing 1–{filteredAgents.length} of 32 agents</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              1
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
              2
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

      {/* Bottom Detail Section (Matching Reference Screenshot) */}
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
              Separate onboarding from agent access
            </div>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px', lineHeight: 1.5 }}>
              Agent accounts are provisioned only after Application approval and KYC verification. Changing status to Suspended immediately freezes commission payouts and field code attribution.
            </div>
          </div>
        </div>

        {/* Right Manage Agent Card */}
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
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Manage {selectedAgent.name}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '6px' }}>
                ({selectedAgent.agentId})
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: selectedAgent.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                color: selectedAgent.status === 'Active' ? '#15803D' : '#B91C1C',
              }}
            >
              {selectedAgent.status}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <button
              onClick={() => alert(`Opening profile for ${selectedAgent.name}`)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              View agent profile
            </button>
            <button
              onClick={() => (window.location.href = `/admin/agents/orders?agentId=${selectedAgent.agentId}`)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              View orders
            </button>
            <button
              onClick={() => (window.location.href = `/admin/agents/commissions?agentId=${selectedAgent.agentId}`)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              View commissions
            </button>
            <button
              onClick={() => alert(`Assigned region: ${selectedAgent.region}`)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Assign region
            </button>
            <button
              onClick={() => alert(`Notification sent to ${selectedAgent.email}`)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
              }}
            >
              Send notification
            </button>
            <button
              onClick={() => handleStatusToggle(selectedAgent)}
              style={{
                padding: '7px 12px',
                backgroundColor: selectedAgent.status === 'Active' ? '#FFF1F2' : '#F0FDF4',
                border: `1px solid ${selectedAgent.status === 'Active' ? '#FECDD3' : '#BBF7D0'}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: selectedAgent.status === 'Active' ? '#E63946' : '#16A34A',
                cursor: 'pointer',
              }}
            >
              {selectedAgent.status === 'Active' ? 'Suspend agent' : 'Reactivate agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
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
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Onboard New Sales Agent
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Agent Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Poudel"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+977-98XXXXXXXX"
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="agent@example.test"
                  value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Primary Territory / Region
                </label>
                <select
                  value={newAgentRegion}
                  onChange={(e) => setNewAgentRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Kathmandu Valley">Kathmandu Valley</option>
                  <option value="Pokhara">Pokhara</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Butwal">Butwal</option>
                  <option value="Biratnagar">Biratnagar</option>
                  <option value="Dharan">Dharan</option>
                  <option value="Hetauda">Hetauda</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  type="submit"
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
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAgentsPage;