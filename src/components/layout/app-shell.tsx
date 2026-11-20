import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from '@/components/layout/header'
import { SidebarContent } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COLLAPSE_KEY = 'ledgerline-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Reusable application shell (Phase 2):
 * skip link → sidebar (expanded / icon rail / mobile drawer) → header → <main>.
 * Pages render into <Outlet /> and never re-implement chrome.
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      // Non-fatal.
    }
  }, [collapsed])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <div className="flex min-h-screen w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop rail */}
      <aside
        aria-label="Sidebar"
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border lg:block',
          collapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 h-full w-full cursor-pointer bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-lg"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 z-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              <X data-icon aria-hidden="true" />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="border-t px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          Ledgerline ERP — operations console. Dashboard runs on mock data; other modules arrive in their own phases.
        </footer>
      </div>
    </div>
  )
}
