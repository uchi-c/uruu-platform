import prisma from "@/lib/database/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { IncidentInput } from "@/lib/validators/schemas";

export async function getIncidents(tenantId: string) {
  return await prisma.incident.findMany({
    where: { tenantId },
    include: { threat: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createIncident(tenantId: string, data: IncidentInput, userId: string) {
  const incident = await prisma.incident.create({
    data: {
      ...data,
      tenantId,
    },
  });

  await createAuditLog({
    action: "CREATE_INCIDENT",
    entity: "Incident",
    entityId: incident.id,
    userId,
    tenantId,
    metadata: data,
  });

  return incident;
}

export async function getIncidentDetail(incidentId: string, tenantId: string) {
  return await prisma.incident.findFirst({
    where: { id: incidentId, tenantId },
    include: { threat: true },
  });
}

export async function getIncidentAuditTrail(incidentId: string, tenantId: string) {
  return await prisma.auditLog.findMany({
    where: { entity: "Incident", entityId: incidentId, tenantId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { timestamp: "asc" },
  });
}

export async function updateIncidentStatus(
  incidentId: string, 
  status: any, 
  userId: string, 
  tenantId: string
) {
  const incident = await prisma.incident.update({
    where: { id: incidentId, tenantId }, // tenantId here ensures isolation
    data: { status },
  });

  await createAuditLog({
    action: "UPDATE_INCIDENT_STATUS",
    entity: "Incident",
    entityId: incidentId,
    userId,
    tenantId,
    metadata: { status },
  });

  return incident;
}
