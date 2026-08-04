# URUU Platform Specification - Shadow Root Security Technologies

## Overview
**URUU** is the core cyber operations, compliance, and threat intelligence platform under Shadow Root Security Technologies' **FORTRESS AFRICA** brand, targeting African governments and critical infrastructure operators.

## Brand Identity
- **Primary Accent:** Shadow Purple `#6C00FF`
- **Visual Identity:** Dark SOC command-center aesthetic, high-contrast, enterprise-grade.
- **Tone:** Precise, authoritative ("We start in the shadows. We bring threats to light.")
- **Multi-tenancy:** Supports direct enterprise clients and government Phase 1 pilots.

## Tech Stack
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Radix UI, React Hook Form, Zod, Recharts
- **Backend:** Next.js API routes, PostgreSQL, Prisma ORM, NextAuth, JWT (dual-secret)
- **Auth/Security:** Argon2id, TOTP MFA, RBAC (24 permissions), multi-tenant isolation, audit logging, rate limiting, security headers, OWASP Top 10
- **AI Layer:** Claude API streaming, FastAPI ML sidecar (Isolation Forest), pgvector semantic search, LangChain ReAct agents
- **Infra:** Vercel, Supabase or self-hosted PostgreSQL, Docker, GitHub Actions

## Roles (RBAC)
- SUPER_ADMIN
- TENANT_ADMIN
- SECURITY_MANAGER
- ANALYST
- VIEWER
*(24 granular permissions)*

## Core Modules
1. Multi-tenant org/subscription management (strict `tenantId` isolation)
2. Threat management CRUD + incident tracking + vulnerability tracking
3. Compliance checklist engine (African regulatory frameworks)
4. AI Security Assistant (Summarization, pattern detection, recommendations)
5. Reporting (PDF/export)
6. Full audit trail

## Project Structure
```text
src/
  app/
  components/
  lib/
    auth/
    database/
    security/
    ai/
    validators/
    middleware/
  hooks/
  types/
  utils/
```

## Build Order
1. Architecture & schema planning
2. Prisma database schema
3. Backend APIs (auth-first)
4. Authentication (NextAuth, Argon2id, MFA, JWT)
5. Frontend SOC dashboard
6. AI assistant integration
7. Security hardening pass
8. Testing (Unit/Integration/E2E)
