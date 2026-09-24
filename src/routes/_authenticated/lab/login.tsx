import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Blobatar } from "@blobatar/react";
import { KeyIcon } from "@heroicons/react/24/outline";
import type { Selection } from "react-aria-components";
import {
  Button,
  Card,
  Input,
  ListBox,
  ListBoxItem,
  PageDescription,
  PageHeader,
  PageTitle,
  Select,
} from "@/components";
import { defaultTenant, navigationQuery, type NavTenant } from "@/lib/api";
import { TENANT_BLOBATAR_PALETTE } from "@/lib/blobatar-palette";
import { cn } from "@/lib/cn";
import Mark from "@/assets/juni.svg?react";
import styles from "./login.module.css";

export const Route = createFileRoute("/_authenticated/lab/login")({
  component: LoginLabPage,
});

/* Login lab — three structures for the sign-in screen, built from the real
 * primitives (Card, Input, Select, Button, ListBox) so what is tweaked here
 * is what ships. Two references set the structure: a pale sheet with an
 * image panel beside a narrow form column, and a saturated rounded ground
 * carrying a white card. In Juniper's material story the ground is the
 * needle green the shell stands on and work happens on a bark-50 card; the
 * extruded controls only read on bark-50, so the form always lands on the
` * card and the brand takes the ground. Decided 2026-09-23: B (ground), now
 * shipped as the login-screen registry entry and the /login route; A and C
 * stay here as the rejected alternatives. Exploration mock, not a shipped
 * component: the form submits nowhere. */

type Layout = "sheet" | "ground" | "picker";
type Frame = "desktop" | "phone";

const VARIANTS: {
  id: Layout;
  title: string;
  note: string;
  pros: string;
  cons: string;
}[] = [
  {
    id: "sheet",
    title: "A · Sheet — image panel beside the form",
    note: "One bark-50 sheet on the page canvas. A lichen panel on the left holds the mark and a claim where the reference had a photo; the form column on the right keeps the reference's order: tile, title, fields, full-width action, divider, secondary action, fine print.",
    pros: "Quiet and familiar; the whole screen is one card, so light and dark need no new decisions.",
    cons: "The ground never shows. The left panel is decoration until it has something to say.",
  },
  {
    id: "ground",
    title: "B · Ground — brand on the green, form on the card",
    note: "The reference's blue frame becomes the shell's needle ground; its white card becomes the inset. The reference put the form on the color; ours cannot (the extruded recipe needs bark-50), so the sides swap: the brand copy and a watermark of the mark sit on the ground, the form on the card.",
    pros: "The login is literally the shell before the sidebar arrives: same ground, same card, same 0.5rem margin. Strongest brand read.",
    cons: "Two surfaces to keep legible in dark mode; the ground gradient is mode-invariant, so the card stays the only thing that changes.",
  },
  {
    id: "picker",
    title: "C · Ground with the workspace picker on the ground",
    note: "B, but the watermark gives way to the product: the four workspaces as a list on the ground, the tenant switcher's own rows. Choosing one replaces the Workspace select in the form; the card's subtitle names the choice.",
    pros: "The illustration is the product. One control fewer in the form, and the picker is a real ListBox with arrow keys and typeahead.",
    cons: "Two places for focus to travel between; the form is no longer a single column. Only worth it while workspaces are few.",
  },
];

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

/* The form is one thing in every variant; only its surroundings change. */
function SignInForm({
  layout,
  tenants,
  tenant,
  onTenantChange,
}: {
  layout: Layout;
  tenants: NavTenant[];
  tenant: string;
  onTenantChange: (id: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const active = tenants.find((t) => t.id === tenant) ?? tenants[0];

  return (
    <form
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      {layout === "sheet" && (
        <span className={styles.markTile} aria-hidden>
          <Mark />
        </span>
      )}
      <div className={styles.formHead}>
        <h3 className={styles.formTitle}>Sign in</h3>
        <p className={styles.formSub}>
          {layout === "picker"
            ? `${active.name} · ${active.plan}`
            : "Pick your workspace. We'll take you to its first page."}
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        placeholder="you@club.example"
        value={email}
        onChange={setEmail}
        isRequired
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        isRequired
      />
      {layout !== "picker" && (
        <Select
          label="Workspace"
          options={tenants.map((t) => ({
            value: t.id,
            label: t.name,
            hint: t.plan,
          }))}
          value={tenant}
          onChange={onTenantChange}
        />
      )}
      <Button type="submit" className={styles.wide}>
        Sign in
      </Button>
      <div className={styles.divider} role="separator">
        <span>or</span>
      </div>
      <Button variant="secondary" className={styles.wide}>
        <KeyIcon />
        Continue with SSO
      </Button>
      <Button variant="discrete" className={styles.wide}>
        Continue as guest
      </Button>
      <p className={styles.fine}>
        A demo: nothing is stored and no account is created.
      </p>
    </form>
  );
}

function WorkspacePicker({
  tenants,
  tenant,
  onTenantChange,
}: {
  tenants: NavTenant[];
  tenant: string;
  onTenantChange: (id: string) => void;
}) {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const key = keys.values().next().value;
    if (key !== undefined) onTenantChange(String(key));
  };
  return (
    <div className={styles.pickerPanel}>
      <ListBox
        aria-label="Workspaces"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[tenant]}
        onSelectionChange={handleSelectionChange}
      >
        {tenants.map((t) => (
          <ListBoxItem key={t.id} id={t.id} textValue={t.name}>
            <span className={styles.pickerTile} aria-hidden>
              <Blobatar
                name={t.name}
                palette={TENANT_BLOBATAR_PALETTE}
                size={120}
                title={t.name}
              />
            </span>
            <span>{t.name}</span>
            <span className={styles.pickerPlan}>{t.plan}</span>
          </ListBoxItem>
        ))}
      </ListBox>
    </div>
  );
}

