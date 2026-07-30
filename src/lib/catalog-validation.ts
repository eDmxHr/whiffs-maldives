import type { Bottle, Fragrance } from "@/types/catalog"

export function validatePublishState(fragrance: Fragrance) {
  if (!fragrance.name || !fragrance.brandId || !fragrance.description) {
    return {
      valid: false,
      code: "INSUFFICIENT_PUBLISH_DATA" as const,
      message: "Complete the fragrance profile before publishing.",
    }
  }

  if (!fragrance.images.length || !fragrance.offerings.some((offering) => offering.isActive)) {
    return {
      valid: false,
      code: "INVALID_PUBLISH_STATE" as const,
      message: "Add at least one image and one active offering before publishing.",
    }
  }

  return { valid: true as const }
}

export function validateBottleVolume(input: Pick<Bottle, "originalVolumeMl" | "usableVolumeMl" | "remainingVolumeMl">) {
  if (input.originalVolumeMl <= 0 || input.usableVolumeMl <= 0) {
    return false
  }

  if (input.remainingVolumeMl < 0) {
    return false
  }

  if (input.usableVolumeMl > input.originalVolumeMl) {
    return false
  }

  return input.remainingVolumeMl <= input.usableVolumeMl
}
