# Component architecture

> How Juniper components are built and organized: react-aria-components primitives, CVA variants, colocated CSS modules, per-feature directories with a barrel, and the colocation and promotion rules that keep the library legible.

This document is normative. MUST, MUST NOT, SHOULD and MAY carry their
RFC 2119 meaning. It describes the shadcn *architecture* without Tailwind:
owned components, headless primitives, variants, a class combiner, and CSS
modules as the styling layer.

## 1. Stack

| Concern | Choice |
| --- | --- |
| Behavior and accessibility | `react-aria-components` |
| Variants | `class-variance-authority` (CVA) |
| Class combining | `cn()` from `src/lib/cn.ts` (clsx; no tailwind-merge because there are no utility conflicts) |
| Styling | CSS modules, one `*.module.css` per component file, consuming `--juni-*` steps |
| Slotting | `@radix-ui/react-slot` for `asChild` only |
| Icons | `@heroicons/react/24/outline` |
| Tables | `@tanstack/react-table` v9 (`useTable` + `tableFeatures`) |
| Charts | visx primitives with d3 helpers |
| Search-param validation | `zod` schemas passed to the route's `validateSearch` |

1.1. New components MUST use react-aria-components as the primitive source
where a primitive exists. Radix MUST NOT be added beyond `react-slot`.

1.2. New dependencies SHOULD be avoided. A component that needs one MUST add
it to `package.json` dependencies; the registry build fails on imports it
cannot resolve there.

## 2. Directory layout

```
src/components/
  index.ts                      barrel: export * from './<name>/<name>'
  button/
    button.tsx
    button.module.css
    registry.json               contract sidecar (see registry-schema.md)
  summary-card/
    summary-card.tsx
    summary-card.module.css
    sparkline.tsx               private descendant
    sparkline.module.css
    registry.json
src/lib/                        shared helpers (cn, blobatar-palette)
src/styles/                     theme + global base
src/routes/                     TanStack Router file routes
```

2.1. Each component lives in its own kebab-case directory named after the
component. The main file is `<name>.tsx` with `<name>.module.css` beside it.
There is no `ui/` layer and no `components/shared/`.

2.2. A private descendant (a sub-part only this component uses, such as
`sparkline.tsx`, `listbox.tsx`, `squircle.tsx`, `use-click-outside.ts`)
MUST colocate in its parent's directory. It is not exported from the barrel.

2.3. **Promotion rule.** A private descendant is promoted to its own
directory only when a second, *unrelated* component needs it. Promotion
means: move the files, add a barrel export, add a `registry.json`, and
switch the original parent to import through `@/components/<name>/<name>`.
Do not promote speculatively.

2.4. The barrel (`src/components/index.ts`) is the public surface and the
registry's registration list. Routes and features MUST import through it.
Inside a component family, imports MUST stay relative so the family remains
movable; a family importing the barrel creates a cycle.

2.5. Cross-family imports (one component using another) go through the
component's direct path, `@/components/button/button`, not the barrel.

## 3. Component shape

3.1. Export a named function component, not a default export. Types the
consumer needs (`ButtonProps`, `Lead`, `Tenant`) are exported beside it.

3.2. Wrap the react-aria primitive, omit its `className` from the props
type and re-add `className?: string` so callers can extend, never replace,
the module styles:

```tsx
export function Tooltip({ className, offset = 6, ...props }:
  Omit<TooltipProps, 'className'> & { className?: string }) {
  return <AriaTooltip offset={offset} className={cn(styles.content, className)} {...props} />
}
```

3.3. Callers pass **intent props** (`variant`, `size`, `isActive`), never
class names or token names. Variants are declared with CVA against module
classes and get `defaultVariants`:

```tsx
const buttonVariants = cva(styles.button, {
  variants: { variant: { primary: styles.primary, … }, size: { … } },
  defaultVariants: { variant: 'primary', size: 'medium' },
})
```

3.4. The root element of every component and of every named part MUST carry
`data-slot="<kebab-name>"`. Variant and size MUST be mirrored as
`data-variant` / `data-size`. These are the stable hooks for tests, parents
and consumer overrides.

3.5. Use react-aria semantics: `onPress` not `onClick`, `isDisabled` not
`disabled`, `isSelected`, `selectedKeys`. State styling in CSS MUST use the
data attributes react-aria sets (`[data-hovered]`, `[data-pressed]`,
`[data-selected]`, `[data-disabled]`).

3.6. Interactive controls carry the house volume: the extruded recipe from
`--lift-highlight` / `--lift-shade`, inset when pressed, per
[Theming rules](./theming.md) 4.6. Static parts stay flat.

3.7. `asChild` (Radix Slot) is the way to render a router `<Link>` in place
of a button-shaped element. When `asChild` is true the component renders
`<Slot>` with the shared props; otherwise it renders the react-aria
primitive so press and aria wiring connect.

## 4. Composition patterns

