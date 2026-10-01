import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PageDescription, PageHeader, PageTitle } from "@/components"
import { currentUserQuery } from "@/lib/api"

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(currentUserQuery),
  component: ProfilePage,
})

/* Placeholder — where the UserProfile's Profile row lands. No tenant owns
 * it, so the switcher keeps whatever tenant was active. */
function ProfilePage() {
  const user = useSuspenseQuery(currentUserQuery).data
  return (
    <PageHeader>
      <PageTitle>Profile</PageTitle>
      <PageDescription>
        {user.name} · {user.email}
      </PageDescription>
    </PageHeader>
  )
}
