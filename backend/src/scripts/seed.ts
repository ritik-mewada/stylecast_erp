/**
 * Demo data: a platform admin, the approved demo brand "Maison Ondine" with
 * its team, catalog, stock, shipping rules, ~60 orders over the last 30 days
 * and daily traffic, plus three other brands for the admin's review queue.
 * Mirrors the dashboard's mock data and its demo accounts.
 *
 *   npm run seed            # development (ts-node)
 *   npm run seed:prod       # compiled, e.g. once after the first deploy
 *   npm run seed -- --reset # wipe ALL data first (refused in production)
 *
 * Migrations must have run. Every demo account uses SEED_PASSWORD
 * (default "password"). Without --reset, the script stops if the demo brand
 * already exists, so it can't duplicate or clobber data.
 */
import "reflect-metadata";
import bcrypt from "bcrypt";
import { EntityManager } from "typeorm";
import { Config } from "../config";
import { AppDataSource } from "../data-source";
import { Brand, BrandApprovalStatus } from "../entity/Brand";
import { User } from "../entity/User";
import { Product, ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { Inventory } from "../entity/Inventory";
import { Order, OrderStatus, PaymentStatus } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";
import { ShippingRule } from "../entity/ShippingRule";
import { TrafficMetric } from "../entity/TrafficMetric";
import { UserRole } from "../utils";

const DEMO_SLUG = "maison-ondine";
const ORDER_COUNT = 60;
const DAYS = 30;

// Deterministic PRNG so every seed run produces the same data.
let state = 42;
const rand = () => {
  state = (state * 16807) % 2147483647;
  return (state - 1) / 2147483646;
};
const pick = <T>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const now = Date.now();
const daysAgo = (days: number, hours = 0) =>
  new Date(now - days * 86_400_000 - hours * 3_600_000);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const OTHER_BRANDS = [
  {
    name: "North Thread Co.",
    slug: "north-thread-co",
    companyInfo: "Technical outerwear for cold climates.",
    website: "https://norththread.example",
    shippingOrigin: "Calgary, AB",
    brandCategory: "Outerwear",
    contactEmail: "team@norththread.example",
    contactPhone: "+1 403 555 0199",
    approvalStatus: BrandApprovalStatus.PENDING,
    isActive: true,
    createdAt: daysAgo(2, 4),
    owner: ["Elliot", "Moss", "elliot@norththread.example"],
  },
  {
    name: "Kiln & Loom",
    slug: "kiln-and-loom",
    companyInfo: "Hand-dyed accessories and homewares.",
    website: "https://kilnloom.example",
    shippingOrigin: "Portland, OR",
    brandCategory: "Accessories",
    contactEmail: "studio@kilnloom.example",
    contactPhone: "+1 503 555 0110",
    approvalStatus: BrandApprovalStatus.PENDING,
    isActive: true,
    createdAt: daysAgo(0, 7),
    owner: ["Rosa", "Ibarra", "rosa@kilnloom.example"],
  },
  {
    name: "Velvet Static",
    slug: "velvet-static",
    companyInfo: "Streetwear drops.",
    website: "https://velvetstatic.example",
    shippingOrigin: "Toronto, ON",
    brandCategory: "Streetwear",
    contactEmail: "drops@velvetstatic.example",
    contactPhone: "+1 416 555 0177",
    approvalStatus: BrandApprovalStatus.REJECTED,
    isActive: false,
    createdAt: daysAgo(20),
    owner: ["Dev", "Okafor", "dev@velvetstatic.example"],
  },
] as const;

const TEAM = [
  ["Camille", "Roy", "camille@maisonondine.example", UserRole.BRAND_OWNER, 120],
  ["Jordan", "Mensah", "jordan@maisonondine.example", UserRole.BRAND_MANAGER, 90],
  ["Priya", "Nair", "priya@maisonondine.example", UserRole.OPERATIONS_MANAGER, 60],
  ["Theo", "Dubois", "theo@maisonondine.example", UserRole.OPERATIONS_MANAGER, 12],
] as const;

const CATALOG = [
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
];
const ARCHIVED_TITLE = "Pleated Trouser";
const ONE_SIZE_CATEGORIES = new Set(["Accessories"]);

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
] as const;

const SHIPPING_RULES = [
  { regionName: "Canada — Domestic", shippingFee: 9, freeShippingThreshold: 150, deliveryEstimate: "2–4 business days" },
  { regionName: "United States", shippingFee: 15, freeShippingThreshold: 200, deliveryEstimate: "4–7 business days" },
  { regionName: "Europe", shippingFee: 28, freeShippingThreshold: 300, deliveryEstimate: "7–12 business days" },
  { regionName: "Rest of world", shippingFee: 38, freeShippingThreshold: 400, deliveryEstimate: "10–18 business days" },
];

