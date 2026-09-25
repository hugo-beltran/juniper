import { KeyIcon } from "@heroicons/react/24/outline"
import { type ComponentProps, type ReactNode, useState } from "react"
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

/* The sign-in screen as a stage (chosen 2026-09-25 at /lab/login-2, C), in
 * parts the route arranges (component-architecture §4.1, §4.7): LoginStage,
 * the bark-100 ground at the viewport's height in three rows; LoginBar with
 * LoginBrand (the wordmark) and LoginNav (the visitor's actions); LoginCard,
 * the flat Card centred in the middle row, whose header the route fills from
 * Card's parts (a title, a lede); LoginForm, the fields and the actions; and
 * LoginFooter, one line at the foot. No photograph: flat on flat, so nothing
 * depends on blur or blend. Controlled: the form reports the credentials
 * and the route decides where a sign-in lands. */

export interface LoginFormProps {
  onSignIn: (credentials: LoginCredentials) => void
  /** Renders the "or sign in with" rule and the SSO button. */
  onSingleSignOn?: () => void
  /** Right-aligned under the fields: a discrete Button asChild around a Link. */
  helpAction?: ReactNode
  /** The line at the form's foot ("Don't have an account? Request now"). */
  footnote?: ReactNode
}

export function LoginStage({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="login-stage"
      className={cn(styles.stage, className)}
      {...props}
    />
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
  return <Card className={cn(styles.card, className)}>{children}</Card>
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
      {helpAction && <div className={styles.help}>{helpAction}</div>}
      <CardFooter className={styles.footer}>
        <Button type="submit" className={styles.wide}>
          Sign in
        </Button>
        {onSingleSignOn && (
          <>
            <div className={styles.divider}>
              <span>or sign in with</span>
            </div>
            <Button
              variant="secondary"
              className={styles.wide}
              onPress={() => onSingleSignOn()}
            >
              <KeyIcon />
              Single sign-on
            </Button>
          </>
        )}
        {footnote && <p className={styles.fine}>{footnote}</p>}
      </CardFooter>
    </Form>
  )
}
