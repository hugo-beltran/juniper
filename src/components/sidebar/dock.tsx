import { Squares2X2Icon } from "@heroicons/react/24/outline"
import { Slot } from "@radix-ui/react-slot"
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { cn } from "@/lib/cn"
import { useExclusiveDisclosure } from "@/lib/use-exclusive-disclosure"
import styles from "./dock.module.css"

/* The shell's second layout (component-architecture §4.0.1): below
 * SIDEBAR_DOCK_BELOW the exposed ground moves from a left column to a bottom
 * strip, and the same nav items — the ones tagged for the dock — render here
 * as icon-over-label cells, at most four plus More. Compound like the
 * Sidebar: the consumer arranges Dock > DockRow > DockItem / DockMore, then
 * DockPanel with the sidebar's own menu parts for the rows behind More. Not
 * a second navigation component with its own data: one tree, two surfaces.
 * Same family as the sidebar, so it shares the badge relatively and ships
 * in the Sidebar registry entry. */

interface DockContextValue {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  panelId: string
}

const DockContext = createContext<DockContextValue | null>(null)

function useDock() {
  const context = useContext(DockContext)
  if (!context) throw new Error("Dock parts must render inside Dock.")
  return context
}

export function Dock({
  className,
  children,
  "aria-label": ariaLabel = "Primary",
  ...props
}: ComponentProps<"nav">) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const value = useMemo<DockContextValue>(
    () => ({ expanded, setExpanded, panelId }),
    [expanded, panelId],
  )

  /* One shell disclosure at a time: the switcher or the profile opening on
   * the strip closes More. */
  const ref = useRef<HTMLElement>(null)
  useExclusiveDisclosure(ref, expanded, () => setExpanded(false))

  return (
    <DockContext.Provider value={value}>
      <nav
        ref={ref}
        data-slot="dock"
        data-expanded={expanded || undefined}
        aria-label={ariaLabel}
        className={cn(styles.dock, className)}
        {...props}
      >
        {children}
      </nav>
    </DockContext.Provider>
  )
}

/* The row of cells. The active cell (a router link's aria-current="page"
 * or data-active) wears the needle pill: the icon alone on a needle-200
 * pill, the label on the ground (theming §4.7, selection in needle). Pure
 * CSS on the cell; nothing here measures. Chosen on 2026-09-30 over the
 * sidebar's connector tab turned a quarter, which /lab/dock keeps as the
 * alternative. */
export function DockRow({
  className,
  children,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul data-slot="dock-row" className={cn(styles.row, className)} {...props}>
      {children}
    </ul>
  )
}

/* One cell: an icon, an optional SidebarMenuBadge (rendered before the
 * label, moved to the icon's corner by CSS) and the label, which is the
 * accessible name; sr-only words for the badge go inside it. asChild slots
 * a router link in; otherwise a react-aria Button. The dock is the second
 * place an icon is required (component-architecture §3.10): the cell is
 * its icon over a word. */
export function DockItem({
  asChild = false,
  isActive = false,
  className,
  ...props
}: Omit<AriaButtonProps, "className"> & {
  className?: string
  asChild?: boolean
  isActive?: boolean
}) {
  const sharedProps = {
    "data-slot": "dock-item-button",
    "data-active": isActive || undefined,
    className: cn(styles.button, className),
  }

  return (
    <li data-slot="dock-item" className={styles.item}>
      {asChild ? (
        <Slot {...sharedProps} {...(props as ComponentProps<typeof Slot>)} />
      ) : (
        <AriaButton {...sharedProps} {...props} />
      )}
    </li>
  )
}

/* The fifth cell, whenever the tenant has items the row does not show: a
 * disclosure trigger (aria-expanded, aria-controls) for DockPanel. A badge
 * hidden behind More moves here; pass a SidebarMenuBadge as `badge` and the
 * sr-only words inside the label. */
export function DockMore({
  badge,
  children = "More",
  className,
  ...props
}: Omit<ComponentProps<"li">, "children"> & {
  badge?: ReactNode
  children?: ReactNode
}) {
  const { expanded, setExpanded, panelId } = useDock()

  return (
    <li data-slot="dock-more" className={cn(styles.item, className)} {...props}>
      <AriaButton
        data-slot="dock-more-button"
        className={styles.button}
        aria-expanded={expanded}
        aria-controls={panelId}
        onPress={() => setExpanded(!expanded)}
      >
        <Squares2X2Icon aria-hidden />
        {badge}
        <span>{children}</span>
      </AriaButton>
    </li>
  )
}

/* What More discloses: grows the dock upward in place (grid-rows 0fr → 1fr,
 * the tenant switcher's mechanism) and pushes the inset up; no sheet, no
 * overlay. Inert while closed. Fill it with the sidebar's menu parts
 * (SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton) so the
 * rows behind More are the sidebar's rows. Escape closes it and returns
 * focus to More; choosing a row (a link or an action) closes it. */
export function DockPanel({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const { expanded, setExpanded, panelId } = useDock()
  const ref = useRef<HTMLDivElement>(null)

  /* Bound as listeners, not JSX handlers: the panel is a plain box with no
   * role of its own; its rows own the semantics and the events bubble here. */
  useEffect(() => {
    const panel = ref.current
    if (!panel || !expanded) return
    const close = () => setExpanded(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      close()
      panel
        .closest('[data-slot="dock"]')
        ?.querySelector<HTMLElement>(`[aria-controls="${panelId}"]`)
        ?.focus()
    }
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a, button"))
        close()
    }
    panel.addEventListener("keydown", onKeyDown)
    panel.addEventListener("click", onClick)
    return () => {
      panel.removeEventListener("keydown", onKeyDown)
      panel.removeEventListener("click", onClick)
    }
  }, [expanded, setExpanded, panelId])

  return (
    <div
      ref={ref}
      id={panelId}
      data-slot="dock-panel"
      data-expanded={expanded || undefined}
      inert={!expanded}
      className={cn(styles.panel, className)}
      {...props}
    >
      <div className={styles.panelInner}>
        <div className={styles.panelContent}>{children}</div>
      </div>
    </div>
  )
}
