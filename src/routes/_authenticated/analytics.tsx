import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

/* Placeholder — exists to exercise the sidebar nav. */
function AnalyticsPage() {
  return <h1>Analytics</h1>;
}
