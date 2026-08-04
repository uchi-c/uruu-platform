import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getAssessmentDetail } from "@/lib/database/compliance";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authorizeAndValidate({
    permission: "compliance:read",
    request,
  });

  if (error) return error;

  const assessment = await getAssessmentDetail(params.id, user.tenantId);
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }
  return NextResponse.json(assessment);
}
