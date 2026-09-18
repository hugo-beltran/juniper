import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { Button, type ButtonProps } from "@/components/button/button";
import { cn } from "@/lib/cn";
import styles from "./sidebar.module.css";

/* Trimmed port of the shadcn sidebar (aria-nova style), inset variant only,
 * icon collapse only. Deliberately dropped: sidebar/floating variants, right
 * side, offcanvas mode, the mobile Sheet, SidebarRail/Input/Separator, menu
 * actions/badges/skeletons/submenus, cookie persistence, and the keyboard
 * shortcut. Nav items render TanStack Router links via `asChild` (Radix
 * Slot) — active styling keys off the link's aria-current="page". */

const SIDEBAR_WIDTH = "15rem";
const SIDEBAR_WIDTH_ICON = "3rem";
/* Left gutter the inset reserves for the floating SidebarTrigger, published
 * as --sidebar-inset-gutter. Content never enters it, so the trigger can
 * share a row with sticky toolbars and table headers without offsets. */
const SIDEBAR_INSET_GUTTER = "3rem";

interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = useCallback(
    (value: boolean | ((open: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      if (onOpenChange) onOpenChange(next);
      else setInternalOpen(next);
    },
    [onOpenChange, open],
  );

  const toggleSidebar = useCallback(
    () => setOpen((current) => !current),
    [setOpen],
  );

  const state = open ? "expanded" : "collapsed";

  const contextValue = useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, toggleSidebar }),
    [state, open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            "--sidebar-inset-gutter": SIDEBAR_INSET_GUTTER,
            ...style,
          } as CSSProperties
        }
        className={cn(styles.wrapper, className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const { state } = useSidebar();

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      className={cn(styles.container, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarTrigger({
  onPress,
  ...props
}: Omit<ButtonProps, "variant" | "size">) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      size="mini"
      variant="discrete"
      data-slot="sidebar-trigger"
      onPress={(event) => {
        onPress?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

/* The page's scroll container (the document never scrolls); the router
 * restores its scroll position by the data-scroll-restoration-id. */
export function SidebarInset({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      data-scroll-restoration-id="sidebar-inset"
      className={cn(styles.inset, className)}
      {...props}
    />
  );
}

/* Zero-height sticky anchor at the top of the inset that floats the
 * SidebarTrigger in the inset's left gutter (--sidebar-inset-gutter), so
 * the toggle stays present while the inset scrolls and sits on the same
 * row as any sticky toolbar or table header — no offsets needed, because
 * content never enters the gutter. */
export function SidebarInsetHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  return (
    <header
      data-slot="sidebar-inset-header"
      className={cn(styles.insetHeader, className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(styles.header, className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(styles.footer, className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(styles.content, className)}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(styles.group, className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(styles.groupLabel, className)}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn(styles.groupContent, className)}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  children,
  ...props
}: ComponentProps<"ul">) {
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  /* Sliding shared pill, drawn as an inset-connector tab: the indicator
   * extends past the menu to the sidebar container's right edge — where the
   * inset panel begins — and a clip-path carves a browser-tab silhouette
   * (rounded left corners, concave flares at the junction) so the active item
   * reads as part of the inset surface. Measured against whichever item is
   * active (a router link's aria-current="page", or an explicit data-active);
   * a MutationObserver keeps it router-agnostic, a ResizeObserver re-seats it
   * through the collapse animation. */
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    /* Corner radius of the tab's left side, and the radius of the concave
     * flares where it meets the inset. The indicator bleeds FLARE px above
     * and below the row to make room for the flares. */
    const RADIUS = 8;
    const FLARE = 10;

    const tabPath = (width: number, rowHeight: number) => {
      const top = FLARE;
      const bottom = FLARE + rowHeight;
      return [
        `M 0 ${top + RADIUS}`,
        `Q 0 ${top} ${RADIUS} ${top}`,
        `L ${width - FLARE} ${top}`,
        `Q ${width} ${top} ${width} 0`,
        `L ${width} ${bottom + FLARE}`,
        `Q ${width} ${bottom} ${width - FLARE} ${bottom}`,
        `L ${RADIUS} ${bottom}`,
        `Q 0 ${bottom} 0 ${bottom - RADIUS}`,
        "Z",
      ].join(" ");
    };

    const position = () => {
      const active = list.querySelector<HTMLElement>(
        '[aria-current="page"], [data-active]',
      );
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }

      /* Place instantly (no slide-in from 0,0) when the pill was hidden —
       * covers first paint and entering a menu that just became active. */
      const instant = indicator.style.opacity !== "1";
      if (instant) indicator.style.transition = "none";

      const listRect = list.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const container = list.closest('[data-slot="sidebar"]');
      /* Reach the container's border-box right edge — the inset's left edge. */
      const width = container
        ? container.getBoundingClientRect().right - rect.left
        : rect.width;

      indicator.style.opacity = "1";
      indicator.style.width = `${width}px`;
      indicator.style.height = `${rect.height + FLARE * 2}px`;
      indicator.style.transform = `translate(${rect.left - listRect.left}px, ${rect.top - listRect.top - FLARE}px)`;
      indicator.style.clipPath = `path("${tabPath(width, rect.height)}")`;

      if (instant) {
        void indicator.offsetHeight;
        indicator.style.transition = "";
      }
    };

    position();

    const mutations = new MutationObserver(position);
    mutations.observe(list, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current", "data-active"],
    });
    const resizes = new ResizeObserver(position);
    resizes.observe(list);
    /* The tab's width tracks the container edge, so observe it too, and
     * re-seat once its collapse/expand transition lands — observer delivery
     * can be throttled (hidden/background tabs), transitionend is not. */
    const container = list.closest('[data-slot="sidebar"]');
    if (container) resizes.observe(container);
    container?.addEventListener("transitionend", position);

    return () => {
      mutations.disconnect();
      resizes.disconnect();
      container?.removeEventListener("transitionend", position);
    };
  }, []);

  return (
    <ul
      ref={listRef}
      data-slot="sidebar-menu"
      className={cn(styles.menu, className)}
      {...props}
    >
      <span
        ref={indicatorRef}
        data-slot="sidebar-menu-indicator"
        className={styles.menuIndicator}
        aria-hidden
      />
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn(styles.menuItem, className)}
      {...props}
    />
  );
}

/* Attention indicator on a menu row: a heartwood dot floating after the
 * label, a dot on the icon's corner in the collapsed rail. Render it inside
 * the button BEFORE the label span (the CSS reorders it visually): the
 * label must stay the button's last child because it doubles as the rail
 * tooltip. Purely visual (aria-hidden) — put the words for screen readers
 * inside the label with the sr-only class, so the row reads "Scouting, 8
 * leads pending analysis" in that order. */
export function SidebarMenuBadge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      aria-hidden
      className={cn(styles.menuBadge, className)}
      {...props}
    />
  );
}

/* Collapsed-rail labels need no tooltip component: the row's own label span
 * is absolutely repositioned over the inset and revealed on hover/focus by
 * the CSS module — same element, no overlay, and the accessible name stays
 * on the button at all times. */
export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  className,
  ...props
}: Omit<AriaButtonProps, "className"> & {
  className?: string;
  asChild?: boolean;
  isActive?: boolean;
  size?: "default" | "lg";
}) {
  const sharedProps = {
    "data-slot": "sidebar-menu-button",
    "data-size": size,
    "data-active": isActive || undefined,
    className: cn(
      styles.menuButton,
      size === "lg" && styles.menuButtonLg,
      className,
    ),
  };

  /* asChild slots a router link in (plain DOM element); otherwise render a
   * react-aria Button so press/aria wiring from MenuTrigger etc. connects. */
  return asChild ? (
    <Slot {...sharedProps} {...(props as ComponentProps<typeof Slot>)} />
  ) : (
    <AriaButton {...sharedProps} {...props} />
  );
}
