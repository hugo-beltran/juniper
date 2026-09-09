import { useEffect, useId, useRef, useState } from "react";
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Button as AriaButton, type Selection } from "react-aria-components";
import { useSidebar } from "@/components/sidebar/sidebar";
import { TENANT_BLOBATAR_PALETTE } from "@/lib/blobatar-palette";
import { ListBox, ListBoxItem } from "./listbox";
import { Squircle } from "./squircle";
import { useClickOutside } from "./use-click-outside";
import styles from "./tenant-switcher.module.css";

export interface Tenant {
  name: string;
  plan: string;
}

/* Inline disclosure switcher — no popover, per the project's UX philosophy:
 * expanding grows the header in place (grid-rows 0fr → 1fr) and pushes the
 * nav below down; selection is a react-aria ListBox rendered in the document
 * flow. Collapsed to the icon rail, the switcher is read-only: a tile showing
 * the active tenant's blobatar. */
export function TenantSwitcher({
  tenants,
  activeTenant: activeTenantProp,
  onActiveTenantChange,
}: {
  tenants: Tenant[];
  activeTenant?: Tenant;
  onActiveTenantChange?: (tenant: Tenant) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [internalActiveTenant, setInternalActiveTenant] = useState(tenants[0]);
  const activeTenant = activeTenantProp ?? internalActiveTenant;
  const setActiveTenant = (tenant: Tenant) => {
    if (onActiveTenantChange) onActiveTenantChange(tenant);
    else setInternalActiveTenant(tenant);
  };
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Collapsing the sidebar closes the switcher — the rail has no room for
   * the list, and the read-only tile has no way to reopen it. */
  useEffect(() => {
    if (collapsed) setExpanded(false);
  }, [collapsed]);

  /* A press anywhere outside the switcher (trigger + panel) dismisses it.
   * Focus stays where the user clicked — no yanking it back to the trigger. */
  useClickOutside(rootRef, () => setExpanded(false), expanded);

  if (!activeTenant) {
    return null;
  }

  /* The trigger is the panel's immediate previous sibling; focus returns to
   * it when the panel closes underneath the focused item. */
  const focusTrigger = () => {
    const trigger = panelRef.current?.previousElementSibling;
    if (trigger instanceof HTMLElement) trigger.focus();
  };

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const key = keys.values().next().value;
    const tenant = tenants.find((candidate) => candidate.name === key);
    if (tenant) {
      setActiveTenant(tenant);
      setExpanded(false);
      focusTrigger();
    }
  };

  const { name } = activeTenant;

  return (
    /* Fully encapsulated: no SidebarMenu scaffolding, no shared menuButton —
     * the switcher owns its trigger styles so they can diverge from the nav. */
    <div ref={rootRef} data-slot="tenant-switcher" className={styles.root}>
      {collapsed ? (
        <div className={styles.logo} title={activeTenant.name}>
          <Squircle className={styles.logoBackdrop} />
          <Blobatar
            name={name}
            palette={TENANT_BLOBATAR_PALETTE}
            animate="hover"
            size={120}
            title={name}
          />
        </div>
      ) : (
        <AriaButton
          data-slot="tenant-switcher-trigger"
          className={styles.trigger}
          aria-expanded={expanded}
          aria-controls={panelId}
          onPress={() => setExpanded((current) => !current)}
        >
          <div className={styles.logo} aria-hidden>
            <Squircle className={styles.logoBackdrop} />
            <Blobatar
              name={name}
              palette={TENANT_BLOBATAR_PALETTE}
              animate="hover"
              size={120}
              title={name}
            />
          </div>
          <div className={styles.meta}>
            <span className={styles.name}>{activeTenant.name}</span>
            <span className={styles.plan}>{activeTenant.plan}</span>
          </div>
          <ChevronUpDownIcon className={styles.chevron} />
        </AriaButton>
      )}
      <div
        ref={panelRef}
        id={panelId}
        className={styles.panel}
        data-expanded={expanded || undefined}
        inert={!expanded}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setExpanded(false);
            focusTrigger();
          }
        }}
      >
        <div className={styles.panelInner}>
          <div className={styles.panelContent}>
            <ListBox
              aria-label="Tenants"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[activeTenant.name]}
              onSelectionChange={handleSelectionChange}
            >
              {tenants.map((tenant) => (
                <ListBoxItem
                  key={tenant.name}
                  id={tenant.name}
                  textValue={tenant.name}
                  className={styles.item}
                >
                  <span className={styles.itemName}>{tenant.name}</span>
                </ListBoxItem>
              ))}
            </ListBox>
          </div>
        </div>
      </div>
    </div>
  );
}
