import { useId } from "react";
import {
  SwitchButton,
  SwitchField,
  type SwitchFieldProps,
} from "react-aria-components";
import { cn } from "@/lib/cn";
import styles from "./switch.module.css";

/* House Switch on react-aria's SwitchField + SwitchButton (the older
 * single `Switch` is deprecated in react-aria-components 1.21): an
 * extruded track on the left, the copy — a title and an optional muted
 * hint — as the label on the right, the whole row one press target.
 * react-aria renders a <label> around a visually hidden checkbox, which
 * would read title and hint as one run-on name; the switch is named by the
 * title and described by the hint instead, so a screen reader hears
 * "Pending analysis only, switch, off, Leads scouted but not yet graded".
 * Hover answers in bloom, the selected track in needle (theming §4.7); the
 * focus ring is drawn on the track because the real input is hidden
 * (§4.4). Promoted from leads-filters when the form primitives story made
 * it a shared control. */

export interface SwitchProps
  extends Omit<SwitchFieldProps, "className" | "children"> {
  label: string;
  /** Muted second line under the label; also the switch's description. */
  description?: string;
  className?: string;
}

export function Switch({
  label,
  description,
  className,
  ...props
}: SwitchProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const hintId = `${id}-hint`;
  return (
    <SwitchField
      data-slot="switch"
      className={cn(styles.switch, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? hintId : undefined}
      {...props}
    >
      <SwitchButton className={styles.button}>
        <span className={styles.track} aria-hidden>
          <span className={styles.thumb} />
        </span>
        <span className={styles.copy}>
          <span id={titleId} className={styles.title}>
            {label}
          </span>
          {description && (
            <span id={hintId} aria-hidden className={styles.hint}>
              {description}
            </span>
          )}
        </span>
      </SwitchButton>
    </SwitchField>
  );
}
