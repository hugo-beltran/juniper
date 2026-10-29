import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear } from "@visx/scale"
import { Bar } from "@visx/shape"
import { useId } from "react"
import styles from "./split-bars.module.css"

/** One bar: a filled share of a whole, both on the scale every bar shares, and a mark at another share of it. */
export interface SplitBar {
  id: string
  label: string
  filled: number
  total: number
  /** A mark at this share of the bar's total: the earlier rate. */
  tick?: number | null
}

// the line over each bar, holding its label and its figures
const LINE = 18
// the surface showing between the filled share and the rest
const GAP = 2
const RADIUS = 2
// a filled share too small for the scale still shows as a sliver
const MIN = 2
// the mark keeps this much of the bar around it, and the surface carved around it is this wide
const INSET = 3
const HALO = 2

/* One horizontal bar per item over the whole width, on a scale they all
 * share, so a bar's length is its total and the filled part its share: the
 * filled part is a solid block from the left, the rest the track after a
 * gap, as the target bar draws its gap. On the line over each bar, its
 * label with the filled count over the total after it, and the share at the
 * right end. A tick is a rounded square turned on its corner inside the bar
 * at another share of its total, with the surface carved around it so it
 * stands apart, so the earlier rate sits on this one's bar. A bar names
 * itself on hover. Every edge is snapped to a whole pixel. */
export function SplitBars({
  bars,
  format,
  formatShare,
  height = 14,
  gap = 6,
}: {
  bars: readonly SplitBar[]
  format: (value: number) => string
  formatShare: (share: number) => string
  height?: number
  gap?: number
}) {
  const cut = useId()
  const { parentRef, width: measured } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const width = Math.floor(measured)
  const x = scaleLinear<number>({
    domain: [0, Math.max(1, ...bars.map((b) => b.total))],
    range: [0, width],
    clamp: true,
  })
  const px = (value: number) => Math.round(x(value))
  const share = (b: SplitBar) => (b.total > 0 ? b.filled / b.total : null)
  const name = (b: SplitBar) => {
    const rate = share(b)
    return `${b.label}: ${format(b.filled)} of ${format(b.total)}${
      rate === null ? "" : `, ${formatShare(rate)}`
    }`
  }
  const summary = bars.map(name).join(", ")
  // a row is the line and the bar under it
  const row = LINE + height
  const total = bars.length * (row + gap) - gap
  // the mark: a square whose diagonal fits the bar, turned on its corner
  const side = Math.round((height - 2 * INSET) / Math.SQRT2)
  const corner = Math.max(1, Math.round(side / 5))
  const markX = (b: SplitBar) =>
    b.tick === null || b.tick === undefined ? null : px(b.tick * b.total)
  const markY = (i: number) => i * (row + gap) + LINE + Math.round(height / 2)
  const square = (cx: number, cy: number, className: string) => (
    <rect
      className={className}
      x={-side / 2}
      y={-side / 2}
      width={side}
      height={side}
      rx={corner}
      strokeWidth={2 * HALO}
      transform={`translate(${cx} ${cy}) rotate(45)`}
    />
  )

  return (
    <div
      data-slot="split-bars"
      ref={parentRef}
      className={styles.root}
      role="img"
      aria-label={summary}
    >
      {width > 0 && bars.length > 0 && (
        <svg aria-hidden="true" width={width} height={total}>
          <defs>
            {/* The surface around each mark, cut out of the bars it crosses. */}
            <mask id={cut}>
              <rect x={0} y={0} width={width} height={total} fill="white" />
              {bars.map((b, i) => {
                const mx = markX(b)
                return mx === null ? null : (
                  <g key={b.id}>{square(mx, markY(i), styles.halo)}</g>
                )
              })}
            </mask>
          </defs>
          <g mask={`url(#${cut})`}>
            {bars.map((b, i) => {
              const filled = b.filled > 0 ? Math.max(MIN, px(b.filled)) : 0
              const end = px(b.total)
              const rest = end - filled - (filled ? GAP : 0)
              const rate = share(b)
              return (
                <Group key={b.id} top={i * (row + gap)} className={styles.bar}>
                  <title>{name(b)}</title>
                  <text
                    className={styles.label}
                    x={0}
                    y={LINE / 2}
                    dominantBaseline="middle"
                  >
                    {b.label}
                    <tspan className={styles.figures} dx={8}>
                      {format(b.filled)}/{format(b.total)}
                    </tspan>
                  </text>
                  <text
                    className={styles.rate}
                    x={width}
                    y={LINE / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {rate === null ? "-" : formatShare(rate)}
                  </text>
                  <Group top={LINE}>
                    {filled > 0 && (
                      <Bar
                        className={styles.filled}
                        x={0.5}
                        y={0.5}
                        width={filled - 1}
                        height={height - 1}
                        rx={RADIUS}
                      />
                    )}
                    {rest > 0 && (
                      <Bar
                        className={styles.rest}
                        x={filled + (filled ? GAP : 0) + 0.5}
                        y={0.5}
                        width={rest - 1}
                        height={height - 1}
                        rx={RADIUS}
                      />
                    )}
                  </Group>
                </Group>
              )
            })}
          </g>
          {bars.map((b, i) => {
            const mx = markX(b)
            return mx === null ? null : (
              <g key={b.id}>{square(mx, markY(i), styles.mark)}</g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
