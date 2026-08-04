import prisma from "@/lib/database/prisma";
import { ComplianceStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/security/audit";

export async function getFrameworks() {
  return await prisma.complianceFramework.findMany({
    include: { _count: { select: { requirements: true } } },
  });
}

export async function startAssessment(tenantId: string, frameworkId: string, userId: string) {
  const framework = await prisma.complianceFramework.findUnique({
    where: { id: frameworkId },
    include: { requirements: true },
  });

  if (!framework) throw new Error("Framework not found");

  const assessment = await prisma.complianceAssessment.create({
    data: {
      tenantId,
      frameworkId,
      status: "IN_PROGRESS",
      responses: {
        create: framework.requirements.map((req) => ({
          requirementId: req.id,
          status: ComplianceStatus.NOT_STARTED,
        })),
      },
    },
    include: { responses: true },
  });

  await createAuditLog({
    action: "START_COMPLIANCE_ASSESSMENT",
    entity: "ComplianceAssessment",
    entityId: assessment.id,
    userId,
    tenantId,
    metadata: { frameworkId },
  });

  return assessment;
}

export async function getAssessmentDetail(assessmentId: string, tenantId: string) {
  return await prisma.complianceAssessment.findFirst({
    where: { id: assessmentId, tenantId },
    include: {
      framework: true,
      responses: {
        include: { requirement: true },
        orderBy: { requirement: { code: "asc" } },
      },
    },
  });
}

export async function getTenantAssessments(tenantId: string) {
  return await prisma.complianceAssessment.findMany({
    where: { tenantId },
    include: { 
      framework: true,
      _count: { select: { responses: true } } 
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function updateComplianceResponse(
  responseId: string, 
  data: { status: ComplianceStatus; notes?: string; evidenceUrl?: string },
  userId: string,
  tenantId: string
) {
  const response = await prisma.complianceResponse.findUnique({
    where: { id: responseId },
    include: { assessment: true }
  });

  if (!response || response.assessment.tenantId !== tenantId) {
    throw new Error("Response not found or access denied");
  }

  const updated = await prisma.complianceResponse.update({
    where: { id: responseId },
    data: {
      ...data,
      updatedById: userId,
    },
  });

  await recomputeAssessmentScore(response.assessmentId);

  await createAuditLog({
    action: "UPDATE_COMPLIANCE_RESPONSE",
    entity: "ComplianceResponse",
    entityId: responseId,
    userId,
    tenantId,
    metadata: { status: data.status },
  });

  return updated;
}

async function recomputeAssessmentScore(assessmentId: string) {
  const responses = await prisma.complianceResponse.findMany({
    where: { assessmentId },
    select: { status: true },
  });

  const applicable = responses.filter((r) => r.status !== "NOT_APPLICABLE");
  const compliant = applicable.filter((r) => r.status === "COMPLIANT").length;
  const score = applicable.length ? Math.round((compliant / applicable.length) * 100) : 0;
  const allDecided = responses.every((r) => r.status !== "NOT_STARTED");

  await prisma.complianceAssessment.update({
    where: { id: assessmentId },
    data: {
      score,
      status: allDecided ? "COMPLETED" : "IN_PROGRESS",
    },
  });
}
