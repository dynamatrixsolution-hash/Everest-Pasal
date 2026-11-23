// ==============================================================================
// EVEREST PASAL - STATUS BADGE COMPONENT
// ==============================================================================

import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'role';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  if (type === 'role') {
    return <span className="badge badge-role">{status.replace('_', ' ')}</span>;
  }

  const norm = (status || '').toUpperCase();

  if (norm === 'ACTIVE' || norm === 'DELIVERED' || norm === 'CONFIRMED' || norm === 'UP' || norm === 'CONNECTED') {
    return <span className="badge badge-active">{status}</span>;
  }
  if (norm === 'DRAFT' || norm === 'PENDING' || norm === 'PROCESSING') {
    return <span className="badge badge-draft">{status}</span>;
  }
  if (norm === 'ARCHIVED' || norm === 'DISCONTINUED' || norm === 'CANCELLED') {
    return <span className="badge badge-archived">{status}</span>;
  }

  return <span className="badge badge-danger">{status}</span>;
};
