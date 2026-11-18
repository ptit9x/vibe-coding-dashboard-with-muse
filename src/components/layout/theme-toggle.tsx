import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useTheme, type ThemePreference } from '@/app/theme-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

/** Theme switching: Light / Dark / System, persisted by ThemeProvider. */
export function ThemeToggle() {
  const { preference, resolved, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open ])

  const TriggerIcon = resolved === 'dark' ? Moon : Sun

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Theme: ${preference}. Change theme`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <TriggerIcon data-icon aria-hidden="true" />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 z-50 mt-2 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={preference === option.value}
              onClick={() => {
                setPreference(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                preference === option.value && 'font-medium',
              )}
            >
              <option.icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1 text-left">{option.label}</span>
              {preference === option.value && <Check aria-hidden="true" className="size-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
