# Self-review — Phase 1 + 2, updated for Phase 3 + 4

Phase 1 + 2 review below; the Phase 3 + 4 addendum is at the end of this file.

**Verdict: Approve with comments** — no critical/high findings remain.
Reviewed: all 23 source files written for Phase 1 + 2 (configs, tokens,
UI primitives, layout, pages, router). Skipped: `package-lock.json`,
`node_modules`, `dist`.

## Confirmed findings — fixed before delivery

1. **Buttons had no visible keyboard focus** (`src/components/ui/button.tsx`, confirmed
   by the browser tab walk)
   The first audit (senior-frontend checker at 1280 px) reported
   `visibleFocus: false` for the Collapse sidebar, Notifications and Theme
   buttons: the button base had `focus-visible:outline-none` with no
   replacement ring. Fix: added the shadcn-standard
   `focus-visible:ring-2 ring-ring ring-offset-2`. Re-audit: every tab stop
   now shows a visible focus indicator.

2. **`baseUrl` rejected by TypeScript 7** (`tsconfig.app.json`, confirmed by `npm run build`)
   TS 7 removed `baseUrl`. Fix: removed it; `paths` resolves relative to the
   tsconfig, and the build passes.

3. **Theme initializer could not return a resolved theme**
   (`src/app/theme-provider.tsx`, confirmed by `tsc`)
   The lazy `useState` initializer branched over the preference type, so
   `"system"` leaked into `ResolvedTheme`. Fix: resolve the stored
   preference through one expression (`system → systemTheme()`).

4. **Vite 8 warning for `__dirname`** (`vite.config.ts`)
   Fix: `path.resolve(import.meta.dirname, './src')`.

## Checked — no findings

- No `<div onClick>` / clickable non-interactive elements (the drawer
  backdrop is a real `<button>`); audit reported zero such issues.
- Status is never a raw colour class: table statuses use `Badge` variants;
  layout uses `gap-*`, never `space-*`; equal dimensions use `size-*`.
- Every icon-only button has an `aria-label`; the search input has a real
  `<label htmlFor>`; the activity table uses `<th scope="col">` + `<caption class="sr-only">`.
- Search submit feedback goes to an `aria-live` region, not the console.
- No secrets, no network calls, no storage beyond the two documented
  `localStorage` preference keys (theme, sidebar collapsed), both guarded
  with try/catch.

## Verification evidence

- `npm run build` — clean (`tsc -b` + Vite, 2,151 modules).
- `npm run lint` (oxlint) — 0 errors, 3 warnings: the standard shadcn
  pattern of exporting `*Variants` / `useTheme` beside components trips
  `react(only-export-components)` (fast-refresh only; accepted).
- Browser audit at 375 px and 1280 px: 0 px horizontal overflow, zero
  audit issues, zero page errors, screenshots inspected for dashboard
  (light + dark), settings, inventory placeholder and 404.
- Exercised by hand in the browser: Settings → Dark radio applies the
  `dark` class and persists; sidebar collapse goes 256 px → 72 px.

## Known limitations / follow-ups deliberately left out

- Google Fonts (`@import` in `index.css`) could not be fetched from this
  build sandbox (`ERR_TUNNEL_CONNECTION_FAILED`), so audit screenshots
  render with the fallback font stack. On a normal network the Archivo /
  Fira Sans / Fira Code faces load; nothing in the layout depends on them.
- One 374 kB JS chunk (117 kB gzip): React + router + the whole shell.
  Route-level code-splitting is a Phase 3 concern, when real modules land.
- Global search and notifications are shell demonstrations with honest
  "not connected yet" feedback — their backends belong to later phases.


---

# Addendum — Phase 3 + 4 (2026-11-18)

**Verdict: Approve** — tests, build and browser audit all pass; no
critical/high findings remain.

## What Phase 3 built — auth, protected routing, RBAC

- Mock authentication ONLY (per Henry's instruction — demo accounts, no
  real auth): `src/lib/mock-auth.ts` holds 4 demo accounts (admin,
  operations-manager, accountant, viewer), one shared demo password shown
  on the login screen, simulated 500 ms latency, and a fake readable
  token. `loadSession()` re-validates the stored session against the
  account list and its current role permissions — a forged token in
  `localStorage` returns null. Session key: `ledgerline-session`.
- `src/app/auth-provider.tsx`: `AuthProvider` + `useAuth()` exposing
  `user`, `isAuthenticated`, `login`, `logout`, `can(permission)`.
- `src/app/route-guards.tsx`: `RequireAuth` (signed-out → `/login`,
  carrying the intended path in location state so login returns there)
  and `RequirePermission` (signed-in but lacking the permission → a real
  403 page naming the missing permission, the signed-in user, and the
  fix — never a blank screen or silent redirect).
