import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getTenantAssessments, startAssessment } from "@/lib/database/compliance";
import { z } from "zod";

const StartAssessmentSchema = z.object({
  frameworkId: z.string(),
});

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "compliance:read",
    request,
  });

  if (error) return error;

  const assessments = await getTenantAssessments(user.tenantId);
  return NextResponse.json(assessments);
}

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "compliance:write",
    schema: StartAssessmentSchema,
    request,
  });

  if (error) return error;

  try {
    const assessment = await startAssessment(user.tenantId, (validatedData as any).frameworkId, user.id);
    return NextResponse.json(assessment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
