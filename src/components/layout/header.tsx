import { Bell, ChevronRight, LogOut, Menu, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/app/auth-provider'
import { ROLE_LABELS } from '@/config/permissions'
import { findNavItem } from '@/config/navigation'

interface HeaderProps {
  onOpenMobileNav: () => void
}

const NOTIFICATIONS = [
  { id: 1, text: '3 purchase orders are waiting for approval', time: '10 min ago' },
  { id: 2, text: 'Stock for SKU-1042 fell below its reorder point', time: '42 min ago' },
  { id: 3, text: 'October payroll inputs close on Friday', time: '2 hrs ago' },
]

export function Header({ onOpenMobileNav }: HeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const current = findNavItem(location.pathname)
  const [searchMessage, setSearchMessage] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const query = String(data.get('global-search') ?? '').trim()
    setSearchMessage(
      query
        ? `Search for “${query}” is not connected yet — global search arrives with its module in a later phase.`
        : 'Type something to search across modules.',
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu data-icon aria-hidden="true" />
        </Button>

        {/* Breadcrumb — derived from the route, never hand-written per page. */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm md:flex">
          <Link to="/" className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span aria-current="page" className="truncate font-medium">
            {current?.label ?? 'Not found'}
          </span>
        </nav>

        <form role="search" onSubmit={onSearch} className="mx-auto w-full max-w-md flex-1 px-2">
          <label htmlFor="global-search" className="sr-only">
            Search across modules
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="global-search"
              name="global-search"
              type="search"
              placeholder="Search orders, items, people…"
              className="pl-9"
              autoComplete="off"
            />
          </div>
        </form>

        <div className="relative ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications, ${NOTIFICATIONS.length} unread`}
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((value) => !value)}
          >
            <Bell data-icon aria-hidden="true" />
          </Button>
          <Badge
            variant="warning"
            aria-hidden="true"
            className="pointer-events-none absolute top-1 left-6 px-1.5"
          >
            {NOTIFICATIONS.length}
          </Badge>

          {showNotifications && (
            <div className="absolute top-full right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border bg-popover text-popover-foreground shadow-md">
              <p className="border-b px-4 py-3 font-display text-sm font-semibold">Notifications</p>
              <ul className="flex flex-col">
                {NOTIFICATIONS.map((item) => (
                  <li key={item.id} className="flex flex-col gap-0.5 border-b px-4 py-3 last:border-b-0">
                    <span className="text-sm">{item.text}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ThemeToggle />

        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="size-9">
            <AvatarFallback>{user?.initials ?? '—'}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col xl:flex">
            <span className="truncate text-sm leading-tight font-medium">{user?.name ?? ''}</span>
            <span className="truncate text-xs leading-tight text-muted-foreground">
              {user ? ROLE_LABELS[user.role] : ''}
            </span>
          </span>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out" title="Sign out">
            <LogOut data-icon aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Search feedback is announced, not only logged (senior-frontend rule). */}
      <div aria-live="polite" className="sr-only">
        {searchMessage}
      </div>
      {searchMessage && (
        <p className="border-t px-4 py-2 text-sm text-muted-foreground sm:px-6 lg:px-8">{searchMessage}</p>
      )}
    </header>
  )
}
