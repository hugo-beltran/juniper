import type { CSSProperties, ReactNode } from "react"
import { Swatch } from "@/components/swatch/swatch"
import styles from "./butterfly.module.css"

/** One side of the contest: its name and the colour its bars wear. */
export interface ButterflySide {
  label: string
  color: string
}

/** One measure: each side's figure, how the figures are written, and each side's change to write under its figure. */
export interface ButterflyRow {
  id: string
  label: string
  left: number | null
  right: number | null
  format: (value: number) => string
  leftChange?: ReactNode
  rightChange?: ReactNode
  /** Each side's earlier figure, marked on its half of the row. */
  leftPrior?: number | null
  rightPrior?: number | null
}

/** A figure's share of the row's largest, 0 to 1: a bar's width on its side, or where a mark sits along it. */
const shareOf = (value: number, top: number): number =>
  top <= 0 ? 0 : Math.max(0, Math.min(1, value / top))

/** One half of a row: its bar growing out from the middle and, with an earlier figure, a mark carved into it. */
function Half({
  side,
  value,
  prior,
  top,
}: {
  side: "left" | "right"
  value: number | null
  prior?: number | null
  top: number
}) {
  const marked = prior !== null && prior !== undefined
  return (
    <span
      className={styles.lane}
      data-side={side}
      style={
        (marked ? { "--share": shareOf(prior, top) } : {}) as CSSProperties
      }
    >
      <span
        className={styles.track}
        data-side={side}
        data-cut={marked || undefined}
      >
        <i
          style={{
            width: `${value === null ? 0 : shareOf(value, top) * 100}%`,
          }}
        />
      </span>
      {marked && <i className={styles.prior} data-side={side} />}
    </span>
  )
}

/* Two sides compared measure by measure: the sides named at the top in their
 * colours, then per measure its name on a line of its own, the left side's
 * bar growing left from the middle and the right side's growing right, both
 * on the row's own scale, so a row's two bars compare however unlike the
 * measures are; an earlier figure as a heartwood square turned on its corner
 * on its side, the bar carved away around it as the split bars draw their
 * mark; under each bar, at the outer edge, its figure, the larger of the two
 * in bold and its side's colour, with its change under it. */
export function Butterfly({
  rows,
  left,
  right,
  priorLabel,
}: {
  rows: readonly ButterflyRow[]
  left: ButterflySide
  right: ButterflySide
  /** What the earlier figures are, named between the sides with the mark they wear. */
  priorLabel?: string
}) {
  const summary = rows
    .map(
      (r) =>
        `${r.label}: ${left.label} ${r.left === null ? "-" : r.format(r.left)}, ${right.label} ${
          r.right === null ? "-" : r.format(r.right)
        }`,
    )
    .join("; ")

  return (
    <div
      data-slot="butterfly"
      className={styles.root}
      role="img"
      aria-label={summary}
      style={{ "--left": left.color, "--right": right.color } as CSSProperties}
    >
      <div className={styles.sides}>
        <span className={styles.left}>
          <Swatch fill={left.color} />
          {left.label}
        </span>
        {priorLabel && (
          <span className={styles.key}>
            <i className={styles.keyMark} />
            {priorLabel}
          </span>
        )}
        <span className={styles.right}>
          {right.label}
          <Swatch fill={right.color} />
        </span>
      </div>
      {rows.map((r) => {
        // the row's scale reaches its largest figure, this season's or the earlier one's, so every mark sits inside
        const top = Math.max(
          r.left ?? 0,
          r.right ?? 0,
          r.leftPrior ?? 0,
          r.rightPrior ?? 0,
        )
        const leads =
          r.left !== null && r.right !== null && r.left !== r.right
            ? r.left > r.right
              ? "left"
              : "right"
            : null
        return (
          <div key={r.id} className={styles.row}>
            <span className={styles.label}>{r.label}</span>
            <Half side="left" value={r.left} prior={r.leftPrior} top={top} />
            <Half side="right" value={r.right} prior={r.rightPrior} top={top} />
            <span className={styles.foot} data-side="left">
              <span
                className={styles.figure}
                data-side="left"
                data-leads={leads === "left" || undefined}
              >
                {r.left === null ? "-" : r.format(r.left)}
              </span>
              {r.leftChange}
            </span>
            <span className={styles.foot} data-side="right">
              <span
                className={styles.figure}
                data-side="right"
                data-leads={leads === "right" || undefined}
              >
                {r.right === null ? "-" : r.format(r.right)}
              </span>
              {r.rightChange}
            </span>
          </div>
        )
      })}
    </div>
  )
}
