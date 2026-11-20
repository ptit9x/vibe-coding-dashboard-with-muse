import { Check } from 'lucide-react'

import { useAuth } from '@/app/auth-provider'
import { useTheme, type ThemePreference } from '@/app/theme-provider'
import { PageHeader } from '@/components/layout/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/config/permissions'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; hint: string }> = [
  { value: 'light', label: 'Light', hint: 'Always use the light theme.' },
  { value: 'dark', label: 'Dark', hint: 'Always use the dark theme.' },
  { value: 'system', label: 'System', hint: 'Follow the operating system setting.' },
]

/**
 * Settings: Account (Phase 3 — the signed-in demo user, role and
 * permissions) and Appearance (Phase 2 — theme switching, wired to the
 * same ThemeProvider as the header toggle) are real. Company profile,
 * user management and numbering are not built yet.
 */
export function SettingsPage() {
  const { preference, resolved, setPreference } = useTheme()
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Company profile, users and roles, numbering and preferences. Account and Appearance below are active; the rest arrives with its module."
        badge="Account + Appearance active"
      />

      {user && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Signed in with a mock demo account (Phase 3). Your role decides which modules
              appear in navigation and which routes open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{user.name}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Role</dt>
                <dd><Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge></dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-muted-foreground">Permissions</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="font-mono font-normal">
                      {permission}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Current theme is {preference}
            {preference === 'system' ? ` (showing ${resolved})` : ''}. Your choice is saved on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset>
            <legend className="pb-3 text-sm font-medium">Theme</legend>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Theme">
              {THEME_OPTIONS.map((option) => {
                const selected = preference === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPreference(option.value)}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors duration-200',
                      selected
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'hover:bg-accent/60',
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.hint}</span>
                    </span>
                    {selected && <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  )
}
