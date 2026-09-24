import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button, LeadsTable, STAGES, type LeadsFilterState } from "@/components"
import { LEADS, leadsQuery } from "@/lib/api"
import styles from "./dashboard.module.css"

/* Filter state lives in the URL (?pending=true&stage=Offer&club=…&scout=…)
 * so a filtered view survives reload and can be shared. The schema is the
 * sanitizer: every field is optional, checked against the values that
 * actually exist in the data, and an invalid value falls back to "unset"
 * (.catch) instead of erroring the page — a hand-edited or stale link
 * degrades to the unfiltered table. Defaults are never written, so the URL
 * stays clean when nothing is filtered. */
/* Enum sources come from the seed constant, not the query: the schema is
 * built at module load. */
const CLUBS = [...new Set(LEADS.map((lead) => lead.club))].sort()
const SCOUTS = [...new Set(LEADS.map((lead) => lead.scout))].sort()

const searchSchema = z.object({
  pending: z.literal(true).optional().catch(undefined),
  stage: z.enum(STAGES).optional().catch(undefined),
  club: z
    .enum(CLUBS as [string, ...string[]])
    .optional()
    .catch(undefined),
  scout: z
    .enum(SCOUTS as [string, ...string[]])
    .optional()
    .catch(undefined),
})

type DashboardSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: DashboardPage,
})

const toFilters = (search: DashboardSearch): LeadsFilterState => ({
  pendingOnly: search.pending ?? false,
  stage: search.stage ?? "",
  club: search.club ?? "",
  scout: search.scout ?? "",
})

const toSearch = (filters: LeadsFilterState): DashboardSearch => ({
  pending: filters.pendingOnly || undefined,
  stage: filters.stage || undefined,
  club: filters.club || undefined,
  scout: filters.scout || undefined,
})

function DashboardPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { data: leads } = useSuspenseQuery(leadsQuery)

  /* The table is controlled: it reports the next filter state and the page
   * writes it to the URL. replace, not push — filter tweaks should not pile
   * up history entries. */
  const handleFiltersChange = (filters: LeadsFilterState) =>
    navigate({ to: "/dashboard", search: toSearch(filters), replace: true })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Scouting Pipeline</h1>
        <Button size="small" onPress={() => navigate({ to: "/scout-report" })}>
          New SCOUT report
        </Button>
      </div>
      <LeadsTable
        leads={leads}
        filters={toFilters(search)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}
