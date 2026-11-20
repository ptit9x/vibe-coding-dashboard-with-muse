import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthProvider } from '@/app/auth-provider'
import { RequireAuth, RequirePermission } from '@/app/route-guards'
import { SidebarContent } from '@/components/layout/sidebar'
import { DEMO_PASSWORD, mockLogin, saveSession } from '@/lib/mock-auth'

function renderWith(routes: React.ReactNode, initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>{routes}</MemoryRouter>
    </AuthProvider>,
  )
}

describe('route guards', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('RequireAuth sends a signed-out visitor to /login', () => {
    renderWith(
      <Routes>
        <Route path="/login" element={<p>Login screen</p>} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <p>Protected content</p>
            </RequireAuth>
          }
        />
      </Routes>,
      '/',
    )
    expect(screen.getByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('RequirePermission shows the 403 page when the role lacks the permission', async () => {
    saveSession(await mockLogin('viewer@ledgerline.vn', DEMO_PASSWORD))
    renderWith(
      <Routes>
        <Route
          path="/finance"
          element={
            <RequirePermission permission="finance:view">
              <p>Finance module</p>
            </RequirePermission>
          }
        />
      </Routes>,
      '/finance',
    )
    expect(screen.getByText('You do not have access to this page')).toBeInTheDocument()
    expect(screen.getByText('finance:view')).toBeInTheDocument()
    expect(screen.queryByText('Finance module')).not.toBeInTheDocument()
  })

  it('RequirePermission renders the page when the role holds the permission', async () => {
    saveSession(await mockLogin('accountant@ledgerline.vn', DEMO_PASSWORD))
    renderWith(
      <Routes>
        <Route
          path="/finance"
          element={
            <RequirePermission permission="finance:view">
              <p>Finance module</p>
            </RequirePermission>
          }
        />
      </Routes>,
      '/finance',
    )
    expect(screen.getByText('Finance module')).toBeInTheDocument()
  })
})

describe('permission-aware sidebar', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('viewer sidebar shows Dashboard only — no Sales, Inventory or Settings links', async () => {
    saveSession(await mockLogin('viewer@ledgerline.vn', DEMO_PASSWORD))
    renderWith(<SidebarContent />, '/')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sales' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Inventory' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
    expect(screen.getByText('Viewer')).toBeInTheDocument()
  })

  it('manager sidebar shows Purchasing but not Finance or Settings', async () => {
    saveSession(await mockLogin('manager@ledgerline.vn', DEMO_PASSWORD))
    renderWith(<SidebarContent />, '/')
    expect(screen.getByRole('link', { name: 'Purchasing' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Finance' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })
})
