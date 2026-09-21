import {
  TextArea as AriaTextArea,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import { cva } from "class-variance-authority";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldLabelVariant,
  type FieldSize,
} from "@/components/field/field";
import { cn } from "@/lib/cn";
import styles from "./textarea.module.css";

/* Multi-line text field on react-aria's TextField + TextArea. Same
 * material and states as Input — extruded, sinks while focused, bloom on
 * hover and focus, heartwood when invalid — with a vertical resize handle
 * and a minimum height set by `rows`. Label, description and error come
 * from Field. */

export interface TextareaProps
  extends Omit<TextFieldProps, "className" | "children"> {
  label: string;
  labelVariant?: FieldLabelVariant;
  placeholder?: string;
  description?: string;
  /** Shown (and read) only while `isInvalid`. */
  errorMessage?: string;
  /** Visible lines before scrolling; the box grows by drag, never by content. */
  rows?: number;
  /** Type size and inset; mirrors Input. */
  size?: FieldSize;
  className?: string;
}

const textareaVariants = cva(styles.field, {
  variants: {
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
  },
  defaultVariants: { size: "medium" },
});

export function Textarea({
  label,
  labelVariant,
  placeholder,
  description,
  errorMessage,
  rows = 3,
  size,
  className,
  ...props
}: TextareaProps) {
  return (
    <TextField
      data-slot="textarea"
      data-size={size ?? "medium"}
      className={cn(textareaVariants({ size }), className)}
      {...props}
    >
      <FieldLabel variant={labelVariant}>{label}</FieldLabel>
      <AriaTextArea
        className={styles.textarea}
        placeholder={placeholder}
        rows={rows}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
