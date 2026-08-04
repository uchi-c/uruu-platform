import prisma from "@/lib/database/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { ReportType } from "@prisma/client";

export async function getReports(tenantId: string) {
  return await prisma.report.findMany({
    where: { tenantId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReportById(id: string, tenantId: string) {
  return await prisma.report.findFirst({
    where: { id, tenantId },
  });
}

export async function createReportRecord({
  title,
  type,
  format,
  url,
  tenantId,
  userId,
  metadata,
}: {
  title: string;
  type: ReportType;
  format: string;
  url?: string;
  tenantId: string;
  userId: string;
  metadata?: any;
}) {
  const report = await prisma.report.create({
    data: {
      title,
      type,
      format,
      url,
      tenantId,
      userId,
      metadata,
    },
  });

  await createAuditLog({
    action: "GENERATE_REPORT",
    entity: "Report",
    entityId: report.id,
    userId,
    tenantId,
    metadata: { type, format },
  });

  return report;
}
