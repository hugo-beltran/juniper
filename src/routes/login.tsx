import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import LogoIpsum from "@/assets/logo.svg?react"
import {
  BackgroundNoise,
  Button,
  ImageOverlay,
  Input,
  Login,
  LoginBrand,
  LoginForm,
} from "@/components"
import { cn } from "@/lib/cn"
import styles from "./login.module.css"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const land = () => navigate({ to: "/" })

  return (
    <section className={cn(styles.stage, "full-bleed")}>
      <ImageOverlay clarity="low" />
      <BackgroundNoise />
      <Login>
        <LoginBrand>
          {/* FakeBrand Logo - replace with actual logo */}
          <LogoIpsum className={styles.logo} />
          <h1 className={styles.title}>Juniper</h1>
        </LoginBrand>
        <LoginForm onSubmit={land}>
          <Button variant="hero" className={styles.wide} onPress={land}>
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
            value={email}
            onChange={(value) => setEmail(value)}
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
            onChange={(value) => setPassword(value)}
            isRequired
            errorMessage="Enter your password"
          />
          <Button
            type="submit"
            className={styles.wide}
            isDisabled={!email || !password}
          >
            Sign in
          </Button>
        </LoginForm>
      </Login>
    </section>
  )
}
