import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getAssessmentDetail } from "@/lib/database/compliance";
import { getSecuritySignals } from "@/lib/database/security-signals";
import { generateComplianceGuidance } from "@/lib/ai/claude";
import { createAuditLog } from "@/lib/security/audit";

const ComplianceGuidanceRequestSchema = z.object({
  assessmentId: z.string(),
});

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "ai:analyze",
    schema: ComplianceGuidanceRequestSchema,
    request,
  });

  if (error) return error;

  const { assessmentId } = validatedData as { assessmentId: string };

  const assessment = await getAssessmentDetail(assessmentId, user.tenantId);
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const outstanding = assessment.responses.filter(
    (r) => r.status !== "COMPLIANT" && r.status !== "NOT_APPLICABLE"
  );

  if (outstanding.length === 0) {
    return NextResponse.json({ allAddressed: true });
  }

  const securitySignals = await getSecuritySignals(user.tenantId);

  let guidance;
  try {
    guidance = await generateComplianceGuidance({
      framework: {
        name: assessment.framework.name,
        jurisdiction: assessment.framework.jurisdiction,
      },
      outstandingRequirements: outstanding.map((r) => ({
        code: r.requirement.code,
        title: r.requirement.title,
        description: r.requirement.description,
        status: r.status,
        notes: r.notes,
      })),
      securitySignals,
    });
  } catch (err: any) {
    console.error("AI compliance guidance failed:", err);
    const message = err?.error?.error?.message ?? err?.message ?? "AI guidance failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await createAuditLog({
    action: "AI_COMPLIANCE_GUIDANCE",
    entity: "ComplianceAssessment",
    entityId: assessmentId,
    userId: user.id,
    tenantId: user.tenantId,
    metadata: { guidance },
  });

  return NextResponse.json({ allAddressed: false, ...guidance });
}
