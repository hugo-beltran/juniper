import { useId } from "react";
import { Separator, Switch } from "react-aria-components";
import { Button } from "@/components/button/button";
import { Select, type SelectOption } from "./select";
import styles from "./leads-filters.module.css";

/* Filter row for the leads table: react-aria Switch filters (a switch on
 * the left, the copy as its label — pressing either toggles), then three
 * house Selects (Stage, Club, Scout; react-aria Select with an anchored
 * popover on the extruded material) in the sticky toolbar, a live result
 * summary and a Clear all button. Data-driven so the table owns filter
 * state and the row owns none. Private to leads-table until another view
 * needs it. */

export interface FilterField {
  id: string;
  label: string;
  /** Selected option value; "" means no filter. */
  value: string;
  /** `hint` renders muted beside the label in the list (e.g. a count). */
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface FilterToggle {
  id: string;
  label: string;
  /** Muted second line under the label; also the button's description. */
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function LeadsFilters({
  toggles = [],
  fields,
  onClearAll,
  resultCount,
  totalCount,
}: {
  /** Boolean filters, rendered as switches before the selects. */
  toggles?: FilterToggle[];
  fields: FilterField[];
  onClearAll: () => void;
  resultCount: number;
  totalCount: number;
}) {
  const fieldIdBase = useId();
  const activeCount =
    toggles.filter((toggle) => toggle.checked).length +
    fields.filter((field) => field.value !== "").length;

  return (
    <div data-slot="leads-filters" className={styles.toolbar}>
      {toggles.map((toggle) => {
        const titleId = `${fieldIdBase}-${toggle.id}-title`;
        const hintId = `${fieldIdBase}-${toggle.id}-hint`;
        return (
          /* Switch renders a <label> around a visually hidden checkbox, so
           * the whole row — track and copy — is one press target. Named
           * explicitly by the title; the hint is the description, so a
           * screen reader hears "Pending analysis only, switch, off, Leads
           * scouted but not yet graded" rather than one run-on name. */
          <Switch
            key={toggle.id}
            data-slot="leads-filters-switch"
            className={styles.toggle}
            isSelected={toggle.checked}
            onChange={toggle.onChange}
            aria-labelledby={titleId}
            aria-describedby={toggle.description ? hintId : undefined}
          >
            <span className={styles.switchTrack} aria-hidden>
              <span className={styles.switchThumb} />
            </span>
            <span className={styles.toggleCopy}>
              <span id={titleId} className={styles.toggleTitle}>
                {toggle.label}
              </span>
              {toggle.description && (
                <span id={hintId} aria-hidden className={styles.toggleHint}>
                  {toggle.description}
                </span>
              )}
            </span>
          </Switch>
        );
      })}

      {toggles.length > 0 && (
        <Separator orientation="vertical" className={styles.divider} />
      )}

      {fields.map((field) => (
        <Select
          key={field.id}
          label={field.label}
          placeholder={`Any ${field.label.toLowerCase()}`}
          value={field.value}
          options={field.options}
          onChange={field.onChange}
        />
      ))}

      <span className={styles.summary} aria-live="polite">
        {activeCount > 0
          ? `${resultCount} of ${totalCount} leads`
          : `${totalCount} leads`}
      </span>

      {activeCount > 0 && (
        <Button size="mini" variant="discrete" onPress={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
}
