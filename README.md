# Ledgerline ERP — Operations Console

Phase 1 + Phase 2 only, built from the ERP Master Prompt: a runnable
React + Vite foundation and a reusable enterprise application shell.
No ERP business modules (sales, inventory, purchasing, finance, people,
reports) are implemented yet — they render honest placeholder pages
inside the shell until their own phases.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck (tsc -b) + production build
npm run preview  # serve the production build
npm run lint
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
  app/          router.tsx, theme-provider.tsx
  components/
    ui/         button, card, badge, input, avatar, separator, skeleton
    layout/     app-shell, sidebar, header, page-header, theme-toggle
  config/       navigation.ts — single source of truth for modules
  pages/        dashboard, settings, module placeholder, not found
  lib/          utils (cn)
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
