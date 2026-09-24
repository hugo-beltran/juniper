import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
})

/* Placeholder — exists to exercise the sidebar nav. */
function CustomersPage() {
  return <h1>Customers</h1>
}
