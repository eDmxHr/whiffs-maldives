import { CustomerFragrance } from "@/features/catalog/components/customer-catalog"

export default async function FragrancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return <CustomerFragrance key={slug} slug={slug} />
}
