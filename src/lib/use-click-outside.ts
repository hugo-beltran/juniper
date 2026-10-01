import { type RefObject, useEffect, useRef } from "react"

/* Fires when a pointer goes down outside `ref`. The callback rides in a ref
 * so the document listener binds once per `enabled` flip, not per render —
 * and with `enabled` false (the panel closed) no listener exists at all.
 * pointerdown, not click: dismissal should feel immediate and match how
 * overlay libraries (react-aria, Radix) treat outside presses. Shared by
 * the TenantSwitcher and the UserProfile, the shell's two inline
 * disclosures that dismiss on an outside press (the dock's More does not);
 * moved here from tenant-switcher on 2026-09-30. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  enabled = true,
) {
  const callbackRef = useRef(onClickOutside)
  useEffect(() => {
    callbackRef.current = onClickOutside
  })

  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: PointerEvent) => {
      const element = ref.current
      if (
        element &&
        event.target instanceof Node &&
        !element.contains(event.target)
      ) {
        callbackRef.current()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [ref, enabled])
}
