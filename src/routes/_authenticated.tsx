import { useState, type ComponentType, type SVGProps } from "react";
import {
  ArrowsRightLeftIcon,
  BookOpenIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CubeIcon,
  LifebuoyIcon,
  RectangleGroupIcon,
  SparklesIcon,
  SwatchIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  TenantSwitcher,
  type Tenant,
} from "@/components";
import styles from "./_authenticated.module.css";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const TENANTS: Tenant[] = [
  { name: "Juniper", plan: "Smart Dashboard" },
  { name: "Kingfisher", plan: "Fantasy League" },
  { name: "Evergreen Studio", plan: "Pro" },
  { name: "Bramblewood", plan: "Free" },
];

/* Per-tenant nav: each tenant gets its own sidebar group under the shared
 * Platform items. Tenants without real views yet point at seed routes. */
interface TenantMenu {
  label: string;
  items: {
    to: string;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }[];
}

const TENANT_MENUS: Record<string, TenantMenu> = {
  Juniper: {
    label: "Lab",
    items: [{ to: "/lab/palette", label: "Palette", icon: SwatchIcon }],
  },
  Kingfisher: {
    label: "Fantasy Baseball",
    items: [
      { to: "/trade-analyzer", label: "Trade Analyzer", icon: ArrowsRightLeftIcon },
    ],
  },
  "Evergreen Studio": {
    label: "Workspace",
    items: [{ to: "/seed/evergreen-studio", label: "Seed", icon: SparklesIcon }],
  },
  Bramblewood: {
    label: "Workspace",
    items: [{ to: "/seed/bramblewood", label: "Seed", icon: SparklesIcon }],
  },
};

function AuthenticatedLayout() {
  const [activeTenant, setActiveTenant] = useState(TENANTS[0]);
  const tenantMenu = TENANT_MENUS[activeTenant.name];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <TenantSwitcher
            tenants={TENANTS}
            activeTenant={activeTenant}
            onActiveTenantChange={setActiveTenant}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/dashboard">
                      <RectangleGroupIcon />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/products">
                      <CubeIcon />
                      <span>Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/analytics">
                      <ChartPieIcon />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/customers">
                      <UsersIcon />
                      <span>Customers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/settings">
                      <Cog6ToothIcon />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {tenantMenu && (
            <SidebarGroup>
              <SidebarGroupLabel>{tenantMenu.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tenantMenu.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a
                      href="https://github.com/hugo-beltran/juniper#readme"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <BookOpenIcon />
                      <span>Documentation</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="mailto:support@juniper.dev">
                      <LifebuoyIcon />
                      <span>Support</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className={styles.toolbar}>
          <SidebarTrigger />
        </header>
        <div className={styles.main}>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
