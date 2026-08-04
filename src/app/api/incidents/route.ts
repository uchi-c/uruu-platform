import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getIncidents, createIncident } from "@/lib/database/incidents";
import { IncidentSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "incidents:read",
    request,
  });

  if (error) return error;

  const incidents = await getIncidents(user.tenantId);
  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "incidents:write",
    schema: IncidentSchema,
    request,
  });

  if (error) return error;

  const incident = await createIncident(user.tenantId, validatedData as any, user.id);
  return NextResponse.json(incident, { status: 201 });
}
