import { calculateDecantPrice, DEFAULT_DECANT_SIZES } from "@/lib/pricing"
import { slugify } from "@/lib/slug"
import type { Bottle, Brand, Fragrance, FragranceImage, FragranceView, InventoryEvent, Offering, Supplier } from "@/types/catalog"
import type { Customer, CustomerView } from "@/types/customers"
import type { FulfillmentChecklistItem, Order, OrderStatus } from "@/types/orders"
import type { PackagingItem } from "@/types/packaging"
import type { Settings } from "@/types/settings"
import type { AdminUser } from "@/types/users"

type CreateBrandInput = Pick<Brand, "name" | "description">
type CreateFragranceInput = Omit<Fragrance, "id" | "slug" | "status" | "isActive" | "images" | "offerings"> & {
  slug?: string
}
type CreateBottleInput = Omit<Bottle, "id" | "remainingVolumeMl" | "status" | "receivedAt">

const now = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const brands: Brand[] = [
  {
    id: "brand_dior",
    name: "Dior",
    slug: "dior",
    description: "French fragrance house with polished designer signatures.",
    isActive: true,
  },
]

const fragrances: Fragrance[] = [
  {
    id: "fragrance_sauvage",
    brandId: "brand_dior",
    name: "Sauvage Eau de Parfum",
    slug: "dior-sauvage-eau-de-parfum",
    description: "A crisp aromatic amber profile built for warm evenings and polished daily wear.",
    concentration: "Eau de Parfum",
    releaseYear: 2018,
    perfumer: "Francois Demachy",
    gender: "Masculine",
    status: "published",
    isActive: true,
    images: [
      {
        id: "image_sauvage_1",
        fragranceId: "fragrance_sauvage",
        storagePath: "demo/sauvage-1",
        publicUrl:
          "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
        position: 1,
      },
    ],
    notes: [
      { id: "note_bergamot", name: "Bergamot", category: "citrus", pyramidLevel: "top", position: 1 },
      { id: "note_lavender", name: "Lavender", category: "aromatic", pyramidLevel: "heart", position: 1 },
      { id: "note_amber", name: "Ambroxan", category: "amber", pyramidLevel: "base", position: 1 },
    ],
    offerings: [],
  },
]

const suppliers: Supplier[] = [
  {
    id: "supplier_default",
    name: "Initial supplier",
    phone: "",
    email: "",
    notes: "Local-first placeholder supplier.",
    isActive: true,
  },
]

const bottles: Bottle[] = [
  {
    id: "bottle_sauvage_1",
    fragranceId: "fragrance_sauvage",
    supplierId: "supplier_default",
    originalVolumeMl: 100,
    usableVolumeMl: 96,
    remainingVolumeMl: 96,
    purchasePrice: 2800,
    purchaseDate: new Date().toISOString().slice(0, 10),
    receivedAt: now(),
    status: "available",
    notes: "Seed bottle for vertical-slice validation.",
  },
]

const inventoryEvents: InventoryEvent[] = [
  {
    id: "event_sauvage_1",
    bottleId: "bottle_sauvage_1",
    type: "initial_stock",
    quantityMl: 96,
    balanceAfterMl: 96,
    reason: "Initial bottle entry",
    createdAt: now(),
  },
]

const settings: Settings = {
  wasteAllowancePercent: 4,
  lowVolumeThresholdMl: 15,
  orderPaymentExpiryHours: 24,
  firstOrderDiscountPercent: 10,
  deliveryFeeFlat: 0,
  targetGrossMarginPercent: 40,
  gstRatePercent: 8,
  priceRoundingIncrement: 5,
  packagingCost: 12,
  operationsBuffer: 5,
  gstEnabled: false,
}

const packagingItems: PackagingItem[] = [
  { id: "packaging_atomizer", name: "5ml atomizer", unit: "piece", unitCost: 8, quantity: 120, minimumQuantity: 30, isActive: true },
  { id: "packaging_box", name: "Gift box", unit: "piece", unitCost: 15, quantity: 40, minimumQuantity: 20, isActive: true },
  { id: "packaging_label", name: "Fragrance label", unit: "sheet", unitCost: 2, quantity: 18, minimumQuantity: 25, isActive: true },
]

