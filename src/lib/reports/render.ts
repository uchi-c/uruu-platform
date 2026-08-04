import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/database/prisma";
import { getDashboardStats } from "@/lib/database/dashboard";
import { getTenantAssessments } from "@/lib/database/compliance";
import { getIncidents } from "@/lib/database/incidents";
import { ExecutiveReportDocument } from "./ExecutiveReportDocument";
import { ComplianceReportDocument } from "./ComplianceReportDocument";
import { IncidentReportDocument } from "./IncidentReportDocument";

export type ReportKind = "EXECUTIVE" | "COMPLIANCE" | "INCIDENT" | "THREAT_INTELLIGENCE";

export async function renderReportPdf(kind: ReportKind, tenantId: string): Promise<Buffer> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
  const tenantName = tenant?.name ?? "Unknown Tenant";
  const generatedAt = new Date();

  switch (kind) {
    case "EXECUTIVE": {
      const stats = await getDashboardStats(tenantId);
      return renderToBuffer(
        ExecutiveReportDocument({
          data: {
            tenantName,
            generatedAt,
            openIncidents: stats.openIncidents,
            activeThreats: stats.activeThreats,
            complianceScore: stats.complianceScore,
            systemHealth: stats.systemHealth,
            recentIncidents: stats.recentIncidents.map((inc) => ({
              title: inc.title,
              status: inc.status,
              updatedAt: new Date(inc.updatedAt),
            })),
          },
        })
      );
    }

    case "COMPLIANCE": {
      const assessments = await getTenantAssessments(tenantId);
      return renderToBuffer(
        ComplianceReportDocument({
          data: {
            tenantName,
            generatedAt,
            assessments: assessments.map((a) => ({
              frameworkName: a.framework.name,
              jurisdiction: a.framework.jurisdiction,
              status: a.status,
              score: a.score,
              responseCount: a._count.responses,
              updatedAt: a.updatedAt,
            })),
          },
        })
      );
    }

    case "INCIDENT":
    case "THREAT_INTELLIGENCE": {
      const incidents = await getIncidents(tenantId);
      return renderToBuffer(
        IncidentReportDocument({
          data: {
            tenantName,
            generatedAt,
            incidents: incidents.map((inc) => ({
              title: inc.title,
              status: inc.status,
              threatTitle: inc.threat?.title ?? null,
              createdAt: inc.createdAt,
            })),
          },
        })
      );
    }
  }
}
