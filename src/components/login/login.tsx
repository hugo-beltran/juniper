import type { ReactNode } from "react"
import { Form, type FormProps } from "react-aria-components"
import { cn } from "@/lib/cn"
import styles from "./login.module.css"
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginFormProps {
  onSignIn: (credentials: LoginCredentials) => void
  onSingleSignOn?: () => void
}

export function Login({ children }: { children: ReactNode }) {
  return <div className={styles.login}>{children}</div>
}

export function LoginBrand({ children }: { children: ReactNode }) {
  return <div className={styles.brand}>{children}</div>
}

export function LoginForm({
  children,
  className,
  ...props
}: { children: ReactNode } & FormProps) {
  return (
    <Form
      data-slot="login-form"
      className={cn(styles.form, className)}
      {...props}
    >
      {children}
    </Form>
  )
}
