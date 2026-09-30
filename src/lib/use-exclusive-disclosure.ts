import { type RefObject, useEffect, useRef } from "react"

/* The shell's inline disclosures (the TenantSwitcher, the UserProfile, the
 * dock's More) are exclusive: opening one closes the others, so two panels
 * never push the inset at once. A pointer already does this through
 * useClickOutside, since pressing one trigger is a press outside the
 * other; this covers the keyboard, where no pointer lands. Decoupled: an
 * opening disclosure announces itself with a document event carrying its
 * root, and every other open disclosure hears it and closes. No shared
 * state, no provider, and a disclosure inside another (none today) would
 * not close its parent. Added 2026-09-30. */
const OPEN_EVENT = "juniper:disclosure-open"

export function useExclusiveDisclosure(
  ref: RefObject<HTMLElement | null>,
  expanded: boolean,
  onClose: () => void,
) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const element = ref.current
    if (!expanded || !element) return

    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: element }))

    const onOpen = (event: Event) => {
      const other = (event as CustomEvent<Element>).detail
      if (other !== element && !element.contains(other)) closeRef.current()
    }
    document.addEventListener(OPEN_EVENT, onOpen)
    return () => document.removeEventListener(OPEN_EVENT, onOpen)
  }, [ref, expanded])
}
