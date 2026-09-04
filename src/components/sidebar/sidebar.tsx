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
import {
  Focusable,
  Tooltip,
  TooltipTrigger,
} from "@/components/tooltip/tooltip";
import { cn } from "@/lib/cn";
import styles from "./sidebar.module.css";

/* Trimmed port of the shadcn sidebar (aria-nova style), inset variant only,
 * icon collapse only. Deliberately dropped: sidebar/floating variants, right
 * side, offcanvas mode, the mobile Sheet, SidebarRail/Input/Separator, menu
 * actions/badges/skeletons/submenus, cookie persistence, and the keyboard
 * shortcut. Nav items render TanStack Router links via `asChild` (Radix
 * Slot) — active styling keys off the link's aria-current="page". */

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";

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
    <div data-slot="sidebar" className={styles.sidebar} data-state={state}>
      <div
        data-slot="sidebar-container"
        className={cn(styles.container, className)}
        {...props}
      >
        <div data-slot="sidebar-inner" className={styles.inner}>
          {children}
        </div>
      </div>
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

export function SidebarInset({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(styles.inset, className)}
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

  /* Sliding shared pill: one indicator per menu, measured against whichever
   * item is active (a router link's aria-current="page", or an explicit
   * data-active). A MutationObserver keeps it router-agnostic; a
   * ResizeObserver re-seats it through the collapse animation. */
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

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
      indicator.style.opacity = "1";
      indicator.style.width = `${rect.width}px`;
      indicator.style.height = `${rect.height}px`;
      indicator.style.transform = `translate(${rect.left - listRect.left}px, ${rect.top - listRect.top}px)`;

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

    return () => {
      mutations.disconnect();
      resizes.disconnect();
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

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  tooltip,
  className,
  ...props
}: Omit<AriaButtonProps, "className"> & {
  className?: string;
  asChild?: boolean;
  isActive?: boolean;
  size?: "default" | "lg";
  tooltip?: string;
}) {
  const { state } = useSidebar();

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
  const button = asChild ? (
    <Slot {...sharedProps} {...(props as ComponentProps<typeof Slot>)} />
  ) : (
    <AriaButton {...sharedProps} {...props} />
  );

  if (!tooltip) {
    return button;
  }

  return (
    /* Labels are visible while expanded; only surface the tooltip when
     * collapsed to icons. Non-RAC triggers (slotted links) need Focusable to
     * receive the tooltip's hover/focus wiring. */
    <TooltipTrigger delay={0} isDisabled={state !== "collapsed"}>
      {asChild ? <Focusable>{button}</Focusable> : button}
      <Tooltip placement="right">{tooltip}</Tooltip>
    </TooltipTrigger>
  );
}
