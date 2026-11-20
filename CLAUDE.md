# CLAUDE.md — Ledgerline ERP (Operations Console)

Guidance for any AI coding agent working in this repository. This file was
written from a scan of the actual tree on 2026-11-18, and updated the same day for the Phase 3 + 4 build. If the code and this
file disagree, the code wins — and update this file in the same change.

## What this project is

A runnable React + Vite foundation and reusable enterprise application
shell for "Ledgerline ERP", an operations console for a mid-size
trading/distribution company. Built from an ERP Master Prompt, in phases.

**Current scope: Phase 1 + Phase 2 + Phase 3 + Phase 4.**

- Phase 1: project foundation, routing, folder structure.
- Phase 2: design system (tokens, UI primitives) and the AppShell
  (sidebar, header, theme switching).
- Phase 3: mock-demo authentication, protected routing, RBAC and
  permission-aware navigation (see "Auth and RBAC" below).
- Phase 4: functional executive dashboard on realistic mock APIs —
  KPI cards, URL-driven filters, charts (see "Dashboard and mock API").

**What does NOT exist yet — do not assume it does:**

- No backend and no real API. Authentication and dashboard data are
  **mocked locally on purpose** (demo accounts in `src/lib/mock-auth.ts`,
  seeded data in `src/lib/mock-data.ts`). There are no network requests
  except the Google Fonts import.
- No real business modules. Sales, Inventory, Purchasing, Finance,
  People and Reports render an honest placeholder page inside the
  shell — now behind their RBAC route guards.
- Header search and the notifications panel are still shell
  demonstrations with "not connected yet" feedback, not working
  features.

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b (typecheck) + vite build — must pass before delivery
npm run lint      # oxlint
npm test          # vitest run — 22 tests (RBAC, mock auth/API, guards)
npm run preview   # serve the production build
```

Expected lint state: 0 errors, 5 warnings. The warnings are the accepted
shadcn pattern of exporting `*Variants` helpers / hooks / a helper
function beside components (`button.tsx`, `badge.tsx`,
`theme-provider.tsx`, `auth-provider.tsx`, `cash-flow-bars.tsx`), which
trips `react/only-export-components` (fast-refresh only). Do not "fix"
them by restructuring the UI primitives.

## Stack

- Vite 8, React 19, React DOM 19, TypeScript (project references:
  `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`)
- React Router DOM 7 (`createBrowserRouter`)
- Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config` file;
  the theme lives in CSS (see Design system)
- shadcn/ui project setup (`components.json`, style `new-york`, base
  colour `neutral`, CSS variables on, icon library Lucide)
- `class-variance-authority` + `clsx` + `tailwind-merge` for variants
  and the `cn()` helper; `lucide-react` for all icons (never emoji icons)
- Linting: oxlint (`.oxlintrc.json`, plugins react/typescript/oxc;
  `react/rules-of-hooks` is an error)

## Architecture

Entry flow:

```
index.html            inline theme script runs before first paint
src/main.tsx          StrictMode → <App />
src/App.tsx           <ThemeProvider> → <AuthProvider> →
                      <RouterProvider router={router} />
src/app/router.tsx    /login public; shell route behind <RequireAuth>,
                      one child route per module, each behind
                      <RequirePermission> with its nav permission
src/components/layout/app-shell.tsx
                      skip link → sidebar / mobile drawer → header →
                      <main id="main-content"> <Outlet /> </main> → footer
```

Pages render into the shell's `<Outlet />`. A page never re-implements
chrome (sidebar, header, breadcrumbs) — extend the shell instead.

### Directory map

