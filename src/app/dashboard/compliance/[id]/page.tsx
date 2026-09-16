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
      <div className="space-y-[20px]">
        <div className="flex items-center gap-[14px]">
          <Link href="/dashboard/compliance" className="p-[8px] bg-[#141417] border border-[#2A2A2E] rounded-[6px] hover:border-[#7C3AED] transition-colors">
            <ChevronLeft className="w-[16px] h-[16px] text-white" />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">{assessment?.framework.name ?? (error ? 'Assessment' : 'Loading...')}</h1>
            <p className="text-[12px] text-[#71717A] mt-[3px]">Assessment Progress Tracking</p>
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
            {error}
          </div>
        )}

        {assessment && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
            <div className="lg:col-span-2 space-y-[14px]">
              {assessment.responses.map((res) => {
                const draft = drafts[res.id] ?? { status: res.status, notes: '', evidenceUrl: '' };
                return (
                  <div key={res.id} className="card-refined space-y-[14px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[#7C3AED] font-mono text-[11px] font-bold">{res.requirement.code}</span>
                          <h4 className="text-white font-semibold text-[13px]">{res.requirement.title}</h4>
                        </div>
                        <p className="text-[12px] text-[#71717A] mt-[8px]">{res.requirement.description}</p>
                      </div>
                      <ComplianceStatusBadge status={res.status as any} />
                    </div>

                    <div className="pt-[14px] border-t border-[#2A2A2E] flex flex-col space-y-[14px]">
                      <div>
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.09em]">Status</label>
                        <select
                          className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] mt-[6px] p-[8px_10px] text-[12px] text-white outline-none focus:border-[#7C3AED]"
                          value={draft.status}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, status: e.target.value } })}
                        >
                          {RESPONSE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.09em]">Implementation Notes</label>
                        <textarea
                          className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] mt-[6px] p-[10px_12px] text-[12px] text-white outline-none focus:border-[#7C3AED] min-h-[80px]"
                          placeholder="Describe how this requirement is met..."
                          value={draft.notes}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, notes: e.target.value } })}
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.09em]">Evidence URL</label>
                        <input
                          type="text"
                          className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] mt-[6px] p-[8px_10px] text-[12px] text-white outline-none focus:border-[#7C3AED]"
                          placeholder="https://…"
                          value={draft.evidenceUrl}
                          onChange={(e) => setDrafts({ ...drafts, [res.id]: { ...draft, evidenceUrl: e.target.value } })}
                        />
                      </div>

                      <div className="flex justify-end items-center">
                        <button
                          disabled={savingId === res.id}
                          onClick={() => handleSave(res.id)}
                          className="inline-flex items-center gap-[6px] bg-[rgba(124,58,237,0.1)] hover:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] px-[14px] py-[8px] rounded-[6px] text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          <Save className="w-[12px] h-[12px]" />
                          <span>{savingId === res.id ? 'Saving...' : 'Save Progress'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-[16px]">
              <div className="card-refined">
                <h3 className="text-[14px] font-semibold text-white mb-[14px]">Assessment Summary</h3>
                <div className="space-y-[14px]">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#71717A]">Requirements decided</span>
                    <span className="text-white font-bold">{summary.completion}%</span>
                  </div>
                  <div className="w-full bg-[#0A0A0B] rounded-full h-[8px] overflow-hidden border border-[#2A2A2E]">
                    <div className="bg-[#7C3AED] h-full" style={{ width: `${summary.completion}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[12px] pt-[8px] border-t border-[#2A2A2E]">
                    <span className="text-[#71717A]">Compliance score</span>
                    <span className="text-white font-bold">{assessment.score}%</span>
                  </div>

                  <div className="pt-[8px] space-y-[8px]">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#4ade80]">Compliant</span>
                      <span className="text-white">{summary.counts.COMPLIANT}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#f87171]">Non-compliant</span>
                      <span className="text-white">{summary.counts.NON_COMPLIANT}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#facc15]">In Progress</span>
                      <span className="text-white">{summary.counts.IN_PROGRESS}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#60a5fa]">Not Applicable</span>
                      <span className="text-white">{summary.counts.NOT_APPLICABLE}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#71717A]">Not Started</span>
                      <span className="text-white">{summary.counts.NOT_STARTED}</span>
                    </div>
                  </div>

                  <div className="pt-[8px] border-t border-[#2A2A2E] text-[11px] flex justify-between">
                    <span className="text-[#71717A]">Assessment status</span>
                    <span className="text-white font-bold">{assessment.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[10px] text-[#71717A]">
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
    <div className="card-refined">
      <div className="flex items-center gap-[8px] mb-[14px] text-[#7C3AED]">
        <Sparkles className="w-[14px] h-[14px]" />
        <h4 className="font-bold text-[13px] text-white">AI Guidance</h4>
      </div>

      {!result && (
        <>
          <p className="text-[11px] text-[#71717A] mb-[14px]">
            Get a prioritized recommendation for which outstanding requirement to tackle next, grounded in this tenant's real incident and threat data.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary-refined w-full justify-center text-[12px] disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Guidance'}
          </button>
        </>
      )}

      {error && (
        <div className="mt-[10px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[8px_10px]">
          {error}
        </div>
      )}

      {result?.allAddressed && (
        <p className="text-[11px] text-[#E1E1E6]">Every requirement is already compliant or marked not applicable — nothing to prioritize.</p>
      )}

      {result && !result.allAddressed && (
        <div className="space-y-[12px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[#7C3AED] font-mono text-[11px] font-bold">{result.priorityRequirementCode}</span>
            <span className="text-[10px] text-[#71717A] uppercase tracking-[0.06em]">Priority</span>
          </div>
          <p className="text-[11px] text-[#E1E1E6] leading-relaxed">{result.rationale}</p>
          <div>
            <div className="text-[10px] text-[#71717A] uppercase font-bold mb-[8px]">Next steps</div>
            <ul className="space-y-[6px]">
              {result.recommendations?.map((rec, i) => (
                <li key={i} className="text-[11px] text-[#E1E1E6] flex gap-[8px]">
                  <span className="text-[#7C3AED]">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.06em] hover:underline cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}
    </div>
  );
}
