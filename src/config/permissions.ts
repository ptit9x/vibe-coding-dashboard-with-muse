/**
 * RBAC model (Phase 3).
 *
 * One permission per capability, named "<module>:<action>".
 * Roles are bundles of permissions — UI and route guards only ever ask
 * "does this user have permission X?", never "is this user an admin?",
 * so a new role is data, not new conditionals across the app.
 */
export type Permission =
  | 'dashboard:view'
  | 'sales:view'
  | 'sales:create'
  | 'inventory:view'
  | 'inventory:adjust'
  | 'purchasing:view'
  | 'purchasing:approve'
  | 'finance:view'
  | 'people:view'
  | 'reports:view'
  | 'settings:manage'

export type Role = 'admin' | 'operations-manager' | 'accountant' | 'viewer'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  'operations-manager': 'Operations Manager',
  accountant: 'Accountant',
  viewer: 'Viewer',
}

export const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'sales:view',
  'sales:create',
  'inventory:view',
  'inventory:adjust',
  'purchasing:view',
  'purchasing:approve',
  'finance:view',
  'people:view',
  'reports:view',
  'settings:manage',
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [...ALL_PERMISSIONS],
  'operations-manager': [
    'dashboard:view',
    'sales:view',
    'sales:create',
    'inventory:view',
    'inventory:adjust',
    'purchasing:view',
    'purchasing:approve',
    'reports:view',
  ],
  accountant: ['dashboard:view', 'sales:view', 'finance:view', 'reports:view'],
  viewer: ['dashboard:view'],
}

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function hasPermission(permissions: readonly Permission[], required: Permission): boolean {
  return permissions.includes(required)
}
