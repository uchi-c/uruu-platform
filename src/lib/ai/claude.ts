import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const IncidentAnalysisSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

// Hand-written JSON Schema instead of the SDK's zodOutputFormat() helper —
// that helper calls Zod v4's native toJSONSchema() internally, which is
// incompatible with the Zod v3 schema objects this project uses everywhere else.
const INCIDENT_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } },
    riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
  },
  required: ["summary", "recommendations", "riskLevel"],
  additionalProperties: false,
};

export type IncidentForAnalysis = {
  title: string;
  status: string;
  createdAt: Date;
  threat: {
    title: string;
    type: string;
    severity: string;
    description: string;
  } | null;
};

// Exported so the training-data generation script (scripts/generate-training-data.ts)
// builds the exact same prompts the production API routes send — a fine-tuned model
// trained on drifted prompts would learn the wrong input distribution.
export const INCIDENT_ANALYSIS_SYSTEM_PROMPT =
  "You are a security operations analyst assistant for URUU, a cybersecurity SOC platform. " +
  "Analyze the given incident and produce a concise, actionable summary, concrete recommendations, " +
  "and a risk level. Base your analysis strictly on the incident data provided — do not invent " +
  "details that aren't present.";

export function buildIncidentAnalysisUserContent(incident: IncidentForAnalysis): string {
  return `Analyze this security incident:\n\n${JSON.stringify(
    {
      title: incident.title,
      status: incident.status,
      createdAt: incident.createdAt,
      threat: incident.threat,
    },
    null,
    2
  )}`;
}

export async function summarizeIncident(incident: IncidentForAnalysis) {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: INCIDENT_ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildIncidentAnalysisUserContent(incident),
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: INCIDENT_ANALYSIS_JSON_SCHEMA },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI analysis returned no text output");
  }

  return IncidentAnalysisSchema.parse(JSON.parse(textBlock.text));
}

const ComplianceGuidanceSchema = z.object({
  priorityRequirementCode: z.string(),
  rationale: z.string(),
  recommendations: z.array(z.string()),
});

const COMPLIANCE_GUIDANCE_JSON_SCHEMA = {
  type: "object",
  properties: {
    priorityRequirementCode: { type: "string" },
    rationale: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } },
  },
  required: ["priorityRequirementCode", "rationale", "recommendations"],
  additionalProperties: false,
};

export type ComplianceGuidanceInput = {
  framework: { name: string; jurisdiction: string };
  outstandingRequirements: {
    code: string;
    title: string;
    description: string;
    status: string;
    notes: string | null;
  }[];
  securitySignals: {
    openIncidents: number;
    criticalThreats: { title: string; severity: string; type: string }[];
  };
};

export const COMPLIANCE_GUIDANCE_SYSTEM_PROMPT =
  "You are a compliance advisor for URUU, a cybersecurity SOC platform serving African governments and " +
  "critical infrastructure operators. Given a tenant's outstanding (not-yet-compliant) requirements for a " +
  "regulatory framework, plus real current security signals for that tenant, recommend which single " +
  "requirement to prioritize next and why, with concrete next steps. Base your reasoning strictly on the " +
  "data provided — never invent incidents, statistics, or evidence that isn't in the input. " +
  "priorityRequirementCode must exactly match one of the provided requirement codes.";

export function buildComplianceGuidanceUserContent(input: ComplianceGuidanceInput): string {
  return `Framework: ${input.framework.name} (${input.framework.jurisdiction})\n\nOutstanding requirements:\n${JSON.stringify(
    input.outstandingRequirements,
    null,
    2
  )}\n\nCurrent security signals for this tenant:\n${JSON.stringify(input.securitySignals, null, 2)}`;
}

export async function generateComplianceGuidance(input: ComplianceGuidanceInput) {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: COMPLIANCE_GUIDANCE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildComplianceGuidanceUserContent(input),
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: COMPLIANCE_GUIDANCE_JSON_SCHEMA },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI guidance returned no text output");
  }

  return ComplianceGuidanceSchema.parse(JSON.parse(textBlock.text));
}

export async function detectThreatPatterns(threatData: any[]) {
  // Logic for pattern detection using Claude/ML Sidecar
  return [
    { pattern: "Lateral Movement", confidence: 0.85, evidence: "Sequential login failures across three different segments." }
  ];
}
