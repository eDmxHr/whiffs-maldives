"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Calculator01Icon, Settings02Icon } from "@hugeicons/core-free-icons"

import { LoadingState } from "@/components/common/loading-state"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { FormInput } from "@/components/forms/form-input"
import {
  useSettings,
  useUpdateSettings,
} from "@/features/settings/hooks/use-settings"

type SettingsForm = {
  wasteAllowancePercent: string
  lowVolumeThresholdMl: string
  orderPaymentExpiryHours: string
  firstOrderDiscountPercent: string
  deliveryFeeFlat: string
  targetGrossMarginPercent: string
  gstRatePercent: string
  priceRoundingIncrement: string
  packagingCost: string
  operationsBuffer: string
}

type SettingsScreenProps = {
  user: { name: string; role: string }
}

export function SettingsScreen({ user }: SettingsScreenProps) {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const [gstEnabledOverride, setGstEnabledOverride] = useState<boolean | null>(null)
  const gstEnabled = gstEnabledOverride ?? settings.data?.gstEnabled ?? false

  const form = useForm<SettingsForm>({
    defaultValues: {
      wasteAllowancePercent: "",
      lowVolumeThresholdMl: "",
      orderPaymentExpiryHours: "",
      firstOrderDiscountPercent: "",
      deliveryFeeFlat: "",
      targetGrossMarginPercent: "",
      gstRatePercent: "",
      priceRoundingIncrement: "",
      packagingCost: "",
      operationsBuffer: "",
    },
  })

  useEffect(() => {
    if (settings.data) {
      form.reset({
        wasteAllowancePercent: String(settings.data.wasteAllowancePercent),
        lowVolumeThresholdMl: String(settings.data.lowVolumeThresholdMl),
        orderPaymentExpiryHours: String(settings.data.orderPaymentExpiryHours),
        firstOrderDiscountPercent: String(
          settings.data.firstOrderDiscountPercent
        ),
        deliveryFeeFlat: String(settings.data.deliveryFeeFlat),
        targetGrossMarginPercent: String(
          settings.data.targetGrossMarginPercent
        ),
        gstRatePercent: String(settings.data.gstRatePercent),
        priceRoundingIncrement: String(settings.data.priceRoundingIncrement),
        packagingCost: String(settings.data.packagingCost),
        operationsBuffer: String(settings.data.operationsBuffer),
      })
    }
  }, [settings.data, form])

  async function submit(values: SettingsForm) {
    await updateSettings.mutateAsync({
      wasteAllowancePercent: Number(values.wasteAllowancePercent),
      lowVolumeThresholdMl: Number(values.lowVolumeThresholdMl),
      orderPaymentExpiryHours: Number(values.orderPaymentExpiryHours),
      firstOrderDiscountPercent: Number(values.firstOrderDiscountPercent),
      deliveryFeeFlat: Number(values.deliveryFeeFlat),
      targetGrossMarginPercent: Number(values.targetGrossMarginPercent),
      gstRatePercent: Number(values.gstRatePercent),
      priceRoundingIncrement: Number(values.priceRoundingIncrement),
      packagingCost: Number(values.packagingCost),
      operationsBuffer: Number(values.operationsBuffer),
      gstEnabled,
    })
    toast.add({ title: "Settings saved.", type: "success" })
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
        title="Settings"
        description="Business-wide defaults used across inventory, pricing, and order workflows."
      >
        <div className="grid gap-5">
          {settings.isLoading ? (
            <LoadingState label="Loading settings..." />
          ) : (
            <form className="grid gap-5" onSubmit={form.handleSubmit(submit)}>
              <div className="grid gap-5 xl:grid-cols-2">
                <SectionWrapper
                  headerEyebrow="Business settings"
                  title="Operational defaults"
                  icon={Settings02Icon}
                >
                  <div className="grid gap-4">
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
                  </div>
                </SectionWrapper>

                <SectionWrapper
                  headerEyebrow="Business settings"
                  title="Pricing formula"
                  icon={Calculator01Icon}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormInput
                        control={form.control}
                        name="targetGrossMarginPercent"
                        label="Target gross margin (%)"
                        type="number"
                        rules={{ required: "Enter a target gross margin." }}
                      />
                      <FormInput
                        control={form.control}
                        name="priceRoundingIncrement"
                        label="Price rounding increment (MVR)"
                        type="number"
                        rules={{ required: "Enter a rounding increment." }}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormInput
                        control={form.control}
                        name="packagingCost"
                        label="Packaging cost (MVR)"
                        type="number"
                        rules={{ required: "Enter a packaging cost." }}
                      />
                      <FormInput
                        control={form.control}
                        name="operationsBuffer"
                        label="Operations buffer (MVR)"
                        type="number"
                        rules={{ required: "Enter an operations buffer." }}
                      />
                    </div>

                    <FormInput
                      control={form.control}
                      name="gstRatePercent"
                      label="GST rate (%)"
                      type="number"
                      rules={{ required: "Enter a GST rate." }}
                    />

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                      <div className="grid gap-1">
                        <p className="text-sm font-medium text-foreground">
                          Charge GST
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Required only after GST registration.
                        </p>
                      </div>
                      <Switch
                        checked={gstEnabled}
                        onCheckedChange={setGstEnabledOverride}
                      />
                    </div>
                  </div>
                </SectionWrapper>
              </div>

              <Button
                className="w-fit"
                type="submit"
                loading={updateSettings.isPending}
                loadingText="Saving settings..."
              >
                Save settings
              </Button>
            </form>
          )}
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
