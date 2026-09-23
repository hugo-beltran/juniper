import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Blobatar } from "@blobatar/react";
import {
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  ChartPieIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  FunnelIcon,
  LifebuoyIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components";
import { TENANT_BLOBATAR_PALETTE } from "@/lib/blobatar-palette";
import styles from "./dock.module.css";

export const Route = createFileRoute("/_authenticated/lab/dock")({
  component: DockPage,
});

/* Dock lab — where the brand (the tenant switcher: identity plus a rare
 * control, built as an inline disclosure) lives once the shell's navigation
 * becomes a bottom dock on narrow viewports. Four static phone frames, one
 * variable at a time: the dock, its items and the page are identical across
 * frames; only the brand's home changes. The indicator toggle compares the
 * sidebar's connector tab, rotated to meet the inset's bottom edge, against a
 * plain needle pill. Decided on 2026-09-23: B′ (identity strip on the
 * ground) and the connector tab; kept as the reference for the dock build.
 * Exploration mock, not a shipped component. The dock's items are
 * illustrative: a tenant richer than any in the demo tree. */

type Variant = "A" | "B" | "Bprime" | "D";
type Indicator = "connector" | "pill";
type Height = 812 | 667;

const TENANT = { name: "Kingfisher", plan: "Fantasy League" };

const VARIANTS: {
  id: Variant;
  title: string;
  note: string;
  pros: string;
  cons: string;
}[] = [
  {
    id: "A",
    title: "A · Tenant tile as a dock item",
    note: "The collapsed-rail tile takes the fifth slot. Tapping it would have to open the switcher somewhere: upward, as a sheet, or as a page.",
    pros: "No new region; the tile already exists.",
    cons: "Spends a scarce slot on a rare action, and overflow has no home. The switcher's inline disclosure has nowhere to grow.",
  },
  {
    id: "B",
    title: "B · Brand row inside the inset",
    note: "A non-sticky row at the top of the page, on bark. It scrolls away with the content, so sticky toolbars keep pinning to the inset's top edge.",
    pros: "Zero permanent cost: it leaves as you scroll. Brand where the eye starts.",
    cons: "The switcher needs an on-bark surface variant; its glass and needle-900 text are tuned to the green.",
  },
  {
    id: "Bprime",
    title: "B′ · Identity strip on the ground — chosen",
    note: "The wrapper becomes strip, inset, dock. The switcher keeps its own green surface, and its disclosure pushes the inset down, the house pattern.",
    pros: "One material story: the card floats between two bands of ground. No switcher variant.",
    cons: "A permanent 3.5rem of height. Check it at 667.",
  },
  {
    id: "D",
    title: "D · Brand behind More",
    note: "No brand on the main screens. More grows the dock upward, listing the sidebar-only items and, last, the tenant row.",
    pros: "Solves overflow and switching in one gesture; nothing permanent on screen.",
    cons: "Tenant identity is invisible until you look for it.",
  },
];

function Tile({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`${styles.tile} ${size === "sm" ? styles.tileSm : ""}`}
      aria-hidden
    >
      <Blobatar
        name={TENANT.name}
        palette={TENANT_BLOBATAR_PALETTE}
        size={120}
        title={TENANT.name}
      />
    </span>
  );
}

/* The switcher's trigger as it looks today: tile, name, plan, chevron. */
function Brand({ onBark = false }: { onBark?: boolean }) {
  return (
    <div className={`${styles.brand} ${onBark ? styles.brandOnBark : ""}`}>
      <Tile />
      <span className={styles.brandMeta}>
        <span className={styles.brandName}>{TENANT.name}</span>
        <span className={styles.brandPlan}>{TENANT.plan}</span>
      </span>
      <ChevronUpDownIcon className={styles.brandChevron} aria-hidden />
    </div>
  );
}

const LEADS = [
  { name: "T. Okafor", pos: "SP", club: "River Hawks", stage: 5, ask: "$32M", grade: 70 },
  { name: "D. Whitlock", pos: "OF", club: "Bayside Nine", stage: 4, ask: "$24M", grade: 65 },
  { name: "A. Sandoval", pos: "1B", club: "Copper Kings", stage: 3, ask: "$15M", grade: 60 },
];

