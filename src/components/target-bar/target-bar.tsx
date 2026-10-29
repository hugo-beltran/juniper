import { Group } from "@visx/group"
import { useParentSize } from "@visx/responsive"
import { scaleLinear } from "@visx/scale"
import { Bar } from "@visx/shape"
import styles from "./target-bar.module.css"

export interface TargetSegment {
  id: string
  label: string
  value: number
  /** Drawn as a smaller bar inside the gap rather than as a block before it: possible, not banked. */
  inset?: boolean
  /** Drawn with a 1px outline, inset by half of it so the line sits on whole pixels, as the swatch draws its mark. */
  outlined?: boolean
}

export interface TargetMarker {
  value: number
  label?: string
}

const GAP = 2
const RADIUS = 2
// a segment too small for the scale still shows as a sliver; an inset one as a short pill
const MIN = 2
const INSET_MIN = 4
// an inset segment keeps this much of the gap around it
const PAD = 3
// the marker's triangle over the bar: half its base, and its height
const TRIANGLE = 4
const POINT = 5
// room over the triangle for the marker's label
const LABEL = 14

/* Solid segments stacked from the left up to `target`, so each reads as its
 * share of the target, then the gap from the last one to the target as its
 * own rect; an inset segment lies inside the gap as a smaller bar from where
 * the solid ones end, on the same scale, so it reads as part of the gap that
 * is in play. Every rect has the same small radius, and a segment with
 * nothing in it is not drawn. A marker is a triangle pointing down onto the
 * bar at a value on the same scale (games played, last season's level), its
 * label above when it has one. Segments are coloured by position, darkest
 * first, and name themselves on hover; the legend is the caller's. Every
 * edge is snapped to a whole pixel. */
export function TargetBar({
  target,
  segments,
  marker,
  height = 28,
  format,
}: {
  target: number
  segments: readonly TargetSegment[]
  marker?: TargetMarker
  height?: number
  format: (value: number) => string
}) {
  const { parentRef, width: measured } = useParentSize({
    debounceTime: 50,
    ignoreDimensions: ["height", "top", "left"],
  })
  const width = Math.floor(measured)
  const x = scaleLinear<number>({
    domain: [0, Math.max(target, 1)],
    range: [0, width],
    clamp: true,
  })
  /** A value's pixel on the scale, whole. */
  const px = (value: number) => Math.round(x(value))
  // where each segment starts; one past the last is their total
  const starts = [0]
  for (const s of segments)
    starts.push((starts[starts.length - 1] ?? 0) + s.value)
  // the gap starts after the solid segments, or at the left when there is none
  let solid = 0
  for (const s of segments) {
    if (s.inset) break
    solid += s.value
  }
  const filled = solid > 0 ? px(solid) + GAP : 0
  const summary = `${segments
    .map((s) => `${s.label} ${format(s.value)}`)
    .join(", ")} of ${format(target)}`
  const markerX = marker ? x(marker.value) : 0
  const anchor =
    markerX < 80 ? "start" : markerX > width - 80 ? "end" : "middle"
  const above = marker ? POINT + (marker.label ? LABEL : 0) : 0

  return (
    <div
      data-slot="target-bar"
      ref={parentRef}
      className={styles.root}
      role="img"
      aria-label={summary}
    >
      {width > 0 && (
        <svg aria-hidden="true" width={width} height={above + height}>
          <Group top={above}>
            {filled < width && (
              <Bar
                className={styles.gap}
                x={filled + 0.5}
                y={0.5}
                width={width - filled - 1}
                height={height - 1}
                rx={RADIUS}
              />
            )}
            {segments.map((s, i) => {
              if (s.value <= 0) return null
              const from = px(starts[i] ?? 0)
              const to = px(starts[i + 1] ?? 0)
              // an outlined rect sits half a stroke in, so the line is drawn on whole pixels
              const inset = s.outlined ? 0.5 : 0
              return (
                <Group
                  key={s.id}
                  className={styles.segment}
                  data-index={i}
                  data-outlined={s.outlined || undefined}
                >
                  <title>{`${s.label}: ${format(s.value)}`}</title>
                  {s.inset ? (
                    <Bar
                      x={Math.max(from, filled) + PAD}
                      y={PAD}
                      width={Math.max(INSET_MIN, to - from)}
                      height={height - 2 * PAD}
                      rx={RADIUS}
                    />
                  ) : (
                    <Bar
                      x={from + (i ? GAP : 0) + inset}
                      y={inset}
                      width={
                        Math.max(MIN, to - from - (i ? GAP : 0)) - 2 * inset
                      }
                      height={height - 2 * inset}
                      rx={RADIUS}
                    />
                  )}
                </Group>
              )
            })}
            {marker && (
              <Group className={styles.marker}>
                <polygon
                  points={`${markerX - TRIANGLE},${-POINT} ${markerX + TRIANGLE},${-POINT} ${markerX},0`}
                />
                {marker.label && (
                  <text x={markerX} y={-POINT - 4} textAnchor={anchor}>
                    {marker.label}
                  </text>
                )}
              </Group>
            )}
          </Group>
        </svg>
      )}
    </div>
  )
}
