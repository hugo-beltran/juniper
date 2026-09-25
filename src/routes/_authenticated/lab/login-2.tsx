import { FingerPrintIcon, KeyIcon } from "@heroicons/react/24/outline"
import { createFileRoute } from "@tanstack/react-router"
import { type ReactNode, useState } from "react"
import Mark from "@/assets/juni.svg?react"
import {
  BackgroundNoise,
  Button,
  Card,
  ImageOverlay,
  Input,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components"
import { cn } from "@/lib/cn"
import styles from "./login-2.module.css"

export const Route = createFileRoute("/_authenticated/lab/login-2")({
  component: LoginRoundTwoPage,
})

/* Login lab, round two — four structures for the sign-in screen after the
 * 2026-09-25 pass (dark-glass card, SSO first, the rich button, the
 * ImageOverlay's clarity), from four references: a photo panel beside the
 * form, a framed minimal sheet, a pale stage with a top bar, and the dark
 * pane itself with the hierarchy the references share. Built from the
 * registry's primitives on the real ground (ImageOverlay and BackgroundNoise
 * in a framed panel, the FullBleedCanvas's own arrangement at a frame's
 * height), so what is tweaked here is what ships. Decided 2026-09-25: C
 * (stage), now the login-screen registry entry and the /login route; A, B
 * and D stay here as the archive. Exploration mock, not a shipped
 * component: the forms submit nowhere. */

type Layout = "split" | "sheet" | "stage" | "pane"
type Frame = "desktop" | "phone"

const VARIANTS: {
  id: Layout
  title: string
  note: string
  pros: string
  cons: string
}[] = [
  {
    id: "split",
    title: "A · Split — the photograph in a panel beside the form",
    note: "One flat bark-50 card on the ground, the photograph shown twice: soft on the ground at low clarity, sharp inside the card's left panel at high clarity under the wordmark and the claim. The form column keeps the reference's order: title, lede, SSO first, then email and password, the primary action, fine print.",
    pros: "The photograph gets a frame instead of being fought for legibility, and the form sits on bark-50 where the extruded controls read. The panel is the brand's, so it can carry a message later.",
    cons: "Two ImageOverlays, so two credits; the ground's is hidden here. The tallest of the four at phone width, where the panel shrinks to a band.",
  },
  {
    id: "sheet",
    title: "B · Sheet — one framed sheet, nothing else",
    note: "The whole frame is a bark-50 sheet inset on the ground: the wordmark small in its corner, the form a narrow column in the middle with a caps eyebrow for a title and this pass's rich button for the action, SSO and passkey sharing a row under an 'or continue with' rule, the legal line at the sheet's foot.",
    pros: "The quietest and the most product-like: whitespace does the work, and it holds up with no photograph at all. The rich button finds its place.",
    cons: "The least brand: the ground shows only as a 1.25rem rim. An eyebrow for a title needs the whitespace to carry authority, which a phone does not give it.",
  },
  {
    id: "stage",
    title: "C · Stage — a pale stage with a top bar",
    note: "No photograph. A bark-100 stage, a top bar with the wordmark and the visitor's actions, a bark-50 card in the middle with a centred title and the reference's order (fields, help, primary, 'or sign in with', two options, the request line), and a footer line. The reference's line drawings are left out: the stage stays bare.",
    pros: "Reads as a marketing-grade page: nav, card, footer. Flat on flat, so nothing depends on blur or blend, and light and dark are one decision.",
    cons: "The furthest from the shell's green ground, so the login stops being the shell before the sidebar arrives. The top bar wants real destinations.",
  },
  {
    id: "pane",
    title: "D · Pane — this pass's dark pane, with the hierarchy",
    note: "The 2026-09-25 direction kept (the photograph at high clarity, the dark-glass card) but with what the references share: the wordmark small and left, a display title and a lede, SSO as the light secondary, then email and password on their own light fields, the green primary last.",
    pros: "The strongest atmosphere and the only one where the photograph is the screen. Keeps this pass's card and clarity as they are.",
    cons: "Every colour on the card is re-tuned for dark (labels, rule, fine print), and the lift tokens inside dark-glass still take the root values, so the fields' highlight reads green.",
  },
]

function Toggle<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className={styles.toggle}>
      <legend className={styles.toggleLabel}>{label}</legend>
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
    </fieldset>
  )
}

/* The ground: the two layers the FullBleedCanvas stacks, at the frame's
 * size. */
function Ground({ clarity }: { clarity: "low" | "mid" | "high" }) {
  return (
    <>
      <ImageOverlay clarity={clarity} />
      <BackgroundNoise />
    </>
  )
}

/* The two fields, the same in every structure. */
function Fields() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <>
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
    </>
  )
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className={styles.divider}>
      <span>{children}</span>
    </div>
  )
}

function Form({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <form
      className={cn(styles.form, className)}
      onSubmit={(event) => event.preventDefault()}
    >
      {children}
    </form>
  )
}

/* A · one card, the photograph in its left panel. */
function SplitMock({ frame }: { frame: Frame }) {
  return (
    <div className={cn(styles.frame, styles[frame], styles.splitFrame)}>
      <Ground clarity="low" />
      <Card className={styles.split}>
        <div className={styles.photo}>
          <ImageOverlay clarity="high" />
          <Mark className={styles.photoMark} aria-hidden />
          <p className={styles.photoClaim}>Inspired by nature's clarity.</p>
        </div>
        <div className={styles.splitForm}>
          <Form>
            <div className={cn(styles.head, styles.centered)}>
              <h3 className={styles.title}>Welcome back</h3>
              <p className={styles.lede}>
                Sign in to your workspace. We'll take you to its first page.
              </p>
            </div>
            <Button variant="secondary" className={styles.wide}>
              <KeyIcon />
              Continue with SSO
            </Button>
            <Divider>or</Divider>
            <Fields />
            <Button type="submit" className={styles.wide}>
              Sign in
            </Button>
            <p className={styles.fine}>
              A demo: nothing is stored and no account is created.
            </p>
          </Form>
        </div>
      </Card>
    </div>
  )
}

