import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import styles from "./stat.module.css"

const statVariants = cva(styles.stat, {
  variants: {
    size: {
      medium: styles.medium,
      large: styles.large,
    },
  },
  defaultVariants: { size: "medium" },
})

export interface StatProps extends VariantProps<typeof statVariants> {
  label: string
  value: ReactNode
  /** A change beside the figure: a DeltaChip. */
  change?: ReactNode
  className?: string
}

/* A figure with its label over it and a change beside it: the readout under
 * a chart, the number inside a gauge, a cell of a stat row. Not a card: the
 * SummaryCard is the KPI on its own surface; the Stat is the figure inside
 * someone else's. Two sizes, medium (display-sm) and large (display-lg). */
export function Stat({ label, value, change, size, className }: StatProps) {
  return (
    <div
      data-slot="stat"
      data-size={size ?? "medium"}
      className={cn(statVariants({ size }), className)}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.row}>
        <span className={styles.value}>{value}</span>
        {change}
      </span>
    </div>
  )
}
