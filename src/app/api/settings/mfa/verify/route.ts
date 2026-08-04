import { NextResponse } from "next/server";
import { authenticator } from "@/lib/security/totp";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { MfaVerifySchema } from "@/lib/validators/schemas";
import prisma from "@/lib/database/prisma";
import { enableMfa } from "@/lib/database/users";

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "self",
    schema: MfaVerifySchema,
    request,
  });

  if (error) return error;

  const { code } = validatedData as { code: string };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { mfaSecret: true },
  });

  if (!dbUser?.mfaSecret) {
    return NextResponse.json(
      { error: "No pending MFA setup found. Start setup again." },
      { status: 400 }
    );
  }

  const isValid = authenticator.check(code, dbUser.mfaSecret);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await enableMfa(user.id, user.tenantId);

  return NextResponse.json({ mfaEnabled: true });
}
