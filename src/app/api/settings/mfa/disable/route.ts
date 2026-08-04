import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { MfaDisableSchema } from "@/lib/validators/schemas";
import prisma from "@/lib/database/prisma";
import { disableMfa } from "@/lib/database/users";

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "self",
    schema: MfaDisableSchema,
    request,
  });

  if (error) return error;

  const { password } = validatedData as { password: string };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser || !(await argon2.verify(dbUser.passwordHash, password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await disableMfa(user.id, user.tenantId);

  return NextResponse.json({ mfaEnabled: false });
}
