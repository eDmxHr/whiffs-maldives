import type { Bottle } from "@/types/catalog"

export function earliestAvailableBottle(bottles: Bottle[], fragranceId?: string) {
  return bottles
    .filter(
      (bottle) =>
        (bottle.status === "available" || bottle.status === "low_volume") &&
        (!fragranceId || bottle.fragranceId === fragranceId)
    )
    .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime())[0]
}
