import { ChevronUpIcon } from "@heroicons/react/24/outline"
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { Button as AriaButton } from "react-aria-components"
import { Avatar } from "@/components/avatar/avatar"
import { cn } from "@/lib/cn"
import { useClickOutside } from "@/lib/use-click-outside"
import { useExclusiveDisclosure } from "@/lib/use-exclusive-disclosure"
import styles from "./user-profile.module.css"

export interface UserProfileUser {
  name: string
  email: string
  /** A photograph clipped to the avatar; absent, the initials show. */
  image?: string
}

/* The session's identity: the Avatar row at the foot of the sidebar, the
 * Avatar alone on the strip in dock layout. The TenantSwitcher's
 * counterpart, bookending the column, and built the same way. Ported from
 * meddpicc's account menu on 2026-09-30 with two adjustments. Its popover
 * became the house disclosure (component-architecture §4.2): the panel
 * grows in place, upward from the footer into the content's room, downward
 * from the strip the way the switcher's does. And its items became the
 * sidebar's own menu rows, passed in as children (SidebarMenu >
 * SidebarMenuItem > SidebarMenuButton, the arrangement the dock's More
 * panel takes): the shell decides what a session can do — a profile link,
 * the exit — and where each lands; the component only opens and closes.
 * Context is CSS (§3.9): one tree is the row with name and email in the
 * column, the avatar alone in the rail (the rows collapse to their icons,
 * the name and email become the rail tooltip) and the avatar alone on the
 * strip, where the panel spans the strip below the row. */
export function UserProfile({
  user,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  user: UserProfileUser
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* A press anywhere outside the trigger and panel dismisses; focus stays
   * where the user pressed. */
  useClickOutside(rootRef, () => setExpanded(false), expanded)

  /* One shell disclosure at a time: the switcher or More opening closes it. */
  useExclusiveDisclosure(rootRef, expanded, () => setExpanded(false))

  /* Bound as listeners, not JSX handlers: the panel is a plain box with no
   * role of its own; its rows own the semantics and the events bubble here.
   * Escape closes and returns focus to the trigger, the panel's previous
   * sibling (§5.3); choosing a row (a link or an action) closes. */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !expanded) return
    const close = () => setExpanded(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      close()
      const trigger = panel.previousElementSibling
      if (trigger instanceof HTMLElement) trigger.focus()
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
  }, [expanded])

  return (
    <div
      ref={rootRef}
      data-slot="user-profile"
      data-expanded={expanded || undefined}
      className={cn(styles.root, className)}
      {...props}
    >
      {/* Own trigger, not a SidebarMenuButton: the row has a second line
       * and no icon. The avatar is decorative; the name and email beside
       * it are the accessible name. */}
      <AriaButton
        data-slot="user-profile-trigger"
        className={styles.trigger}
        aria-expanded={expanded}
        aria-controls={panelId}
        onPress={() => setExpanded((current) => !current)}
      >
        <span className={styles.avatar} aria-hidden>
          <Avatar size={34} src={user.image} name={user.name} />
        </span>
        <span className={styles.meta}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
        </span>
        <ChevronUpIcon className={styles.chevron} aria-hidden />
      </AriaButton>
      <div
        ref={panelRef}
        id={panelId}
        data-slot="user-profile-panel"
        data-expanded={expanded || undefined}
        inert={!expanded}
        className={styles.panel}
      >
        <div className={styles.panelInner}>
          <div className={styles.panelContent}>{children}</div>
        </div>
      </div>
    </div>
  )
}
