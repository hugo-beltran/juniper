import { UserIcon } from "@heroicons/react/24/outline"
import { type ComponentProps, useState } from "react"
import { Squircle } from "@/components/squircle/squircle"
import { cn } from "@/lib/cn"
import styles from "./avatar.module.css"

/* A person on the squircle tile, in three faces, each the fallback of the
 * one before: the photograph clipped to the curve and covering it; the
 * initials over the glass when there is no photograph, or when it fails
 * to load; and a person icon when there is not even a name to take
 * initials from. Which face shows is data (a src, a name, a load error),
 * so React picks it and publishes it as data-face; everything else is
 * the tile's. Decorative by default (aria-hidden): the name beside it
 * carries the meaning (component-architecture §5.4). Added 2026-09-30 for
 * the UserProfile. */

export type AvatarFace = "image" | "initials" | "icon"

interface AvatarProps
  extends Omit<ComponentProps<typeof Squircle>, "children"> {
  /** The photograph, covering the tile. */
  src?: string
  /** The person's name; the source of the initials. */
  name?: string
}

/* First and last initial; a single word gives one letter. */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export function Avatar({
  src,
  name,
  size = 32,
  className,
  ...props
}: AvatarProps) {
  /* A photograph that will not load is no photograph: keyed on the src so
   * a new one gets its chance. */
  const [failedSrc, setFailedSrc] = useState<string>()
  const image = src && src !== failedSrc ? src : undefined
  const initials = name ? initialsOf(name) : ""
  const face: AvatarFace = image ? "image" : initials ? "initials" : "icon"

  const icon = size * 0.56

  return (
    <Squircle
      data-slot="avatar"
      data-face={face}
      size={size}
      className={cn(styles.avatar, className)}
      {...props}
    >
      {face === "image" && (
        <image
          href={image}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid slice"
          onError={() => setFailedSrc(src)}
        />
      )}
      {face === "initials" && (
        <text
          className={styles.initials}
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.34}
        >
          {initials}
        </text>
      )}
      {face === "icon" && (
        <UserIcon
          className={styles.icon}
          x={(size - icon) / 2}
          y={(size - icon) / 2}
          width={icon}
          height={icon}
        />
      )}
    </Squircle>
  )
}
