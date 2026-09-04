import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps,
} from 'react-aria-components'
import { cn } from '@/lib/cn'
import styles from './listbox.module.css'

/* Inline react-aria ListBox (no popover pairing — it renders in the document
 * flow, per the project's inline-over-overlay philosophy). Full keyboard
 * navigation, typeahead, and selection semantics come from react-aria.
 * Private to tenant-switcher until another component needs it. */

export function ListBox<T extends object>({
  className,
  ...props
}: Omit<ListBoxProps<T>, 'className'> & { className?: string }) {
  return <AriaListBox className={cn(styles.listBox, className)} {...props} />
}

export function ListBoxItem({
  className,
  ...props
}: Omit<ListBoxItemProps, 'className'> & { className?: string }) {
  return <AriaListBoxItem className={cn(styles.item, className)} {...props} />
}
