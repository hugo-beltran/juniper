import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLog } from "@visx/scale"
import { Line } from "@visx/shape"
import { SPAN, SpanBracket } from "@/components/span-bracket/span-bracket"
import { cn } from "@/lib/cn"
import styles from "./box-plot.module.css"

/** One column's spread: the quartiles of its figures and the range, with how many figures there were. */
export interface Box {
  id: string
  label: string
  low: number
  q1: number
  median: number
  q3: number
  high: number
  count: number
  /** Drawn out of bounds: the column is context, not part of the selection. */
  muted?: boolean
}

const AXIS = 20
const AXIS_LEFT = 36
// room above the highest whisker and below the lowest
const HEADROOM = 6
const MAX_WIDTH = 18
// the pill behind a column's label while the pointer is on the column
const LABEL_PILL = { width: 32, height: 17, rx: 4 }
// the chip on a marker: its height, the room either side of its figure, and a mono character's advance
const CHIP = { height: 16, pad: 6, advance: 6 }

/* One box per column on a log scale, since figures spread over orders of
 * magnitude: the box runs from the first quartile to the third, the line
 * across it is the median, and the whiskers reach the lowest and highest
 * figure. A column with nothing in it shows its label alone. Muted columns
 * are drawn out of bounds. Gridlines at the powers of ten, labelled down the
 * left. A pill picks out the label of the column under the pointer; with
 * `focus` on a column, its highest and its lowest figure are marked by a
 * line across the plot and a rounded chip on the column naming the figure,
 * in the pill's colour. There is no tooltip: everything is on the plot. Each
 * column owns its band of the width for `onHover`. */
