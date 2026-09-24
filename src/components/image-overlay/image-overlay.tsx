import type { ComponentProps } from "react"
import { cn } from "@/lib/cn"
import styles from "./image-overlay.module.css"

/* A standalone background. It takes no children and never assumes the viewport:
 * rendered as the first child of a positioned container it fills that
 * container's full width and height and sits behind the siblings that follow it,
 * so the same layer can ground a whole screen, a card or a panel.
 * The photograph is a real img (alt="", decorative) rather than a CSS url(),
 * and an element lets the browser fetch and decode it like any image. */

export interface ImageResource {
  url: string
  creditHref: string
  caption: string
}

/* "Evergreen branches with blurred colorful background",
 * Hansheng Zhao on Unsplash, Unsplash licence. */
export const DEFAULT_IMAGE: ImageResource = {
  url: "https://images.unsplash.com/photo-1762869909580-12e109630a51?auto=format&fit=crop&w=1600&q=80",
  creditHref: "https://unsplash.com/photos/GEya108yMh8",
  caption: "Photo by Hansheng Zhao on Unsplash",
}

export interface ImageOverlayProps extends ComponentProps<"div"> {
  image?: ImageResource
}

export function ImageOverlay({
  className,
  image = DEFAULT_IMAGE,
  ...props
}: ImageOverlayProps) {
  const { url, creditHref, caption } = image

  return (
    <div
      data-slot="image-overlay"
      className={cn(styles.container, className)}
      {...props}
    >
      <img
        className={styles.image}
        src={url}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <p className={styles.credit}>
        <a href={creditHref} target="_blank" rel="noreferrer">
          {caption}
        </a>
      </p>
    </div>
  )
}
