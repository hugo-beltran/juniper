import { curveMonotoneX } from "@visx/curve"
import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear, scalePoint } from "@visx/scale"
import { AreaStack, Line, LinePath } from "@visx/shape"
import { useId } from "react"
import { SPAN, SpanBracket } from "@/components/span-bracket/span-bracket"
import styles from "./stacked-area.module.css"

/** One series of the stack, in the order they pile up from the baseline; coloured by that order. */
export interface AreaBand {
  id: string
  label: string
}

/** One point along the x axis: a value per band. */
export interface AreaPoint {
  id: string
  label: string
  values: Record<string, number>
  /** Drawn out of bounds: the point is context, not part of the selection. */
  muted?: boolean
}

const AXIS = 20
const AXIS_LEFT = 36
const HEIGHT = 160
// room above the tallest stack
const HEADROOM = 10
// how far past the first and last points the areas run, as a share of the step between points
const BLEED = 0.3
// the surface showing between one band and the next
const GAP = 2
// the pill behind a point's label while the pointer is on the point
const PILL = { width: 32, height: 17, rx: 4 }
const LEAD = "lead"
const TAIL = "tail"

const sumOf = (values: Record<string, number>) =>
  Object.values(values).reduce((a, b) => a + b, 0)

/* The bands stacked from the baseline, one area each, so a point's height
 * is its total and every band's share of it reads along the way. The edges
 * are eased between points, monotone so they never overshoot a value, and
 * run flat a little past the first and last points. Muted points are drawn
 * out of bounds: each band is laid down twice, greyed along the whole window
 * and in colour from the first unmuted point's half of the step before it,
 * so the selection stands out of its context. Each point owns the half step
 * either side of it: an invisible bar there tells `onHover` which point the
 * pointer is over, and none when it leaves; with `focus` set to a point,
 * that point's half steps are the selection instead, and every other point
 * is muted. The legend beside the chart carries the colours; each point's
 * label sits under the axis. Gridlines at the scale's own ticks, labelled
 * down the left. */
