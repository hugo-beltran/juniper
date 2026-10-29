import { curveMonotoneX } from "@visx/curve"
import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear, scalePoint } from "@visx/scale"
import { AreaClosed, Line, LinePath } from "@visx/shape"
import { useId } from "react"
import { SPAN, SpanBracket } from "@/components/span-bracket/span-bracket"
import type {
  AreaBand,
  AreaPoint,
} from "@/components/stacked-area/stacked-area"
import styles from "./area-line.module.css"

const AXIS = 20
const AXIS_LEFT = 36
// room at the right for the line's own labels, when it has its own scale
const AXIS_RIGHT = 44
const HEIGHT = 160
// room above the highest point
const HEADROOM = 10
// how far past the first and last points the area and the line run, as a share of the step between points
const BLEED = 0.3
// the line's stroke, and the surface carved out of the area either side of it where the two overlap
const STROKE = 2
const HALO = 2
// the pill behind a point's label while the pointer is on the point
const PILL = { width: 32, height: 17, rx: 4 }
const LEAD = "lead"
const TAIL = "tail"

/* One series as an area from the baseline and, when there is one, another
 * as a line over it, both on one scale, so the two read against each other:
 * runs scored over runs allowed; or, with `lineScale` set to `own`, the
 * line on a scale of its own labelled down the right, so a rate can run
 * over a count. Where the line crosses the area, the area is carved away
 * either side of it, so the line stays readable over its own colour. The
 * edges are eased between points, monotone so they never overshoot a value,
 * and run flat a little past the first and last points. Muted points are
 * drawn out of bounds: the area and the line are each laid down twice,
 * greyed along the whole window and in colour from the first unmuted
 * point's half of the step before it. Each point owns the half step either
 * side of it for `onHover`; with `focus` set to a point, that point's half
 * steps are the selection instead. The legend is the caller's; each point's
 * label sits under the axis. Gridlines at the scale's own ticks, labelled
 * down the left. */
