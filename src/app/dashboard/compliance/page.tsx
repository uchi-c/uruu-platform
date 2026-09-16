"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Framework = {
  id: string;
  name: string;
  jurisdiction: string;
  version: string;
  _count: { requirements: number };
};

type Assessment = {
  id: string;
  status: string;
  score: number;
  updatedAt: string;
  frameworkId: string;
  framework: { name: string; jurisdiction: string };
  _count: { responses: number };
};

export default function CompliancePage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/compliance/frameworks').then((r) => {
        if (!r.ok) throw new Error(`Failed to load frameworks (${r.status})`);
        return r.json();
      }),
      fetch('/api/compliance/assessments').then((r) => {
        if (!r.ok) throw new Error(`Failed to load assessments (${r.status})`);
        return r.json();
      }),
    ])
      .then(([fw, asmts]) => {
        setFrameworks(fw);
        setAssessments(asmts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStart = async (frameworkId: string) => {
    setStartingId(frameworkId);
    try {
      const res = await fetch('/api/compliance/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworkId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Failed to start assessment (${res.status})`);
      router.push(`/dashboard/compliance/${body.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStartingId(null);
    }
  };

  const assessmentFor = (frameworkId: string) =>
    assessments.find((a) => a.frameworkId === frameworkId);

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">Compliance Management</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">Monitor regulatory alignment across African jurisdictions.</p>
        </div>
      </div>

      {error && (
        <div className="mb-[16px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[11px] text-[#71717A] mb-[20px]">Loading compliance data...</div>
      ) : (
        <>
          {assessments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[20px]">
              {assessments.map((asmt) => (
                <div key={asmt.id} className="bg-[#141417] border border-[#2A2A2E] rounded-[8px] p-[18px] hover:border-[#3a3a3e] transition-colors">
                  <div className="flex justify-between items-start mb-[14px]">
                    <div>
                      <div className="text-[13px] font-semibold text-white leading-[1.3]">{asmt.framework.name}</div>
                      <div className="text-[10px] text-[#71717A] mt-[3px] uppercase tracking-[0.08em]">{asmt.framework.jurisdiction}</div>
                    </div>
                    <span className={`badge-refined ${asmt.status === 'COMPLETED' ? 'bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]' : 'bg-[rgba(234,179,8,0.12)] text-[#facc15] border-[rgba(234,179,8,0.25)]'}`}>
                      {asmt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-[8px] flex justify-between items-center">
                    <span className="text-[11px] text-[#71717A]">Compliance score</span>
                    <span className="text-[16px] font-bold text-white">{asmt.score}%</span>
                  </div>
                  <div className="w-full h-[5px] bg-[#0A0A0B] border border-[#2A2A2E] rounded-[3px] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-400 rounded-[3px] ${asmt.status === 'COMPLETED' ? 'bg-[#22c55e]' : 'bg-[#7C3AED]'}`}
                      style={{ width: `${asmt.score}%` }}
                    ></div>
                  </div>
                  <div className="mt-[14px] pt-[12px] border-t border-[#2A2A2E] flex justify-between items-center">
                    <span className="text-[10px] text-[#71717A]">
                      Updated {new Date(asmt.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <Link href={`/dashboard/compliance/${asmt.id}`} className="inline-flex items-center gap-[4px] text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.06em] hover:underline cursor-pointer">
                      <span>Open Tracker</span>
                      <ExternalLink className="w-[10px] h-[10px]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card-refined">
            <h3 className="text-[13px] font-semibold text-white mb-[14px]">Regulatory frameworks</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2A2E]">
                    <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Framework name</th>
                    <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Jurisdiction</th>
                    <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Requirements</th>
                    <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Version</th>
                    <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {frameworks.map((fw) => {
                    const existing = assessmentFor(fw.id);
                    return (
                      <tr key={fw.id}>
                        <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-white">{fw.name}</td>
                        <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">{fw.jurisdiction}</td>
                        <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">{fw._count.requirements}</td>
                        <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">{fw.version}</td>
                        <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-right">
                          {existing ? (
                            <Link href={`/dashboard/compliance/${existing.id}`} className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.06em] hover:underline cursor-pointer">
                              Open
                            </Link>
                          ) : (
                            <button
                              className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.06em] hover:underline cursor-pointer disabled:opacity-50"
                              disabled={startingId === fw.id}
                              onClick={() => handleStart(fw.id)}
                            >
                              {startingId === fw.id ? 'Starting...' : 'Start'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
