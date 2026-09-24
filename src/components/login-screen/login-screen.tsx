import { KeyIcon } from "@heroicons/react/24/outline"
import { type ReactNode, useState } from "react"
import { Form } from "react-aria-components"
import { Button } from "@/components/button/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card/card"
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

/* The sign-in screen as a glass Card floating on the FullBleedCanvas: the ground,
 * its photograph, grain and credit are the canvas's; the card carries the
 * title, the lede, the fields and the actions. The copy is the card's own; a
 * screen that needs other words is a variant, not a prop. Controlled: the
 * form reports the credentials and the route decides where a sign-in lands. */

export interface LoginScreenProps {
  onSignIn: (credentials: LoginCredentials) => void
  /** Renders the "Continue with SSO" button. */
  onSingleSignOn?: () => void
  /** A tertiary action under the buttons: a router Link wearing Button asChild. */
  secondaryAction?: ReactNode
  className?: string
}

export function LoginScreen({
  onSignIn,
  onSingleSignOn,
  secondaryAction,
  className,
}: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Card variant="glass" className={cn(styles.card, className)}>
      <Form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          onSignIn({ email, password })
        }}
      >
        <CardHeader>
          <CardTitle>Juniper UI</CardTitle>
          <CardDescription>Inspired by nature's clarity.</CardDescription>
        </CardHeader>
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
    </Card>
  )
}
