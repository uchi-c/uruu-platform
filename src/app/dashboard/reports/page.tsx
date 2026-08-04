"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Download, RefreshCw, BarChart2, CheckSquare, AlertTriangle } from 'lucide-react';

type Report = {
  id: string;
  title: string;
  type: string;
  format: string;
  url: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
};

const REPORT_KINDS = [
  {
    key: 'EXECUTIVE',
    title: 'Executive Briefing',
    description: 'High-level threat matrix, compliance health score, and security maturity overview for stakeholders.',
    icon: BarChart2,
    accent: '#7C3AED',
    buttonLabel: 'Generate Executive PDF',
    buttonClass: 'btn-primary-refined !text-[10px] !tracking-[0.08em] !p-[7px_10px]',
  },
  {
    key: 'COMPLIANCE',
    title: 'Compliance Audit',
    description: 'Detailed checklist reports mapping controls to NDPA, POPIA, or ZDPA regulatory frameworks.',
    icon: CheckSquare,
    accent: '#22c55e',
    buttonLabel: 'Generate Audit Report',
    buttonClass: 'inline-flex items-center justify-center gap-[6px] p-[7px_10px] bg-[#166534] border-none rounded-[6px] text-[#4ade80] text-[10px] font-bold tracking-[0.08em] cursor-pointer w-full transition-all hover:brightness-110 active:scale-95',
  },
  {
    key: 'INCIDENT',
    title: 'Incident Timeline',
    description: 'Chronological breakdowns of incidents, response times, remediation steps, and AI post-mortems.',
    icon: AlertTriangle,
    accent: '#ef4444',
    iconColor: '#f87171',
    buttonLabel: 'Export Incident Logs',
    buttonClass: 'inline-flex items-center justify-center gap-[6px] p-[7px_10px] bg-[#7f1d1d] border-none rounded-[6px] text-[#f87171] text-[10px] font-bold tracking-[0.08em] cursor-pointer w-full transition-all hover:brightness-110 active:scale-95',
  },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function filenameFromDisposition(header: string | null, fallback: string): string {
  const match = header?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/reports')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load reports (${res.status})`);
        return res.json();
      })
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleGenerate = async (kind: (typeof REPORT_KINDS)[number]) => {
    setGeneratingKey(kind.key);
    setError(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${kind.title} — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
          type: kind.key,
          format: 'PDF',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to generate report (${res.status})`);
      }
      const blob = await res.blob();
      const filename = filenameFromDisposition(res.headers.get('Content-Disposition'), `${kind.key.toLowerCase()}-report.pdf`);
      downloadBlob(blob, filename);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGeneratingKey(null);
    }
  };

  const handleDownload = async (report: Report) => {
    setDownloadingId(report.id);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${report.id}/download`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to download report (${res.status})`);
      }
      const blob = await res.blob();
      const filename = filenameFromDisposition(res.headers.get('Content-Disposition'), `${report.type.toLowerCase()}-report.pdf`);
      downloadBlob(blob, filename);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">Reporting Center</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">Generate and export compliance, operational, and executive intelligence.</p>
        </div>
      </div>

      {error && (
        <div className="mb-[16px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] mb-[20px]">
        {REPORT_KINDS.map((kind) => (
          <div key={kind.key} className="bg-[#141417] border border-[#2A2A2E] rounded-[8px] p-[18px] flex flex-col justify-between h-[172px] relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:width-[3px]" style={{ borderLeftColor: kind.accent, borderLeftWidth: 3 }}>
            <div>
              <div className="flex justify-between items-start mb-[8px]">
                <div className="text-[13px] font-semibold text-white">{kind.title}</div>
                <kind.icon className="w-[16px] h-[16px]" style={{ color: kind.iconColor ?? kind.accent }} />
              </div>
              <div className="text-[11px] text-[#71717A] line-height-[1.5]">{kind.description}</div>
            </div>
            <button
              className={`${kind.buttonClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              disabled={generatingKey === kind.key}
              onClick={() => handleGenerate(kind)}
            >
              {generatingKey === kind.key ? 'Generating...' : kind.buttonLabel}
            </button>
          </div>
        ))}
      </div>

      <div className="card-refined">
        <div className="flex justify-between items-center mb-[16px]">
          <h3 className="text-[13px] font-semibold text-white">Export history</h3>
          <button
            onClick={load}
            disabled={loading}
            className="w-[28px] h-[28px] rounded-[5px] border border-[#2A2A2E] bg-transparent flex items-center justify-center cursor-pointer text-[#71717A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-[13px] h-[13px] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-[11px] text-[#71717A] p-[12px]">No reports generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2E]">
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Report name</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Type</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Generated by</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-left">Date</th>
                  <th className="p-[10px_12px] text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="transition-colors duration-120 hover:bg-[rgba(124,58,237,0.04)]">
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)]">
                      <div className="flex items-center gap-[8px]">
                        <FileText className="w-[14px] h-[14px] text-[#7C3AED]" />
                        <span className="text-white font-medium">{report.title}</span>
                      </div>
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)]">
                      <span className="text-[10px] font-semibold text-[#71717A] font-mono tracking-[0.04em] uppercase">{report.type}</span>
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">{report.user?.name ?? report.user?.email ?? 'Unknown'}</td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-[#71717A]">
                      {new Date(report.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-[13px_12px] text-[12px] border-b border-[rgba(42,42,46,0.5)] text-right">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        title="Regenerates the PDF from current data — not a stored copy of the original moment."
                        className="w-[28px] h-[28px] rounded-[5px] border border-[#2A2A2E] bg-transparent flex items-center justify-center cursor-pointer text-[#71717A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all disabled:opacity-50"
                      >
                        <Download className={`w-[13px] h-[13px] ${downloadingId === report.id ? 'animate-pulse' : ''}`} />
                      </button>
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
