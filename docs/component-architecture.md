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
  field/                        shared label / description / error parts
  input/                        labelled TextField + Input
  textarea/                     labelled TextField + TextArea
  select/                       labelled Select with anchored popover
  listbox/                      ListBox, inline and popover variants
  switch/                       labelled Switch, extruded track
  filter-bar/                   sticky search / switch / select toolbar
  sidebar/                      the shell: Sidebar parts, Dock parts (dock.tsx)
  squircle/                     superellipse SVG tile: glass pane, shadow, rim; clips what is drawn on it
  avatar/                       a person on the squircle: photograph, initials, then a person icon
  tenant-switcher/              the brand at the head of the sidebar, an inline disclosure
  user-profile/                 the session at its foot, the same disclosure around the sidebar's rows
  users-table/                  demo composition: FilterBar + flat table
  background-noise/             background layer: film grain for a ground
  card/                         surface container with header, title, description, footer parts
  page/                         PageHeader, PageTitle, PageDescription: a route's title and intro
  image-overlay/                standalone background layer: fills its positioned container behind its siblings
  login-screen/                 demo composition: the sign-in card and its form
  summary-card/
    summary-card.tsx
    summary-card.module.css
    sparkline.tsx               private descendant
    sparkline.module.css
    registry.json
src/lib/                        shared helpers (cn, blobatar-palette, use-click-outside, use-exclusive-disclosure)
src/styles/                     theme + global base
src/routes/                     TanStack Router file routes
```

2.1. Each component lives in its own kebab-case directory named after the
component. The main file is `<name>.tsx` with `<name>.module.css` beside it.
There is no `ui/` layer and no `components/shared/`.

2.2. A private descendant (a sub-part only this component uses, such as
`sparkline.tsx`) MUST colocate in its parent's directory. It is not
exported from the barrel.

2.3. **Promotion rule.** A private descendant is promoted to its own
directory only when a second, *unrelated* component needs it. Promotion
means: move the files, add a barrel export, add a `registry.json`, and
switch the original parent to import through `@/components/<name>/<name>`.
Do not promote speculatively. Precedents: `select` and `switch` left
`leads-table` and `listbox` left `tenant-switcher` when the form primitives
needed them; `filter-bar` (né `leads-filters`) left `leads-table` when the
users table became its second consumer;
`field` (label, description, error) was promoted on its first day because
three unrelated primitives needed it at once, which meets the rule of three;
`squircle` left `tenant-switcher` on 2026-09-30 when `avatar` needed the
curve for a photograph and initials (the tile clips what is drawn on it;
the faces are the avatar's). A private *hook* is promoted to
`src/lib/` instead, where the registry publishes it as a `lib` entry:
`use-click-outside` went there the same day, shared by the switcher and
the profile.

2.3.1. **Shared chrome is composed, not copied.** Labelled controls (Input,
Textarea, Select) render the `field` parts for their label, description and
error and own only their stack and their box. A new labelled control MUST
compose `field` rather than restate its type and colour.

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
and consumer overrides. A CVA axis that is not a role is named for what it
is and mirrored under that name: `Card` picks what the surface is made of,
so its axis is `material`, mirrored as `data-material` (renamed from
`variant` on 2026-09-28); the theme's glass re-tune keys on it (3.9).

3.5. Use react-aria semantics: `onPress` not `onClick`, `isDisabled` not
`disabled`, `isSelected`, `selectedKeys`. State styling in CSS MUST use the
data attributes react-aria sets (`[data-hovered]`, `[data-pressed]`,
`[data-selected]`, `[data-disabled]`).

3.6. Interactive controls carry the house volume: the extruded recipe from
`--lift-highlight` / `--lift-shade`, inset when pressed, per
[Theming rules](./theming.md) 4.6. Static parts stay flat.

3.7. `asChild` (Radix Slot) is the way to render a router `<Link>` in place
of a button-shaped element (`Button`, `SidebarMenuButton`). When `asChild`
is true the component renders `<Slot>` with the shared props; otherwise it
renders the react-aria primitive so press and aria wiring connect. A slotted
element never receives react-aria's data attributes, so its module MAY style
hover and press with `:hover` / `:active` scoped to elements without the
`data-rac` marker (`.x:is([data-hovered], :not([data-rac]):hover)`), which
keeps 3.5 intact for the react-aria path.

3.8. **Sizes are one scale.** `Button`, `Input`, `Textarea` and `Select`
share the size names `mini` (1.75rem), `small` (2rem) and `medium` (2.5rem,
default), so a field and a button placed on one row at the same size name
align without consumer CSS.

3.9. **Context lives in CSS, not in React.** When a component must look or
behave differently because of where it sits (inside a glass card, on the
dark sidebar, in a narrow inset, while hovered by a pointer), the rule MUST
be expressed in CSS against the context's data attributes, custom
properties and container queries, never as a prop threaded down, a context
read, or a branch in the render. The virtual DOM stays one tree of the
same elements everywhere; the cascade does the specialising. The cost of
the alternative is real: a `variant` prop for every surface a control can
land on, providers for every ancestor that matters, and a render that
re-runs to change a shadow. Precedents: the theme re-tunes
`--lift-highlight` for every control inside a glass card through a
`:where([data-slot="card"][data-material="glass"])` rule, at zero
specificity, and no control knows it happened; `ListBox` styles its rows
through the root's `data-variant` so items take no prop; the sidebar
inset publishes `data-narrow` and consumers query it; hover for a slotted
link is `:not([data-rac]):hover`, not a wrapper; the `UserProfile` is one
tree in the column, the collapsed rail and the strip (the avatar row, the
avatar alone with the name as its rail tooltip, the avatar at the strip's
end with its panel beneath), all of it CSS against the sidebar's
`data-state` and the wrapper's `data-layout`; the sidebar footer, on the
gradient's dark end, inverts the copy of every row and trigger inside it
by re-declaring the `--menu-copy` properties the rows read with the
column's steps as fallback. Reach for React only when
CSS cannot know the fact (data, selection, a measurement), and then
publish the fact as a data attribute or custom property once (4.0) so the
rest stays CSS.

3.10. **Icons are rare.** An icon earns its place when it carries a
meaning the words beside it do not (a status glyph, a tool in a toolbar
with no room for words); it MUST NOT decorate a control whose label already
says what it does. A row of labelled buttons each wearing a glyph reads as
a gimmick, not a system. Where an action points somewhere, prefer the
typographic arrow inside the label (`→`, `←`, `›`) to an icon: it sets in
the text's own size, weight and colour, needs no sizing rule and no
`aria-hidden`. Decided 2026-09-28 on the login screen, whose single
sign-on button lost its key and whose panel switches became
`Use your credentials →` and `← Use single sign-on`; heroicons stays the
source for the icons that remain (1). Two places require an icon: the
collapsed rail, where a row is its icon alone, and the dock, where a cell
is its icon over a word (4.0.1).

## 4. Composition patterns

4.0. **The inset scrolls, not the page.** `SidebarInset` is the single
scroll container; the layout wrapper is viewport-height and clipped.
The inset reserves a left gutter (`--sidebar-inset-gutter`, 3rem) that
content never enters; `SidebarInsetHeader` is a zero-height sticky anchor
that floats the sidebar trigger in that gutter, so the toggle stays present
while the inset scrolls and shares the top row with sticky toolbars and
table headers, which pin to `top: 0` with no offset. Scroll position is
restored per route through the inset, and nothing reads `window.scrollY`.
The inset also measures its own width into a store that
`useSidebarInset(narrowBelow)` subscribes to with a selector, returning a
boolean that re-renders the caller only when it flips (the raw number is
`useSidebarInsetWidth()`; the house threshold is 44rem, mirrored as
`data-narrow`). The inset publishes the fact; each consumer owns its
policy as a named constant beside its content, defaulting to the house
value so the common case switches together. The signal is never
debounced: the observer already coalesces per frame, and a delay would
only hold content in the wrong layout mid-resize.

4.0.1. **One shell, two layouts.** Below `SIDEBAR_DOCK_BELOW` (40rem of
the wrapper's width, which in the shell is the viewport) the navigation
leaves the left column for a bottom dock. `SidebarProvider` measures the
wrapper the way the inset measures itself (a layout effect, then a
ResizeObserver, into a store read with a selector; never debounced) and
publishes the fact once: `layout: "sidebar" | "dock"` through
`useSidebar()`, mirrored as `data-layout` on the wrapper. The shell renders
`Sidebar`, or `SidebarStrip` (the band of ground above the inset, holding
the unchanged `TenantSwitcher` and `UserProfile`) and `Dock`, never both. The inset is
the same element in both layouts, so its scroll position, its width store
and `data-narrow` survive the swap; every difference in its chrome is CSS
against `data-layout` (3.9): the trigger's gutter resolves to 0,
`SidebarInsetHeader` renders nothing, and the inset floats with 0.5rem of
ground on every side so its corners stay visible above the dock and at the
screen's edge once the dock has scrolled away. The two signals are
separate facts: the shell decides where the nav goes from the space it has;
content decides its own layout from the inset's width, as in 4.0. Width
alone picks the layout: a narrow desktop window gets the dock, tablet
portrait keeps the sidebar. The dock is not a second navigation with its
own data. `NavItem.surfaces` tags where an item may appear (`sidebar` by
default, `dock`, or both; groups and their labels are sidebar-only); the
dock shows tagged items in tree order, four at most, and a fifth cell,
**More**, only when there is anything the row does not show, which
discloses the remaining items as the sidebar's own menu rows in a panel
that grows the dock upward (4.2); the session's exit is not among them, it
is in the `UserProfile` on the strip (4.9). A badge hidden behind More
moves to More. The active cell keys off `aria-current="page"` (5.2) and
answers in needle ([Theming rules](./theming.md) 4.7): the icon alone on a
needle-200 pill, the label on the ground, pure CSS on the cell. Decided at
`/lab/dock`, which stays as the archive: the strip (B′) on 2026-09-23 over a
row inside the inset, a dock slot and a home behind More; the needle pill on
2026-09-30, revising the connector tab picked on 2026-09-23, because a tab
that must meet the inset's edge has nowhere to go once More's panel sits
between the row and the inset. Two more facts the shell publishes for this
layout, both as CSS hooks. The strip is a permanent band on a phone's
screen, so the `TenantSwitcher` compacts itself on it through
`[data-layout="dock"]` rules in its own module (one row, tile and name and
plan inline, the chevron always shown because touch has no hover); the
switcher's tree is the same; the `UserProfile` keeps only its avatar at
the strip's end and its panel takes the row beneath, spanning the strip,
which is a two-column grid for that reason. And the dock scrolls away: the inset, the one
element that scrolls, publishes its scroll direction the way it publishes
its width, the wrapper mirrors it as `data-scroll`, and the dock's CSS
slides itself under the screen's edge on `down` and back on `up` or at the
top, giving the inset its row meanwhile. The inset reports `down` only once
the content exceeds it by more than a dock's height plus a turn
(`SCROLL_HIDE_MIN_OVERFLOW`), so a page that barely overflows keeps its
dock and the inset growing into the dock's room cannot flip the answer
back; the dock never hides while More is open or while one of its cells
holds focus.

4.1. **Compound components for owned layouts.** A component that owns a
layout (Sidebar) exposes named parts (`SidebarHeader`, `SidebarMenu`,
`SidebarMenuButton`) the consumer arranges as JSX, instead of one component
with a large prop API. The consumer owns arrangement; each part owns its
chrome. Card (`CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`)
and Page (`PageHeader`, `PageTitle`, `PageDescription`) follow the same
shape: the route arranges the parts and never restates their type or
colour. `CardTitle` and `PageTitle` are react-aria `Heading`s whose `level`
picks the element, so a card that is the page's main content can carry
the h1.

4.2. **Inline over overlay.** Disclosure grows in place and pushes content
(the tenant switcher's panel; the dock's More panel, which grows the dock
upward and pushes the inset up; the user profile's panel, which grows
upward from the footer into the content's room, or beneath the strip)
rather than floating a dialog, drawer or free-floating menu, wherever the
layout allows. The shell's disclosures are exclusive: opening one closes
the others, so two panels never push the inset at once. A pointer does it
through `useClickOutside` (pressing one trigger is a press outside the
other); `useExclusiveDisclosure` (`src/lib`) covers the keyboard, with an
opening disclosure announcing itself on the document and every other open
one closing, no shared state and no provider. When in-place expansion is
needed, use react-aria `Disclosure`/`DisclosurePanel` (the filter bar's
narrow layout folds its selects and sort control into a `DisclosurePanel`
beneath the toolbar row, pushing the rows down); for dismissable
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
The exception is the picker: use the house `Select`
(`src/components/select`, react-aria `Select`, labelled, with the anchored
popover from 4.2) rather than a native `<select>`, so the open list inherits
the volume and the palette; the native control's list cannot be themed. Text
entry uses the house `Input` and `Textarea`, never a raw react-aria
`TextField` styled from route CSS ([Theming rules](./theming.md) 1.6).

4.4. **Consolidate near-duplicates.** Before writing a new themed clickable
surface, check whether Button (a variant) or an existing part already solves
it. A trigger that re-implements Button's concerns SHOULD render Button.

4.5. **Controlled or uncontrolled.** Stateful components (Sidebar,
TenantSwitcher) accept an optional controlled value plus change handler and
fall back to internal state.

4.6. **One engine, two layouts.** A data table that must also work in a
narrow space keeps a single TanStack instance (columns, filtering hand-off,
sorting) and renders it two ways: the semantic `<table>` with `aria-sort`
headers while it has room, and a flex list of flat Cards below a threshold,
where each row's cells become label/value pairs (labels from
`columnDef.header`, values through `table.FlexRender`) and a Sort control
(Select for the column, Button for the direction), living in the filter
bar's drawer, drives the same sorting state. The filter bar takes the same
`narrow` signal: switches stay on the row, a Filters toggle sits at its
far end, and the selects fold into the drawer. The signal MUST be the
sidebar inset's published width (`useSidebarInset(threshold)`, 4.0), not the
viewport and not the component's own box, because the sidebar changes the
space a table has and every component inside the inset must switch
together; the inset measures before paint so the layout never flashes.
Never fork the data or the column definitions for a mobile variant. The
leads table is the reference.

4.7. **Reference compositions.** Registry entries in the `demo` category are
screens or screen-sized parts assembled from the primitives, published so a
consumer copies the structure rather than the component. The `login-screen`
entry is the sign-in card and its form, placed by the route on a ground the
route composes (4.7.1) inside a page the route writes (4.7.2): a `LoginCard`
(the glass Card; glass because the ground carries a photograph) whose header
the route fills from Card's own parts (a title at level 1, a lede) and a
`LoginForm` (the ways in, react-aria native validation, a controlled API of
`onSignIn` with the credentials and nothing else), with the router kept in
the route. One composition serves phone and desktop: the card takes the
width with tighter padding below 40rem of the `full-bleed` region it stands
in. A demo entry MUST NOT
import the router or the mock data in `src/lib`; a route shell passes data,
links and the brand in. The registry inlines source files, not assets, so the
wordmark is an asset the route imports and nothing of it ships in the entry.
The alternatives a shipped composition was chosen from stay under `/lab` as
the archive (`/lab/login`, `/lab/login-2`, `/lab/glass`): the stage was chosen
on 2026-09-25 over a photo panel beside the form, a framed sheet and a dark
pane on the photograph. `ImageOverlay` and `BackgroundNoise`, laid by the
route as the first children of its region, remain the ground for a screen
that wants the photograph.

4.7.1. **Composition over coupling: no stage component.** A reference
composition exposes parts and never a wrapper that owns the screen around
them. The `LoginStage` of 2026-09-25, one div that painted the ground,
stacked the `ImageOverlay` and the `BackgroundNoise`, laid the three rows and
named the container, was retired on 2026-10-01 for that reason: it bound four
decisions that have nothing to do with one another (the ground's colour, the
layers on it, the arrangement of the rows, the container the parts query)
into one login-only element, so none of them could change without a prop or
a second stage. `FullBleedCanvas`, the same wrapper without the rows (the two
layers stacked and the content centred at the viewport's height), went the
same day for the same reason: it made a screen choose a wrapper before it
chose its parts, and the one thing it decided, the order of two layers, is
DOM order (4.8). The route now composes the screen from standalone pieces: a
`full-bleed` region (a global class in `global.css` for a screen outside the
shell: the viewport's height, the page gutters, an inline-size container
named `full-bleed`, and `flex: 1` so it fills the root column), the two
layers as its first children, then the login parts, arranged by the route's
own module. The parts query `full-bleed` for their narrow layout. The test
generalises: a wrapper whose only job is to hold a screen's parts together
and decide their surroundings is coupling; the route arranging pieces that
each stand alone is the composition the contract prefers, and a new demo
entry MUST NOT add a `<Name>Stage`, `<Name>Screen` or `<Name>Shell` root.

4.7.2. **A page is not a component.** The elements that make a page around
its components (a bar with the wordmark and the visitor's actions, a footer
line, the box that sizes a logo) are the page's own: plain elements the
route writes, with a line of layout in the route's module when they need
one, and never promoted to exported parts, because the project standardises
components and not pages. `LoginBar`, `LoginBrand`, `LoginNav` and
`LoginFooter` (2026-09-25) were retired on 2026-10-01 for this reason: each
was a flex row or a paragraph with one page-specific job, and documenting
them meant explaining a page. The test: when the only thing to say about an
element is where it sits on one page, it belongs to that page. Two
consequences: a demo entry documents what it ships (the login's card and
form) and nothing around it; and a route carries no comment that walks
through its layout, because a page that needs a paragraph to explain it has
too many parts. Simplicity here is not having to explain the page at all.

4.8. **Background layers are standalone.** A component that paints a ground
(`ImageOverlay`: gradient, photograph, credit; `BackgroundNoise`: film grain)
takes no children and never assumes the viewport. It is absolutely positioned
at `inset: 0`, full width and height, rendered as a first child of a
positioned container, so the siblings that follow paint above it in DOM order
(a layer with no controls of its own, the grain, also takes `z-index: -1`
inside an isolating container, so nothing can land on top of content). The
consumer owns the container, its position and its size, which is what lets the
same layer ground a whole screen, a panel or a card. There is no composed
ground component: `FullBleedCanvas`, which stacked the overlay and the grain
and centred the content, was retired on 2026-10-01 (4.7.1). The consumer lays
the layers itself, in paint order, as the first children of its positioned,
isolating container: the `ImageOverlay` first, the `BackgroundNoise` after it
so the grain lands on the photograph, the content after both. Two
consequences for the consumer: narrow-layout container queries are declared
on the consumer's container (the login's parts query `full-bleed`), not on
the layer; and a layout that covers the whole ground lets pointer events
through its bare areas so the layer's own controls (the credit link) stay
reachable. Wrapping content in a background component is the anti-pattern
this rule replaces.

4.9. **The session is a disclosure at the foot of the column.** The
`UserProfile` shows who signed in (an `Avatar` with the photograph, the
initials or a person icon, name over email) at the end of `SidebarFooter`, and on the
strip in dock layout, and discloses inline what the session can do. Its
actions are not its own: the shell passes them in as the sidebar's own
menu rows (`SidebarMenu` > `SidebarMenuItem` > `SidebarMenuButton`, the
arrangement 4.0.1 gives the dock's More panel), a Profile link slotted with
`asChild` and Log out as a react-aria Button, so the shell decides what a
session can do and where each action lands, the rows wear the nav's face
and collapse to their icons in the rail (3.10), and the component only
opens and closes. Log out lives here, not as a footer row of its own and
not behind More. Ported on 2026-09-30 from meddpicc's account menu, whose
popover became this disclosure (4.2) and whose menu items became these
rows; the `TenantSwitcher` is its counterpart at the head of the column,
and the two share one trigger material. `/lab/user-profile` holds the
three contexts side by side.

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

6.4. **Nothing user-scoped before sign-in.** A screen that renders before
authentication (the login) MUST NOT load, ask for or show data that depends
on who the user is: which workspaces exist, their names or plans, where the
user will land. That is an answer the API gives after sign-in, and showing
it earlier would reveal it to anyone. The pre-authentication route loads
nothing and navigates to the app's root; the authenticated layout resolves
the tenant from the navigation tree once it knows who signed in
(`_authenticated/index.tsx`). The login's workspace picker was removed for
this reason on 2026-09-24; the `/lab/login` mocks that still show one are
the archive of the earlier structure, not the rule.

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
