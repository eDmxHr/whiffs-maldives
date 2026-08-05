import type { Bottle, FragranceView } from "@/types/catalog"
import type { Order } from "@/types/orders"

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function salesByDay(orders: Order[], days: number) {
  const dayList = Array.from({ length: days }, (_, index) => {
    const date = startOfDay(new Date())
    date.setDate(date.getDate() - (days - 1 - index))
    return date
  })

  return dayList.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)
    const revenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .filter((order) => {
        const createdAt = new Date(order.createdAt)
        return createdAt >= day && createdAt < nextDay
      })
      .reduce((sum, order) => sum + order.total, 0)

    return { label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue }
  })
}

export interface BestSellerRow {
  name: string
  revenue: number
  quantity: number
}

export function bestSellers(orders: Order[]): BestSellerRow[] {
  const rows = new Map<string, BestSellerRow>()

  for (const order of orders) {
    if (order.paymentStatus !== "paid") {
      continue
    }

    for (const item of order.items) {
      const key = `${item.fragranceId}-${item.offeringName}`
      const existing = rows.get(key) ?? { name: `${item.fragranceName} · ${item.offeringName}`, revenue: 0, quantity: 0 }
      existing.revenue += item.totalPrice
      existing.quantity += item.quantity
      rows.set(key, existing)
    }
  }

  return Array.from(rows.values())
}

export interface BottleProfitabilityRow {
  bottleId: string
  fragranceName: string
  costPerMl: number
  avgRevenuePerMl: number
  grossMarginPerMl: number
  remainingVolumeMl: number
  estimatedRemainingProfit: number
}

export function bottleProfitability(bottles: Bottle[], fragrances: FragranceView[]): BottleProfitabilityRow[] {
  return bottles
    .filter((bottle) => bottle.status !== "archived")
    .map((bottle) => {
      const fragrance = fragrances.find((item) => item.id === bottle.fragranceId)
      const costPerMl = bottle.usableVolumeMl > 0 ? bottle.purchasePrice / bottle.usableVolumeMl : 0
      const activeOfferings = fragrance?.offerings.filter((offering) => offering.isActive) ?? []
      const avgRevenuePerMl = activeOfferings.length
        ? activeOfferings.reduce((sum, offering) => sum + offering.price / offering.sizeMl, 0) / activeOfferings.length
        : 0
      const grossMarginPerMl = avgRevenuePerMl - costPerMl

      return {
        bottleId: bottle.id,
        fragranceName: fragrance?.name ?? "Unknown fragrance",
        costPerMl,
        avgRevenuePerMl,
        grossMarginPerMl,
        remainingVolumeMl: bottle.remainingVolumeMl,
        estimatedRemainingProfit: grossMarginPerMl * bottle.remainingVolumeMl,
      }
    })
}
