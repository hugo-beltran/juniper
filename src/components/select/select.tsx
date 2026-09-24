import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { cva } from "class-variance-authority"
import {
  Button as AriaButton,
  Select as AriaSelect,
  ButtonContext,
  Popover,
  SelectValue,
} from "react-aria-components"
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldLabelVariant,
  type FieldSize,
} from "@/components/field/field"
import { ListBox, ListBoxItem } from "@/components/listbox/listbox"
import { cn } from "@/lib/cn"
import styles from "./select.module.css"

/* House Select on react-aria's Select: labelled trigger wearing the
 * extruded volume (theming §4.6), an anchored popover on the same material
 * at exactly the trigger's width (react-aria's --trigger-width), so the
 * open list reads as the control extending downward rather than a panel
 * floating over it. While open the trigger sinks (inset), the popover
 * stands proud. Keyboard, typeahead and selection semantics come from
 * react-aria; label, description and error come from Field.
 *
 * Two personalities behind one prop: a plain Select is a form control — a
 * placeholder until something is chosen, optionally required. `isClearable`
 * turns it into a filter: the placeholder becomes a real, selectable "any"
 * row, a clear (×) appears while a value is set, and the trigger wears the
 * needle wash to say a filter is applied. Promoted from leads-table when
 * the form primitives story made it a shared control. */

export interface SelectOption {
  value: string
  label: string
  /** Muted trailing text in the list (e.g. a count); not shown in the trigger. */
  hint?: string
}

export interface SelectProps {
  label: string
  labelVariant?: FieldLabelVariant
  /** Selected option value; "" means nothing is selected. */
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Trigger text while empty; with `isClearable`, also the "any" row's label. */
  placeholder?: string
  /** Filter mode: a selectable "any" row, a clear button, the needle wash. */
  isClearable?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  isDisabled?: boolean
  description?: string
  /** Shown (and read) only while `isInvalid`. */
  errorMessage?: string
  /** Trigger height; mirrors Button sizes so a field and a button share a row. */
  size?: FieldSize
  /** Form field name, submitted as a hidden input. */
  name?: string
  className?: string
}

/* The "any" row is a real, selectable item; its key is a sentinel so the
 * consumer keeps working with "" for "nothing selected". */
const ANY = "__any"

const selectVariants = cva(styles.select, {
  variants: {
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
  },
  defaultVariants: { size: "medium" },
})

export function Select({
  label,
  labelVariant,
  value,
  onChange,
  options,
  placeholder = "Select…",
  isClearable = false,
  isRequired,
  isInvalid,
  isDisabled,
  description,
  errorMessage,
  size,
  name,
  className,
}: SelectProps) {
  const isSet = value !== ""
  return (
    <AriaSelect
      data-slot="select"
      data-size={size ?? "medium"}
      data-active={(isClearable && isSet) || undefined}
      className={cn(selectVariants({ size }), className)}
      selectedKey={isSet ? value : isClearable ? ANY : null}
      onSelectionChange={(key) =>
        onChange(key === null || key === ANY ? "" : String(key))
      }
      placeholder={placeholder}
      isRequired={isRequired}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      name={name}
    >
      <FieldLabel variant={labelVariant}>{label}</FieldLabel>
      {/* The clear button is a sibling of the trigger, not a child — a
          button cannot nest in a button — laid over the trigger's right
          end, before the chevron, only while a value is set. Select hands
          its trigger props to every react-aria Button inside it via
          ButtonContext, so the context is reset around the clear button or
          it would open the list instead of clearing. */}
      <div className={styles.control}>
        <AriaButton className={styles.trigger}>
          {/* textValue (the bare label), not the item's children — a list
              hint (a count) belongs in the list, not on the trigger. */}
          <SelectValue className={styles.value}>
            {({ isPlaceholder, selectedText, defaultChildren }) =>
              isPlaceholder ? defaultChildren : selectedText
            }
          </SelectValue>
          <ChevronDownIcon aria-hidden className={styles.chevron} />
        </AriaButton>
        {isClearable && isSet && (
          <ButtonContext.Provider value={null}>
            <AriaButton
              aria-label={`Clear ${label.toLowerCase()}`}
              className={styles.clear}
              onPress={() => onChange("")}
            >
              <XMarkIcon aria-hidden />
            </AriaButton>
          </ButtonContext.Provider>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className={styles.popover} placement="bottom start" offset={4}>
        <ListBox variant="popover">
          {isClearable && (
            <ListBoxItem id={ANY} textValue={placeholder}>
              {placeholder}
            </ListBoxItem>
          )}
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
            >
              {option.label}
              {option.hint && (
                <span className={styles.hint} aria-hidden>
                  {option.hint}
                </span>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
