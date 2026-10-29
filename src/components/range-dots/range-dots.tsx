import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear } from "@visx/scale"
import { Line } from "@visx/shape"
import { useId } from "react"
import styles from "./range-dots.module.css"

/** One value of a row: a game or a month, muted when it is context rather than part of the selection. */
export interface RangeValue {
  id: string
  value: number | null
  muted?: boolean
}

/** One row: its values as dots, the selection's own figure as a bar, and the earlier figure as a ring. */
export interface RangeRow {
  id: string
  label: string
  values: readonly RangeValue[]
  mark: number | null
  prior: number | null
}

// the label's column on the left and the figure's on the right
const LABEL = 84
const FIGURE = 56
// a row's height, the dots' radius, the bar's half height and the ring's radius
const ROW = 40
const DOT = 3.5
const TICK = 9
// the selection's bar: its width, its corner, and the surface carved around it
const BAR = 4
const BAR_RADIUS = 1.5
const HALO = 2
const RING = 4.5
// under the rows, the axis's labels
const AXIS = 18

const present = (v: number | null): v is number => v !== null

/* One row per item over a shared scale: its values as dots, the run between
 * the lowest and the highest as a faint band, so the level and the spread
 * read together; the selection's own figure as a bar across the row, the
 * surface carved around it so it stands clear of the dots and the band
 * under it; the earlier figure as a ring, and the figure written at the
 * row's end. Muted values take the out-of-bounds hue, so context keeps its
 * place without the selection's colour. The scale starts at zero and ends
 * on a round tick; gridlines at its ticks, labelled under the rows. The
 * pointer over a row tells `onHover` its id, and none when it leaves the
 * chart; the others step back from the hovered or focused row. */
export function RangeDots({
  rows,
  format,
  formatTick = format,
  priorLabel = "before",
  focus = null,
  onHover,
  rowHeight = ROW,
}: {
  rows: readonly RangeRow[]
  format: (value: number) => string
  formatTick?: (value: number) => string
  /** What the ring stands for, in the spoken summary. */
  priorLabel?: string
  focus?: string | null
  onHover?: (id: string | null) => void
  /** Each row's height; the marks keep their size. */
  rowHeight?: number
}) {
  const cut = useId()
  const { parentRef, width: measured } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const width = Math.floor(measured)
  const height = rows.length * rowHeight + AXIS
  const all = rows
    .flatMap((r) => [...r.values.map((v) => v.value), r.mark, r.prior])
    .filter(present)
  const x = scaleLinear<number>({
    domain: [0, Math.max(1, ...all)],
    range: [LABEL, width - FIGURE],
    nice: true,
  })
  const ticks = x.ticks(4)
  const bottom = rows.length * rowHeight
  const middle = (i: number) => i * rowHeight + rowHeight / 2
  /** The selection's bar on a row, grown on every side by `grow`: the bar itself, or the cut around it. */
  const bar = (r: RangeRow, i: number, className: string, grow = 0) =>
    r.mark === null ? null : (
      <rect
        key={r.id}
        className={className}
        x={x(r.mark) - BAR / 2 - grow}
        y={middle(i) - TICK - grow}
        width={BAR + 2 * grow}
        height={2 * TICK + 2 * grow}
        rx={BAR_RADIUS + grow}
      />
    )
  const summary = rows
    .map(
      (r) =>
        `${r.label}: ${r.mark === null ? "-" : format(r.mark)}, ${priorLabel} ${
          r.prior === null ? "-" : format(r.prior)
        }`,
    )
    .join("; ")

  return (
    <div
      data-slot="range-dots"
      ref={parentRef}
      className={styles.root}
      role="img"
      aria-label={summary}
      data-focus={focus !== null || undefined}
    >
      {width > 0 && (
        <svg
          aria-hidden="true"
          width={width}
          height={height}
          onMouseLeave={() => onHover?.(null)}
        >
          <defs>
            {/* The surface around each bar, cut out of the band, the dots and the ring it crosses. */}
            <mask id={cut}>
              <rect x={0} y={0} width={width} height={height} fill="white" />
              {rows.map((r, i) => bar(r, i, styles.halo, HALO))}
            </mask>
          </defs>
          {ticks.map((v) => (
            <Group
              key={v}
              className={styles.tick}
              data-zero={v === 0 || undefined}
            >
              <Line from={{ x: x(v), y: 0 }} to={{ x: x(v), y: bottom }} />
              <text x={x(v)} y={bottom + 12} textAnchor="middle">
                {formatTick(v)}
              </text>
            </Group>
          ))}
          {rows.map((r, i) => {
            const y = middle(i)
            const values = r.values.map((v) => v.value).filter(present)
            return (
              <Group
                key={r.id}
                className={styles.row}
                data-focused={r.id === focus || undefined}
                onMouseEnter={() => onHover?.(r.id)}
              >
                {/* Over the whole row, so the pointer anywhere on it picks it out. */}
                <rect
                  className={styles.hit}
                  x={0}
                  y={i * rowHeight}
                  width={width}
                  height={rowHeight}
                />
                <text
                  className={styles.label}
                  x={0}
                  y={y}
                  dominantBaseline="middle"
                >
                  {r.label}
                </text>
                <g mask={`url(#${cut})`}>
                  {values.length > 1 && (
                    <Line
                      className={styles.band}
                      from={{ x: x(Math.min(...values)), y }}
                      to={{ x: x(Math.max(...values)), y }}
                    />
                  )}
                  {r.values.map((v) =>
                    v.value === null ? null : (
                      <circle
                        key={v.id}
                        className={styles.dot}
                        data-muted={v.muted || undefined}
                        cx={x(v.value)}
                        cy={y}
                        r={DOT}
                      />
                    ),
                  )}
                  {r.prior !== null && (
                    <circle
                      className={styles.prior}
                      cx={x(r.prior)}
                      cy={y}
                      r={RING}
                    />
                  )}
                </g>
                {bar(r, i, styles.mark)}
                <text
                  className={styles.figure}
                  x={width}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {r.mark === null ? "-" : format(r.mark)}
                </text>
              </Group>
            )
          })}
        </svg>
      )}
    </div>
  )
}
