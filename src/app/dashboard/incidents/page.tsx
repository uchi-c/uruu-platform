"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AlertTriangle, Plus, Search, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

type Threat = { id: string; title: string };
type Incident = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  threat: { id: string; title: string } | null;
};

const STATUSES = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];

const statusIconClass: Record<string, string> = {
  OPEN: 'text-[#f87171]',
  INVESTIGATING: 'text-[#facc15]',
  CONTAINED: 'text-[#60a5fa]',
  RESOLVED: 'text-[#4ade80]',
  CLOSED: 'text-[#71717A]',
};

const statusBadgeClass: Record<string, string> = {
  OPEN: 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border-[rgba(239,68,68,0.25)]',
  INVESTIGATING: 'bg-[rgba(234,179,8,0.12)] text-[#facc15] border-[rgba(234,179,8,0.25)]',
  CONTAINED: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
  RESOLVED: 'bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]',
  CLOSED: 'bg-[#71717A]/15 text-[#a1a1aa] border-[#71717A]/20',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', status: 'OPEN', threatId: '' });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadIncidents = () => {
    setLoading(true);
    fetch('/api/incidents')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load incidents (${res.status})`);
        return res.json();
      })
      .then(setIncidents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
    fetch('/api/threats')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setThreats(data))
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, threatId: form.threatId || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to create incident (${res.status})`);
      }
      setForm({ title: '', status: 'OPEN', threatId: '' });
      setShowForm(false);
      loadIncidents();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
    } catch (e: any) {
      setError(e.message);
      loadIncidents();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return inc.title.toLowerCase().includes(q) || inc.id.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">Incident Response</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">Track and resolve security incidents across all managed environments.</p>
        </div>
        <button className="btn-primary-refined" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="w-[14px] h-[14px]" /> : <Plus className="w-[14px] h-[14px]" />}
          <span>{showForm ? 'Cancel' : 'Create Incident'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-refined mb-[16px] space-y-[12px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Title</label>
              <input
                className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                minLength={3}
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Status</label>
              <select
                className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Related threat (optional)</label>
              <select
                className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                value={form.threatId}
                onChange={(e) => setForm({ ...form, threatId: e.target.value })}
              >
                <option value="">None</option>
                {threats.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>
          {formError && (
            <div className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[8px_10px]">
              {formError}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary-refined disabled:opacity-60">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="card-refined">
        <div className="relative mb-[16px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#71717A]" />
          <input
            type="text"
            placeholder="Search incidents by title or ID…"
            className="w-full max-w-[280px] bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[7px_12px_7px_30px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px] mb-[12px]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">Loading incidents...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">No incidents match the current search.</div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {filteredIncidents.map((inc) => (
              <div key={inc.id} className="incident-row-refined !items-start !cursor-default">
                <div className="flex items-start gap-[12px] flex-1">
                  <AlertTriangle className={`w-[16px] h-[16px] mt-[1px] flex-shrink-0 ${statusIconClass[inc.status] ?? ''}`} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-white">{inc.title}</div>
                    <div className="text-[10px] text-[#71717A] mt-[3px] font-mono tracking-[0.04em]">ID: {inc.id} · Threat: {inc.threat?.title ?? 'N/A'}</div>
                    <div className="mt-[10px] pt-[10px] border-t border-[#2A2A2E] flex justify-between items-center">
                      <span className="text-[10px] text-[#71717A]">
                        {new Date(inc.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Link href={`/dashboard/incidents/${inc.id}`} className="inline-flex items-center gap-[4px] text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.06em] hover:underline cursor-pointer">
                        <span>View timeline</span>
                        <ExternalLink className="w-[10px] h-[10px]" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right ml-[16px]">
                  <select
                    className={`badge-refined cursor-pointer outline-none ${statusBadgeClass[inc.status] ?? ''} ${updatingId === inc.id ? 'opacity-50' : ''}`}
                    value={inc.status}
                    disabled={updatingId === inc.id}
                    onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
