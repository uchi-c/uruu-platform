import { NextResponse } from "next/server";
import { authorizeAndValidate } from "@/lib/security/api-helper";
import { getReports, createReportRecord } from "@/lib/database/reports";
import { renderReportPdf } from "@/lib/reports/render";
import { z } from "zod";

const CreateReportSchema = z.object({
  title: z.string().min(3),
  type: z.enum(["COMPLIANCE", "INCIDENT", "EXECUTIVE", "THREAT_INTELLIGENCE"]),
  format: z.string().default("PDF"),
});

export async function GET(request: Request) {
  const { user, error } = await authorizeAndValidate({
    permission: "reports:read",
    request,
  });

  if (error) return error;

  const reports = await getReports(user.tenantId);
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const { user, validatedData, error } = await authorizeAndValidate({
    permission: "reports:write",
    schema: CreateReportSchema,
    request,
  });

  if (error) return error;

  const { title, type, format } = validatedData as any;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderReportPdf(type, user.tenantId);
  } catch (err: any) {
    console.error("Report PDF generation failed:", err);
    return NextResponse.json({ error: "Failed to generate report PDF" }, { status: 500 });
  }

  const report = await createReportRecord({
    title,
    type,
    format,
    tenantId: user.tenantId,
    userId: user.id,
  });

  const filename = `${type.toLowerCase()}-report-${report.id}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 201,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Report-Id": report.id,
    },
  });
}
