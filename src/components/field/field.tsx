import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  Text,
  type FieldErrorProps,
  type LabelProps,
  type TextProps,
} from "react-aria-components"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import styles from "./field.module.css"

/* The chrome every labelled control shares — label above, muted description
 * and heartwood error below — as three react-aria parts so Input, Textarea
 * and Select compose one copy instead of restating it. react-aria wires the
 * associations: Label gets htmlFor, Text slot="description" and FieldError
 * land in the control's aria-describedby, and FieldError renders only while
 * the field is invalid. Promoted on day one because three unrelated
 * primitives needed it at once (component-architecture §2.3). */

const labelVariants = cva(styles.label, {
  variants: {
    variant: {
      /* Uppercase caption: the toolbar and form default. */
      caption: styles.caption,
      /* Sentence-case title for a field that heads its own card. */
      title: styles.title,
    },
  },
  defaultVariants: { variant: "caption" },
})

export type FieldLabelVariant = NonNullable<
  VariantProps<typeof labelVariants>["variant"]
>

/* Control heights shared by Input, Textarea and Select. They mirror
 * Button's sizes (mini 1.75rem, small 2rem, medium 2.5rem) so a field and
 * a button sit on one row; each control declares the CSS, Field only names
 * the scale. */
export type FieldSize = "mini" | "small" | "medium"

export function FieldLabel({
  className,
  variant,
  ...props
}: Omit<LabelProps, "className"> & {
  className?: string
  variant?: FieldLabelVariant
}) {
  return (
    <AriaLabel
      data-slot="field-label"
      data-variant={variant ?? "caption"}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
}

export function FieldDescription({
  className,
  ...props
}: Omit<TextProps, "className" | "slot"> & { className?: string }) {
  return (
    <Text
      slot="description"
      data-slot="field-description"
      className={cn(styles.description, className)}
      {...props}
    />
  )
}

export function FieldError({
  className,
  ...props
}: Omit<FieldErrorProps, "className"> & { className?: string }) {
  return (
    <AriaFieldError
      data-slot="field-error"
      className={cn(styles.error, className)}
      {...props}
    />
  )
}
