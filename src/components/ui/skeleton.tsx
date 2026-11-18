import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/** shadcn/ui Skeleton — loading placeholder; pair with aria-busy on the region it fills. */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export { Skeleton }
