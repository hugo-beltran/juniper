import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { z } from "zod"
import {
  AreaLine,
  type AreaPoint,
  BarList,
  BoxPlot,
  BubbleScatter,
  Butterfly,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DeltaChip,
  type Formatter,
  Gauge,
  HeatGrid,
  Legend,
  PageDescription,
  PageHeader,
  PageTitle,
  RangeDots,
  Select,
  SplitBars,
  StackedArea,
  StackedBars,
  Stat,
  SummaryCard,
  TargetBar,
  Waterfall,
} from "@/components"
import {
  CAPACITY,
  CLUBS,
  type Club,
  HALVES,
  type Half,
  HIT_TYPES,
  type HomeAway,
  type MonthReview,
  SEASONS,
  type Season,
  seasonReview,
  spread,
  WIN_TARGET,
} from "@/lib/season"
import styles from "./season.module.css"

/* The view lives in the URL (?season=2025&club=Harbor+Cats&half=second), so
 * a review survives reload and travels in a link. The schema is the
 * sanitizer: every field optional, checked against the seed's own lists,
 * an invalid value falling back to unset rather than erroring the page
 * (component-architecture §6.3). */
const searchSchema = z.object({
  season: z.enum(SEASONS).optional().catch(undefined),
  club: z.enum(CLUBS).optional().catch(undefined),
  half: z.enum(HALVES).optional().catch(undefined),
})

type SeasonSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute("/_authenticated/season")({
  validateSearch: searchSchema,
  component: SeasonPage,
})

const DEFAULT_SEASON: Season = "2026"
const DEFAULT_CLUB: Club = "River Hawks"
const LEAGUE_OPS = 0.72

const count = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const signedCount = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  signDisplay: "always",
})
const pct = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
})
const pct1 = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const usd = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})
const signedTenths = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
})
const signedHundredths = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
})
/** A change in percentage points: `+2.7 pts`. */
const points: Formatter = {
  format: (v) => `${signedTenths.format(Number(v) * 100)} pts`,
}
/** A change in a rate written to three places: `+.024`. */
const signedAverage: Formatter = {
  format: (v) => {
    const n = Number(v)
    return `${n > 0 ? "+" : n < 0 ? "-" : ""}${average(Math.abs(n))}`
  },
}
const signedRuns: Formatter = {
  format: (v) => `${signedHundredths.format(Number(v))} r/g`,
}
const signedEra: Formatter = {
  format: (v) => signedHundredths.format(Number(v)),
}
const signedCrowd: Formatter = { format: (v) => signedCount.format(Number(v)) }
/** A batting figure without its leading zero: `.312`. */
const average = (v: number) => v.toFixed(3).replace(/^0/, "")
const era = (v: number) => v.toFixed(2)
const perGame = (v: number) => v.toFixed(2)
const homers = (v: number) => `${count.format(v)} HR`

const HALF_LABEL: Record<Half, string> = {
  first: "First half",
  second: "Second half",
}

const CATEGORICAL = (i: number) => `var(--juni-categorical-${i})`
const HOME = CATEGORICAL(0)
const AWAY = CATEGORICAL(4)

const homeAwayFormat = (row: HomeAway): ((v: number) => string) =>
  row.kind === "average"
    ? average
    : row.kind === "era"
      ? era
      : row.kind === "perGame"
        ? perGame
        : (v) => count.format(v)

const homeAwayDelta = (row: HomeAway): Formatter =>
  row.kind === "average"
    ? signedAverage
    : row.kind === "era"
      ? signedEra
      : row.kind === "perGame"
        ? signedRuns
        : signedCrowd

function SeasonPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const season = search.season ?? DEFAULT_SEASON
  const club = search.club ?? DEFAULT_CLUB
  const half = search.half
  const review = useMemo(() => seasonReview(club, season), [club, season])

  const setSearch = (next: SeasonSearch) =>
    navigate({
      to: "/season",
      search: {
        season:
          (next.season ?? season) === DEFAULT_SEASON
            ? undefined
            : (next.season ?? season),
        club:
          (next.club ?? club) === DEFAULT_CLUB
            ? undefined
            : (next.club ?? club),
        half: "half" in next ? next.half : half,
      },
      replace: true,
    })

  const inHalf = (m: MonthReview) => !half || m.half === half
  const selected = review.months.filter(inHalf)
  const spanLabel = half ? HALF_LABEL[half] : `${season} season`
  const total = (pick: (m: MonthReview) => number) =>
    selected.reduce((sum, m) => sum + pick(m), 0)

  const [runsHover, setRunsHover] = useState<string | null>(null)
  const [hitsHover, setHitsHover] = useState<string | null>(null)
  const [inningHover, setInningHover] = useState<string | null>(null)
  const [hitterHover, setHitterHover] = useState<string | null>(null)
  const [monthHover, setMonthHover] = useState<string | null>(null)
  const [pitcherHover, setPitcherHover] = useState<string | null>(null)
  const [askHover, setAskHover] = useState<string | null>(null)
  const [bubbleHover, setBubbleHover] = useState<string | null>(null)
  const [stepHover, setStepHover] = useState<string | null>(null)

  // Runs: scored as the area, allowed as the line; the readout follows the pointer.
  const runPoints: AreaPoint[] = review.months.map((m) => ({
    id: m.id,
    label: m.label,
    values: { scored: m.runsFor, allowed: m.runsAgainst },
    muted: !inHalf(m),
  }))
  const runsMonth = review.months.find((m) => m.id === runsHover)
  const runsFor = runsMonth ? runsMonth.runsFor : total((m) => m.runsFor)
  const runsAgainst = runsMonth
    ? runsMonth.runsAgainst
    : total((m) => m.runsAgainst)

  // Hits by type, stacked by month; the legend's figures follow the pointer.
  const hitPoints: AreaPoint[] = review.months.map((m) => ({
    id: m.id,
    label: m.label,
    values: { ...m.hits },
    muted: !inHalf(m),
  }))
  const hitsMonth = review.months.find((m) => m.id === hitsHover)
  const hitLegend = HIT_TYPES.map((type, i) => ({
    id: type.id,
    label: type.label,
    fill: CATEGORICAL(i),
    value: count.format(
      hitsMonth ? hitsMonth.hits[type.id] : total((m) => m.hits[type.id]),
    ),
  }))

  // Hits by inning, stacked by type.
  const inningPoints: AreaPoint[] = review.innings.map((inning) => ({
    id: inning.id,
    label: inning.label,
    values: { ...inning.hits },
  }))
  const inning = review.innings.find((i) => i.id === inningHover)
  const inningHits = (inning ? [inning] : review.innings).reduce(
    (sum, i) => sum + Object.values(i.hits).reduce((a, b) => a + b, 0),
    0,
  )

  // Hitters by OPS, with last season's as the mark.
  const hitters = [...review.hitters].sort((a, b) => b.ops - a.ops)
  const opsTop = Math.max(...hitters.flatMap((h) => [h.ops, h.priorOps ?? 0]))
  const hitterRows = hitters.map((h) => ({
    id: h.id,
    label: h.name,
    value: h.ops,
    prior: h.priorOps,
    change: (
      <DeltaChip
        value={h.priorOps === null ? null : h.ops - h.priorOps}
        formatter={signedAverage}
      />
    ),
  }))

  // Wins toward the target: by half, then the pace's projection inside the gap.
  const firstHalfWins = review.months
    .filter((m) => m.half === "first")
    .reduce((sum, m) => sum + m.wins, 0)
  const secondHalfWins = review.wins - firstHalfWins
  const winSegments = [
    { id: "first", label: "First half", value: firstHalfWins },
    { id: "second", label: "Second half", value: secondHalfWins },
    ...(review.projectedWins > 0
      ? [
          {
            id: "pace",
            label: "On pace for",
            value: review.projectedWins,
            inset: true,
            outlined: true,
          },
        ]
      : []),
  ]

  // Results by opponent and month, with the club's own month under the rows.
  const columns = review.months.map((m) => ({
    id: m.id,
    label: m.label,
    muted: !inHalf(m),
  }))
  const heatRows = [
    ...review.opponents.map((o) => ({ id: o.club, label: o.club })),
    { id: "all", label: "All clubs", emphasis: true },
  ]
  const heatValue = (row: string, column: string) => {
    const index = review.months.findIndex((m) => m.id === column)
    if (row === "all") {
      const m = review.months[index]
      return m ? m.wins / m.games : null
    }
    return review.opponents.find((o) => o.club === row)?.byMonth[index] ?? null
  }

  // Pitchers: ERA by month as dots, the selection's ERA as the bar.
  const pitcherRows = review.pitchers.map((p) => {
    const inSpan = review.months
      .map((m, i) => (inHalf(m) ? p.byMonth[i] : null))
      .filter((v): v is number => v !== null)
    return {
      id: p.id,
      label: p.name,
      values: review.months.map((m, i) => ({
        id: m.id,
        value: p.byMonth[i] ?? null,
        muted: !inHalf(m),
      })),
      mark: inSpan.length
        ? Number((inSpan.reduce((a, b) => a + b, 0) / inSpan.length).toFixed(2))
        : null,
      prior: p.priorEra,
    }
  })

  // Contract asks filed each month, as boxes.
  const askBoxes = review.months.map((m) => ({
    id: m.id,
    label: m.label,
    ...spread(m.asks),
    muted: !inHalf(m),
  }))

  // Every hitter's production: plate appearances across, OPS up, home runs as area.
  const bubbles = review.hitters.map((h) => ({
    id: h.id,
    label: h.name,
    x: h.plateAppearances,
    y: h.ops,
    size: h.homers,
  }))

  // Run differential month by month.
  const steps = review.months.map((m) => ({
    id: m.id,
    label: m.label,
    rise: m.runsFor,
    fall: m.runsAgainst,
    muted: !inHalf(m),
  }))

  // Conversion rates, with last season's rate as the mark.
  const rateBars = review.rates.map((r) => ({
    id: r.id,
    label: r.label,
    filled: r.made,
    total: r.chances,
    tick: r.priorRate,
  }))

  // Home against away, measure by measure.
  const butterflyRows = review.homeAway.map((row) => ({
    id: row.id,
    label: row.label,
    left: row.home,
    right: row.away,
    leftPrior: row.homePrior,
    rightPrior: row.awayPrior,
    format: homeAwayFormat(row),
    leftChange: (
      <DeltaChip
        value={row.homePrior === null ? null : row.home - row.homePrior}
        formatter={homeAwayDelta(row)}
        invert={row.kind === "era"}
      />
    ),
    rightChange: (
      <DeltaChip
        value={row.awayPrior === null ? null : row.away - row.awayPrior}
        formatter={homeAwayDelta(row)}
        invert={row.kind === "era"}
      />
    ),
  }))

  const winRate = review.wins / Math.max(1, review.wins + review.losses)
  const differential = review.months.reduce(
    (sum, m) => sum + m.runsFor - m.runsAgainst,
    0,
  )

  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Season</PageTitle>
        <PageDescription>
          {club}, {season}: the club's figures month by month, with last season
          marked where there is one to compare against.
        </PageDescription>
      </PageHeader>

      <div className={styles.controls}>
        <Select
          label="Club"
          size="small"
          value={club}
          onChange={(value) => setSearch({ club: value as Club })}
          options={CLUBS.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Season"
          size="small"
          value={season}
          onChange={(value) => setSearch({ season: value as Season })}
          options={SEASONS.map((s) => ({
            value: s,
            label: s === DEFAULT_SEASON ? `${s} (in progress)` : s,
          }))}
        />
        <Select
          label="Half"
          size="small"
          isClearable
          placeholder="Whole season"
          value={half ?? ""}
          onChange={(value) =>
            setSearch({ half: value === "" ? undefined : (value as Half) })
          }
          options={HALVES.map((h) => ({ value: h, label: HALF_LABEL[h] }))}
        />
      </div>

      <div className={styles.summaryRow}>
        <SummaryCard
          title="Record"
          metric={`${review.wins}‑${review.losses}`}
          trend={review.months.map((m) => m.wins / m.games)}
          footer={
            <>
              <strong>{pct1.format(winRate)}</strong> win rate
            </>
          }
        />
        <SummaryCard
          title="Run differential"
          metric={signedCount.format(differential)}
          trend={review.months.map((m) => m.runsFor - m.runsAgainst)}
          footer={
            <>
              <strong>
                {count.format(review.months.reduce((s, m) => s + m.runsFor, 0))}
              </strong>{" "}
              scored
            </>
          }
        />
        <SummaryCard
          title="Average crowd"
          metric={count.format(review.attendanceAverage)}
          trend={review.months.map(
            (m) =>
              m.attendance.reduce((a, b) => a + b, 0) / m.attendance.length,
          )}
          footer={
            <>
              <strong>{pct.format(review.attendanceAverage / CAPACITY)}</strong>{" "}
              of capacity
            </>
          }
        />
        <SummaryCard
          title="Playoff odds"
          metric={pct.format(review.playoffOdds)}
          trend={review.months.map((m) => m.wins)}
          footer={
            review.priorPlayoffOdds === null ? undefined : (
              <>
                <strong>{pct.format(review.priorPlayoffOdds)}</strong> last
                season
              </>
            )
          }
        />
      </div>

      <div className={styles.grid}>
        <Card className={`${styles.card} ${styles.wide}`}>
          <CardHeader>
            <CardTitle level={3}>Runs scored and allowed</CardTitle>
            <CardDescription>
              Runs scored each month as the area, runs allowed as the line over
              it; the readout follows the month under the pointer.
            </CardDescription>
          </CardHeader>
          <AreaLine
            area={{ id: "scored", label: "Runs scored" }}
            line={{ id: "allowed", label: "Runs allowed" }}
            points={runPoints}
            format={(v) => count.format(v)}
            focus={runsHover}
            onHover={setRunsHover}
            span={spanLabel}
          />
          <Legend
            items={[
              { id: "scored", label: "Runs scored", fill: CATEGORICAL(0) },
              { id: "allowed", label: "Runs allowed", fill: CATEGORICAL(3) },
            ]}
          />
          <div className={styles.readout}>
            <Stat
              label={runsMonth ? runsMonth.label : spanLabel}
              value={count.format(runsFor)}
            />
            <Stat label="Allowed" value={count.format(runsAgainst)} />
            <Stat
              label="Differential"
              value={signedCount.format(runsFor - runsAgainst)}
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Hits by type</CardTitle>
            <CardDescription>
              Singles, doubles, triples and home runs stacked by month.
            </CardDescription>
          </CardHeader>
          <StackedArea
            bands={HIT_TYPES.map((t) => ({ id: t.id, label: t.label }))}
            points={hitPoints}
            format={(v) => count.format(v)}
            focus={hitsHover}
            onHover={setHitsHover}
            span={spanLabel}
          />
          <Legend items={hitLegend} />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Hits by inning</CardTitle>
            <CardDescription>
              Where in the game the hits come, stacked by type.
            </CardDescription>
          </CardHeader>
          <StackedBars
            bands={HIT_TYPES.map((t) => ({ id: t.id, label: t.label }))}
            points={inningPoints}
            format={(v) => count.format(v)}
            focus={inningHover}
            onHover={setInningHover}
          />
          <div className={styles.readout}>
            <Stat
              label={inning ? `Inning ${inning.label}` : "All innings"}
              value={count.format(inningHits)}
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Hitters by OPS</CardTitle>
            <CardDescription>
              On-base plus slugging this season; the mark is last season's.
            </CardDescription>
          </CardHeader>
          <BarList
            rows={hitterRows}
            domain={[0, Math.ceil(opsTop * 10) / 10]}
            format={average}
            focus={hitterHover}
            onHover={setHitterHover}
          />
        </Card>

        <Card className={`${styles.card} ${styles.centred}`}>
          <CardHeader>
            <CardTitle level={3}>Playoff odds</CardTitle>
            <CardDescription>
              The chance of a postseason place; the mark is last season's at the
              same point.
            </CardDescription>
          </CardHeader>
          <Gauge
            value={review.playoffOdds}
            tick={review.priorPlayoffOdds}
            tickLabel="last season"
            format={(v) => pct.format(v)}
          >
            <Stat
              size="large"
              label="Playoff odds"
              value={pct.format(review.playoffOdds)}
              change={
                <DeltaChip
                  value={
                    review.priorPlayoffOdds === null
                      ? null
                      : review.playoffOdds - review.priorPlayoffOdds
                  }
                  formatter={points}
                />
              }
            />
          </Gauge>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Wins toward {WIN_TARGET}</CardTitle>
            <CardDescription>
              Wins banked by half, the pace's projection inside the gap, and
              last season's total as the marker.
            </CardDescription>
          </CardHeader>
          <TargetBar
            target={WIN_TARGET}
            segments={winSegments}
            marker={
              review.priorWins === null
                ? undefined
                : {
                    value: review.priorWins,
                    label: `Last season ${review.priorWins}`,
                  }
            }
            format={(v) => count.format(v)}
          />
          <Legend
            items={[
              {
                id: "first",
                label: "First half",
                fill: "var(--juni-needle-700)",
                value: count.format(firstHalfWins),
              },
              {
                id: "second",
                label: "Second half",
                fill: CATEGORICAL(1),
                value: count.format(secondHalfWins),
              },
              ...(review.projectedWins > 0
                ? [
                    {
                      id: "pace",
                      label: "On pace for",
                      fill: CATEGORICAL(3),
                      value: count.format(review.projectedWins),
                    },
                  ]
                : []),
            ]}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Conversion rates</CardTitle>
            <CardDescription>
              Chances taken of chances had; the mark is last season's rate.
            </CardDescription>
          </CardHeader>
          <SplitBars
            bars={rateBars}
            format={(v) => count.format(v)}
            formatShare={(v) => pct.format(v)}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Home and away</CardTitle>
            <CardDescription>
              The same measures at home and on the road, each row on its own
              scale.
            </CardDescription>
          </CardHeader>
          <Butterfly
            rows={butterflyRows}
            left={{ label: "Home", color: HOME }}
            right={{ label: "Away", color: AWAY }}
            priorLabel="last season"
          />
        </Card>

        <Card className={`${styles.card} ${styles.wide}`}>
          <CardHeader>
            <CardTitle level={3}>Results by opponent</CardTitle>
            <CardDescription>
              Win rate against each club by month, and against the league under
              them.
            </CardDescription>
          </CardHeader>
          <HeatGrid
            rows={heatRows}
            columns={columns}
            value={heatValue}
            domain={[0, 1]}
            format={(v) => pct.format(v)}
            focus={monthHover}
            onHover={setMonthHover}
            span={spanLabel}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Rotation</CardTitle>
            <CardDescription>
              Each starter's earned run average by month, the selection's as the
              bar and last season's as the ring.
            </CardDescription>
          </CardHeader>
          <RangeDots
            rows={pitcherRows}
            format={era}
            priorLabel="last season"
            focus={pitcherHover}
            onHover={setPitcherHover}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Contract asks</CardTitle>
            <CardDescription>
              The spread of asks filed each month, on a log scale; focus a month
              for its highest and lowest.
            </CardDescription>
          </CardHeader>
          <BoxPlot
            boxes={askBoxes}
            format={(v) => usd.format(v)}
            countLabel="asks"
            focus={askHover}
            onHover={setAskHover}
            span={spanLabel}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Hitters' production</CardTitle>
            <CardDescription>
              Plate appearances across, OPS up, home runs as the bubble; the
              line is the league's OPS.
            </CardDescription>
          </CardHeader>
          <BubbleScatter
            bubbles={bubbles}
            formatX={(v) => count.format(v)}
            formatY={average}
            formatSize={homers}
            xLabel="Plate appearances"
            yLabel="OPS"
            reference={LEAGUE_OPS}
            height={260}
            focus={bubbleHover}
            onHover={setBubbleHover}
          />
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle level={3}>Run differential by month</CardTitle>
            <CardDescription>
              Runs scored as the rise, runs allowed as the fall; where a month
              ends is where the next begins.
            </CardDescription>
          </CardHeader>
          <Waterfall
            steps={steps}
            format={(v) => count.format(v)}
            focus={stepHover}
            onHover={setStepHover}
            span={spanLabel}
          />
          <Legend
            items={[
              {
                id: "rise",
                label: "Runs scored",
                fill: "var(--juni-waterfall-rise)",
              },
              {
                id: "fall",
                label: "Runs allowed",
                fill: "var(--juni-waterfall-fall)",
              },
            ]}
          />
        </Card>
      </div>
    </div>
  )
}
