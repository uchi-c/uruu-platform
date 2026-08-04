"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldAlert, User, Lock, KeyRound, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] relative overflow-hidden">
      <div className="grid-bg-refined"></div>
      
      <div className="login-box-refined">
        <div className="text-center mb-[28px]">
          <div className="w-[56px] h-[56px] border-radius-[10px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center m-[0_auto_12px] text-[26px] text-[#7C3AED]">
            <ShieldAlert className="w-[32px] h-[32px]" />
          </div>
          <div className="text-[20px] font-bold tracking-[0.25em] text-white font-mono">
            {BRAND_CONTENT.appName} <span className="text-[#7C3AED]">ACCESS</span>
          </div>
          <div className="w-[40px] h-[2px] bg-[#7C3AED] rounded-[1px] m-[10px_auto_8px]"></div>
          <div className="text-[10px] text-[#71717A] tracking-[0.15em] uppercase">Fortress Africa Operations</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-[18px]">
          <div className="form-group">
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">Operator identity</label>
            <div className="relative">
              <User className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
              <input
                className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_12px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] transition-colors"
                type="email"
                placeholder="operator@organization.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">Cryptographic key</label>
            <div className="relative">
              <Lock className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
              <input
                className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_12px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] transition-colors"
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {needsOtp && (
            <div className="form-group">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.15em] mb-[8px]">MFA code</label>
              <div className="relative">
                <KeyRound className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#71717A]" />
                <input
                  className="w-full bg-[rgba(10,10,11,0.6)] border border-[#2A2A2E] rounded-[6px] p-[11px_12px_11px_36px] text-white text-[13px] outline-none focus:border-[#7C3AED] transition-colors"
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
            <div className="text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="login-btn w-full p-[13px] bg-[#7C3AED] border-none rounded-[6px] text-white text-[12px] font-bold tracking-[0.2em] uppercase cursor-pointer flex items-center justify-center gap-[8px] transition-all hover:bg-[#6d28d9] hover:shadow-[0_0_0_3px_rgba(124,58,237,0.25)] mt-[8px] disabled:opacity-60 disabled:cursor-not-allowed">
            <span>{isSubmitting ? 'Authenticating...' : 'Authenticate'}</span>
            <ArrowRight className="w-[14px] h-[14px]" />
          </button>
        </form>

        <div className="flex justify-between mt-[24px] pt-[16px] border-t border-[rgba(42,42,46,0.6)]">
          <span className="text-[9px] text-[rgba(113,113,122,0.5)] tracking-[0.12em] uppercase">Auth v4.2.1 · Secure</span>
          <span className="text-[9px] text-[#7C3AED] font-bold tracking-[0.12em] uppercase cursor-pointer hover:underline">Contact support</span>
        </div>
      </div>
    </div>
  );
}
