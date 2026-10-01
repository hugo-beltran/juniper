import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { Form } from "react-aria-components"
import { BackgroundNoise } from "@/components/background-noise/background-noise"
import { Button } from "@/components/button/button"
import { Card, CardFooter } from "@/components/card/card"
import { ImageOverlay } from "@/components/image-overlay/image-overlay"
import { Input } from "@/components/input/input"
import { cn } from "@/lib/cn"
import styles from "./login-screen.module.css"

/* What the form knows. Nothing user-scoped (which workspaces exist, where
 * to land) is asked for or shown before sign-in: that comes from the
 * authenticated shell once the caller knows who signed in. */
export interface LoginCredentials {
  email: string
  password: string
}

/* The sign-in screen as a stage (chosen 2026-09-25 at /lab/login-2, C), in
 * parts the route arranges (component-architecture §4.1, §4.7): LoginStage,
 * the bark-100 ground at the viewport's height in three rows; LoginBar with
 * LoginBrand (the wordmark) and LoginNav (the visitor's actions); LoginCard,
 * the flat Card centred in the middle row, whose header the route fills from
 * Card's parts (a title, a lede); LoginForm, the two ways in as two panels
 * that slide; and LoginFooter, one line at the foot. No photograph: flat on
 * flat, so nothing depends on blur or blend. Controlled: the form reports
 * the credentials and the route decides where a sign-in lands.
 *
 * The two ways in are two panels in one horizontal scroll-snap track (added
 * 2026-09-28): single sign-on first, then the credentials. The switch links
 * scroll the track; on a touch screen the panels also swipe, because the
 * track is a real scroller and the snap is the browser's, not a transform
 * the component animates. React knows two facts CSS cannot (§3.9): which
 * panel is snapped, read back from the scroll position and published as
 * data-panel on the form, and how tall that panel is, measured and
 * published as --login-panel-height on the track so the card follows the
 * panel it shows. Everything else, the snap, the smooth scroll, the clip,
 * is CSS. The panel not shown is inert, so Tab never lands off-screen. */

export type LoginPanel = "sso" | "credentials"

export interface LoginFormProps {
  onSignIn: (credentials: LoginCredentials) => void
  /** Renders the single sign-on panel first, and the switch links between the two. */
  onSingleSignOn?: () => void
  /** Right-aligned under the fields: a discrete Button asChild around a Link. */
  helpAction?: ReactNode
  /** The line at the form's foot ("Don't have an account? Request now"). */
  footnote?: ReactNode
}

export function LoginStage({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="login-stage"
      className={cn(styles.stage, className)}
      {...props}
    >
      <ImageOverlay clarity="low" />
      <BackgroundNoise />
      {children}
    </div>
  )
}

export function LoginBar({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="login-bar"
      className={cn(styles.bar, className)}
      {...props}
    />
  )
}

export function LoginBrand({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="login-brand"
      className={cn(styles.brand, className)}
      {...props}
    />
  )
}

export function LoginNav({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      data-slot="login-nav"
      className={cn(styles.nav, className)}
      {...props}
    />
  )
}

export function LoginCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(styles.card, className)}>{children}</div>
}

export function LoginFooter({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="login-footer"
      className={cn(styles.siteFooter, className)}
      {...props}
    />
  )
}

export function LoginForm({
  onSignIn,
  onSingleSignOn,
  helpAction,
  footnote,
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [panel, setPanel] = useState<LoginPanel>(
    onSingleSignOn ? "sso" : "credentials",
  )
  const trackRef = useRef<HTMLDivElement>(null)
  const focusNext = useRef<LoginPanel | null>(null)

  /* Which panel is snapped, read from the scroll position once it rests on
   * a snap point, so a swipe reports the same fact a switch link does and
   * the frames in between change nothing. */
  const readPanel = () => {
    const track = trackRef.current
    if (!track || !onSingleSignOn) return
    const width = track.clientWidth
    const left = track.scrollLeft
    if (Math.abs(left) < 1) setPanel("sso")
    else if (Math.abs(left - width) < 1) setPanel("credentials")
  }

  /* How tall the snapped panel is: measured, published once as a custom
   * property, and re-measured when the panel's content changes height (a
   * validation message appearing) or the card resizes. */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const publish = () => {
      const active = track.querySelector<HTMLElement>(
        `[data-slot="login-panel"][data-panel="${panel}"]`,
      )
      if (active) {
        track.style.setProperty(
          "--login-panel-height",
          `${active.offsetHeight}px`,
        )
      }
    }
    publish()
    const observer = new ResizeObserver(publish)
    for (const node of track.querySelectorAll('[data-slot="login-panel"]')) {
      observer.observe(node)
    }
    return () => observer.disconnect()
  }, [panel])

  /* The switch: scroll the track to the panel (smoothly, when the CSS says
   * so) and ask for focus on the panel's first control. */
  const show = (next: LoginPanel) => {
    const track = trackRef.current
    if (!track) return
    focusNext.current = next
    setPanel(next)
    track.scrollTo({ left: next === "sso" ? 0 : track.clientWidth })
  }

  /* Focus moves once the panel has rendered as the active one (it was inert
   * a frame ago), and without scrolling on its own: the track is already
   * on its way. */
  useEffect(() => {
    if (focusNext.current !== panel) return
    focusNext.current = null
    trackRef.current
      ?.querySelector<HTMLElement>(
        `[data-slot="login-panel"][data-panel="${panel}"] :is(input, button)`,
      )
      ?.focus({ preventScroll: true })
  }, [panel])

  return (
    <Form
      data-slot="login-form"
      data-panel={panel}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSignIn({ email, password })
      }}
    >
      <div
        ref={trackRef}
        data-slot="login-track"
        className={styles.track}
        onScroll={readPanel}
      >
        {onSingleSignOn && (
          <section
            data-slot="login-panel"
            data-panel="sso"
            className={styles.panel}
            aria-label="Single sign-on"
            inert={panel !== "sso"}
          >
            <Button className={styles.wide} onPress={() => onSingleSignOn()}>
              Single sign-on
            </Button>
            <Button
              variant="discrete"
              className={styles.switch}
              onPress={() => show("credentials")}
            >
              Use your credentials &rarr;
            </Button>
          </section>
        )}
        <section
          data-slot="login-panel"
          data-panel="credentials"
          className={styles.panel}
          aria-label="Your credentials"
          inert={panel !== "credentials"}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@club.example"
            autoFocus={!onSingleSignOn}
            value={email}
            onChange={setEmail}
            isRequired
            errorMessage="Enter a valid email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            isRequired
            errorMessage="Enter your password"
          />
          {helpAction && <div className={styles.help}>{helpAction}</div>}
          <Button type="submit" className={styles.wide}>
            Sign in
          </Button>
          {onSingleSignOn && (
            <Button
              variant="discrete"
              className={styles.switch}
              onPress={() => show("sso")}
            >
              &larr; Use single sign-on
            </Button>
          )}
        </section>
      </div>
      {footnote && (
        <CardFooter className={styles.footer}>
          <p className={styles.fine}>{footnote}</p>
        </CardFooter>
      )}
    </Form>
  )
}
