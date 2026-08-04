import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getFrameworks } from "@/lib/database/compliance";

export async function GET(request: Request) {
  const { error } = await authorizeAndValidate({
    permission: "compliance:read",
    request,
  });

  if (error) return error;

  const frameworks = await getFrameworks();
  return NextResponse.json(frameworks);
}
