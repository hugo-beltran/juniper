# Light/dark axis

> Light and dark are one axis inside the Juniper theme, resolved per token with `light-dark()` under `color-scheme: light dark`, never a second theme. This document defines the mechanism, the naming consequences and the pre-paint rule.

This document is normative. MUST, MUST NOT, SHOULD and MAY carry their
RFC 2119 meaning.

## 1. The mechanism

1.1. The theme declares `color-scheme: light dark` on `:root` and on
`:root[data-theme="juniper"]`. Every value that differs between modes is
written once as `light-dark(<light>, <dark>)`. The browser picks the branch
from the element's resolved `color-scheme`.

1.2. Palette steps (`--juni-bark-50` through `--juni-lichen-950`) are
mode-invariant. They are the vocabulary; `light-dark()` chooses which word
to use in each mode.

1.3. Shared semantic tokens that change with the mode are defined in the
theme file, for example:

```css
--body: light-dark(var(--juni-bark-200), var(--juni-needle-900));
```

1.4. A component whose light and dark steps differ MUST write the
`light-dark()` call inline in its CSS module, choosing two palette steps. A
component MUST NOT introduce a `.dark` class, a `[data-mode]` selector or a
`prefers-color-scheme` media query of its own.

## 2. Steering the mode

2.1. The default follows the operating system through `color-scheme: light
dark`. A stored preference overrides it by setting `color-scheme` on the
document element to `light` or `dark`.

2.2. The preference is stored in `localStorage` under `juniper-color-mode`
with the values `light` or `dark`. Any other value means "follow the
system".

2.3. **Never an un-themed frame.** `index.html` MUST run a synchronous inline
script in `<head>`, before any stylesheet or bundle, that reads the stored
preference and applies it to `document.documentElement.style.colorScheme`.
This prevents a flash of the wrong mode and lets pre-hydration DOM snapshots
capture a themed state.

2.4. `<html>` MUST ship `data-theme="juniper"` so the default theme's tokens
apply on the very first paint.

## 3. Naming consequences

3.1. Because mode is an axis and not a theme, token and class names MUST NOT
carry luminance or hue words: no `-on-dark`, `-on-white`, `-light-bg`. Names
describe role; values move with the mode.

3.2. Dark mode composes, it does not fork. There is exactly one set of
component styles. If a component needs a structural change in dark mode,
that is a design question to raise, not a second stylesheet to write.

## 4. Derived values in dark mode

4.1. Relative color syntax works inside `light-dark()`. The theme's link
tokens are the canonical example:

```css
--link-color: light-dark(
  var(--juni-needle-600),
  oklch(from var(--juni-needle-400) l 0.165 h)
);
```

4.2. When a derivation is needed, derive from the palette step chosen for
that mode; do not derive dark from light by arithmetic on lightness alone,
which tends to grey out chroma.

## 5. Verifying both modes

5.1. Every component change MUST be checked in both modes before merge. In
the browser, toggle `document.documentElement.style.colorScheme` between
`light` and `dark` in the console, or emulate `prefers-color-scheme` in
devtools. Both are equivalent to what the app's toggle does.

5.2. Text on tinted surfaces MUST keep at least 4.5:1 contrast in both
modes; UI boundaries at least 3:1.
