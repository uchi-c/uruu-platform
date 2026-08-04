import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { summarizeIncident } from "@/lib/ai/claude";
import { createAuditLog } from "@/lib/security/audit";
import { getIncidentDetail } from "@/lib/database/incidents";

const AnalyzeIncidentSchema = z.object({
  incidentId: z.string(),
});

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "ai:analyze",
    schema: AnalyzeIncidentSchema,
    request,
  });

  if (error) return error;

  const { incidentId } = validatedData as { incidentId: string };

  const incident = await getIncidentDetail(incidentId, user.tenantId);
  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  let analysis;
  try {
    analysis = await summarizeIncident(incident);
  } catch (err: any) {
    console.error("AI incident analysis failed:", err);
    const message = err?.error?.error?.message ?? err?.message ?? "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await createAuditLog({
    action: "AI_INCIDENT_ANALYSIS",
    entity: "Incident",
    entityId: incidentId,
    userId: user.id,
    tenantId: user.tenantId,
    metadata: { analysis },
  });

  return NextResponse.json(analysis);
}
