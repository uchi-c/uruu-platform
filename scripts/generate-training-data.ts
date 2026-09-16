/**
 * Generates synthetic training data for distilling the AI Security Assistant
 * (src/lib/ai/claude.ts) off Claude onto a self-hosted fine-tuned model.
 *
 * For each synthetic incident/compliance scenario, this calls the real,
 * production summarizeIncident()/generateComplianceGuidance() functions —
 * so every training example uses the exact same prompts the live API routes
 * send, and a real Claude response as the target output.
 *
 * Usage: tsx --env-file=.env scripts/generate-training-data.ts [--count=300]
 */
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  summarizeIncident,
  generateComplianceGuidance,
  buildIncidentAnalysisUserContent,
  buildComplianceGuidanceUserContent,
  INCIDENT_ANALYSIS_SYSTEM_PROMPT,
  COMPLIANCE_GUIDANCE_SYSTEM_PROMPT,
  type IncidentForAnalysis,
  type ComplianceGuidanceInput,
} from '../src/lib/ai/claude';

const COUNT = Number(process.argv.find((a) => a.startsWith('--count='))?.split('=')[1] ?? 300);
const OUT_DIR = join(__dirname, '..', 'training-data');
const INCIDENT_OUT = join(OUT_DIR, 'incident-analysis.jsonl');
const COMPLIANCE_OUT = join(OUT_DIR, 'compliance-guidance.jsonl');

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIp(): string {
  return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function randomPastDate(maxDaysAgo: number): Date {
  return new Date(Date.now() - randomInt(0, maxDaysAgo) * 86400000 - randomInt(0, 86400000));
}

// ─── Incident scenario generation ──────────────────────────────────────────

const ASSETS = [
  'payroll-db-01', 'citizen-portal-web', 'internal-vpn-gateway', 'email-relay-03',
  'hr-fileserver', 'tax-processing-api', 'backup-nas-02', 'public-dns-01',
  'admin-workstation-14', 'ministry-crm', 'student-records-db', 'grant-disbursement-api',
];
const DEPARTMENTS = ['Finance', 'HR', 'IT Operations', 'Legal', 'Procurement', 'Records Office'];
const STATUSES = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

type ThreatTemplate = { type: string; title: (v: Record<string, string>) => string; description: (v: Record<string, string>) => string };

const THREAT_TEMPLATES: ThreatTemplate[] = [
  {
    type: 'PHISHING',
    title: (v) => `Phishing campaign targeting ${v.dept} staff credentials`,
    description: (v) => `Multiple ${v.dept} employees received emails impersonating IT support requesting password resets. ${v.count} users clicked the link before the domain was blocked.`,
  },
  {
    type: 'MALWARE',
    title: (v) => `Malware detected on ${v.asset}`,
    description: (v) => `Endpoint protection flagged a trojan payload on ${v.asset}. The process attempted to establish outbound connections to ${v.ip} before being quarantined.`,
  },
  {
    type: 'RANSOMWARE',
    title: (v) => `Ransomware encryption activity on ${v.asset}`,
    description: (v) => `File integrity monitoring detected mass file renames with a .locked extension on ${v.asset}. A ransom note was found in the root directory.`,
  },
  {
    type: 'DDOS',
    title: (v) => `Volumetric DDoS attack against ${v.asset}`,
    description: (v) => `Traffic to ${v.asset} spiked to ${v.count}x baseline from a botnet distributed across multiple ASNs, causing intermittent service degradation.`,
  },
  {
    type: 'BRUTE_FORCE',
    title: (v) => `Brute-force login attempts against ${v.asset}`,
    description: (v) => `${v.count} failed authentication attempts were logged against ${v.asset} from ${v.ip} within a 10-minute window, consistent with a credential-stuffing attack.`,
  },
  {
    type: 'SQL_INJECTION',
    title: (v) => `SQL injection attempt on ${v.asset}`,
    description: (v) => `WAF logs show crafted input containing UNION SELECT payloads submitted to a query parameter on ${v.asset}, originating from ${v.ip}.`,
  },
  {
    type: 'XSS',
    title: (v) => `Cross-site scripting payload detected on ${v.asset}`,
    description: (v) => `A stored XSS payload was found in a user-submitted form field on ${v.asset}, capable of executing in the context of other authenticated sessions.`,
  },
  {
    type: 'ZERO_DAY',
    title: (v) => `Suspected zero-day exploitation on ${v.asset}`,
    description: (v) => `Anomalous process behavior on ${v.asset} does not match any known signature; the vendor has not yet published a patch for the suspected vulnerability class.`,
  },
];

function randomThreatVars(): Record<string, string> {
  return {
    asset: pick(ASSETS),
    dept: pick(DEPARTMENTS),
    ip: randomIp(),
    count: String(randomInt(3, 240)),
  };
}

function generateSyntheticIncident(): IncidentForAnalysis {
  const template = pick(THREAT_TEMPLATES);
  const vars = randomThreatVars();
  const threatTitle = template.title(vars);
  return {
    title: `Incident: ${threatTitle}`,
    status: pick(STATUSES),
    createdAt: randomPastDate(60),
    threat: {
      title: threatTitle,
      type: template.type,
      severity: pick(SEVERITIES),
      description: template.description(vars),
    },
  };
}

// ─── Compliance scenario generation ────────────────────────────────────────

const FRAMEWORKS = [
  { name: 'Nigeria Data Protection Act (NDPA)', jurisdiction: 'Nigeria' },
  { name: 'Protection of Personal Information Act (POPIA)', jurisdiction: 'South Africa' },
  { name: 'Zambia Data Protection Act (ZDPA)', jurisdiction: 'Zambia' },
  { name: 'Kenya Data Protection Act', jurisdiction: 'Kenya' },
  { name: 'Ghana Data Protection Act', jurisdiction: 'Ghana' },
];

const REQUIREMENTS = [
  { code: 'SEC-01', title: 'Data encryption at rest', description: 'Personal data stored in production systems must be encrypted using an approved algorithm.' },
  { code: 'SEC-02', title: 'Access control review', description: 'User access rights to systems containing personal data must be reviewed on a defined schedule.' },
  { code: 'SEC-03', title: 'Incident response plan', description: 'A documented incident response plan must exist covering detection, containment, and notification timelines.' },
  { code: 'SEC-04', title: 'Data breach notification', description: "Confirmed breaches involving personal data must be reported to the relevant authority within the framework's mandated window." },
  { code: 'SEC-05', title: 'Third-party processor agreements', description: "Contracts with data processors must include data protection clauses consistent with the framework's requirements." },
  { code: 'SEC-06', title: 'Data subject access requests', description: 'A documented process must exist for handling data subject requests to access, correct, or delete their personal data.' },
  { code: 'SEC-07', title: 'Data retention schedule', description: 'Personal data must not be retained longer than necessary for its stated purpose, per a documented retention schedule.' },
  { code: 'SEC-08', title: 'Staff privacy training', description: 'Employees handling personal data must complete privacy and security awareness training at onboarding and periodically thereafter.' },
];

const OUTSTANDING_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'NON_COMPLIANT'];

