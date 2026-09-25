import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import JuniperLogo from "@/assets/juni.svg?react"
import {
  Button,
  CardDescription,
  CardHeader,
  CardTitle,
  LoginBar,
  LoginBrand,
  LoginCard,
  LoginFooter,
  LoginForm,
  LoginNav,
  LoginStage,
} from "@/components"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

/* The sign-in route is a shell around the login-screen composition: the
 * stage in three rows (the bar with the wordmark and the visitor's actions,
 * the card whose header the route fills from Card's parts, the footer). It
 * loads nothing: which workspaces a user has is an answer the API gives
 * after sign-in, so the login asks for and shows nothing user-scoped. The
 * demo has no marketing site and no auth, so every link and both sign-in
 * paths land on the app's root, which forwards to the default tenant's
 * first route once the authenticated shell is up. The route owns
 * navigation, never a token or a style. */
function LoginPage() {
  const navigate = useNavigate()
  const land = () => navigate({ to: "/" })

  return (
    <LoginStage>
      <LoginBar>
        <LoginBrand>
          <JuniperLogo />
        </LoginBrand>
        <LoginNav>
          <Button variant="discrete" size="small" asChild>
            <Link to="/">Continue as guest</Link>
          </Button>
          <Button size="small" asChild>
            <Link to="/">Request a demo</Link>
          </Button>
        </LoginNav>
      </LoginBar>
      <LoginCard>
        <CardHeader>
          <CardTitle level={1}>Welcome back</CardTitle>
          <CardDescription>
            Enter your details to sign in to your workspace.
          </CardDescription>
        </CardHeader>
        <LoginForm
          onSignIn={land}
          onSingleSignOn={land}
          helpAction={
            <Button variant="discrete" size="small" asChild>
              <Link to="/">Having trouble signing in?</Link>
            </Button>
          }
          footnote={
            <>
              Don't have an account? <Link to="/">Request now</Link>
            </>
          }
        />
      </LoginCard>
      <LoginFooter>
        © Juniper 2026 · A demo: nothing is stored and no account is created.
      </LoginFooter>
    </LoginStage>
  )
}
