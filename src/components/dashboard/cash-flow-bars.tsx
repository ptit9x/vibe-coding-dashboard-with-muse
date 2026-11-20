import { formatVndCompact } from '@/lib/format'
import type { DayPoint } from '@/lib/mock-data'

interface WeekBucket {
  label: string
  cashIn: number
  cashOut: number
}

/** Group daily points into weekly buckets so 90-day ranges stay readable. */
export function bucketByWeek(series: DayPoint[]): WeekBucket[] {
  const buckets: WeekBucket[] = []
  for (let i = 0; i < series.length; i += 7) {
    const chunk = series.slice(i, i + 7)
    const first = chunk[0].date
    const last = chunk[chunk.length - 1].date
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    buckets.push({
      label: `${fmt(first)} – ${fmt(last)}`,
      cashIn: chunk.reduce((sum, p) => sum + p.cashIn, 0),
      cashOut: chunk.reduce((sum, p) => sum + p.cashOut, 0),
    })
  }
  return buckets
}

/** Cash in vs cash out per week — paired bars on the chart tokens. */
export function CashFlowBars({ series }: { series: DayPoint[] }) {
  const buckets = bucketByWeek(series)
  const max = Math.max(...buckets.map((b) => Math.max(b.cashIn, b.cashOut))) * 1.08
  const width = 720
  const height = 240
  const padBottom = 26
  const padTop = 14
  const innerH = height - padBottom - padTop
  const groupW = width / buckets.length
  const barW = Math.min(26, groupW / 4)

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Cash flow by week: money in versus money out across ${buckets.length} weeks. Exact weekly totals are in the legend table below.`}
      >
        {buckets.map((bucket, i) => {
          const cx = i * groupW + groupW / 2
          const inH = (bucket.cashIn / max) * innerH
          const outH = (bucket.cashOut / max) * innerH
          return (
            <g key={bucket.label}>
              <rect x={cx - barW - 3} y={padTop + innerH - inH} width={barW} height={inH} rx="3" fill="var(--chart-2)">
                <title>{`Week of ${bucket.label}: cash in ${formatVndCompact(bucket.cashIn)}`}</title>
              </rect>
              <rect x={cx + 3} y={padTop + innerH - outH} width={barW} height={outH} rx="3" fill="var(--chart-4)">
                <title>{`Week of ${bucket.label}: cash out ${formatVndCompact(bucket.cashOut)}`}</title>
              </rect>
              <text x={cx} y={height - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted-foreground)">
                {bucket.label.split(' – ')[0]}
              </text>
            </g>
          )
        })}
        <line x1="0" x2={width} y1={padTop + innerH} y2={padTop + innerH} stroke="var(--border)" />
      </svg>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: 'var(--chart-2)' }} /> Cash in
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: 'var(--chart-4)' }} /> Cash out
        </span>
        <span>Peak week {formatVndCompact(max / 1.08)} in.</span>
      </div>
    </div>
  )
}
