# Theming rules

> How Juniper components consume color, shape, motion and focus: raw `--juni-*` palette steps inside component CSS modules, no semantic contract layer, no literals, and the checks the build enforces.

This document is normative. MUST, MUST NOT, SHOULD and MAY carry their
RFC 2119 meaning. It governs every stylesheet under `src/components/` and
any project that adopts the Juniper contract.

## 1. Where color comes from

1.1. The theme file (`src/styles/juniper-theme.css`, published as the
registry's `theme` entry) defines six oklch palette ramps and three accent
trios as `--juni-*` custom properties on `:root`. See
[Palette](./palette.md) for each ramp's role.

1.2. A component MUST reference `--juni-*` steps directly in its own CSS
module. There is deliberately no semantic token layer between components and
the palette: `background-color: var(--juni-bark-50)`, not
`var(--surface)`.

1.3. A shared semantic token (`--body`, `--ring`, `--link`, `--link-hover`,
`--nav-outline`) MAY be added to the theme file only when a second consumer
needs the same resolved value. Add it on the second consumer, never the first.
The first consumer references the palette step directly.

1.4. Component CSS MUST NOT contain color literals: no hex, `rgb()`,
`hsl()`, `hwb()`, `lab()`, `lch()`, `color()` or bare `oklch()` values.
Named color keywords (`white`, `black`) SHOULD be avoided for the same reason;
prefer the nearest palette step.

1.5. Alpha, lightness and chroma tweaks MUST derive from a palette step with
relative color syntax: `oklch(from var(--juni-needle-50) l c h / 0.15)`.
Keep the tweak small; if a derivation drifts far from its source step, the
palette is missing a step, and that is a theme change, not a component
change. Where two states meet on one element (selection and pointer, 4.7),
combine their two steps with `color-mix(in oklch, …)`; do not mix a palette
step with a literal, and do not mix more than two steps.

1.6. Route and page code MUST NOT reference tokens or palette steps. If a
view needs a themed surface, a component is missing. Callers pass intent
props (`variant`, `size`), never token names or class names. A route's title
and intro are the `page` parts (`PageHeader`, `PageTitle`,
`PageDescription`); a card's are Card's (`CardTitle`, `CardDescription`).
A muted paragraph styled from route CSS is the tell that one of these was
skipped.

## 2. Ramps carry one function each

2.1. `--juni-needle-*` is the brand: primary actions, links, selection,
success, headings.

2.2. `--juni-bloom-*` is the complementary teal: the pointer colour (hover,
keyboard focus, the focus ring), contrast accents and tinted shadows.

2.3. `--juni-berry-*` is the violet accent: categorical emphasis and chips.

2.4. `--juni-heartwood-*` is the identity's only red. Every destructive or
error state MUST use it, and nothing else MAY be red: a field's error text
(`heartwood-600`) and its invalid hairline (`heartwood-500`) come from here.
It is also the attention colour: a badge or indicator that says "something
needs acting on" (a count of leads awaiting analysis) wears heartwood, and
MUST render nothing when there is nothing to act on, so the red keeps its
meaning.

2.5. `--juni-bark-*` is the warm-gray neutral for surfaces, borders and plain
content. `--juni-lichen-*` is the green-gray secondary neutral for muted
fills and hover washes.

2.6. The accent trios (`--juni-aubergine*`, `--juni-sunflower*`) are for
categorical data and notices, not for chrome.

## 3. Light and dark

3.1. Light and dark are an axis inside the theme, not a second theme. A
component whose light and dark steps differ MUST express that inline with
`light-dark(var(--juni-a), var(--juni-b))`. See
[Light/dark axis](./light-dark.md).

3.2. Scale steps are mode-invariant: `--juni-bark-50` is the same color in
both modes. Only semantic tokens and inline `light-dark()` calls change with
the mode.

## 4. Shape, type, motion, focus

4.1. Radii come from the shared tokens `--radius-sm` (6px), `--radius-md`
(8px), `--radius-lg` (10px) and `--radius-xl` (14px). Component CSS MUST use
these tokens for corner radii; fully round pills MAY use `999px`.

4.2. The typeface is Geist with Geist Mono for code, set through
`--font-sans` and `--font-mono`. Components MUST inherit the font
(`font-family: inherit`) rather than restate it. Hierarchy is weight-driven;
there is no second display face.

4.2.1. **Type scale.** Every `font-size` MUST be one of the nine tokens
below or `inherit`. No free values: the scale was binned on 2026-09-17
from 21 values then in use, most of them within half a pixel of a
neighbour. Headings sit on it too (`h1` display-lg, `h2` display-sm, `h3`
text-xl, `h4`–`h6` text-base).

| Token | Size | Use |
| --- | --- | --- |
| `--text-2xs` | 10px | Badges, glyph runs (stage dots) |
| `--text-xs` | 11px | Field labels, hints, table headers |
| `--text-sm` | 12px | Summaries, tooltips, nav meta, inline code |
| `--text-md` | 13px | Controls, table cells, list items |
| `--text-base` | 14px | Default UI text, buttons, nav items |
| `--text-lg` | 16px | Document body, intros |
| `--text-xl` | 18px | Emphasized names, `h3` |
| `--display-sm` | 22px | Section headings, `h2` |
| `--display-lg` | 32px | Page titles, KPI metrics, `h1` |

Choose the nearest step; if a design wants a size between two steps, that
is a conversation about the scale, not a new value in a component.

4.3. Transitions MUST use the `--ease` token and SHOULD stay in the
100–200 ms range for state changes.

4.4. Focus is the native outline drawn by the global `:focus-visible` rule
with `--ring`. Components MUST NOT emulate focus rings with `box-shadow` and
MUST NOT remove the outline. **The ring is bloom** (`--ring` = `bloom-600`
on light surfaces, `--nav-outline` = `bloom-400` on the dark sidebar), not
the brand green: focus is a pointer state (4.7), and a focused control MUST
be distinguishable from a selected one at a glance. A component that has to
draw the outline on a proxy element, because its real input is visually
hidden (a switch track), MUST still use `--ring`. One exception: options
inside an open list (a Select's popover, a menu) draw no ring, because the
bloom row wash (4.7) already marks the focused row and a ring on top of it
is noise; the ring stays on the list's trigger.

4.4.1. **Scroll containers** are part of the surface they sit in, not chrome
laid over it. The page's one scroll container is the sidebar inset (the
document itself never scrolls); a control's popover is the other. Both
wear the same scrollbar: thin, a `bark-300` thumb on a transparent track,
`bark-400` on hover, flush with the container's edge (a scrolling list
carries the horizontal inset, its popover only the vertical one). Use
`scrollbar-color` and `scrollbar-width` with the `::-webkit-scrollbar`
rules as fallback. Sticky elements pin to the inset's top edge, so their
offsets are measured from it, never from the viewport.

