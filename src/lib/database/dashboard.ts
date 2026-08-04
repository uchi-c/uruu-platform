import prisma from "@/lib/database/prisma";

const OPEN_STATUSES = ["OPEN", "INVESTIGATING"] as const;
const TREND_DAYS = 14;

export async function getDashboardStats(tenantId: string) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const trendStart = new Date(todayUTC);
  trendStart.setUTCDate(trendStart.getUTCDate() - (TREND_DAYS - 1));

  const [
    openIncidents,
    activeThreats,
    criticalOpenIncidents,
    assessments,
    recentIncidents,
    trendIncidents,
  ] = await Promise.all([
    prisma.incident.count({
      where: { tenantId, status: { in: [...OPEN_STATUSES] } },
    }),
    prisma.threat.count({ where: { tenantId } }),
    prisma.incident.count({
      where: {
        tenantId,
        status: { in: [...OPEN_STATUSES] },
        threat: { severity: "CRITICAL" },
      },
    }),
    prisma.complianceAssessment.findMany({
      where: { tenantId },
      select: { score: true },
    }),
    prisma.incident.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.incident.findMany({
      where: { tenantId, createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
  ]);

  const complianceScore = assessments.length
    ? Math.round(
        assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
      )
    : null;

  const systemHealth = criticalOpenIncidents > 0 ? "Degraded" : "Optimal";

  const trendBuckets = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(trendStart);
    d.setUTCDate(d.getUTCDate() + i);
    trendBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const incident of trendIncidents) {
    const key = incident.createdAt.toISOString().slice(0, 10);
    if (trendBuckets.has(key)) {
      trendBuckets.set(key, (trendBuckets.get(key) ?? 0) + 1);
    }
  }
  const incidentTrend = Array.from(trendBuckets.entries()).map(
    ([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      count,
    })
  );

  return {
    openIncidents,
    activeThreats,
    complianceScore,
    systemHealth,
    recentIncidents,
    incidentTrend,
  };
}
