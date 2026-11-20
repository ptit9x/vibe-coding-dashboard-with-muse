/** Money and number formatting for the console (Vietnamese dong, compact). */

export function formatVndCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `₫${(value / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(value) >= 1_000_000) return `₫${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `₫${(value / 1_000).toFixed(0)}K`
  return `₫${Math.round(value)}`
}

export function formatVndFull(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

/** Signed percentage delta, e.g. +8.2% / -3.1%. */
export function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? '+' : ''
  return `${sign}${deltaPct.toFixed(1)}%`
}
