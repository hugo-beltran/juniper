import {
  ArrowLeftStartOnRectangleIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon,
  RectangleGroupIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { createFileRoute } from "@tanstack/react-router"
import type { ReactNode } from "react"
import {
  Avatar,
  Dock,
  DockItem,
  DockRow,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarStrip,
  TenantSwitcher,
  UserProfile,
  type UserProfileUser,
} from "@/components"
import styles from "./user-profile.module.css"

export const Route = createFileRoute("/_authenticated/lab/user-profile")({
  component: UserProfileLab,
})

/* User profile lab — the account menu meddpicc adopted at its sidebar
 * footer and mobile header, promoted here on 2026-09-30 with its popover
 * turned into the house disclosure and its items into the sidebar's own
 * rows. Three frames, one component: each frame is a real, small shell
 * (a SidebarProvider sized by this route, so the provider measures the
 * frame and publishes the layout the width earns), and the profile is the
 * same tree in all three; what differs is the CSS's answer to the
 * sidebar's data-state and the wrapper's data-layout (component-
 * architecture §3.9). The rows here are inert Buttons: the lab is not the
 * shell. The shell itself is the reference; this page is its archive. */

const TENANTS = [
  { name: "Kingfisher", plan: "Fantasy League" },
  { name: "Bridge", plan: "Content Manager" },
]

const PRIYA: UserProfileUser = {
  name: "Priya Raman",
  email: "priya@bridge.example",
}

/* A stand-in photograph: an inline SVG so the clipped-image face shows
 * without shipping an asset. */
const TOMAS: UserProfileUser = {
  name: "Tomás Herrera",
  email: "tomas@bridge.example",
  image: `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9c8a3"/><stop offset="1" stop-color="#6b4e2e"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#f0e2c8"/><path d="M12 64c2-14 10-20 20-20s18 6 20 20z" fill="#f0e2c8"/></svg>',
  )}`,
}

/* The rows the shell passes in, as inert Buttons here; `active` shows the
 * Profile row as the current page. */
function Rows({ active = false }: { active?: boolean }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active}>
          <UserCircleIcon />
          <span>Profile</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <ArrowLeftStartOnRectangleIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function Nav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Fantasy Baseball</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>
              <RectangleGroupIcon />
              <span>Scouting</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ArrowsRightLeftIcon />
              <span>Trade Analyzer</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ChartPieIcon />
              <span>Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/* A stand-in for the inset: the bark card the page lives on. */
function Inset({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.inset}>
      <span className={styles.insetTitle}>Scouting Pipeline</span>
      <span className={styles.line} style={{ width: "72%" }} />
      <span className={styles.line} style={{ width: "58%" }} />
      <span className={styles.line} style={{ width: "64%" }} />
      {children}
    </div>
  )
}

/* The column at 40rem of frame: the sidebar beside the inset, expanded or
 * collapsed to the rail. */
function ColumnFrame({
  open,
  user,
  active = false,
}: {
  open: boolean
  user: UserProfileUser
  active?: boolean
}) {
  return (
    <SidebarProvider open={open} className={styles.frame}>
      <Sidebar className={styles.sidebar}>
        <SidebarHeader>
          <TenantSwitcher tenants={TENANTS} />
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter>
          <UserProfile user={user}>
            <Rows active={active} />
          </UserProfile>
        </SidebarFooter>
      </Sidebar>
      <Inset />
    </SidebarProvider>
  )
}

/* The strip at a phone's width: the provider measures the frame, takes the
 * dock layout, and the strip lays the switcher and the profile out. */
function StripFrame({ user }: { user: UserProfileUser }) {
  return (
    <SidebarProvider className={`${styles.frame} ${styles.phone}`}>
      <SidebarStrip>
        <TenantSwitcher tenants={TENANTS} />
        <UserProfile user={user}>
          <Rows />
        </UserProfile>
      </SidebarStrip>
      <Inset />
      <Dock aria-label="Lab dock">
        <DockRow>
          <DockItem isActive>
            <RectangleGroupIcon />
            <span>Scouting</span>
          </DockItem>
          <DockItem>
            <ArrowsRightLeftIcon />
            <span>Trades</span>
          </DockItem>
          <DockItem>
            <ChartPieIcon />
            <span>Analytics</span>
          </DockItem>
        </DockRow>
      </Dock>
    </SidebarProvider>
  )
}

