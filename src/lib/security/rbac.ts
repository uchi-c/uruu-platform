export type Permission = 
  | 'users:read' | 'users:write' | 'users:delete'
  | 'tenants:read' | 'tenants:write' | 'tenants:delete'
  | 'threats:read' | 'threats:write' | 'threats:delete'
  | 'incidents:read' | 'incidents:write' | 'incidents:delete'
  | 'reports:read' | 'reports:write' | 'reports:export'
  | 'compliance:read' | 'compliance:write'
  | 'audit:read'
  | 'ai:chat' | 'ai:summarize' | 'ai:analyze'
  | 'settings:read' | 'settings:write';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'users:read', 'users:write', 'users:delete',
    'tenants:read', 'tenants:write', 'tenants:delete',
    'threats:read', 'threats:write', 'threats:delete',
    'incidents:read', 'incidents:write', 'incidents:delete',
    'reports:read', 'reports:write', 'reports:export',
    'compliance:read', 'compliance:write',
    'audit:read',
    'ai:chat', 'ai:summarize', 'ai:analyze',
    'settings:read', 'settings:write'
  ],
  TENANT_ADMIN: [
    'users:read', 'users:write',
    'threats:read', 'threats:write', 'threats:delete',
    'incidents:read', 'incidents:write', 'incidents:delete',
    'reports:read', 'reports:write', 'reports:export',
    'compliance:read', 'compliance:write',
    'audit:read',
    'ai:chat', 'ai:summarize', 'ai:analyze',
    'settings:read', 'settings:write'
  ],
  SECURITY_MANAGER: [
    'threats:read', 'threats:write',
    'incidents:read', 'incidents:write',
    'reports:read', 'reports:write',
    'compliance:read', 'compliance:write',
    'ai:chat', 'ai:summarize', 'ai:analyze'
  ],
  ANALYST: [
    'threats:read', 'threats:write',
    'incidents:read', 'incidents:write',
    'reports:read',
    'ai:chat', 'ai:summarize'
  ],
  VIEWER: [
    'threats:read',
    'incidents:read',
    'reports:read'
  ]
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
