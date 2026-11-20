import { createBrowserRouter } from 'react-router-dom'

import { RequireAuth, RequirePermission } from '@/app/route-guards'
import { AppShell } from '@/components/layout/app-shell'
import { ALL_NAV_ITEMS } from '@/config/navigation'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { ModulePlaceholderPage } from '@/pages/module-placeholder-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SettingsPage } from '@/pages/settings-page'

/**
 * Routing (Phase 1 + 3):
 * - /login is the only public route.
 * - The shell sits behind RequireAuth; every module route also sits behind
 *   RequirePermission with the same permission that controls its nav item,
 *   so hiding a menu can never be the only protection — direct URLs are
 *   guarded too.
 */
const moduleRoutes = ALL_NAV_ITEMS.filter(
  (item) => item.path !== '/' && item.path !== '/settings',
).map((item) => ({
  path: item.path.slice(1),
  element: (
    <RequirePermission permission={item.permission}>
      <ModulePlaceholderPage item={item} />
    </RequirePermission>
  ),
}))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <RequirePermission permission="dashboard:view">
            <DashboardPage />
          </RequirePermission>
        ),
      },
      ...moduleRoutes,
      {
        path: 'settings',
        element: (
          <RequirePermission permission="settings:manage">
            <SettingsPage />
          </RequirePermission>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
