import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { ChangePasswordSchema } from "@/lib/validators/schemas";
import prisma from "@/lib/database/prisma";
import { updatePasswordHash } from "@/lib/database/users";

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "self",
    schema: ChangePasswordSchema,
    request,
  });

  if (error) return error;

  const { currentPassword, newPassword } = validatedData as {
    currentPassword: string;
    newPassword: string;
  };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser || !(await argon2.verify(dbUser.passwordHash, currentPassword))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const newHash = await argon2.hash(newPassword);
  await updatePasswordHash(user.id, user.tenantId, newHash);

  return NextResponse.json({ success: true });
}