export function StackedArea({
  bands,
  points,
  format,
  formatTick = format,
  height = HEIGHT,
  focus = null,
  onHover,
  span,
}: {
  bands: readonly AreaBand[]
  points: readonly AreaPoint[]
  format: (value: number) => string
  formatTick?: (value: number) => string
  height?: number
  /** A point to draw as the selection on its own: it alone in colour, every other point muted. */
  focus?: string | null
  onHover?: (id: string | null) => void
  /** The selected span's name, drawn as a bracket over the points in it; the room for it is added over the plot. */
  span?: string
}) {
  const clip = useId()
  const gaps = useId()
  const { parentRef, width } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const inner = height - AXIS
  const totals = points.map((p) => sumOf(p.values))
  const keys = bands.map((b) => b.id)
  const live = points.findIndex((p) => !p.muted)
  const first = points[0]
  const end = points[points.length - 1]

  const x = scalePoint<string>({
    domain: points.map((p) => p.id),
    range: [AXIS_LEFT, width],
    padding: 0.5,
  })
  const y = scaleLinear<number>({
    domain: [0, Math.max(0, ...totals)],
    range: [inner, HEADROOM],
    nice: true,
  })
  const ticks = y.ticks(4)
  const at = (i: number) => x(points[i]?.id ?? "") ?? width
  // the edge between two neighbours; the chart's own edges beyond the first and last
  const mid = (i: number) =>
    i < 0 ? AXIS_LEFT : i >= points.length - 1 ? width : (at(i) + at(i + 1)) / 2
  const bleed = x.step() * BLEED
  // the points with a flat copy of the first and last beyond them, where the areas run on to
  const px: Record<string, number> = {
    [LEAD]: at(0) - bleed,
    [TAIL]: at(points.length - 1) + bleed,
  }
  const stacked =
    first && end
      ? [{ ...first, id: LEAD }, ...points, { ...end, id: TAIL }]
      : []
  // a point owns half a step either side, so the colour starts midway between the last muted point and the first live one
  const from = live < 0 ? width : live === 0 ? AXIS_LEFT : mid(live - 1)
  // the stretch in colour: the focused point's own half steps, or the unmuted points to the end
  const focused = focus === null ? -1 : points.findIndex((p) => p.id === focus)
  const [start, stop] =
    focused < 0 ? [from, width] : [mid(focused - 1), mid(focused)]
  const isMuted = (p: AreaPoint) => (focused < 0 ? p.muted : p.id !== focus)
  const summary = points
    .map((p, i) => `${p.label} ${format(totals[i] ?? 0)}`)
    .join(", ")
  // a stacked point's place: along by its point (or its copy beyond the ends), up by the top of its band
  const xOf = (d: { data: AreaPoint }) => px[d.data.id] ?? x(d.data.id) ?? 0
  const topOf = (d: { 1: number }) => y(d[1])

  // the bracket over the selection's points, when the span is named: from the first live point to the last
  const lastLive = points.findLastIndex((p) => !p.muted)
  const top = span ? SPAN : 0
  const bracket =
    span && live >= 0 ? (
      <SpanBracket
        x0={Math.max(AXIS_LEFT, at(live) - x.step() * 0.45)}
        x1={Math.min(width, at(lastLive) + x.step() * 0.45)}
        label={span}
      />
    ) : null

  return (
    <div
      data-slot="stacked-area"
      ref={parentRef}
      className={styles.root}
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
            <defs>
              <clipPath id={clip}>
                <rect
                  x={start}
                  y={0}
                  width={Math.max(0, stop - start)}
                  height={inner}
                />
              </clipPath>
            </defs>
            {ticks.map((v) => (
              <Group
                key={v}
                className={styles.tick}
                data-zero={v === 0 || undefined}
              >
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
            <AreaStack<AreaPoint, string>
              data={stacked}
              keys={keys}
              value={(p, key) => p.values[key] ?? 0}
              x={xOf}
              y0={(d) => y(d[0])}
              y1={topOf}
              curve={curveMonotoneX}
            >
              {({ stacks, path }) => (
                <>
                  {/* The bands' shared edges, carved out of the whole group, so the surface shows between them. */}
                  <defs>
                    <mask id={gaps}>
                      <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill="white"
                      />
                      {stacks.slice(0, -1).map((stack) => (
                        <LinePath
                          key={stack.key}
                          className={styles.gap}
                          data={stack}
                          x={xOf}
                          y={topOf}
                          curve={curveMonotoneX}
                          strokeWidth={GAP}
                        />
                      ))}
                    </mask>
                  </defs>
                  <Group mask={`url(#${gaps})`}>
                    {stacks.map((stack, i) => {
                      const d = path(stack) ?? ""
                      return (
                        <Group
                          key={stack.key}
                          className={styles.band}
                          data-band={i}
                        >
                          <path className={styles.muted} d={d} />
                          <path
                            className={styles.live}
                            d={d}
                            clipPath={`url(#${clip})`}
                          />
                        </Group>
                      )
                    })}
                  </Group>
                </>
              )}
            </AreaStack>
            {points.map((p, i) => (
              <Group
                key={p.id}
                className={styles.point}
                data-muted={isMuted(p) || undefined}
                onMouseEnter={() => onHover?.(p.id)}
              >
                {/* Over the areas and the label, the point's half steps, so the pointer is always over some point. */}
                <rect
                  className={styles.hit}
                  x={mid(i - 1)}
                  y={0}
                  width={mid(i) - mid(i - 1)}
                  height={height}
                />
                <rect
                  className={styles.wash}
                  x={mid(i - 1)}
                  y={0}
                  width={mid(i) - mid(i - 1)}
                  height={inner}
                />
                <rect
                  className={styles.pill}
                  x={at(i) - PILL.width / 2}
                  y={inner + 1.5}
                  {...PILL}
                />
                <text
                  className={styles.label}
                  x={at(i)}
                  y={inner + 14}
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              </Group>
            ))}
          </Group>
        </svg>
      )}
    </div>
  )
}
