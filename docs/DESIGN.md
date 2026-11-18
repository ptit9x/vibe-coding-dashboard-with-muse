# Design plan — Ledgerline ERP (Phase 2)

Written before the code, per the `frontend-design` skill: plan, review the
plan against the brief, revise what reads as a generic default, then build.

## Subject

An operations console for a mid-size trading/distribution company.
Audience: operations and back-office staff who live in the tool all day.
Primary job: move between modules fast and trust the numbers on screen.
Vernacular: the ledger — divided strips, tabular figures, reference codes
(SO-2041, SKU-1042), quiet surfaces, one strong rail to navigate by.

## Recommendation received (ui-ux-pro-max)

Running the skill's required generator:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "ERP enterprise dashboard operations admin" --design-system -p "ERP Dashboard"
```

returned: **Data-Dense Dashboard** style, Enterprise Gateway pattern,
primary `#3B82F6` / secondary `#60A5FA` / CTA `#F97316`, background `#F8FAFC`,
text `#1E293B`, typography **Fira Code (heading) + Fira Sans (body)**,
WCAG AA, anti-patterns: ornate design, no filtering.

## Review against the brief — what was revised and why

| Axis | Generator default | Revised choice | Why |
| --- | --- | --- | --- |
| Primary | Blue `#3B82F6` | Deep petrol `#0B5B52` | Blue + orange CTA is the generic SaaS answer any ERP prompt produces. Petrol is a ledger/ink colour specific to finance-and-stock work. |
| CTA | Orange `#F97316` | Primary petrol; amber `#B45309` kept for warning/status only | Orange CTAs everywhere read as marketing, not operations. Amber keeps its real meaning: pay attention. |
| Background | Slate `#F8FAFC` | Cool mist `#F4F6F5`, ink `#14201E` | Same lightness, tinted toward the primary so light and dark themes feel like one product. Not warm cream (a known generated-design tell). |
| Headings | Fira Code | Archivo | A monospace heading face makes every label look like code — a tell, and worse for scanning. Fira Sans stays for UI/body (humanist, technical); Fira Code is used only where mono is functional: reference codes. |
| Surfaces | KPI cards grid | One divided ledger strip for KPIs; one wide table + one narrow queue panel | A grid of identical floating cards is the SaaS-card-kit default. Divided strips encode "rows of a ledger" — structure as information. |

Kept from the recommendation: data-dense dashboard style, enterprise
integrity, Fira Sans body, WCAG AA contrast targets, Lucide SVG icons
(no emoji icons), 150–300 ms colour transitions, visible focus,
`prefers-reduced-motion`, responsive checks at 375 / 768 / 1024 / 1440 px.

## Tokens

- Colour: Mist `#F4F6F5` · Paper `#FFFFFF` · Petrol ink `#14201E` ·
  Deep petrol `#0B5B52` · Line `#D9E0DD` · Amber (warning only) `#B45309`.
  Dark theme is the same hue family deepened (`#0D1413` background,
  `#3BA99C` primary for contrast), not a separate palette.
- Type: Archivo 500–700 for display/headings · Fira Sans 300–700 for UI
  and body (line-height 1.55) · Fira Code for reference codes; tabular
  numerals via `font-variant-numeric` for figures.
- Layout: left-aligned throughout. Fixed petrol sidebar (256 px, or a
  72 px icon rail), sticky header, content fluid up to 1440 px.
  The sidebar is the one bold element; everything else stays quiet.
- Radius: one scale anchored at `--radius: 0.5rem`. No global `*` transitions.

## Principles

1. Structure is information: dividers and grouping show relationships
   before colour does.
2. Status has a vocabulary: Badge variants and amber only for warnings —
   colour is never decoration, and never the only signal.
3. Every screen names its state: sample, empty, loading, error or live.
4. The shell is the product for Phase 2: a new module should feel
   inevitable, not pasted in.
