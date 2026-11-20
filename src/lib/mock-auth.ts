import {
  permissionsForRole,
  type Permission,
  type Role,
} from '@/config/permissions'

export interface DemoUser {
  id: string
  name: string
  email: string
  role: Role
  initials: string
}

export interface AuthSession {
  token: string
  user: DemoUser & { permissions: Permission[] }
}

interface DemoAccount extends DemoUser {
  password: string
}

/**
 * Mock authentication (Phase 3) — DEMO ONLY, per Henry's instruction.
 *
 * There is no server. Accounts and passwords live in this file so a reviewer
 * can sign in immediately; the "API" simulates latency and returns a fake
 * token. Never reuse this pattern with real credentials: a production build
 * must verify passwords server-side and issue signed, expiring tokens.
 */
export const DEMO_PASSWORD = 'demo123'

const ACCOUNTS: DemoAccount[] = [
  {
    id: 'u-admin',
    name: 'Richard Do',
    email: 'admin@ledgerline.vn',
    password: DEMO_PASSWORD,
    role: 'admin',
    initials: 'RH',
  },
  {
    id: 'u-manager',
    name: 'Lan Anh Nguyen',
    email: 'manager@ledgerline.vn',
    password: DEMO_PASSWORD,
    role: 'operations-manager',
    initials: 'LA',
  },
  {
    id: 'u-accountant',
    name: 'Ha Tran',
    email: 'accountant@ledgerline.vn',
    password: DEMO_PASSWORD,
    role: 'accountant',
    initials: 'HT',
  },
  {
    id: 'u-viewer',
    name: 'Tuan Pham',
    email: 'viewer@ledgerline.vn',
    password: DEMO_PASSWORD,
    role: 'viewer',
    initials: 'TP',
  },
]

/** Accounts shown on the login screen so a reviewer can pick a role in one click. */
export const DEMO_ACCOUNTS: Array<Pick<DemoAccount, 'name' | 'email' | 'role'>> = ACCOUNTS.map(
  ({ name, email, role }) => ({ name, email, role }),
)

const SESSION_KEY = 'ledgerline-session'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toSession(account: DemoAccount): AuthSession {
  const { password: _password, ...user } = account
  return {
    // Fake token: readable on purpose so the demo is inspectable in devtools.
    token: `mock-token-${account.id}`,
    user: { ...user, permissions: permissionsForRole(account.role) },
  }
}

export async function mockLogin(email: string, password: string): Promise<AuthSession> {
  await delay(500)
  const account = ACCOUNTS.find(
    (item) => item.email === email.trim().toLowerCase() && item.password === password,
  )
  if (!account) {
    throw new Error('Invalid email or password. Check the demo accounts listed and try again.')
  }
  return toSession(account)
}

export function saveSession(session: AuthSession) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable: the session lives in memory for this tab only.
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    // A stored session is only trusted if it names a real demo account and
    // carries that account's current role permissions.
    const account = ACCOUNTS.find((item) => item.id === parsed.user?.id)
    if (!account || parsed.token !== `mock-token-${account.id}`) return null
    return toSession(account)
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear.
  }
}
