import { describe, expect, it } from 'vitest'

import { visibleNavGroups } from '@/config/navigation'
import {
  hasPermission,
  permissionsForRole,
  ROLE_PERMISSIONS,
} from '@/config/permissions'

describe('RBAC role permissions', () => {
  it('admin holds every permission, including settings:manage', () => {
    const admin = permissionsForRole('admin')
    expect(admin).toContain('settings:manage')
    expect(admin).toHaveLength(ROLE_PERMISSIONS.admin.length)
    expect(admin.length).toBeGreaterThan(permissionsForRole('operations-manager').length)
  })

  it('viewer holds only dashboard:view', () => {
    expect(permissionsForRole('viewer')).toEqual(['dashboard:view'])
  })

  it('accountant can see finance but cannot approve purchasing', () => {
    const accountant = permissionsForRole('accountant')
    expect(hasPermission(accountant, 'finance:view')).toBe(true)
    expect(hasPermission(accountant, 'purchasing:approve')).toBe(false)
    expect(hasPermission(accountant, 'purchasing:view')).toBe(false)
  })

  it('operations manager can approve purchasing but not manage settings', () => {
    const manager = permissionsForRole('operations-manager')
    expect(hasPermission(manager, 'purchasing:approve')).toBe(true)
    expect(hasPermission(manager, 'settings:manage')).toBe(false)
  })
})

describe('permission-aware navigation', () => {
  const labelsFor = (role: keyof typeof ROLE_PERMISSIONS) => {
    const permissions = permissionsForRole(role)
    return visibleNavGroups((permission) => hasPermission(permissions, permission)).flatMap(
      (group) => group.items.map((item) => item.label),
    )
  }

  it('viewer sees only the Dashboard item and no empty groups', () => {
    expect(labelsFor('viewer')).toEqual(['Dashboard'])
    const groups = visibleNavGroups((p) => p === 'dashboard:view')
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Overview')
  })

  it('accountant sees Dashboard, Sales, Finance and Reports — not Inventory or Settings', () => {
    const labels = labelsFor('accountant')
    expect(labels).toEqual(['Dashboard', 'Sales', 'Finance', 'Reports'])
    expect(labels).not.toContain('Inventory')
    expect(labels).not.toContain('Settings')
  })

  it('admin sees all eight items', () => {
    expect(labelsFor('admin')).toHaveLength(8)
  })
})
