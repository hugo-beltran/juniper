import { useMemo, useState } from "react";
import { Blobatar } from "@blobatar/react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { FilterBar } from "@/components/filter-bar/filter-bar";
import { blobatarPalette } from "@/lib/blobatar-palette";
import styles from "./users-table.module.css";

/* Workspace members table for a content-manager tenant: who has access,
 * with what role, and when they were last around. Flat and borderless like
 * the leads table — hierarchy from type and spacing. A search box plus Role
 * and Status filters live in the shared FilterBar above; the table owns the
 * filter state or hands it to the page. */

export const USER_ROLES = [
  "Owner",
  "Admin",
  "Editor",
  "Contributor",
  "Viewer",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["Active", "Invited", "Suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/* Role sorts by privilege, not alphabet. */
const ROLE_ORDER = Object.fromEntries(
  USER_ROLES.map((role, index) => [role, index]),
) as Record<UserRole, number>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** ISO timestamp; absent for an invite that was never accepted. */
  lastActiveAt?: string;
  /** ISO date the account was created or invited. */
  joinedAt: string;
}

export interface UsersFilterState {
  /** Matches name or email, case-insensitive. */
  query: string;
  role: UserRole | "";
  status: UserStatus | "";
}

export const EMPTY_USERS_FILTERS: UsersFilterState = {
  query: "",
  role: "",
  status: "",
};

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/* "3 days ago", "2 hours ago", "yesterday" — from a timestamp, so the column
 * can sort by time while showing words. */
function formatRelative(iso: string, now = Date.now()) {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relative.format(days, "day");
  return relative.format(Math.round(days / 30), "month");
}

const statusClass: Record<UserStatus, string> = {
  Active: styles.statusActive,
  Invited: styles.statusInvited,
  Suspended: styles.statusSuspended,
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
const helper = createColumnHelper<typeof features, User>();

const columns = helper.columns([
  helper.accessor("name", {
    header: "Member",
    cell: ({ row }) => (
      <div className={styles.member}>
        <Blobatar
          name={row.original.name}
          palette={blobatarPalette(row.original.name)}
          size={28}
        />
        <span className={styles.memberText}>
          <span className={styles.memberName}>{row.original.name}</span>
          <span className={styles.memberEmail}>{row.original.email}</span>
        </span>
      </div>
    ),
  }),
  helper.accessor("role", {
    header: "Role",
    sortFn: (rowA, rowB) =>
      ROLE_ORDER[rowA.original.role] - ROLE_ORDER[rowB.original.role],
    cell: ({ row }) => <span className={styles.role}>{row.original.role}</span>,
  }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ row }) => (
      <span className={`${styles.status} ${statusClass[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  }),
  helper.accessor("lastActiveAt", {
    header: "Last active",
    /* Never-active invitees sink to the bottom whichever way it sorts. */
    sortUndefined: "last",
    cell: ({ row }) => {
      const { lastActiveAt } = row.original;
      return (
        <span className={styles.when}>
          {lastActiveAt ? formatRelative(lastActiveAt) : "Never"}
        </span>
      );
    },
  }),
  helper.accessor("joinedAt", {
    header: "Joined",
    cell: ({ row }) => (
      <span className={styles.when}>
        {dateFormat.format(new Date(row.original.joinedAt))}
      </span>
    ),
  }),
]);

/* Controlled or uncontrolled, like LeadsTable: pass `filters` +
 * `onFiltersChange` to own the state (the users page keeps it in the URL);
 * omit both and the table keeps it internally. The table never touches the
 * router. */
export function UsersTable({
  users,
  filters: filtersProp,
  onFiltersChange,
}: {
  users: User[];
  filters?: UsersFilterState;
  onFiltersChange?: (filters: UsersFilterState) => void;
}) {
  const [internalFilters, setInternalFilters] =
    useState<UsersFilterState>(EMPTY_USERS_FILTERS);
  const filters = filtersProp ?? internalFilters;
  const setFilters = (next: UsersFilterState) => {
    if (onFiltersChange) onFiltersChange(next);
    else setInternalFilters(next);
  };
  const patch = (partial: Partial<UsersFilterState>) =>
    setFilters({ ...filters, ...partial });
  const { query, role: roleFilter, status: statusFilter } = filters;

  /* Role and status options carry their counts over all users, so the
   * selects double as a roster summary. */
  const roleOptions = useMemo(
    () =>
      USER_ROLES.map((role) => ({
        value: role,
        label: role,
        hint: String(users.filter((user) => user.role === role).length),
      })),
    [users],
  );
  const statusOptions = useMemo(
    () =>
      USER_STATUSES.map((status) => ({
        value: status,
        label: status,
        hint: String(users.filter((user) => user.status === status).length),
      })),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter(
      (user) =>
        (needle === "" ||
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle)) &&
        (roleFilter === "" || user.role === roleFilter) &&
        (statusFilter === "" || user.status === statusFilter),
    );
  }, [users, query, roleFilter, statusFilter]);

  const table = useTable({ features, columns, data: filtered });

  return (
    <div data-slot="users-table">
      <FilterBar
        search={{
          label: "Search",
          placeholder: "Name or email",
          value: query,
          onChange: (value) => patch({ query: value }),
        }}
        fields={[
          {
            id: "role",
            label: "Role",
            value: roleFilter,
            options: roleOptions,
            onChange: (value) => patch({ role: value as UserRole | "" }),
          },
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            options: statusOptions,
            onChange: (value) =>
              patch({ status: value as UserStatus | "" }),
          },
        ]}
        onClearAll={() => setFilters(EMPTY_USERS_FILTERS)}
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
        <p className={styles.empty}>No users match the current filters.</p>
      )}
    </div>
  );
}
