import type { CSSProperties } from "react"
import styles from "./heat-grid.module.css"

export interface HeatRow {
  id: string
  label: string
  /** Set apart under the others, in bold: a total. */
  emphasis?: boolean
  /** The row's own way of writing its values, where the rows are different measures. */
  format?: (value: number) => string
}

export interface HeatColumn {
  id: string
  label: string
  /** Drawn in the out-of-bounds hue: the column is context, not part of the selection. */
  muted?: boolean
}

// the lightness an out-of-bounds cell runs between, lightest for the lowest value
const LIGHT = 90
const DARK = 46
// how many steps the ramp under the grid shows
const RAMP = 6

/** Where a value sits in the domain, 0 to 1. */
const share = (value: number, [lo, hi]: readonly [number, number]) =>
  hi > lo ? Math.min(1, Math.max(0, (value - lo) / (hi - lo))) : 0.5

/** A colour part of the way from one token to another, mixed in oklch. */
const mix = (from: string, to: string, part: number): string =>
  `color-mix(in oklch, var(${from}), var(${to}) ${Math.round(part * 100)}%)`

/**
 * A cell's fill at a share of the domain: from the heat ramp's low through
 * its medium to its high, the medium at the middle; or the out-of-bounds
 * hue, lighter to darker.
 */
const fillAt = (t: number, muted: boolean): string => {
  if (muted)
    return `oklch(from var(--juni-needle-out-of-bounds) ${LIGHT - t * (LIGHT - DARK)}% c h)`
  return t <= 0.5
    ? mix("--juni-needle-heatmap-low", "--juni-needle-heatmap-medium", t * 2)
    : mix(
        "--juni-needle-heatmap-medium",
        "--juni-needle-heatmap-high",
        (t - 0.5) * 2,
      )
}

/** The text over a fill: light from the middle of the ramp, where the fill is needle or deeper, needle-900 before. */
const inkAt = (t: number): string =>
  t >= 0.5 ? "var(--juni-bark-50)" : "var(--juni-needle-900)"

/* One cell per row and column, its fill darker with its value on one hue,
 * the value written in it, so a table of rates reads at a glance and in
 * detail at once. The domain is the values' own range unless given; with
 * `scale` set to `row`, each row is shaded over its own range, so rows that
 * are different measures can share a grid. Muted columns take the
 * out-of-bounds hue at the same lightness, so context keeps its shape
 * without the selection's colour. The pointer over a cell tells `onHover`
 * its column, and none when it leaves; with `focus` set to a column, every
 * other column fades. Under the grid, the ramp from lightest to darkest with
 * its ends named. */
export function HeatGrid({
  rows,
  columns,
  value,
  domain,
  scale = "grid",
  format,
  className,
  focus = null,
  onHover,
  span,
}: {
  rows: readonly HeatRow[]
  columns: readonly HeatColumn[]
  value: (row: string, column: string) => number | null
  domain?: readonly [number, number]
  /** One ramp over the whole grid, or one per row. */
  scale?: "grid" | "row"
  format: (value: number) => string
  className?: string
  focus?: string | null
  onHover?: (id: string | null) => void
  /** The selected span's name, drawn as a bracket over the columns in it, in a row over the grid. */
  span?: string
}) {
  const isNumber = (v: number | null): v is number => v !== null
  const rowValues = (r: HeatRow) =>
    columns.map((c) => value(r.id, c.id)).filter(isNumber)
  const values = rows.flatMap(rowValues)
  const extent = (vs: number[]): readonly [number, number] => [
    Math.min(...vs),
    Math.max(...vs),
  ]
  const range: readonly [number, number] = domain ?? extent(values)
  /** The range a row is shaded over: its own, or the grid's. */
  const rangeOf = (r: HeatRow) =>
    scale === "row" ? extent(rowValues(r)) : range
  const formatOf = (r: HeatRow) => r.format ?? format
  // the bracket over the selection's columns, when the span is named: from the first live column to the last
  const live = columns.findIndex((c) => !c.muted)
  const lastLive = columns.findLastIndex((c) => !c.muted)
  const summary = rows
    .map((r) => {
      const cells = columns
        .map((c) => {
          const v = value(r.id, c.id)
          return `${c.label} ${v === null ? "-" : formatOf(r)(v)}`
        })
        .join(", ")
      return `${r.label}: ${cells}`
    })
    .join("; ")

  return (
    <div
      data-slot="heat-grid"
      role="img"
      aria-label={summary}
      className={className}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover only; the summary on the root carries every cell */}
      <div
        role="presentation"
        className={styles.root}
        style={{ "--columns": columns.length } as CSSProperties}
        data-focus={focus !== null || undefined}
        onMouseLeave={() => onHover?.(null)}
      >
        {span && live >= 0 && (
          <>
            <span />
            <div className={styles.span}>
              <i
                data-label={span}
                style={{
                  left: `${(live / columns.length) * 100}%`,
                  width: `${((lastLive - live + 1) / columns.length) * 100}%`,
                }}
              />
            </div>
          </>
        )}
        <span />
        {columns.map((c) => (
          <div
            key={c.id}
            className={styles.head}
            data-muted={c.muted || undefined}
            data-focused={c.id === focus || undefined}
          >
            {c.label}
          </div>
        ))}
        {rows.map((r) => (
          <div key={r.id} className={styles.line}>
            <div
              className={styles.label}
              data-emphasis={r.emphasis || undefined}
            >
              {r.label}
            </div>
            {columns.map((c) => {
              const v = value(r.id, c.id)
              const t = v === null ? 0 : share(v, rangeOf(r))
              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: hover only; the summary on the root carries every cell
                <div
                  key={c.id}
                  role="presentation"
                  className={styles.cell}
                  data-emphasis={r.emphasis || undefined}
                  data-empty={v === null || undefined}
                  data-focused={c.id === focus || undefined}
                  style={
                    {
                      "--fill": fillAt(t, !!c.muted),
                      "--ink": inkAt(t),
                    } as CSSProperties
                  }
                  onMouseEnter={() => onHover?.(c.id)}
                >
                  {v === null ? "-" : formatOf(r)(v)}
                </div>
              )
            })}
          </div>
        ))}
        {values.length > 0 && (
          <div className={styles.scale}>
            <span>{scale === "row" ? "each row's low" : format(range[0])}</span>
            <span className={styles.ramp}>
              {Array.from({ length: RAMP }, (_, i) => (
                <i
                  // biome-ignore lint/suspicious/noArrayIndexKey: the ramp's steps are positions, nothing else
                  key={i}
                  style={
                    { "--fill": fillAt(i / (RAMP - 1), false) } as CSSProperties
                  }
                />
              ))}
            </span>
            <span>{scale === "row" ? "high" : format(range[1])}</span>
          </div>
        )}
      </div>
    </div>
  )
}
