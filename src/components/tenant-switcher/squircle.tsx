import { type ComponentProps, useId, useMemo } from "react"

/* Superellipse (Lamé curve) squircle, after
 * https://observablehq.com/@daformat/draw-squircle-shapes-with-svg-javascript
 * — the path sampling and the glass gradient / tinted drop shadow treatments
 * are ported from the notebook; the wiggle animation is deliberately not.
 * Colors default to Juniper values but land as CSS vars via style attributes
 * (SVG presentation attributes can't hold var()). Private to tenant-switcher
 * until another component needs it. */

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
    d += i === 0 ? `M ${x + a} ${y + b}` : `L${x + a} ${y + b}`
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
      d += `L${signX * x + a} ${signY * y + b}`
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
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
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
      <path
        d={d}
        fill={`url(#${id}-glass)`}
        style={{ filter: `url(#${id}-shadow)`, opacity: 0.8 }}
      />
      <path
        d={d}
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeOpacity={0.3}
        clipPath={`url(#${id}-clip)`}
      />
    </svg>
  )
}
