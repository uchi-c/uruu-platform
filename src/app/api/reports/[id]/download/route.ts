import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getReportById } from "@/lib/database/reports";
import { renderReportPdf } from "@/lib/reports/render";
import { createAuditLog } from "@/lib/security/audit";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authorizeAndValidate({
    permission: "reports:export",
    request,
  });

  if (error) return error;

  const report = await getReportById(params.id, user.tenantId);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Regenerated fresh from current data — not a stored copy of the original
  // moment it was created, since bytes were never persisted (see route.ts).
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderReportPdf(report.type, user.tenantId);
  } catch (err: any) {
    console.error("Report PDF regeneration failed:", err);
    return NextResponse.json({ error: "Failed to regenerate report PDF" }, { status: 500 });
  }

  await createAuditLog({
    action: "EXPORT_REPORT",
    entity: "Report",
    entityId: report.id,
    userId: user.id,
    tenantId: user.tenantId,
    metadata: { type: report.type },
  });

  const filename = `${report.type.toLowerCase()}-report-${report.id}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
