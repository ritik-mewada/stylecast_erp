import type {
  Brand,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductVariant,
  ShippingRule,
  User,
} from "@/types/models"

// Deterministic PRNG so the mock data is identical on every reload.
let seed = 42
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const pick = <T>(items: readonly T[]) => items[Math.floor(rand() * items.length)]
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

let counter = 0
export const uid = () => {
  counter += 1
  const hex = (counter * 2654435761).toString(16).padStart(8, "0").slice(-8)
  return `${hex}-${(counter + 4096).toString(16)}-4abc-9def-${hex}${hex.slice(0, 4)}`
}

const now = Date.now()
const daysAgo = (days: number, hours = 0) => new Date(now - days * 86400000 - hours * 3600000).toISOString()

export const DEMO_BRAND_ID = uid()

export const seedBrands = (): Brand[] => [
  {
    id: DEMO_BRAND_ID,
    name: "Maison Ondine",
    slug: "maison-ondine",
    companyInfo: "Slow-fashion label making linen and wool essentials in small batches.",
    website: "https://maisonondine.example",
    shippingOrigin: "Montréal, QC",
    brandCategory: "Womenswear",
    contactEmail: "hello@maisonondine.example",
    contactPhone: "+1 514 555 0142",
    approvalStatus: "approved",
    isActive: true,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(3),
  },
  {
    id: uid(),
    name: "North Thread Co.",
    slug: "north-thread-co",
    companyInfo: "Technical outerwear for cold climates.",
    website: "https://norththread.example",
    shippingOrigin: "Calgary, AB",
    brandCategory: "Outerwear",
    contactEmail: "team@norththread.example",
    contactPhone: "+1 403 555 0199",
    approvalStatus: "pending",
    isActive: true,
    createdAt: daysAgo(2, 4),
    updatedAt: daysAgo(2, 4),
  },
  {
    id: uid(),
    name: "Kiln & Loom",
    slug: "kiln-and-loom",
    companyInfo: "Hand-dyed accessories and homewares.",
    website: "https://kilnloom.example",
    shippingOrigin: "Portland, OR",
    brandCategory: "Accessories",
    contactEmail: "studio@kilnloom.example",
    contactPhone: "+1 503 555 0110",
    approvalStatus: "pending",
    isActive: true,
    createdAt: daysAgo(0, 7),
    updatedAt: daysAgo(0, 7),
  },
  {
    id: uid(),
    name: "Velvet Static",
    slug: "velvet-static",
    companyInfo: "Streetwear drops.",
    website: "https://velvetstatic.example",
    shippingOrigin: "Toronto, ON",
    brandCategory: "Streetwear",
    contactEmail: "drops@velvetstatic.example",
    contactPhone: "+1 416 555 0177",
    approvalStatus: "rejected",
    isActive: false,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
  },
]

