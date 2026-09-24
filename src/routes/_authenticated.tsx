import { useState, type ComponentType, type SVGProps } from "react";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CubeIcon,
  CubeTransparentIcon,
  LifebuoyIcon,
  PencilSquareIcon,
  RectangleGroupIcon,
  SwatchIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
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
  SidebarTrigger,
  TenantSwitcher,
} from "@/components";
import {
  defaultTenant,
  firstRoute,
  leadsQuery,
  navigationQuery,
  pendingAnalysisCount,
  type NavBadge,
  type NavIcon,
  type NavTenant,
} from "@/lib/api";
import styles from "./_authenticated.module.css";

export const Route = createFileRoute("/_authenticated")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(navigationQuery),
      context.queryClient.ensureQueryData(leadsQuery),
    ]),
  component: AuthenticatedLayout,
});

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
};

/* Badge sources named in the tree, resolved to live counts here. 0 hides
 * the badge. */
function useNavBadges(): Record<NavBadge, number> {
  const { data: leads } = useSuspenseQuery(leadsQuery);
  return { "pending-analysis": pendingAnalysisCount(leads) };
}

const ownsPath = (tenant: NavTenant, pathname: string) =>
  tenant.groups.some((group) =>
    group.items.some((item) => item.to !== undefined && item.to === pathname),
  );

function AuthenticatedLayout() {
  const tree = useSuspenseQuery(navigationQuery).data;
  const { tenants } = tree;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const badges = useNavBadges();
  const [selectedId, setSelectedId] = useState(defaultTenant(tree).id);

  /* The URL wins: landing on a route a tenant owns selects that tenant, so
   * a deep link never shows one tenant's menu over another's page. The
   * switcher's own choice applies only for routes no tenant owns, and
   * starts at the tree's default tenant. */
  const activeTenant =
    tenants.find((tenant) => ownsPath(tenant, pathname)) ??
    tenants.find((tenant) => tenant.id === selectedId) ??
    defaultTenant(tree);

  const handleTenantChange = (next: { name: string }) => {
    const tenant = tenants.find((candidate) => candidate.name === next.name);
    if (!tenant) return;
    setSelectedId(tenant.id);
    const to = firstRoute(tenant);
    if (to) navigate({ to });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <TenantSwitcher
            tenants={tenants}
            activeTenant={activeTenant}
            onActiveTenantChange={handleTenantChange}
          />
        </SidebarHeader>
        <SidebarContent>
          {activeTenant?.groups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    const count = item.badge ? badges[item.badge] : 0;
                    /* The dot goes before the label in DOM order (see
                     * SidebarMenuBadge); the words go inside the label. */
                    const badge = count > 0 && <SidebarMenuBadge />;
                    const labelText = (
                      <>
                        {item.label}
                        {count > 0 && (
                          <span className="sr-only">
                            {`, ${count} leads pending analysis`}
                          </span>
                        )}
                      </>
                    );
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          {item.to !== undefined ? (
                            <Link to={item.to}>
                              <Icon />
                              {badge}
                              <span>{labelText}</span>
                            </Link>
                          ) : (
                            <a
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                            >
                              <Icon />
                              {badge}
                              <span>{labelText}</span>
                            </a>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarInsetHeader>
          <SidebarTrigger />
        </SidebarInsetHeader>
        <div className={styles.main}>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
