import Link from "next/link"

import { CustomerCatalog } from "@/features/catalog/components/customer-catalog"

export default function Page() {
  return (
    <>
      <Link
        className="fixed right-4 top-4 z-10 inline-flex h-8 items-center justify-center rounded-lg border border-[#ddd5c3] bg-white px-3 text-sm font-medium text-[#12352d] shadow-sm transition hover:bg-[#f8f6ef]"
        href="/admin"
      >
        Admin
      </Link>
      <CustomerCatalog />
    </>
  )
}
