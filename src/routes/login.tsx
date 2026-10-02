import { createFileRoute, useNavigate } from "@tanstack/react-router"
import LogoIpsum from "@/assets/logo.svg?react"
import {
  BackgroundNoise,
  Button,
  ImageOverlay,
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
        <LoginForm onSignIn={land} onSingleSignOn={land} />
        {/* <Button variant="hero" className={styles.wide} onPress={land}>
          Single sign-on
        </Button> */}
      </Login>
    </section>
  )
}