```
src/
  app/          router.tsx, theme-provider.tsx, auth-provider.tsx,
                route-guards.tsx, route-guards.test.tsx
  components/
    ui/         button, card, badge, input, avatar, separator, skeleton
    layout/     app-shell, sidebar, header, page-header, theme-toggle
    dashboard/  kpi-card, revenue-chart, orders-donut, cash-flow-bars
  config/       navigation.ts — single source of truth for modules
                permissions.ts, permissions.test.ts — RBAC model
  hooks/        use-dashboard-data.ts
  pages/        dashboard-page, login-page, settings-page,
                module-placeholder-page, not-found-page
  lib/          utils.ts (cn), format.ts, mock-auth.ts, mock-api.ts,
                mock-data.ts, mock-services.test.ts
  test/         setup.ts — Vitest + jest-dom setup (vitest.config.ts)
docs/           DESIGN.md (design rationale), REVIEW.md (self-review,
                Phase 1+2 plus the Phase 3+4 addendum)
.claude/skills/ project skills — see "Project skills" below
```

### Routing

`src/config/navigation.ts` is the single source of truth: `NAV_GROUPS`
(grouped: Overview / Operations / Back office / System), `ALL_NAV_ITEMS`,
and `findNavItem(pathname)`. The sidebar, mobile drawer, header
breadcrumb and the router all derive from it.

| Route         | Page                    | Guard permission   | State                             |
| ------------- | ----------------------- | ------------------ | --------------------------------- |
| `/login`      | `LoginPage`             | — (only public route) | Real, mock demo accounts       |
| `/`           | `DashboardPage`         | `dashboard:view`   | Real, functional on mock API      |
| `/sales`      | `ModulePlaceholderPage` | `sales:view`       | Not built — empty state + skeletons |
| `/inventory`  | `ModulePlaceholderPage` | `inventory:view`   | Not built                         |
| `/purchasing` | `ModulePlaceholderPage` | `purchasing:view`  | Not built                         |
| `/finance`    | `ModulePlaceholderPage` | `finance:view`     | Not built                         |
| `/people`     | `ModulePlaceholderPage` | `people:view`      | Not built                         |
| `/reports`    | `ModulePlaceholderPage` | `reports:view`     | Not built                         |
| `/settings`   | `SettingsPage`          | `settings:manage`  | Real (account, Appearance/theme)  |
| `*`           | `NotFoundPage`          | — (inside shell)   | Real error state with a way back  |

In `router.tsx`, module placeholder routes are generated from
`ALL_NAV_ITEMS` (excluding `/` and `/settings`), each wrapped in
`RequirePermission` with the item's own permission. To add a module:

1. Add the item (with its `permission`) to `navigation.ts` — sidebar,
   drawer, breadcrumb and a guarded placeholder route pick it up
   automatically.
2. Replace its placeholder route in `router.tsx` with the real page,
   keeping the `RequirePermission` wrapper.
3. Build the page from `components/ui/*` + `PageHeader`. Do not add new
   colours or a second button style — extend tokens/components instead.

## Auth and RBAC (Phase 3)

- `src/config/permissions.ts` is the RBAC model: permissions are
  `<module>:<action>` strings (`dashboard:view`, `sales:create`,
  `purchasing:approve`, `settings:manage`, …); roles (`admin`,
  `operations-manager`, `accountant`, `viewer`) are bundles of them in
  `ROLE_PERMISSIONS`. Code only ever asks `can(permission)` /
  `hasPermission(...)` — never "is this role X?". A new role is data.
- `src/lib/mock-auth.ts` is **demo-only mock authentication**: 4 demo
  accounts, one shared demo password (shown on the login screen),
  500 ms simulated latency, fake readable token. `loadSession()`
  re-validates a stored session against the account list and the
  account's current role permissions — forged tokens return null.
  Never reuse this pattern with real credentials; production auth must
  verify server-side and issue signed, expiring tokens.
- `src/app/auth-provider.tsx`: `useAuth()` → `user`, `isAuthenticated`,
  `login`, `logout`, `can`. Session persists in `localStorage` under
  `ledgerline-session` (third key — see "Theme and persisted state").
- `src/app/route-guards.tsx`: `RequireAuth` redirects signed-out
  visitors to `/login` with the intended path in location state (login
  returns them there). `RequirePermission` renders a real 403 page
  naming the missing permission — not a blank screen or silent
  redirect.
