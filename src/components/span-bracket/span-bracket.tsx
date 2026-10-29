import styles from "./span-bracket.module.css"

/** The room a bracket takes over a plot, which a chart adds above its own height. */
export const SPAN = 22
// the bracket's line, from the top, and how far its ends turn up
const LINE = 18
const END = 4

/* Over a plot, the selected span marked along the columns it covers: a
 * hairline from the first to the last with its ends turned up, and the
 * span's name above it in the eyebrow's type. Every edge is a half pixel,
 * so the hairline sits on whole pixels. Rendered inside the chart's own
 * SVG, so it is a <g>, not a component with a root of its own. Shared by
 * the area, stacked, box and waterfall charts, hence its own directory. */
export function SpanBracket({
  x0,
  x1,
  label,
}: {
  x0: number
  x1: number
  label: string
}) {
  const left = Math.round(x0) + 0.5
  const right = Math.round(x1) - 0.5
  const y = LINE + 0.5
  return (
    <g data-slot="span-bracket" className={styles.bracket}>
      <path d={`M ${left} ${y - END} V ${y} H ${right} V ${y - END}`} />
      <text x={(left + right) / 2} y={LINE - 8} textAnchor="middle">
        {label}
      </text>
    </g>
  )
}
