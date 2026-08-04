import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getIncidentDetail, getIncidentAuditTrail, updateIncidentStatus } from "@/lib/database/incidents";
import { IncidentStatusUpdateSchema } from "@/lib/validators/schemas";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authorizeAndValidate({
    permission: "incidents:read",
    request,
  });

  if (error) return error;

  const incident = await getIncidentDetail(params.id, user.tenantId);
  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }
  const timeline = await getIncidentAuditTrail(params.id, user.tenantId);
  return NextResponse.json({ ...incident, timeline });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "incidents:write",
    schema: IncidentStatusUpdateSchema,
    request,
  });

  if (error) return error;

  const incident = await updateIncidentStatus(
    params.id,
    (validatedData as any).status,
    user.id,
    user.tenantId
  );
  return NextResponse.json(incident);
}
