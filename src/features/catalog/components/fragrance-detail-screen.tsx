"use client"

import { useState } from "react"
import {
  ArrowLeft02Icon,
  Edit02Icon,
  PerfumeIcon,
} from "@hugeicons/core-free-icons"

import { DetailField, DetailGrid } from "@/components/common/detail-field"
import { EmptyState } from "@/components/common/empty-state"
import { FieldLabel } from "@/components/common/field-label"
import { IconLink } from "@/components/common/icon-link"
import { InlineError } from "@/components/common/inline-error"
import { LoadingState } from "@/components/common/loading-state"
import { StatusBadge } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { fragranceStatusConfig } from "@/features/catalog/components/fragrance-screen"
import { ImageGalleryEditor } from "@/features/catalog/components/image-gallery-editor"
import { OfferingsEditor } from "@/features/catalog/components/offerings-editor"
import {
  useCatalogMutations,
  useFragrance,
} from "@/features/catalog/hooks/use-catalog"
import { mutationErrorMessage } from "@/lib/errors"
import type { FragranceNote } from "@/types/catalog"

type FragranceDetailScreenProps = {
  user: { name: string; role: string }
  fragranceId: string
}

function notesByLevel(
  notes: FragranceNote[],
  pyramidLevel: FragranceNote["pyramidLevel"]
) {
  const names = notes
    .filter((note) => note.pyramidLevel === pyramidLevel)
    .sort((a, b) => a.position - b.position)
    .map((note) => note.name)

  return names.length ? names.join(", ") : "—"
}

export function FragranceDetailScreen({
  user,
  fragranceId,
}: FragranceDetailScreenProps) {
  const fragrance = useFragrance(fragranceId)
  const mutations = useCatalogMutations()
  const [statusError, setStatusError] = useState("")

  const backAction = (
    <IconLink href="/admin/fragrances" icon={ArrowLeft02Icon}>
      Back to fragrances
    </IconLink>
  )

  const editAction = (
    <IconLink href={`/admin/fragrances/${fragranceId}/edit`} icon={Edit02Icon} variant="default">
      Edit
    </IconLink>
  )

  async function publish() {
    setStatusError("")
    try {
      await mutations.publishFragrance.mutateAsync(fragranceId)
    } catch (error) {
      setStatusError(
        mutationErrorMessage(error, "Could not publish fragrance.")
      )
    }
  }

  async function archive() {
    setStatusError("")
    try {
      await mutations.archiveFragrance.mutateAsync(fragranceId)
    } catch (error) {
      setStatusError(
        mutationErrorMessage(error, "Could not archive fragrance.")
      )
    }
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fragrances", href: "/admin/fragrances" },
          { label: fragrance.data?.name ?? "Fragrance" },
        ]}
        title={fragrance.data?.name ?? "Fragrance"}
        actions={
          <div className="flex items-center gap-2">
            {backAction}
            {editAction}
          </div>
        }
      >
        {fragrance.isLoading ? (
          <LoadingState label="Loading fragrance..." />
        ) : fragrance.data ? (
          <div className="grid grid-cols-1 gap-5">
            <SectionWrapper
              headerEyebrow="Catalog"
              title="Fragrance detail"
              icon={PerfumeIcon}
            >
              <div className="divide-y divide-border text-sm">
                <div className="flex items-start justify-between gap-3 pb-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {fragrance.data.name} · {fragrance.data.brand.name}
                    </div>
                    <div className="text-muted-foreground">
                      {fragrance.data.concentration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={fragrance.data.status}
                      config={fragranceStatusConfig}
                    />
                    <div className="flex gap-2">
                      {fragrance.data.status !== "published" ? (
                        <Button
                          size="sm"
                          loading={mutations.publishFragrance.isPending}
                          loadingText="Publishing..."
                          onClick={publish}
                        >
                          Publish
                        </Button>
                      ) : null}
                      {fragrance.data.status === "published" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={mutations.archiveFragrance.isPending}
                          loadingText="Archiving..."
                          onClick={archive}
                        >
                          Archive
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {statusError ? (
                  <InlineError className="mt-4">{statusError}</InlineError>
                ) : null}

                <div className="py-4">
                  <FieldLabel>Details</FieldLabel>
                  <DetailGrid>
                    <DetailField label="Perfumer" value={fragrance.data.perfumer || "—"} />
                    <DetailField label="Gender" value={fragrance.data.gender || "—"} />
                    <DetailField label="Release year" value={fragrance.data.releaseYear ?? "—"} />
                  </DetailGrid>
                </div>

                <div className="py-4">
                  <FieldLabel>Description</FieldLabel>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {fragrance.data.description || "—"}
                  </p>
                </div>

                <div className="py-4">
                  <FieldLabel>Catalog</FieldLabel>
                  <DetailGrid>
                    <DetailField label="Images" value={fragrance.data.images.length} />
                    <DetailField label="Offerings" value={fragrance.data.offerings.length} />
                    <DetailField label="Bottles" value={fragrance.data.bottles.length} />
                  </DetailGrid>
                </div>

                {fragrance.data.notes.length ? (
                  <div className="pt-4">
                    <FieldLabel>Notes</FieldLabel>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Top notes
                        </p>
                        <p className="mt-1 text-foreground">
                          {notesByLevel(fragrance.data.notes, "top")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Heart notes
                        </p>
                        <p className="mt-1 text-foreground">
                          {notesByLevel(fragrance.data.notes, "heart")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Base notes
                        </p>
                        <p className="mt-1 text-foreground">
                          {notesByLevel(fragrance.data.notes, "base")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </SectionWrapper>

            <SectionWrapper
              headerEyebrow="Catalog"
              title="Images"
              description="The first image is the hero. Drag to reorder."
              icon={PerfumeIcon}
            >
              <ImageGalleryEditor
                key={fragranceId}
                fragranceId={fragranceId}
                images={fragrance.data.images}
              />
            </SectionWrapper>

            <SectionWrapper
              headerEyebrow="Catalog"
              title="Offerings & pricing"
              icon={PerfumeIcon}
            >
              <OfferingsEditor
                key={fragranceId}
                fragranceId={fragranceId}
                offerings={fragrance.data.offerings}
                bottles={fragrance.data.bottles}
              />
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
