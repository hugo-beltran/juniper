import { useMemo, useState } from "react";
import { Blobatar } from "@blobatar/react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { blobatarPalette } from "@/lib/blobatar-palette";
import { LeadsFilters } from "./leads-filters";
import styles from "./leads-table.module.css";

/* CRM-style leads table, sports flavor: free-agent targets moving through a
 * scouting pipeline. Flat and borderless — hierarchy comes from type and
 * spacing, not rules. Filtering (stage, club, scout) lives in the inline
 * LeadsFilters panel above the table; the table owns the filter state. */

export const STAGES = [
  "Scouted",
  "Contacted",
  "Workout",
  "Offer",
  "Signed",
] as const;
export type Stage = (typeof STAGES)[number];

/* Funnel position per stage — Stage-column sorting orders by pipeline
 * progress, not alphabet. */
const STAGE_ORDER = Object.fromEntries(
  STAGES.map((stage, index) => [stage, index]),
) as Record<Stage, number>;

/* Filter state the table renders. Controlled by the page (which keeps it
 * in the route's search params) or, when no `filters` prop is passed, held
 * internally. "" means "any" for the select filters. */
export interface LeadsFilterState {
  pendingOnly: boolean;
  stage: Stage | "";
  club: string;
  scout: string;
}

export const EMPTY_LEADS_FILTERS: LeadsFilterState = {
  pendingOnly: false,
  stage: "",
  club: "",
  scout: "",
};

export interface Lead {
  id: string;
  player: string;
  position: string;
  club: string;
  stage: Stage;
  /** contract ask, USD */
  ask: number;
  /** 20-80 scouting grade; absent until the player has been analyzed */
  grade?: number;
  scout: string;
  lastActivity: string;
}

const formatAsk = (usd: number) =>
  usd >= 1_000_000
    ? `$${+(usd / 1_000_000).toFixed(1)}M`
    : `$${Math.round(usd / 1_000)}K`;

/* Grade → badge tone (20-80 scale: 60+ is plus). */
const gradeClass = (grade: number) =>
  grade >= 60
    ? styles.gradePlus
    : grade >= 50
      ? styles.gradeAvg
      : styles.gradeLow;

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
const helper = createColumnHelper<typeof features, Lead>();

const columns = helper.columns([
  helper.accessor("player", {
    header: "Player",
    cell: ({ row }) => (
      <div className={styles.player}>
        <Blobatar
          name={row.original.player}
          palette={blobatarPalette(row.original.player)}
          size={28}
        />
        <span className={styles.playerName}>{row.original.player}</span>
        <span className={styles.position}>({row.original.position})</span>
      </div>
    ),
  }),
  helper.accessor("club", { header: "Club" }),
  helper.accessor("stage", {
    header: "Stage",
    sortFn: (rowA, rowB) =>
      STAGE_ORDER[rowA.original.stage] - STAGE_ORDER[rowB.original.stage],
    cell: ({ row }) => {
      const stageIndex = STAGE_ORDER[row.original.stage];

      return (
        <span className={styles.stage}>
          ●{stageIndex > 0 && "●".repeat(stageIndex)}
          {stageIndex < 4 && "○".repeat(4 - stageIndex)}
          <strong>{row.original.stage}</strong>
        </span>
      );
    },
  }),
  helper.accessor("ask", {
    header: "Ask",
    cell: ({ row }) => (
      <span className={styles.ask}>{formatAsk(row.original.ask)}</span>
    ),
  }),
  helper.accessor("grade", {
    header: "Grade",
    /* Ungraded players sink to the bottom whichever way the column sorts. */
    sortUndefined: "last",
    cell: ({ row }) => {
      const { grade } = row.original;
      return grade === undefined ? (
        <span className={`${styles.grade} ${styles.gradePending}`}>
          <span aria-hidden>&mdash;</span>
          <span className="sr-only">Grade pending</span>
        </span>
      ) : (
        <span className={`${styles.grade} ${gradeClass(grade)}`}>{grade}</span>
      );
    },
  }),
  helper.accessor("scout", { header: "Scout" }),
  helper.accessor("lastActivity", {
    header: "Activity",
    /* "2h ago" strings sort alphabetically, which would lie — leave this
     * column unsortable until activity carries a real timestamp. */
    enableSorting: false,
    cell: ({ row }) => (
      <span className={styles.activity}>{row.original.lastActivity}</span>
    ),
  }),
]);

