import { useEffect, useState } from "react"

/* The lamp follows the pointer. A pointer over the element writes its
 * position on it as --lamp-x and --lamp-y, percentages of the box, which
 * the button module's panes are lit from (theming §4.6); leaving removes
 * them so the module's resting positions return. The one fact CSS cannot
 * know, published once as custom properties (component-architecture
 * §3.9); everything else, the glide between positions included, is CSS.
 * Writes are coalesced to one per frame; a touch pointer never hovers so
 * it never writes; reduced motion opts out entirely. Private to Button
 * until a second, unrelated component is lit the same way (§2.3).
 * Prototyped 2026-10-01 at /components/buttons.
 *
 * Returns a callback ref. The element lives in state, not a ref, so
 * swapping the rendered element (asChild on, asChild off) re-binds the
 * listeners. */
export function usePointerLamp(enabled: boolean) {
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled || !element) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let x = 0
    let y = 0
    const write = () => {
      frame = 0
      element.style.setProperty("--lamp-x", `${x}%`)
      element.style.setProperty("--lamp-y", `${y}%`)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      const rect = element.getBoundingClientRect()
      x = ((event.clientX - rect.left) / rect.width) * 100
      y = ((event.clientY - rect.top) / rect.height) * 100
      if (!frame) frame = requestAnimationFrame(write)
    }
    const leave = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      element.style.removeProperty("--lamp-x")
      element.style.removeProperty("--lamp-y")
    }

    element.addEventListener("pointermove", move)
    element.addEventListener("pointerleave", leave)
    return () => {
      leave()
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerleave", leave)
    }
  }, [enabled, element])

  return setElement
}
