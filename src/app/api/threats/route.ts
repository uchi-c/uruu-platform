import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getThreats, createThreat } from "@/lib/database/threats";
import { ThreatSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "threats:read",
    request,
  });

  if (error) return error;

  const threats = await getThreats(user.tenantId);
  return NextResponse.json(threats);
}

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "threats:write",
    schema: ThreatSchema,
    request,
  });

  if (error) return error;

  const threat = await createThreat(user.tenantId, validatedData as any, user.id);
  return NextResponse.json(threat, { status: 201 });
}
