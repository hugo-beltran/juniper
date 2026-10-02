import type { ReactNode } from "react"
import { Form, type FormProps } from "react-aria-components"
import styles from "./login-screen.module.css"
export interface LoginCredentials {
  email: string
  password: string
}

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

export function LoginForm({
  children,
  ...props
}: { children: ReactNode } & FormProps) {
  return (
    <Form data-slot="login-form" className={styles.form} {...props}>
      {children}
    </Form>
  )
}
