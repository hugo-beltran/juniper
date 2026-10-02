import { cva } from "class-variance-authority"
import {
  Input as AriaInput,
  TextField,
  type TextFieldProps,
} from "react-aria-components"
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldLabelVariant,
  type FieldSize,
} from "@/components/field/field"
import { cn } from "@/lib/cn"
import styles from "./input.module.css"

/* Single-line text field on react-aria's TextField + Input: a labelled
 * control, not a bare <input>. The box wears the extruded volume (theming
 * §4.6) and sinks while focused, so typing into it reads as pressing into
 * the surface the way a pressed button does; hover and focus answer in
 * bloom (§4.7). The flat variant (2026-10-01) keeps the fill and the
 * hairline and drops the lift, for a field on a photograph or a busy
 * ground where the shadows have nothing to cast on, the reason that keeps
 * the discrete button off a photograph. Label, description and error come from Field, wired by
 * react-aria (htmlFor, aria-describedby). Everything else — value,
 * onChange, type, isRequired, isInvalid, isDisabled, name, autoComplete —
 * is react-aria's TextFieldProps passed through. */

export interface InputProps
  extends Omit<TextFieldProps, "className" | "children"> {
  label: string
  labelVariant?: FieldLabelVariant
  placeholder?: string
  description?: string
  /** Shown (and read) only while `isInvalid`. */
  errorMessage?: string
  /** Box height; mirrors Button sizes so a field and a button share a row. */
  size?: FieldSize
  /** Volume: extruded (the default, theming §4.6) or flat, for a field on a
   * photograph or a busy ground where the lift has nothing to cast on. */
  variant?: "extruded" | "flat"
  className?: string
}

const inputVariants = cva(styles.field, {
  variants: {
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
    variant: {
      extruded: styles.extruded,
      flat: styles.flat,
    },
  },
  defaultVariants: { size: "medium", variant: "extruded" },
})

export function Input({
  label,
  labelVariant,
  placeholder,
  description,
  errorMessage,
  size,
  variant,
  className,
  ...props
}: InputProps) {
  return (
    <TextField
      data-slot="input"
      data-size={size ?? "medium"}
      data-variant={variant ?? "extruded"}
      className={cn(inputVariants({ size, variant }), className)}
      {...props}
    >
      <FieldLabel variant={labelVariant}>{label}</FieldLabel>
      <AriaInput className={styles.input} placeholder={placeholder} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  )
}
