"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ShieldAlert, AlertTriangle, CheckSquare, Activity, LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { DASHBOARD_CONTENT } from '@/content';

type DashboardStats = {
  openIncidents: number;
  activeThreats: number;
  complianceScore: number | null;
  systemHealth: 'Optimal' | 'Degraded';
  recentIncidents: { id: string; title: string; status: string; updatedAt: string }[];
  incidentTrend: { date: string; count: number }[];
};

const OPEN_STATUSES = new Set(['OPEN', 'INVESTIGATING', 'CONTAINED']);

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const [time, setTime] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
        return res.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const statCards = [
    {
      label: DASHBOARD_CONTENT.metrics.incidents.title,
      value: stats ? String(stats.openIncidents) : '—',
      icon: ShieldAlert,
      color: '#ef4444',
      bgColor: 'rgba(239,68,68,0.12)',
    },
    {
      label: DASHBOARD_CONTENT.metrics.threats.title,
      value: stats ? String(stats.activeThreats) : '—',
      icon: AlertTriangle,
      color: '#eab308',
      bgColor: 'rgba(234,179,8,0.12)',
    },
    {
      label: DASHBOARD_CONTENT.metrics.compliance.title,
      value: stats ? (stats.complianceScore === null ? 'No data' : `${stats.complianceScore}%`) : '—',
      icon: CheckSquare,
      color: '#22c55e',
      bgColor: 'rgba(34,197,94,0.12)',
    },
    {
      label: 'System Health',
      value: stats ? stats.systemHealth : '—',
      icon: Activity,
      color: stats?.systemHealth === 'Degraded' ? '#ef4444' : '#7C3AED',
      bgColor: stats?.systemHealth === 'Degraded' ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)',
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em] uppercase">{DASHBOARD_CONTENT.heading}</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">{DASHBOARD_CONTENT.subheading}</p>
        </div>
        <span className="text-[10px] text-[#71717A] font-mono">LIVE · {time} WAT</span>
      </div>

      {error && (
        <div className="mb-[16px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[20px]">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card-refined" style={{ borderLeftColor: stat.color }}>
            <div className="w-[38px] h-[38px] rounded-[6px] flex items-center justify-center text-[16px] flex-shrink-0" style={{ background: stat.bgColor }}>
              <stat.icon className="w-[18px] h-[18px]" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] uppercase tracking-[0.08em] font-semibold">{stat.label}</div>
              <div className="text-[22px] font-bold text-white line-height-[1.1] mt-[2px]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        <div className="card-refined">
          <h3 className="text-[13px] font-semibold text-white mb-[14px]">Incident trend (14 days)</h3>
          {stats && stats.incidentTrend.some((d) => d.count > 0) ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                  <XAxis dataKey="date" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={{ stroke: '#2A2A2E' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#71717A', fontSize: 10 }} axisLine={{ stroke: '#2A2A2E' }} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ background: '#0A0A0B', border: '1px solid #2A2A2E', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: '#a1a1aa' }} />
                  <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-[8px] border border-dashed border-[#2A2A2E] rounded-[6px] text-[#71717A]">
              <LineChartIcon className="w-[28px] h-[28px] opacity-40" />
              <span className="text-[11px]">{DASHBOARD_CONTENT.charts.incidentTrend.title}</span>
              <span className="text-[10px] text-white/30">{DASHBOARD_CONTENT.charts.incidentTrend.noData}</span>
            </div>
          )}
        </div>
        <div className="card-refined">
          <h3 className="text-[13px] font-semibold text-white mb-[14px]">Recent incidents</h3>
          {stats && stats.recentIncidents.length > 0 ? (
            <div className="space-y-[8px]">
              {stats.recentIncidents.map((inc) => {
                const isOpen = OPEN_STATUSES.has(inc.status);
                return (
                  <div key={inc.id} className="incident-row-refined">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: isOpen ? '#eab308' : '#22c55e' }}></div>
                      <div>
                        <div className="text-[12px] font-medium text-white">{inc.title}</div>
                        <div className="text-[10px] text-[#71717A] mt-[2px]">{timeAgo(inc.updatedAt)}</div>
                      </div>
                    </div>
                    <span className={`badge-refined ${isOpen ? 'bg-[#71717A]/15 text-[#a1a1aa] border-[#71717A]/20' : 'bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]'}`}>
                      {inc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-[#71717A]">No incidents recorded yet.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
