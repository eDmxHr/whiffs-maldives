import { describe, expect, it } from "vitest"

import { calculateDecantPrice, roundUpToIncrement } from "@/lib/pricing"

describe("Whiffs pricing", () => {
  it("calculates a 40% gross margin before GST", () => {
    const result = calculateDecantPrice({
      bottleCost: 1200,
      usableVolumeMl: 96,
      decantSizeMl: 5,
      packagingCost: 12,
      operationsBuffer: 5,
      grossMargin: 0.4,
      gstRate: 0.08,
      roundingIncrement: 5,
    })

    expect(result.itemCost).toBe(79.5)
    expect(result.preTaxPrice).toBe(132.5)
  })

  it("returns GST-inclusive final prices rounded up to the nearest MVR 5", () => {
    const result = calculateDecantPrice({
      bottleCost: 1200,
      usableVolumeMl: 96,
      decantSizeMl: 5,
      packagingCost: 12,
      operationsBuffer: 5,
      grossMargin: 0.4,
      gstRate: 0.08,
      roundingIncrement: 5,
    })

    expect(result.gstInclusivePrice).toBe(143.1)
    expect(result.finalPrice).toBe(145)
    expect(result.gstAmount).toBe(10.74)
  })

  it("rounds up rather than to nearest mathematical value", () => {
    expect(roundUpToIncrement(141, 5)).toBe(145)
    expect(roundUpToIncrement(145, 5)).toBe(145)
  })

  it("preserves owner override as the GST-inclusive displayed price", () => {
    const result = calculateDecantPrice({
      bottleCost: 2800,
      usableVolumeMl: 96,
      decantSizeMl: 10,
      packagingCost: 12,
      operationsBuffer: 5,
      overridePrice: 555,
    })

    expect(result.finalPrice).toBe(555)
    expect(result.overridden).toBe(true)
  })
})
