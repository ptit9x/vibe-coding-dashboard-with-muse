import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearSession,
  DEMO_PASSWORD,
  loadSession,
  mockLogin,
  saveSession,
} from '@/lib/mock-auth'
import { fetchDashboard } from '@/lib/mock-api'
import { generateDashboardData } from '@/lib/mock-data'

describe('mock auth API', () => {
  beforeEach(() => {
    clearSession()
  })

  it('signs in the admin demo account with role permissions attached', async () => {
    const session = await mockLogin('admin@ledgerline.vn', DEMO_PASSWORD)
    expect(session.user.role).toBe('admin')
    expect(session.user.permissions).toContain('settings:manage')
    expect(session.token).toBe('mock-token-u-admin')
  })

  it('rejects a wrong password with a readable error', async () => {
    await expect(mockLogin('admin@ledgerline.vn', 'wrong-password')).rejects.toThrow(
      'Invalid email or password',
    )
  })

  it('rejects an unknown email', async () => {
    await expect(mockLogin('nobody@ledgerline.vn', DEMO_PASSWORD)).rejects.toThrow(
      'Invalid email or password',
    )
  })

  it('session survives a save/load round-trip and validates the account', async () => {
    const session = await mockLogin('viewer@ledgerline.vn', DEMO_PASSWORD)
    saveSession(session)
    const loaded = loadSession()
    expect(loaded?.user.email).toBe('viewer@ledgerline.vn')
    expect(loaded?.user.permissions).toEqual(['dashboard:view'])
  })

  it('loadSession returns null for a forged token', () => {
    window.localStorage.setItem(
      'ledgerline-session',
      JSON.stringify({ token: 'forged', user: { id: 'u-admin' } }),
    )
    expect(loadSession()).toBeNull()
  })
})

describe('mock dashboard API', () => {
  it('is deterministic: same query, same data', () => {
    const a = generateDashboardData({ range: 30, branch: 'all' })
    const b = generateDashboardData({ range: 30, branch: 'all' })
    expect(a).toEqual(b)
  })

  it('series length matches the requested range', async () => {
    const data = await fetchDashboard({ range: 7, branch: 'all' }, { latencyMs: 0 })
    expect(data.series).toHaveLength(7)
    const data90 = await fetchDashboard({ range: 90, branch: 'hcm' }, { latencyMs: 0 })
    expect(data90.series).toHaveLength(90)
  })

  it('branch filter changes the revenue (HCM is a subset of all branches)', () => {
    const all = generateDashboardData({ range: 30, branch: 'all' })
    const hcm = generateDashboardData({ range: 30, branch: 'hcm' })
    expect(hcm.kpis.revenue).toBeLessThan(all.kpis.revenue)
    expect(hcm.kpis.revenue).toBeGreaterThan(0)
  })

  it('KPI revenue equals the sum of the daily series', () => {
    const data = generateDashboardData({ range: 30, branch: 'hanoi' })
    const sum = data.series.reduce((acc, point) => acc + point.revenue, 0)
    expect(data.kpis.revenue).toBe(sum)
  })

  it('simulateError makes the API reject with a readable message', async () => {
    await expect(
      fetchDashboard({ range: 30, branch: 'all' }, { latencyMs: 0, simulateError: true }),
    ).rejects.toThrow('reporting service did not respond')
  })
})
