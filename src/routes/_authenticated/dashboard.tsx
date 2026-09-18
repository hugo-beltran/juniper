import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  Button,
  LeadsTable,
  STAGES,
  type Lead,
  type LeadsFilterState,
} from "@/components";
import styles from "./dashboard.module.css";

/* Demo scouting pipeline — fictional players, clubs, and figures. Stands in
 * for a CRM leads list without carrying any real business data. Eight early
 * pipeline (Scouted) players carry no grade yet: they still need analysis. */
const LEADS: Lead[] = [
  { id: "1", player: "T. Okafor", position: "SP", club: "River Hawks", stage: "Signed", ask: 32_000_000, grade: 70, scout: "K. Tanaka", lastActivity: "1d ago" },
  { id: "2", player: "D. Whitlock", position: "OF", club: "Bayside Nine", stage: "Offer", ask: 24_000_000, grade: 65, scout: "S. Whitfield", lastActivity: "5h ago" },
  { id: "3", player: "A. Sandoval", position: "SS", club: "Copper Kings", stage: "Workout", ask: 15_000_000, grade: 60, scout: "S. Whitfield", lastActivity: "6h ago" },
  { id: "4", player: "N. Petrov", position: "OF", club: "Dust Devils", stage: "Contacted", ask: 11_000_000, grade: 60, scout: "M. Arroyo", lastActivity: "4d ago" },
  { id: "5", player: "H. Okada", position: "2B", club: "Bayside Nine", stage: "Signed", ask: 9_750_000, grade: 55, scout: "K. Tanaka", lastActivity: "3w ago" },
  { id: "6", player: "R. Delgado", position: "3B", club: "Copper Kings", stage: "Offer", ask: 8_500_000, grade: 55, scout: "M. Arroyo", lastActivity: "2h ago" },
  { id: "7", player: "J. Paulino", position: "SP", club: "Dust Devils", stage: "Workout", ask: 6_000_000, grade: 50, scout: "M. Arroyo", lastActivity: "3d ago" },
  { id: "8", player: "Y. Fukuda", position: "RP", club: "Harbor Cats", stage: "Contacted", ask: 4_800_000, grade: 55, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "9", player: "E. Marsh", position: "1B", club: "River Hawks", stage: "Scouted", ask: 3_200_000, grade: 40, scout: "L. Moreau", lastActivity: "2w ago" },
  { id: "10", player: "C. Braithwaite", position: "C", club: "Northgate Owls", stage: "Scouted", ask: 2_100_000, grade: 45, scout: "L. Moreau", lastActivity: "1w ago" },
  { id: "11", player: "S. Ferreira", position: "CF", club: "Harbor Cats", stage: "Contacted", ask: 7_400_000, grade: 50, scout: "S. Whitfield", lastActivity: "8h ago" },
  { id: "12", player: "M. Kowalski", position: "RP", club: "Northgate Owls", stage: "Scouted", ask: 950_000, scout: "L. Moreau", lastActivity: "5d ago" },
  { id: "13", player: "G. Ellison", position: "LF", club: "Ironwood Foxes", stage: "Scouted", ask: 1_800_000, grade: 45, scout: "R. Osei", lastActivity: "3d ago" },
  { id: "14", player: "V. Castellanos", position: "DH", club: "Cascade Pilots", stage: "Contacted", ask: 13_500_000, grade: 60, scout: "P. Lindqvist", lastActivity: "1d ago" },
  { id: "15", player: "O. Nakamura", position: "SS", club: "Northgate Owls", stage: "Workout", ask: 9_200_000, grade: 55, scout: "K. Tanaka", lastActivity: "12h ago" },
  { id: "16", player: "B. Kowalczyk", position: "RP", club: "River Hawks", stage: "Scouted", ask: 1_200_000, scout: "L. Moreau", lastActivity: "6d ago" },
  { id: "17", player: "F. Duarte", position: "CF", club: "Copper Kings", stage: "Offer", ask: 18_000_000, grade: 65, scout: "S. Whitfield", lastActivity: "3h ago" },
  { id: "18", player: "W. Achterberg", position: "1B", club: "Harbor Cats", stage: "Scouted", ask: 2_600_000, grade: 45, scout: "R. Osei", lastActivity: "9d ago" },
  { id: "19", player: "I. Marchetti", position: "C", club: "Dust Devils", stage: "Contacted", ask: 5_400_000, grade: 50, scout: "M. Arroyo", lastActivity: "1d ago" },
  { id: "20", player: "L. Beaumont", position: "SP", club: "Bayside Nine", stage: "Workout", ask: 21_000_000, grade: 65, scout: "P. Lindqvist", lastActivity: "7h ago" },
  { id: "21", player: "K. Adeyemi", position: "OF", club: "Ironwood Foxes", stage: "Signed", ask: 12_250_000, grade: 60, scout: "R. Osei", lastActivity: "1w ago" },
  { id: "22", player: "T. Vasquez", position: "2B", club: "Cascade Pilots", stage: "Scouted", ask: 1_500_000, scout: "L. Moreau", lastActivity: "4d ago" },
  { id: "23", player: "J. Lindgren", position: "RP", club: "Northgate Owls", stage: "Contacted", ask: 3_900_000, grade: 50, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "24", player: "M. Okonkwo", position: "3B", club: "River Hawks", stage: "Workout", ask: 7_700_000, grade: 55, scout: "M. Arroyo", lastActivity: "1d ago" },
  { id: "25", player: "P. Aoki", position: "SS", club: "Harbor Cats", stage: "Scouted", ask: 2_300_000, grade: 45, scout: "L. Moreau", lastActivity: "2w ago" },
  { id: "26", player: "D. Ferrante", position: "SP", club: "Copper Kings", stage: "Offer", ask: 27_000_000, grade: 70, scout: "S. Whitfield", lastActivity: "1h ago" },
  { id: "27", player: "R. Silva", position: "LF", club: "Dust Devils", stage: "Contacted", ask: 6_800_000, grade: 55, scout: "P. Lindqvist", lastActivity: "3d ago" },
  { id: "28", player: "C. Mbeki", position: "RF", club: "Bayside Nine", stage: "Scouted", ask: 1_900_000, scout: "R. Osei", lastActivity: "5d ago" },
  { id: "29", player: "S. Novak", position: "C", club: "Ironwood Foxes", stage: "Workout", ask: 4_500_000, grade: 50, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "30", player: "A. Guerrero", position: "UTL", club: "Cascade Pilots", stage: "Signed", ask: 5_500_000, grade: 55, scout: "M. Arroyo", lastActivity: "2w ago" },
  { id: "31", player: "E. Thorne", position: "RP", club: "River Hawks", stage: "Scouted", ask: 900_000, scout: "L. Moreau", lastActivity: "3w ago" },
  { id: "32", player: "H. Villanueva", position: "OF", club: "Northgate Owls", stage: "Offer", ask: 16_500_000, grade: 60, scout: "S. Whitfield", lastActivity: "4h ago" },
  { id: "33", player: "N. Baptiste", position: "CF", club: "Harbor Cats", stage: "Contacted", ask: 8_900_000, grade: 55, scout: "P. Lindqvist", lastActivity: "2d ago" },
  { id: "34", player: "G. Sorensen", position: "1B", club: "Copper Kings", stage: "Scouted", ask: 2_800_000, grade: 45, scout: "R. Osei", lastActivity: "1w ago" },
  { id: "35", player: "Y. Cho", position: "2B", club: "Dust Devils", stage: "Workout", ask: 6_200_000, grade: 55, scout: "K. Tanaka", lastActivity: "9h ago" },
  { id: "36", player: "O. Farrell", position: "SP", club: "Bayside Nine", stage: "Contacted", ask: 10_500_000, grade: 60, scout: "M. Arroyo", lastActivity: "5d ago" },
  { id: "37", player: "J. Antunes", position: "3B", club: "Ironwood Foxes", stage: "Scouted", ask: 2_000_000, scout: "L. Moreau", lastActivity: "6d ago" },
  { id: "38", player: "B. Haruki", position: "RF", club: "Cascade Pilots", stage: "Signed", ask: 14_000_000, grade: 60, scout: "P. Lindqvist", lastActivity: "3w ago" },
  { id: "39", player: "M. Delacroix", position: "SS", club: "River Hawks", stage: "Contacted", ask: 7_100_000, grade: 55, scout: "S. Whitfield", lastActivity: "1d ago" },
  { id: "40", player: "W. Bonsu", position: "DH", club: "Northgate Owls", stage: "Scouted", ask: 3_400_000, scout: "R. Osei", lastActivity: "2d ago" },
  { id: "41", player: "F. Lindström", position: "LF", club: "Harbor Cats", stage: "Workout", ask: 5_800_000, grade: 50, scout: "K. Tanaka", lastActivity: "1d ago" },
  { id: "42", player: "A. Petrakis", position: "C", club: "Copper Kings", stage: "Scouted", ask: 1_600_000, scout: "L. Moreau", lastActivity: "10d ago" },
  { id: "43", player: "T. Iwamoto", position: "RP", club: "Dust Devils", stage: "Offer", ask: 4_200_000, grade: 55, scout: "M. Arroyo", lastActivity: "8h ago" },
  { id: "44", player: "L. Cardoso", position: "CF", club: "Bayside Nine", stage: "Signed", ask: 19_500_000, grade: 65, scout: "S. Whitfield", lastActivity: "4d ago" },
];