function generateSyntheticCompliance(): ComplianceGuidanceInput {
  const framework = pick(FRAMEWORKS);
  const outstandingCount = randomInt(1, REQUIREMENTS.length);
  const shuffled = [...REQUIREMENTS].sort(() => Math.random() - 0.5);
  const outstanding = shuffled.slice(0, outstandingCount).map((r) => ({
    ...r,
    status: pick(OUTSTANDING_STATUSES),
    notes: Math.random() > 0.5 ? null : 'Partial implementation in progress; evidence not yet collected.',
  }));

  const criticalThreatCount = randomInt(0, 5);
  const criticalThreats = Array.from({ length: criticalThreatCount }, () => {
    const template = pick(THREAT_TEMPLATES);
    const vars = randomThreatVars();
    return {
      title: template.title(vars),
      severity: pick(['HIGH', 'CRITICAL']),
      type: template.type,
    };
  });

  return {
    framework,
    outstandingRequirements: outstanding,
    securitySignals: {
      openIncidents: randomInt(0, 15),
      criticalThreats,
    },
  };
}

// ─── Runner ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const message = err?.error?.error?.message ?? err?.message ?? String(err);
      const wait = 500 * 3 ** i;
      console.error(`  [${label}] attempt ${i + 1}/${attempts} failed: ${message}${i < attempts - 1 ? ` — retrying in ${wait}ms` : ' — skipping'}`);
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, wait));
    }
  }
  return null;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(INCIDENT_OUT, '');
  writeFileSync(COMPLIANCE_OUT, '');

  console.log(`Generating ${COUNT} incident-analysis examples + ${COUNT} compliance-guidance examples`);
  console.log(`(${COUNT * 2} real Claude API calls against your CLAUDE_API_KEY — this is not free)\n`);

  const startedAt = Date.now();
  let incidentOk = 0;
  let incidentFailed = 0;

  for (let i = 0; i < COUNT; i++) {
    const incident = generateSyntheticIncident();
    const result = await withRetry(() => summarizeIncident(incident), `incident ${i + 1}/${COUNT}`);
    if (result) {
      const line = JSON.stringify({
        messages: [
          { role: 'system', content: INCIDENT_ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: buildIncidentAnalysisUserContent(incident) },
          { role: 'assistant', content: JSON.stringify(result) },
        ],
      });
      appendFileSync(INCIDENT_OUT, line + '\n');
      incidentOk++;
    } else {
      incidentFailed++;
    }
    if ((i + 1) % 25 === 0 || i === COUNT - 1) {
      console.log(`  incident-analysis: ${i + 1}/${COUNT} (${incidentOk} ok, ${incidentFailed} failed)`);
    }
  }

  let complianceOk = 0;
  let complianceFailed = 0;

  for (let i = 0; i < COUNT; i++) {
    const input = generateSyntheticCompliance();
    const result = await withRetry(() => generateComplianceGuidance(input), `compliance ${i + 1}/${COUNT}`);
    if (result) {
      const line = JSON.stringify({
        messages: [
          { role: 'system', content: COMPLIANCE_GUIDANCE_SYSTEM_PROMPT },
          { role: 'user', content: buildComplianceGuidanceUserContent(input) },
          { role: 'assistant', content: JSON.stringify(result) },
        ],
      });
      appendFileSync(COMPLIANCE_OUT, line + '\n');
      complianceOk++;
    } else {
      complianceFailed++;
    }
    if ((i + 1) % 25 === 0 || i === COUNT - 1) {
      console.log(`  compliance-guidance: ${i + 1}/${COUNT} (${complianceOk} ok, ${complianceFailed} failed)`);
    }
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsedSec}s.`);
  console.log(`  incident-analysis.jsonl:    ${incidentOk} examples (${incidentFailed} failed)`);
  console.log(`  compliance-guidance.jsonl:  ${complianceOk} examples (${complianceFailed} failed)`);
  console.log(`  written to: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
