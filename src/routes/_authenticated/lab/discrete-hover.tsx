import { createFileRoute } from "@tanstack/react-router"
import type { PointerEvent } from "react"
import {
  Button,
  Card,
  ImageOverlay,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components"
import { cn } from "@/lib/cn"
import styles from "./discrete-hover.module.css"

export const Route = createFileRoute("/_authenticated/lab/discrete-hover")({
  component: DiscreteHoverPage,
})

/* Discrete hover lab — the shipped hover (a bloom wash over the whole box)
 * loses the button's discreteness the moment it is touched, so five quieter
 * answers are set beside it, each a real discrete Button on the three
 * surfaces the control lands on: the sheet, a glass card, the photograph.
 * The constraints stand for every one: hover answers in bloom (theming
 * §4.7), the wash must hold on any surface, and press keeps the module's
 * own gesture, the control fill sunk inset (§4.6), so only the hover rule
 * differs. Decided 2026-10-01: 2 · lift, now the recipe in
 * button.module.css, with the rule that a discrete button never sits on
 * a busy background; the wash and the other four stay here as the
 * archive, their recipes in this lab's CSS over the real module. */

const ALTERNATIVES = [
  {
    id: "wash",
    title: "0 · Wash — retired",
    note: "The pastel needle over the whole box (bloom-500 at 40% before that), copy to bloom-950. Reads on any surface, and turns the button into a chip the moment it is touched. The hover shipped until 2026-10-01.",
  },
  {
    id: "edge",
    title: "1 · Edge — the hairline, not the fill",
    note: "A 1px bloom-400 hairline at 75% appears around the box and the copy moves to bloom-800; the background stays the surface. The vocabulary §4.7 already gives a hovered trigger or text field, so the discrete button answers hover like every other control.",
  },
  {
    id: "lift",
    title: "2 · Lift — volume, not colour — chosen",
    note: "The box takes the extruded recipe from the lift tokens with no fill, the copy moves to bloom-800. Rest flat, hover pushed out, press sunk in: one gesture, the §4.6 family. Chosen 2026-10-01 and now the module's own rule, nothing added here. The photograph shows why the rule came with it: the shadows have nothing to cast on, so a discrete button never sits on a busy background; a secondary takes its place.",
  },
  {
    id: "copy",
    title: "3 · Copy — the text alone",
    note: "The copy moves to bloom-700 and nothing else changes. The quietest answer and the purest reading of pointer colour; watch whether it is enough to see on the photograph.",
  },
  {
    id: "rule",
    title: "4 · Rule — a line under the label",
    note: "A 1px bloom-600 rule under the text at a small offset, the copy to bloom-800. Small and clear, and borrowed from the link, which the system has worked to keep apart from the button.",
  },
  {
    id: "spot",
    title: "5 · Spot — the lamp, under the hand",
    note: "A small bloom glow centred under the pointer, fading to nothing inside the box, the copy to bloom-900. Colour only where the hand is, so the button stays discrete everywhere else; the one lamp that lights the panes, turned on a flat control. Needs the pointer's position, so the lab sets it the way Button's lamp does.",
  },
] as const

type Alternative = (typeof ALTERNATIVES)[number]["id"]

/* The spot needs the pointer's position: the lab publishes it on the
 * element as --spot-x / --spot-y, percentages of the box, the way the
 * Button's lamp hook does for the panes. A slotted plain button takes the
 * handlers; the module styles it through :hover like a router Link. */
const trackSpot = (event: PointerEvent<HTMLButtonElement>) => {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  target.style.setProperty(
    "--spot-x",
    `${((event.clientX - rect.left) / rect.width) * 100}%`,
  )
  target.style.setProperty(
    "--spot-y",
    `${((event.clientY - rect.top) / rect.height) * 100}%`,
  )
}

const clearSpot = (event: PointerEvent<HTMLButtonElement>) => {
  event.currentTarget.style.removeProperty("--spot-x")
  event.currentTarget.style.removeProperty("--spot-y")
}

function Sample({ alt, children }: { alt: Alternative; children: string }) {
  const className = cn(styles.sample, styles[alt])
  if (alt === "spot") {
    return (
      <Button asChild variant="discrete" size="small" className={className}>
        <button
          type="button"
          onPointerMove={trackSpot}
          onPointerLeave={clearSpot}
        >
          {children}
        </button>
      </Button>
    )
  }
  return (
    <Button variant="discrete" size="small" className={className}>
      {children}
    </Button>
  )
}

/* Two neighbours, as a toolbar would set them. */
function Pair({ alt }: { alt: Alternative }) {
  return (
    <div className={styles.pair}>
      <Sample alt={alt}>Discard</Sample>
      <Sample alt={alt}>Edit →</Sample>
    </div>
  )
}

/* The three surfaces: the card's own sheet, a glass card on the
 * photograph, and the photograph itself. */
function Surfaces({ alt }: { alt: Alternative }) {
  return (
    <div className={styles.surfaces}>
      <div className={styles.cell}>
        <div className={cn(styles.frame, styles.sheet)}>
          <Pair alt={alt} />
        </div>
        <span className={styles.label}>Sheet</span>
      </div>
      <div className={styles.cell}>
        <div className={styles.frame}>
          <ImageOverlay />
          <Card className={cn("glass", styles.pane)}>
            <Pair alt={alt} />
          </Card>
        </div>
        <span className={styles.label}>Glass</span>
      </div>
      <div className={styles.cell}>
        <div className={styles.frame}>
          <ImageOverlay />
          <Pair alt={alt} />
        </div>
        <span className={styles.label}>Photograph</span>
      </div>
    </div>
  )
}

function DiscreteHoverPage() {
  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Discrete hover</PageTitle>
        <PageDescription>
          The discrete button is inline text until touched. The shipped hover
          washes the whole box in bloom, which costs it its discreteness; five
          quieter answers sit beside it, each on the sheet, in a glass card and
          on the photograph. Hover and press each pair. Every value is a{" "}
          <code>--juni-*</code> step, a derivation from one, or a shared token;
          press is the module's own in every row.
        </PageDescription>
      </PageHeader>

      <section className={styles.grid}>
        {ALTERNATIVES.map((alternative) => (
          <Card key={alternative.id} className={styles.card}>
            <h2>{alternative.title}</h2>
            <p className={styles.note}>{alternative.note}</p>
            <Surfaces alt={alternative.id} />
          </Card>
        ))}
      </section>
    </div>
  )
}