/* B · the frame is the sheet. */
function SheetMock({ frame }: { frame: Frame }) {
  return (
    <div className={cn(styles.frame, styles[frame], styles.sheetFrame)}>
      <Ground clarity="low" />
      <Card className={styles.sheet}>
        <Mark className={styles.sheetMark} aria-hidden />
        <div className={styles.sheetBody}>
          <Form>
            <div className={styles.head}>
              <p className={styles.eyebrow}>Sign in to Juniper</p>
              <p className={styles.lede}>Please enter your details</p>
            </div>
            <Fields />
            <div className={styles.between}>
              <Button variant="discrete" size="small">
                Forgot password?
              </Button>
            </div>
            <Button variant="rich" type="submit" className={styles.wide}>
              Sign in
            </Button>
            <Divider>or continue with</Divider>
            <div className={styles.pair}>
              <Button variant="secondary">
                <KeyIcon />
                SSO
              </Button>
              <Button variant="secondary">
                <FingerPrintIcon />
                Passkey
              </Button>
            </div>
            <p className={styles.fine}>
              Don't have an account? <a href="#request">Request access</a>
            </p>
          </Form>
        </div>
        <p className={styles.legal}>
          By signing in you agree to the <a href="#terms">Terms of use</a>.
        </p>
      </Card>
    </div>
  )
}

/* C · a pale stage: bar, card, footer. */
function StageMock({ frame }: { frame: Frame }) {
  return (
    <div className={cn(styles.frame, styles[frame], styles.stage)}>
      <header className={styles.bar}>
        <Mark className={styles.barMark} aria-hidden />
        <nav className={styles.barNav}>
          <Button variant="discrete" size="small">
            Sign up
          </Button>
          <Button size="small">Request a demo</Button>
        </nav>
      </header>
      <div className={styles.stageBody}>
        <Card className={styles.stageCard}>
          <Form>
            <div className={cn(styles.head, styles.centered)}>
              <h3 className={styles.title}>Welcome back</h3>
              <p className={styles.lede}>
                Enter your details to sign in to your workspace.
              </p>
            </div>
            <Fields />
            <div className={styles.between}>
              <Button variant="discrete" size="small">
                Having trouble signing in?
              </Button>
            </div>
            <Button type="submit" className={styles.wide}>
              Sign in
            </Button>
            <Divider>or sign in with</Divider>
            <div className={styles.pair}>
              <Button variant="secondary">
                <KeyIcon />
                SSO
              </Button>
              <Button variant="secondary">
                <FingerPrintIcon />
                Passkey
              </Button>
            </div>
            <p className={styles.fine}>
              Don't have an account? <a href="#request">Request now</a>
            </p>
          </Form>
        </Card>
      </div>
      <p className={styles.stageFooter}>© Juniper 2026 · Privacy</p>
    </div>
  )
}

/* D · the dark pane on the sharp photograph. */
function PaneMock({ frame }: { frame: Frame }) {
  return (
    <div className={cn(styles.frame, styles[frame])}>
      <Ground clarity="high" />
      <Card variant="dark-glass" className={cn(styles.pane, styles.dark)}>
        <Mark className={styles.paneMark} aria-hidden />
        <Form>
          <div className={styles.head}>
            <h3 className={styles.title}>Sign in</h3>
            <p className={styles.lede}>Inspired by nature's clarity.</p>
          </div>
          <Button variant="secondary" className={styles.wide}>
            <KeyIcon />
            Continue with SSO
          </Button>
          <Divider>or</Divider>
          <Fields />
          <Button type="submit" className={styles.wide}>
            Sign in
          </Button>
          <p className={styles.fine}>
            A demo: nothing is stored and no account is created.
          </p>
        </Form>
      </Card>
    </div>
  )
}

function LoginMock({ layout, frame }: { layout: Layout; frame: Frame }) {
  switch (layout) {
    case "split":
      return <SplitMock frame={frame} />
    case "sheet":
      return <SheetMock frame={frame} />
    case "stage":
      return <StageMock frame={frame} />
    case "pane":
      return <PaneMock frame={frame} />
  }
}

function LoginRoundTwoPage() {
  const [frame, setFrame] = useState<Frame>("desktop")

  return (
    <div className={styles.lab}>
      <PageHeader>
        <PageTitle>Login · round 2</PageTitle>
        <PageDescription>
          Four structures after the dark-glass pass, from four references: a
          photo panel beside the form, a framed minimal sheet, a pale stage with
          a top bar, and the dark pane with the hierarchy the references share.
          What they have in common is the professional read: one surface where
          the form lives, a small wordmark, a display title over a lede, SSO and
          fields in one column, one accent. Decided 2026-09-25: C, the stage,
          now shipped as the login; the rest stay here as the archive. Every
          control is a registry component; every value a <code>--juni-*</code>{" "}
          step.
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
            <LoginMock layout={variant.id} frame={frame} />
          </Card>
        ))}
      </section>
    </div>
  )
}
