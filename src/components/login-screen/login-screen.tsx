import { type ComponentProps, type ReactNode, useState } from "react"
import { Form } from "react-aria-components"
import { Button } from "@/components/button/button"
import { Card } from "@/components/card/card"
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

/* The sign-in screen (chosen 2026-09-25 at /lab/login-2, C) in parts the
 * route arranges (component-architecture §4.1, §4.7) on a ground the route
 * composes itself: LoginBar with LoginBrand (the wordmark) and LoginNav (the
 * visitor's actions); LoginCard, the Card centred in the middle row, whose
 * header the route fills from Card's parts (a title, a lede); LoginForm, the
 * two ways in on one panel; and LoginFooter, one line at the foot. No stage
 * part (retired 2026-10-01, §4.7.1): a wrapper that owned the ground, the
 * layers, the rows and the container coupled four unrelated decisions into
 * one login-only element, so the route lays a full-bleed region with the
 * layers as its first children and these parts after them. Controlled: the
 * form reports the credentials and the route decides where a sign-in lands.
 *
 * One panel (since 2026-10-01, after the PubDash sign-in): the single
 * sign-on button first, an "or" rule, then the credentials, so both ways
 * in are on screen at once and nothing slides, measures or re-focuses.
 * The two-panel scroll-snap track of 2026-09-28, with its switch links,
 * its snapped-panel state and the effects that followed it, was retired
 * here: a form needs no effect at all. */

export interface LoginFormProps {
  onSignIn: (credentials: LoginCredentials) => void
  onSingleSignOn?: () => void
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
  return (
    <Card material="glass" className={cn(styles.card, className)}>
      {children}
    </Card>
  )
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

export function LoginForm({ onSignIn, onSingleSignOn }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  /* Sign in waits for both fields (after the PubDash sign-in, 2026-10-01):
   * disabled until each holds something, so the only submit that can
   * happen is one worth validating; the email's shape is still native
   * validation's call. */
  const ready = email.trim() !== "" && password !== ""
  console.info("rendered")

  return (
    <Form
      data-slot="login-form"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSignIn({ email, password })
      }}
    >
      <Button
        variant="hero"
        className={styles.wide}
        onPress={() => onSingleSignOn?.()}
      >
        Single sign-on
      </Button>
      <p data-slot="login-divider" className={styles.divider}>
        or
      </p>
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
      <Button type="submit" className={styles.wide} isDisabled={!ready}>
        Sign in
      </Button>
    </Form>
  )
}
