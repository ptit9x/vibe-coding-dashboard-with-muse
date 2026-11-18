import { Building2, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NAV_GROUPS } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface SidebarContentProps {
  collapsed?: boolean
  onNavigate?: () => void
  onToggleCollapsed?: () => void
}

/**
 * The petrol rail — the shell's one bold element.
 * Used three ways: expanded desktop rail, collapsed icon rail, and inside the
 * mobile drawer. Navigation data comes only from config/navigation.ts.
 */
export function SidebarContent({ collapsed = false, onNavigate, onToggleCollapsed }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('flex items-center gap-3 px-4 pt-5 pb-4', collapsed && 'justify-center px-2')}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 aria-hidden="true" className="size-5" />
        </span>
        {!collapsed && (
          <span className="flex min-w-0 flex-col">
            <span className="font-display truncate text-base leading-tight font-semibold text-white">
              Ledgerline ERP
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70">Operations console</span>
          </span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {!collapsed && (
              <p className="px-2 pb-1 text-xs font-semibold tracking-wide text-sidebar-foreground/60">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-200',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white',
                      )
                    }
                  >
                    <item.icon aria-hidden="true" className="size-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className={cn('flex items-center gap-3 px-4 py-4', collapsed && 'flex-col px-2')}>
        <Avatar className="size-9">
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">RH</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-white">Richard Huynh</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Administrator</span>
          </span>
        )}
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white lg:inline-flex"
          >
            {collapsed ? (
              <ChevronsRight data-icon aria-hidden="true" />
            ) : (
              <ChevronsLeft data-icon aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