function LoginMock({
  layout,
  frame,
  tenants,
}: {
  layout: Layout;
  frame: Frame;
  tenants: NavTenant[];
}) {
  const [tenant, setTenant] = useState(
    defaultTenant({ defaultTenant: "kingfisher", tenants }).id,
  );
  const form = (
    <SignInForm
      layout={layout}
      tenants={tenants}
      tenant={tenant}
      onTenantChange={setTenant}
    />
  );

  if (layout === "sheet") {
    return (
      <div className={cn(styles.frame, styles[frame], styles.canvas)}>
        <Card className={styles.sheet}>
          <div className={styles.panel}>
            <Mark className={styles.panelMark} aria-hidden />
            <p className={styles.claim}>Grown from one contract.</p>
          </div>
          <div className={styles.sheetForm}>{form}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(styles.frame, styles[frame], styles.ground)}>
      <div className={styles.groundLayout}>
        <div className={styles.groundSide}>
          <div className={styles.groundCopy}>
            <span className={styles.eyebrow}>
              <Mark className={styles.eyebrowMark} aria-hidden />
              Juniper
            </span>
            <h3 className={styles.groundTitle}>
              {layout === "picker" ? "Choose a workspace." : "Back to the grove."}
            </h3>
            <p className={styles.groundText}>
              {layout === "picker"
                ? "Signing in lands you on its first page."
                : "One palette, one material, every screen. The controls on this page are the ones the registry publishes."}
            </p>
          </div>
          {layout === "picker" ? (
            <WorkspacePicker
              tenants={tenants}
              tenant={tenant}
              onTenantChange={setTenant}
            />
          ) : (
            <Mark className={styles.hero} aria-hidden />
          )}
        </div>
        <Card className={styles.groundCard}>{form}</Card>
      </div>
    </div>
  );
}

function LoginLabPage() {
  const { data: tree } = useSuspenseQuery(navigationQuery);
  const [frame, setFrame] = useState<Frame>("desktop");

  return (
    <div className={styles.lab}>
      <PageHeader>
        <PageTitle>Login</PageTitle>
        <PageDescription>
          Three structures for the sign-in screen, from two references: a pale
          sheet with an image panel beside a narrow form, and a saturated
          rounded ground carrying a white card. In our material the ground is
          the needle green the shell stands on and the form lives on the
          bark-50 card, where the extruded controls read. Every control is a
          registry component; every value a <code>--juni-*</code> step.
        </PageDescription>
      </PageHeader>
      <div className={styles.controls}>
        <Toggle
          label="Frame"
          value={frame}
          options={[
            { value: "desktop", label: "Desktop · 848" },
            { value: "phone", label: "Phone · 375" },
          ]}
          onChange={setFrame}
        />
      </div>
      <section className={styles.variants}>
        {VARIANTS.map((variant) => (
          <Card key={variant.id} className={styles.card}>
            <h2>{variant.title}</h2>
            <p className={styles.note}>{variant.note}</p>
            <dl className={styles.verdict}>
              <dt>For</dt>
              <dd>{variant.pros}</dd>
              <dt>Against</dt>
              <dd>{variant.cons}</dd>
            </dl>
            <LoginMock
              layout={variant.id}
              frame={frame}
              tenants={tree.tenants}
            />
          </Card>
        ))}
      </section>
    </div>
  );
}
