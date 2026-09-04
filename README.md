# Juniper Dashboard

Demo dashboard for the Juniper visual identity: a warm-neutral, forest-toned
design system rendered through a React stack with no Tailwind.

## Stack

| Concern | Library |
| --- | --- |
| Build | Vite + `@vitejs/plugin-react` |
| Routing | TanStack Router (file-based via `@tanstack/router-plugin`) |
| Server state | TanStack Query |
| Tables | TanStack Table v9 (`useTable` + `tableFeatures`) |
| Charts | visx primitives + d3 (scales/format helpers) |
| Components | shadcn-style: Radix + CVA variants + CSS modules |
| Theme | `src/styles/juniper-theme.css` — oklch leaf tokens, light/dark via `light-dark()` |

## Commands

```bash
npm run dev        # start dev server (also generates src/routeTree.gen.ts)
npm run build      # vite build, then typecheck
npm run typecheck  # tsc -b
```

## How the pieces interconnect

- **Router ⇄ Query** — the `QueryClient` is injected into router context
  (`src/main.tsx`); route loaders call `queryClient.ensureQueryData(...)` on the
  `queryOptions` defined in `src/lib/api.ts`, and components read the same
  options with `useSuspenseQuery`. React Query owns the cache; the router only
  decides *when* data is needed (`defaultPreload: 'intent'` prefetches on
  hover).
- **Query → Table** — feed query results directly into Table v9's `useTable`
  (no duplicated state); features like sorting are registered up front with
  `tableFeatures`, never as v8-style table options.
- **Query → Chart** — visx primitives should take colors only from the theme's
  `--chart-series-*` / `--chart-axis` / `--chart-grid` role tokens, applied via
  CSS classes (SVG presentation attributes can't hold `var()`), so charts
  re-theme live with light/dark.
- **Theme → everything** — components consume leaf tokens (`--action`,
  `--nav-*`, `--badge-*`, …) inside their CSS modules. Route code never touches
  a token; variants re-point leaves instead of re-deriving colors.

## shadcn without Tailwind

The shadcn CLI requires Tailwind, so this project adopts the shadcn
*architecture* instead: owned components in `src/components/ui/`, Radix
primitives (`@radix-ui/react-slot` for `asChild`), `class-variance-authority`
variants, and a `cn()` helper (`src/lib/cn.ts`) — with CSS modules as the
styling layer. To add a primitive, port the shadcn component's structure and
swap its Tailwind classes for a co-located `*.module.css` consuming Juniper
leaf tokens.

Components are intentionally not scaffolded yet — `src/components/` is a clean
slate; the routes render placeholders until real components are added.

## Theming rules (short version)

- `data-theme="juniper"` ships on `<html>`; a pre-paint script in `index.html`
  applies the stored light/dark preference before stylesheets load.
- Light/dark is an axis (`light-dark()` per token), not a separate theme — the
  toggle just steers `color-scheme`.
- Consume semantic leaf tokens only; never the raw `--color-miso-*` /
  `--color-spruce-*` palette scales, and never seeds (`--seed-*`).
- Full token contract and derivation rules: `src/styles/juniper-theme.css`.
