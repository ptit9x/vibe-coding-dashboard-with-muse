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
        path: '/sales',
        icon: ShoppingCart,
        description: 'Quotes, sales orders, invoices and customer balances.',
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: Package,
        description: 'Stock levels, warehouses, movements and reorder points.',
      },
      {
        label: 'Purchasing',
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
        path: '/finance',
        icon: Landmark,
        description: 'Payables, receivables, expenses and the general ledger.',
      },
      {
        label: 'People',
        path: '/people',
        icon: Users,
        description: 'Employees, departments, leave and payroll inputs.',
      },
      {
        label: 'Reports',
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