export function AreaLine({
  area,
  line,
  lineScale = "shared",
  points,
  format,
  formatTick = format,
  formatLine = formatTick,
  height = HEIGHT,
  focus = null,
  onHover,
  span,
}: {
  area: AreaBand
  line?: AreaBand
  /** Whether the line shares the area's scale, or has its own, labelled down the right. */
  lineScale?: "shared" | "own"
  points: readonly AreaPoint[]
  format: (value: number) => string
  formatTick?: (value: number) => string
  /** The line's own labels, when it has its own scale; and its figures in the summary. */
  formatLine?: (value: number) => string
  height?: number
  /** A point to draw as the selection on its own: it alone in colour, every other point muted. */
  focus?: string | null
  onHover?: (id: string | null) => void
  /** The selected span's name, drawn as a bracket over the points in it; the room for it is added over the plot. */
  span?: string
}) {
  const clip = useId()
  const carve = useId()
  const { parentRef, width } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const inner = height - AXIS
  const own = line !== undefined && lineScale === "own"
  // the plot's right edge: the width, less the room for the line's own labels
  const right = own ? width - AXIS_RIGHT : width
  const readKey =
    (key: string) =>
    (p: AreaPoint): number =>
      p.values[key] ?? 0
  const peak = (keys: string[]) =>
    Math.max(1, ...points.flatMap((p) => keys.map((k) => readKey(k)(p))))
  const top = peak(own || !line ? [area.id] : [area.id, line.id])
  const live = points.findIndex((p) => !p.muted)
  const first = points[0]
  const end = points[points.length - 1]

  const x = scalePoint<string>({
    domain: points.map((p) => p.id),
    range: [AXIS_LEFT, right],
    padding: 0.5,
  })
  const y = scaleLinear<number>({
    domain: [0, top],
    range: [inner, HEADROOM],
    nice: true,
  })
  // the line's scale: the area's, or its own over its own peak
  const y2 =
    own && line
      ? scaleLinear<number>({
          domain: [0, peak([line.id])],
          range: [inner, HEADROOM],
          nice: true,
        })
      : y
  const ticks = y.ticks(4)
  const at = (i: number) => x(points[i]?.id ?? "") ?? right
  // the edge between two neighbours; the chart's own edges beyond the first and last
  const mid = (i: number) =>
    i < 0 ? AXIS_LEFT : i >= points.length - 1 ? right : (at(i) + at(i + 1)) / 2
  const bleed = x.step() * BLEED
  // the points with a flat copy of the first and last beyond them, where the area and the line run on to
  const px: Record<string, number> = {
    [LEAD]: at(0) - bleed,
    [TAIL]: at(points.length - 1) + bleed,
  }
  const extended: AreaPoint[] =
    first && end
      ? [{ ...first, id: LEAD }, ...points, { ...end, id: TAIL }]
      : []
  // a point owns half a step either side, so the colour starts midway between the last muted point and the first live one
  const from = live < 0 ? right : live === 0 ? AXIS_LEFT : mid(live - 1)
  // the stretch in colour: the focused point's own half steps, or the unmuted points to the end
  const focused = focus === null ? -1 : points.findIndex((p) => p.id === focus)
  const [start, stop] =
    focused < 0 ? [from, right] : [mid(focused - 1), mid(focused)]
  const isMuted = (p: AreaPoint) => (focused < 0 ? p.muted : p.id !== focus)
  const summary = points
    .map(
      (p) =>
        `${p.label} ${area.label} ${format(readKey(area.id)(p))}${
          line
            ? `, ${line.label} ${(own ? formatLine : format)(readKey(line.id)(p))}`
            : ""
        }`,
    )
    .join(", ")
  const xOf = (p: AreaPoint) => px[p.id] ?? x(p.id) ?? 0
  const yOf = (key: string) => (p: AreaPoint) => y(readKey(key)(p))
  const yLine = line ? (p: AreaPoint) => y2(readKey(line.id)(p)) : yOf(area.id)

  // the bracket over the selection's points, when the span is named: from the first live point to the last
  const lastLive = points.findLastIndex((p) => !p.muted)
  const room = span ? SPAN : 0
  const bracket =
    span && live >= 0 ? (
      <SpanBracket
        x0={Math.max(AXIS_LEFT, at(live) - x.step() * 0.45)}
        x1={Math.min(right, at(lastLive) + x.step() * 0.45)}
        label={span}
      />
    ) : null

  return (
    <div
      data-slot="area-line"
      ref={parentRef}
      className={styles.root}
      role="img"
      aria-label={summary}
    >
      {width > 0 && (
        <svg
          aria-hidden="true"
          width={width}
          height={height + room}
          onMouseLeave={() => onHover?.(null)}
        >
          {bracket}
          <Group top={room}>
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
                  to={{ x: right, y: y(v) }}
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
            {/* The line's own labels, flush with the right edge, with no gridlines of their own. */}
            {own &&
              y2.ticks(4).map((v) => (
                <Group key={v} className={styles.tick}>
                  <text
                    x={width}
                    y={y2(v)}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {formatLine(v)}
                  </text>
                </Group>
              ))}
            {line && (
              <defs>
                {/* The line's course, wider by the halo, cut out of the area wherever the two overlap. */}
                <mask id={carve}>
                  <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="white"
                  />
                  <LinePath<AreaPoint>
                    className={styles.carve}
                    data={extended}
                    x={xOf}
                    y={yLine}
                    curve={curveMonotoneX}
                    strokeWidth={STROKE + HALO * 2}
                  />
                </mask>
              </defs>
            )}
            <AreaClosed<AreaPoint>
              data={extended}
              x={xOf}
              y={yOf(area.id)}
              yScale={y}
              curve={curveMonotoneX}
            >
              {({ path }) => {
                const d = path(extended) ?? ""
                return (
                  <Group
                    className={styles.area}
                    mask={line ? `url(#${carve})` : undefined}
                  >
                    <path className={styles.muted} d={d} />
                    <path
                      className={styles.live}
                      d={d}
                      clipPath={`url(#${clip})`}
                    />
                  </Group>
                )
              }}
            </AreaClosed>
            {line && (
              <LinePath<AreaPoint>
                data={extended}
                x={xOf}
                y={yLine}
                curve={curveMonotoneX}
              >
                {({ path }) => {
                  const d = path(extended) ?? ""
                  return (
                    <Group className={styles.line}>
                      <path
                        className={styles.muted}
                        d={d}
                        strokeWidth={STROKE}
                      />
                      <path
                        className={styles.live}
                        d={d}
                        strokeWidth={STROKE}
                        clipPath={`url(#${clip})`}
                      />
                    </Group>
                  )
                }}
              </LinePath>
            )}
            {points.map((p, i) => (
              <Group
                key={p.id}
                className={styles.point}
                data-muted={isMuted(p) || undefined}
                onMouseEnter={() => onHover?.(p.id)}
              >
                {/* Over the plot and the label, the point's half steps, so the pointer is always over some point. */}
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
