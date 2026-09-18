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
| Components | shadcn-style: react-aria-components + CVA variants + CSS modules |
| Theme | `src/styles/juniper-theme.css` — oklch `--juni-*` palette scales (needle is the brand ramp), light/dark via `light-dark()` |

## The contract

Juniper is a design-system contract, not a code package. The normative
reference docs live in [`docs/`](docs/) and are published, together with a
machine-readable component registry generated from `src/`, on every deploy:

- <https://hugo-beltran.github.io/juniper/llms.txt> — crawl entry point for
  LLM agents and humans; links every doc and registry entry.
- <https://hugo-beltran.github.io/juniper/registry/index.json> — the registry
  index; per-component entries inline their source files and list their
  `--juni-*` dependencies.

The generator (`scripts/registry/`) runs inside `vite build` and fails the
build when a barrel export lacks a `registry.json` sidecar or a component
stylesheet uses a color outside the palette. `CLAUDE.md` states the rules
contributors and agents follow; `docs/registry-schema.md` describes the
schema and how to register a component.

## Commands

```bash
npm run dev        # start dev server (also generates src/routeTree.gen.ts)
npm run build      # vite build, typecheck, copy the SPA 404 fallback
npm run typecheck  # tsc -b
npm run preview    # serve the production build at /juniper/
```

## Deployment (GitHub Pages)

Pushing to `main` builds and publishes `dist/` to
<https://hugo-beltran.github.io/juniper/> via
`.github/workflows/deploy.yml` (one-time setup: repo Settings → Pages →
Source → "GitHub Actions"). The moving parts:

- `vite.config.ts` sets `base: "/juniper/"` for builds and `vite preview`;
  dev stays at `/`.
- The router mirrors it via `basepath: import.meta.env.BASE_URL`
  (`src/main.tsx`), so route matching and generated hrefs agree.
- Pages has no server rewrites, so the build copies `index.html` to
  `404.html` — deep links land on the 404 page, which boots the same SPA
  and the router resolves the path.
- `public/.nojekyll` keeps Pages from running the output through Jekyll.

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
- **Query → Chart** — visx primitives take colors only from the theme's
  `--juni-*` palette vars, applied via CSS classes (SVG presentation
  attributes can't hold `var()`), so charts re-theme live with light/dark.
- **Theme → everything** — components reference the `--juni-*` palette scales
  directly inside their CSS modules (house convention: no semantic contract
  layer). The few shared semantic tokens (`--body`, `--ring`, `--link`,
  `--nav-outline`) live in `juniper-theme.css` and exist only where more than
  one consumer needs the same resolved value. Route code never touches a
  token.

## shadcn without Tailwind

The shadcn CLI requires Tailwind, so this project adopts the shadcn
*architecture* instead: owned components in per-feature directories under
`src/components/` (no `ui/` layer — a component's private descendants colocate
with it and are promoted only when a second, unrelated component needs them),
react-aria-components primitives (`@radix-ui/react-slot` only for `asChild`),
`class-variance-authority` variants, and a `cn()` helper (`src/lib/cn.ts`) —
with CSS modules as the styling layer. To add a primitive, port the shadcn
component's structure and swap its Tailwind classes for a co-located
`*.module.css` consuming the `--juni-*` palette.

Routes import components through the barrel (`src/components/index.ts`);
inside a component family, imports stay relative so the family remains
movable.

## Theming rules (short version)

- `data-theme="juniper"` ships on `<html>`; a pre-paint script in `index.html`
  applies the stored light/dark preference before stylesheets load.
- Light/dark is an axis (`light-dark()` per token), not a separate theme — the
  toggle just steers `color-scheme`.
- Reference the raw `--juni-*` palette scales directly in component CSS. Scale
  steps are mode-invariant, so use `light-dark()` inline where light and dark
  need different steps.
- Ramps are named for juniper anatomy and carry one function each:
  `--juni-needle-*` the brand (foliage green, hue ~130), `--juni-bloom-*`
  its complementary (the berries' waxy teal coating, ~211), `--juni-berry-*`
  the accent (ripe violet, ~292), `--juni-heartwood-*` outliers and
  attention catchers (red wood, ~28; the identity's only red,
  destructive/error), and `--juni-bark-*` muted surfaces and plain content
  (warm gray). `--juni-lichen-*` (green-gray) is a secondary neutral. Every
  exploration is archived in-app at `/lab/palette`, one tab per family,
  under its exploration-era name (grove/reef/orchid/nectarine).
- Palette scales and the remaining semantic tokens:
  `src/styles/juniper-theme.css`.
