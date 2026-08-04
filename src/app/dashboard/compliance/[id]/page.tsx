"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ComplianceStatusBadge } from '@/components/dashboard/ComplianceStatusBadge';

const RESPONSE_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE'];

type ResponseItem = {
  id: string;
  status: string;
  notes: string | null;
  evidenceUrl: string | null;
  requirement: { id: string; code: string; title: string; description: string };
};

type AssessmentDetail = {
  id: string;
  status: string;
  score: number;
  framework: { name: string; jurisdiction: string; description: string };
  responses: ResponseItem[];
};

export default function AssessmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: string; notes: string; evidenceUrl: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/compliance/assessments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Assessment not found' : `Failed to load assessment (${res.status})`);
        return res.json();
      })
      .then((data: AssessmentDetail) => {
        setAssessment(data);
        setDrafts(
          Object.fromEntries(
            data.responses.map((r) => [r.id, { status: r.status, notes: r.notes ?? '', evidenceUrl: r.evidenceUrl ?? '' }])
          )
        );
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const summary = useMemo(() => {
    if (!assessment) return null;
    const total = assessment.responses.length;
    const decided = assessment.responses.filter((r) => r.status !== 'NOT_STARTED').length;
    const counts = RESPONSE_STATUSES.reduce((acc, s) => {
      acc[s] = assessment.responses.filter((r) => r.status === s).length;
      return acc;
    }, {} as Record<string, number>);
    return { total, decided, completion: total ? Math.round((decided / total) * 100) : 0, counts };
  }, [assessment]);

  const handleSave = async (responseId: string) => {
    const draft = drafts[responseId];
    if (!draft) return;
    setSavingId(responseId);
    try {
      const res = await fetch(`/api/compliance/responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to save (${res.status})`);
      }
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/compliance" className="p-2 bg-shadow-card border border-shadow-border rounded hover:border-shadow-purple transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{assessment?.framework.name ?? (error ? 'Assessment' : 'Loading...')}</h1>
            <p className="text-shadow-muted text-sm mt-0.5">Assessment Progress Tracking</p>
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
            {error}
          </div>
        )}

        {assessment && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {assessment.responses.map((res) => {
                const draft = drafts[res.id] ?? { status: res.status, notes: '', evidenceUrl: '' };
                return (
                  <div key={res.id} className="soc-card space-y-4 hover:border-shadow-purple transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-shadow-purple font-mono text-xs font-bold">{res.requirement.code}</span>
                          <h4 className="text-white font-semibold">{res.requirement.title}</h4>
                        </div>
                        <p className="text-sm text-shadow-muted mt-2">{res.requirement.description}</p>
                      </div>
                      <ComplianceStatusBadge status={res.status as any} />
                    </div>

                    <div className="pt-4 border-t border-shadow-border flex flex-col space-y-4">
                      <div>
                        <label className="text-xs text-shadow-muted uppercase font-bold">Status</label>
                        <select
                          className="w-full bg-shadow-dark border border-shadow-border rounded-md mt-1 p-2 text-sm text-white focus:outline-none focus:border-shadow-purple"
                          value={draft.status}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, status: e.target.value } })}
                        >
                          {RESPONSE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-shadow-muted uppercase font-bold">Implementation Notes</label>
                        <textarea
                          className="w-full bg-shadow-dark border border-shadow-border rounded-md mt-1 p-3 text-sm text-white focus:outline-none focus:border-shadow-purple min-h-[80px]"
                          placeholder="Describe how this requirement is met..."
                          value={draft.notes}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, notes: e.target.value } })}
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-xs text-shadow-muted uppercase font-bold">Evidence URL</label>
                        <input
                          type="text"
                          className="w-full bg-shadow-dark border border-shadow-border rounded-md mt-1 p-2 text-sm text-white focus:outline-none focus:border-shadow-purple"
                          placeholder="https://…"
                          value={draft.evidenceUrl}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, evidenceUrl: e.target.value } })}
                        />
                      </div>

                      <div className="flex justify-end items-center">
                        <button
                          disabled={savingId === res.id}
                          onClick={() => handleSave(res.id)}
                          className="flex items-center space-x-2 bg-shadow-purple/10 hover:bg-shadow-purple/20 text-shadow-purple px-4 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3 h-3" />
                          <span>{savingId === res.id ? 'Saving...' : 'Save Progress'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="soc-card">
                <h3 className="text-lg font-semibold text-white mb-4">Assessment Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-shadow-muted">Requirements decided</span>
                    <span className="text-white font-bold">{summary.completion}%</span>
                  </div>
                  <div className="w-full bg-shadow-dark rounded-full h-2 overflow-hidden border border-shadow-border">
                    <div className="bg-shadow-purple h-full" style={{ width: `${summary.completion}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-shadow-border">
                    <span className="text-shadow-muted">Compliance score</span>
                    <span className="text-white font-bold">{assessment.score}%</span>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-500">Compliant</span>
                      <span className="text-white">{summary.counts.COMPLIANT}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-500">Non-compliant</span>
                      <span className="text-white">{summary.counts.NON_COMPLIANT}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-500">In Progress</span>
                      <span className="text-white">{summary.counts.IN_PROGRESS}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-500">Not Applicable</span>
                      <span className="text-white">{summary.counts.NOT_APPLICABLE}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-shadow-muted">Not Started</span>
                      <span className="text-white">{summary.counts.NOT_STARTED}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-shadow-border text-xs flex justify-between">
                    <span className="text-shadow-muted">Assessment status</span>
                    <span className="text-white font-bold">{assessment.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[10px] text-shadow-muted">
                    Status and score update automatically as requirement statuses are saved — marked COMPLETED once every requirement has been decided.
                  </p>
                </div>
              </div>

              <AiGuidanceCard assessmentId={assessment.id} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

type GuidanceResult = {
  allAddressed: boolean;
  priorityRequirementCode?: string;
  rationale?: string;
  recommendations?: string[];
};

function AiGuidanceCard({ assessmentId }: { assessmentId: string }) {
  const [result, setResult] = useState<GuidanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/compliance-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Failed to generate guidance (${res.status})`);
      setResult(body);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soc-card">
      <div className="flex items-center gap-2 mb-4 text-shadow-purple">
        <Sparkles className="w-4 h-4" />
        <h4 className="font-bold text-sm text-white">AI Guidance</h4>
      </div>

      {!result && (
        <>
          <p className="text-xs text-shadow-muted mb-4">
            Get a prioritized recommendation for which outstanding requirement to tackle next, grounded in this tenant's real incident and threat data.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="soc-button-primary w-full text-sm disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Guidance'}
          </button>
        </>
      )}

      {error && (
        <div className="mt-3 text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[8px_10px]">
          {error}
        </div>
      )}

      {result?.allAddressed && (
        <p className="text-xs text-shadow-text">Every requirement is already compliant or marked not applicable — nothing to prioritize.</p>
      )}

      {result && !result.allAddressed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-shadow-purple font-mono text-xs font-bold">{result.priorityRequirementCode}</span>
            <span className="text-[10px] text-shadow-muted uppercase tracking-wide">Priority</span>
          </div>
          <p className="text-xs text-shadow-text leading-relaxed">{result.rationale}</p>
          <div>
            <div className="text-[10px] text-shadow-muted uppercase font-bold mb-2">Next steps</div>
            <ul className="space-y-1.5">
              {result.recommendations?.map((rec, i) => (
                <li key={i} className="text-xs text-shadow-text flex gap-2">
                  <span className="text-shadow-purple">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="text-[10px] font-bold text-shadow-purple uppercase tracking-wide hover:underline cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}
    </div>
  );
}
