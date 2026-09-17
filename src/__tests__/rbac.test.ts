import { hasPermission, ROLE_PERMISSIONS } from '@/lib/security/rbac';

describe('RBAC permissions', () => {
  describe('SUPER_ADMIN', () => {
    it('has full access, including tenant and user management', () => {
      expect(hasPermission('SUPER_ADMIN', 'tenants:manage' as any)).toBe(false); // not a real permission — sanity-checks the type isn't silently permissive
      expect(hasPermission('SUPER_ADMIN', 'tenants:delete')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'users:delete')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'audit:read')).toBe(true);
    });
  });

  describe('TENANT_ADMIN', () => {
    it('can manage users and content within its own tenant', () => {
      expect(hasPermission('TENANT_ADMIN', 'users:write')).toBe(true);
      expect(hasPermission('TENANT_ADMIN', 'incidents:delete')).toBe(true);
      expect(hasPermission('TENANT_ADMIN', 'settings:write')).toBe(true);
    });

    it('cannot manage other tenants — that is SUPER_ADMIN-only', () => {
      expect(hasPermission('TENANT_ADMIN', 'tenants:read')).toBe(false);
      expect(hasPermission('TENANT_ADMIN', 'tenants:write')).toBe(false);
      expect(hasPermission('TENANT_ADMIN', 'tenants:delete')).toBe(false);
    });

    it('cannot delete users — only TENANT_ADMIN/SUPER_ADMIN write, not delete', () => {
      expect(hasPermission('TENANT_ADMIN', 'users:delete')).toBe(false);
    });
  });

  describe('SECURITY_MANAGER', () => {
    it('can manage threats, incidents, reports, and compliance', () => {
      expect(hasPermission('SECURITY_MANAGER', 'threats:write')).toBe(true);
      expect(hasPermission('SECURITY_MANAGER', 'incidents:write')).toBe(true);
      expect(hasPermission('SECURITY_MANAGER', 'compliance:write')).toBe(true);
    });

    it('cannot manage users or tenants', () => {
      expect(hasPermission('SECURITY_MANAGER', 'users:read')).toBe(false);
      expect(hasPermission('SECURITY_MANAGER', 'users:write')).toBe(false);
      expect(hasPermission('SECURITY_MANAGER', 'tenants:read')).toBe(false);
    });

    it('cannot delete threats or incidents — write access only', () => {
      expect(hasPermission('SECURITY_MANAGER', 'threats:delete')).toBe(false);
      expect(hasPermission('SECURITY_MANAGER', 'incidents:delete')).toBe(false);
    });
  });

  describe('ANALYST', () => {
    it('can read and update threats/incidents, and use the AI assistant', () => {
      expect(hasPermission('ANALYST', 'threats:read')).toBe(true);
      expect(hasPermission('ANALYST', 'threats:write')).toBe(true);
      expect(hasPermission('ANALYST', 'incidents:write')).toBe(true);
      expect(hasPermission('ANALYST', 'ai:chat')).toBe(true);
    });

    it('cannot delete anything, export reports, or manage compliance/users', () => {
      expect(hasPermission('ANALYST', 'threats:delete')).toBe(false);
      expect(hasPermission('ANALYST', 'incidents:delete')).toBe(false);
      expect(hasPermission('ANALYST', 'reports:export')).toBe(false);
      expect(hasPermission('ANALYST', 'compliance:write')).toBe(false);
      expect(hasPermission('ANALYST', 'users:read')).toBe(false);
    });
  });

  describe('VIEWER', () => {
    it('has read-only access to threats, incidents, and reports', () => {
      expect(hasPermission('VIEWER', 'threats:read')).toBe(true);
      expect(hasPermission('VIEWER', 'incidents:read')).toBe(true);
      expect(hasPermission('VIEWER', 'reports:read')).toBe(true);
    });

    it('cannot write, delete, export, or use the AI assistant', () => {
      expect(hasPermission('VIEWER', 'threats:write')).toBe(false);
      expect(hasPermission('VIEWER', 'incidents:write')).toBe(false);
      expect(hasPermission('VIEWER', 'reports:export')).toBe(false);
      expect(hasPermission('VIEWER', 'ai:chat')).toBe(false);
      expect(hasPermission('VIEWER', 'compliance:read')).toBe(false);
    });
  });

  describe('unknown or missing role', () => {
    it('grants nothing for a role string not in ROLE_PERMISSIONS', () => {
      expect(hasPermission('NOT_A_REAL_ROLE', 'threats:read')).toBe(false);
    });

    it('grants nothing for an empty role', () => {
      expect(hasPermission('', 'threats:read')).toBe(false);
    });
  });

  describe('role hierarchy sanity check', () => {
    // Every permission ROLE_PERMISSIONS grants VIEWER must also be granted to every
    // more-privileged role above it, so a privilege downgrade in one role's list can
    // never silently leave VIEWER with something ANALYST/SECURITY_MANAGER lacks.
    it('every permission granted to VIEWER is also granted to every more-privileged role', () => {
      const roleOrder = ['VIEWER', 'ANALYST', 'SECURITY_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN'] as const;
      for (const viewerPermission of ROLE_PERMISSIONS.VIEWER) {
        for (const role of roleOrder.slice(1)) {
          expect(ROLE_PERMISSIONS[role]).toContain(viewerPermission);
        }
      }
    });
  });
});
