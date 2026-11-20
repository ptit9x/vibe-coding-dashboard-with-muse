import { Inbox } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { NavItem } from '@/config/navigation'

/**
 * Empty-state placeholder for a module that is not built yet.
 * It says plainly what the module will hold and why it is empty —
 * an empty screen is an invitation to act, not a dead end
 * (frontend-design + senior-frontend state rules).
 */
export function ModulePlaceholderPage({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={item.label} description={item.description} badge="Not built yet" />

      <section
        aria-label={`${item.label} is not built yet`}
        className="flex flex-col items-center gap-4 rounded-lg border bg-card px-6 py-14 text-center shadow-sm"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div className="flex max-w-md flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">No {item.label.toLowerCase()} records yet</h2>
          <p className="text-sm text-muted-foreground">
            This module is not built yet. The shell, authentication, routing, permissions and
            design system are ready for it — its screens, data and workflows arrive in its own phase.
          </p>
        </div>
        <Button disabled aria-describedby="module-disabled-note">
          <Inbox data-icon="inline-start" aria-hidden="true" />
          Add the first record
        </Button>
        <p id="module-disabled-note" className="text-xs text-muted-foreground">
          Disabled until the {item.label} module is built.
        </p>
      </section>

      {/* Skeleton demonstrates the loading state this page will use later. */}
      <section aria-label="Preview of the loading state" aria-busy="true" className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">Loading state preview</p>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </section>
    </div>
  )
}
