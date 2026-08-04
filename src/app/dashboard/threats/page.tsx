"use client";

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ShieldAlert, Plus, Filter, X } from 'lucide-react';

type Threat = {
  id: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  updatedAt: string;
  _count: { incidents: number };
};

const THREAT_TYPES = ['PHISHING', 'MALWARE', 'RANSOMWARE', 'DDOS', 'BRUTE_FORCE', 'SQL_INJECTION', 'XSS', 'ZERO_DAY'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const severityClass: Record<string, string> = {
  CRITICAL: 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border-[rgba(239,68,68,0.25)]',
  HIGH: 'bg-[rgba(249,115,22,0.12)] text-[#fb923c] border-[rgba(249,115,22,0.25)]',
  MEDIUM: 'bg-[rgba(234,179,8,0.12)] text-[#facc15] border-[rgba(234,179,8,0.25)]',
  LOW: 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
};

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: THREAT_TYPES[0], severity: 'MEDIUM' });

  const loadThreats = () => {
    setLoading(true);
    fetch('/api/threats')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load threats (${res.status})`);
        return res.json();
      })
      .then((data) => setThreats(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadThreats, []);

  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      if (severityFilter !== 'All' && t.severity !== severityFilter) return false;
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;
      return true;
    });
  }, [threats, severityFilter, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to register threat (${res.status})`);
      }
      setForm({ title: '', description: '', type: THREAT_TYPES[0], severity: 'MEDIUM' });
      setShowForm(false);
      loadThreats();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">Threat Intelligence</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">Catalog and analyze active threat vectors targeting your infrastructure.</p>
        </div>
        <button className="btn-primary-refined" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="w-[14px] h-[14px]" /> : <Plus className="w-[14px] h-[14px]" />}
          <span>{showForm ? 'Cancel' : 'Register Threat'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-refined mb-[16px] space-y-[12px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            <div>
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
            <div className="grid grid-cols-2 gap-[12px]">
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Type</label>
                <select
                  className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {THREAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Severity</label>
                <select
                  className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Description</label>
            <textarea
              className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED] min-h-[70px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              minLength={10}
              required
            />
          </div>
          {formError && (
            <div className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[8px_10px]">
              {formError}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary-refined disabled:opacity-60">
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      <div className="card-refined">
        <div className="flex items-center gap-[10px] mb-[16px]">
          <Filter className="text-[#71717A] w-[13px] h-[13px]" />
          <select
            className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[6px_10px] text-[#71717A] text-[11px] outline-none cursor-pointer focus:border-[#7C3AED]"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[6px_10px] text-[#71717A] text-[11px] outline-none cursor-pointer focus:border-[#7C3AED]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All types</option>
            {THREAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-[10px] text-[#71717A] ml-auto">{filteredThreats.length} threats</span>
        </div>

        {error && (
          <div className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px] mb-[12px]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">Loading threats...</div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">No threats match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2E]">
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Threat identifier</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Type</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Severity</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-center">Incidents</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredThreats.map((threat) => (
                  <tr key={threat.id} className="transition-colors duration-120 hover:bg-[rgba(124,58,237,0.04)]">
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)]">
                      <div className="flex items-center gap-[10px]">
                        <div className="w-[28px] h-[28px] rounded-[5px] border border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-center flex-shrink-0">
                          <ShieldAlert className="w-[13px] h-[13px] text-[#7C3AED]" />
                        </div>
                        <span className="text-white font-medium">{threat.title}</span>
                      </div>
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)]">
                      <span className="text-[10px] font-semibold text-[#71717A] font-mono tracking-[0.04em]">{threat.type}</span>
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)]">
                      <span className={`badge-refined ${severityClass[threat.severity] ?? severityClass.MEDIUM}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-center text-white">{threat._count.incidents}</td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">
                      {new Date(threat.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