- Navigation is permission-aware: `visibleNavGroups(can)` in
  `navigation.ts` filters nav items by permission and drops empty
  groups. Hiding a menu is never the only protection — the router
  guards the same permission on the route itself.
- Demo accounts: `admin@` / `manager@` / `accountant@` / `viewer@`
  at `ledgerline.vn`; the password is the `DEMO_PASSWORD` constant in
  `mock-auth.ts`, also printed on the login screen. Settings shows the
  signed-in user's role and full permission list.

## Dashboard and mock API (Phase 4)

- `src/lib/mock-data.ts`: deterministic seeded data (mulberry32,
  mock "today" fixed at 2026-11-18). Same `(range, branch)` → same
  numbers in app and tests; KPI revenue equals the sum of the daily
  series; deltas compare with the previous period of the same length.
- `src/lib/mock-api.ts`: `fetchDashboard(query, { latencyMs,
  simulateError })` mimics a real HTTP client (async, latency,
  failures). `src/hooks/use-dashboard-data.ts` keeps previous data on
  refetch, drops stale responses, and surfaces errors as messages.
- Dashboard filters live in the URL: `?range=7|30|90&branch=all|hcm|
  hanoi|danang`. Keep new dashboard state in search params the same
  way. Actions are permission-aware (e.g. "New sales order" requires
  `sales:create`); Export CSV and Refresh are real.
- Charts are hand-built SVG in `components/dashboard/` with accessible
  alternatives (data table, text summaries) — do not swap in a chart
  library without preserving those.

## Design system

Full rationale is in `docs/DESIGN.md` — read it before any visual change.
The short version:

- Tokens live in `src/index.css`: light variables on `:root`, dark on
  `.dark`, mapped into Tailwind through `@theme inline`. Semantic token
  names only (`bg-card`, `text-muted-foreground`, `border-border`, …) —
  never raw hex or raw colour classes for status in components.
- Primary is **deep petrol `#0B5B52`** (dark theme: `#3BA99C`). It was
  deliberately chosen over the generic blue + orange SaaS default.
  Amber (`--warning`, `#B45309`) is for warning/status **only**, never a
  CTA colour. Do not reintroduce blue/orange defaults.
- Type: Archivo (display/headings, `font-display`), Fira Sans (UI/body,
  `font-sans`), Fira Code (`font-mono`) **only** for real reference codes
  (SO-2041, SKU-1042) — not for headings or labels. Figures use tabular
  numerals (`.tnum`).
- Fonts load via a Google Fonts `@import` in `index.css`; layout must
  not depend on them being available.
- Radius scale is anchored at `--radius: 0.5rem`. No global `*`
  transitions. Colour transitions stay in the 150–300 ms range.
- KPI presentation is one divided "ledger strip", not a grid of
  identical floating cards — structure is information.
- Status is shown with `Badge` variants, and colour is never the only
  signal.

### UI primitives (`src/components/ui/`)

shadcn-style, built on `cn()` (`src/lib/utils.ts`) and cva variants:

- `Button` — includes the fixed focus ring
  (`focus-visible:ring-2 ring-ring ring-offset-2`); keep it.
- `Card` — use the full composition (Header/Title/Description/Content/
  Footer), not a bare styled `div`.
- `Badge` for status, `Input`, `Avatar`, `Separator`, `Skeleton` for
  loading states.
- Layout uses `gap-*`, never `space-*`; equal dimensions use `size-*`.

## Theme and persisted state

- `src/app/theme-provider.tsx`: preference `light | dark | system`,
  resolved theme applied as the `.dark` class + `colorScheme` on
  `<html>`, follows `prefers-color-scheme` in system mode.
- The inline script in `index.html` applies the saved theme before first
  paint to avoid a flash — if you change the storage key or logic,
  change both places together.
- Exactly three `localStorage` keys exist, all read/written inside
  try/catch (storage may be unavailable):
  - `ledgerline-theme` (theme provider + `index.html` script)
  - `ledgerline-sidebar-collapsed` (`app-shell.tsx`, `'1'` / `'0'`)
  - `ledgerline-session` (mock auth session, `src/lib/mock-auth.ts`;
    re-validated on load — see "Auth and RBAC")
