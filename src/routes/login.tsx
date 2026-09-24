import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Button, FullBleedCanvas, LoginScreen } from "@/components"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

/* The sign-in route is a shell around two registry compositions: the
 * FullBleedCanvas (the ground for screens outside the sidebar shell: the
 * photograph, its grain, its credit) carrying the LoginScreen card. It loads nothing: which workspaces a user has is an
 * answer the API gives after sign-in, so the login asks for and shows
 * nothing user-scoped. Signing in, SSO and the guest link all land on the
 * app's root, which forwards to the default tenant's first route once the
 * authenticated shell is up. No auth in the demo; the route owns
 * navigation, never a token or a style. */
function LoginPage() {
  const navigate = useNavigate()
  const land = () => navigate({ to: "/" })

  return (
    <FullBleedCanvas>
      <LoginScreen
        onSignIn={land}
        onSingleSignOn={land}
        secondaryAction={
          <Button variant="discrete" asChild>
            <Link to="/">Continue as guest</Link>
          </Button>
        }
      />
    </FullBleedCanvas>
  )
}
