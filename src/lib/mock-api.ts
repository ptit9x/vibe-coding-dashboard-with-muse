import {
  generateDashboardData,
  type DashboardData,
  type DashboardQuery,
} from '@/lib/mock-data'

/**
 * Mock API for the dashboard (Phase 4).
 *
 * Stands in for the real HTTP layer: same shape a fetch client would have
 * (async, latency, can fail), so the dashboard's loading/error handling is
 * exercised exactly as it will be against a backend. `simulateError` exists
 * so reviewers can see the error state on demand — a real client would get
 * failures from the network instead.
 */
export interface MockApiOptions {
  latencyMs?: number
  simulateError?: boolean
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchDashboard(
  query: DashboardQuery,
  options: MockApiOptions = {},
): Promise<DashboardData> {
  await delay(options.latencyMs ?? 450)
  if (options.simulateError) {
    throw new Error('The reporting service did not respond. Your filters are saved — try again.')
  }
  return generateDashboardData(query)
}
