import { z } from "zod";

export const ThreatSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  type: z.enum([
    "PHISHING",
    "MALWARE",
    "RANSOMWARE",
    "DDOS",
    "BRUTE_FORCE",
    "SQL_INJECTION",
    "XSS",
    "ZERO_DAY",
  ]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export const IncidentSchema = z.object({
  title: z.string().min(3).max(100),
  status: z.enum(["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED"]),
  threatId: z.string().optional(),
});

export const IncidentStatusUpdateSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED"]),
});

export const ComplianceResponseUpdateSchema = z.object({
  status: z.enum(["NOT_STARTED", "COMPLIANT", "NON_COMPLIANT", "IN_PROGRESS", "NOT_APPLICABLE"]),
  notes: z.string().max(2000).optional(),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
});

export const MfaVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});

export const MfaDisableSchema = z.object({
  password: z.string().min(1),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, "New password must be at least 12 characters"),
});

export type ThreatInput = z.infer<typeof ThreatSchema>;
export type IncidentInput = z.infer<typeof IncidentSchema>;
