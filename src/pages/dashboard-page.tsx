import { Download, Plus, RefreshCw, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useAuth } from '@/app/auth-provider'
import { CashFlowBars } from '@/components/dashboard/cash-flow-bars'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { OrdersDonut } from '@/components/dashboard/orders-donut'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { formatNumber, formatVndCompact, formatVndFull } from '@/lib/format'
import { BRANCHES, type BranchId, type RangeDays } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RANGES: Array<{ days: RangeDays; label: string }> = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

function parseRange(value: string | null): RangeDays {
  return value === '7' || value === '90' ? (Number(value) as RangeDays) : 30
}

function parseBranch(value: string | null): BranchId {
  return BRANCHES.some((branch) => branch.id === value) ? (value as BranchId) : 'all'
}

function exportCsv(data: NonNullable<ReturnType<typeof useDashboardData>['data']>) {
  const rows = [
    'date,revenue,orders,cash_in,cash_out',
    ...data.series.map((point) =>
      [
        point.date.toISOString().slice(0, 10),
        point.revenue,
        point.orders,
        point.cashIn,
        point.cashOut,
      ].join(','),
    ),
  ]
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `ledgerline-revenue-${data.query.branch}-${data.query.range}d.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Executive dashboard (Phase 4) — functional, on the mock API.
 * Filters live in the URL (?range=&branch=) so a view is shareable and the
 * back button works; every state is real: loading skeletons, an error panel
 * with retry, and permission-aware actions (New sales order only appears
 * for roles holding sales:create).
 */
export function DashboardPage() {
  const { user, can } = useAuth()
  const [params, setParams] = useSearchParams()
  const [simulateError, setSimulateError] = useState(false)

  const range = parseRange(params.get('range'))
  const branch = parseBranch(params.get('branch'))
  const { data, loading, error, refetch } = useDashboardData({ range, branch }, simulateError)

  const firstName = user?.name.split(' ').slice(-1)[0] ?? 'there'
  const branchLabel = BRANCHES.find((item) => item.id === branch)?.label ?? 'All branches'

  const updateParams = (next: Partial<{ range: RangeDays; branch: BranchId }>) => {
    const updated = new URLSearchParams(params)
    if (next.range) updated.set('range', String(next.range))
    if (next.branch) updated.set('branch', next.branch)
    setParams(updated)
  }

  const sparkRevenue = useMemo(() => data?.series.map((p) => p.revenue) ?? [], [data])
  const sparkOrders = useMemo(() => data?.series.map((p) => p.orders) ?? [], [data])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Good afternoon, ${firstName}`}
        description={`Executive overview for the last ${range} days — ${branchLabel.toLowerCase()}. Data comes from the mock API; filters update every figure below.`}
        badge="Mock data"
        actions={
          <>
            <Button variant="outline" onClick={refetch} disabled={loading}>
              <RefreshCw data-icon aria-hidden="true" className={cn(loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => data && exportCsv(data)} disabled={!data || loading}>
              <Download data-icon aria-hidden="true" />
              Export CSV
            </Button>
            {can('sales:create') && (
              <Button>
                <Plus data-icon aria-hidden="true" />
                New sales order
              </Button>
            )}
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <span id="range-label" className="text-sm font-medium">Date range</span>
            <div role="radiogroup" aria-labelledby="range-label" className="flex rounded-md border p-0.5">
              {RANGES.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  role="radio"
                  aria-checked={range === option.days}
                  onClick={() => updateParams({ range: option.days })}
                  className={cn(
                    'min-h-9 cursor-pointer rounded px-3 text-sm transition-colors duration-200',
                    range === option.days
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="branch-select" className="text-sm font-medium">Branch</label>
            <select
              id="branch-select"
              value={branch}
              onChange={(event) => updateParams({ branch: event.target.value as BranchId })}
              className="h-10 cursor-pointer rounded-md border bg-background px-2 text-sm"
            >
              {BRANCHES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(event) => setSimulateError(event.target.checked)}
              className="size-4 accent-primary"
            />
            Simulate API error (demo)
          </label>

          <p aria-live="polite" className="ml-auto text-sm text-muted-foreground">
            {loading ? 'Loading dashboard data…' : data ? `Showing ${range} days · ${branchLabel}` : ''}
          </p>
        </CardContent>
      </Card>

      {error && !loading && (
        <section role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4">
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
            Dashboard data could not be loaded
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw data-icon aria-hidden="true" />
            Try again
          </Button>
        </section>
      )}

      <div aria-busy={loading}>
        {loading && !data ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            {/* KPI cards */}
            <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title={`Revenue · last ${range} days`}
                value={formatVndCompact(data.kpis.revenue)}
                deltaPct={data.kpis.revenueDeltaPct}
                deltaLabel="vs previous period"
                spark={sparkRevenue}
              />
              <KpiCard
                title="Sales orders"
                value={formatNumber(data.kpis.orders)}
                deltaPct={data.kpis.ordersDeltaPct}
                deltaLabel="vs previous period"
                spark={sparkOrders}
              />
              <KpiCard
                title="Gross margin"
                value={`${data.kpis.grossMarginPct.toFixed(1)}%`}
                deltaPct={data.kpis.marginDeltaPoints}
                deltaLabel="points vs previous period"
                spark={sparkRevenue.map((v, i) => v * (0.26 + (i % 5) * 0.004))}
              />
              <KpiCard
                title="Inventory value"
                value={formatVndCompact(data.kpis.inventoryValue)}
                deltaPct={data.kpis.inventoryDeltaPct}
                deltaLabel="vs previous period"
                deltaGoodWhenUp={false}
                spark={sparkRevenue.map((v) => v * 0.4)}
              />
            </section>

            {/* Charts */}
            <section className="grid gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue trend</CardTitle>
                  <CardDescription>
                    Daily revenue, {branchLabel.toLowerCase()}. Hover the chart for exact daily figures.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <RevenueChart series={data.series} />
                  <details>
                    <summary className="min-h-11 cursor-pointer text-sm font-medium text-primary">
                      View daily figures as a table
                    </summary>
                    <div className="mt-2 max-h-64 overflow-auto">
                      <table className="w-full text-sm">
                        <caption className="sr-only">Daily revenue and orders</caption>
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th scope="col" className="py-2 pr-4 font-medium">Date</th>
                            <th scope="col" className="py-2 pr-4 font-medium">Revenue</th>
                            <th scope="col" className="py-2 font-medium">Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.series.map((point) => (
                            <tr key={point.date.toISOString()} className="border-b last:border-0">
                              <td className="py-1.5 pr-4">
                                {point.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </td>
                              <td className="tnum py-1.5 pr-4">{formatVndFull(point.revenue)}</td>
                              <td className="tnum py-1.5">{formatNumber(point.orders)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orders by status</CardTitle>
                  <CardDescription>Where the period's orders stand right now.</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrdersDonut data={data.orderStatus} />
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Cash flow</CardTitle>
                  <CardDescription>Money in versus money out, grouped by week.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashFlowBars series={data.series} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock below reorder point</CardTitle>
                  <CardDescription>{data.kpis.lowStockCount} items need a purchase decision.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col">
                    {data.lowStock.map((item) => (
                      <li key={item.sku} className="flex items-center gap-3 border-b py-2.5 last:border-0">
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{item.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
                        </span>
                        <Badge variant="warning">
                          {item.onHand} / {item.reorderPoint}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Top products */}
            <Card>
              <CardHeader>
                <CardTitle>Top products by revenue</CardTitle>
                <CardDescription>Best sellers in the selected period and branch.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-130 text-sm">
                    <caption className="sr-only">Top products by revenue</caption>
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th scope="col" className="py-2 pr-4 font-medium">SKU</th>
                        <th scope="col" className="py-2 pr-4 font-medium">Product</th>
                        <th scope="col" className="py-2 pr-4 text-right font-medium">Units</th>
                        <th scope="col" className="py-2 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((product) => (
                        <tr key={product.sku} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-mono text-[0.8125rem]">{product.sku}</td>
                          <td className="py-2 pr-4 font-medium">{product.name}</td>
                          <td className="tnum py-2 pr-4 text-right">{formatNumber(product.units)}</td>
                          <td className="tnum py-2 text-right">{formatVndFull(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
