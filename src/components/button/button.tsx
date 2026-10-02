import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentProps, type Ref, useCallback } from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./button.module.css"
import { usePointerLamp } from "./use-pointer-lamp"

/* shadcn-style button on the react-aria Button primitive (onPress/isDisabled
 * semantics). Callers pass intent props: `variant` and `size` — never class
 * names. No destructive variant yet: the jn palette has no red scale.
 *
 * `asChild` slots a router <Link> (or any element) in place of the button
 * so navigation keeps anchor semantics while wearing the button's face
 * (component-architecture §3.7). The module styles hover/press for that
 * case through :hover/:active on elements without react-aria's data-rac
 * marker, so react-aria buttons keep their pointer-type-correct data
 * attributes. */

/* The two axes as lists, for a catalogue that enumerates them (the
 * Buttons canvas) and for a route that validates one from the URL. The
 * CVA map below is the source of each class; these only name the keys. */
export const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "discrete",
  "hero",
] as const
export const BUTTON_SIZES = ["mini", "small", "medium"] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      discrete: styles.discrete,
      hero: styles.hero,
    } satisfies Record<ButtonVariant, string>,
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    } satisfies Record<ButtonSize, string>,
  },
  defaultVariants: {
    variant: "primary",
    size: "medium",
  },
})

export interface ButtonProps
  extends Omit<AriaButtonProps, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string
  /** Render the child element (a router Link) with the button's props instead of a react-aria Button. */
  asChild?: boolean
  /** The rendered element; the lamp reads it too. */
  ref?: Ref<HTMLButtonElement>
}

/* The variants lit by the lamp: the two panes. */
const PANES: ReadonlySet<string> = new Set(["primary", "hero"])

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const resolvedVariant = variant ?? "primary"
  /* The lamp follows the pointer on the two panes (theming §4.6). */
  const setLampElement = usePointerLamp(PANES.has(resolvedVariant))

  /* The lamp's element and the caller's ref, both fed from one callback. */
  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      setLampElement(node)
      if (typeof ref === "function") return ref(node as never)
      if (ref) (ref as { current: unknown }).current = node
    },
    [ref, setLampElement],
  )

  const sharedProps = {
    "data-slot": "button",
    "data-variant": resolvedVariant,
    "data-size": size ?? "medium",
    className: cn(buttonVariants({ variant, size }), className),
    ref: mergedRef as Ref<never>,
  }

  return asChild ? (
    <Slot {...sharedProps} {...(props as ComponentProps<typeof Slot>)} />
  ) : (
    <AriaButton {...sharedProps} {...props} />
  )
}
