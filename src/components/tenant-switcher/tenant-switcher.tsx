import { useId, useRef, useState } from 'react'
import type { Selection } from 'react-aria-components'
import { Button } from '@/components/button/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/sidebar/sidebar'
import { ListBox, ListBoxItem } from './listbox'
import styles from './tenant-switcher.module.css'

export interface Tenant {
  name: string
  plan: string
}

/* Inline disclosure switcher — no popover, per the project's UX philosophy:
 * expanding grows the header in place (grid-rows 0fr → 1fr) and pushes the
 * nav below down; selection is a react-aria ListBox rendered in the document
 * flow. Collapsed to the icon rail, tenants stack as 2rem tiles. */
export function TenantSwitcher({ tenants }: { tenants: Tenant[] }) {
  const [activeTenant, setActiveTenant] = useState(tenants[0])
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  if (!activeTenant) {
    return null
  }

  /* The trigger is the panel's immediate previous sibling; focus returns to
   * it when the panel closes underneath the focused item. */
  const focusTrigger = () => {
    const trigger = panelRef.current?.previousElementSibling
    if (trigger instanceof HTMLElement) trigger.focus()
  }

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return
    const key = keys.values().next().value
    const tenant = tenants.find((candidate) => candidate.name === key)
    if (tenant) {
      setActiveTenant(tenant)
      setExpanded(false)
      focusTrigger()
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={styles.trigger}
          aria-expanded={expanded}
          aria-controls={panelId}
          onPress={() => setExpanded((current) => !current)}
        >
          <div className={styles.logo}>
            <TreePineIcon />
          </div>
          <div className={styles.meta}>
            <span className={styles.name}>{activeTenant.name}</span>
            <span className={styles.plan}>{activeTenant.plan}</span>
          </div>
          <ChevronDownIcon className={styles.chevron} />
        </SidebarMenuButton>
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          data-expanded={expanded || undefined}
          inert={!expanded}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setExpanded(false)
              focusTrigger()
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
                  <ListBoxItem key={tenant.name} id={tenant.name} textValue={tenant.name}>
                    <div className={styles.itemLogo}>
                      <TreePineIcon />
                    </div>
                    <span className={styles.itemName}>{tenant.name}</span>
                    <CheckIcon className={styles.check} />
                  </ListBoxItem>
                ))}
              </ListBox>
              <Button variant="discrete" size="mini" className={styles.addTenant}>
                <PlusIcon />
                Add tenant
              </Button>
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function TreePineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
      <path d="M12 22v-3" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
