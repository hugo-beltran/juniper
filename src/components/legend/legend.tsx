import type { ReactNode } from "react"
import { Swatch } from "@/components/swatch/swatch"
import { cn } from "@/lib/cn"
import styles from "./legend.module.css"

export interface LegendItem {
  id: string
  label: string
  /** The series' colour, as the chart's CSS has it: var(--juni-categorical-0). */
  fill: string
  stroke?: string
  /** A figure beside the label: the series' total, or the value under the pointer. */
  value?: ReactNode
}

/* The key beside a chart: a swatch and a label per series, in series order,
 * with room for a figure after each. The chart carries no legend of its
 * own, so the caller lays this next to it with the same tokens the chart's
 * bands wear; the swatch is what keeps the two from disagreeing. */
export function Legend({
  items,
  className,
}: {
  items: readonly LegendItem[]
  className?: string
}) {
  return (
    <ul data-slot="legend" className={cn(styles.legend, className)}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <Swatch fill={item.fill} stroke={item.stroke} />
          <span className={styles.label}>{item.label}</span>
          {item.value !== undefined && (
            <span className={styles.value}>{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