function UserProfileLab() {
  return (
    <div className={styles.lab}>
      <h1>User profile</h1>
      <p className={styles.sub}>
        The session at the foot of the sidebar and on the strip. Every frame is
        a real shell at a size this route sets; open the profile in each to see
        the panel grow into place: upward from the footer, as icon rows in the
        rail, beneath the strip on a phone. Every value is a{" "}
        <code>--juni-*</code> step or a derivation from one.
      </p>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Column · initials</h2>
          <ColumnFrame open user={PRIYA} active />
          <p className={styles.note}>
            The row: avatar, name over email, the chevron on hover. The panel
            opens upward and the blob grows around trigger and rows; the rows
            are the sidebar's own, except that the active one wears the dock's
            needle pill, not the menu's connector tab.
          </p>
        </section>
        <section className={styles.card}>
          <h2>Rail · photograph</h2>
          <ColumnFrame open={false} user={TOMAS} active />
          <p className={styles.note}>
            Collapsed, the avatar alone, tilted like the switcher's tile; the
            name and email are its rail tooltip. Open, the rows are their icons,
            with their own tooltips.
          </p>
        </section>
        <section className={styles.card}>
          <h2>Strip · phone</h2>
          <StripFrame user={PRIYA} />
          <p className={styles.note}>
            The avatar at the end of the strip; its panel spans the strip below
            the row and pushes the inset down, the switcher's move, in the
            switcher's own glass. Only one of the strip's disclosures is open at
            a time. The exit lives here now, so the dock's More carries only the
            nav's leftovers.
          </p>
        </section>
      </div>
      <section className={styles.card}>
        <h2>Avatar faces</h2>
        <p className={styles.note}>
          Each face is the fallback of the last: the photograph covering the
          tile, the initials over the glass, and the person icon when there is
          not even a name. A photograph that fails to load falls back too.
        </p>
        <ul className={styles.faces}>
          <li>
            <Avatar size={40} src={TOMAS.image} name={TOMAS.name} />
            <span>Photograph</span>
          </li>
          <li>
            <Avatar size={40} name={PRIYA.name} />
            <span>Initials</span>
          </li>
          <li>
            <Avatar size={40} src="/no-such-photo.png" name={PRIYA.name} />
            <span>Failed load</span>
          </li>
          <li>
            <Avatar size={40} />
            <span>Icon</span>
          </li>
        </ul>
      </section>
      <section className={styles.card}>
        <h2>Decision points</h2>
        <ul className={styles.decisions}>
          <li>
            Popover to disclosure. meddpicc's account menu floated a menu over
            the page; Juniper sanctions two overlays, tooltips and anchored
            pickers, and the profile is neither (component-architecture §4.2).
            The panel grows in place with the switcher's grid-rows mechanism.
          </li>
          <li>
            Rows, not items. The panel takes the sidebar's own menu rows as
            children, the arrangement the dock's More panel already used, so the
            shell decides what a session can do and where each action lands, and
            the rows collapse to their icons in the rail for free.
          </li>
          <li>
            Log out moved. It was a footer row of its own (2026-09-28) and sat
            behind the dock's More; it is now the profile's last row in both
            layouts, so More appears only when the nav has leftovers.
          </li>
          <li>
            One tree. The switcher forks its render for the rail; the profile
            does not: the rail and the strip are CSS against the sidebar's
            data-state and the wrapper's data-layout (§3.9), and the strip
            became a grid to place the profile's boxes.
          </li>
          <li>
            Squircle promoted, Avatar added. The switcher's private tile
            backdrop became its own entry, clipping what is drawn on it; the
            Avatar draws the photograph, the initials or a person icon on it
            (§2.3). useClickOutside moved to src/lib the same day.
          </li>
        </ul>
      </section>
    </div>
  )
}
