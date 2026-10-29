import type { CSSProperties, ReactNode } from "react"
import styles from "./bar-list.module.css"

/** One item: its value as the bar, an earlier value as a mark on the same track, and a change to write beside it. */
export interface BarListRow {
  id: string
  label: string
  value: number | null
  prior?: number | null
  change?: ReactNode
}

/** Where a value sits along the domain, 0 to 1, kept inside it. */
const shareOf = (value: number, [lo, hi]: readonly [number, number]): number =>
  Math.min(1, Math.max(0, (value - lo) / (hi - lo || 1)))

/* A compact list, two lines per item: its name, then its value, a thin bar
 * on a track over the domain every row shares, and its change at the right.
 * An earlier value sits on the track as a heartwood square turned on its
 * corner, the track carved away around it so it stands clear, as the split
 * bars draw their mark. The pointer over a row tells `onHover` its item, and
 * none when it leaves; with `focus` set to an item, the other rows step
 * back. */
export function BarList({
  rows,
  domain,
  format,
  focus = null,
  onHover,
}: {
  rows: readonly BarListRow[]
  domain: readonly [number, number]
  format: (value: number) => string
  focus?: string | null
  onHover?: (id: string | null) => void
}) {
  const hasPrior = (r: BarListRow): boolean =>
    r.prior !== null && r.prior !== undefined
  const priorAt = (r: BarListRow): number | undefined =>
    hasPrior(r) ? shareOf(r.prior ?? 0, domain) : undefined
  const summary = rows
    .map((r) => `${r.label}: ${r.value === null ? "-" : format(r.value)}`)
    .join("; ")

  return (
    <div
      data-slot="bar-list"
      className={styles.list}
      role="img"
      aria-label={summary}
      data-focus={focus !== null || undefined}
    >
      {rows.map((r) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: hover only; the summary on the root carries every row
        <div
          key={r.id}
          className={styles.row}
          data-focused={r.id === focus || undefined}
          onMouseEnter={() => onHover?.(r.id)}
          onMouseLeave={() => onHover?.(null)}
        >
          <span className={styles.label}>{r.label}</span>
          <span className={styles.value}>
            {r.value === null ? "-" : format(r.value)}
          </span>
          <span
            className={styles.lane}
            style={{ "--share": priorAt(r) } as CSSProperties}
          >
            <span className={styles.track} data-cut={hasPrior(r) || undefined}>
              {r.value !== null && (
                <i
                  className={styles.fill}
                  style={{ width: `${shareOf(r.value, domain) * 100}%` }}
                />
              )}
            </span>
            {hasPrior(r) && <i className={styles.prior} />}
          </span>
          <span className={styles.change}>{r.change}</span>
        </div>
      ))}
    </div>
  )
}
