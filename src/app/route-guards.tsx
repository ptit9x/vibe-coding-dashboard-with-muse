import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/app/auth-provider'
import { PageHeader } from '@/components/layout/page-header'
import { buttonVariants } from '@/components/ui/button'
import type { Permission } from '@/config/permissions'
import { cn } from '@/lib/utils'

/**
 * Protected routing (Phase 3).
 *
 * RequireAuth wraps the whole shell: signed-out visitors are sent to
 * /login, carrying the page they wanted in location.state so a successful
 * login returns them there instead of always landing on the dashboard.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <>{children}</>
}

/**
 * Per-route RBAC guard. A signed-in user without the permission gets a
 * real 403-style page — what is missing and how to get it — not a blank
 * screen or a silent redirect they cannot explain.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { can, user } = useAuth()

  if (can(permission)) return <>{children}</>

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="You do not have access to this page" badge="403" />
      <section className="flex flex-col items-start gap-4 rounded-lg border bg-card px-6 py-10 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <ShieldAlert aria-hidden="true" className="size-6" />
        </span>
        <p className="max-w-prose text-muted-foreground">
          This page needs the <span className="font-mono text-sm">{permission}</span> permission.
          You are signed in as {user?.name} ({user?.email}), and your role does not include it.
          Ask an administrator to change your role if you need this module.
        </p>
        <Link to="/" className={cn(buttonVariants(), 'cursor-pointer')}>
          Back to dashboard
        </Link>
      </section>
    </div>
  )
}
