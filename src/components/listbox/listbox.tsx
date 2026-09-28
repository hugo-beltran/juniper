import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps,
} from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./listbox.module.css"

/* House react-aria ListBox. Full keyboard navigation, typeahead and
 * selection semantics come from react-aria; the module styles two settings
 * through the root's data-variant, so items need no prop of their own:
 *
 *   inline   — rendered in the document flow (the tenant switcher's panel),
 *              rows shaped like the sidebar's menu buttons, focus ring on
 *              the row.
 *   popover  — inside a Select's anchored popover: bloom row wash marks
 *              focus, needle wash marks selection, no ring (theming §4.4
 *              exception), scrolls past 16rem.
 *
 * Promoted from tenant-switcher when Select became its second consumer
 * (component-architecture §2.3). */

export type ListBoxVariant = "inline" | "popover"

export function ListBox<T extends object>({
  className,
  variant = "inline",
  ...props
}: Omit<ListBoxProps<T>, "className"> & {
  className?: string
  variant?: ListBoxVariant
}) {
  return (
    <AriaListBox
      data-slot="listbox"
      data-variant={variant}
      className={cn(styles.listBox, className)}
      {...props}
    />
  )
}

export function ListBoxItem({
  className,
  ...props
}: Omit<ListBoxItemProps, "className"> & { className?: string }) {
  return (
    <AriaListBoxItem
      data-slot="listbox-item"
      className={cn(styles.item, className)}
      {...props}
    />
  )
}
