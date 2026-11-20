import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { formatDelta } from '@/lib/format'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  deltaPct: number
  deltaLabel: string
  /** For inventory value a rise is not automatically good news. */
  deltaGoodWhenUp?: boolean
  spark: number[]
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 96},${30 - ((v - min) / range) * 26}`)
    .join(' ')
  return (
    <svg viewBox="0 0 96 32" className="h-8 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

/** Executive KPI card: value, period delta with direction, and a sparkline. */
export function KpiCard({ title, value, deltaPct, deltaLabel, deltaGoodWhenUp = true, spark }: KpiCardProps) {
  const up = deltaPct >= 0
  const good = up === deltaGoodWhenUp
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="tnum font-display text-2xl font-semibold tracking-tight">{value}</p>
          <Sparkline values={spark} />
        </div>
        <p className={cn('flex items-center gap-1 text-xs font-medium', good ? 'text-primary' : 'text-destructive')}>
          {up ? <TrendingUp aria-hidden="true" className="size-3.5" /> : <TrendingDown aria-hidden="true" className="size-3.5" />}
          {formatDelta(deltaPct)}
          <span className="font-normal text-muted-foreground">{deltaLabel}</span>
        </p>
      </CardContent>
    </Card>
  )
}
