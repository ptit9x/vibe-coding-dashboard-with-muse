import { Check } from 'lucide-react'

import { useTheme, type ThemePreference } from '@/app/theme-provider'
import { PageHeader } from '@/components/layout/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; hint: string }> = [
  { value: 'light', label: 'Light', hint: 'Always use the light theme.' },
  { value: 'dark', label: 'Dark', hint: 'Always use the dark theme.' },
  { value: 'system', label: 'System', hint: 'Follow the operating system setting.' },
]

/**
 * Settings is a placeholder module, except for Appearance:
 * theme switching is Phase 2 scope, so this control is real and wired
 * to the same ThemeProvider as the header toggle.
 */
export function SettingsPage() {
  const { preference, resolved, setPreference } = useTheme()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Company profile, users and roles, numbering and preferences. Only Appearance is active in Phase 2."
        badge="Appearance active"
      />

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
