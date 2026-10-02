import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { Heading, type HeadingProps } from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./card.module.css"

/* Generic surface container, with the shadcn Card's named parts ported
 * onto it (component-architecture §8): CardHeader, CardTitle,
 * CardDescription and CardFooter. CardContent is deliberately not ported:
 * Card already pads, and a content wrapper would only restate it. Three
 * materials by `material` (the axis is what the card is made of, not a
 * role, so it is not called `variant`; mirrored as data-material per
 * component-architecture §3.4): `flat` (default), the bark-50 sheet with a
 * bark-200 hairline that separates by border and tint (theming §4.6), and
 * `glass`, for a card that floats on a ground: the primary button's pane on
 * a surface, a radial fill lit from the top-left over a backdrop blur, a
 * specular top edge, the translucent ring and a bloom-tinted drop, so card
 * and button are lit by one lamp. Chosen at /lab/glass, which keeps the
 * alternatives. A fourth, `dotted` (added 2026-10-01), is the drafting
 * sheet: flat, with a dot grid, for a stage that shows a component at no
 * particular place (the Components catalogue). Card was promoted out
 * of the summary-card family when the SCOUT report timeline became its
 * second consumer; the parts arrived with the login screen. */

const cardVariants = cva(styles.card, {
  variants: {
    material: {
      flat: styles.flat,
      glass: styles.glass,
      "dark-glass": styles.darkGlass,
      dotted: styles.dotted,
    },
  },
  defaultVariants: { material: "flat" },
})

export interface CardProps
  extends ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

export function Card({ className, material, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-material={material ?? "flat"}
      className={cn(cardVariants({ material }), className)}
      {...props}
    />
  )
}

/* Title over description, stacked. */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(styles.header, className)}
      {...props}
    />
  )
}

/* react-aria Heading: `level` picks the element. h2 by default; a card that
 * is the page's main content passes 1. */
export function CardTitle({
  className,
  level = 2,
  ...props
}: Omit<HeadingProps, "className"> & { className?: string }) {
  return (
    <Heading
      data-slot="card-title"
      level={level}
      className={cn(styles.title, className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(styles.description, className)}
      {...props}
    />
  )
}

/* A row of actions by default; a consumer that stacks its actions (the
 * login screen) extends it with its own class. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(styles.footer, className)}
      {...props}
    />
  )
}
