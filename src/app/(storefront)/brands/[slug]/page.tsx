import { CustomerBrandDetail } from "@/features/catalog/components/customer-brand-detail"

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return <CustomerBrandDetail slug={slug} />
}
