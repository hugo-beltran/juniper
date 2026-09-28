import type { ComponentProps } from "react"
import { BackgroundNoise } from "@/components/background-noise/background-noise"
import { ImageOverlay } from "@/components/image-overlay/image-overlay"
import { cn } from "@/lib/cn"
import styles from "./full-bleed-canvas.module.css"

/* The full-bleed ground for a screen that stands outside the sidebar shell:
 * ImageOverlay (the needle gradient, the photograph, its credit) across the
 * whole canvas, film grain over the photograph, and whatever the screen
 * carries centred above both, at the viewport's height. The login's card
 * stands on it. Route code never paints a ground (theming §1.6); a screen
 * that needs a different canvas is a variant here. The root is an
 * inline-size container named `full-bleed-canvas`, so a screen on it can
 * query the canvas's width for its narrow layout. Phone and desktop are the
 * same composition: the layers fill whatever the viewport is. */
export function FullBleedCanvas({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="full-bleed-canvas"
      className={cn(styles.canvas, className)}
      {...props}
    >
      <ImageOverlay />
      <BackgroundNoise />
      {children}
    </div>
  )
}
