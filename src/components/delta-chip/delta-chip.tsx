import { cn } from "@/lib/cn"
import styles from "./delta-chip.module.css"

/** What a chip or a cell needs of a number format. */
export type Formatter = Pick<Intl.NumberFormat, "format">

/** The default: a signed percentage to one decimal, `+4.2%`. */
export const deltaFormat: Formatter = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
})

const toneOf = (value: number | null) =>
  value === null || value === 0 ? "flat" : value > 0 ? "up" : "down"
const arrowOf = (value: number) => (value > 0 ? "↑" : value < 0 ? "↓" : "-")

/* A change against a base as a chip: needle when up, heartwood when down,
 * bark when flat or unknown. With `invert`, for a figure that is better
 * lower (runs allowed, errors), the tones swap while the arrow still follows
 * the value. Renders nothing for null, so a missing comparison leaves no
 * empty chip behind. */
export function DeltaChip({
  value,
  className,
  formatter = deltaFormat,
  invert = false,
}: {
  value: number | null
  className?: string
  formatter?: Formatter
  invert?: boolean
}) {
  if (value === null) return null
  const tone = toneOf(invert ? -value : value)

  return (
    <span
      data-slot="delta-chip"
      data-tone={tone}
      className={cn(styles.chip, styles[tone], className)}
    >
      {`${formatter.format(value)} ${arrowOf(value)}`}
    </span>
  )
}
