import type { ComponentProps, CSSProperties } from "react"
import { cn } from "@/lib/cn"
import styles from "./screen-overlay.module.css"

/* The ground a whole screen stands on: the shell's needle gradient with a
 * photograph laid over it in luminosity blend at a whisper of opacity, and
 * the photograph's credit pinned to the bottom-right corner. Children are
 * the screen's own layout. The login screen is the first consumer; the
 * shell's wrapper is the natural second. The photograph is a url() to its
 * CDN, so nothing ships in the bundle and the entry stays self-contained;
 * pass `image` to swap it, credit included. The root is an inline-size
 * container, so a consumer's layout can query the ground's width rather
 * than the viewport's. */

export interface ImageResource {
  url: string
  creditHref: string
  caption: string
}

/* "Close-up of evergreen branches with blurred colorful background",
 * Hansheng Zhao on Unsplash, Unsplash licence. */
export const SCREEN_OVERLAY_IMAGE: ImageResource = {
  url: "https://images.unsplash.com/photo-1762869909580-12e109630a51?auto=format&fit=crop&w=1600&q=80",
  creditHref: "https://unsplash.com/photos/GEya108yMh8",
  caption: "Photo by Hansheng Zhao on Unsplash",
}

export interface ScreenOverlayProps extends ComponentProps<"div"> {
  image?: ImageResource
}

export function ScreenOverlay({
  children,
  className,
  image = SCREEN_OVERLAY_IMAGE,
  style,
  ...props
}: ScreenOverlayProps) {
  return (
    <div
      data-slot="screen-overlay"
      className={cn(styles.screen, className)}
      style={
        { "--image-url": `url("${image.url}")`, ...style } as CSSProperties
      }
      {...props}
    >
      {children}
      <p className={styles.credit}>
        <a href={image.creditHref} target="_blank" rel="noreferrer">
          {image.caption}
        </a>
      </p>
    </div>
  )
}
