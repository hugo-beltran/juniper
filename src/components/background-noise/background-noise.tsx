import { type ComponentProps, useId } from "react"
import { cn } from "@/lib/cn"
import styles from "./background-noise.module.css"

/* Film grain for a ground: an SVG turbulence filter over a full-size rect at
 * 3% opacity, desaturated so it adds texture and no colour of its own (the
 * palette stays the only colour source). A background layer in the sense of
 * component-architecture §4.8: it takes no children and fills the positioned
 * container it is rendered into, behind the siblings that follow, so the
 * grain lands on the ground and never on the content. FullBleedCanvas
 * renders it over the photograph; any other positioned surface can do the
 * same. */
export function BackgroundNoise({
  className,
  ...props
}: Omit<ComponentProps<"svg">, "children">) {
  const id = useId()

  return (
    <svg
      data-slot="background-noise"
      className={cn(styles.noise, className)}
      aria-hidden="true"
      {...props}
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.35"
          numOctaves="5"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="overlay" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} opacity="0.03" />
    </svg>
  )
}