// Order and payment status by age, like a real shop: recent orders are still
// in progress, older ones are mostly delivered, some refunded or cancelled.
const statusesFor = (age: number): [OrderStatus, PaymentStatus] => {
  const roll = rand();
  if (age <= 1) {
    return [
      roll < 0.6 ? OrderStatus.PENDING : OrderStatus.CONFIRMED,
      roll < 0.15 ? PaymentStatus.PENDING : PaymentStatus.PAID,
    ];
  }
  if (age <= 5) {
    const status =
      roll < 0.15 ? OrderStatus.CONFIRMED
      : roll < 0.75 ? OrderStatus.SHIPPED
      : roll < 0.9 ? OrderStatus.DELIVERED
      : OrderStatus.CANCELLED;
    return [status, status === OrderStatus.CANCELLED ? PaymentStatus.FAILED : PaymentStatus.PAID];
  }
  const status =
    roll < 0.82 ? OrderStatus.DELIVERED
    : roll < 0.92 ? OrderStatus.REFUNDED
    : OrderStatus.CANCELLED;
  return [
    status,
    status === OrderStatus.REFUNDED ? PaymentStatus.REFUNDED
    : status === OrderStatus.CANCELLED ? PaymentStatus.FAILED
    : PaymentStatus.PAID,
  ];
};

const seed = async (m: EntityManager, passwordHash: string) => {
  // ── Platform admin (kept if it already exists, e.g. from create-admin)
  const adminEmail = "admin@stylecast.example";
  if (!(await m.exists(User, { where: { email: adminEmail } }))) {
    await m.save(
      m.create(User, {
        firstName: "Ava",
        lastName: "Laurent",
        email: adminEmail,
        password: passwordHash,
        role: UserRole.PLATFORM_ADMIN,
        brandId: null,
        createdAt: daysAgo(200),
      }),
    );
  }

  // ── Demo brand and team
  const brand = await m.save(
    m.create(Brand, {
      name: "Maison Ondine",
      slug: DEMO_SLUG,
      companyInfo: "Slow-fashion label making linen and wool essentials in small batches.",
      website: "https://maisonondine.example",
      shippingOrigin: "Montréal, QC",
      brandCategory: "Womenswear",
      contactEmail: "hello@maisonondine.example",
      contactPhone: "+1 514 555 0142",
      approvalStatus: BrandApprovalStatus.APPROVED,
      isActive: true,
      createdAt: daysAgo(120),
    }),
  );

  await m.save(
    TEAM.map(([firstName, lastName, email, role, age]) =>
      m.create(User, { firstName, lastName, email, role, password: passwordHash, brandId: brand.id, createdAt: daysAgo(age) }),
    ),
  );

  // ── Brands waiting for (or refused) approval, each with an owner
  for (const { owner, ...fields } of OTHER_BRANDS) {
    const other = await m.save(m.create(Brand, fields));
    const [firstName, lastName, email] = owner;
    await m.save(
      m.create(User, {
        firstName,
        lastName,
        email,
        role: UserRole.BRAND_OWNER,
        password: passwordHash,
        brandId: other.id,
        createdAt: fields.createdAt,
      }),
    );
  }

  // ── Catalog with stock
  const skus = new Set<string>();
  const products: { product: Product; variants: ProductVariant[] }[] = [];

  for (const [index, item] of CATALOG.entries()) {
    const createdAt = daysAgo(110 - index * 3);
    const product = await m.save(
      m.create(Product, {
        title: item.title,
        description: `Cut for an easy, lived-in fit in ${item.material.toLowerCase()}. Made in small batches.`,
        category: item.category,
        price: item.price,
        status: item.title === ARCHIVED_TITLE ? ProductStatus.ARCHIVED : ProductStatus.ACTIVE,
        brandId: brand.id,
        createdAt,
      }),
    );

    const oneSize = ONE_SIZE_CATEGORIES.has(item.category);
    const sizes = oneSize ? ["OS"] : ["XS", "S", "M", "L", "XL"];
    const code = item.title.split(" ").map((word) => word[0]).join("").toUpperCase();

    const variants: ProductVariant[] = [];
    for (const color of item.colors) {
      for (const size of sizes) {
        const sku = `MO-${code}-${color.slice(0, 3).toUpperCase()}-${size}`;
        if (skus.has(sku)) throw new Error(`Seed SKU collision: ${sku}`);
        skus.add(sku);

        const variant = await m.save(
          m.create(ProductVariant, {
            productId: product.id,
            sku,
            size,
            color,
            material: item.material,
            priceOverride: size === "XL" && rand() < 0.3 ? item.price + 10 : null,
            createdAt,
          }),
        );

        // Mostly healthy stock, with some low and some sold-out variants.
        const threshold = oneSize ? 8 : 5;
        const roll = rand();
        const quantity = roll < 0.04 ? 0 : roll < 0.11 ? int(1, threshold) : int(threshold + 1, 40);
        await m.save(m.create(Inventory, { variantId: variant.id, quantity, lowStockThreshold: threshold }));

        variants.push(variant);
      }
    }
    products.push({ product, variants });
  }

  // ── Orders over the last 30 days (weighted towards recent days)
  const active = products.filter(({ product }) => product.status === ProductStatus.ACTIVE);
  const ordersPerDay = new Map<string, number>();

  for (let i = 0; i < ORDER_COUNT; i++) {
    const age = Math.floor(Math.pow(rand(), 1.3) * DAYS);
    const createdAt = daysAgo(age, int(0, 23));
    const [customerName, city, province, country, postal] = pick(CUSTOMERS);
    const [orderStatus, paymentStatus] = statusesFor(age);

    const order = await m.save(
      m.create(Order, {
        brandId: brand.id,
        customerName,
        customerEmail: `${customerName.split(" ")[0].toLowerCase()}@mail.example`,
        shippingCountry: country,
        shippingCity: city,
        shippingPostalCode: postal,
        shippingStateOrProvince: province,
        orderStatus,
        paymentStatus,
        createdAt,
        updatedAt: createdAt,
      }),
    );

    // Distinct variants per order, one or two units each.
    const lines = new Map<string, OrderItem>();
    for (let n = int(1, 3); lines.size < n; ) {
      const { product, variants } = pick(active);
      const variant = pick(variants);
      if (lines.has(variant.id)) continue;
      lines.set(
        variant.id,
        m.create(OrderItem, {
          orderId: order.id,
          productId: product.id,
          variantId: variant.id,
          quantity: rand() < 0.8 ? 1 : 2,
          price: variant.priceOverride ?? product.price,
          createdAt,
        }),
      );
    }
    await m.save([...lines.values()]);

    const day = isoDate(createdAt);
    ordersPerDay.set(day, (ordersPerDay.get(day) ?? 0) + 1);
  }

  // ── Shipping rules and daily marketplace traffic
  await m.save(
    SHIPPING_RULES.map((rule, i) =>
      m.create(ShippingRule, { ...rule, brandId: brand.id, createdAt: daysAgo(100 - i) }),
    ),
  );

  await m.save(
    Array.from({ length: DAYS }, (_, i) => {
      const metricDate = isoDate(daysAgo(i));
      return m.create(TrafficMetric, {
        brandId: brand.id,
        metricDate,
        sessions: int(180, 420),
        ordersPlaced: ordersPerDay.get(metricDate) ?? 0,
      });
    }),
  );

  return { products: products.length, variants: skus.size };
};

