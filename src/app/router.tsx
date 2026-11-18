import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { ALL_NAV_ITEMS } from '@/config/navigation'
import { DashboardPage } from '@/pages/dashboard-page'
import { ModulePlaceholderPage } from '@/pages/module-placeholder-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SettingsPage } from '@/pages/settings-page'

/**
 * Routing (Phase 1): one shell route, one child per navigation item.
 * Dashboard and Settings have real Phase 1+2 screens; every other module
 * renders the honest placeholder until its own phase builds it.
 */
const moduleRoutes = ALL_NAV_ITEMS.filter(
  (item) => item.path !== '/' && item.path !== '/settings',
).map((item) => ({
  path: item.path.slice(1),
  element: <ModulePlaceholderPage item={item} />,
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      ...moduleRoutes,
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
