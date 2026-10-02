import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type ReactNode, useState } from "react"
import { z } from "zod"
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  Button,
  type ButtonSize,
  type ButtonVariant,
  Card,
  ImageOverlay,
  Input,
  PageDescription,
  PageHeader,
  PageTitle,
  Select,
  type SelectOption,
  Switch,
} from "@/components"
import { cn } from "@/lib/cn"
import styles from "./buttons.module.css"

/* Buttons — the first page of the Components catalogue: one Button on a
 * stage, its variant, size, state and the surface it sits on chosen from
 * the panel beside it, the way a Storybook story takes its controls. The
 * choice is view state, so it lives in the URL (component-architecture
 * §6.3): a link to /components/buttons?variant=hero&surface=photograph
 * opens the same picture for whoever gets it. Defaults are never written.
 *
 * Forced states. A react-aria Button sets data-hovered and data-pressed
 * from the pointer and overrides anything passed in, so a forced state
 * cannot go through it. The stage renders the live Button at rest and,
 * for a forced state, the same Button around a plain <button> through
 * asChild: the slotted element carries no data-rac marker, so the module's
 * state selectors accept the data attributes the page sets on it, exactly
 * as they accept :hover on a slotted router Link (§3.7). Focus is not
 * forced: Tab to the live button to see the ring (theming §4.4).
 *
 * The route owns layout and demo state only; the stage is a Card in the
 * dotted material, every surface on it is from the contract (the flat
 * Card, the global .glass pane, ImageOverlay), every control a registry
 * control. */

const STATES = ["rest", "hovered", "pressed", "disabled"] as const
const SURFACES = ["canvas", "sheet", "glass", "photograph"] as const

type ButtonState = (typeof STATES)[number]
type Surface = (typeof SURFACES)[number]

const DEFAULTS = {
  variant: "primary",
  size: "medium",
  state: "rest",
  surface: "canvas",
} as const

/* The sanitizer: every field optional, each checked against the lists the
 * Button itself exports, a stale value falling back to the default. */
const searchSchema = z.object({
  variant: z.enum(BUTTON_VARIANTS).optional().catch(undefined),
  size: z.enum(BUTTON_SIZES).optional().catch(undefined),
  state: z.enum(STATES).optional().catch(undefined),
  surface: z.enum(SURFACES).optional().catch(undefined),
  wide: z.literal(true).optional().catch(undefined),
})

type ButtonsSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute("/_authenticated/components/buttons")({
  validateSearch: searchSchema,
  component: ButtonsPage,
})

const VARIANT_OPTIONS: SelectOption[] = [
  { value: "primary", label: "Primary", hint: "glass pane" },
  { value: "secondary", label: "Secondary", hint: "extruded" },
  { value: "discrete", label: "Discrete", hint: "flat text" },
  { value: "hero", label: "Hero", hint: "dark pane" },
]

const SIZE_OPTIONS: SelectOption[] = [
  { value: "mini", label: "Mini", hint: "1.75rem" },
  { value: "small", label: "Small", hint: "2rem" },
  { value: "medium", label: "Medium", hint: "2.5rem" },
]

const STATE_OPTIONS: SelectOption[] = [
  { value: "rest", label: "Rest", hint: "live" },
  { value: "hovered", label: "Hovered" },
  { value: "pressed", label: "Pressed" },
  { value: "disabled", label: "Disabled" },
]

const SURFACE_OPTIONS: SelectOption[] = [
  { value: "canvas", label: "Canvas", hint: "the dotted sheet" },
  { value: "sheet", label: "Sheet", hint: "flat card" },
  { value: "glass", label: "Glass pane" },
  { value: "photograph", label: "Photograph" },
]

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: "Primary",
  secondary: "Secondary",
  discrete: "Discrete",
  hero: "Hero",
}

/* When each face is for, under the stage: the contract's usage rule in a
 * sentence, so the canvas teaches as well as shows. */
const VARIANT_NOTE: Record<ButtonVariant, string> = {
  primary:
    "The view's one main action, the glass pane. One per view; a second primary is a secondary.",
  secondary:
    "Supporting actions beside a primary or on their own: the control surface under the primary's own shadow, so a primary and a secondary on one row are lit by one lamp and a row of secondaries reads as buttons, not as competing calls.",
  discrete:
    "Toolbar and inline triggers: flat text until touched, so it sits in a sentence or a cell without weight. It lifts on hover and sinks when pressed, and that lift is all it has: never on a busy background such as a photograph, where a secondary takes its place.",
  hero: "The heavy call to action: the main character of the page, the one thing the screen exists for (a sign-in, a checkout). It stands in for primary, never beside it, and nothing else on the page should compete with it. Use it sparsely: one page in many, never one per card.",
}

/* The Button under study. At rest it is the real control; in a forced
 * state it is the same face on a plain button carrying the state's data
 * attribute, as the module's selectors read it. */
