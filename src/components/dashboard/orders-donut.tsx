import { formatNumber } from '@/lib/format'

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

/**
 * Orders by status — SVG donut with a legend that carries the exact counts,
 * so the chart is never the only place the numbers live.
 */
export function OrdersDonut({ data }: { data: Array<{ status: string; count: number }> }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const segments = data.reduce<Array<{ status: string; count: number; dash: number; offset: number }>>(
    (acc, item) => {
      const previous = acc[acc.length - 1]
      const offset = previous ? previous.offset + previous.dash : 0
      const dash = total === 0 ? 0 : (item.count / total) * circumference
      return [...acc, { status: item.status, count: item.count, dash, offset }]
    },
    [],
  )

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 200 200" className="size-44 shrink-0" role="img" aria-label={`Orders by status, ${formatNumber(total)} orders in total. Counts are listed beside the chart.`}>
        <g transform="rotate(-90 100 100)">
          {segments.map((segment, i) => (
            <circle
              key={segment.status}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth="26"
              strokeDasharray={`${Math.max(0, segment.dash - 2)} ${circumference - segment.dash + 2}`}
              strokeDashoffset={-segment.offset}
            >
              <title>{`${segment.status}: ${formatNumber(segment.count)} orders`}</title>
            </circle>
          ))}
        </g>
        <text x="100" y="96" textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--foreground)">
          {formatNumber(total)}
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
          orders
        </text>
      </svg>
      <ul className="flex min-w-44 flex-1 flex-col gap-2 text-sm">
        {data.map((item, i) => (
          <li key={item.status} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="flex-1">{item.status}</span>
            <span className="tnum font-medium">{formatNumber(item.count)}</span>
            <span className="tnum w-12 text-right text-muted-foreground">
              {total === 0 ? '0%' : `${((item.count / total) * 100).toFixed(0)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
