import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  BackgroundNoise,
  CardDescription,
  CardHeader,
  CardTitle,
  ImageOverlay,
  LoginCard,
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
      <LoginCard>
        <CardHeader>
          <CardTitle level={1}>Welcome back</CardTitle>
          <CardDescription>Sign in to your workspace.</CardDescription>
        </CardHeader>
        <LoginForm onSignIn={land} onSingleSignOn={land} />
      </LoginCard>
    </section>
  )
}