function Sample({
  variant,
  size,
  state,
  wide,
  children,
}: {
  variant: ButtonVariant
  size: ButtonSize
  state: ButtonState
  wide: boolean
  children: string
}) {
  const className = wide ? styles.wide : undefined
  if (state === "rest") {
    return (
      <Button variant={variant} size={size} className={className}>
        {children}
      </Button>
    )
  }
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      data-hovered={state === "hovered" ? "" : undefined}
      data-pressed={state === "pressed" ? "" : undefined}
      data-disabled={state === "disabled" ? "" : undefined}
    >
      <button type="button" disabled={state === "disabled"}>
        {children}
      </button>
    </Button>
  )
}

/* The stage is the dotted sheet, and the surface the sample sits on
 * stands on it: nothing (the canvas itself), a flat Card at the slot's
 * width, or a framed panel an ImageOverlay fills (component-architecture
 * §4.8) carrying the glass pane or the bare photograph. The slot
 * holds the sample at the login form's measure, so "wide" means that
 * width. */
function Stage({
  surface,
  children,
}: {
  surface: Surface
  children: ReactNode
}) {
  const surfaceNode = (() => {
    switch (surface) {
      case "canvas":
        return <div className={styles.slot}>{children}</div>
      case "sheet":
        return <Card className={cn(styles.slot, styles.pane)}>{children}</Card>
      case "photograph":
        return (
          <div className={styles.frame}>
            <ImageOverlay />
            <div className={styles.slot}>{children}</div>
          </div>
        )
      case "glass":
        return (
          <div className={styles.frame}>
            <ImageOverlay />
            <div className={cn("glass", styles.slot, styles.pane)}>
              {children}
            </div>
          </div>
        )
    }
  })()
  return (
    <Card material="dotted" className={styles.stage}>
      {surfaceNode}
    </Card>
  )
}

/* The JSX a consumer would write for what the stage shows: the defaults
 * left out, as the URL leaves them out. */
const snippet = (
  variant: ButtonVariant,
  size: ButtonSize,
  state: ButtonState,
  label: string,
) =>
  `<Button${variant === DEFAULTS.variant ? "" : ` variant="${variant}"`}${
    size === DEFAULTS.size ? "" : ` size="${size}"`
  }${state === "disabled" ? " isDisabled" : ""}>${label}</Button>`

function ButtonsPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [label, setLabel] = useState("Sign in with Google")

  const variant = search.variant ?? DEFAULTS.variant
  const size = search.size ?? DEFAULTS.size
  const state = search.state ?? DEFAULTS.state
  const surface = search.surface ?? DEFAULTS.surface
  const wide = search.wide ?? false

  /* One control, one key: the next value merged over the rest of the
   * search, the default dropped, written with replace so flipping through
   * variants does not pile up history. */
  const set = (patch: ButtonsSearch) =>
    navigate({
      to: "/components/buttons",
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
    })

  const choose =
    <K extends keyof typeof DEFAULTS>(key: K) =>
    (value: string) =>
      set({
        [key]: value === DEFAULTS[key] || value === "" ? undefined : value,
      } as ButtonsSearch)

  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Buttons</PageTitle>
        <PageDescription>
          One Button on a stage. Pick its variant, size and state, and the
          surface it sits on; the choice is in the URL, so a view is a link.
          Rest is the live control: hover, press and Tab to it, and on the two
          panes move the pointer across to see the lamp follow. The other states
          are forced so they hold still for comparison.
        </PageDescription>
      </PageHeader>

      <section className={styles.workbench}>
        <div className={styles.canvas}>
          <Stage surface={surface}>
            <Sample variant={variant} size={size} state={state} wide={wide}>
              {label || VARIANT_LABEL[variant]}
            </Sample>
          </Stage>
          <pre className={styles.snippet}>
            <code>
              {snippet(variant, size, state, label || VARIANT_LABEL[variant])}
            </code>
          </pre>
          <p className={styles.note}>
            <strong>{VARIANT_LABEL[variant]}.</strong> {VARIANT_NOTE[variant]}
          </p>
        </div>

        <Card className={styles.panel}>
          <h2>Controls</h2>
          <Select
            label="Variant"
            size="small"
            value={variant}
            onChange={choose("variant")}
            options={VARIANT_OPTIONS}
          />
          <Select
            label="Size"
            size="small"
            value={size}
            onChange={choose("size")}
            options={SIZE_OPTIONS}
          />
          <Select
            label="State"
            size="small"
            value={state}
            onChange={choose("state")}
            options={STATE_OPTIONS}
          />
          <Select
            label="Surface"
            size="small"
            value={surface}
            onChange={choose("surface")}
            options={SURFACE_OPTIONS}
          />
          <Input
            label="Label"
            size="small"
            value={label}
            onChange={setLabel}
            placeholder={VARIANT_LABEL[variant]}
          />
          <Switch
            label="Full width"
            description="Fill the slot's width."
            isSelected={wide}
            onChange={(selected) => set({ wide: selected || undefined })}
          />
        </Card>
      </section>

      <Card className={styles.reference}>
        <h2>Every variant, at rest, at this size</h2>
        <div className={styles.row}>
          {BUTTON_VARIANTS.map((candidate) => (
            <Button key={candidate} variant={candidate} size={size}>
              {VARIANT_LABEL[candidate]}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