/* Filter state lives in the URL (?pending=true&stage=Offer&club=…&scout=…)
 * so a filtered view survives reload and can be shared. The schema is the
 * sanitizer: every field is optional, checked against the values that
 * actually exist in the data, and an invalid value falls back to "unset"
 * (.catch) instead of erroring the page — a hand-edited or stale link
 * degrades to the unfiltered table. Defaults are never written, so the URL
 * stays clean when nothing is filtered. */
const CLUBS = [...new Set(LEADS.map((lead) => lead.club))].sort();
const SCOUTS = [...new Set(LEADS.map((lead) => lead.scout))].sort();

const searchSchema = z.object({
  pending: z.literal(true).optional().catch(undefined),
  stage: z.enum(STAGES).optional().catch(undefined),
  club: z.enum(CLUBS as [string, ...string[]]).optional().catch(undefined),
  scout: z.enum(SCOUTS as [string, ...string[]]).optional().catch(undefined),
});

type DashboardSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: searchSchema,
  component: DashboardPage,
});

const toFilters = (search: DashboardSearch): LeadsFilterState => ({
  pendingOnly: search.pending ?? false,
  stage: search.stage ?? "",
  club: search.club ?? "",
  scout: search.scout ?? "",
});

const toSearch = (filters: LeadsFilterState): DashboardSearch => ({
  pending: filters.pendingOnly || undefined,
  stage: filters.stage || undefined,
  club: filters.club || undefined,
  scout: filters.scout || undefined,
});

function DashboardPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  /* The table is controlled: it reports the next filter state and the page
   * writes it to the URL. replace, not push — filter tweaks should not pile
   * up history entries. */
  const handleFiltersChange = (filters: LeadsFilterState) =>
    navigate({ to: "/dashboard", search: toSearch(filters), replace: true });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Scouting Pipeline</h1>
        <Button
          size="small"
          onPress={() => navigate({ to: "/scout-report" })}
        >
          New SCOUT report
        </Button>
      </div>
      <LeadsTable
        leads={LEADS}
        filters={toFilters(search)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
