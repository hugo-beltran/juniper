import { cn } from "@/lib/cn"
import styles from "./screen-overlay.module.css"

const DEFAULT_IMAGE: ImageResource = {
  url: "https://images.unsplash.com/photo-1762869909580-12e109630a51?auto=format&fit=crop&w=1600&q=80",
  creditHref: "https://unsplash.com/photos/GEya108yMh8",
  caption: "Photo by Hansheng Zhao on Unsplash",
}

type ImageResource = {
  url: string
  creditHref: string
  caption: string
}

export function ScreenOverlay({
  children,
  className,
  image,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { image?: ImageResource }) {
  const { url, creditHref, caption } = image || DEFAULT_IMAGE

  return (
    <div
      className={cn(styles.screen, className)}
      style={{ "--image-url": url } as React.CSSProperties}
      {...props}
    >
      {children}
      <p className={styles.credit}>
        <a href={creditHref} target="_blank" rel="noreferrer">
          {caption}
        </a>
      </p>
    </div>
  )
}
