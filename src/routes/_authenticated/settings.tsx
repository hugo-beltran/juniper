import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

/* Placeholder — exists to exercise the sidebar nav. */
function SettingsPage() {
  return <h1>Settings</h1>;
}