- RBAC in `src/config/permissions.ts`: permissions are
  `<module>:<action>` strings; roles are bundles of permissions. UI and
  guards only ask `can(permission)` — never "is admin?". Viewer =
  `dashboard:view` only; accountant has finance but not purchasing;
  operations-manager can approve purchasing but not manage settings;
  admin holds all 11 permissions.
- Permission-aware navigation: every `NavItem` in
  `src/config/navigation.ts` now carries its `permission`;
  `visibleNavGroups(can)` filters items and drops empty groups. The
  router guards every module route with the SAME permission as its nav
  item, so hiding a menu is never the only protection — direct URLs are
  guarded too. Sidebar and header show the real signed-in user, role,
  and a working Sign out.
- Login page (`src/pages/login-page.tsx`): petrol brand panel, pending
  and error (`role="alert"`) states, empty-field validation, show/hide
  password, and one-click demo-account fill (the reviewer still presses
  Sign in, so pending/error states stay visible).
- Settings page now shows the signed-in account, its role badge and its
  full permission list.

## What Phase 4 built — executive dashboard on mock APIs

- `src/lib/mock-data.ts`: deterministic seeded dataset (mulberry32).
  Same (range, branch) → same numbers, in the app and in tests. Internally
  consistent: KPI revenue equals the sum of the daily series; deltas
  compare against the previous period of the same length; branch factors
  make HCM/Hanoi/Da Nang true subsets of "All branches". Mock "today" is
  fixed at 18 Nov 2026 so demos and tests are stable.
- `src/lib/mock-api.ts`: `fetchDashboard(query, {latencyMs,
  simulateError})` — async with latency, like a real HTTP client, so
  loading/error handling is genuinely exercised.
- `src/hooks/use-dashboard-data.ts`: keeps previous data visible on
  refetch, drops stale responses when filters change quickly, surfaces
  failures as a renderable error message.
- Dashboard page: filters live in the URL (`?range=7|30|90&branch=`)
  so views are shareable and Back works; 4 KPI cards with sparklines and
  previous-period deltas; hand-built SVG charts with accessible data
  alternatives (Revenue trend + table in `<details>`, Orders-by-status
  donut, weekly Cash-flow bars); low-stock list; top-products table;
  Refresh, working Export CSV, a demo "Simulate API error" toggle with
  an error panel + retry, loading skeletons, and permission-aware
  actions ("New sales order" only for roles holding `sales:create`).

## Verification evidence (Phase 3 + 4)

- `npm test` (Vitest) — **22/22 passed** in 3 files:
  `permissions.test.ts` (7: role bundles + permission-aware nav),
  `mock-services.test.ts` (10: login success/wrong password/unknown
  email, session round-trip, forged-token rejection, dashboard
  determinism, series length, branch subset, KPI = series sum,
  simulateError), `route-guards.test.tsx` (5: RequireAuth redirect,
  403 page, permitted render, viewer/manager sidebar visibility).
- `npm run build` — clean (`tsc -b` + Vite, 2,164 modules;
  JS 403.86 kB / 126.12 kB gzip).
- `npm run lint` (oxlint) — **0 errors, 5 warnings**: the 3 accepted
  Phase 1+2 fast-refresh warnings plus the same accepted pattern in
  `auth-provider.tsx` (`useAuth`) and `cash-flow-bars.tsx`
  (`bucketByWeek` helper). Accepted for the same reason as before.
- Browser audit (headless Chromium, production build, 1280 px):
  signed-out `/` → `/login`; admin demo login → dashboard with all 8
  nav items; **0 px horizontal overflow**; range filter updates the URL
  to `?range=7`; Sign out → `/login`; viewer login → no Sales link in
  nav; direct `/finance` as viewer → 403 page. Only console errors were
  the known sandbox Google Fonts tunnel failures (see Phase 1+2 notes).
- Re-audit on delivery (375 px + 1280 px, 64 scripted checks, all
  passing) caught one real bug the 1280-only audit had missed: at
  375 px the dashboard overflowed by 60 px because the `PageHeader`
  actions row was `shrink-0` — its three buttons sized the row to
  max-content (419 px) instead of wrapping. Fixed in
  `page-header.tsx` (actions row is now `max-w-full flex-wrap`, no
  `shrink-0`); re-audit shows 0 px overflow at both widths, plus
  wrong-password alert, branch filter, simulate-error recovery,
  viewer 403, deep-link return to `/settings`, and Settings showing
  the admin permission list.

## Known limitations (Phase 3 + 4)

- Authentication is a front-end demo only. Passwords sit in
  `mock-auth.ts` on purpose so a reviewer can sign in; a production
  build must verify credentials server-side and issue signed, expiring
  tokens. Do not reuse this pattern with real credentials.
- All other modules (Sales … Reports) remain honest placeholders —
  now behind their RBAC guards. Route-level code-splitting is still
  deferred; the single JS chunk grew to ~404 kB with the dashboard.
