import type { CSSProperties } from "react"
import { cn } from "@/lib/cn"
import styles from "./swatch.module.css"

/** How a mark is drawn: `fill` and `stroke` are CSS colours, usually a `var(--juni-…)` expression. */
export interface Mark {
  fill: string
  stroke?: string
}

const SIZE = 12

/* A small square beside a label, drawn as the mark the label stands for, so
 * the two always match. The colours arrive as custom properties because SVG
 * presentation attributes cannot hold var() (theming §5.1). Promoted from the
 * butterfly on 2026-10-29: a legend the route writes is its second consumer. */
export function Swatch({
  fill,
  stroke,
  className,
}: Mark & { className?: string }) {
  return (
    <svg
      data-slot="swatch"
      className={cn(styles.swatch, className)}
      width={SIZE}
      height={SIZE}
      style={{ "--fill": fill, "--stroke": stroke } as CSSProperties}
      aria-hidden="true"
    >
      <rect x={0.5} y={0.5} width={SIZE - 1} height={SIZE - 1} rx={1.5} />
    </svg>
  )
}
