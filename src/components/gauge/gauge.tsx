import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { Arc } from "@visx/shape"
import { type ReactNode, useId } from "react"
import styles from "./gauge.module.css"

// the surface showing between one section and the next, at the ring's middle
const GAP = 3
const MAX_RADIUS = 140
// the mark keeps this much of the ring around it, and the surface carved around it is this wide
const INSET = 3
const HALO = 2

const clamp = (lo: number, hi: number, v: number) =>
  Math.min(hi, Math.max(lo, v))

/* A half circle of `sections` equal sections from nine o'clock over the top
 * to three: a section the share covers whole is filled, one it covers in
 * part is coloured between the empty and the full tone by how much of it the
 * share reaches, and the rest are the track. A mark is a rounded square
 * turned on its corner inside the ring at another share (last season's),
 * with the surface carved around it so it stands apart. Children sit inside
 * the arc, centred on its baseline. Every length is a whole pixel. */
export function Gauge({
  value,
  tick = null,
  tickLabel = "before",
  sections = 30,
  thickness = 36,
  format,
  children,
}: {
  /** 0 to 1; null fills nothing. */
  value: number | null
  /** A mark at this share: the earlier figure. */
  tick?: number | null
  /** What the mark stands for, in the spoken summary. */
  tickLabel?: string
  sections?: number
  thickness?: number
  format: (value: number) => string
  children?: ReactNode
}) {
  const cut = useId()
  const { parentRef, width: measured } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const width = Math.floor(measured)
  const radius = Math.round(Math.min(width / 2, MAX_RADIUS))
  const inner = radius - thickness
  const mid = (radius + inner) / 2
  /** A share's angle, from nine o'clock clockwise over the top to three. */
  const angle = (share: number) => -Math.PI / 2 + Math.PI * clamp(0, 1, share)
  // half the gap between sections, as an angle at the ring's middle
  const pad = GAP / 2 / mid
  const share = value === null ? 0 : clamp(0, 1, value)
  /** How much of a section the share covers, 0 to 1. */
  const covered = (i: number) => clamp(0, 1, share * sections - i)
  // the mark: a square half the size of one whose diagonal would fit the ring, turned on its corner
  const side = Math.round((thickness - 2 * INSET) / Math.SQRT2 / 3)
  const corner = Math.max(1, Math.round(side / 5))
  const markAt = tick === null ? null : angle(tick)
  const mark =
    markAt === null
      ? null
      : {
          x: Math.round(mid * Math.sin(markAt)),
          y: Math.round(-mid * Math.cos(markAt)),
          turn: (markAt * 180) / Math.PI + 45,
        }
  const summary = `${value === null ? "-" : format(value)}${
    tick === null ? "" : `, ${tickLabel} ${format(tick)}`
  }`

  return (
    <div data-slot="gauge" ref={parentRef} className={styles.root}>
      {width > 0 && inner > 0 && (
        <svg width={width} height={radius} role="img" aria-label={summary}>
          <Group left={Math.round(width / 2)} top={radius}>
            <defs>
              {/* The surface around the mark, cut out of every section it crosses. */}
              <mask id={cut}>
                <rect
                  fill="white"
                  x={-radius}
                  y={-radius}
                  width={2 * radius}
                  height={radius}
                />
                {mark && (
                  <rect
                    className={styles.halo}
                    x={-side / 2}
                    y={-side / 2}
                    width={side}
                    height={side}
                    rx={corner}
                    strokeWidth={2 * HALO}
                    transform={`translate(${mark.x} ${mark.y}) rotate(${mark.turn})`}
                  />
                )}
              </mask>
            </defs>
            <Group mask={`url(#${cut})`}>
              {Array.from({ length: sections }, (_, i) => {
                const part = covered(i)
                return (
                  <Arc
                    // biome-ignore lint/suspicious/noArrayIndexKey: a section is its position on the ring, nothing else
                    key={i}
                    className={part > 0 ? styles.section : styles.track}
                    style={
                      part > 0
                        ? {
                            fill: `color-mix(in oklch, var(--juni-needle-700) ${Math.round(part * 100)}%, var(--juni-needle-200))`,
                          }
                        : undefined
                    }
                    innerRadius={inner}
                    outerRadius={radius}
                    startAngle={angle(i / sections) + pad}
                    endAngle={angle((i + 1) / sections) - pad}
                    cornerRadius={3}
                  />
                )
              })}
            </Group>
            {mark && (
              <rect
                className={styles.mark}
                x={-side / 2}
                y={-side / 2}
                width={side}
                height={side}
                rx={corner}
                transform={`translate(${mark.x} ${mark.y}) rotate(${mark.turn})`}
              />
            )}
          </Group>
        </svg>
      )}
      {children && inner > 0 && <div className={styles.centre}>{children}</div>}
    </div>
  )
}
