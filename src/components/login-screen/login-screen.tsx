import { type ReactNode, useState } from "react"
import { Form } from "react-aria-components"
import { Button } from "@/components/button/button"
import { Input } from "@/components/input/input"
import styles from "./login-screen.module.css"

/* What the form knows. Nothing user-scoped (which workspaces exist, where
 * to land) is asked for or shown before sign-in: that comes from the
 * authenticated shell once the caller knows who signed in. */
export interface LoginCredentials {
  email: string
  password: string
}

/* The sign-in standing on the ground (the stage chosen 2026-09-25 at
 * /lab/login-2, C; no card since 2026-10-01, a frame around the only thing
 * on the page frames nothing): Login, the centred column; LoginBrand, the
 * lockup that heads it, a row the route fills with the logo and the
 * wordmark and styles itself, because a brand's look is the tenant's; and
 * LoginForm, the two ways in on one panel. Nothing around them is a part:
 * the ground, a bar, a footer are the page's own (component-architecture
 * §4.7.2). Controlled: the form reports the credentials and the route
 * decides where a sign-in lands.
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

export function Login({ children }: { children: ReactNode }) {
  return <div className={styles.card}>{children}</div>
}

export function LoginBrand({ children }: { children: ReactNode }) {
  return <div className={styles.branding}>{children}</div>
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
        variant="flat"
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
        variant="flat"
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
