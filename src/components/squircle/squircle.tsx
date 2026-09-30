import { type ComponentProps, useId, useMemo } from "react"
import { cn } from "@/lib/cn"
import styles from "./squircle.module.css"

/* Superellipse (Lamé curve) squircle, after
 * https://observablehq.com/@daformat/draw-squircle-shapes-with-svg-javascript
 * — the path sampling and the glass gradient / tinted drop shadow treatments
 * are ported from the notebook; the wiggle animation is deliberately not.
 * The tile and nothing else: the glass pane, its shadow and its rim, and a
 * clipped group for whatever a consumer draws on it (the Avatar's photograph,
 * initials or icon; the tenant switcher draws nothing and uses the bare
 * pane as its Blobatar's backdrop). Colors default to Juniper values but
 * land as CSS vars via style attributes (SVG presentation attributes can't
 * hold var()). Decorative by default (aria-hidden): the text beside it
 * carries the meaning (component-architecture §5.4). Promoted from
 * tenant-switcher on 2026-09-30 when the avatar became its second consumer
 * (§2.3). */

interface SquircleProps
  extends Omit<ComponentProps<"svg">, "width" | "height"> {
  /** Rendered box in px; also the coordinate space of the path. */
  size?: number
  /** Lamé exponent n: 2 = circle, 5 ≈ the iOS squircle, <1 = star. */
  exponent?: number
  /** Sampled points per quadrant. */
  resolution?: number
  glassFrom?: string
  glassTo?: string
  shadowColor?: string
  shadowAlpha?: number
}

/* A thousandth of a px is well below what renders, and keeps the path
 * string short. */
const round = (v: number) => Math.round(v * 1000) / 1000

function lamePath(n: number, size: number, resolution: number) {
  const a = size / 2
  const b = size / 2
  const limit = Math.PI / 2
  const exp = 2 / n
  const points: Array<[number, number]> = []
  let d = ""

  /* First quadrant, 0 <= t <= π/2 … */
  for (let i = 0; i < resolution; i++) {
    const t = (i / (resolution - 1)) * limit
    const cosT = Math.cos(t)
    const sinT = Math.sin(t)
    const x = Math.sign(cosT) * a * Math.abs(cosT) ** exp
    const y = Math.sign(sinT) * b * Math.abs(sinT) ** exp
    d +=
      i === 0
        ? `M ${round(x + a)} ${round(y + b)}`
        : `L${round(x + a)} ${round(y + b)}`
    points.push([x, y])
  }

  /* … then mirror it through the remaining quadrants: Lamé curves are
   * symmetric on both axes, so the signs do the work. */
  const matrix: Array<[number, number]> = [
    [-1, 1],
    [-1, -1],
    [1, -1],
  ]
  for (const [signX, signY] of matrix) {
    points.reverse()
    for (const [x, y] of points) {
      d += `L${round(signX * x + a)} ${round(signY * y + b)}`
    }
  }

  return `${d}Z`
}

export function Squircle({
  size = 32,
  exponent = 5,
  resolution = 32,
  glassFrom = "var(--juni-needle-300)",
  glassTo = "var(--juni-needle-200)",
  shadowColor = "var(--juni-berry-600)",
  shadowAlpha = 0.33,
  className,
  children,
  ...props
}: SquircleProps) {
  const id = useId()
  const d = useMemo(
    () => lamePath(exponent, size, resolution),
    [exponent, size, resolution],
  )

  /* Notebook's derivations, scaled from the shape size. */
  const blur = Math.min(12, size / 8)
  const offset = Math.min(4, size / 12)

  return (
    <svg
      data-slot="squircle"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
      className={cn(styles.squircle, className)}
      aria-hidden
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-glass`} cx="70%" cy="70%" r="80%">
          <stop offset="10%" style={{ stopColor: glassFrom }} />
          <stop offset="145%" style={{ stopColor: glassTo }} />
        </radialGradient>
        <filter
          id={`${id}-shadow`}
          x="-60%"
          y="-60%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation={blur}
            result="offsetBlur"
          />
          <feFlood style={{ floodColor: shadowColor }} floodOpacity="0.35" />
          <feComposite in2="offsetBlur" operator="in" />
          <feOffset dx={offset} dy={offset} result="offsetBlur" />
          <feComponentTransfer result="offsetBlur">
            <feFuncA type="linear" slope={shadowAlpha} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Same geometry as the fill, so a 2px centered stroke clips to a
         * 1px inner bevel — the glass rim, not a halo outside the pane. */}
        <clipPath id={`${id}-clip`}>
          <path d={d} />
        </clipPath>
      </defs>
      {/* The shadow filter reads the group's alpha: the pane casts the
       * squircle-shaped shadow, and whatever is drawn on it is clipped to
       * the same curve, so an opaque image simply covers the pane. */}
      <g style={{ filter: `url(#${id}-shadow)` }}>
        <path d={d} fill={`url(#${id}-glass)`} style={{ opacity: 0.8 }} />
        {children && <g clipPath={`url(#${id}-clip)`}>{children}</g>}
      </g>
      <path
        className={styles.rim}
        d={d}
        fill="none"
        strokeWidth={2}
        strokeOpacity={0.3}
        clipPath={`url(#${id}-clip)`}
      />
    </svg>
  )
}
