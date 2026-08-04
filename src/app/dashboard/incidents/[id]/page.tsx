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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/incidents" className="p-2 bg-shadow-card border border-shadow-border rounded hover:border-shadow-purple transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{incident?.title ?? (error ? 'Incident' : 'Loading...')}</h1>
            <p className="text-shadow-muted text-sm mt-0.5">ID: {id}</p>
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
            {error}
          </div>
        )}

        {incident && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="soc-card space-y-4">
                <h3 className="text-white font-semibold text-sm">Timeline</h3>
                {incident.timeline.length === 0 ? (
                  <div className="text-[12px] text-shadow-muted">No recorded activity for this incident yet.</div>
                ) : (
                  <div className="space-y-3">
                    {incident.timeline.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-shadow-border last:border-0 last:pb-0">
                        <Clock className="w-[13px] h-[13px] text-shadow-purple mt-[2px] flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] text-white font-medium">{entry.action.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-shadow-muted mt-[2px]">
                            {entry.user?.name ?? entry.user?.email ?? 'Unknown user'} · {new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {incident.threat && (
                <div className="soc-card space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-[14px] h-[14px] text-shadow-purple" />
                    <h3 className="text-white font-semibold text-sm">Linked threat</h3>
                  </div>
                  <div>
                    <div className="text-[13px] text-white font-medium">{incident.threat.title}</div>
                    <div className="text-[10px] text-shadow-muted font-mono mt-[3px]">{incident.threat.type} · {incident.threat.severity}</div>
                    <p className="text-[12px] text-shadow-text mt-[8px]">{incident.threat.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="soc-card">
                <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                <span className={`badge-refined block text-center mb-4 ${statusBadgeClass[incident.status] ?? ''}`}>{incident.status}</span>
                <label className="text-xs text-shadow-muted uppercase font-bold">Update status</label>
                <select
                  className="w-full bg-shadow-dark border border-shadow-border rounded-md mt-1 p-2 text-sm text-white focus:outline-none focus:border-shadow-purple"
                  value={incident.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pt-4 mt-4 border-t border-shadow-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-shadow-muted">Created</span>
                    <span className="text-white">{new Date(incident.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shadow-muted">Last updated</span>
                    <span className="text-white">{new Date(incident.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="soc-card">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-[14px] h-[14px] text-shadow-purple" />
                  <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
                </div>
                {!aiResponse?.summary && (
                  <button
                    onClick={() => analyzeIncident(id)}
                    disabled={aiLoading}
                    className="soc-button-primary w-full text-sm disabled:opacity-60"
                  >
                    {aiLoading ? 'Analyzing...' : aiResponse?.error ? 'Retry Analysis' : 'Run AI Analysis'}
                  </button>
                )}
                {aiResponse?.error && (
                  <div className="text-[12px] text-[#ef4444] mt-3">{aiResponse.error}</div>
                )}
                {aiResponse?.summary && (
                  <div className="space-y-3">
                    <span className={`badge-refined ${statusBadgeClass[aiResponse.riskLevel === 'CRITICAL' || aiResponse.riskLevel === 'HIGH' ? 'OPEN' : aiResponse.riskLevel === 'MEDIUM' ? 'INVESTIGATING' : 'RESOLVED'] ?? ''}`}>
                      {aiResponse.riskLevel} RISK
                    </span>
                    <p className="text-[12px] text-shadow-text leading-relaxed">{aiResponse.summary}</p>
                    <div>
                      <div className="text-xs text-shadow-muted uppercase font-bold mb-2">Recommendations</div>
                      <ul className="space-y-1.5">
                        {aiResponse.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-[12px] text-shadow-text flex gap-2">
                            <span className="text-shadow-purple">•</span>
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
