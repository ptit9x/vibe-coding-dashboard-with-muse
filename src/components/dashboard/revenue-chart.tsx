import { useMemo, useState } from 'react'

import { formatNumber, formatVndCompact, formatVndFull } from '@/lib/format'
import type { DayPoint } from '@/lib/mock-data'

const WIDTH = 720
const HEIGHT = 260
const PAD = { top: 16, right: 12, bottom: 28, left: 56 }

function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Revenue trend — hand-rolled SVG line/area chart on the design tokens
 * (no chart dependency in Phase 4). Pointer hover snaps to the nearest day
 * and shows its exact figures; the same numbers are available as a data
 * table next to the chart for screen readers and precise reading.
 */
export function RevenueChart({ series }: { series: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const { linePath, areaPath, max, points } = useMemo(() => {
    const maxValue = Math.max(...series.map((point) => point.revenue)) * 1.1
    const innerW = WIDTH - PAD.left - PAD.right
    const innerH = HEIGHT - PAD.top - PAD.bottom
    const x = (i: number) => PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW)
    const y = (v: number) => PAD.top + innerH - (v / maxValue) * innerH
    const pts = series.map((point, i) => ({ x: x(i), y: y(point.revenue), point }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${(HEIGHT - PAD.bottom).toFixed(1)} L${pts[0].x.toFixed(1)},${(HEIGHT - PAD.bottom).toFixed(1)} Z`
    return { linePath: line, areaPath: area, max: maxValue, points: pts }
  }, [series])

  const innerH = HEIGHT - PAD.top - PAD.bottom
  const total = series.reduce((sum, point) => sum + point.revenue, 0)
  const hovered = hover !== null ? points[hover] : null

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    setHover(nearest)
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Revenue trend over ${series.length} days, total ${formatVndFull(total)}. Hover or read the data table for daily values.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = PAD.top + innerH - fraction * innerH
          return (
            <g key={fraction}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                {formatVndCompact(max * fraction)}
              </text>
            </g>
          )
        })}
        <path d={areaPath} fill="var(--chart-1)" opacity="0.14" />
        <path d={linePath} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) =>
          i % Math.ceil(series.length / 6) === 0 || i === series.length - 1 ? (
            <text key={p.point.date.toISOString()} x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
              {dayLabel(p.point.date)}
            </text>
          ) : null,
        )}
        {hovered && (
          <g>
            <line x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="var(--muted-foreground)" strokeDasharray="2 3" />
            <circle cx={hovered.x} cy={hovered.y} r="4.5" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: `${Math.min(82, Math.max(2, (hovered.x / WIDTH) * 100 - 9))}%` }}
        >
          <p className="font-medium">{dayLabel(hovered.point.date)}</p>
          <p className="text-muted-foreground">
            Revenue <span className="tnum font-medium text-foreground">{formatVndFull(hovered.point.revenue)}</span>
          </p>
          <p className="text-muted-foreground">
            Orders <span className="tnum font-medium text-foreground">{formatNumber(hovered.point.orders)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
