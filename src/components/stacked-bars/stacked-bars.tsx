import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear } from "@visx/scale"
import { BarStack, Line } from "@visx/shape"
import { SPAN, SpanBracket } from "@/components/span-bracket/span-bracket"
import type {
  AreaBand,
  AreaPoint,
} from "@/components/stacked-area/stacked-area"
import styles from "./stacked-bars.module.css"

const AXIS = 20
const AXIS_LEFT = 24
// room above the tallest stack
const HEADROOM = 6
// the surface showing between one band's block and the next
const GAP = 2
// the pill behind a column's label while the pointer is on the column
const PILL = { width: 32, height: 17, rx: 4 }

const sumOf = (values: Record<string, number>) =>
  Object.values(values).reduce((a, b) => a + b, 0)

/* One column per point, stacked from the baseline by band, so a column's
 * height is its total and every band's block its share; the bands are
 * coloured by position and a muted point is drawn out of bounds, so the
 * selection stands out of its context. Gridlines at the scale's own ticks,
 * labelled down the left; each point's label under its column. Each column
 * owns its band of the width: an invisible bar there tells `onHover` which
 * column the pointer is over, and none when it leaves, while a faint wash
 * and a pill behind the label pick the column out; with `focus` set to a
 * column, that column is the selection instead, and every other one is
 * muted. */
export function StackedBars({
  bands,
  points,
  format,
  formatTick = format,
  height = 120,
  focus = null,
  onHover,
  span,
}: {
  bands: readonly AreaBand[]
  points: readonly AreaPoint[]
  format: (value: number) => string
  formatTick?: (value: number) => string
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
  const totals = points.map((p) => sumOf(p.values))
  const keys = bands.map((b) => b.id)
  const x = scaleBand<string>({
    domain: points.map((p) => p.id),
    range: [AXIS_LEFT, width],
    paddingInner: 0.3,
    paddingOuter: 0.15,
  })
  const y = scaleLinear<number>({
    domain: [0, Math.max(1, ...totals)],
    range: [inner, HEADROOM],
    nice: true,
  })
  const ticks = y.ticks(3)
  const summary = points
    .map((p, i) => `${p.label} ${format(totals[i] ?? 0)}`)
    .join(", ")
  const focused = focus === null ? -1 : points.findIndex((p) => p.id === focus)
  const isMuted = (p: AreaPoint) => (focused < 0 ? p.muted : p.id !== focus)
  // a column's band: its step less the padding, shared out either side
  const step = x.step()
  const bandStart = (id: string) =>
    Math.round((x(id) ?? 0) - (step - x.bandwidth()) / 2)

  // the bracket over the selection's columns, when the span is named: from the first live column to the last
  const live = points.findIndex((p) => !p.muted)
  const lastLive = points.findLastIndex((p) => !p.muted)
  const top = span ? SPAN : 0
  const bracket =
    span && live >= 0 ? (
      <SpanBracket
        x0={x(points[live]?.id ?? "") ?? 0}
        x1={(x(points[lastLive]?.id ?? "") ?? 0) + x.bandwidth()}
        label={span}
      />
    ) : null

  return (
    <div
      data-slot="stacked-bars"
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
            {points.map((p) => (
              <Group
                key={p.id}
                className={styles.column}
                data-muted={isMuted(p) || undefined}
                onMouseEnter={() => onHover?.(p.id)}
              >
                {/* Over the column's band, so the pointer is always over some column. */}
                <rect
                  className={styles.hit}
                  x={bandStart(p.id)}
                  y={0}
                  width={Math.round(step)}
                  height={height}
                />
                <rect
                  className={styles.wash}
                  x={bandStart(p.id)}
                  y={0}
                  width={Math.round(step)}
                  height={inner}
                />
                <rect
                  className={styles.pill}
                  x={(x(p.id) ?? 0) + x.bandwidth() / 2 - PILL.width / 2}
                  y={inner + 1.5}
                  {...PILL}
                />
                <text
                  className={styles.label}
                  x={(x(p.id) ?? 0) + x.bandwidth() / 2}
                  y={inner + 14}
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              </Group>
            ))}
            <BarStack<AreaPoint, string>
              data={[...points]}
              keys={keys}
              x={(p) => p.id}
              xScale={x}
              yScale={y}
              color={() => ""}
              value={(p, key) => p.values[key] ?? 0}
            >
              {(stacks) =>
                stacks.map((stack, i) => (
                  <Group key={stack.key} className={styles.band} data-band={i}>
                    {stack.bars.map((bar) => {
                      const point = points[bar.index]
                      if (!point || bar.height <= GAP) return null
                      return (
                        <rect
                          key={bar.index}
                          className={styles.block}
                          data-muted={isMuted(point) || undefined}
                          x={bar.x}
                          y={bar.y + GAP / 2}
                          width={bar.width}
                          height={bar.height - GAP}
                          rx={1.5}
                        />
                      )
                    })}
                  </Group>
                ))
              }
            </BarStack>
          </Group>
        </svg>
      )}
    </div>
  )
}
