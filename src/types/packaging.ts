export interface PackagingItem {
  id: string
  name: string
  unit: string
  unitCost: number
  quantity: number
  minimumQuantity: number
  isActive: boolean
  /** ml of the decant size this item is specific to (e.g. the 2ml atomizer), or null if it's shared across every size (box, ribbon, label). */
  decantSizeMl: number | null
}
