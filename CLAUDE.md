# CLAUDE.md — Ledgerline ERP (Operations Console)

Guidance for any AI coding agent working in this repository. This file was
written from a scan of the actual tree on 2026-11-18. If the code and this
file disagree, the code wins — and update this file in the same change.

## What this project is

A runnable React + Vite foundation and reusable enterprise application
shell for "Ledgerline ERP", an operations console for a mid-size
trading/distribution company. Built from an ERP Master Prompt, in phases.

**Current scope: Phase 1 + Phase 2 only.**

- Phase 1: project foundation, routing, folder structure.
- Phase 2: design system (tokens, UI primitives) and the AppShell
  (sidebar, header, theme switching).

**What does NOT exist yet — do not assume it does:**

- No backend, no API calls, no network requests of any kind.
- No authentication, no login page, no route guards, no RBAC/permissions.
- No real business modules. Sales, Inventory, Purchasing, Finance, People
  and Reports render an honest placeholder page inside the shell.
- No test setup (no Vitest config, no test files) in this tree.
- Dashboard data is sample data and is labelled as such in the UI.
  Header search and the notifications panel are shell demonstrations
  with "not connected yet" feedback, not working features.

Phase 3 + 4 (mock-demo authentication, protected routing, RBAC,
permission-aware navigation, functional dashboard with mock APIs) were
requested separately but are **not in this tree** as of the scan date.
If you are asked to implement them, preserve the architecture and design
system below instead of restructuring.

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b (typecheck) + vite build — must pass before delivery
npm run lint      # oxlint
npm run preview   # serve the production build
```

There is no test command yet. Do not invent one in instructions or CI
until a test runner is actually added to `package.json`.

Expected lint state: 0 errors, 3 warnings. The warnings are the accepted
shadcn pattern of exporting `*Variants` helpers / `useTheme` beside
components, which trips `react/only-export-components` (fast-refresh
only). Do not "fix" them by restructuring the UI primitives.

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
src/App.tsx           <ThemeProvider> → <RouterProvider router={router} />
src/app/router.tsx    one shell route, one child route per module
src/components/layout/app-shell.tsx
                      skip link → sidebar / mobile drawer → header →
                      <main id="main-content"> <Outlet /> </main> → footer
```

Pages render into the shell's `<Outlet />`. A page never re-implements
chrome (sidebar, header, breadcrumbs) — extend the shell instead.

### Directory map

```
src/
  app/          router.tsx, theme-provider.tsx
  components/
    ui/         button, card, badge, input, avatar, separator, skeleton
    layout/     app-shell, sidebar, header, page-header, theme-toggle
  config/       navigation.ts — single source of truth for modules
  pages/        dashboard-page, settings-page,
                module-placeholder-page, not-found-page
  lib/          utils.ts — cn() only, for now
docs/           DESIGN.md (design rationale), REVIEW.md (Phase 1+2 review)
.claude/skills/ project skills — see "Project skills" below
```

### Routing

`src/config/navigation.ts` is the single source of truth: `NAV_GROUPS`
(grouped: Overview / Operations / Back office / System), `ALL_NAV_ITEMS`,
and `findNavItem(pathname)`. The sidebar, mobile drawer, header
breadcrumb and the router all derive from it.

| Route         | Page                    | State                                  |
| ------------- | ----------------------- | -------------------------------------- |
| `/`           | `DashboardPage`         | Real shell page, labelled sample data |
| `/sales`      | `ModulePlaceholderPage` | Not built — empty state + skeletons    |
| `/inventory`  | `ModulePlaceholderPage` | Not built                              |
| `/purchasing` | `ModulePlaceholderPage` | Not built                              |
| `/finance`    | `ModulePlaceholderPage` | Not built                              |
| `/people`     | `ModulePlaceholderPage` | Not built                              |
| `/reports`    | `ModulePlaceholderPage` | Not built                              |
| `/settings`   | `SettingsPage`          | Real (incl. Appearance / theme)        |
| `*`           | `NotFoundPage`          | Real error state with a way back       |

In `router.tsx`, module placeholder routes are generated from
`ALL_NAV_ITEMS` (excluding `/` and `/settings`). To add a module:

1. Add the item to `navigation.ts` — sidebar, drawer, breadcrumb and a
   placeholder route pick it up automatically.
2. Replace its placeholder route in `router.tsx` with the real page.
3. Build the page from `components/ui/*` + `PageHeader`. Do not add new
   colours or a second button style — extend tokens/components instead.

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
- Exactly two `localStorage` keys exist, both read/written inside
  try/catch (storage may be unavailable):
  - `ledgerline-theme` (theme provider + `index.html` script)
  - `ledgerline-sidebar-collapsed` (`app-shell.tsx`, `'1'` / `'0'`)
- There is no other storage and there are no secrets in this app.

## Shell behaviour

- Sidebar: 256 px expanded, collapses to a 72 px icon rail (state
  persisted, see above), deep petrol in both themes.
- Below `lg`, the sidebar becomes a drawer: backdrop button or `Esc`
  closes it; it renders `SidebarContent` with an `onNavigate` close.
- Header: breadcrumb derived from the current route via `findNavItem`,
  a labelled global search form whose submit feedback goes to an
  `aria-live` region, a notifications panel, `ThemeToggle`, and a static
  user identity block (no auth behind it yet).
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
- `docs/REVIEW.md` — the Phase 1 + 2 self-review: findings fixed,
  verification evidence, known limitations. Check it before re-auditing
  something it already covered.

## Verification before saying "done"

1. `npm run build` passes (this includes the typecheck).
2. `npm run lint` shows 0 errors (the 3 accepted warnings above are OK).
3. Check the changed screens in a browser at a small width (~375 px)
   and desktop (~1280 px): no horizontal overflow, no page errors,
   visible keyboard focus, light and dark themes both sane.

Known limitations recorded in `docs/REVIEW.md`: one ~374 kB JS chunk
(route-level code-splitting is deferred until real modules land), and
audit screenshots from sandboxes without Google Fonts access render
with fallback fonts.
