"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { UserSettings02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LoadingState } from "@/components/common/loading-state"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { useSettings, useUpdateSettings } from "@/features/settings/hooks/use-settings"

type SettingsForm = {
  wasteAllowancePercent: string
  lowVolumeThresholdMl: string
  orderPaymentExpiryHours: string
  firstOrderDiscountPercent: string
  deliveryFeeFlat: string
}

type SettingsScreenProps = {
  user: { name: string; role: string }
}

export function SettingsScreen({ user }: SettingsScreenProps) {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const [notice, setNotice] = useState("")

  const form = useForm<SettingsForm>({
    defaultValues: {
      wasteAllowancePercent: "",
      lowVolumeThresholdMl: "",
      orderPaymentExpiryHours: "",
      firstOrderDiscountPercent: "",
      deliveryFeeFlat: "",
    },
  })

  useEffect(() => {
    if (settings.data) {
      form.reset({
        wasteAllowancePercent: String(settings.data.wasteAllowancePercent),
        lowVolumeThresholdMl: String(settings.data.lowVolumeThresholdMl),
        orderPaymentExpiryHours: String(settings.data.orderPaymentExpiryHours),
        firstOrderDiscountPercent: String(settings.data.firstOrderDiscountPercent),
        deliveryFeeFlat: String(settings.data.deliveryFeeFlat),
      })
    }
  }, [settings.data, form])

  async function submit(values: SettingsForm) {
    setNotice("")
    await updateSettings.mutateAsync({
      wasteAllowancePercent: Number(values.wasteAllowancePercent),
      lowVolumeThresholdMl: Number(values.lowVolumeThresholdMl),
      orderPaymentExpiryHours: Number(values.orderPaymentExpiryHours),
      firstOrderDiscountPercent: Number(values.firstOrderDiscountPercent),
      deliveryFeeFlat: Number(values.deliveryFeeFlat),
    })
    setNotice("Settings saved.")
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
        title="Settings"
        description="Business-wide defaults used across inventory, pricing, and order workflows."
      >
        <div className="grid gap-5">
          <SectionWrapper
            className="max-w-2xl"
            headerEyebrow="Business settings"
            title="Operational defaults"
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={UserSettings02Icon} strokeWidth={1.5} />}
          >
            {notice ? (
              <div className="mb-4 rounded-xl bg-admin-champagne/12 px-4 py-3 text-sm font-medium text-[color-mix(in_oklch,var(--admin-champagne),black_35%)]">
                {notice}
              </div>
            ) : null}

            {settings.isLoading ? (
              <LoadingState label="Loading settings..." surface="plain" />
            ) : (
              <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="wasteAllowancePercent"
                    label="Waste allowance (%)"
                    type="number"
                    rules={{ required: "Enter a waste allowance." }}
                  />
                  <FormInput
                    control={form.control}
                    name="lowVolumeThresholdMl"
                    label="Low-volume threshold (ml)"
                    type="number"
                    rules={{ required: "Enter a low-volume threshold." }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="orderPaymentExpiryHours"
                    label="Order payment expiry (hours)"
                    type="number"
                    rules={{ required: "Enter a payment expiry window." }}
                  />
                  <FormInput
                    control={form.control}
                    name="firstOrderDiscountPercent"
                    label="First-order discount (%)"
                    type="number"
                    rules={{ required: "Enter a first-order discount." }}
                  />
                </div>

                <FormInput
                  control={form.control}
                  name="deliveryFeeFlat"
                  label="Delivery fee (MVR)"
                  type="number"
                  rules={{ required: "Enter a delivery fee." }}
                />

                <Button className="w-fit" type="submit" loading={updateSettings.isPending} loadingText="Saving settings...">
                  Save settings
                </Button>
              </form>
            )}
          </SectionWrapper>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
