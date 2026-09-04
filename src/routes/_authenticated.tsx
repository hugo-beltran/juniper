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
  { name: "Juniper Labs", plan: "Enterprise" },
  { name: "Evergreen Studio", plan: "Pro" },
  { name: "Bramblewood", plan: "Free" },
];

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <TenantSwitcher tenants={TENANTS} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Overview">
                    <Link to="/" activeOptions={{ exact: true }}>
                      <GaugeIcon />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Products">
                    <Link to="/products">
                      <PackageIcon />
                      <span>Products</span>
                    </Link>
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

/* Inline lucide icons — swap for an icon library when one gets picked. */

function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  );
}
