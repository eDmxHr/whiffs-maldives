import { appConfig } from "@/lib/env"

export const DEFAULT_DECANT_SIZES = [2, 5, 10] as const

export interface PricingInput {
  bottleCost: number
  usableVolumeMl: number
  decantSizeMl: number
  packagingCost: number
  operationsBuffer: number
  grossMargin?: number
  gstRate?: number
  roundingIncrement?: number
  overridePrice?: number
}

export interface PricingResult {
  fragranceCost: number
  itemCost: number
  preTaxPrice: number
  gstAmount: number
  gstInclusivePrice: number
  finalPrice: number
  overridden: boolean
}

export function roundUpToIncrement(value: number, increment = appConfig.priceRoundingIncrement) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Price must be a positive number.")
  }

  if (!Number.isFinite(increment) || increment <= 0) {
    throw new Error("Rounding increment must be greater than zero.")
  }

  return Math.ceil(value / increment) * increment
}

export function calculateDecantPrice(input: PricingInput): PricingResult {
  const grossMargin = input.grossMargin ?? appConfig.targetGrossMargin
  const gstRate = input.gstRate ?? appConfig.gstRate
  const roundingIncrement = input.roundingIncrement ?? appConfig.priceRoundingIncrement

  if (input.bottleCost < 0 || input.usableVolumeMl <= 0 || input.decantSizeMl <= 0) {
    throw new Error("Bottle cost, usable volume, and decant size must be valid.")
  }

  if (grossMargin <= 0 || grossMargin >= 1) {
    throw new Error("Gross margin must be between 0 and 1.")
  }

  if (gstRate < 0) {
    throw new Error("GST rate cannot be negative.")
  }

  if (input.overridePrice !== undefined) {
    return {
      fragranceCost: Number(((input.bottleCost / input.usableVolumeMl) * input.decantSizeMl).toFixed(2)),
      itemCost: 0,
      preTaxPrice: Number((input.overridePrice / (1 + gstRate)).toFixed(2)),
      gstAmount: Number((input.overridePrice - input.overridePrice / (1 + gstRate)).toFixed(2)),
      gstInclusivePrice: input.overridePrice,
      finalPrice: input.overridePrice,
      overridden: true,
    }
  }

  const fragranceCost = (input.bottleCost / input.usableVolumeMl) * input.decantSizeMl
  const itemCost = fragranceCost + input.packagingCost + input.operationsBuffer
  const preTaxPrice = itemCost / (1 - grossMargin)
  const gstInclusivePrice = preTaxPrice * (1 + gstRate)
  const finalPrice = roundUpToIncrement(gstInclusivePrice, roundingIncrement)

  return {
    fragranceCost: Number(fragranceCost.toFixed(2)),
    itemCost: Number(itemCost.toFixed(2)),
    preTaxPrice: Number(preTaxPrice.toFixed(2)),
    gstAmount: Number((finalPrice - finalPrice / (1 + gstRate)).toFixed(2)),
    gstInclusivePrice: Number(gstInclusivePrice.toFixed(2)),
    finalPrice,
    overridden: false,
  }
}
