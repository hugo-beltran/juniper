import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  ChartPieIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  CubeIcon,
  CubeTransparentIcon,
  DevicePhoneMobileIcon,
  LifebuoyIcon,
  MapIcon,
  PencilSquareIcon,
  RectangleGroupIcon,
  SparklesIcon,
  SwatchIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import {
  type ComponentProps,
  type ComponentType,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type SVGProps,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  Dock,
  DockItem,
  DockMore,
  DockPanel,
  DockRow,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInsetHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarStrip,
  SidebarTrigger,
  TenantSwitcher,
  UserProfile,
  useSidebar,
} from "@/components"
import {
  currentUserQuery,
  defaultTenant,
  dockItems,
  firstRoute,
  leadsQuery,
  type NavBadge,
  type NavIcon,
  type NavItem,
  type NavTenant,
  navigationQuery,
  pendingAnalysisCount,
} from "@/lib/api"
import styles from "./_authenticated.module.css"

export const Route = createFileRoute("/_authenticated")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(navigationQuery),
      context.queryClient.ensureQueryData(currentUserQuery),
      context.queryClient.ensureQueryData(leadsQuery),
    ]),
  component: AuthenticatedLayout,
})

/* The menu tree comes from the navigation resource (src/lib/nav-tree.json
 * behind navigationQuery, standing in for a server response): every menu
 * group belongs to a tenant, there are no fixed items. Icon names in the
 * data map to heroicons here. */
const ICONS: Record<NavIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  swatch: SwatchIcon,
  "cube-transparent": CubeTransparentIcon,
  "book-open": BookOpenIcon,
  lifebuoy: LifebuoyIcon,
  "rectangle-group": RectangleGroupIcon,
  "arrows-right-left": ArrowsRightLeftIcon,
  "chart-pie": ChartPieIcon,
  cog: Cog6ToothIcon,
  cube: CubeIcon,
  users: UsersIcon,
  "pencil-square": PencilSquareIcon,
  "arrow-right-end-on-rectangle": ArrowRightEndOnRectangleIcon,
  sparkles: SparklesIcon,
  "device-phone-mobile": DevicePhoneMobileIcon,
  "user-circle": UserCircleIcon,
}

/* Badge sources named in the tree, resolved to live counts here. 0 hides
 * the badge. */
type Badges = Record<NavBadge, number>

function useNavBadges(): Badges {
  const { data: leads } = useSuspenseQuery(leadsQuery)
  return { "pending-analysis": pendingAnalysisCount(leads) }
}

const badgeCount = (item: NavItem, badges: Badges) =>
  item.badge ? badges[item.badge] : 0

/* The words a badge carries for screen readers, inside the label so the
 * row reads "Scouting, 8 leads pending analysis" in that order. */
const badgeWords = (count: number) =>
  count > 0 && (
    <span className="sr-only">{`, ${count} leads pending analysis`}</span>
  )

/* An item's link: a router Link for a route, an anchor for an external
 * href. Slotted into SidebarMenuButton or DockItem with asChild, which
 * pass their props down through this component. */
function NavLink({
  item,
  ...props
}: { item: NavItem } & Omit<ComponentProps<"a">, "href" | "target" | "rel">) {
  return item.to !== undefined ? (
    <Link to={item.to} {...props} />
  ) : (
    <a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
      {...props}
    />
  )
}

/* What every nav row and dock cell holds: the icon, the dot (before the
 * label in DOM order, see SidebarMenuBadge; the CSS places it) and the
 * label with the badge's words inside. */
function NavItemContent({ item, badges }: { item: NavItem; badges: Badges }) {
  const Icon = ICONS[item.icon]
  const count = badgeCount(item, badges)
  return (
    <>
      <Icon />
      {count > 0 && <SidebarMenuBadge />}
      <span>
        {item.label}
        {badgeWords(count)}
      </span>
    </>
  )
}