- There is no other storage. The only "secret" in the app is the
  shared demo password in `mock-auth.ts`, which is public by design
  (printed on the login screen) and must never become a real one.

## Shell behaviour

- Sidebar: 256 px expanded, collapses to a 72 px icon rail (state
  persisted, see above), deep petrol in both themes.
- Below `lg`, the sidebar becomes a drawer: backdrop button or `Esc`
  closes it; it renders `SidebarContent` with an `onNavigate` close.
- Header: breadcrumb derived from the current route via `findNavItem`,
  a labelled global search form whose submit feedback goes to an
  `aria-live` region, a notifications panel, `ThemeToggle`, the real
  signed-in user/role block, and a working Sign out button. The
  sidebar footer carries the same identity + Sign out, and the
  sidebar/drawer render only the nav items the user's permissions
  allow (`visibleNavGroups`).
- `PageHeader` is the one `<h1>` per page, with optional description,
  badge and actions row.

## Conventions

- TypeScript is strict in effect: `noUnusedLocals`,
  `noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `verbatimModuleSyntax` (use `import type` for type-only imports),
  `erasableSyntaxOnly`. TS 7 removed `baseUrl` — do not re-add it;
  `paths` resolves relative to the tsconfig.
- Path alias `@/` → `./src/` is mirrored in `vite.config.ts` and
  `tsconfig.app.json`. Keep both in sync; use `@/` imports inside `src`.
- Pages and layout components use named exports; `App` and page-level
  entry in `main.tsx` follow the existing pattern. Follow the export
  style of the file you are editing.
- Every screen names its state — sample, empty, loading, error or live.
  Placeholder pages stay honest: a disabled action explains why it is
  disabled (`aria-describedby` note in `ModulePlaceholderPage`).
- Accessibility is part of the house style, not a later pass: icon-only
  buttons have `aria-label`, the search input has a real
  `<label htmlFor>`, tables use `<th scope="col">` and an `sr-only`
  `<caption>`, clickable non-interactive elements are forbidden (the
  drawer backdrop is a real `<button>`), `:focus-visible` stays visible,
  and `prefers-reduced-motion` is honoured in `index.css`.

## Project skills

`.claude/skills/` holds five project-local skills that governed the
Phase 1 + 2 build and should govern matching work here:
`ui-ux-pro-max`, `frontend-design`, `senior-frontend`, `shadcn`,
`code-reviewer`. Use them for design-system, frontend and review work
in this repo. Do not modify or delete them unless explicitly asked.

## Docs map

- `README.md` — run instructions, what each phase built, how to add a
  module.
- `docs/DESIGN.md` — the design plan and why the generic generator
  defaults (blue primary, orange CTA, mono headings, card grid) were
  revised. Binding for visual work.
- `docs/REVIEW.md` — the self-review: Phase 1 + 2 findings and the
  Phase 3 + 4 addendum (tests, build, browser audit evidence, mock-auth
  limitations). Check it before re-auditing something it already covered.

## Verification before saying "done"

1. `npm run build` passes (this includes the typecheck).
2. `npm test` passes — 22 tests (do not delete a failing test to get
   green; fix the code or the test's premise).
3. `npm run lint` shows 0 errors (the 5 accepted warnings above are OK).
4. Check the changed screens in a browser at a small width (~375 px)
   and desktop (~1280 px): no horizontal overflow, no page errors,
   visible keyboard focus, light and dark themes both sane. For auth
   changes, also verify: signed-out redirect to `/login`, login return
   to the intended page, a low-permission role's 403 on a direct URL,
   and that role's filtered navigation.

Known limitations recorded in `docs/REVIEW.md`: one ~404 kB JS chunk
(route-level code-splitting is deferred until real modules land),
audit screenshots from sandboxes without Google Fonts access render
with fallback fonts, and authentication is a front-end demo only.
