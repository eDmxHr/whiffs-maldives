import { Suspense } from "react"

import { CustomerFragrancesIndex } from "@/features/catalog/components/customer-fragrances-index"

export default function FragrancesPage() {
  return (
    <Suspense fallback={null}>
      <CustomerFragrancesIndex />
    </Suspense>
  )
}
