import { useState, type ReactNode } from "react"
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { Disclosure, DisclosurePanel, Separator } from "react-aria-components"
import { Button } from "@/components/button/button"
import { Input } from "@/components/input/input"
import { Select, type SelectOption } from "@/components/select/select"
import { useSidebarInset } from "@/components/sidebar/sidebar"
import { Switch } from "@/components/switch/switch"
import styles from "./filter-bar.module.css"

/* Sticky filter toolbar above a table: an optional search Input, house
 * Switch toggles, a Separator, one Select per field (filter mode:
 * isClearable, mini) and a discrete Clear all Button while a filter is
 * active. Data-driven — the table owns the filter state, the bar owns
 * none. Promoted from leads-table (leads-filters) when the users table
 * became its second consumer.
 *
 * Two layouts. Wide: everything on one 4rem row. Narrow — by default when
 * the sidebar inset the bar scrolls in reports itself narrow
 * (useSidebarInset), or forced with the `narrow` prop — the search and
 * switches stay on the row with
 * a Filters toggle at its far end, and the selects, any `extras` (a table's
 * Sort control) and Clear all fold into a drawer beneath — a react-aria
 * Disclosure that grows in place and pushes the rows down, never a floating
 * panel (component-architecture §4.2). The toggle wears the active filter
 * count so the state stays visible while the drawer is closed. */

export interface FilterSearch {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export interface FilterField {
  id: string
  label: string
  /** Selected option value; "" means no filter. */
  value: string
  /** `hint` renders muted beside the label in the list (e.g. a count). */
  options: SelectOption[]
  onChange: (value: string) => void
}

export interface FilterToggle {
  id: string
  label: string
  /** Muted second line under the label; also the switch's description. */
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FilterBar({
  search,
  toggles = [],
  fields,
  onClearAll,
  narrow: narrowProp,
  extras,
}: {
  /** Free-text filter, rendered first. */
  search?: FilterSearch
  /** Boolean filters, rendered as switches before the selects. */
  toggles?: FilterToggle[]
  fields: FilterField[]
  onClearAll: () => void
  /** Force the narrow layout; defaults to the sidebar inset's own signal. */
  narrow?: boolean
  /** Controls that belong beside the fields in the drawer (a Sort control). */
  extras?: ReactNode
}) {
  const insetNarrow = useSidebarInset(900)
  const narrow = narrowProp ?? insetNarrow
  const [open, setOpen] = useState(false)
  const activeCount =
    (search && search.value.trim() !== "" ? 1 : 0) +
    toggles.filter((toggle) => toggle.checked).length +
    fields.filter((field) => field.value !== "").length

  const searchControl = search && (
    <Input
      size="mini"
      type="search"
      label={search.label}
      placeholder={search.placeholder}
      value={search.value}
      onChange={search.onChange}
    />
  )

  const toggleControls = toggles.map((toggle) => (
    <Switch
      key={toggle.id}
      label={toggle.label}
      description={toggle.description}
      isSelected={toggle.checked}
      onChange={toggle.onChange}
    />
  ))

  const fieldControls = fields.map((field) => (
    <Select
      key={field.id}
      size="mini"
      isClearable
      label={field.label}
      placeholder={`Any ${field.label.toLowerCase()}`}
      value={field.value}
      options={field.options}
      onChange={field.onChange}
    />
  ))

  const clearAll = activeCount > 0 && (
    <Button size="mini" variant="discrete" onPress={onClearAll}>
      Clear all
    </Button>
  )

  if (narrow) {
    return (
      <Disclosure
        className={styles.disclosure}
        isExpanded={open}
        onExpandedChange={setOpen}
      >
        <div
          data-slot="filter-bar"
          data-layout="narrow"
          className={`${styles.toolbar} ${styles.toolbarNarrow}`}
        >
          <div className={styles.lead}>
            {searchControl}
            {toggleControls}
          </div>
          {/* slot="trigger" takes the Disclosure's aria-expanded and
              aria-controls wiring; the secondary face sinks while open. */}
          <Button slot="trigger" size="mini" variant="secondary">
            <AdjustmentsHorizontalIcon />
            Filters
            {activeCount > 0 && (
              <span className={styles.count}>
                <span className="sr-only">, </span>
                {activeCount}
                <span className="sr-only"> active</span>
              </span>
            )}
          </Button>
        </div>
        <DisclosurePanel className={styles.drawer}>
          <div className={styles.drawerFields}>
            {fieldControls}
            {extras}
          </div>
          {clearAll && <div className={styles.drawerFooter}>{clearAll}</div>}
        </DisclosurePanel>
      </Disclosure>
    )
  }

  return (
    <div data-slot="filter-bar" data-layout="wide" className={styles.toolbar}>
      {searchControl}
      {toggleControls}
      {toggles.length > 0 && fields.length > 0 && (
        <Separator orientation="vertical" className={styles.divider} />
      )}
      {fieldControls}
      {clearAll}
    </div>
  )
}
