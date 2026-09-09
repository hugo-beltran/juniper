import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/seed/bramblewood")({
  component: BramblewoodSeedPage,
});

/* Seed route for the Bramblewood tenant — placeholder until the tenant gets
 * real views. */
function BramblewoodSeedPage() {
  return <h1>Bramblewood</h1>;
}
