import React from 'react';

const statusStyles = {
  NOT_STARTED: 'bg-[#71717A]/15 text-[#a1a1aa] border-[#71717A]/20',
  COMPLIANT: 'bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]',
  NON_COMPLIANT: 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border-[rgba(239,68,68,0.25)]',
  IN_PROGRESS: 'bg-[rgba(234,179,8,0.12)] text-[#facc15] border-[rgba(234,179,8,0.25)]',
  NOT_APPLICABLE: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
};

export function ComplianceStatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={`badge-refined ${statusStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
