import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { updateComplianceResponse } from "@/lib/database/compliance";
import { ComplianceResponseUpdateSchema } from "@/lib/validators/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "compliance:write",
    schema: ComplianceResponseUpdateSchema,
    request,
  });

  if (error) return error;

  try {
    const updated = await updateComplianceResponse(
      params.id,
      validatedData as any,
      user.id,
      user.tenantId
    );
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
