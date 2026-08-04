import prisma from "@/lib/database/prisma";

const OPEN_STATUSES = ["OPEN", "INVESTIGATING"] as const;

export async function getSecuritySignals(tenantId: string) {
  const [openIncidents, criticalThreats] = await Promise.all([
    prisma.incident.count({
      where: { tenantId, status: { in: [...OPEN_STATUSES] } },
    }),
    prisma.threat.findMany({
      where: { tenantId, severity: { in: ["HIGH", "CRITICAL"] } },
      select: { title: true, severity: true, type: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return { openIncidents, criticalThreats };
}
