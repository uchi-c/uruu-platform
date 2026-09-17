"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldAlert, User, Lock, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { BRAND_CONTENT } from '@/content';

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return '/dashboard';

  // Relative path — safe by construction, can never point at another host.
  // (`//evil.com` is browser-parsed as protocol-relative absolute — reject it too.)
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }

  // NextAuth's middleware builds callbackUrl as a full absolute URL
  // (e.g. http://localhost:3000/dashboard/threats), so that's the common
  // case, not the exception. Accept it only when same-origin, to avoid an
  // open redirect via a crafted ?callbackUrl=https://evil.com link.
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.origin === window.location.origin) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // fall through to default
    }
  }

  return '/dashboard';
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        otp,
      });

      if (result?.error) {
        if (result.error === 'MFA code required') {
          setNeedsOtp(true);
        } else {
          setError(result.error);
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0B] relative overflow-hidden">
      <div className="scanline"></div>

      {/* Brand panel — hidden below lg, sets the "security operations" tone */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between p-[56px] border-r border-[#2A2A2E] overflow-hidden">
        <div className="grid-bg-refined"></div>
        <div
          className="absolute -top-[120px] -left-[120px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
        ></div>

        <div className="relative z-[1]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center text-[#7C3AED]">
              <ShieldAlert className="w-[20px] h-[20px]" />
            </div>
            <span className="text-[13px] font-bold tracking-[0.25em] text-white font-mono">{BRAND_CONTENT.appName}</span>
          </div>
        </div>

        <div className="relative z-[1] max-w-[380px]">
          <div className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-[14px]">{BRAND_CONTENT.companyName}</div>
          <h1 className="text-[28px] leading-[1.25] font-bold text-white mb-[16px]">
            {BRAND_CONTENT.taglines.main}
          </h1>
          <p className="text-[13px] leading-[1.6] text-[#A1A1AA] mb-[28px]">
            {BRAND_CONTENT.descriptions.elevator}
          </p>
          <ul className="space-y-[10px]">
            {BRAND_CONTENT.valueProps.slice(0, 4).map((prop) => (
              <li key={prop} className="flex items-center gap-[10px] text-[12px] text-[#E1E1E6]">
                <CheckCircle2 className="w-[14px] h-[14px] text-[#7C3AED] flex-shrink-0" />
                <span>{prop}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-[1] flex items-center gap-[8px] text-[10px] text-[#71717A] tracking-[0.1em] uppercase">
          <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)]"></span>
          <span>All systems operational</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-[24px] relative">
        <div className="grid-bg-refined lg:hidden"></div>

        <div className="login-box-refined w-full max-w-[380px]">
          <div className="text-center mb-[28px]">
            <div className="w-[56px] h-[56px] rounded-[10px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center m-[0_auto_12px] text-[#7C3AED]">
              <ShieldAlert className="w-[32px] h-[32px]" />
            </div>
            <div className="text-[20px] font-bold tracking-[0.25em] text-white font-mono">
              {BRAND_CONTENT.appName} <span className="text-[#7C3AED]">ACCESS</span>
            </div>
            <div className="w-[40px] h-[2px] bg-[#7C3AED] rounded-[1px] m-[10px_auto_8px]"></div>
            <div className="text-[10px] text-[#71717A] tracking-[0.15em] uppercase">Shadow Root Operations</div>
          </div>

          <form onSubmit={handleLogin} className="space-y-[18px]">
            <div className="form-group">
              <label htmlFor="login-email" className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">Operator identity</label>
              <div className="relative">
                <User className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
                <input
                  id="login-email"
                  className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_12px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  type="email"
                  placeholder="operator@organization.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">Cryptographic key</label>
              <div className="relative">
                <Lock className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
                <input
                  id="login-password"
                  className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_36px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E1E1E6] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[14px] h-[14px]" /> : <Eye className="w-[14px] h-[14px]" />}
                </button>
              </div>
            </div>

            {needsOtp && (
              <div className="form-group">
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">MFA code</label>
                <div className="relative">
                  <KeyRound className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
                  <input
                    className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_12px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all tracking-[0.3em]"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div data-testid="error-message" className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="login-btn w-full p-[13px] bg-[#7C3AED] border-none rounded-[6px] text-white text-[12px] font-bold tracking-[0.2em] uppercase cursor-pointer flex items-center justify-center gap-[8px] transition-all hover:bg-[#6d28d9] hover:shadow-[0_0_0_3px_rgba(124,58,237,0.25)] mt-[8px] disabled:opacity-60 disabled:cursor-not-allowed">
              <span>{isSubmitting ? 'Authenticating...' : 'Authenticate'}</span>
              {!isSubmitting && <ArrowRight className="w-[14px] h-[14px]" />}
            </button>
          </form>

          <div className="flex justify-between mt-[24px] pt-[16px] border-t border-[rgba(42,42,46,0.6)]">
            <span className="text-[9px] text-[rgba(113,113,122,0.5)] tracking-[0.12em] uppercase">Auth v4.2.1 · Secure</span>
            <span className="text-[9px] text-[#7C3AED] font-bold tracking-[0.12em] uppercase cursor-pointer hover:underline">Contact support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
