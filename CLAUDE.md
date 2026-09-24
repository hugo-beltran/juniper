# Juniper — working rules

Juniper is a design-system **contract**, not a code package. The contract is
the set of normative reference docs in `docs/` plus the component registry
generated from `src/` at build time. Both are published at
<https://hugo-beltran.github.io/juniper/llms.txt>. When this file and the
docs disagree, the docs win; fix this file.

## Before changing or adding a component

1. Read `docs/component-architecture.md` and `docs/theming.md`. They are
   normative: MUST/SHOULD/MAY carry their RFC 2119 meaning.
2. Follow the house stack: react-aria-components primitives, CVA variants,
   a colocated `*.module.css`, a per-feature directory under
   `src/components/`, no `ui/` layer. Private descendants colocate and are
   promoted only when a second, unrelated component needs them.
3. Style with raw `--juni-*` palette steps in the component's CSS module.
   No hex, rgb, hsl or bare oklch literals; derive tweaks with
   `oklch(from var(--juni-…) …)`. Font sizes are type-scale tokens only
   (`--text-2xs` … `--text-xl`, `--display-sm`, `--display-lg`, `--display-xl`; see
   `docs/theming.md` §4.2.1), never a raw rem or px. Route code never
   touches a token.
4. Interactive controls carry volume: the extruded recipe from
   `--lift-highlight` / `--lift-shade`, inset when pressed
   (`docs/theming.md` §4.6). The primary button keeps its glass pane.
   Static surfaces stay flat. Compare alternatives at `/lab/lift`. Hover,
   focus and the focus ring (`--ring`) answer in bloom; selection answers
   in needle (§4.4, §4.7). Never draw a green focus ring.
5. Every component exported from `src/components/index.ts` MUST carry a
   `registry.json` sidecar (title, description, category, anatomy, usage,
   docs). Directories not in the barrel are private and need none. The
   schema and an example are in `docs/registry-schema.md`.
6. When a change alters a convention, update the governing doc in `docs/`
   in the same change. The docs describe what the code does, so they must
   move together.

## Routes and view state

- Shareable view state (filters, sort) lives in the route's search params,
  validated and sanitized by a zod schema in `validateSearch`
  (`docs/component-architecture.md` §6.3). Components stay controlled and
  receive a callback; they never import or call the router.

## What the build enforces

`npm run build` runs the registry generator (`scripts/registry/`). It fails
the build, and therefore the deploy, when:

- a barrel export has no `registry.json` or the sidecar lacks a required field;
- a component CSS module contains a color literal outside the palette, or a
  `font-size` that is not a type-scale token;
- a component references a `--juni-*` step the theme does not define;
- a source file imports an npm package missing from `package.json`
  dependencies;
- a doc in `docs/` lacks a `# Title` heading or a `> summary` blockquote.

Run `npm run build` before opening a PR. `npm run typecheck` covers the
generator too.

## Published paths are a contract

`llms.txt`, `docs/<slug>.md`, `registry/index.json`,
`registry/components/<name>.json`, `registry/lib/<name>.json`,
`registry/theme.json` and `registry/schema/*.schema.json` under the site base
are consumed by agents outside this repo. Do not rename or move them; add
new paths beside them and bump `schemaVersion` only for breaking shape
changes.

## Repo conventions in brief

- Routes import components through the barrel; inside a component family,
  imports stay relative.
- Local working notes go in `.notes/` (gitignored), never in `docs/`.
