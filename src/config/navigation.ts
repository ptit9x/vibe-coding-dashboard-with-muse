import type { Permission } from '@/config/permissions'

import {
  BarChart3,
  Landmark,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  /** Permission required to see this item and open its route (Phase 3 RBAC). */
  permission: Permission
  icon: LucideIcon
  /** Short plain-language description shown on the module placeholder page. */
  description: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/**
 * Single source of truth for navigation.
 * The sidebar, mobile drawer, breadcrumbs and the router all read from here,
 * so a future module (Phase 3+) is added in exactly one place.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        permission: 'dashboard:view',
        path: '/',
        icon: LayoutDashboard,
        description: 'The operating picture for today: orders, stock risks and cash, in one place.',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Sales',
        permission: 'sales:view',
        path: '/sales',
        icon: ShoppingCart,
        description: 'Quotes, sales orders, invoices and customer balances.',
      },
      {
        label: 'Inventory',
        permission: 'inventory:view',
        path: '/inventory',
        icon: Package,
        description: 'Stock levels, warehouses, movements and reorder points.',
      },
      {
        label: 'Purchasing',
        permission: 'purchasing:view',
        path: '/purchasing',
        icon: ShoppingBag,
        description: 'Purchase requests, purchase orders and supplier deliveries.',
      },
    ],
  },
  {
    label: 'Back office',
    items: [
      {
        label: 'Finance',
        permission: 'finance:view',
        path: '/finance',
        icon: Landmark,
        description: 'Payables, receivables, expenses and the general ledger.',
      },
      {
        label: 'People',
        permission: 'people:view',
        path: '/people',
        icon: Users,
        description: 'Employees, departments, leave and payroll inputs.',
      },
      {
        label: 'Reports',
        permission: 'reports:view',
        path: '/reports',
        icon: BarChart3,
        description: 'Saved reports and scheduled exports across every module.',
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Settings',
        permission: 'settings:manage',
        path: '/settings',
        icon: Settings,
        description: 'Company profile, users and roles, numbering and preferences.',
      },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export function findNavItem(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.path === pathname)
}

/**
 * Permission-aware navigation (Phase 3): groups with no visible items
 * disappear entirely, so a viewer never sees an empty "Operations" heading.
 */
export function visibleNavGroups(can: (permission: Permission) => boolean): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(item.permission)),
  })).filter((group) => group.items.length > 0)
}
