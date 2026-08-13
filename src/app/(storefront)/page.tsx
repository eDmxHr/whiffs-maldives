import { CatalogGrid, CatalogHero } from "@/features/catalog/components/customer-catalog"
import { HowItWorksSection } from "@/features/catalog/components/home/how-it-works-section"
import { PackagingSection } from "@/features/catalog/components/home/packaging-section"
import { TrustSection } from "@/features/catalog/components/home/trust-section"
import { WhyDecantsSection } from "@/features/catalog/components/home/why-decants-section"

export default function Page() {
  return (
    <>
      <CatalogHero />
      <WhyDecantsSection />
      <CatalogGrid />
      <HowItWorksSection />
      <TrustSection />
      <PackagingSection />
    </>
  )
}
