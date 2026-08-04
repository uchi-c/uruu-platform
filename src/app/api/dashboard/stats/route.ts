import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getDashboardStats } from "@/lib/database/dashboard";

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "threats:read",
    request,
  });

  if (error) return error;

  const stats = await getDashboardStats(user.tenantId);
  return NextResponse.json(stats);
}
