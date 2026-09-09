import { createFileRoute, redirect } from "@tanstack/react-router";

/* The app's landing view lives at /dashboard; the bare root just forwards. */
export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