export function BoxPlot({
  boxes,
  className,
  format,
  formatTick = format,
  countLabel = "figures",
  height = 160,
  focus = null,
  onHover,
  span,
}: {
  boxes: readonly Box[]
  className?: string
  format: (value: number) => string
  formatTick?: (value: number) => string
  /** What a column's count counts, in the spoken summary: "12 games". */
  countLabel?: string
  height?: number
  focus?: string | null
  onHover?: (id: string | null) => void
  /** The selected span's name, drawn as a bracket over the columns in it; the room for it is added over the plot. */
  span?: string
}) {
  const { parentRef, width } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const inner = height - AXIS
  const filled = boxes.filter((b) => b.count > 0)
  const lows = filled.map((b) => b.low).filter((v) => v > 0)
  const highs = filled.map((b) => b.high)
  const x = scaleBand<string>({
    domain: boxes.map((b) => b.id),
    range: [AXIS_LEFT, width],
    paddingInner: 0.4,
    paddingOuter: 0.2,
  })
  const y = scaleLog<number>({
    domain: [lows.length ? Math.min(...lows) : 1, Math.max(10, ...highs)],
    range: [inner - HEADROOM, HEADROOM],
    nice: true,
  })
  // the powers of ten the scale spans
  const ticks = y.ticks().filter((t) => Number.isInteger(Math.log10(t)))
  const px = (value: number) => Math.round(y(Math.max(value, 1)))
  const name = (b: Box) =>
    b.count
      ? `${b.label}: ${b.count} ${countLabel}, ${format(b.low)} to ${format(b.high)}, median ${format(b.median)}`
      : `${b.label}: none`
  const summary = boxes.map(name).join(", ")
  const focused = focus === null ? -1 : boxes.findIndex((b) => b.id === focus)
  const isMuted = (b: Box) => (focused < 0 ? b.muted : b.id !== focus)
  // a column's band: its step less the padding, shared out either side
  const step = x.step()
  const bandStart = (id: string) =>
    Math.round((x(id) ?? 0) - (step - x.bandwidth()) / 2)
  const centreOf = (id: string) => Math.round((x(id) ?? 0) + x.bandwidth() / 2)
  // the extremes marked: the focused column's own, while there is one with figures
  const marked = focused < 0 ? undefined : boxes[focused]
  const extremes =
    marked && marked.count > 0
      ? [
          { id: "high", value: marked.high },
          { id: "low", value: marked.low },
        ]
      : []
  // the chips are centred on their lines, unless the lines are too close for both; then each steps clear
  const [highY, lowY] = extremes.map((e) => px(e.value))
  const crowded =
    highY !== undefined && lowY !== undefined
      ? Math.max(0, CHIP.height + 2 - (lowY - highY))
      : 0
  const chipY = (id: string, lineY: number) =>
    lineY + (id === "high" ? -crowded / 2 : crowded / 2)

  // the bracket over the selection's columns, when the span is named: from the first live column to the last
  const live = boxes.findIndex((b) => !b.muted)
  const lastLive = boxes.findLastIndex((b) => !b.muted)
  const top = span ? SPAN : 0
  const bracket =
    span && live >= 0 ? (
      <SpanBracket
        x0={x(boxes[live]?.id ?? "") ?? 0}
        x1={(x(boxes[lastLive]?.id ?? "") ?? 0) + x.bandwidth()}
        label={span}
      />
    ) : null

  return (
    <div
      data-slot="box-plot"
      ref={parentRef}
      className={cn(styles.root, className)}
      role="img"
      aria-label={summary}
    >
      {width > 0 && (
        <svg
          aria-hidden="true"
          width={width}
          height={height + top}
          onMouseLeave={() => onHover?.(null)}
        >
          {bracket}
          <Group top={top}>
            {ticks.map((v) => (
              <Group key={v} className={styles.tick}>
                <Line
                  from={{ x: AXIS_LEFT, y: y(v) }}
                  to={{ x: width, y: y(v) }}
                />
                <text
                  x={AXIS_LEFT - 6}
                  y={y(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(v)}
                </text>
              </Group>
            ))}
            {extremes.map((e) => {
              const lineY = px(e.value) + 0.5
              return (
                <Group key={e.id} className={styles.marker}>
                  <Line
                    from={{ x: AXIS_LEFT, y: lineY }}
                    to={{ x: width, y: lineY }}
                  />
                </Group>
              )
            })}
            {boxes.map((b) => {
              const centre = centreOf(b.id)
              const w = Math.min(MAX_WIDTH, Math.round(x.bandwidth()))
              return (
                <Group
                  key={b.id}
                  className={styles.column}
                  data-muted={isMuted(b) || undefined}
                  onMouseEnter={() => onHover?.(b.id)}
                >
                  {/* Over the column's band, so the pointer is always over some column. */}
                  <rect
                    className={styles.hit}
                    x={bandStart(b.id)}
                    y={0}
                    width={Math.round(step)}
                    height={height}
                  />
                  <rect
                    className={styles.wash}
                    x={bandStart(b.id)}
                    y={0}
                    width={Math.round(step)}
                    height={inner}
                  />
                  {b.count > 0 && (
                    <>
                      <Line
                        className={styles.whisker}
                        from={{ x: centre + 0.5, y: px(b.high) }}
                        to={{ x: centre + 0.5, y: px(b.low) }}
                      />
                      <rect
                        className={styles.box}
                        x={centre - Math.floor(w / 2) + 0.5}
                        y={px(b.q3) + 0.5}
                        width={w - 1}
                        height={Math.max(1, px(b.q1) - px(b.q3) - 1)}
                        rx={1.5}
                      />
                      <Line
                        className={styles.median}
                        from={{
                          x: centre - Math.floor(w / 2),
                          y: px(b.median) + 0.5,
                        }}
                        to={{
                          x: centre + Math.ceil(w / 2),
                          y: px(b.median) + 0.5,
                        }}
                      />
                    </>
                  )}
                  <rect
                    className={styles.pill}
                    x={centre - LABEL_PILL.width / 2}
                    y={inner + 1.5}
                    {...LABEL_PILL}
                  />
                  <text
                    className={styles.label}
                    x={centre}
                    y={inner + 14}
                    textAnchor="middle"
                  >
                    {b.label}
                  </text>
                </Group>
              )
            })}
            {marked &&
              extremes.map((e) => {
                const text = format(e.value)
                const chipWidth = Math.round(
                  text.length * CHIP.advance + 2 * CHIP.pad,
                )
                const centre = Math.round(chipY(e.id, px(e.value)))
                const left = centreOf(marked.id) - chipWidth / 2
                return (
                  <Group key={e.id} className={styles.marker}>
                    <rect
                      className={styles.chip}
                      x={left}
                      y={centre - CHIP.height / 2}
                      width={chipWidth}
                      height={CHIP.height}
                      rx={CHIP.height / 2}
                    />
                    <text
                      x={left + chipWidth / 2}
                      y={centre}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {text}
                    </text>
                  </Group>
                )
              })}
          </Group>
        </svg>
      )}
    </div>
  )
}