function Page() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h3 className={styles.pageTitle}>Scouting Pipeline</h3>
        <Button size="mini">New report</Button>
      </div>
      <div className={styles.toolbar}>
        <span className={styles.switch} aria-hidden />
        <span className={styles.toolbarLabel}>Pending analysis only</span>
        <Button size="mini" variant="secondary" className={styles.filters}>
          <FunnelIcon aria-hidden />
          Filters
        </Button>
      </div>
      {LEADS.map((lead) => (
        <div key={lead.name} className={styles.lead}>
          <div className={styles.leadHead}>
            <span className={styles.avatar} aria-hidden />
            <span className={styles.leadName}>
              {lead.name} <small>({lead.pos})</small>
            </span>
          </div>
          <dl className={styles.leadGrid}>
            <div>
              <dt>Club</dt>
              <dd>{lead.club}</dd>
            </div>
            <div>
              <dt>Ask</dt>
              <dd>{lead.ask}</dd>
            </div>
            <div>
              <dt>Stage</dt>
              <dd className={styles.stage} aria-label={`${lead.stage} of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} data-on={i < lead.stage || undefined} />
                ))}
              </dd>
            </div>
            <div>
              <dt>Grade</dt>
              <dd>
                <span className={styles.grade}>{lead.grade}</span>
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

const DOCK_ITEMS = [
  { label: "Scouting", Icon: RectangleGroupIcon, active: true, badge: true },
  { label: "Trades", Icon: ArrowsRightLeftIcon },
  { label: "Analytics", Icon: ChartPieIcon },
  { label: "Settings", Icon: Cog6ToothIcon },
];

const MORE_ITEMS = [
  { label: "Documentation", Icon: BookOpenIcon, external: true },
  { label: "Support", Icon: LifebuoyIcon, external: true },
];

function Dock({
  variant,
  indicator,
}: {
  variant: Variant;
  indicator: Indicator;
}) {
  const expanded = variant === "D";
  return (
    <div className={styles.dock} data-indicator={indicator}>
      {expanded && (
        <div className={styles.dockPanel}>
          {MORE_ITEMS.map(({ label, Icon, external }) => (
            <span key={label} className={styles.panelRow}>
              <Icon aria-hidden />
              <span>{label}</span>
              {external && (
                <ArrowTopRightOnSquareIcon
                  className={styles.panelExternal}
                  aria-hidden
                />
              )}
            </span>
          ))}
          <span className={styles.panelDivider} aria-hidden />
          <span className={`${styles.panelRow} ${styles.panelTenant}`}>
            <Tile size="sm" />
            <span className={styles.panelTenantMeta}>
              <span>{TENANT.name}</span>
              <small>{TENANT.plan}</small>
            </span>
            <ChevronUpDownIcon className={styles.panelExternal} aria-hidden />
          </span>
        </div>
      )}
      <div className={styles.dockRow}>
        {DOCK_ITEMS.map(({ label, Icon, active, badge }) => (
          <span
            key={label}
            className={styles.dockItem}
            data-active={active || undefined}
          >
            <span className={styles.dockIcon}>
              <Icon aria-hidden />
              {badge && <span className={styles.dot} aria-hidden />}
            </span>
            <span className={styles.dockLabel}>{label}</span>
          </span>
        ))}
        {variant === "A" ? (
          <span className={styles.dockItem}>
            <span className={styles.dockIcon}>
              <Tile size="sm" />
            </span>
            <span className={styles.dockLabel}>{TENANT.name}</span>
          </span>
        ) : (
          <span
            className={styles.dockItem}
            data-open={expanded || undefined}
          >
            <span className={styles.dockIcon}>
              <Squares2X2Icon aria-hidden />
            </span>
            <span className={styles.dockLabel}>More</span>
          </span>
        )}
      </div>
      <span className={styles.homeIndicator} aria-hidden />
    </div>
  );
}

function Phone({
  variant,
  indicator,
  height,
}: {
  variant: Variant;
  indicator: Indicator;
  height: Height;
}) {
  return (
    <div className={styles.phone} style={{ height }}>
      <div className={styles.screen}>
        {variant === "Bprime" && (
          <div className={styles.strip}>
            <Brand />
          </div>
        )}
        <div className={styles.inset}>
          {variant === "B" && <Brand onBark />}
          <Page />
        </div>
        <Dock variant={variant} indicator={indicator} />
      </div>
    </div>
  );
}

function Toggle<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.toggle} role="group" aria-label={label}>
      <span className={styles.toggleLabel}>{label}</span>
      {options.map((option) => (
        <Button
          key={String(option.value)}
          size="mini"
          variant={option.value === value ? "primary" : "secondary"}
          aria-pressed={option.value === value}
          onPress={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function DockPage() {
  const [height, setHeight] = useState<Height>(812);
  const [indicator, setIndicator] = useState<Indicator>("connector");

  return (
    <div className={styles.lab}>
      <h1>Dock</h1>
      <p className={styles.sub}>
        Four homes for the tenant switcher once the sidebar becomes a bottom
        dock. Everything else is held constant: the same page, the same five
        slots, the same ground. The dock items are illustrative, a tenant
        richer than any in the demo tree. Every value is a{" "}
        <code>--juni-*</code> step or a derivation from one.
      </p>
      <div className={styles.controls}>
        <Toggle
          label="Height"
          value={height}
          options={[
            { value: 812, label: "812 · iPhone 15" },
            { value: 667, label: "667 · iPhone SE" },
          ]}
          onChange={setHeight}
        />
        <Toggle
          label="Indicator"
          value={indicator}
          options={[
            { value: "connector", label: "Connector tab" },
            { value: "pill", label: "Needle pill" },
          ]}
          onChange={setIndicator}
        />
      </div>
      <div className={styles.grid}>
        {VARIANTS.map((variant) => (
          <section key={variant.id} className={styles.card}>
            <h2>{variant.title}</h2>
            <Phone variant={variant.id} indicator={indicator} height={height} />
            <p className={styles.note}>{variant.note}</p>
            <dl className={styles.verdict}>
              <dt>For</dt>
              <dd>{variant.pros}</dd>
              <dt>Against</dt>
              <dd>{variant.cons}</dd>
            </dl>
          </section>
        ))}
      </div>
      <section className={styles.card}>
        <h2>Decision points</h2>
        <ul className={styles.decisions}>
          <li>
            Brand: B′ chosen on 2026-09-23. It holds at 667: the strip costs
            about one lead card of scroll and keeps the switcher on its own
            surface.
          </li>
          <li>
            Indicator: connector tab chosen on 2026-09-23. Rotated to meet the
            inset's bottom edge it still reads as part of the inset surface,
            so the dock keeps the sidebar's signature. The pill stays here as
            the rejected alternative.
          </li>
          <li>
            More: a disclosure growing upward (shown in D) keeps components
            off the router and reuses the switcher's grid-rows mechanism. A
            route is the alternative.
          </li>
          <li>
            Overflow rule: four tagged items plus More whenever the tenant has
            items the dock does not show; a badge hidden behind More moves to
            More.
          </li>
        </ul>
      </section>
    </div>
  );
}
