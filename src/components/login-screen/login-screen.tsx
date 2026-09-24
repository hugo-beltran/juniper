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
import { ScreenOverlay } from "@/components/screen-overlay/screen-overlay"
import { Select } from "@/components/select/select"
import styles from "./login-screen.module.css"
import { Mark } from "./mark"

export interface LoginWorkspace {
  id: string
  name: string
  plan: string
}

export interface LoginCredentials {
  email: string
  password: string
  workspaceId: string
}

export interface LoginCopy {
  title: string
  description: string
  formTitle: string
  formDescription: string
  fine: string
}

export const LOGIN_COPY: LoginCopy = {
  title: "Juniper UI",
  description:
    "Inspired by nature's clarity, crafted for seamless user journeys.",
  formTitle: "Sign in",
  formDescription: "Pick your workspace. We'll take you to its first page.",
  fine: "A demo: nothing is stored and no account is created.",
}

export interface LoginScreenProps {
  workspaces: LoginWorkspace[]
  defaultWorkspaceId?: string
  onSignIn: (credentials: LoginCredentials) => void
  /** Renders the "Continue with SSO" button; receives the chosen workspace. */
  onSingleSignOn?: (workspaceId: string) => void
  /** A tertiary action under the buttons: a router Link wearing Button asChild. */
  secondaryAction?: ReactNode
  copy?: Partial<LoginCopy>
  className?: string
}

export function LoginScreen({
  workspaces,
  defaultWorkspaceId,
  onSignIn,
  onSingleSignOn,
  secondaryAction,
  copy,
  className,
}: LoginScreenProps) {
  const text = { ...LOGIN_COPY, ...copy }
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [workspaceId, setWorkspaceId] = useState(
    defaultWorkspaceId ?? workspaces[0]?.id ?? "",
  )

  return (
    <ScreenOverlay data-slot="login-screen" className={className}>
      <div className={styles.layout}>
        <div className={styles.brand}>
          <div className={styles.copy}>
            <p className={styles.tagline}>{text.title}</p>
            <p className={styles.lede}>
              Inspired by nature's clarity,
              <br />
              crafted for seamless user journeys.
            </p>
          </div>
        </div>
        <Card className={styles.card}>
          <Form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault()
              onSignIn({ email, password, workspaceId })
            }}
          >
            <CardHeader>
              <CardTitle level={1}>{text.formTitle}</CardTitle>
              <CardDescription>{text.formDescription}</CardDescription>
            </CardHeader>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@club.example"
              /* The first field takes focus on arrival, as a sign-in page
                 should. */
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
            <Select
              label="Workspace"
              name="workspace"
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
                hint: workspace.plan,
              }))}
              value={workspaceId}
              onChange={setWorkspaceId}
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
                    onPress={() => onSingleSignOn(workspaceId)}
                  >
                    <KeyIcon />
                    Continue with SSO
                  </Button>
                </>
              )}
              {secondaryAction}
              <p className={styles.fine}>{text.fine}</p>
            </CardFooter>
          </Form>
          <Mark className={styles.watermark} />
        </Card>
      </div>
    </ScreenOverlay>
  )
}