const main = async () => {
  const reset = process.argv.includes("--reset");
  if (reset && Config.NODE_ENV === "production") {
    throw new Error("--reset is refused when NODE_ENV=production");
  }

  await AppDataSource.initialize();

  if (await AppDataSource.showMigrations()) {
    throw new Error("Run the migrations first (npm run migration:run)");
  }

  if (reset) {
    const tables = AppDataSource.entityMetadatas.map((meta) => `"${meta.tableName}"`).join(", ");
    await AppDataSource.query(`TRUNCATE TABLE ${tables} CASCADE`);
    console.log("🧹  Wiped all tables");
  } else if (await AppDataSource.getRepository(Brand).exists({ where: { slug: DEMO_SLUG } })) {
    console.log("ℹ️   Demo data is already there. Use --reset to wipe and re-seed.");
    return;
  }

  const password = process.env.SEED_PASSWORD || "password";
  const passwordHash = await bcrypt.hash(password, 10);
  const counts = await AppDataSource.transaction((m) => seed(m, passwordHash));

  console.log(
    `🌱  Seeded Maison Ondine: ${counts.products} products, ${counts.variants} variants, ` +
      `${ORDER_COUNT} orders, ${DAYS} days of traffic, plus 3 brands to review.`,
  );
  console.log(`    Sign in as camille@maisonondine.example (owner), jordan@… (manager),`);
  console.log(`    priya@… (operations) or admin@stylecast.example (admin), password "${password}".`);
};

main()
  .catch((err) => {
    console.error("❌ ", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => AppDataSource.isInitialized && AppDataSource.destroy());
