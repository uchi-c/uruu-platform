import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Eye,
  FileText,
  Share2,
  Lock,
  Search,
  ShieldCheck,
  Zap,
  Landmark,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import { BRAND_CONTENT } from '@/content';

const PILLARS = [
  { icon: Eye, title: 'Awareness', description: 'Support structured awareness and digital trust activities.' },
  { icon: FileText, title: 'Reporting', description: 'Create stronger reporting discipline around operational processes.' },
  { icon: Share2, title: 'Workflow intelligence', description: 'Bring operational workflows into a more structured environment.' },
  { icon: Lock, title: 'Process control', description: 'Support trust-sensitive processes with greater structure and control.' },
];

const SERVICES = [
  { icon: Search, title: 'AI Workflow Assessments', description: 'Assess how AI-enabled workflows can be structured and improved.' },
  { icon: ShieldCheck, title: 'Governance Improvement Support', description: 'Support stronger digital processes, governance, and operational discipline.' },
  { icon: Zap, title: 'AI Workflow Automation', description: 'Apply automation to make structured workflows more effective.' },
  { icon: ShieldAlert, title: 'Phishing Simulation & Awareness Programs', description: 'Support awareness and practical security behavior through structured programs.' },
];

const MARKETS = [
  { icon: Landmark, title: 'Government', description: 'Digital operations, workflow discipline, reporting, and trust-sensitive processes.' },
  { icon: GraduationCap, title: 'Education', description: 'Structured digital workflows, awareness, reporting, and institutional process support.' },
  { icon: HeartHandshake, title: 'NGOs', description: 'Operational workflows, reporting discipline, governance support, and secure digital processes.' },
];

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Nav */}
      <div className="flex items-center justify-between p-[22px_64px] border-b border-[#2A2A2E]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] rounded-[8px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center text-[#7C3AED]">
            <ShieldAlert className="w-[18px] h-[18px]" />
          </div>
          <span className="font-mono text-[13px] font-bold tracking-[0.25em] text-white">{BRAND_CONTENT.appName}</span>
        </div>
        <div className="flex items-center gap-[24px]">
          <span className="hidden sm:inline text-[11px] text-[#71717A] tracking-[0.1em] uppercase">{BRAND_CONTENT.companyName}</span>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-[8px] p-[10px_18px] bg-transparent border border-[#2A2A2E] rounded-[6px] text-[#E1E1E6] text-[11px] font-bold tracking-[0.08em] uppercase transition-all hover:border-[#7C3AED] hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative p-[100px_24px_90px] text-center overflow-hidden sm:p-[100px_64px_90px]">
        <div className="grid-bg-refined"></div>
        <div
          className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)' }}
        ></div>

        <div className="relative z-[1] max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-[8px] p-[6px_14px] border border-[rgba(124,58,237,0.3)] rounded-[20px] bg-[rgba(124,58,237,0.08)] mb-[28px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)]"></span>
            <span className="font-mono text-[10px] text-[#a1a1aa] tracking-[0.12em] uppercase">Zambia / Africa</span>
          </div>

          <h1 className="text-[32px] sm:text-[44px] leading-[1.15] font-extrabold text-white mb-[24px] tracking-[-0.01em]">
            Digital Trust <span className="text-[#7C3AED]">·</span> Secure Systems <span className="text-[#7C3AED]">·</span> Institutional Intelligence
          </h1>

          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[#A1A1AA] mb-[40px]">
            {BRAND_CONTENT.descriptions.elevator}
          </p>

          <Link href="/auth/login" className="btn-primary-refined !p-[12px_22px] !text-[12px]">
            Access Platform
            <ArrowRight className="w-[14px] h-[14px]" />
          </Link>
        </div>
      </div>

      {/* What URUU does */}
      <div className="relative z-[1] p-[72px_24px] sm:p-[72px_64px] border-t border-[#2A2A2E]">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-[40px] max-w-[560px]">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C3AED] mb-[10px]">Flagship Platform</div>
            <h2 className="text-[22px] font-bold text-white tracking-[-0.01em]">What {BRAND_CONTENT.appName} does</h2>
            <p className="text-[13px] text-[#71717A] mt-[10px] leading-[1.6]">
              {BRAND_CONTENT.appName} is Shadow Root&apos;s secure workflow and intelligence platform — combining awareness, reporting, workflow intelligence, and trust-sensitive process control in one structured environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            {PILLARS.map((p) => (
              <div key={p.title} className="card-refined">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-[#7C3AED] mb-[16px]">
                  <p.icon className="w-[17px] h-[17px]" />
                </div>
                <div className="text-[14px] font-bold text-white mb-[8px]">{p.title}</div>
                <div className="text-[12px] text-[#71717A] leading-[1.55]">{p.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="relative z-[1] p-[72px_24px] sm:p-[72px_64px] border-t border-[#2A2A2E] bg-[#0d0d0f]">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-[40px] max-w-[560px]">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C3AED] mb-[10px]">Services</div>
            <h2 className="text-[22px] font-bold text-white tracking-[-0.01em]">Practical capability, delivered now</h2>
            <p className="text-[13px] text-[#71717A] mt-[10px] leading-[1.6]">
              Immediate practical value while reinforcing our broader digital trust and secure systems direction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            {SERVICES.map((s) => (
              <div key={s.title} className="card-refined">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-[#7C3AED] mb-[16px]">
                  <s.icon className="w-[17px] h-[17px]" />
                </div>
                <div className="text-[13px] font-bold text-white mb-[8px] leading-[1.4]">{s.title}</div>
                <div className="text-[12px] text-[#71717A] leading-[1.55]">{s.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Markets */}
      <div className="relative z-[1] p-[72px_24px] sm:p-[72px_64px] border-t border-[#2A2A2E]">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-[40px] max-w-[560px]">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C3AED] mb-[10px]">Markets</div>
            <h2 className="text-[22px] font-bold text-white tracking-[-0.01em]">Built for institutional environments</h2>
            <p className="text-[13px] text-[#71717A] mt-[10px] leading-[1.6]">
              Designed to support conversations with institutions where digital trust, structured workflows, reporting discipline, and governance matter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
            {MARKETS.map((m) => (
              <div key={m.title} className="card-refined">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-[#7C3AED] mb-[16px]">
                  <m.icon className="w-[17px] h-[17px]" />
                </div>
                <div className="text-[14px] font-bold text-white mb-[10px]">{m.title}</div>
                <div className="text-[12px] text-[#71717A] leading-[1.55]">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="relative z-[1] p-[80px_24px] sm:p-[80px_64px] border-t border-[#2A2A2E] overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        ></div>
        <div className="relative z-[1] max-w-[760px] mx-auto text-center">
          <HeartHandshake className="w-[26px] h-[26px] text-[#7C3AED] mx-auto mb-[22px]" />
          <p className="text-[17px] sm:text-[19px] leading-[1.55] text-[#E1E1E6] font-medium mb-[36px]">
            &ldquo;Whether through assessments, governance support, targeted delivery, or {BRAND_CONTENT.appName}-aligned pilots, Shadow Root is building with partners who are ready to move from fragmented systems toward stronger institutional intelligence and trust.&rdquo;
          </p>
          <Link href="/auth/login" className="btn-primary-refined !p-[12px_22px] !text-[12px]">
            Access Platform
            <ArrowRight className="w-[14px] h-[14px]" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-[26px_24px] sm:p-[26px_64px] border-t border-[#2A2A2E] flex flex-col sm:flex-row items-center gap-[10px] sm:justify-between">
        <span className="font-mono text-[10px] text-[#71717A] tracking-[0.15em] uppercase">{BRAND_CONTENT.companyName}</span>
        <div className="flex items-center gap-[8px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)]"></span>
          <span className="font-mono text-[10px] text-[#71717A] tracking-[0.1em] uppercase">Zambia / Africa</span>
        </div>
      </div>
    </div>
  );
}