/* A sidebar row (in the column, or behind More in the dock's panel). */
function NavMenuRow({ item, badges }: { item: NavItem; badges: Badges }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink item={item}>
          <NavItemContent item={item} badges={badges} />
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/* The two TanStack devtools, in development only: each is a row in the
 * sidebar footer that opens its panel in a dock at the foot of the inset,
 * one at a time, instead of the libraries' own floating corner buttons.
 * The row is a disclosure (aria-expanded, aria-controls): the sidebar reads
 * an open one like the active item, indicator included, but leaves it
 * pressable so the same press closes it (an active item takes no pointer).
 * The panels compile to nothing outside development; the rows go with
 * them. Sidebar only: the dock has no footer. */
type Devtool = "query" | "router"
const DEVTOOLS_DOCK_ID = "devtools-dock"

const ownsPath = (tenant: NavTenant, pathname: string) =>
  tenant.groups.some((group) =>
    group.items.some((item) => item.to !== undefined && item.to === pathname),
  )

function AuthenticatedLayout() {
  const tree = useSuspenseQuery(navigationQuery).data
  const user = useSuspenseQuery(currentUserQuery).data
  const { tenants } = tree
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(defaultTenant(tree).id)

  /* The URL wins: landing on a route a tenant owns selects that tenant, so
   * a deep link never shows one tenant's menu over another's page. The
   * switcher's own choice applies only for routes no tenant owns, and
   * starts at the tree's default tenant. */
  const activeTenant =
    tenants.find((tenant) => ownsPath(tenant, pathname)) ??
    tenants.find((tenant) => tenant.id === selectedId) ??
    defaultTenant(tree)

  const handleTenantChange = (next: { name: string }) => {
    const tenant = tenants.find((candidate) => candidate.name === next.name)
    if (!tenant) return
    setSelectedId(tenant.id)
    const to = firstRoute(tenant)
    if (to) navigate({ to })
  }

  /* The session, at the foot of the sidebar or on the strip: who signed in,
   * and inline beneath, what they can do about it, as the sidebar's own
   * rows. Profile is a route; Log out is an action on the session, a
   * Button, not a link, and the shell owns where it lands. The demo has no
   * auth, so landing on /login is all it does. The icons are the rail's:
   * collapsed, a row is its icon alone (component-architecture §3.10). */
  const profile = (
    <UserProfile user={user}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/profile">
              <UserCircleIcon />
              <span>Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onPress={() => navigate({ to: "/login" })}>
            <ArrowLeftStartOnRectangleIcon />
            <span>Log out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </UserProfile>
  )

  return (
    <SidebarProvider>
      <Shell
        tenant={activeTenant}
        switcher={
          <TenantSwitcher
            tenants={tenants}
            activeTenant={activeTenant}
            onActiveTenantChange={handleTenantChange}
          />
        }
        profile={profile}
      />
    </SidebarProvider>
  )
}

/* One shell, two layouts (component-architecture §4.0.1). The provider
 * measures the wrapper and publishes `layout`; the shell renders the
 * Sidebar, or the strip and the Dock, never both. The inset is the same
 * element in both, so its scroll position, width store and data-narrow
 * survive the swap; the differences in its chrome are CSS against the
 * wrapper's data-layout. The switcher and the profile are the same
 * elements in both too: header and footer of the column, or the two ends
 * of the strip. */
function Shell({
  tenant,
  switcher,
  profile,
}: {
  tenant: NavTenant
  switcher: ReactNode
  profile: ReactNode
}) {
  const { layout } = useSidebar()
  const badges = useNavBadges()
  const [devtool, setDevtool] = useState<Devtool | null>(null)

  const toggleDevtool = (next: Devtool) =>
    setDevtool((current) => (current === next ? null : next))

  /* Closing from the dock (its close button, Escape) returns focus to the
   * row that opened it (component-architecture §5.3). */
  const closeDevtools = () => {
    document
      .querySelector<HTMLElement>(
        `[aria-controls="${DEVTOOLS_DOCK_ID}"][aria-expanded="true"]`,
      )
      ?.focus()
    setDevtool(null)
  }

  const onDevtoolsKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      closeDevtools()
    }
  }

  /* Focus handoff. A layout swap unmounts the navigation that had focus
   * and drops it on the body. The nav records whether it held focus (a
   * removed element fires no blur, so the record survives the swap); after
   * a swap that record moves focus to the active item of the new nav, or
   * its first item, so a keyboard user resizing across the breakpoint is
   * not sent back to the top of the document. */
  const navHadFocus = useRef(false)
  const trackFocus = {
    onFocus: () => {
      navHadFocus.current = true
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (
        event.relatedTarget &&
        !event.currentTarget.contains(event.relatedTarget)
      )
        navHadFocus.current = false
    },
  }
  const previousLayout = useRef(layout)
  useLayoutEffect(() => {
    if (previousLayout.current === layout) return
    previousLayout.current = layout
    if (!navHadFocus.current) return
    const nav = document.querySelector<HTMLElement>(
      layout === "dock" ? '[data-slot="dock"]' : '[data-slot="sidebar"]',
    )
    if (!nav) return
    const candidates = [
      ...nav.querySelectorAll<HTMLElement>('[aria-current="page"], a, button'),
    ].filter((element) => !element.closest("[inert]"))
    candidates[0]?.focus({ preventScroll: true })
  }, [layout])

  /* Four cells plus More whenever the tenant has items the row does not
   * show; a badge hidden behind More moves to More. The session's exit is
   * in the profile on the strip, so a tenant whose tagged items all fit
   * has no More. */
  const { row, more } = dockItems(tenant)
  const moreCount = more.reduce(
    (sum, item) => sum + badgeCount(item, badges),
    0,
  )

  return (
    <>
      {layout === "sidebar" ? (
        <Sidebar {...trackFocus}>
          <SidebarHeader>{switcher}</SidebarHeader>
          <SidebarContent>
            {tenant.groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <NavMenuRow
                        key={item.label}
                        item={item}
                        badges={badges}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          {/* The devtools rows in development, then the session, last. */}
          <SidebarFooter>
            {import.meta.env.DEV && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    aria-expanded={devtool === "query"}
                    aria-controls={DEVTOOLS_DOCK_ID}
                    onPress={() => toggleDevtool("query")}
                  >
                    <CircleStackIcon />
                    <span>Query devtools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    aria-expanded={devtool === "router"}
                    aria-controls={DEVTOOLS_DOCK_ID}
                    onPress={() => toggleDevtool("router")}
                  >
                    <MapIcon />
                    <span>Router devtools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {profile}
          </SidebarFooter>
        </Sidebar>
      ) : (
        <SidebarStrip>
          {switcher}
          {profile}
        </SidebarStrip>
      )}
      <SidebarInset>
        <SidebarInsetHeader>
          <SidebarTrigger />
        </SidebarInsetHeader>
        <div className={styles.main}>
          <Outlet />
        </div>
        {devtool && (
          <aside
            id={DEVTOOLS_DOCK_ID}
            aria-label={
              devtool === "query" ? "Query devtools" : "Router devtools"
            }
            className={styles.devtools}
            onKeyDown={onDevtoolsKeyDown}
          >
            {devtool === "query" ? (
              <ReactQueryDevtoolsPanel
                style={{ height: "100%" }}
                onClose={closeDevtools}
              />
            ) : (
              <TanStackRouterDevtoolsPanel
                style={{ height: "100%" }}
                isOpen
                setIsOpen={(open) => {
                  if (!open) closeDevtools()
                }}
              />
            )}
          </aside>
        )}
      </SidebarInset>
      {layout === "dock" && (
        <Dock {...trackFocus}>
          <DockRow>
            {row.map((item) => (
              <DockItem key={item.label} asChild>
                <NavLink item={item}>
                  <NavItemContent item={item} badges={badges} />
                </NavLink>
              </DockItem>
            ))}
            {more.length > 0 && (
              <DockMore badge={moreCount > 0 && <SidebarMenuBadge />}>
                More
                {badgeWords(moreCount)}
              </DockMore>
            )}
          </DockRow>
          {/* Behind More: the items the row does not show, as the sidebar's
           * own rows. The session's exit is in the profile on the strip; the
           * devtools rows stay in the sidebar. */}
          {more.length > 0 && (
            <DockPanel>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {more.map((item) => (
                      <NavMenuRow
                        key={item.label}
                        item={item}
                        badges={badges}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </DockPanel>
          )}
        </Dock>
      )}
    </>
  )
}
