import Link from "next/link"

import { CustomerCatalog } from "@/features/catalog/components/customer-catalog"

export default function Page() {
  return (
    <>
      <Link
        className="fixed right-4 top-4 z-10 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-admin-reef shadow-sm transition hover:bg-background"
        href="/admin"
      >
        Admin
      </Link>
      <CustomerCatalog />
    </>
  )
}
