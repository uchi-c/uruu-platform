import React from 'react';

const statusStyles = {
  NOT_STARTED: 'bg-shadow-border text-shadow-muted border-shadow-border',
  COMPLIANT: 'bg-green-500/20 text-green-500 border-green-500/30',
  NON_COMPLIANT: 'bg-red-500/20 text-red-500 border-red-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  NOT_APPLICABLE: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
};

export function ComplianceStatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
