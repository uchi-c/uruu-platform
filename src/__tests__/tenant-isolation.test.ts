// Mocks the Prisma client entirely — these tests assert the *shape* of the queries
// src/lib/database/*.ts sends (that tenantId is always part of the `where` clause,
// never bolted on after the fact), not real database behavior. They exist to catch
// the exact class of bug that would let one tenant see another tenant's data: a
// query that forgets to filter by tenantId.
jest.mock('@/lib/database/prisma', () => ({
  __esModule: true,
  default: {
    incident: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    threat: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    auditLog: { findMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock('@/lib/security/audit', () => ({
  createAuditLog: jest.fn(),
}));

import prisma from '@/lib/database/prisma';
import { getIncidents, getIncidentDetail, updateIncidentStatus } from '@/lib/database/incidents';
import { getThreats, getThreatDetails } from '@/lib/database/threats';

const TENANT_A = 'tenant-aaa';
const TENANT_B = 'tenant-bbb';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenant isolation — incidents', () => {
  it('getIncidents scopes findMany by the given tenantId', async () => {
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([]);
    await getIncidents(TENANT_A);
    expect(prisma.incident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: TENANT_A } })
    );
  });

  it('different tenants produce different where clauses, never the same one', async () => {
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([]);
    await getIncidents(TENANT_A);
    await getIncidents(TENANT_B);

    const [[callA], [callB]] = (prisma.incident.findMany as jest.Mock).mock.calls;
    expect(callA.where.tenantId).toBe(TENANT_A);
    expect(callB.where.tenantId).toBe(TENANT_B);
    expect(callA.where.tenantId).not.toBe(callB.where.tenantId);
  });

  it('getIncidentDetail scopes findFirst by both incidentId and tenantId — a matching id under the wrong tenant must not be reachable', async () => {
    (prisma.incident.findFirst as jest.Mock).mockResolvedValue(null);
    await getIncidentDetail('incident-1', TENANT_A);
    expect(prisma.incident.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'incident-1', tenantId: TENANT_A } })
    );
  });

  it('updateIncidentStatus scopes the update by tenantId — cannot mutate another tenant\'s incident by guessing its id', async () => {
    (prisma.incident.update as jest.Mock).mockResolvedValue({});
    await updateIncidentStatus('incident-1', 'RESOLVED', 'user-1', TENANT_A);
    expect(prisma.incident.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'incident-1', tenantId: TENANT_A } })
    );
  });
});

describe('tenant isolation — threats', () => {
  it('getThreats scopes findMany by the given tenantId', async () => {
    (prisma.threat.findMany as jest.Mock).mockResolvedValue([]);
    await getThreats(TENANT_B);
    expect(prisma.threat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: TENANT_B } })
    );
  });

  it('getThreatDetails scopes findFirst by both threatId and tenantId', async () => {
    (prisma.threat.findFirst as jest.Mock).mockResolvedValue(null);
    await getThreatDetails('threat-1', TENANT_B);
    expect(prisma.threat.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'threat-1', tenantId: TENANT_B } })
    );
  });
});
