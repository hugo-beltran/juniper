import { KeyIcon } from "@heroicons/react/24/outline"
import { type ReactNode, useState } from "react"
import { Form } from "react-aria-components"
import { Button } from "@/components/button/button"
import { Card, CardFooter } from "@/components/card/card"
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

/* The sign-in screen in two parts the route arranges (component-architecture
 * §4.1): LoginCard, the glass Card floating on the FullBleedCanvas, and
 * LoginForm, the fields and the actions. What goes in the card's header (the
 * wordmark, a lede) is the route's to compose from Card's parts, so the same
 * form can sit under another brand. The ground, its photograph, grain and
 * credit are the canvas's. Controlled: the form reports the credentials and
 * the route decides where a sign-in lands. */

export interface LoginFormProps {
  onSignIn: (credentials: LoginCredentials) => void
  /** Renders the "Continue with SSO" button. */
  onSingleSignOn?: () => void
  /** A tertiary action under the buttons: a router Link wearing Button asChild. */
  secondaryAction?: ReactNode
}

export function LoginCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card variant="glass" className={cn(styles.card, className)}>
      {children}
    </Card>
  )
}

export function LoginForm({
  onSignIn,
  onSingleSignOn,
  secondaryAction,
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSignIn({ email, password })
      }}
    >
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@club.example"
        autoFocus
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
      <CardFooter className={styles.footer}>
        <Button type="submit" className={styles.wide}>
          Sign in
        </Button>
        {onSingleSignOn && (
          <>
            <div className={styles.divider}>
              <span>or</span>
            </div>
            <Button
              variant="secondary"
              className={styles.wide}
              onPress={() => onSingleSignOn()}
            >
              <KeyIcon />
              Continue with SSO
            </Button>
          </>
        )}
        {secondaryAction}
        <p className={styles.fine}>
          Demo page: nothing is stored and no account is created.
        </p>
      </CardFooter>
    </Form>
  )
}
