import { Building2, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROLE_LABELS } from '@/config/permissions'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/mock-auth'

/**
 * Sign-in (Phase 3, mock demo accounts only — no real authentication).
 * States: idle, pending (button disabled + "Signing in…"), error (role="alert"
 * with the reason and the fix), and field-level empty validation.
 */
export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter both your email and password.')
      return
    }
    setPending(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — the petrol rail colour, reused as the sign-in identity. */}
      <section className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base leading-tight font-semibold text-white">Ledgerline ERP</span>
            <span className="text-xs text-sidebar-foreground/70">Operations console</span>
          </span>
        </span>
        <div className="flex max-w-md flex-col gap-3">
          <h1 className="font-display text-3xl font-semibold text-balance text-white">
            Sales, stock, purchasing and cash — one operating picture.
          </h1>
          <p className="text-sidebar-foreground/80">
            Sign in with a demo account to see how roles change what the console shows:
            an administrator sees every module, a viewer sees only the dashboard.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/60">
          Demo build — authentication is mocked locally. Do not use real passwords here.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use one of the demo accounts below. Every account uses the password{' '}
              <span className="font-mono text-sm">{DEMO_PASSWORD}</span>.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm font-medium">Email</label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@ledgerline.vn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? true : undefined}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  disabled={pending}
                  className="pr-11"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-0 right-0"
                >
                  {showPassword ? <EyeOff data-icon aria-hidden="true" /> : <Eye data-icon aria-hidden="true" />}
                </Button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Demo accounts</p>
            <ul className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(DEMO_PASSWORD)
                      setError('')
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2 text-left transition-colors duration-200 hover:bg-accent"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{account.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{account.email}</span>
                    </span>
                    <Badge variant="secondary">{ROLE_LABELS[account.role]}</Badge>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Selecting an account fills the form — you still press Sign in, so the pending and
              error states stay visible for review.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
