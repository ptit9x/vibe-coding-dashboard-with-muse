import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Error state for an unknown route — what happened, and the way out. */
export function NotFoundPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Page not found" />
      <section className="flex flex-col items-start gap-4 rounded-lg border bg-card px-6 py-10 shadow-sm">
        <p className="max-w-prose text-muted-foreground">
          There is no page at this address. The link may be wrong, or the module may not have been
          added to the navigation yet.
        </p>
        <Link to="/" className={cn(buttonVariants(), 'cursor-pointer')}>
          Back to dashboard
        </Link>
      </section>
    </div>
  )
}
