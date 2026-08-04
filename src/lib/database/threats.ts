import prisma from "@/lib/database/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { ThreatInput } from "@/lib/validators/schemas";

export async function getThreats(tenantId: string) {
  return await prisma.threat.findMany({
    where: { tenantId },
    include: { _count: { select: { incidents: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createThreat(tenantId: string, data: ThreatInput, userId: string) {
  const threat = await prisma.threat.create({
    data: {
      ...data,
      tenantId,
    },
  });

  await createAuditLog({
    action: "CREATE_THREAT",
    entity: "Threat",
    entityId: threat.id,
    userId,
    tenantId,
    metadata: data,
  });

  return threat;
}

export async function getThreatDetails(threatId: string, tenantId: string) {
  return await prisma.threat.findFirst({
    where: { id: threatId, tenantId },
    include: { incidents: true },
  });
}
