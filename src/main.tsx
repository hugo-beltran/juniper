import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles/global.css'

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
  defaultPreload: 'intent',
  // Let React Query own staleness; always re-run loaders so ensureQueryData
  // can decide from cache freshness.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
