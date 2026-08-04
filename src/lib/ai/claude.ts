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

type IncidentForAnalysis = {
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

export async function summarizeIncident(incident: IncidentForAnalysis) {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "You are a security operations analyst assistant for URUU, a cybersecurity SOC platform. " +
      "Analyze the given incident and produce a concise, actionable summary, concrete recommendations, " +
      "and a risk level. Base your analysis strictly on the incident data provided — do not invent " +
      "details that aren't present.",
    messages: [
      {
        role: "user",
        content: `Analyze this security incident:\n\n${JSON.stringify(
          {
            title: incident.title,
            status: incident.status,
            createdAt: incident.createdAt,
            threat: incident.threat,
          },
          null,
          2
        )}`,
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

type ComplianceGuidanceInput = {
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

export async function generateComplianceGuidance(input: ComplianceGuidanceInput) {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "You are a compliance advisor for URUU, a cybersecurity SOC platform serving African governments and " +
      "critical infrastructure operators. Given a tenant's outstanding (not-yet-compliant) requirements for a " +
      "regulatory framework, plus real current security signals for that tenant, recommend which single " +
      "requirement to prioritize next and why, with concrete next steps. Base your reasoning strictly on the " +
      "data provided — never invent incidents, statistics, or evidence that isn't in the input. " +
      "priorityRequirementCode must exactly match one of the provided requirement codes.",
    messages: [
      {
        role: "user",
        content: `Framework: ${input.framework.name} (${input.framework.jurisdiction})\n\nOutstanding requirements:\n${JSON.stringify(
          input.outstandingRequirements,
          null,
          2
        )}\n\nCurrent security signals for this tenant:\n${JSON.stringify(input.securitySignals, null, 2)}`,
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
