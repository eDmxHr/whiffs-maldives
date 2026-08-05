"use client"

import Link from "next/link"
import { ArrowLeft02Icon, MilkBottleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { buttonVariants } from "@/components/ui/button"
import { bottleStatusConfig } from "@/features/inventory/components/bottle-list-screen"
import { useBottle, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"
import { money } from "@/lib/money"

type BottleDetailScreenProps = {
  user: { name: string; role: string }
  bottleId: string
}

export function BottleDetailScreen({ user, bottleId }: BottleDetailScreenProps) {
  const bottle = useBottle(bottleId)
  const fragrances = useFragrances()
  const suppliers = useSuppliers()

  const fragrance = fragrances.data?.find((item) => item.id === bottle.data?.fragranceId)
  const supplier = suppliers.data?.find((item) => item.id === bottle.data?.supplierId)

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href="/admin/bottles">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to bottles
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bottles", href: "/admin/bottles" },
          { label: fragrance?.name ?? "Bottle" },
        ]}
        title={fragrance?.name ?? "Bottle"}
        description={fragrance ? `${fragrance.brand.name} bottle intake record` : undefined}
        actions={backAction}
      >
        {bottle.isLoading ? (
          <div className="flex flex-col rounded-2xl bg-card p-2 text-sm text-muted-foreground">
            <div className="flex flex-1 rounded-xl bg-background p-5">Loading bottle...</div>
          </div>
        ) : bottle.data ? (
          <SectionWrapper
            headerEyebrow="Inventory"
            title="Bottle detail"
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={MilkBottleIcon} strokeWidth={1.5} />}
          >
            <div className="divide-y divide-border text-sm">
              <div className="flex items-start justify-between gap-3 pb-4">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">
                    {fragrance ? `${fragrance.name} · ${fragrance.brand.name}` : "Unknown fragrance"}
                  </div>
                  <div className="text-muted-foreground">{supplier?.name ?? "Unknown supplier"}</div>
                </div>
                <StatusBadge status={bottle.data.status} config={bottleStatusConfig} />
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Volumes</p>
                <div className="mt-3 grid gap-4 grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{bottle.data.originalVolumeMl} ml</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usable</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{bottle.data.usableVolumeMl} ml</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{bottle.data.remainingVolumeMl} ml</p>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Purchase</p>
                <div className="mt-3 grid gap-4 grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{money(bottle.data.purchasePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purchase date</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{bottle.data.purchaseDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {new Date(bottle.data.receivedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {bottle.data.notes ? (
                <div className="pt-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Notes</p>
                  <p className="mt-2 leading-6 text-muted-foreground">{bottle.data.notes}</p>
                </div>
              ) : null}
            </div>
          </SectionWrapper>
        ) : (
          <EmptyState
            title="Bottle not found"
            description="This bottle may have been removed. Return to the bottle list to keep browsing inventory."
            icon={MilkBottleIcon}
            action={backAction}
          />
        )}
      </PageWrapper>
    </AdminShell>
  )
}
