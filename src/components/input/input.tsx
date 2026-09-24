import {
  Input as AriaInput,
  TextField,
  type TextFieldProps,
} from "react-aria-components"
import { cva } from "class-variance-authority"
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
 * bloom (§4.7). Label, description and error come from Field, wired by
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
  className?: string
}

const inputVariants = cva(styles.field, {
  variants: {
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
  },
  defaultVariants: { size: "medium" },
})

export function Input({
  label,
  labelVariant,
  placeholder,
  description,
  errorMessage,
  size,
  className,
  ...props
}: InputProps) {
  return (
    <TextField
      data-slot="input"
      data-size={size ?? "medium"}
      className={cn(inputVariants({ size }), className)}
      {...props}
    >
      <FieldLabel variant={labelVariant}>{label}</FieldLabel>
      <AriaInput className={styles.input} placeholder={placeholder} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  )
}
