import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { Card } from "@/components/card/card"
import { Sparkline } from "./sparkline"
import styles from "./summary-card.module.css"

export interface SummaryCardProps {
  title: string
  metric: ReactNode
  /* Optional decorative trend line, drawn beside the metric. */
  trend?: number[]
  /* Optional supporting line under the metric (e.g. a callout). */
  footer?: ReactNode
  className?: string
}

export function SummaryCard({
  title,
  metric,
  trend,
  footer,
  className,
}: SummaryCardProps) {
  return (
    <Card
      data-slot="summary-card"
      className={cn(styles.summaryCard, className)}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.metricRow}>
        <div className={styles.metric}>{metric}</div>
        {trend && <Sparkline data={trend} />}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  )
}
