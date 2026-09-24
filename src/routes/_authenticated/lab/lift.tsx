import { createFileRoute } from "@tanstack/react-router"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { Button, PageDescription, PageHeader, PageTitle } from "@/components"
import styles from "./lift.module.css"

export const Route = createFileRoute("/_authenticated/lab/lift")({
  component: LiftPage,
})

/* Lift lab — six ways to give a field volume, judged against the primary
 * button's glass-pane recipe (fill lit off-center, 1px translucent inner
 * ring, tinted shadow offset dx = dy, press pushes in). The objective under
 * test: buttons, selects and other controls should read as one tactile
 * material. Option 5 (extruded) was chosen on 2026-09-17 and shipped via the
 * --lift-* tokens; kept as the reference for discussing volume with the
 * team. Exploration archive, not a shipped component. */

const VARIANTS = [
  {
    id: "glass",
    title: "1 · Glass pane, light",
    note: "The button's recipe on a neutral field: lit from the top-left, bark-50 inner ring, bloom-tinted shadow. Subtle because field and surface share bark-50.",
  },
  {
    id: "edge",
    title: "2 · Lit edge",
    note: "A gradient border carries the light — bright top-left, bark-400 bottom-right — like a bevel under a lamp. Volume from the edge, not a shadow.",
  },
  {
    id: "tint",
    title: "3 · Tint lift",
    note: "Lichen-50 sits above bark-50 on the ladder, so the field lifts by palette alone. Hairline and a whisper of shadow. The quietest option.",
  },
  {
    id: "keycap",
    title: "4 · Keycap",
    note: "Top highlight, a hard 1px base in bark-400, soft tinted shadow. Press drops it a pixel and removes the base — the button's own gesture.",
  },
  {
    id: "extruded",
    title: "5 · Extruded — chosen",
    note: "Same color as the surface, pushed out by a light shadow top-left and a dark one bottom-right. Strongest 'grows out of the page'; depends on the surface being exactly bark-50. Chosen 2026-09-17; shipped as --lift-highlight / --lift-shade and the rule in docs/theming.md §4.6.",
  },
  {
    id: "glassKeycap",
    title: "6 · Glass pane + keycap press",
    note: "Option 1 at rest, option 4's drop on press. Rest state matches the button's material, the interaction matches its gesture. The initial recommendation; not chosen.",
  },
] as const

const OPTIONS = ["Any club", "Bayside Nine", "Copper Kings", "River Hawks"]

function Sample({ variant }: { variant: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>Club</span>
      <span className={styles.selectWrap}>
        <select
          className={`${styles.select} ${styles[variant]}`}
          defaultValue=""
        >
          {OPTIONS.map((option, index) => (
            <option key={option} value={index === 0 ? "" : option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden className={styles.chevron} />
      </span>
    </label>
  )
}

function LiftPage() {
  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Lift</PageTitle>
        <PageDescription>
          Six ways to raise a select off the surface, beside the primary button
          they should feel kin to. Hover, focus and press each one. Every value
          is a <code>--juni-*</code> step or a derivation from one.
        </PageDescription>
      </PageHeader>

      <section className={styles.reference}>
        <div className={styles.card}>
          <h2>Reference · primary button</h2>
          <p className={styles.note}>
            Radial fill lit from 70%/70%, 1px translucent-white inner ring,
            bloom-tinted drop shadow, press flips the light and pulls the shadow
            inside.
          </p>
          <div className={styles.row}>
            <Button size="small">New SCOUT report</Button>
            <Button size="small" variant="secondary">
              Secondary
            </Button>
          </div>
        </div>
        <div className={styles.card}>
          <h2>Reference · current select</h2>
          <p className={styles.note}>
            Flat: bark-50 fill, bark-300 hairline, lichen-100 hover. No volume.
          </p>
          <div className={styles.row}>
            <Sample variant="flat" />
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        {VARIANTS.map((variant) => (
          <div key={variant.id} className={styles.card}>
            <h2>{variant.title}</h2>
            <p className={styles.note}>{variant.note}</p>
            <div className={styles.row}>
              <Sample variant={variant.id} />
              <Button size="small">Compare</Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
