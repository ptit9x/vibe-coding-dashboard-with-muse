import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { hasPermission, type Permission } from '@/config/permissions'
import {
  clearSession,
  loadSession,
  mockLogin,
  saveSession,
  type AuthSession,
} from '@/lib/mock-auth'

interface AuthContextValue {
  user: AuthSession['user'] | null
  isAuthenticated: boolean
  /** Throws with a user-readable message when the demo credentials are wrong. */
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession['user'] | null>(() => loadSession()?.user ?? null)

  const login = useCallback(async (email: string, password: string) => {
    const session = await mockLogin(email, password)
    saveSession(session)
    setUser(session.user)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const can = useCallback(
    (permission: Permission) => (user ? hasPermission(user.permissions, permission) : false),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout, can }),
    [user, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
