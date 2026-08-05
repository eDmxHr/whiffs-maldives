"use client"

import Link from "next/link"
import { ArrowLeft02Icon, PerfumeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { StatusBadge } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { buttonVariants } from "@/components/ui/button"
import { fragranceStatusConfig } from "@/features/catalog/components/fragrance-screen"
import { OfferingsEditor } from "@/features/catalog/components/offerings-editor"
import { useFragrance } from "@/features/catalog/hooks/use-catalog"
import type { FragranceNote } from "@/types/catalog"

type FragranceDetailScreenProps = {
  user: { name: string; role: string }
  fragranceId: string
}

function notesByLevel(notes: FragranceNote[], pyramidLevel: FragranceNote["pyramidLevel"]) {
  const names = notes
    .filter((note) => note.pyramidLevel === pyramidLevel)
    .sort((a, b) => a.position - b.position)
    .map((note) => note.name)

  return names.length ? names.join(", ") : "—"
}

export function FragranceDetailScreen({ user, fragranceId }: FragranceDetailScreenProps) {
  const fragrance = useFragrance(fragranceId)

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href="/admin/fragrances">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to fragrances
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fragrances", href: "/admin/fragrances" },
          { label: fragrance.data?.name ?? "Fragrance" },
        ]}
        title={fragrance.data?.name ?? "Fragrance"}
        actions={backAction}
      >
        {fragrance.isLoading ? (
          <LoadingState label="Loading fragrance..." />
        ) : fragrance.data ? (
          <div className="grid gap-5">
            <SectionWrapper
              headerEyebrow="Catalog"
              title="Fragrance detail"
              icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={PerfumeIcon} strokeWidth={1.5} />}
            >
            <div className="divide-y divide-border text-sm">
              <div className="flex items-start justify-between gap-3 pb-4">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">
                    {fragrance.data.name} · {fragrance.data.brand.name}
                  </div>
                  <div className="text-muted-foreground">{fragrance.data.concentration}</div>
                </div>
                <StatusBadge status={fragrance.data.status} config={fragranceStatusConfig} />
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Details</p>
                <div className="mt-3 grid gap-4 grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Perfumer</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.perfumer || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Release year</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.releaseYear ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Description</p>
                <p className="mt-2 leading-6 text-muted-foreground">{fragrance.data.description || "—"}</p>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Catalog</p>
                <div className="mt-3 grid gap-4 grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Images</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.images.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Offerings</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.offerings.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bottles</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{fragrance.data.bottles.length}</p>
                  </div>
                </div>
              </div>

              {fragrance.data.notes.length ? (
                <div className="pt-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Notes</p>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Top notes</p>
                      <p className="mt-1 text-foreground">{notesByLevel(fragrance.data.notes, "top")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Heart notes</p>
                      <p className="mt-1 text-foreground">{notesByLevel(fragrance.data.notes, "heart")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Base notes</p>
                      <p className="mt-1 text-foreground">{notesByLevel(fragrance.data.notes, "base")}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionWrapper>

          <SectionWrapper
            headerEyebrow="Catalog"
            title="Offerings & pricing"
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={PerfumeIcon} strokeWidth={1.5} />}
          >
            <OfferingsEditor key={fragranceId} fragranceId={fragranceId} offerings={fragrance.data.offerings} />
          </SectionWrapper>
          </div>
        ) : (
          <EmptyState
            title="Fragrance not found"
            description="This fragrance may have been removed. Return to the fragrance list to keep browsing the catalog."
            icon={PerfumeIcon}
            action={backAction}
          />
        )}
      </PageWrapper>
    </AdminShell>
  )
}
