import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./button.module.css"

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

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      discrete: styles.discrete,
    },
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
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
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const sharedProps = {
    "data-slot": "button",
    "data-variant": variant ?? "primary",
    "data-size": size ?? "medium",
    className: cn(buttonVariants({ variant, size }), className),
  }

  return asChild ? (
    <Slot {...sharedProps} {...(props as ComponentProps<typeof Slot>)} />
  ) : (
    <AriaButton {...sharedProps} {...props} />
  )
}
