# Ledgerline ERP — Operations Console

Phases 1–4, built from the ERP Master Prompt: a runnable React + Vite
foundation, a reusable enterprise application shell, mock-demo
authentication with protected routing and RBAC, and a functional
executive dashboard on realistic mock APIs.
No ERP business modules (sales, inventory, purchasing, finance, people,
reports) are implemented yet — they render honest placeholder pages
inside the shell, now behind their RBAC route guards, until their own
phases.

## Sign in (Phase 3 — demo accounts only)

Authentication is mocked locally; there is no server. Every demo
account uses the password shown on the login screen:

| Email | Role |
| --- | --- |
| `admin@ledgerline.vn` | Administrator — every module |
| `manager@ledgerline.vn` | Operations Manager — no Finance, no Settings |
| `accountant@ledgerline.vn` | Accountant — Dashboard, Sales, Finance, Reports |
| `viewer@ledgerline.vn` | Viewer — Dashboard only |

Pick an account on the login screen to fill the form, then press
Sign in. Roles change the navigation, the route guards (try opening
`/finance` as the viewer — a real 403 page) and dashboard actions.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck (tsc -b) + production build
npm run preview  # serve the production build
npm run lint
npm test         # Vitest — RBAC, mock auth/API, route guards
```

## What Phase 1 built — foundation

- Vite 8 + React 19 + TypeScript (strict, bundler resolution), `@/` path alias
  mirrored in `vite.config.ts` and `tsconfig.app.json`
- Tailwind CSS v4 via `@tailwindcss/vite`, shadcn/ui project config
  (`components.json`, semantic tokens, `cn()` in `src/lib/utils.ts`)
- React Router with one shell route and one child route per module
- Folder structure that later phases extend, not rearrange:

```
src/
  app/          router.tsx, theme-provider.tsx, auth-provider.tsx,
                route-guards.tsx (+ tests)
  components/
    ui/         button, card, badge, input, avatar, separator, skeleton
    layout/     app-shell, sidebar, header, page-header, theme-toggle
    dashboard/  kpi-card, revenue-chart, orders-donut, cash-flow-bars
  config/       navigation.ts — single source of truth for modules
                permissions.ts — RBAC roles/permissions (+ tests)
  hooks/        use-dashboard-data.ts
  pages/        dashboard, login, settings, module placeholder, not found
  lib/          utils (cn), format, mock-auth, mock-api, mock-data (+ tests)
  test/         setup.ts (Vitest + jest-dom)
```

## What Phase 2 built — design system + shell

- **Design tokens** in `src/index.css` (light + dark CSS variables, Tailwind
  `@theme inline` mapping). See `docs/DESIGN.md` for the plan and rationale.
- **Reusable UI primitives** in shadcn/ui style: variants via
  `class-variance-authority`, semantic colours only, `gap-*` layout,
  full Card composition, Badge for status, Skeleton for loading.
- **AppShell**: skip link, sidebar, header, `<main>`, footer.
  - Sidebar: grouped navigation from `config/navigation.ts`, active route
    state, collapsible to an icon rail (persisted), deep petrol in both themes.
  - Mobile: sidebar becomes a drawer (Esc / backdrop to close) under `lg`.
  - Header: route-derived breadcrumb, labelled global search form with
    announced feedback, notifications panel, theme toggle, user identity.
- **Theme switching**: Light / Dark / System in the header and in
  Settings → Appearance; persisted to `localStorage`, follows
  `prefers-color-scheme` in System mode, applied before first paint in
  `index.html` to avoid a flash.
- **States** (senior-frontend rule): dashboard sample data is labelled,
  module pages are real empty states, unknown routes get a real error
  state with a way back, skeletons demonstrate loading.

## Adding a module in a later phase

1. Add the item to `src/config/navigation.ts` (sidebar, drawer, breadcrumb
   and router pick it up automatically if it should start as a placeholder).
2. Replace its placeholder route in `src/app/router.tsx` with the real page.
3. Build the page from `components/ui/*` + `PageHeader`; do not add new
   colours or a second button — extend the tokens/components instead.

## Skills used

The project-local skills in `.claude/skills/` governed this build:
`ui-ux-pro-max` (design-system generation + pre-delivery checklist),
`frontend-design` (distinctive plan, revised generic defaults),
`senior-frontend` (states, semantics, verification), `shadcn`
(composition + styling rules) and `code-reviewer` (self-review pass
before delivery — see `docs/REVIEW.md`).

## What Phase 3 built — auth, protected routing, RBAC

- **Mock authentication** (`src/lib/mock-auth.ts`): demo accounts only,
  simulated latency, fake token, session persisted to `localStorage`
  (`ledgerline-session`) and re-validated on load — forged tokens are
  rejected. Demo only: never reuse this pattern with real credentials.
- **Protected routing** (`src/app/route-guards.tsx`): `/login` is the
  only public route; the shell sits behind `RequireAuth` (login returns
  you to the page you wanted), and every module route sits behind
  `RequirePermission` with the same permission as its nav item.
- **RBAC** (`src/config/permissions.ts`): `<module>:<action>`
  permissions bundled into roles; UI and guards only ask
  `can(permission)`. A signed-in user without a permission gets a real
  403 page naming what is missing.
- **Permission-aware navigation**: `visibleNavGroups(can)` in
  `navigation.ts` filters the sidebar/drawer and drops empty groups;
  sidebar/header show the signed-in user and role, with Sign out.

## What Phase 4 built — executive dashboard

- **Mock API** (`src/lib/mock-api.ts` + `mock-data.ts`): deterministic
  seeded data — same filters, same numbers, every load and in tests;
  KPI revenue equals the sum of the daily series; deltas compare with
  the previous period of the same length.
- **Filters in the URL**: `?range=7|30|90&branch=all|hcm|hanoi|danang`
  drive every figure; shareable and Back-friendly.
- **KPI cards** with sparklines and previous-period deltas; **charts**
  (revenue trend with an accessible data table, orders-by-status donut,
  weekly cash-flow bars); low-stock list; top-products table.
- **Real states**: loading skeletons, Refresh, working Export CSV, a
  demo "Simulate API error" toggle with an error panel + retry, and
  permission-aware actions ("New sales order" only with `sales:create`).
- **Tests**: `npm test` — 22 Vitest tests covering role bundles,
  permission-aware navigation, mock login/session validation, dashboard
  data consistency, route guards and sidebar visibility.
