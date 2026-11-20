/**
 * Deterministic mock dataset for the executive dashboard (Phase 4).
 *
 * A seeded RNG makes every (range, branch) pair produce the same numbers on
 * every load and in tests — "realistic" here means internally consistent:
 * filters genuinely change the data, KPI deltas compare against the previous
 * period of the same length, and chart series add up to the KPI totals.
 * The mock "today" is fixed at 18 Nov 2026 so demos and tests are stable.
 */

export type BranchId = 'all' | 'hcm' | 'hanoi' | 'danang'
export type RangeDays = 7 | 30 | 90

export interface DashboardQuery {
  range: RangeDays
  branch: BranchId
}

export const BRANCHES: Array<{ id: BranchId; label: string }> = [
  { id: 'all', label: 'All branches' },
  { id: 'hcm', label: 'Ho Chi Minh City' },
  { id: 'hanoi', label: 'Hanoi' },
  { id: 'danang', label: 'Da Nang' },
]

export const MOCK_TODAY = new Date(2026, 10, 18)

export interface DayPoint {
  date: Date
  revenue: number
  orders: number
  cashIn: number
  cashOut: number
}

export interface DashboardData {
  query: DashboardQuery
  kpis: {
    revenue: number
    revenueDeltaPct: number
    orders: number
    ordersDeltaPct: number
    grossMarginPct: number
    marginDeltaPoints: number
    inventoryValue: number
    inventoryDeltaPct: number
    lowStockCount: number
  }
  series: DayPoint[]
  orderStatus: Array<{ status: string; count: number }>
  topProducts: Array<{ sku: string; name: string; revenue: number; units: number }>
  lowStock: Array<{ sku: string; name: string; onHand: number; reorderPoint: number }>
}

/** mulberry32 — small deterministic PRNG. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFor(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const BRANCH_FACTOR: Record<BranchId, number> = {
  all: 1,
  hcm: 0.52,
  hanoi: 0.31,
  danang: 0.17,
}

function generateSeries(query: DashboardQuery, daysBack: number): DayPoint[] {
  const rand = rng(seedFor(`series-${query.branch}-${daysBack}`))
  const factor = BRANCH_FACTOR[query.branch]
  const points: DayPoint[] = []
  for (let offset = daysBack - 1; offset >= 0; offset--) {
    const date = new Date(MOCK_TODAY)
    date.setDate(date.getDate() - offset)
    const weekday = date.getDay()
    const weekendDip = weekday === 0 || weekday === 6 ? 0.62 : 1
    const growth = 1 + (daysBack - offset) * 0.0012
    const noise = 0.82 + rand() * 0.42
    const revenue = Math.round(46_000_000 * factor * weekendDip * growth * noise)
    const orders = Math.max(2, Math.round((revenue / 315_000) * (0.9 + rand() * 0.2)))
    const cashIn = Math.round(revenue * (0.86 + rand() * 0.2))
    const cashOut = Math.round(revenue * (0.58 + rand() * 0.22))
    points.push({ date, revenue, orders, cashIn, cashOut })
  }
  return points
}

const PRODUCT_CATALOG = [
  { sku: 'SKU-1042', name: 'Wireless barcode scanner', baseRevenue: 168_000_000, baseUnits: 412 },
  { sku: 'SKU-2210', name: 'Thermal label printer', baseRevenue: 141_000_000, baseUnits: 268 },
  { sku: 'SKU-0875', name: 'Industrial shelving unit', baseRevenue: 118_000_000, baseUnits: 96 },
  { sku: 'SKU-3301', name: 'Hand pallet truck 2.5T', baseRevenue: 97_000_000, baseUnits: 41 },
  { sku: 'SKU-1180', name: 'POS terminal bundle', baseRevenue: 84_000_000, baseUnits: 73 },
  { sku: 'SKU-4027', name: 'Packing tape (case of 36)', baseRevenue: 52_000_000, baseUnits: 1_240 },
]

const LOW_STOCK_CATALOG = [
  { sku: 'SKU-1042', name: 'Wireless barcode scanner', onHand: 6, reorderPoint: 12 },
  { sku: 'SKU-1180', name: 'POS terminal bundle', onHand: 3, reorderPoint: 8 },
  { sku: 'SKU-4027', name: 'Packing tape (case of 36)', onHand: 18, reorderPoint: 40 },
  { sku: 'SKU-2210', name: 'Thermal label printer', onHand: 5, reorderPoint: 10 },
]

export function generateDashboardData(query: DashboardQuery): DashboardData {
  const current = generateSeries(query, query.range)
  const previous = generateSeries(query, query.range * 2).slice(0, query.range)
  const rand = rng(seedFor(`agg-${query.branch}-${query.range}`))
  const factor = BRANCH_FACTOR[query.branch]
  const rangeScale = query.range / 30

  const revenue = current.reduce((sum, point) => sum + point.revenue, 0)
  const prevRevenue = previous.reduce((sum, point) => sum + point.revenue, 0)
  const orders = current.reduce((sum, point) => sum + point.orders, 0)
  const prevOrders = previous.reduce((sum, point) => sum + point.orders, 0)
  const grossMarginPct = 27 + rand() * 4
  const inventoryValue = Math.round(2_840_000_000 * (factor === 1 ? 1 : factor * 1.35) * (0.94 + rand() * 0.12))

  const statusShares: Array<[string, number]> = [
    ['Confirmed', 0.38],
    ['Picking', 0.21],
    ['In delivery', 0.24],
    ['Completed', 0.12],
    ['Cancelled', 0.05],
  ]
  const orderStatus = statusShares.map(([status, share]) => ({
    status,
    count: Math.max(1, Math.round(orders * share * (0.92 + rand() * 0.16))),
  }))

  const topProducts = PRODUCT_CATALOG.map((product) => ({
    sku: product.sku,
    name: product.name,
    revenue: Math.round(product.baseRevenue * factor * rangeScale * (0.9 + rand() * 0.2)),
    units: Math.round(product.baseUnits * factor * rangeScale * (0.9 + rand() * 0.2)),
  })).sort((a, b) => b.revenue - a.revenue)

  const lowStock =
    query.branch === 'danang' ? LOW_STOCK_CATALOG.slice(0, 3) : LOW_STOCK_CATALOG

  return {
    query,
    kpis: {
      revenue,
      revenueDeltaPct: ((revenue - prevRevenue) / prevRevenue) * 100,
      orders,
      ordersDeltaPct: ((orders - prevOrders) / prevOrders) * 100,
      grossMarginPct,
      marginDeltaPoints: (rand() - 0.35) * 2,
      inventoryValue,
      inventoryDeltaPct: (rand() - 0.55) * 8,
      lowStockCount: lowStock.length,
    },
    series: current,
    orderStatus,
    topProducts,
    lowStock,
  }
}