4.0. **The inset scrolls, not the page.** `SidebarInset` is the single
scroll container; the layout wrapper is viewport-height and clipped.
The inset reserves a left gutter (`--sidebar-inset-gutter`, 3rem) that
content never enters; `SidebarInsetHeader` is a zero-height sticky anchor
that floats the sidebar trigger in that gutter, so the toggle stays present
while the inset scrolls and shares the top row with sticky toolbars and
table headers, which pin to `top: 0` with no offset. Scroll position is
restored per route through the inset, and nothing reads `window.scrollY`.

4.1. **Compound components for owned layouts.** A component that owns a
layout (Sidebar) exposes named parts (`SidebarHeader`, `SidebarMenu`,
`SidebarMenuButton`) the consumer arranges as JSX, instead of one component
with a large prop API. The consumer owns arrangement; each part owns its
chrome.

4.2. **Inline over overlay.** Disclosure grows in place and pushes content
(the tenant switcher's panel) rather than floating a dialog, drawer or
free-floating menu, wherever the layout allows. When in-place expansion is
needed, use react-aria `Disclosure`/`DisclosurePanel`; for dismissable
selections, use `TagGroup`. Two overlays are sanctioned: tooltips, and
**anchored pickers** (the popover of a `Select` or `ComboBox`) that open
flush beneath their trigger at exactly the trigger's width
(`var(--trigger-width)`), on the same extruded material as the trigger
([Theming rules](./theming.md) 4.6), so the list reads as the control grown
downward rather than a panel floating over the page. Modals and dialogs
are not used.

4.3. **Native over emulated.** Prefer the native element or CSS feature:
`outline` for focus, `<table>` with `aria-sort` for sortable data, `inert`
for closed panels, a native checkbox or radio where a plain toggle will do.
The exception is the picker: use the house `Select` (react-aria `Select`,
labelled, with the anchored popover from 4.2) rather than a native
`<select>`, so the open list inherits the volume and the palette; the
native control's list cannot be themed.

4.4. **Consolidate near-duplicates.** Before writing a new themed clickable
surface, check whether Button (a variant) or an existing part already solves
it. A trigger that re-implements Button's concerns SHOULD render Button.

4.5. **Controlled or uncontrolled.** Stateful components (Sidebar,
TenantSwitcher) accept an optional controlled value plus change handler and
fall back to internal state.

## 5. Accessibility baseline

5.1. Icon-only controls MUST have a text label, visually hidden with the
global `sr-only` class or provided by `aria-label`.

5.2. The active navigation item is marked by the router's
`aria-current="page"`; components MUST key active styling off it (or off an
explicit `data-active`) rather than duplicating route state.

5.3. Disclosure triggers MUST set `aria-expanded` and `aria-controls`;
closing a panel from the keyboard MUST return focus to its trigger.

5.4. Decorative graphics (sparklines, avatars beside a name, indicator
pills) MUST be `aria-hidden`; the adjacent text carries the meaning.

## 6. Data and routing

6.1. Route loaders prefetch with `queryClient.ensureQueryData(queryOptions)`;
components read the same options with `useSuspenseQuery`. React Query owns
the cache; the router decides when data is needed.

6.2. Tables feed query results straight into `useTable`; features such as
sorting are registered up front with `tableFeatures`, never as v8-style
table options.

6.3. **View state lives in the URL, owned by the route.** Filter, sort and
other state that should survive a reload or travel in a link belongs in the
route's search params, not in component state. The route declares a zod
schema in `validateSearch`; that schema is the sanitizer — every field
optional, checked against the values that exist in the data, invalid values
falling back to unset with `.catch(undefined)` so a hand-edited or stale
link degrades to the default view rather than an error. Defaults are never
written to the URL. Components MUST NOT touch the router: they are
controlled, receiving the state and a change callback (`filters` /
`onFiltersChange`), and MAY fall back to internal state when no props are
passed. Filter tweaks navigate with `replace: true` so they do not pile up
history entries.

## 7. Adding a component

1. Create `src/components/<name>/` with `<name>.tsx` and `<name>.module.css`.
2. Build on the react-aria primitive; declare variants with CVA; style with
   `--juni-*` steps per [Theming rules](./theming.md), giving interactive
   parts the extruded volume (4.6).
3. Add `data-slot` hooks and intent props.
4. Write `registry.json` (title, description, category, anatomy, usage,
   docs) per [Registry schema](./registry-schema.md).
5. Export from `src/components/index.ts`.
6. Run `npm run build`; the registry generator validates the sidecar, the
   palette usage and the imports.
7. If the component changes a convention described in these docs, update the
   doc in the same change.

## 8. Porting a shadcn component

Port the shadcn component's *structure* (parts, props, data attributes) and
swap its Tailwind classes for a colocated CSS module consuming the palette.
Drop what the product does not need and say so in a leading comment (the
sidebar lists what it deliberately did not port). Replace Radix primitives
with their react-aria-components equivalents.
