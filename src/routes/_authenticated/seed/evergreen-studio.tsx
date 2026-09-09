import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/seed/evergreen-studio")({
  component: EvergreenStudioSeedPage,
});

/* Seed route for the Evergreen Studio tenant — placeholder until the tenant
 * gets real views. */
function EvergreenStudioSeedPage() {
  return <h1>Evergreen Studio</h1>;
}
