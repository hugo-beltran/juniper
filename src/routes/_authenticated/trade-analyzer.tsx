import { createFileRoute } from "@tanstack/react-router"
import { SummaryCard } from "@/components"
import styles from "./trade-analyzer.module.css"

export const Route = createFileRoute("/_authenticated/trade-analyzer")({
  component: TradeAnalyzerPage,
})

/* Fantasy baseball trade dashboard — players exchanged between two teams.
 * Metrics are static placeholders until the trade state exists. */

/* Grizzlies combined batting average by week, season to date. */
const GRIZZLIES_AVG_TREND = [
  0.259, 0.263, 0.258, 0.254, 0.256, 0.262, 0.266, 0.264, 0.268, 0.267,
]

function TradeAnalyzerPage() {
  return (
    <div className={styles.page}>
      <h1>Trade Analyzer</h1>
      <div className={styles.summaryRow}>
        <SummaryCard
          title="Team AVG (L30)"
          metric=".267"
          trend={GRIZZLIES_AVG_TREND}
          footer={
            <>
              Trade candidate: <strong>R. Delgado (3B)</strong>
              <br /> .208 AVG / 31 RBI / .589 OPS
            </>
          }
        />
        <SummaryCard
          title="IL — returning soon"
          metric="3"
          footer={
            <>
              Next back: <strong>T. Okafor (SP)</strong>
              <br /> eligible Fri · 2.94 ERA pre-injury
            </>
          }
        />
        <SummaryCard
          title="Sell-high window"
          metric="$23 avg"
          footer={
            <>
              <strong>3 trade candidates</strong>
              <br /> top: <strong>J. Paulino (SP)</strong> — window closes Fri
            </>
          }
        />
        <SummaryCard
          title="Pending trade offers"
          metric="4"
          footer={
            <>
              Most requested: <strong>D. Whitlock (OF)</strong>
              <br /> trade deadline: <strong>Sep 19</strong>
            </>
          }
        />
      </div>
    </div>
  )
}
