import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear, scaleLog, scaleSqrt } from "@visx/scale"
import { Line } from "@visx/shape"
import styles from "./bubble-scatter.module.css"

/** One item: where it sits across and up, and the figure its bubble's area stands for. */
export interface Bubble {
  id: string
  label: string
  x: number
  y: number
  size: number
}

// room over the plot for the y axis's name, and under it for the x ticks and the x axis's name
const TOP = 18
const AXIS = 34
const AXIS_LEFT = 36
// the largest bubble's radius, kept clear of the axes, and the least any bubble is drawn at so a small figure shows
const MAX_R = 18
const MIN_R = 3
// between a bubble and its label, and the width a label's character is reckoned at to keep it inside the plot
const LABEL_GAP = 4
const CHAR = 6.5
// past this many decades, every other one is ticked
const DECADES = 6

/** The whole decades around the values, so the log axis starts and ends on a power of ten. */
const decadesAround = (values: readonly number[]): [number, number] => {
  const lo = Math.floor(Math.log10(Math.min(...values)))
  const hi = Math.ceil(Math.log10(Math.max(...values)))
  return [lo, hi > lo ? hi : lo + 1]
}

/* One bubble per item: across on a log scale, for figures orders of
 * magnitude apart, up on a linear one from zero, and the area its size's
 * share of the largest, so a bubble twice another's area is twice its
 * figure. The x axis is ticked at its powers of ten and the y axis at its
 * own ticks, with an optional reference line drawn stronger; each axis is
 * named at its end. The largest bubbles are drawn first so the small ones
 * stay on top, each named beside it, on the side with room; screen readers
 * get every bubble's figures in one summary. The pointer over a bubble
 * tells `onHover` its id, and none when it leaves the plot; the others step
 * back from the hovered or focused one. */
export function BubbleScatter({
  bubbles,
  formatX,
  formatY,
  formatSize,
  formatXTick = formatX,
  formatYTick = formatY,
  xLabel,
  yLabel,
  reference,
  height = 200,
  focus = null,
  onHover,
}: {
  bubbles: readonly Bubble[]
  formatX: (value: number) => string
  formatY: (value: number) => string
  formatSize: (value: number) => string
  formatXTick?: (value: number) => string
  formatYTick?: (value: number) => string
  xLabel: string
  yLabel: string
  /** A y value drawn as a stronger line: the league average, 100% of a rate. */
  reference?: number
  height?: number
  focus?: string | null
  onHover?: (id: string | null) => void
}) {
  const { parentRef, width: measured } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const width = Math.floor(measured)
  const bottom = height - AXIS
  const [lo, hi] = bubbles.length
    ? decadesAround(bubbles.map((b) => b.x))
    : [0, 1]
  const x = scaleLog<number>({
    domain: [10 ** lo, 10 ** hi],
    range: [AXIS_LEFT + MAX_R / 2, width - MAX_R],
  })
  const y = scaleLinear<number>({
    domain: [0, Math.max(reference ?? 0, ...bubbles.map((b) => b.y))],
    range: [bottom - MAX_R, TOP + MAX_R / 2],
    nice: true,
  })
  const r = scaleSqrt<number>({
    domain: [0, Math.max(1, ...bubbles.map((b) => b.size))],
    range: [0, MAX_R],
  })
  const radius = (b: Bubble) => Math.max(MIN_R, r(b.size))
  const step = hi - lo > DECADES ? 2 : 1
  const xTicks = Array.from(
    { length: Math.floor((hi - lo) / step) + 1 },
    (_, i) => 10 ** (lo + i * step),
  )
  const yTicks = y.ticks(4)
  const name = (b: Bubble) =>
    `${b.label}: ${formatY(b.y)} at ${formatX(b.x)}, ${formatSize(b.size)}`
  const summary = bubbles.map(name).join("; ")
  // the largest first, so the small ones are drawn over them
  const drawn = [...bubbles].sort((a, b) => b.size - a.size)
  /** Whether the label fits on the bubble's right, inside the plot. */
  const fitsRight = (b: Bubble) =>
    x(b.x) + radius(b) + LABEL_GAP + b.label.length * CHAR <= width

  return (
    <div
      data-slot="bubble-scatter"
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
          <text className={styles.axisName} x={0} y={10}>
            {yLabel}
          </text>
          {yTicks.map((v) => (
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
                {formatYTick(v)}
              </text>
            </Group>
          ))}
          {reference !== undefined && (
            <Line
              className={styles.reference}
              from={{ x: AXIS_LEFT, y: y(reference) }}
              to={{ x: width, y: y(reference) }}
            />
          )}
          {xTicks.map((v) => (
            <Group key={v} className={styles.tick}>
              <Line from={{ x: x(v), y: TOP }} to={{ x: x(v), y: bottom }} />
              <text x={x(v)} y={bottom + 12} textAnchor="middle">
                {formatXTick(v)}
              </text>
            </Group>
          ))}
          <text
            className={styles.axisName}
            x={width}
            y={height - 4}
            textAnchor="end"
          >
            {xLabel}
          </text>
          {drawn.map((b) => {
            const cx = x(b.x)
            const cy = y(b.y)
            const right = fitsRight(b)
            return (
              <Group
                key={b.id}
                className={styles.bubble}
                data-focused={b.id === focus || undefined}
                onMouseEnter={() => onHover?.(b.id)}
              >
                <circle className={styles.mark} cx={cx} cy={cy} r={radius(b)} />
                <text
                  className={styles.label}
                  x={
                    right
                      ? cx + radius(b) + LABEL_GAP
                      : cx - radius(b) - LABEL_GAP
                  }
                  y={cy}
                  textAnchor={right ? "start" : "end"}
                  dominantBaseline="middle"
                >
                  {b.label}
                </text>
              </Group>
            )
          })}
        </svg>
      )}
    </div>
  )
}
