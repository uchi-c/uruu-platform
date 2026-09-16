"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAIAssistant } from '@/hooks/useAIAssistant';

const STATUSES = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];

const statusBadgeClass: Record<string, string> = {
  OPEN: 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border-[rgba(239,68,68,0.25)]',
  INVESTIGATING: 'bg-[rgba(234,179,8,0.12)] text-[#facc15] border-[rgba(234,179,8,0.25)]',
  CONTAINED: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
  RESOLVED: 'bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]',
  CLOSED: 'bg-[#71717A]/15 text-[#a1a1aa] border-[#71717A]/20',
};

type TimelineEntry = {
  id: string;
  action: string;
  timestamp: string;
  metadata: any;
  user: { name: string | null; email: string } | null;
};

type IncidentDetail = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  threat: { id: string; title: string; type: string; severity: string; description: string } | null;
  timeline: TimelineEntry[];
};

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { loading: aiLoading, response: aiResponse, analyzeIncident } = useAIAssistant();

  const load = () => {
    fetch(`/api/incidents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Incident not found' : `Failed to load incident (${res.status})`);
        return res.json();
      })
      .then(setIncident)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-[20px]">
        <div className="flex items-center gap-[14px]">
          <Link href="/dashboard/incidents" className="p-[8px] bg-[#141417] border border-[#2A2A2E] rounded-[6px] hover:border-[#7C3AED] transition-colors">
            <ChevronLeft className="w-[16px] h-[16px] text-white" />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">{incident?.title ?? (error ? 'Incident' : 'Loading...')}</h1>
            <p className="text-[12px] text-[#71717A] mt-[3px]">ID: {id}</p>
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
            {error}
          </div>
        )}

        {incident && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
            <div className="lg:col-span-2 space-y-[16px]">
              <div className="card-refined space-y-[14px]">
                <h3 className="text-white font-semibold text-[13px]">Timeline</h3>
                {incident.timeline.length === 0 ? (
                  <div className="text-[12px] text-[#71717A]">No recorded activity for this incident yet.</div>
                ) : (
                  <div className="space-y-[12px]">
                    {incident.timeline.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-[12px] pb-[12px] border-b border-[#2A2A2E] last:border-0 last:pb-0">
                        <Clock className="w-[13px] h-[13px] text-[#7C3AED] mt-[2px] flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] text-white font-medium">{entry.action.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-[#71717A] mt-[2px]">
                            {entry.user?.name ?? entry.user?.email ?? 'Unknown user'} · {new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {incident.threat && (
                <div className="card-refined space-y-[10px]">
                  <div className="flex items-center gap-[8px]">
                    <ShieldAlert className="w-[14px] h-[14px] text-[#7C3AED]" />
                    <h3 className="text-white font-semibold text-[13px]">Linked threat</h3>
                  </div>
                  <div>
                    <div className="text-[13px] text-white font-medium">{incident.threat.title}</div>
                    <div className="text-[10px] text-[#71717A] font-mono mt-[3px]">{incident.threat.type} · {incident.threat.severity}</div>
                    <p className="text-[12px] text-[#E1E1E6] mt-[8px]">{incident.threat.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-[16px]">
              <div className="card-refined">
                <h3 className="text-[14px] font-semibold text-white mb-[14px]">Status</h3>
                <span className={`badge-refined block text-center mb-[14px] ${statusBadgeClass[incident.status] ?? ''}`}>{incident.status}</span>
                <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.09em]">Update status</label>
                <select
                  className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] mt-[6px] p-[8px_10px] text-[12px] text-white outline-none focus:border-[#7C3AED]"
                  value={incident.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pt-[14px] mt-[14px] border-t border-[#2A2A2E] space-y-[8px] text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Created</span>
                    <span className="text-white">{new Date(incident.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Last updated</span>
                    <span className="text-white">{new Date(incident.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="card-refined">
                <div className="flex items-center gap-[8px] mb-[14px]">
                  <Sparkles className="w-[14px] h-[14px] text-[#7C3AED]" />
                  <h3 className="text-[14px] font-semibold text-white">AI Analysis</h3>
                </div>
                {!aiResponse?.summary && (
                  <button
                    onClick={() => analyzeIncident(id)}
                    disabled={aiLoading}
                    className="btn-primary-refined w-full justify-center text-[12px] disabled:opacity-60"
                  >
                    {aiLoading ? 'Analyzing...' : aiResponse?.error ? 'Retry Analysis' : 'Run AI Analysis'}
                  </button>
                )}
                {aiResponse?.error && (
                  <div className="text-[12px] text-[#ef4444] mt-[10px]">{aiResponse.error}</div>
                )}
                {aiResponse?.summary && (
                  <div className="space-y-[12px]">
                    <span className={`badge-refined ${statusBadgeClass[aiResponse.riskLevel === 'CRITICAL' || aiResponse.riskLevel === 'HIGH' ? 'OPEN' : aiResponse.riskLevel === 'MEDIUM' ? 'INVESTIGATING' : 'RESOLVED'] ?? ''}`}>
                      {aiResponse.riskLevel} RISK
                    </span>
                    <p className="text-[12px] text-[#E1E1E6] leading-relaxed">{aiResponse.summary}</p>
                    <div>
                      <div className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.09em] mb-[8px]">Recommendations</div>
                      <ul className="space-y-[6px]">
                        {aiResponse.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-[12px] text-[#E1E1E6] flex gap-[8px]">
                            <span className="text-[#7C3AED]">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