4.5. Interactive states MUST key off react-aria data attributes
(`[data-hovered]`, `[data-pressed]`, `[data-selected]`, `[data-disabled]`),
not raw pseudo-classes, so hover styling stays correct across pointer types.

4.6. **Volume.** Interactive controls are tactile: they read as the surface
pushed out toward the viewer, and pressing pushes them back in. Static
surfaces (cards, tables, panels) stay flat and separate by border and tint,
never by shadow.

- Neutral controls (text fields, textareas, select triggers, switch tracks,
  secondary buttons) MUST use the **extruded** recipe: the control keeps the
  surface's own fill, a faint hairline
  (`oklch(from var(--juni-bark-200) l c h / 0.6)`), a highlight cast
  up-left and a shade cast down-right from the shared tokens:

  ```css
  box-shadow:
    -2px -2px 4px var(--lift-highlight),
    2px 2px 5px var(--lift-shade);
  ```

    Hover MAY push further out (larger offsets). Pressed or open MUST invert
  both shadows to `inset` so the control sinks; a text field counts as
  pressed while it holds focus, so typing reads as pressing into the
  surface. Smaller controls scale the offsets down (the switch track uses
  1px/2px), never the recipe. A control's own popover (a Select's list)
  wears the same recipe at the trigger's width, so the open pair reads as
  one body: a sunken cap over a raised list.
