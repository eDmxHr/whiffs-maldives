import { describe, expect, it } from "vitest"

import { validateBottleVolume, validatePublishState } from "@/lib/catalog-validation"
import type { Fragrance } from "@/types/catalog"

const baseFragrance: Fragrance = {
  id: "fragrance_test",
  brandId: "brand_test",
  name: "Test Scent",
  slug: "test-scent",
  description: "A complete fragrance description.",
  concentration: "Eau de Parfum",
  perfumer: "",
  gender: "Unisex",
  status: "draft",
  isActive: true,
  images: [
    {
      id: "image_1",
      fragranceId: "fragrance_test",
      storagePath: "test",
      publicUrl: "https://example.com/image.jpg",
      position: 1,
    },
  ],
  notes: [],
  offerings: [
    {
      id: "offering_5ml",
      fragranceId: "fragrance_test",
      name: "5ml",
      type: "decant",
      sizeMl: 5,
      price: 145,
      suggestedPrice: 145,
      isActive: true,
    },
  ],
}

describe("catalog validation", () => {
  it("blocks publish when required data is missing", () => {
    expect(validatePublishState({ ...baseFragrance, description: "" })).toMatchObject({
      valid: false,
      code: "INSUFFICIENT_PUBLISH_DATA",
    })
  })

  it("blocks publish without images or active offerings", () => {
    expect(validatePublishState({ ...baseFragrance, images: [] })).toMatchObject({
      valid: false,
      code: "INVALID_PUBLISH_STATE",
    })
    expect(validatePublishState({ ...baseFragrance, offerings: [] })).toMatchObject({
      valid: false,
      code: "INVALID_PUBLISH_STATE",
    })
  })

  it("allows publish when profile, images, and active offerings exist", () => {
    expect(validatePublishState(baseFragrance)).toEqual({ valid: true })
  })

  it("rejects bottle volumes outside allowed bounds", () => {
    expect(validateBottleVolume({ originalVolumeMl: 100, usableVolumeMl: 96, remainingVolumeMl: 96 })).toBe(true)
    expect(validateBottleVolume({ originalVolumeMl: 100, usableVolumeMl: 101, remainingVolumeMl: 96 })).toBe(false)
    expect(validateBottleVolume({ originalVolumeMl: 100, usableVolumeMl: 96, remainingVolumeMl: -1 })).toBe(false)
    expect(validateBottleVolume({ originalVolumeMl: 100, usableVolumeMl: 96, remainingVolumeMl: 97 })).toBe(false)
  })
})
