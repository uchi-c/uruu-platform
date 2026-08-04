import prisma from "@/lib/database/prisma";

export async function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  tenantId,
  metadata,
}: {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  tenantId: string;
  metadata?: any;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        tenantId,
        metadata,
      },
    });
  } catch (error) {
    console.error("Audit log creation failed:", error);
    // In a production environment, you might want to send this to an external logging service
  }
}
