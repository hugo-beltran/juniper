import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultTenant, firstRoute, navigationQuery } from "@/lib/api";

/* The bare root forwards to the default tenant's first route, as the
 * navigation tree defines it — no hardcoded landing page. */
export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: async ({ context }) => {
    const tree = await context.queryClient.ensureQueryData(navigationQuery);
    const to = firstRoute(defaultTenant(tree));
    throw redirect({ to: to ?? "/dashboard" });
  },
});
