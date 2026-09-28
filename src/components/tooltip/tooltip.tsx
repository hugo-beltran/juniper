import {
  Tooltip as AriaTooltip,
  type TooltipProps,
} from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./tooltip.module.css"

/* react-aria-components tooltip. Compose as:
 *   <TooltipTrigger><Button …/><Tooltip>label</Tooltip></TooltipTrigger>
 * No provider needed. Wrap non-RAC triggers (e.g. a router link) in
 * <Focusable> from react-aria-components. */

export { Focusable, TooltipTrigger } from "react-aria-components"

export function Tooltip({
  className,
  offset = 6,
  ...props
}: Omit<TooltipProps, "className"> & { className?: string }) {
  return (
    <AriaTooltip
      offset={offset}
      className={cn(styles.content, className)}
      {...props}
    />
  )
}