export const seedUsers = (): User[] => [
  {
    id: uid(),
    firstName: "Ava",
    lastName: "Laurent",
    email: "admin@stylecast.example",
    role: "platform_admin",
    brandId: null,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(200),
  },
  {
    id: uid(),
    firstName: "Camille",
    lastName: "Roy",
    email: "camille@maisonondine.example",
    role: "brand_owner",
    brandId: DEMO_BRAND_ID,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(120),
  },
  {
    id: uid(),
    firstName: "Jordan",
    lastName: "Mensah",
    email: "jordan@maisonondine.example",
    role: "brand_manager",
    brandId: DEMO_BRAND_ID,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: uid(),
    firstName: "Priya",
    lastName: "Nair",
    email: "priya@maisonondine.example",
    role: "operations_manager",
    brandId: DEMO_BRAND_ID,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
  },
  {
    id: uid(),
    firstName: "Theo",
    lastName: "Dubois",
    email: "theo@maisonondine.example",
    role: "operations_manager",
    brandId: DEMO_BRAND_ID,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
]

const CATALOG: { title: string; category: string; price: number; colors: string[]; material: string }[] = [
  { title: "Linen Wrap Dress", category: "Dresses", price: 168, colors: ["Sand", "Black"], material: "Linen" },
  { title: "Bias Slip Dress", category: "Dresses", price: 145, colors: ["Ivory", "Rust"], material: "Silk" },
  { title: "Tiered Midi Dress", category: "Dresses", price: 182, colors: ["Sage"], material: "Cotton" },
  { title: "Shirred Sundress", category: "Dresses", price: 128, colors: ["Blush", "Cream"], material: "Cotton" },
  { title: "Boxy Poplin Shirt", category: "Tops", price: 92, colors: ["Ivory", "Navy"], material: "Cotton" },
  { title: "Ribbed Tank", category: "Tops", price: 38, colors: ["Black", "Cream", "Olive"], material: "Cotton" },
  { title: "Silk Camisole", category: "Tops", price: 84, colors: ["Blush", "Black"], material: "Silk" },
  { title: "Relaxed Linen Shirt", category: "Tops", price: 98, colors: ["Sand"], material: "Linen" },
  { title: "Wool Wrap Coat", category: "Outerwear", price: 395, colors: ["Camel", "Charcoal"], material: "Wool" },
  { title: "Quilted Liner Jacket", category: "Outerwear", price: 210, colors: ["Olive"], material: "Nylon" },
  { title: "Cropped Trench", category: "Outerwear", price: 265, colors: ["Sand"], material: "Cotton" },
  { title: "Straight Leg Jean", category: "Denim", price: 135, colors: ["Indigo", "Black"], material: "Denim" },
  { title: "Wide Leg Jean", category: "Denim", price: 142, colors: ["Indigo"], material: "Denim" },
  { title: "Denim Chore Jacket", category: "Denim", price: 158, colors: ["Indigo"], material: "Denim" },
  { title: "Merino Crewneck", category: "Knitwear", price: 118, colors: ["Cream", "Navy", "Rust"], material: "Merino" },
  { title: "Cashmere Cardigan", category: "Knitwear", price: 245, colors: ["Camel"], material: "Cashmere" },
  { title: "Chunky Fisherman Knit", category: "Knitwear", price: 176, colors: ["Ivory"], material: "Wool" },
  { title: "Fine Gauge Polo", category: "Knitwear", price: 104, colors: ["Black", "Sage"], material: "Merino" },
  { title: "Leather Tote", category: "Accessories", price: 220, colors: ["Camel", "Black"], material: "Leather" },
  { title: "Silk Scarf", category: "Accessories", price: 65, colors: ["Rust", "Navy"], material: "Silk" },
  { title: "Wool Beanie", category: "Accessories", price: 42, colors: ["Charcoal", "Olive"], material: "Wool" },
  { title: "Woven Belt", category: "Accessories", price: 58, colors: ["Camel"], material: "Leather" },
  { title: "Pleated Trouser", category: "Tops", price: 138, colors: ["Black"], material: "Wool" },
  { title: "Linen Lounge Set", category: "Dresses", price: 190, colors: ["Sage"], material: "Linen" },
]

const ONE_SIZE = new Set(["Accessories"])

export const seedProducts = (): Product[] =>
  CATALOG.map((item, index) => {
    const productId = uid()
    const createdAt = daysAgo(110 - index * 3)
    const sizes = ONE_SIZE.has(item.category) ? ["OS"] : ["XS", "S", "M", "L", "XL"]
    const code = item.title
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
    const variants: ProductVariant[] = item.colors.flatMap((color) =>
      sizes.map((size) => {
        const variantId = uid()
        const threshold = ONE_SIZE.has(item.category) ? 8 : 5
        const roll = rand()
        const quantity = roll < 0.04 ? 0 : roll < 0.11 ? int(1, threshold) : int(threshold + 1, 40)
        return {
          id: variantId,
          productId,
          sku: `MO-${code}-${color.slice(0, 3).toUpperCase()}-${size}`,
          size,
          color,
          material: item.material,
          priceOverride: size === "XL" && rand() < 0.3 ? item.price + 10 : null,
          inventory: {
            id: uid(),
            variantId,
            quantity,
            lowStockThreshold: threshold,
            createdAt,
            updatedAt: daysAgo(int(0, 10)),
          },
          createdAt,
          updatedAt: createdAt,
        }
      }),
    )
    return {
      id: productId,
      title: item.title,
      description: `Cut for an easy, lived-in fit in ${item.material.toLowerCase()}. Made in small batches.`,
      category: item.category,
      price: item.price,
      status: index === 22 ? "archived" : "active",
      brandId: DEMO_BRAND_ID,
      variants,
      images: [],
      createdAt,
      updatedAt: daysAgo(int(0, 30)),
    }
  })

const CUSTOMERS = [
  ["Emma Tremblay", "Montréal", "QC", "Canada", "H2T 1S6"],
  ["Liam Chen", "Vancouver", "BC", "Canada", "V6B 2W9"],
  ["Sofia Rossi", "Toronto", "ON", "Canada", "M5V 3L9"],
  ["Noah Williams", "New York", "NY", "United States", "10012"],
  ["Olivia Martin", "Austin", "TX", "United States", "78701"],
  ["Lucas Silva", "Chicago", "IL", "United States", "60607"],
  ["Mia Kowalski", "Ottawa", "ON", "Canada", "K1P 5G4"],
  ["Ethan Brown", "Seattle", "WA", "United States", "98101"],
  ["Chloé Gagnon", "Québec", "QC", "Canada", "G1R 4P5"],
  ["Aria Patel", "San Francisco", "CA", "United States", "94110"],
  ["Mateo García", "Miami", "FL", "United States", "33131"],
  ["Hannah Lee", "Calgary", "AB", "Canada", "T2P 1J9"],
] as const

export const seedOrders = (products: Product[]): Order[] => {
  const active = products.filter((p) => p.status === "active")
  const orders: Order[] = []
  for (let i = 0; i < 84; i++) {
    const age = Math.floor(Math.pow(rand(), 1.3) * 30)
    const createdAt = daysAgo(age, int(0, 23))
    const [name, city, province, country, postal] = pick(CUSTOMERS)
    const orderId = uid()
    const items: OrderItem[] = Array.from({ length: int(1, 3) }, () => {
      const product = pick(active)
      const variant = pick(product.variants)
      return {
        id: uid(),
        orderId,
        productId: product.id,
        variantId: variant.id,
        quantity: rand() < 0.8 ? 1 : 2,
        price: variant.priceOverride ?? product.price,
        product: { id: product.id, title: product.title },
        variant: { id: variant.id, sku: variant.sku, size: variant.size, color: variant.color },
        createdAt,
      }
    })

    let orderStatus: OrderStatus
    let paymentStatus: PaymentStatus
    const roll = rand()
    if (age <= 1) {
      orderStatus = roll < 0.6 ? "pending" : "confirmed"
      paymentStatus = roll < 0.15 ? "pending" : "paid"
    } else if (age <= 5) {
      orderStatus = roll < 0.15 ? "confirmed" : roll < 0.75 ? "shipped" : roll < 0.9 ? "delivered" : "cancelled"
      paymentStatus = orderStatus === "cancelled" ? "failed" : "paid"
    } else {
      orderStatus = roll < 0.82 ? "delivered" : roll < 0.92 ? "refunded" : "cancelled"
      paymentStatus = orderStatus === "refunded" ? "refunded" : orderStatus === "cancelled" ? "failed" : "paid"
    }

    orders.push({
      id: orderId,
      brandId: DEMO_BRAND_ID,
      customerName: name,
      customerEmail: `${name.split(" ")[0].toLowerCase()}@mail.example`,
      shippingCountry: country,
      shippingCity: city,
      shippingPostalCode: postal,
      shippingStateOrProvince: province,
      paymentStatus,
      orderStatus,
      items,
      createdAt,
      updatedAt: createdAt,
    })
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const seedShippingRules = (): ShippingRule[] =>
  [
    { region: "Canada — Domestic", fee: 9, free: 150, eta: "2–4 business days" },
    { region: "United States", fee: 15, free: 200, eta: "4–7 business days" },
    { region: "Europe", fee: 28, free: 300, eta: "7–12 business days" },
    { region: "Rest of world", fee: 38, free: 400, eta: "10–18 business days" },
  ].map((r, i) => ({
    id: uid(),
    brandId: DEMO_BRAND_ID,
    regionName: r.region,
    shippingFee: r.fee,
    freeShippingThreshold: r.free,
    deliveryEstimate: r.eta,
    createdAt: daysAgo(100 - i),
    updatedAt: daysAgo(100 - i),
  }))

// Sessions per day for the conversion-rate mock (traffic_metrics table).
export const seedSessions = (days: number) => Array.from({ length: days }, () => int(180, 420))
