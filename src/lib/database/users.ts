import prisma from "@/lib/database/prisma";
import { createAuditLog } from "@/lib/security/audit";

export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      mfaEnabled: true,
      createdAt: true,
      tenant: { select: { name: true, domain: true } },
    },
  });
}

export async function setPendingMfaSecret(userId: string, secret: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret, mfaEnabled: false },
  });
}

export async function enableMfa(userId: string, tenantId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true },
  });

  await createAuditLog({
    action: "ENABLE_MFA",
    entity: "User",
    entityId: userId,
    userId,
    tenantId,
  });
}

export async function disableMfa(userId: string, tenantId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: false, mfaSecret: null },
  });

  await createAuditLog({
    action: "DISABLE_MFA",
    entity: "User",
    entityId: userId,
    userId,
    tenantId,
  });
}

export async function updatePasswordHash(userId: string, tenantId: string, passwordHash: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await createAuditLog({
    action: "CHANGE_PASSWORD",
    entity: "User",
    entityId: userId,
    userId,
    tenantId,
  });
}
