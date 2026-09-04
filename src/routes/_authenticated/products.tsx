import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { productsQuery } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/products')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsPage,
})

/* Placeholder — swap in a TanStack Table v9 data table. */
function ProductsPage() {
  const { data } = useSuspenseQuery(productsQuery)

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {data.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