/* Controlled or uncontrolled, like Sidebar and TenantSwitcher: pass
 * `filters` + `onFiltersChange` to own the state (the dashboard keeps it in
 * the URL); omit both and the table keeps it internally. The table never
 * touches the router — it only reports the next state. */
export function LeadsTable({
  leads,
  filters: filtersProp,
  onFiltersChange,
}: {
  leads: Lead[];
  filters?: LeadsFilterState;
  onFiltersChange?: (filters: LeadsFilterState) => void;
}) {
  const [internalFilters, setInternalFilters] =
    useState<LeadsFilterState>(EMPTY_LEADS_FILTERS);
  const filters = filtersProp ?? internalFilters;
  const setFilters = (next: LeadsFilterState) => {
    if (onFiltersChange) onFiltersChange(next);
    else setInternalFilters(next);
  };
  const patch = (partial: Partial<LeadsFilterState>) =>
    setFilters({ ...filters, ...partial });
  const {
    pendingOnly,
    stage: stageFilter,
    club: clubFilter,
    scout: scoutFilter,
  } = filters;

  /* Stage options carry their pipeline counts (over all leads, not the
   * filtered set) so the select doubles as a funnel summary. */
  const stageOptions = useMemo(
    () =>
      STAGES.map((stage) => ({
        value: stage,
        label: stage,
        hint: String(leads.filter((lead) => lead.stage === stage).length),
      })),
    [leads],
  );

  const clubs = useMemo(
    () => [...new Set(leads.map((lead) => lead.club))].sort(),
    [leads],
  );

  const scouts = useMemo(
    () => [...new Set(leads.map((lead) => lead.scout))].sort(),
    [leads],
  );

  const filtered = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (!pendingOnly || lead.grade === undefined) &&
          (stageFilter === "" || lead.stage === stageFilter) &&
          (clubFilter === "" || lead.club === clubFilter) &&
          (scoutFilter === "" || lead.scout === scoutFilter),
      ),
    [leads, pendingOnly, stageFilter, clubFilter, scoutFilter],
  );

  const table = useTable({ features, columns, data: filtered });

  const clearFilters = () => setFilters(EMPTY_LEADS_FILTERS);

  return (
    <div data-slot="leads-table">
      <LeadsFilters
        toggles={[
          /* Off: every lead. On: only leads still awaiting a grade. The
           * label names what "on" does, per switch semantics. */
          {
            id: "pending",
            label: "Pending analysis only",
            description: "Leads scouted but not yet graded",
            checked: pendingOnly,
            onChange: (checked) => patch({ pendingOnly: checked }),
          },
        ]}
        fields={[
          {
            id: "stage",
            label: "Stage",
            value: stageFilter,
            options: stageOptions,
            onChange: (value) => patch({ stage: value as Stage | "" }),
          },
          {
            id: "club",
            label: "Club",
            value: clubFilter,
            options: clubs.map((club) => ({ value: club, label: club })),
            onChange: (value) => patch({ club: value }),
          },
          {
            id: "scout",
            label: "Scout",
            value: scoutFilter,
            options: scouts.map((scout) => ({ value: scout, label: scout })),
            onChange: (value) => patch({ scout: value }),
          },
        ]}
        onClearAll={clearFilters}
        resultCount={filtered.length}
        totalCount={leads.length}
      />

      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={styles.th}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        <span className={styles.sortIndicator} aria-hidden>
                          {sorted === "asc"
                            ? "▲"
                            : sorted === "desc"
                              ? "▼"
                              : ""}
                        </span>
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.row}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={styles.td}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <p className={styles.empty}>No leads match the current filters.</p>
      )}
    </div>
  );
}