const adminUsers: AdminUser[] = [
  { id: "local-owner", name: "Whiffs Owner", role: "Owner" },
  { id: "user_aminath", name: "Aminath Shifa", role: "Staff" },
]

const customers: Customer[] = [
  {
    id: "customer_aisha",
    name: "Aisha Rasheed",
    phone: "+960 771 2345",
    email: "aisha.rasheed@example.mv",
    notes: "Prefers Dior fragrances. Usually orders 5ml decants.",
    createdAt: now(),
  },
  {
    id: "customer_ibrahim",
    name: "Ibrahim Waheed",
    phone: "+960 991 8820",
    email: "ibrahim.waheed@example.mv",
    notes: "",
    createdAt: now(),
  },
]

const orders: Order[] = [
  {
    id: "order_1001",
    orderNumber: "WM-1001",
    customerId: "customer_aisha",
    customerName: "Aisha Rasheed",
    customerPhone: "+960 771 2345",
    status: "pending_payment",
    paymentStatus: "pending",
    items: [
      {
        id: "order_item_1001_1",
        fragranceId: "fragrance_sauvage",
        offeringId: "offering_5ml",
        fragranceName: "Sauvage Eau de Parfum",
        offeringName: "5ml",
        sizeMl: 5,
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320,
        fulfilledQuantity: 0,
      },
    ],
    subtotal: 320,
    deliveryFee: 35,
    total: 355,
    deliveryMethod: "Delivery",
    deliveryAddress: "Male' City, Maafannu",
    notes: "Awaiting bank transfer proof.",
    paymentProofUrl: "",
    fulfillmentChecklist: defaultChecklist(),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "order_1002",
    orderNumber: "WM-1002",
    customerId: "customer_ibrahim",
    customerName: "Ibrahim Waheed",
    customerPhone: "+960 991 8820",
    status: "preparing",
    paymentStatus: "paid",
    items: [
      {
        id: "order_item_1002_1",
        fragranceId: "fragrance_sauvage",
        offeringId: "offering_10ml",
        fragranceName: "Sauvage Eau de Parfum",
        offeringName: "10ml",
        sizeMl: 10,
        quantity: 2,
        unitPrice: 560,
        totalPrice: 1120,
        fulfilledQuantity: 0,
      },
    ],
    subtotal: 1120,
    deliveryFee: 0,
    total: 1120,
    deliveryMethod: "Pickup",
    deliveryAddress: "",
    notes: "",
    paymentProofUrl: "",
    fulfillmentChecklist: defaultChecklist(["collect"]),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "order_1003",
    orderNumber: "WM-1003",
    customerId: "customer_aisha",
    customerName: "Aisha Rasheed",
    customerPhone: "+960 771 2345",
    status: "ready",
    paymentStatus: "paid",
    items: [
      {
        id: "order_item_1003_1",
        fragranceId: "fragrance_sauvage",
        offeringId: "offering_2ml",
        fragranceName: "Sauvage Eau de Parfum",
        offeringName: "2ml",
        sizeMl: 2,
        quantity: 3,
        unitPrice: 150,
        totalPrice: 450,
        fulfilledQuantity: 3,
      },
    ],
    subtotal: 450,
    deliveryFee: 35,
    total: 485,
    deliveryMethod: "Delivery",
    deliveryAddress: "Male' City, Maafannu",
    notes: "Ready for dispatch.",
    paymentProofUrl: "",
    fulfillmentChecklist: defaultChecklist(["collect", "fill", "quality", "package"]),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "order_1004",
    orderNumber: "WM-1004",
    customerId: "customer_ibrahim",
    customerName: "Ibrahim Waheed",
    customerPhone: "+960 991 8820",
    status: "completed",
    paymentStatus: "paid",
    items: [
      {
        id: "order_item_1004_1",
        fragranceId: "fragrance_sauvage",
        offeringId: "offering_5ml",
        fragranceName: "Sauvage Eau de Parfum",
        offeringName: "5ml",
        sizeMl: 5,
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320,
        fulfilledQuantity: 1,
      },
    ],
    subtotal: 320,
    deliveryFee: 0,
    total: 320,
    deliveryMethod: "Pickup",
    deliveryAddress: "",
    notes: "",
    paymentProofUrl: "",
    fulfillmentChecklist: defaultChecklist(["collect", "fill", "quality", "package"]),
    createdAt: now(),
    updatedAt: now(),
  },
]

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