- The discrete button is the one neutral trigger with no volume at rest: it
  is inline text until touched. It MUST still take the surface fill and
  sink (inset) when pressed or open, so every control shares the press.
- The primary action keeps its own material: the chromatic **glass pane**
  (radial fill lit off-center, 1px translucent inner ring, bloom-tinted
  drop shadow with equal x/y offset, press flips the light and pulls the
  shadow inside). It is the one control that carries color, so it is the
  one that carries light.
- Shadow colors MUST derive from palette steps. `--lift-highlight` and
  `--lift-shade` take the primary button's own light: its needle-50 inner
  ring and its bloom-700 drop shadow, so every control is lit by the same
  lamp (the highlight lifts lightness and alpha to stay visible on
  bark-50). Do not introduce a third material. The chosen recipe and the
  five rejected alternatives are archived at `/lab/lift` in the demo app.

4.7. **Pointer colour.** Hover and keyboard focus on a neutral control
answer in `--juni-bloom-*`, the complementary (chromatic action buttons —
the primary button, a clear ×  — keep their own needle fill on hover: they
act rather than point): a bloom hairline on a trigger
or a text field (`bloom-400`), a bloom wash on a list row or a discrete
button (`bloom-100`, text `bloom-950`), a bloom track on a hovered switch
(`bloom-300`). Selection and the active
state stay in needle. The two states MUST NOT share a ramp, so "where you
are" never blurs with "what is chosen"; when both land on one element,
MIX the two washes rather than picking a third step:
`color-mix(in oklch, var(--juni-needle-100), var(--juni-bloom-100))`. The
focus ring is the same decision made visible: `--ring` is bloom (4.4).

## 5. SVG and charts

5.1. SVG presentation attributes cannot hold `var()`. Chart and icon colors
MUST be applied through CSS classes (`fill`, `stroke` in a module) or, when a
library only accepts a string, through a `style` attribute that lands a
`var(--juni-…)` value. Charts then re-theme live with light/dark.

## 6. Global utilities

6.1. `.sr-only` and `.sr-only-focusable` are global classes for visually
hidden content that stays in the accessibility tree. Use `.sr-only` for
icon-only labels and table captions; use `.sr-only-focusable` for anything
that can receive focus, such as a skip link. Never apply plain `.sr-only` to
a focusable element.

## Conformance

The registry generator runs inside `vite build` and fails the build when a
component breaks a rule below. A failed build blocks the deploy, so the
published registry can never contradict this document.

| Rule | Enforced by |
| --- | --- |
| 1.4 no color literals in component CSS (hex, rgb, hsl, hwb, lab, lch, color, bare oklch) | build |
| 1.5 `oklch(from …)` MUST derive from a `--juni-*` step | build |
| every `--juni-*` step a component references exists in the theme | build |
| every barrel export carries a `registry.json` sidecar | build |
| 4.2.1 every `font-size` in component CSS is a type-scale token or `inherit` | build |
| 1.4 named color keywords, 1.6 tokens in route code, 4.1–4.5 (4.2.1 in route CSS) | review |
| 4.6 volume: extruded recipe on neutral controls, inset when pressed, flat static surfaces | review |
| 4.7 pointer colour: hover/focus in bloom, selection in needle | review |
| color values in TypeScript (for example avatar palettes handed to a third-party renderer) | review |

Rules marked "review" are still normative; they are checked by the reviewer
because a reliable mechanical check does not exist yet.
