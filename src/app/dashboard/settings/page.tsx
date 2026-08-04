"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ShieldCheck, KeyRound, User } from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  mfaEnabled: boolean;
  createdAt: string;
  tenant: { name: string; domain: string | null };
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = () => {
    fetch('/api/settings/me')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
        return res.json();
      })
      .then(setProfile)
      .catch((e) => setError(e.message));
  };

  useEffect(loadProfile, []);

  return (
    <DashboardLayout>
      <div className="page-head flex justify-between items-end mb-[24px]">
        <div>
          <h1 className="text-[18px] font-bold text-white tracking-[-0.01em]">Settings</h1>
          <p className="text-[12px] text-[#71717A] mt-[3px]">Manage your account, security, and authentication preferences.</p>
        </div>
      </div>

      {error && (
        <div className="mb-[16px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[10px_12px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        <AccountCard profile={profile} />
        <MfaCard profile={profile} onChange={loadProfile} />
        <PasswordCard />
      </div>
    </DashboardLayout>
  );
}

function AccountCard({ profile }: { profile: Profile | null }) {
  return (
    <div className="card-refined">
      <div className="flex items-center gap-[8px] mb-[16px]">
        <User className="w-[14px] h-[14px] text-[#7C3AED]" />
        <h3 className="text-[13px] font-semibold text-white">Account information</h3>
      </div>
      {!profile ? (
        <div className="text-[11px] text-[#71717A]">Loading...</div>
      ) : (
        <div className="space-y-[10px] text-[12px]">
          <Row label="Name" value={profile.name ?? '—'} />
          <Row label="Email" value={profile.email} />
          <Row label="Role" value={profile.role.replace(/_/g, ' ')} />
          <Row label="Tenant" value={profile.tenant.name} />
          {profile.tenant.domain && <Row label="Domain" value={profile.tenant.domain} />}
          <Row
            label="Member since"
            value={new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center pb-[10px] border-b border-[rgba(42,42,46,0.5)] last:border-0 last:pb-0">
      <span className="text-[#71717A] uppercase text-[10px] tracking-[0.08em] font-bold">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function MfaCard({ profile, onChange }: { profile: Profile | null; onChange: () => void }) {
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const startSetup = async () => {
    setSubmitting(true);
    setLocalError(null);
    try {
      const res = await fetch('/api/settings/mfa/setup', { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to start MFA setup (${res.status})`);
      setSetupData(await res.json());
    } catch (e: any) {
      setLocalError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      const res = await fetch('/api/settings/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Failed to verify code (${res.status})`);
      setSetupData(null);
      setCode('');
      onChange();
    } catch (e: any) {
      setLocalError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      const res = await fetch('/api/settings/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Failed to disable MFA (${res.status})`);
      setShowDisableForm(false);
      setDisablePassword('');
      onChange();
    } catch (e: any) {
      setLocalError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-refined">
      <div className="flex items-center gap-[8px] mb-[16px]">
        <ShieldCheck className="w-[14px] h-[14px] text-[#7C3AED]" />
        <h3 className="text-[13px] font-semibold text-white">Two-factor authentication</h3>
      </div>

      {!profile ? (
        <div className="text-[11px] text-[#71717A]">Loading...</div>
      ) : (
        <>
          {localError && (
            <div className="mb-[12px] text-[11px] text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-[6px] p-[8px_10px]">
              {localError}
            </div>
          )}

          {profile.mfaEnabled && !showDisableForm && (
            <div className="flex items-center justify-between">
              <span className="badge-refined bg-[rgba(34,197,94,0.12)] text-[#4ade80] border-[rgba(34,197,94,0.25)]">ENABLED</span>
              <button
                onClick={() => setShowDisableForm(true)}
                className="text-[10px] font-bold text-[#ef4444] uppercase tracking-[0.06em] hover:underline cursor-pointer"
              >
                Disable
              </button>
            </div>
          )}

          {profile.mfaEnabled && showDisableForm && (
            <form onSubmit={disable} className="space-y-[10px]">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em]">Confirm password to disable</label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
              />
              <div className="flex gap-[8px]">
                <button type="submit" disabled={submitting} className="text-[10px] font-bold text-[#ef4444] uppercase tracking-[0.06em] cursor-pointer disabled:opacity-50">
                  {submitting ? 'Disabling...' : 'Confirm disable'}
                </button>
                <button type="button" onClick={() => { setShowDisableForm(false); setDisablePassword(''); }} className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.06em] cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!profile.mfaEnabled && !setupData && (
            <div className="flex items-center justify-between">
              <span className="badge-refined bg-[#71717A]/15 text-[#a1a1aa] border-[#71717A]/20">NOT ENABLED</span>
              <button onClick={startSetup} disabled={submitting} className="btn-primary-refined !text-[10px] !p-[7px_10px] disabled:opacity-60">
                {submitting ? 'Starting...' : 'Enable MFA'}
              </button>
            </div>
          )}

          {!profile.mfaEnabled && setupData && (
            <form onSubmit={verifySetup} className="space-y-[12px]">
              <p className="text-[11px] text-[#71717A]">Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), or enter the key manually.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupData.qrCodeDataUrl} alt="MFA QR code" className="w-[160px] h-[160px] rounded-[6px] border border-[#2A2A2E]" />
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[4px]">Manual entry key</label>
                <code className="block text-[11px] text-white bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] break-all font-mono">{setupData.secret}</code>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[4px]">Enter 6-digit code to confirm</label>
                <div className="relative">
                  <KeyRound className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#71717A]" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    required
                    className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px_8px_32px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
              <div className="flex gap-[8px]">
                <button type="submit" disabled={submitting} className="btn-primary-refined !text-[10px] !p-[7px_10px] disabled:opacity-60">
                  {submitting ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button type="button" onClick={() => { setSetupData(null); setCode(''); }} className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.06em] cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Failed to change password (${res.status})`);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-refined lg:col-span-2">
      <div className="flex items-center gap-[8px] mb-[16px]">
        <KeyRound className="w-[14px] h-[14px] text-[#7C3AED]" />
        <h3 className="text-[13px] font-semibold text-white">Change password</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-[12px] items-end">
        <div>
          <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={12}
            required
            className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.09em] mb-[6px]">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={12}
            required
            className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[8px_10px] text-white text-[12px] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div className="md:col-span-3 flex items-center gap-[12px]">
          <button type="submit" disabled={submitting} className="btn-primary-refined !text-[10px] !p-[7px_14px] disabled:opacity-60">
            {submitting ? 'Updating...' : 'Update password'}
          </button>
          {error && <span className="text-[11px] text-[#ef4444]">{error}</span>}
          {success && <span className="text-[11px] text-[#4ade80]">Password updated.</span>}
        </div>
      </form>
    </div>
  );
}
