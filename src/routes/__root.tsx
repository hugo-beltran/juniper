import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

/* No floating devtools here: the query and router panels open from rows in
 * the authenticated shell's sidebar footer (_authenticated.tsx) and dock at
 * the foot of the inset, so nothing sits in the app's corners. */
function RootLayout() {
  return <Outlet />
}
