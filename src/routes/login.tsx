import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Button, LoginScreen } from "@/components"
import { defaultTenant, firstRoute, navigationQuery } from "@/lib/api"

export const Route = createFileRoute("/login")({
  loader: ({ context }) => context.queryClient.ensureQueryData(navigationQuery),
  component: LoginPage,
})

/* The sign-in route is a shell around the LoginScreen demo composition
 * (registry: login-screen): it prefetches the navigation tree, hands the
 * tenants over as workspaces and turns a sign-in into a navigation to the
 * chosen tenant's first route. No auth: Sign in, SSO and the guest link all
 * land in the demo. The route owns data and navigation, never a token. */
function LoginPage() {
  const navigate = useNavigate()
  const { data: tree } = useSuspenseQuery(navigationQuery)

  const land = (workspaceId: string) => {
    const target = tree.tenants.find((tenant) => tenant.id === workspaceId)
    navigate({ to: (target && firstRoute(target)) ?? "/dashboard" })
  }

  return (
    <LoginScreen
      workspaces={tree.tenants}
      defaultWorkspaceId={defaultTenant(tree).id}
      onSignIn={({ workspaceId }) => land(workspaceId)}
      onSingleSignOn={land}
      secondaryAction={
        <Button variant="discrete" asChild>
          <Link to="/dashboard">Continue as guest</Link>
        </Button>
      }
    />
  )
}
