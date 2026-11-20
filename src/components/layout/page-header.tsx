import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description?: string
  /** e.g. "Phase 3 — not built yet" so placeholder pages never pretend to be finished modules. */
  badge?: string
  actions?: ReactNode
}

/** One page heading per page (the <h1>), with a consistent description and action row. */
export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
