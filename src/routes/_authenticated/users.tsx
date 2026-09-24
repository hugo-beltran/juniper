import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  PageDescription,
  PageHeader,
  PageTitle,
  USER_ROLES,
  USER_STATUSES,
  UsersTable,
  type UsersFilterState,
} from "@/components";
import { usersQuery } from "@/lib/api";
import styles from "./users.module.css";

/* Filter state lives in the URL (?q=ana&role=Editor&status=Invited) so a
 * filtered roster survives reload and can be shared. The schema is the
 * sanitizer: every field optional, enums checked against the roles and
 * statuses that exist, invalid values falling back to unset. Defaults are
 * never written. */
const searchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  role: z.enum(USER_ROLES).optional().catch(undefined),
  status: z.enum(USER_STATUSES).optional().catch(undefined),
});

type UsersSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/_authenticated/users")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
  component: UsersPage,
});

const toFilters = (search: UsersSearch): UsersFilterState => ({
  query: search.q ?? "",
  role: search.role ?? "",
  status: search.status ?? "",
});

const toSearch = (filters: UsersFilterState): UsersSearch => ({
  q: filters.query.trim() || undefined,
  role: filters.role || undefined,
  status: filters.status || undefined,
});

function UsersPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data: users } = useSuspenseQuery(usersQuery);

  /* Controlled table: it reports the next filter state and the page writes
   * it to the URL with replace, so typing in the search box does not pile
   * up history entries. */
  const handleFiltersChange = (filters: UsersFilterState) =>
    navigate({ to: "/users", search: toSearch(filters), replace: true });

  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <PageDescription>
            Everyone with access to this workspace, their role and when they
            were last active.
        </PageDescription>
      </PageHeader>
      <UsersTable
        users={users}
        filters={toFilters(search)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
