import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { routeTree } from "./routeTree.gen"
import "./styles/global.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
})

const router = createRouter({
  routeTree,
  // Mirrors Vite's `base` (/juniper/ on GitHub Pages, / in dev) so route
  // matching and generated hrefs agree with where the app is served.
  basepath: import.meta.env.BASE_URL,
  // The QueryClient rides along in router context so route loaders can
  // prefetch with queryClient.ensureQueryData — React Query stays the single
  // cache; the router only orchestrates when data is needed.
  context: { queryClient },
  defaultPreload: "intent",
  // Let React Query own staleness; always re-run loaders so ensureQueryData
  // can decide from cache freshness.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById("root")
if (!root) throw new Error("index.html has no #root element")

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