function toCustomerView(customer: Customer): CustomerView {
  const customerOrders = orders.filter((order) => order.customerId === customer.id)
  const lifetimeValue = customerOrders.reduce((sum, order) => sum + order.total, 0)

  return {
    ...customer,
    orderCount: customerOrders.length,
    lifetimeValue,
    averageOrderValue: customerOrders.length ? lifetimeValue / customerOrders.length : 0,
  }
}

function defaultChecklist(doneIds: string[] = []): FulfillmentChecklistItem[] {
  return [
    { id: "collect", label: "Collect atomizers and packaging materials" },
    { id: "fill", label: "Fill decants" },
    { id: "quality", label: "Quality check" },
    { id: "package", label: "Package order" },
  ].map((step) => ({ ...step, done: doneIds.includes(step.id) }))
}

function computeBottleStatus(remainingVolumeMl: number): Bottle["status"] {
  if (remainingVolumeMl <= 0) {
    return "empty"
  }

  if (remainingVolumeMl <= settings.lowVolumeThresholdMl) {
    return "low_volume"
  }

  return "available"
}

function seedOfferings() {
  const fragrance = fragrances[0]
  const bottle = bottles[0]

  fragrance.offerings = DEFAULT_DECANT_SIZES.map((sizeMl) => {
    const result = calculateDecantPrice({
      bottleCost: bottle.purchasePrice,
      usableVolumeMl: bottle.usableVolumeMl,
      decantSizeMl: sizeMl,
      packagingCost: settings.packagingCost,
      operationsBuffer: settings.operationsBuffer,
      grossMargin: settings.targetGrossMarginPercent / 100,
      gstRate: settings.gstEnabled ? settings.gstRatePercent / 100 : 0,
      roundingIncrement: settings.priceRoundingIncrement,
    })

    return {
      id: `offering_${sizeMl}ml`,
      fragranceId: fragrance.id,
      name: `${sizeMl}ml`,
      type: "decant",
      sizeMl,
      price: result.finalPrice,
      suggestedPrice: result.finalPrice,
      isActive: true,
    }
  })
}

seedOfferings()

function toView(fragrance: Fragrance): FragranceView {
  const brand = brands.find((item) => item.id === fragrance.brandId)

  if (!brand) {
    throw new Error("Brand not found.")
  }

  const sortedImages = [...fragrance.images].sort((a, b) => a.position - b.position)

  return {
    ...fragrance,
    brand,
    images: sortedImages,
    heroImage: sortedImages[0],
    bottles: bottles.filter((bottle) => bottle.fragranceId === fragrance.id),
  }
}

