import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear } from "@visx/scale"
import { Line } from "@visx/shape"
import { SPAN, SpanBracket } from "@/components/span-bracket/span-bracket"
import styles from "./waterfall.module.css"

export interface WaterfallStep {
  id: string
  label: string
  rise: number
  fall: number
  /** Drawn out of bounds: the step is context, not part of the selection. */
  muted?: boolean
}

const PARTS = ["rise", "fall"] as const
const AXIS = 20
const AXIS_LEFT = 36
const HEIGHT = 160
// room for a bar's amount above its top and below its bottom
const AMOUNT = 10
// how far a bar's pointed end reaches, at most
const POINT = 4

/** A bar whose end comes to a point, up or down, no taller than POINT and never more than the bar itself. */
function Pointed({
  x,
  y,
  width,
  height,
  up = false,
  className,
}: {
  x: number
  y: number
  width: number
  height: number
  up?: boolean
  className?: string
}) {
  const p = Math.min(POINT, height)
  const mid = x + width / 2
  const d = up
    ? `M${x},${y + p} L${mid},${y} L${x + width},${y + p} V${y + height} H${x} Z`
    : `M${x},${y} H${x + width} V${y + height - p} L${mid},${y + height} L${x},${y + height - p} Z`
  return <path className={className} d={d} />
}

/* One step per item: a rise bar from the level the previous step left,
 * pointed at its top, and a fall bar dropping from the rise's top, pointed
 * at its bottom, so each bar's end says which way it goes; where the fall
 * ends is where the next step starts. The rise's amount sits above its bar
 * and the fall's below its bar. Steps are separated by a gap of the band's
 * padding. Gridlines at the scale's own ticks, labelled down the left, with
 * the zero line stronger. The pointer anywhere over a step's band tells
 * `onHover` its step, and none when it leaves the chart; the others step
 * back from the hovered or focused one. */
export function Waterfall({
  steps,
  format,
  formatTick = format,
  span: period,
  focus = null,
  onHover,
}: {
  steps: readonly WaterfallStep[]
  format: (value: number) => string
  formatTick?: (value: number) => string
  /** The selected span's name, drawn as a bracket over the steps in it; the room for it is added over the plot. */
  span?: string
  focus?: string | null
  onHover?: (id: string | null) => void
}) {
  const { parentRef, width } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const nets = steps.map((s) => s.rise - s.fall)
  // the running total before each step; one past the last is the total
  const levels = [0]
  for (const net of nets) levels.push((levels[levels.length - 1] ?? 0) + net)
  const tops = steps.map((s, i) => (levels[i] ?? 0) + s.rise)
  const inner = HEIGHT - AXIS

  const x = scaleBand<string>({
    domain: steps.map((s) => s.id),
    range: [AXIS_LEFT, width],
    paddingInner: 0.35,
    paddingOuter: 0.1,
  })
  const part = scaleBand<(typeof PARTS)[number]>({
    domain: [...PARTS],
    range: [0, x.bandwidth()],
    paddingInner: 0.1,
  })
  const y = scaleLinear<number>({
    domain: [Math.min(0, ...levels, ...tops), Math.max(0, ...levels, ...tops)],
    range: [inner - AMOUNT, AMOUNT],
    nice: true,
  })
  const span = (a: number, b: number) => ({
    y: Math.min(y(a), y(b)),
    height: Math.abs(y(a) - y(b)),
  })
  // d3 picks the count and the round values; the hint keeps them apart at this height
  const ticks = y.ticks(5)
  const summary = steps
    .map((s, i) => `${s.label} ${format(nets[i] ?? 0)}`)
    .join(", ")

  // the bracket over the selection's steps, when the span is named: from the first live step to the last
  const live = steps.findIndex((st) => !st.muted)
  const lastLive = steps.findLastIndex((st) => !st.muted)
  const top = period ? SPAN : 0
  const bracket =
    period && live >= 0 ? (
      <SpanBracket
        x0={x(steps[live]?.id ?? "") ?? 0}
        x1={(x(steps[lastLive]?.id ?? "") ?? 0) + x.bandwidth()}
        label={period}
      />
    ) : null

  return (
    <div
      data-slot="waterfall"
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
          height={HEIGHT + top}
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
            {steps.map((s, i) => {
              const base = levels[i] ?? 0
              const end = levels[i + 1] ?? 0
              const peak = tops[i] ?? 0
              const x0 = x(s.id) ?? 0
              return (
                <Group
                  key={s.id}
                  left={x0}
                  className={styles.step}
                  data-muted={s.muted || undefined}
                  data-focused={s.id === focus || undefined}
                  onMouseEnter={() => onHover?.(s.id)}
                >
                  {/* Over the step's whole band, gaps included, so the pointer is always over some step. */}
                  <rect
                    className={styles.hit}
                    x={-(x.step() - x.bandwidth()) / 2}
                    y={-top}
                    width={x.step()}
                    height={HEIGHT + top}
                  />
                  <Pointed
                    className={styles.rise}
                    x={part("rise") ?? 0}
                    width={part.bandwidth()}
                    {...span(base, peak)}
                    up
                  />
                  <Pointed
                    className={styles.fall}
                    x={part("fall") ?? 0}
                    width={part.bandwidth()}
                    {...span(peak, end)}
                  />
                  <text
                    className={styles.rise}
                    x={(part("rise") ?? 0) + part.bandwidth() / 2}
                    y={Math.min(y(base), y(peak)) - 4}
                    textAnchor="middle"
                  >
                    {format(s.rise)}
                  </text>
                  <text
                    className={styles.fall}
                    x={(part("fall") ?? 0) + part.bandwidth() / 2}
                    y={Math.max(y(peak), y(end)) + 12}
                    textAnchor="middle"
                  >
                    {format(s.fall)}
                  </text>
                  <text
                    className={styles.label}
                    x={x.bandwidth() / 2}
                    y={inner + 14}
                    textAnchor="middle"
                  >
                    {s.label}
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
