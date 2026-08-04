import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { NextResponse } from "next/server";
import { hasPermission, Permission } from "@/lib/security/rbac";
import { createAuditLog } from "@/lib/security/audit";

export async function authorizeAndValidate({
  permission,
  schema,
  request,
}: {
  // "self" skips the RBAC check entirely — for endpoints where any
  // authenticated user manages their own account (profile, MFA, password),
  // regardless of role-based permissions.
  permission: Permission | "self";
  schema?: any;
  request: Request;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = session.user as any;

  if (permission !== "self" && !hasPermission(user.role, permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  let validatedData = null;
  if (schema) {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { error: NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 }) };
    }
    validatedData = result.data;
  }

  return { session, user, validatedData };
}
