import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from "react-aria-components";
import styles from "./select.module.css";

/* House Select on react-aria's Select: labelled trigger wearing the
 * extruded volume (theming §4.6), an anchored popover on the same material
 * at exactly the trigger's width (react-aria's --trigger-width), so the
 * open list reads as the control extending downward rather than a panel
 * floating over it. While open the trigger sinks (inset), the popover
 * stands proud. Keyboard, typeahead and selection semantics come from
 * react-aria. Private to leads-table until a second view needs it — the
 * form-primitives story promotes it. */

export interface SelectOption {
  value: string;
  label: string;
  /** Muted trailing text in the list (e.g. a count); not shown in the trigger. */
  hint?: string;
}

/* The "any" option is a real, selectable item; its key is a sentinel so
 * the consumer keeps working with "" for "no filter". */
const ANY = "__any";

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  /** Selected option value; "" selects the placeholder item. */
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Text of the "any" item, e.g. "Any club". */
  placeholder: string;
}) {
  return (
    <AriaSelect
      data-slot="select"
      data-active={value !== "" || undefined}
      className={styles.select}
      selectedKey={value === "" ? ANY : value}
      onSelectionChange={(key) => onChange(key === ANY ? "" : String(key))}
    >
      <Label className={styles.label}>{label}</Label>
      <AriaButton className={styles.trigger}>
        {/* textValue (the bare label), not the item's children — the list
            hint (a count) belongs in the list, not on the trigger. */}
        <SelectValue className={styles.value}>
          {({ selectedText }) => selectedText}
        </SelectValue>
        <ChevronDownIcon aria-hidden className={styles.chevron} />
      </AriaButton>
      <Popover className={styles.popover} placement="bottom start" offset={4}>
        <ListBox className={styles.listBox}>
          <ListBoxItem id={ANY} textValue={placeholder} className={styles.item}>
            {placeholder}
          </ListBoxItem>
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              className={styles.item}
            >
              {option.label}
              {option.hint && (
                <span className={styles.itemHint} aria-hidden>
                  {option.hint}
                </span>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
