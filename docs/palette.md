# Palette

> The six `--juni-*` oklch ramps and three accent trios that make up the Juniper palette: their roles, the shared lightness ladder, the few semantic tokens, and where the canonical values live.

This document is normative for how the ramps are used. The values themselves
live in the theme file, published as the registry's
[`theme` entry](../registry/theme.json); when this page and the CSS
disagree, the CSS is the source of truth and this page has a bug.

## 1. Ramps

Ramps are named for juniper anatomy and each carries one function.

| Ramp | Hue (oklch) | Character | Role |
| --- | --- | --- | --- |
| `--juni-needle-*` | ~121 → 171, greener down-scale | Warm yellow-green foliage | **Brand.** Primary actions, links, selection, success, headings, the dark page canvas |
| `--juni-bloom-*` | ~221 → 206 | Cool teal, the waxy coating on the berries | **Complementary.** The pointer colour: hover, keyboard focus and the focus ring itself ([Theming rules](./theming.md) 4.4, 4.7); contrast accents, tinted shadows, dark selection |
| `--juni-berry-*` | ~283 → 289 | Cool violet, the ripe berry | **Accent.** Categorical emphasis, chips, badges |
| `--juni-heartwood-*` | ~74 → 9, gold tints to crimson depths | Warm apricot-to-crimson wood | **Attention.** Outliers, and the identity's *only* red: destructive and error states |
| `--juni-bark-*` | ~80 → 58, warmer down-scale | Warm gray | **Neutral.** Surfaces, borders, plain content, muted text |
| `--juni-lichen-*` | ~107 | Muted green-gray | **Secondary neutral.** Hover washes, muted fills, field surfaces |

1.1. Needle, bloom and berry form a loose triad (hues ~130, ~211, ~292).
Heartwood is the sole warm accent. A component MUST NOT introduce another
red, orange or yellow for status; use heartwood.

1.2. Bark is the default neutral. Lichen is used where a neutral needs to
read as part of the green identity rather than as gray, typically hover
washes on brand-tinted surfaces.

## 2. The lightness ladder

Every ramp has eleven steps on a shared lightness ladder so steps are
interchangeable across ramps at the same number:

| Step | L (approx.) | Typical use |
| --- | --- | --- |
| 50 | 96% | Lightest surface, text on deep fills |
| 100 | 90% | Tinted surface, hover wash |
| 200 | 83% | Selected chip, page canvas (bark) |
| 300 | 79% | Border, secondary hover |
| 400 | 73% | Bright fill, dark-mode link |
| 500 | 65% | Base fill |
| 600 | 56% | Primary fill, light-mode link, headings |
| 700 | 46–50% | Deep fill, emphasized text |
| 800 | 44% | Body text (bark), deep surface |
| 900 | 38% | Dark canvas (needle), deep text |
| 950 | 25–26% | Darkest ink |

2.1. Chroma follows each ramp's own profile and peaks near the 400–500
steps; neutrals keep chroma under 0.02. Do not expect equal chroma across
ramps at the same step.

2.2. A component SHOULD pair text and fill from the same ramp at least six
steps apart (for example `needle-950` on `needle-200`) or use bark-50 on a
600-or-deeper fill. Check contrast rather than assuming the ladder
guarantees it.

## 3. Accent trios

Three-stop trios (`-subtle`, base, `-bold`) for categorical data and notices,
not for chrome:

- `--juni-aubergine-subtle`, `--juni-aubergine`, `--juni-aubergine-bold`:
  deep violet for a second categorical series.
- `--juni-sunflower-subtle`, `--juni-sunflower`, `--juni-sunflower-bold`:
  warm yellow for notices and a bright categorical series.

3.1. Categorical pairs MUST be verified for contrast and distinguishability
before first real use in a chart.

## 4. Shared semantic tokens

The theme defines a small set of semantic tokens where more than one
consumer needs the same resolved value:

| Token | Value | Consumers |
| --- | --- | --- |
| `--body` | `light-dark(bark-200, needle-900)` | Document background |
| `--ring` | `bloom-600` | Global `:focus-visible` outline — bloom by decision, so focus never reads as selection |
| `--link`, `--link-hover` | needle-derived, per mode | Anchor styles |
| `--nav-outline` | `bloom-400` | Focus outline on the sidebar's dark surface |
| `--lift-highlight`, `--lift-shade` | needle-50 lightened at 90% / bloom-700 at 20% — the primary button's ring and shadow colors | The extruded volume recipe on neutral controls ([Theming rules](./theming.md) 4.6) |
| `--radius-sm/md/lg/xl` | 6 / 8 / 10 / 14 px | Corner radii |
| `--ease` | `ease-in-out` | Transition timing |
| `--font-sans`, `--font-mono` | Geist, Geist Mono | Typography |
| `--text-2xs` … `--text-xl`, `--display-sm`, `--display-lg`, `--display-xl` | 10 / 11 / 12 / 13 / 14 / 16 / 18 px, 22 / 32 / 40 px | The type scale ([Theming rules](./theming.md) 4.2.1) |

4.1. A new semantic token MAY be added only when a second consumer needs the
same resolved value (see [Theming rules](./theming.md), 1.3). The token's
name MUST describe role, never value or luminance.

## 5. Lineage

The ramps were renamed on 2026-09-08 from their exploration-era names:
grove → needle, reef → bloom, orchid → berry, nectarine → heartwood,
driftwood → bark, olive → lichen. Each ramp's derivation notes are kept as
comments in the theme file, and every exploration is archived in the demo
app at `/lab/palette`, one tab per family, under its exploration-era name.
The volume exploration that chose the extruded recipe is archived at
`/lab/lift`.

Older material describing a `miso`/`spruce`/`momo`/`pear` palette or a
Tailwind `@theme` semantic contract predates this identity and is
superseded by these docs.

## 6. Machine-readable values

The registry's `theme` entry inlines the theme and global stylesheets, and
its `palette` array lists every `--juni-*` property the theme defines. Each
component entry's `palette` array lists the steps it depends on; a consumer
can check that a component's steps are a subset of the theme's. A W3C
design-token JSON export is planned as a sibling of the theme entry and will
be listed in `llms.txt` when it ships.
