import { curveMonotoneX } from "@visx/curve"
import { ParentSize } from "@visx/responsive"
import { scaleLinear } from "@visx/scale"
import { LinePath } from "@visx/shape"
import styles from "./sparkline.module.css"

/* Decorative trend line for a SummaryCard metric — no axes, no tooltip,
 * aria-hidden (the metric itself carries the information). Fills whatever
 * width its flex slot gives it; only the height is fixed. */
export function Sparkline({
  data,
  height = 28,
}: {
  data: number[]
  height?: number
}) {
  return (
    <ParentSize
      className={styles.sparkline}
      style={{ height }}
      debounceTime={10}
    >
      {({ width }) =>
        width >= 8 && (
          <SparklinePath data={data} width={width} height={height} />
        )
      }
    </ParentSize>
  )
}

function SparklinePath({
  data,
  width,
  height,
}: {
  data: number[]
  width: number
  height: number
}) {
  const x = scaleLinear({
    domain: [0, data.length - 1],
    range: [1, width - 1],
  })
  const y = scaleLinear({
    domain: [Math.min(...data), Math.max(...data)],
    range: [height - 2, 2],
  })

  return (
    <svg width={width} height={height} aria-hidden>
      <LinePath
        data={data}
        x={(_, i) => x(i)}
        y={(d) => y(d)}
        curve={curveMonotoneX}
        className={styles.line}
      />
    </svg>
  )
}
