import { useMemo, useState } from "react";
import { Blobatar } from "@blobatar/react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ToggleButton,
  ToggleButtonGroup,
  type Selection,
} from "react-aria-components";
import { Button } from "@/components/button/button";
import { blobatarPalette } from "@/lib/blobatar-palette";
import styles from "./leads-table.module.css";

/* CRM-style leads table, sports flavor: free-agent targets moving through a
 * scouting pipeline. Flat and borderless — hierarchy comes from type and
 * spacing, not rules. Classification chips at the top filter by stage. */

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

export interface Lead {
  id: string;
  player: string;
  position: string;
  club: string;
  stage: Stage;
  /** contract ask, USD */
  ask: number;
  /** 20-80 scouting grade */
  grade: number;
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
          palette={blobatarPalette(row.original.player, "soft")}
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
    cell: ({ row }) => (
      <span className={styles.stage}>
        <i className={styles.stageDot} aria-hidden />
        {row.original.stage}
      </span>
    ),
  }),
  helper.accessor("ask", {
    header: "Ask",
    cell: ({ row }) => (
      <span className={styles.ask}>{formatAsk(row.original.ask)}</span>
    ),
  }),
  helper.accessor("grade", {
    header: "Grade",
    cell: ({ row }) => (
      <span className={`${styles.grade} ${gradeClass(row.original.grade)}`}>
        {row.original.grade}
      </span>
    ),
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

const ALL = "all";

/* Header-cell filter: a funnel trigger with an invisible native <select>
 * stretched over it — native semantics and keyboard support, styled face.
 * Shows the active value beside the funnel while filtering. */
function HeaderFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <span
      className={styles.headerFilter}
      data-active={value !== "" || undefined}
    >
      <FunnelIcon className={styles.filterIcon} aria-hidden />
      {value !== "" && <span className={styles.filterBadge} aria-hidden />}
      <select
        aria-label={`Filter by ${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.filterSelect}
      >
        <option value="">All {label}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </span>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [stageFilter, setStageFilter] = useState<Stage | typeof ALL>(ALL);
  const [clubFilter, setClubFilter] = useState("");
  const [scoutFilter, setScoutFilter] = useState("");

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const key = keys.values().next().value;
    if (key !== undefined) setStageFilter(key as Stage | typeof ALL);
  };

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
          (stageFilter === ALL || lead.stage === stageFilter) &&
          (clubFilter === "" || lead.club === clubFilter) &&
          (scoutFilter === "" || lead.scout === scoutFilter),
      ),
    [leads, stageFilter, clubFilter, scoutFilter],
  );

  const table = useTable({ features, columns, data: filtered });

  const hasActiveFilters =
    stageFilter !== ALL || clubFilter !== "" || scoutFilter !== "";
  const clearFilters = () => {
    setStageFilter(ALL);
    setClubFilter("");
    setScoutFilter("");
  };

  return (
    <div data-slot="leads-table">
      <div className={styles.toolbar}>
        <ToggleButtonGroup
          aria-label="Filter by stage"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[stageFilter]}
          onSelectionChange={handleSelectionChange}
          className={styles.chips}
        >
          <ToggleButton id={ALL} className={styles.chip}>
            All
            <span className={styles.chipCount}>{leads.length}</span>
          </ToggleButton>
          {STAGES.map((stage) => {
            const count = leads.filter((lead) => lead.stage === stage).length;
            return (
              <ToggleButton key={stage} id={stage} className={styles.chip}>
                {stage}
                <span className={styles.chipCount}>{count}</span>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        {hasActiveFilters && (
          <Button size="mini" variant="discrete" onPress={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

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
                    {header.column.id === "club" && (
                      <HeaderFilter
                        label="club"
                        options={clubs}
                        value={clubFilter}
                        onChange={setClubFilter}
                      />
                    )}
                    {header.column.id === "scout" && (
                      <HeaderFilter
                        label="scout"
                        options={scouts}
                        value={scoutFilter}
                        onChange={setScoutFilter}
                      />
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
