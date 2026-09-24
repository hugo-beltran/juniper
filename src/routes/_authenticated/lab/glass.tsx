import { createFileRoute } from "@tanstack/react-router"
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ImageOverlay,
  Input,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components"
import { cn } from "@/lib/cn"
import styles from "./glass.module.css"

export const Route = createFileRoute("/_authenticated/lab/glass")({
  component: GlassPage,
})

/* Glass lab — five materials for the Card's glass variant, each on the real
 * photograph ground (an ImageOverlay filling a framed panel, the §4.8 claim
 * that a layer grounds a panel as well as a screen) and each carrying real
 * controls, so the material is judged on what it will hold. Every value is
 * a --juni-* step or a derivation from one; the lift shadows are the shared
 * tokens. Decided 2026-09-24: 3 · pane, the primary button's light on a
 * surface, now the recipe in card.module.css; the first baseline and the
 * other three stay here as the archive. */

const ALTERNATIVES = [
  {
    id: "baseline",
    title: "0 · Baseline — the first recipe",
    note: "Surface at 72% over a 16px blur, a needle-50 ring for the rim, the extruded lift shadows at the fields' own offsets. A pane, lightly raised. Shipped first; replaced by the pane.",
  },
  {
    id: "slab",
    title: "1 · Slab — deeper extrusion",
    note: "The same pane pushed further out: lift shadows at three times the offsets, a bevel from a 1px inner highlight top-left and a 1px inner shade bottom-right, and a long soft bloom drop beneath. Reads as a thick tile lifted off the ground.",
  },
  {
    id: "well",
    title: "2 · Well — pressed into the ground",
    note: "The opposite move: both lift shadows inset, so the card sinks into the photograph while the fields inside stay extruded. Depth comes from the contrast between a sunken sheet and raised controls.",
  },
  {
    id: "pane",
    title: "3 · Pane — the primary button's light — chosen",
    note: "The glass-pane recipe from the button applied to a surface: a radial fill lit from the top-left, a 1px specular line along the top edge, the 1px translucent ring, and a bloom-tinted drop with equal x and y offset. One lamp for buttons and cards.",
  },
  {
    id: "rim",
    title: "4 · Rim — edge-lit bevel",
    note: "The light lives in the border: a gradient rim from needle-50 at the top-left through bark to bloom-700 at the bottom-right, painted under a translucent fill, with the lift shadows at moderate offsets. Volume from the edge, the lift lab's option 2 revisited.",
  },
] as const

function Sample({ alt }: { alt: (typeof ALTERNATIVES)[number]["id"] }) {
  return (
    <div className={styles.frame}>
      <ImageOverlay />
      <Card variant="glass" className={cn(styles.sample, styles[alt])}>
        <CardHeader>
          <CardTitle level={3}>Sign in</CardTitle>
          <CardDescription>Inspired by nature's clarity.</CardDescription>
        </CardHeader>
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          placeholder="you@club.example"
        />
        <Button className={styles.wide}>Sign in</Button>
      </Card>
    </div>
  )
}

function GlassPage() {
  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Glass</PageTitle>
        <PageDescription>
          The Card's glass variant as shipped, and four ways to push its
          neumorphism further, each on the photograph ground with a real field
          and button inside. Hover and focus the controls; the pick becomes the
          recipe in <code>card.module.css</code>. Every value is a{" "}
          <code>--juni-*</code> step or a derivation from one.
        </PageDescription>
      </PageHeader>

      <section className={styles.grid}>
        {ALTERNATIVES.map((alt) => (
          <Card key={alt.id} className={styles.card}>
            <h2>{alt.title}</h2>
            <p className={styles.note}>{alt.note}</p>
            <Sample alt={alt.id} />
          </Card>
        ))}
      </section>
    </div>
  )
}
