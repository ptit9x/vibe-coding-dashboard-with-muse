import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchDashboard } from '@/lib/mock-api'
import type { DashboardData, DashboardQuery } from '@/lib/mock-data'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Data hook for the executive dashboard.
 * Keeps the previous data visible under the loading flag on refetch, drops
 * stale responses when filters change quickly, and surfaces failures as a
 * message the page renders in its error state.
 */
export function useDashboardData(query: DashboardQuery, simulateError: boolean): DashboardState {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)
  const requestId = useRef(0)

  const refetch = useCallback(() => setReloadCount((count) => count + 1), [])

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    fetchDashboard(query, { simulateError })
      .then((result) => {
        if (requestId.current !== id) return
        setData(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return
        setError(err instanceof Error ? err.message : 'Could not load dashboard data.')
        setLoading(false)
      })
    // query fields are primitives; depending on them individually avoids
    // refetch loops from a fresh object identity each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.range, query.branch, simulateError, reloadCount])

  return { data, loading, error, refetch }
}
