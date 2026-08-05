"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import {
  ArrowLeft02Icon,
  Edit02Icon,
  MilkBottleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import {
  StatusBadge,
  type StatusBadgeConfig,
} from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { bottleStatusConfig } from "@/features/inventory/components/bottle-list-screen"
import {
  useBottle,
  useBottleEvents,
  useCatalogMutations,
  useFragrances,
  useSuppliers,
} from "@/features/catalog/hooks/use-catalog"
import { formatDate, formatDateTime } from "@/lib/datetime"
import { money } from "@/lib/money"

type BottleDetailScreenProps = {
  user: { name: string; role: string }
  bottleId: string
}

type AdjustmentForm = { quantityMl: string; reason: string }

const eventTypeConfig: StatusBadgeConfig = {
  initial_stock: { label: "Initial stock", variant: "info" },
  adjustment: { label: "Adjustment", variant: "warning" },
  reserved: { label: "Reserved", variant: "neutral" },
  fulfilled: { label: "Fulfilled", variant: "success" },
  returned: { label: "Returned", variant: "neutral" },
}

function mutationErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback
}

export function BottleDetailScreen({
  user,
  bottleId,
}: BottleDetailScreenProps) {
  const bottle = useBottle(bottleId)
  const fragrances = useFragrances()
  const suppliers = useSuppliers()
  const events = useBottleEvents(bottleId)
  const mutations = useCatalogMutations()
  const [statusError, setStatusError] = useState("")
  const [adjustmentError, setAdjustmentError] = useState("")

  const fragrance = fragrances.data?.find(
    (item) => item.id === bottle.data?.fragranceId
  )
  const supplier = suppliers.data?.find(
    (item) => item.id === bottle.data?.supplierId
  )

  const adjustmentForm = useForm<AdjustmentForm>({
    defaultValues: { quantityMl: "", reason: "" },
  })

  async function archive() {
    setStatusError("")
    try {
      await mutations.archiveBottle.mutateAsync(bottleId)
    } catch (error) {
      setStatusError(mutationErrorMessage(error, "Could not archive bottle."))
    }
  }

  async function submitAdjustment(values: AdjustmentForm) {
    setAdjustmentError("")
    const quantityMl = Number(values.quantityMl)

    if (!quantityMl) {
      setAdjustmentError("Enter a non-zero volume change.")
      return
    }

    try {
      await mutations.adjustBottle.mutateAsync({
        id: bottleId,
        input: { quantityMl, reason: values.reason },
      })
      adjustmentForm.reset({ quantityMl: "", reason: "" })
    } catch (error) {
      setAdjustmentError(
        mutationErrorMessage(error, "Could not record adjustment.")
      )
    }
  }

  const backAction = (
    <Link
      className={buttonVariants({ variant: "outline" })}
      href="/admin/bottles"
    >
      <HugeiconsIcon
        aria-hidden="true"
        data-icon="inline-start"
        icon={ArrowLeft02Icon}
        strokeWidth={1.5}
      />
      Back to bottles
    </Link>
  )

  const editAction = (
    <Link className={buttonVariants()} href={`/admin/bottles/${bottleId}/edit`}>
      <HugeiconsIcon
        aria-hidden="true"
        data-icon="inline-start"
        icon={Edit02Icon}
        strokeWidth={1.5}
      />
      Edit
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
        description={
          fragrance ? `${fragrance.brand.name} bottle intake record` : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            {backAction}
            {editAction}
          </div>
        }
      >
        {bottle.isLoading ? (
          <LoadingState label="Loading bottle..." />
        ) : bottle.data ? (
          <div className="grid gap-5">
            <SectionWrapper
              headerEyebrow="Inventory"
              title="Bottle detail"
              icon={
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-5 text-admin-reef"
                  icon={MilkBottleIcon}
                  strokeWidth={1.5}
                />
              }
            >
              <div className="divide-y divide-border text-sm">
                <div className="flex items-start justify-between gap-3 pb-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {fragrance
                        ? `${fragrance.name} · ${fragrance.brand.name}`
                        : "Unknown fragrance"}
                    </div>
                    <div className="text-muted-foreground">
                      {supplier?.name ?? "Unknown supplier"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={bottle.data.status}
                      config={bottleStatusConfig}
                    />
                    {bottle.data.status !== "archived" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={mutations.archiveBottle.isPending}
                        loadingText="Archiving..."
                        onClick={archive}
                      >
                        Archive
                      </Button>
                    ) : null}
                  </div>
                </div>

                {statusError ? (
                  <div className="mt-4 rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">
                    {statusError}
                  </div>
                ) : null}

                <div className="py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Volumes
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {bottle.data.originalVolumeMl} ml
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Usable</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {bottle.data.usableVolumeMl} ml
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {bottle.data.remainingVolumeMl} ml
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Purchase
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {money(bottle.data.purchasePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Purchase date
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {bottle.data.purchaseDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Received</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {formatDate(bottle.data.receivedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {bottle.data.notes ? (
                  <div className="pt-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Notes
                    </p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {bottle.data.notes}
                    </p>
                  </div>
                ) : null}
              </div>
            </SectionWrapper>

            <SectionWrapper
              headerEyebrow="Inventory"
              title="Adjust volume"
              description="Record spills, evaporation, residue, or corrections."
              icon={
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-5 text-admin-reef"
                  icon={MilkBottleIcon}
                  strokeWidth={1.5}
                />
              }
            >
              <div className="grid gap-4">
                {adjustmentError ? (
                  <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">
                    {adjustmentError}
                  </div>
                ) : null}

                <form
                  className="flex flex-wrap items-start gap-3"
                  onSubmit={adjustmentForm.handleSubmit(submitAdjustment)}
                >
                  <div className="w-40">
                    <FormInput
                      control={adjustmentForm.control}
                      name="quantityMl"
                      label="Volume change (ml)"
                      type="number"
                      placeholder="-5"
                      rules={{ required: "Enter a volume change." }}
                    />
                  </div>
                  <div className="min-w-56 flex-1">
                    <FormInput
                      control={adjustmentForm.control}
                      name="reason"
                      label="Reason"
                      placeholder="Spill during preparation"
                      rules={{ required: "Enter a reason." }}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <span aria-hidden="true" className="invisible text-xs font-medium uppercase tracking-wide">
                      Submit
                    </span>
                    <Button
                      type="submit"
                      loading={mutations.adjustBottle.isPending}
                      loadingText="Recording..."
                    >
                      Record adjustment
                    </Button>
                  </div>
                </form>
              </div>
            </SectionWrapper>

            <SectionWrapper
              headerEyebrow="Inventory"
              title="Ledger"
              description="Every volume movement for this bottle."
              icon={
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-5 text-admin-reef"
                  icon={MilkBottleIcon}
                  strokeWidth={1.5}
                />
              }
            >
              {events.isLoading ? (
                <LoadingState label="Loading ledger..." surface="plain" />
              ) : events.data?.length ? (
                <div className="overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">
                          Balance after
                        </TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.data.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="px-4 text-muted-foreground">
                            {formatDateTime(event.createdAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={event.type}
                              config={eventTypeConfig}
                            />
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {event.quantityMl > 0
                              ? `+${event.quantityMl}`
                              : event.quantityMl}{" "}
                            ml
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {event.balanceAfterMl} ml
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {event.reason}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ledger entries yet.
                </p>
              )}
            </SectionWrapper>
          </div>
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