export const demoStore = {
  listBrands() {
    return brands
  },
  createBrand(input: CreateBrandInput) {
    const slug = slugify(input.name)

    if (brands.some((brand) => brand.slug === slug)) {
      return { error: "DUPLICATE_SLUG" as const }
    }

    const brand: Brand = {
      id: id("brand"),
      name: input.name,
      slug,
      description: input.description ?? "",
      isActive: true,
    }

    brands.unshift(brand)
    return { data: brand }
  },
  listFragrances({ publishedOnly = false } = {}) {
    return fragrances.filter((fragrance) => !publishedOnly || fragrance.status === "published").map(toView)
  },
  getFragrance(idOrSlug: string) {
    const fragrance = fragrances.find((item) => item.id === idOrSlug || item.slug === idOrSlug)
    return fragrance ? toView(fragrance) : null
  },
  createFragrance(input: CreateFragranceInput) {
    const baseSlug = input.slug || `${brands.find((brand) => brand.id === input.brandId)?.name ?? ""} ${input.name}`
    const slug = slugify(baseSlug)

    if (fragrances.some((fragrance) => fragrance.slug === slug)) {
      return { error: "DUPLICATE_SLUG" as const }
    }

    const fragrance: Fragrance = {
      id: id("fragrance"),
      brandId: input.brandId,
      name: input.name,
      slug,
      description: input.description,
      concentration: input.concentration,
      releaseYear: input.releaseYear,
      perfumer: input.perfumer,
      gender: input.gender,
      status: "draft",
      isActive: true,
      images: [],
      notes: input.notes,
      offerings: [],
    }

    fragrances.unshift(fragrance)
    return { data: toView(fragrance) }
  },
  updateFragrance(fragranceId: string, input: Partial<CreateFragranceInput>) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    Object.assign(fragrance, input)
    return toView(fragrance)
  },
  addImage(fragranceId: string, input: { publicUrl: string; storagePath?: string }) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    const image: FragranceImage = {
      id: id("image"),
      fragranceId,
      storagePath: input.storagePath ?? input.publicUrl,
      publicUrl: input.publicUrl,
      position: fragrance.images.length + 1,
    }

    fragrance.images.push(image)
    return image
  },
  reorderImages(fragranceId: string, imageIds: string[]) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    fragrance.images = imageIds
      .map((imageId, index) => {
        const image = fragrance.images.find((item) => item.id === imageId)
        return image ? { ...image, position: index + 1 } : null
      })
      .filter((image): image is FragranceImage => Boolean(image))

    return fragrance.images
  },
  deleteImage(fragranceId: string, imageId: string) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return false
    }

    fragrance.images = fragrance.images
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({ ...image, position: index + 1 }))
    return true
  },
  upsertOfferings(fragranceId: string, inputs: Array<Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">>) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    const uniqueSizes = new Set(inputs.map((input) => input.sizeMl))
    if (uniqueSizes.size !== inputs.length) {
      return { error: "DUPLICATE_OFFERING_SIZE" as const }
    }

    fragrance.offerings = inputs.map((input) => ({
      id: fragrance.offerings.find((offering) => offering.sizeMl === input.sizeMl)?.id ?? id("offering"),
      fragranceId,
      name: `${input.sizeMl}ml`,
      type: "decant",
      sizeMl: input.sizeMl,
      price: input.price,
      suggestedPrice: input.suggestedPrice,
      isActive: input.isActive,
    }))

    return { data: fragrance.offerings }
  },
  publishFragrance(fragranceId: string) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return { error: "NOT_FOUND" as const }
    }

    if (!fragrance.name || !fragrance.brandId || !fragrance.description) {
      return { error: "INSUFFICIENT_PUBLISH_DATA" as const }
    }

    if (!fragrance.images.length || !fragrance.offerings.some((offering) => offering.isActive)) {
      return { error: "INVALID_PUBLISH_STATE" as const }
    }

    fragrance.status = "published"
    return { data: toView(fragrance) }
  },
  archiveFragrance(fragranceId: string) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    fragrance.status = "archived"
    return toView(fragrance)
  },
  listSuppliers() {
    return suppliers
  },
  createSupplier(input: Omit<Supplier, "id" | "isActive">) {
    const supplier: Supplier = {
      id: id("supplier"),
      ...input,
      isActive: true,
    }
    suppliers.unshift(supplier)
    return supplier
  },
  listBottles() {
    return bottles
  },
  getBottle(bottleId: string) {
    return bottles.find((bottle) => bottle.id === bottleId) ?? null
  },
  createBottle(input: CreateBottleInput) {
    if (input.usableVolumeMl > input.originalVolumeMl || input.usableVolumeMl <= 0) {
      return { error: "VALIDATION_ERROR" as const }
    }

    const bottle: Bottle = {
      id: id("bottle"),
      ...input,
      remainingVolumeMl: input.usableVolumeMl,
      receivedAt: now(),
      status: "available",
    }

    bottles.unshift(bottle)
    inventoryEvents.unshift({
      id: id("event"),
      bottleId: bottle.id,
      type: "initial_stock",
      quantityMl: bottle.usableVolumeMl,
      balanceAfterMl: bottle.usableVolumeMl,
      reason: "Initial bottle entry",
      createdAt: now(),
    })

    return { data: bottle }
  },
  updateBottle(bottleId: string, input: CreateBottleInput) {
    const bottle = bottles.find((item) => item.id === bottleId)

    if (!bottle) {
      return null
    }

    if (input.usableVolumeMl > input.originalVolumeMl || input.usableVolumeMl <= 0) {
      return { error: "VALIDATION_ERROR" as const }
    }

    Object.assign(bottle, input)
    bottle.remainingVolumeMl = Math.min(bottle.remainingVolumeMl, bottle.usableVolumeMl)
    bottle.status = computeBottleStatus(bottle.remainingVolumeMl)

    return { data: bottle }
  },
  adjustBottle(bottleId: string, input: { quantityMl: number; reason: string }) {
    const bottle = bottles.find((item) => item.id === bottleId)

    if (!bottle) {
      return { error: "NOT_FOUND" as const }
    }

    const balanceAfterMl = Math.max(0, Math.min(bottle.usableVolumeMl, bottle.remainingVolumeMl + input.quantityMl))

    bottle.remainingVolumeMl = balanceAfterMl
    bottle.status = computeBottleStatus(balanceAfterMl)

    const event: InventoryEvent = {
      id: id("event"),
      bottleId,
      type: "adjustment",
      quantityMl: input.quantityMl,
      balanceAfterMl,
      reason: input.reason,
      createdAt: now(),
    }
    inventoryEvents.unshift(event)

    return { data: bottle }
  },
  archiveBottle(bottleId: string) {
    const bottle = bottles.find((item) => item.id === bottleId)

    if (!bottle) {
      return null
    }

    bottle.status = "archived"
    return bottle
  },
  listInventoryEvents(bottleId: string) {
    return inventoryEvents
      .filter((event) => event.bottleId === bottleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
  getSettings() {
    return settings
  },
  updateSettings(input: Partial<Settings>) {
    Object.assign(settings, input)
    return settings
  },
  listOrders() {
    return orders
  },
  getOrder(orderId: string) {
    return orders.find((order) => order.id === orderId) ?? null
  },
  updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    const order = orders.find((item) => item.id === orderId)

    if (!order) {
      return { error: "NOT_FOUND" as const }
    }

    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(nextStatus)) {
      return { error: "INVALID_STATUS_TRANSITION" as const }
    }

    order.status = nextStatus
    if (nextStatus === "payment_confirmed") {
      order.paymentStatus = "paid"
    }
    order.updatedAt = now()

    return { data: order }
  },
  setOrderPaymentProof(orderId: string, publicUrl: string) {
    const order = orders.find((item) => item.id === orderId)

    if (!order) {
      return null
    }

    order.paymentProofUrl = publicUrl
    order.updatedAt = now()
    return order
  },
  toggleOrderChecklistItem(orderId: string, checklistItemId: string) {
    const order = orders.find((item) => item.id === orderId)

    if (!order) {
      return null
    }

    const checklistItem = order.fulfillmentChecklist.find((item) => item.id === checklistItemId)

    if (!checklistItem) {
      return null
    }

    checklistItem.done = !checklistItem.done
    order.updatedAt = now()
    return order
  },
  recordPartialFulfillment(orderId: string, orderItemId: string, fulfilledQuantity: number) {
    const order = orders.find((item) => item.id === orderId)

    if (!order) {
      return { error: "NOT_FOUND" as const }
    }

    const orderItem = order.items.find((item) => item.id === orderItemId)

    if (!orderItem) {
      return { error: "NOT_FOUND" as const }
    }

    if (fulfilledQuantity < 0 || fulfilledQuantity > orderItem.quantity) {
      return { error: "VALIDATION_ERROR" as const }
    }

    orderItem.fulfilledQuantity = fulfilledQuantity
    orderItem.totalPrice = orderItem.unitPrice * fulfilledQuantity
    order.subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    order.total = order.subtotal + order.deliveryFee
    order.updatedAt = now()

    return { data: order }
  },
  listCustomers() {
    return customers.map(toCustomerView)
  },
  getCustomer(customerId: string) {
    const customer = customers.find((item) => item.id === customerId)
    if (!customer) {
      return null
    }

    return {
      ...toCustomerView(customer),
      orders: orders.filter((order) => order.customerId === customerId),
    }
  },
  listPackagingItems() {
    return packagingItems
  },
  createPackagingItem(input: Omit<PackagingItem, "id" | "isActive">) {
    const item: PackagingItem = {
      id: id("packaging"),
      ...input,
      isActive: true,
    }
    packagingItems.unshift(item)
    return item
  },
  updatePackagingItem(itemId: string, input: Partial<Omit<PackagingItem, "id">>) {
    const item = packagingItems.find((entry) => entry.id === itemId)

    if (!item) {
      return null
    }

    Object.assign(item, input)
    return item
  },
  listUsers() {
    return adminUsers
  },
  updateUserRole(userId: string, role: AdminUser["role"]) {
    const user = adminUsers.find((item) => item.id === userId)

    if (!user) {
      return null
    }

    user.role = role
    return user
  },
}
