/**
 * OpenAPI 3.0 description of the API, served as Swagger UI at /api-docs and
 * as JSON at /api-docs.json (the dashboard generates its types from it).
 *
 * Paths are relative to the /api/v1 server, except the system endpoints,
 * which override `servers` because they live at the root.
 */
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const jsonBody = (schemaName: string) => ({
  required: true,
  content: { "application/json": { schema: ref(schemaName) } },
});

const ok = (description: string, schema: object) => ({
  description,
  content: { "application/json": { schema } },
});

const arrayOf = (name: string) => ({ type: "array", items: ref(name) });

const paginatedOf = (name: string) => ({
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: arrayOf(name),
    pagination: ref("PaginationMeta"),
  },
});

const withMessage = (key: string, name: string) => ({
  type: "object",
  required: ["message", key],
  properties: { message: { type: "string" }, [key]: ref(name) },
});

const uuidParam = (name = "id") => ({
  in: "path",
  name,
  required: true,
  schema: { type: "string", format: "uuid" },
});

const query = (name: string, schema: object, description?: string) => ({
  in: "query",
  name,
  schema,
  ...(description && { description }),
});

const pageParams = [
  query("page", { type: "integer", minimum: 1, default: 1 }),
  query("limit", { type: "integer", minimum: 1, maximum: 100, default: 20 }),
];

const rangeParam = query(
  "range",
  { type: "string", enum: ["daily", "weekly", "monthly", "all_time"] },
  "Time window: the last day, 7 days or month. Omit (or all_time) for all time.",
);

// Shared error responses by status code.
const errors = (...codes: number[]) =>
  Object.fromEntries(
    codes.map((code) => [String(code), { $ref: `#/components/responses/E${code}` }]),
  );

const errorResponse = (description: string, example: string) => ({
  description,
  content: {
    "application/json": {
      schema: ref("ErrorResponse"),
      example: { status: "error", message: example },
    },
  },
});

const timestamps = {
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const nullableString = { type: "string", nullable: true };

const BRAND_ROLES = ["brand_owner", "brand_manager", "operations_manager"];
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

// ─── Document ─────────────────────────────────────────────────────────────────

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "StyleCast Brand Admin ERP API",
    version: "2.0.0",
    description: [
      "REST API for StyleCast ERP: brands manage products, stock, orders, shipping and analytics; a platform admin approves brands.",
      "",
      "## Authentication",
      "Protected routes need a JWT from `POST /auth/login` as `Authorization: Bearer <token>`.",
      "Click **Authorize** (🔒) and paste a token, or log in through `POST /auth/login` here and the token is filled in for you.",
      "It's kept across page reloads; **Logout** in the Authorize dialog clears it.",
      "",
      "## Roles",
      "| Role | Can |",
      "|---|---|",
      "| `platform_admin` | Review and approve brands. Has no brand and can't call brand endpoints. Created with `npm run create-admin`. |",
      "| `brand_owner` | Everything in their brand, including inviting users and deleting shipping rules. |",
      "| `brand_manager` | Catalog, stock, shipping, brand profile, traffic, team list, new orders. Can't change order status or refund. |",
      "| `operations_manager` | Read the catalog; create and fulfil orders. |",
      "",
      "Every brand endpoint is scoped to the caller's brand: another brand's ids return 404.",
      "",
      "## Errors",
      "Errors look like `{ \"status\": \"error\", \"message\": \"…\" }`, sometimes with a `details` object (e.g. per-SKU stock shortages on a 409).",
      "",
      "## Pagination",
      "List endpoints take `page` and `limit` (max 100) and return `{ data, pagination: { page, limit, total, totalPages } }`.",
      "Numeric query values (`page`, `limit`, `days`) outside their range are clamped to it, and non-numbers fall back to the default; neither is an error.",
      "",
      "## Rate limits",
      "`POST /auth/login`: 10 failed attempts per IP per 15 minutes. `POST /auth/forgot-password`: 5 per IP per 15 minutes. " +
        "`POST /auth/register`: 10 per IP per hour. Over the limit: 429.",
    ].join("\n"),
  },
  servers: [{ url: "/api/v1", description: "This server" }],
  tags: [
    { name: "System", description: "Liveness and health" },
    { name: "Auth", description: "Register, sign in, reset a password" },
    { name: "Users", description: "Your account and your brand's team" },
    { name: "Brands", description: "Brand profile, and brand review for the platform admin" },
    { name: "Products", description: "Catalog: products, variants, images" },
    { name: "Inventory", description: "Stock per variant" },
    { name: "Orders", description: "Order creation, fulfilment and refunds" },
    { name: "Shipping", description: "Shipping rules by region" },
    { name: "Analytics", description: "Dashboard figures and traffic data" },
    { name: "Uploads", description: "Product images" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT from POST /auth/login",
      },
    },
    schemas: {
      // ─── Shared ───────────────────────────────────────────────────────────
      ErrorResponse: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: { type: "string", enum: ["error"] },
          message: { type: "string", example: "Human-readable description" },
          details: { type: "object", additionalProperties: true },
        },
      },
      MessageResponse: {
        type: "object",
        required: ["message"],
        properties: { message: { type: "string" } },
      },
      PaginationMeta: {
        type: "object",
        required: ["page", "limit", "total", "totalPages"],
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 142 },
          totalPages: { type: "integer", example: 8 },
        },
      },
      UserRole: { type: "string", enum: ["platform_admin", ...BRAND_ROLES] },
      BrandRole: { type: "string", enum: BRAND_ROLES },
      BrandApprovalStatus: { type: "string", enum: ["pending", "approved", "rejected"] },
      ProductStatus: { type: "string", enum: ["active", "archived"] },
      OrderStatus: { type: "string", enum: ORDER_STATUSES },
      PaymentStatus: { type: "string", enum: PAYMENT_STATUSES },

      // ─── Entities ─────────────────────────────────────────────────────────
      Brand: {
        type: "object",
        required: ["id", "name", "slug", "approvalStatus", "isActive", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Maison Ondine" },
          slug: { type: "string", example: "maison-ondine" },
          companyInfo: nullableString,
          website: nullableString,
          shippingOrigin: nullableString,
          brandCategory: nullableString,
          contactEmail: nullableString,
          contactPhone: nullableString,
          approvalStatus: ref("BrandApprovalStatus"),
          isActive: { type: "boolean", description: "false while the brand is rejected" },
          ...timestamps,
        },
      },
      User: {
        type: "object",
        required: ["id", "firstName", "lastName", "email", "role", "brandId", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string", example: "Camille" },
          lastName: { type: "string", example: "Roy" },
          email: { type: "string", format: "email", example: "camille@maisonondine.example" },
          role: ref("UserRole"),
          brandId: { type: "string", format: "uuid", nullable: true, description: "null for platform admins" },
          ...timestamps,
        },
      },
      AuthUser: {
        type: "object",
        required: ["id", "firstName", "lastName", "email", "role", "brandId"],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          role: ref("UserRole"),
          brandId: { type: "string", format: "uuid", nullable: true },
        },
      },
      Session: {
        type: "object",
        required: ["user", "brand"],
        properties: {
          user: ref("User"),
          brand: { type: "object", allOf: [ref("Brand")], nullable: true, description: "null for platform admins" },
        },
      },
      Inventory: {
        type: "object",
        required: ["id", "variantId", "quantity", "lowStockThreshold", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          variantId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 0, example: 12 },
          lowStockThreshold: { type: "integer", minimum: 0, example: 5 },
          ...timestamps,
        },
      },
      VariantBase: {
        type: "object",
        required: ["id", "productId", "sku", "priceOverride", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          sku: { type: "string", example: "MO-LWD-SAN-M" },
          size: nullableString,
          color: nullableString,
          material: nullableString,
          priceOverride: { type: "number", nullable: true, description: "null = uses the product price" },
          ...timestamps,
        },
      },
      ProductVariant: {
        allOf: [
          ref("VariantBase"),
          {
            type: "object",
            required: ["inventory"],
            properties: { inventory: { type: "object", allOf: [ref("Inventory")], nullable: true } },
          },
        ],
      },
      ProductImage: {
        type: "object",
        required: ["id", "productId", "imageUrl", "sortOrder", "createdAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          imageUrl: { type: "string", format: "uri" },
          altText: nullableString,
          sortOrder: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ProductBase: {
        type: "object",
        required: ["id", "title", "category", "price", "status", "brandId", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Linen Wrap Dress" },
          description: nullableString,
          category: { type: "string", example: "Dresses" },
          price: { type: "number", example: 168 },
          status: ref("ProductStatus"),
          brandId: { type: "string", format: "uuid" },
          ...timestamps,
        },
      },
      Product: {
        allOf: [
          ref("ProductBase"),
          {
            type: "object",
            required: ["variants", "images"],
            properties: {
              variants: arrayOf("ProductVariant"),
              images: arrayOf("ProductImage"),
            },
          },
        ],
      },
      OrderItem: {
        type: "object",
        required: ["id", "orderId", "productId", "variantId", "quantity", "price", "createdAt", "product", "variant"],
        properties: {
          id: { type: "string", format: "uuid" },
          orderId: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          variantId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 1 },
          price: { type: "number", description: "Unit price when the order was placed" },
          createdAt: { type: "string", format: "date-time" },
          product: ref("ProductBase"),
          variant: ref("VariantBase"),
        },
      },
      Order: {
        type: "object",
        required: [
          "id", "brandId", "customerName", "customerEmail", "shippingCountry", "shippingCity",
          "shippingPostalCode", "paymentStatus", "orderStatus", "createdAt", "updatedAt", "items",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          brandId: { type: "string", format: "uuid" },
          customerName: { type: "string", example: "Emma Tremblay" },
          customerEmail: { type: "string", format: "email" },
          shippingCountry: { type: "string", example: "Canada" },
          shippingCity: { type: "string", example: "Montréal" },
          shippingPostalCode: { type: "string", example: "H2T 1S6" },
          shippingAddressLine1: nullableString,
          shippingAddressLine2: nullableString,
          shippingStateOrProvince: nullableString,
          paymentStatus: ref("PaymentStatus"),
          orderStatus: ref("OrderStatus"),
          ...timestamps,
          items: arrayOf("OrderItem"),
        },
      },
      ShippingRule: {
        type: "object",
        required: ["id", "brandId", "regionName", "shippingFee", "freeShippingThreshold", "deliveryEstimate", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          brandId: { type: "string", format: "uuid" },
          regionName: { type: "string", example: "Canada — Domestic" },
          shippingFee: { type: "number", example: 9 },
          freeShippingThreshold: { type: "number", nullable: true, example: 150 },
          deliveryEstimate: { type: "string", example: "2–4 business days" },
          ...timestamps,
        },
      },
      TrafficMetric: {
        type: "object",
        required: ["id", "brandId", "metricDate", "sessions", "ordersPlaced", "createdAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          brandId: { type: "string", format: "uuid" },
          metricDate: { type: "string", format: "date" },
          sessions: { type: "integer" },
          ordersPlaced: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ─── Composite responses ──────────────────────────────────────────────
      RegisterResponse: {
        type: "object",
        required: ["message", "brand", "user", "token"],
        properties: {
          message: { type: "string" },
          brand: ref("Brand"),
          user: ref("AuthUser"),
          token: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["message", "user", "token"],
        properties: {
          message: { type: "string", example: "Login successful" },
          user: ref("AuthUser"),
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },
      PlatformStats: {
        type: "object",
        required: ["brands", "pending", "approved", "rejected", "users"],
        properties: {
          brands: { type: "integer" },
          pending: { type: "integer" },
          approved: { type: "integer" },
          rejected: { type: "integer" },
          users: { type: "integer", description: "Brand users (admins not counted)" },
        },
      },
      InventoryRow: {
        type: "object",
        required: ["variantId", "sku", "productId", "productTitle", "category", "quantity", "lowStockThreshold", "updatedAt"],
        properties: {
          variantId: { type: "string", format: "uuid" },
          sku: { type: "string" },
          size: nullableString,
          color: nullableString,
          material: nullableString,
          productId: { type: "string", format: "uuid" },
          productTitle: { type: "string" },
          category: { type: "string" },
          quantity: { type: "integer" },
          lowStockThreshold: { type: "integer" },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      InventoryList: {
        allOf: [
          paginatedOf("InventoryRow"),
          {
            type: "object",
            required: ["summary"],
            properties: {
              summary: {
                type: "object",
                description: "Counts over all active variants, ignoring status and search filters",
                required: ["variants", "units", "low", "out"],
                properties: {
                  variants: { type: "integer" },
                  units: { type: "integer", description: "Total units in stock" },
                  low: { type: "integer", description: "In stock but at or below the threshold" },
                  out: { type: "integer", description: "Quantity 0" },
                },
              },
            },
          },
        ],
      },
      LowStockItem: {
        allOf: [
          ref("Inventory"),
          {
            type: "object",
            required: ["variant"],
            properties: {
              variant: {
                allOf: [
                  ref("VariantBase"),
                  { type: "object", required: ["product"], properties: { product: ref("ProductBase") } },
                ],
              },
            },
          },
        ],
      },
      AnalyticsOverview: {
        type: "object",
        required: ["range", "totalOrders", "totalProducts", "totalActiveProducts", "totalSales"],
        properties: {
          range: { type: "string", example: "monthly" },
          totalOrders: { type: "integer" },
          totalProducts: { type: "integer" },
          totalActiveProducts: { type: "integer" },
          totalSales: { type: "number", description: "Excludes cancelled and refunded orders" },
        },
      },
      TopProduct: {
        type: "object",
        required: ["productId", "title", "unitsSold", "revenue"],
        properties: {
          productId: { type: "string", format: "uuid" },
          title: { type: "string" },
          unitsSold: { type: "integer" },
          revenue: { type: "number" },
        },
      },
      OrderStatusCount: {
        type: "object",
        required: ["status", "count"],
        properties: { status: ref("OrderStatus"), count: { type: "integer" } },
      },
      InventoryTurnover: {
        type: "object",
        required: ["range", "unitsSold", "currentInventoryUnits", "turnoverRate", "note"],
        properties: {
          range: { type: "string" },
          unitsSold: { type: "integer" },
          currentInventoryUnits: { type: "integer" },
          turnoverRate: { type: "number" },
          note: { type: "string" },
        },
      },
      ConversionRate: {
        type: "object",
        required: ["range", "sessions", "ordersPlaced", "conversionRate", "unit", "note"],
        properties: {
          range: { type: "string" },
          sessions: { type: "integer" },
          ordersPlaced: { type: "integer" },
          conversionRate: { type: "number", example: 2.4 },
          unit: { type: "string", enum: ["%"] },
          note: { type: "string" },
        },
      },
      LowStockSummary: {
        type: "object",
        required: ["count", "items"],
        properties: { count: { type: "integer" }, items: arrayOf("LowStockItem") },
      },
      SalesPoint: {
        type: "object",
        required: ["date", "revenue", "orders"],
        properties: {
          date: { type: "string", format: "date", example: "2026-10-21" },
          revenue: { type: "number" },
          orders: { type: "integer" },
        },
      },
      UploadResponse: {
        type: "object",
        required: ["id", "url", "contentType", "size"],
        properties: {
          id: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri", description: "Use as a product imageUrl or <img src>" },
          contentType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
          size: { type: "integer", description: "Bytes" },
        },
      },

      // ─── Requests ─────────────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        description: "Creates a brand (pending approval) and its brand_owner account.",
        required: ["brandName", "brandSlug", "firstName", "lastName", "email", "password"],
        properties: {
          brandName: { type: "string", example: "Maison Ondine", description: "Unique across brands, ignoring case" },
          brandSlug: {
            type: "string",
            pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            minLength: 2,
            maxLength: 60,
            example: "maison-ondine",
            description: "Trimmed and lowercased, then lowercase letters, numbers and single hyphens",
          },
          companyInfo: { type: "string" },
          website: { type: "string" },
          shippingOrigin: { type: "string" },
          brandCategory: { type: "string" },
          contactEmail: { type: "string", format: "email" },
          contactPhone: { type: "string" },
          firstName: { type: "string", example: "Camille" },
          lastName: { type: "string", example: "Roy" },
          email: { type: "string", format: "email", example: "camille@maisonondine.example" },
          password: { type: "string", minLength: 8, example: "password" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "camille@maisonondine.example" },
          password: { type: "string", example: "password" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: { email: { type: "string", format: "email" } },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "newPassword"],
        properties: {
          token: { type: "string", description: "From the reset link" },
          newPassword: { type: "string", minLength: 8 },
        },
      },
      UpdateMeRequest: {
        type: "object",
        description: "All fields optional.",
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 8 },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "password", "role"],
        properties: {
          firstName: { type: "string", example: "Jordan" },
          lastName: { type: "string", example: "Mensah" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          role: ref("BrandRole"),
        },
      },
      UpdateBrandRequest: {
        type: "object",
        description: "All fields optional. Approval status and the active flag can't be changed here.",
        properties: {
          name: { type: "string", minLength: 1, description: "Unique across brands, ignoring case" },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", minLength: 2, maxLength: 60 },
          companyInfo: { type: "string" },
          website: { type: "string" },
          shippingOrigin: { type: "string" },
          brandCategory: { type: "string" },
          contactEmail: { type: "string", format: "email" },
          contactPhone: { type: "string" },
        },
      },
      UpdateApprovalRequest: {
        type: "object",
        required: ["approvalStatus"],
        properties: { approvalStatus: ref("BrandApprovalStatus") },
      },
      CreateVariantRequest: {
        type: "object",
        required: ["sku"],
        properties: {
          sku: { type: "string", example: "MO-LWD-SAN-M" },
          size: { type: "string", example: "M" },
          color: { type: "string", example: "Sand" },
          material: { type: "string", example: "Linen" },
          priceOverride: { type: "number", nullable: true, exclusiveMinimum: true, minimum: 0, description: "null or omitted = product price" },
        },
      },
      UpdateVariantRequest: {
        allOf: [
          ref("CreateVariantRequest"),
          {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid", description: "Existing variant to update; omit to add a new variant" },
            },
          },
        ],
      },
      CreateImageRequest: {
        type: "object",
        required: ["imageUrl"],
        properties: {
          imageUrl: { type: "string", format: "uri", description: "http(s) URL, e.g. from POST /uploads" },
          altText: { type: "string" },
          sortOrder: { type: "integer", minimum: 0, description: "Defaults to the position in the list" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["title", "price", "category"],
        properties: {
          title: { type: "string", example: "Linen Wrap Dress" },
          description: { type: "string" },
          price: { type: "number", exclusiveMinimum: true, minimum: 0, example: 168 },
          category: { type: "string", example: "Dresses" },
          status: ref("ProductStatus"),
          variants: arrayOf("CreateVariantRequest"),
          images: arrayOf("CreateImageRequest"),
        },
      },
      UpdateProductRequest: {
        type: "object",
        description: "All fields optional.",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "number", exclusiveMinimum: true, minimum: 0 },
          category: { type: "string" },
          status: ref("ProductStatus"),
          variants: {
            type: "array",
            items: ref("UpdateVariantRequest"),
            description:
              "The full variant list: entries with an id update that variant, entries without one are added, " +
              "and variants left out are removed (409 if a removed variant has orders).",
          },
          images: {
            type: "array",
            items: ref("CreateImageRequest"),
            description: "Replaces all images, in this order.",
          },
        },
      },
      UpdateInventoryRequest: {
        type: "object",
        description: "Both fields optional.",
        properties: {
          quantity: { type: "integer", minimum: 0, example: 40 },
          lowStockThreshold: { type: "integer", minimum: 0, example: 5 },
        },
      },
      CreateOrderItemRequest: {
        type: "object",
        required: ["variantId", "quantity"],
        properties: {
          variantId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 1, maximum: 1000 },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["customerName", "customerEmail", "shippingCountry", "shippingCity", "shippingPostalCode", "items"],
        properties: {
          customerName: { type: "string", example: "Emma Tremblay" },
          customerEmail: { type: "string", format: "email", example: "emma@mail.example" },
          shippingCountry: { type: "string", example: "Canada" },
          shippingCity: { type: "string", example: "Montréal" },
          shippingPostalCode: { type: "string", example: "H2T 1S6" },
          shippingAddressLine1: { type: "string" },
          shippingAddressLine2: { type: "string" },
          shippingStateOrProvince: { type: "string", example: "QC" },
          items: {
            type: "array",
            minItems: 1,
            maxItems: 50,
            items: ref("CreateOrderItemRequest"),
            description: "Repeated variants are merged.",
          },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["orderStatus"],
        properties: { orderStatus: ref("OrderStatus") },
      },
      CreateShippingRuleRequest: {
        type: "object",
        required: ["regionName", "shippingFee", "deliveryEstimate"],
        properties: {
          regionName: { type: "string", example: "United States" },
          shippingFee: { type: "number", minimum: 0, example: 15, description: "0 for free shipping to this region" },
          freeShippingThreshold: {
            type: "number",
            nullable: true,
            exclusiveMinimum: true,
            minimum: 0,
            example: 200,
            description: "Order total that ships free. null or omitted = no threshold",
          },
          deliveryEstimate: { type: "string", example: "4–7 business days" },
        },
      },
      UpdateShippingRuleRequest: {
        type: "object",
        description: "All fields optional.",
        properties: {
          regionName: { type: "string" },
          shippingFee: { type: "number", minimum: 0 },
          freeShippingThreshold: {
            type: "number",
            nullable: true,
            exclusiveMinimum: true,
            minimum: 0,
            description: "null removes the threshold",
          },
          deliveryEstimate: { type: "string" },
        },
      },
      RecordTrafficRequest: {
        type: "object",
        required: ["metricDate", "sessions", "ordersPlaced"],
        properties: {
          metricDate: { type: "string", format: "date", example: "2026-10-20" },
          sessions: { type: "integer", minimum: 0, example: 320 },
          ordersPlaced: { type: "integer", minimum: 0, example: 6 },
        },
      },
    },

    // ─── Reusable error responses ───────────────────────────────────────────
    responses: {
      E400: errorResponse("Invalid request (body, query or id)", "email must be a valid email address"),
      E401: errorResponse("Missing, invalid or expired token", "Authorization token required"),
      E403: errorResponse("Your role (or account type) can't do this", "Forbidden: insufficient permissions"),
      E404: errorResponse("Not found (or belongs to another brand)", "Resource not found"),
      E409: errorResponse("Conflicts with existing data", "A user with this email already exists"),
      E413: errorResponse("File too large", "Images can be at most 5 MB"),
      E415: errorResponse("Unsupported file type", "Upload a JPG, PNG, WebP or AVIF image"),
      E422: errorResponse("Not allowed in the current state", "Invalid status transition: pending → delivered"),
      E429: errorResponse("Rate limited", "Too many failed sign-in attempts. Try again in 15 minutes."),
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    // ─── System ─────────────────────────────────────────────────────────────
    "/": {
      servers: [{ url: "/" }],
      get: {
        tags: ["System"],
        operationId: "getRoot",
        summary: "Liveness",
        security: [],
        responses: {
          "200": ok("The process is running", {
            type: "object",
            properties: { status: { type: "string" }, message: { type: "string" } },
          }),
        },
      },
    },
    "/health": {
      servers: [{ url: "/" }],
      get: {
        tags: ["System"],
        operationId: "getHealth",
        summary: "Health check (includes the database)",
        security: [],
        responses: {
          "200": ok("Healthy", {
            type: "object",
            properties: {
              status: { type: "string", enum: ["ok"] },
              database: { type: "string", enum: ["up"] },
              uptime: { type: "integer", description: "Seconds" },
            },
          }),
          "503": ok("The database can't be reached", {
            type: "object",
            properties: {
              status: { type: "string", enum: ["error"] },
              database: { type: "string", enum: ["down"] },
            },
          }),
        },
      },
    },

    // ─── Auth ───────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        operationId: "register",
        summary: "Register a brand and its owner",
        description: "The brand starts as `pending` and can't take orders until a platform admin approves it.",
        security: [],
        requestBody: jsonBody("RegisterRequest"),
        responses: {
          "201": ok("Registered", ref("RegisterResponse")),
          ...errors(400, 409, 429),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        operationId: "login",
        summary: "Sign in",
        security: [],
        requestBody: jsonBody("LoginRequest"),
        responses: {
          "200": ok("Signed in", ref("LoginResponse")),
          ...errors(400, 401, 429),
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        operationId: "requestPasswordReset",
        summary: "Email a password reset link",
        description:
          "Always answers 200 with the same message, whether or not the email has an account. " +
          "The link (`APP_URL/reset-password?token=…`) works once and expires after an hour.",
        security: [],
        requestBody: jsonBody("ForgotPasswordRequest"),
        responses: {
          "200": ok("Accepted", ref("MessageResponse")),
          ...errors(400, 429),
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        operationId: "resetPassword",
        summary: "Set a new password with a reset token",
        security: [],
        requestBody: jsonBody("ResetPasswordRequest"),
        responses: {
          "200": ok("Password updated", ref("MessageResponse")),
          ...errors(400),
        },
      },
    },

    // ─── Users ──────────────────────────────────────────────────────────────
    "/users/me": {
      get: {
        tags: ["Users"],
        operationId: "getMe",
        summary: "The signed-in user and their brand",
        description: "Any role. `brand` is null for platform admins.",
        responses: {
          "200": ok("Session", ref("Session")),
          ...errors(401, 404),
        },
      },
      put: {
        tags: ["Users"],
        operationId: "updateMe",
        summary: "Update your name or email",
        description: "Any role.",
        requestBody: jsonBody("UpdateMeRequest"),
        responses: {
          "200": ok("Updated session", ref("Session")),
          ...errors(400, 401, 404, 409),
        },
      },
    },
    "/users/me/password": {
      put: {
        tags: ["Users"],
        operationId: "changePassword",
        summary: "Change your password",
        description: "Any role. A wrong current password is a 400 (the session stays valid).",
        requestBody: jsonBody("ChangePasswordRequest"),
        responses: {
          "200": ok("Password updated", ref("MessageResponse")),
          ...errors(400, 401, 404),
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        operationId: "listUsers",
        summary: "List your brand's team",
        description: "Roles: `brand_owner`, `brand_manager`.",
        responses: {
          "200": ok("Team members, newest first", arrayOf("User")),
          ...errors(401, 403),
        },
      },
      post: {
        tags: ["Users"],
        operationId: "createUser",
        summary: "Add a team member",
        description: "Roles: `brand_owner`. The role must be a brand role.",
        requestBody: jsonBody("CreateUserRequest"),
        responses: {
          "201": ok("Created", ref("User")),
          ...errors(400, 401, 403, 409),
        },
      },
    },

    // ─── Brands ─────────────────────────────────────────────────────────────
    "/brands": {
      get: {
        tags: ["Brands"],
        operationId: "listBrands",
        summary: "List brands (platform admin)",
        description: "Roles: `platform_admin`. Newest first.",
        parameters: [
          query("status", ref("BrandApprovalStatus"), "Only brands with this approval status"),
          ...pageParams,
        ],
        responses: {
          "200": ok("Brands", paginatedOf("Brand")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/brands/stats": {
      get: {
        tags: ["Brands"],
        operationId: "getPlatformStats",
        summary: "Platform counts (platform admin)",
        description: "Roles: `platform_admin`.",
        responses: {
          "200": ok("Counts", ref("PlatformStats")),
          ...errors(401, 403),
        },
      },
    },
    "/brands/me": {
      get: {
        tags: ["Brands"],
        operationId: "getMyBrand",
        summary: "Your brand",
        description: "Brand roles.",
        responses: {
          "200": ok("Brand", ref("Brand")),
          ...errors(401, 403, 404),
        },
      },
    },
    "/brands/profile": {
      put: {
        tags: ["Brands"],
        operationId: "updateMyBrand",
        summary: "Update your brand's profile",
        description: "Roles: `brand_owner`, `brand_manager`.",
        requestBody: jsonBody("UpdateBrandRequest"),
        responses: {
          "200": ok("Updated", withMessage("brand", "Brand")),
          ...errors(400, 401, 403, 404, 409),
        },
      },
    },
    "/brands/{id}/approval": {
      patch: {
        tags: ["Brands"],
        operationId: "setBrandApproval",
        summary: "Approve or reject a brand (platform admin)",
        description:
          "Roles: `platform_admin`. Only approved brands can take orders. Rejecting marks the brand inactive; " +
          "it keeps its data and can still sign in. Approving again reactivates it.",
        parameters: [uuidParam()],
        requestBody: jsonBody("UpdateApprovalRequest"),
        responses: {
          "200": ok("Updated", withMessage("brand", "Brand")),
          ...errors(400, 401, 403, 404),
        },
      },
    },

    // ─── Products ───────────────────────────────────────────────────────────
    "/products": {
      get: {
        tags: ["Products"],
        operationId: "listProducts",
        summary: "List products",
        description: "Brand roles. Newest first, with variants (and their stock) and images.",
        parameters: [
          ...pageParams,
          query("category", { type: "string" }),
          query("status", ref("ProductStatus")),
          query("search", { type: "string" }, "Title or any variant's SKU (case-insensitive, contains)"),
        ],
        responses: {
          "200": ok("Products", paginatedOf("Product")),
          ...errors(400, 401, 403),
        },
      },
      post: {
        tags: ["Products"],
        operationId: "createProduct",
        summary: "Create a product",
        description: "Roles: `brand_owner`, `brand_manager`. Each variant starts with 0 in stock.",
        requestBody: jsonBody("CreateProductRequest"),
        responses: {
          "201": ok("Created", ref("Product")),
          ...errors(400, 401, 403, 409),
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        operationId: "getProduct",
        summary: "Get a product",
        description: "Brand roles.",
        parameters: [uuidParam()],
        responses: {
          "200": ok("Product", ref("Product")),
          ...errors(400, 401, 403, 404),
        },
      },
      put: {
        tags: ["Products"],
        operationId: "updateProduct",
        summary: "Update a product, its variants and images",
        description: "Roles: `brand_owner`, `brand_manager`.",
        parameters: [uuidParam()],
        requestBody: jsonBody("UpdateProductRequest"),
        responses: {
          "200": ok("Updated", ref("Product")),
          ...errors(400, 401, 403, 404, 409),
        },
      },
      delete: {
        tags: ["Products"],
        operationId: "archiveProduct",
        summary: "Archive a product",
        description: "Roles: `brand_owner`, `brand_manager`. Sets status to `archived`; nothing is deleted.",
        parameters: [uuidParam()],
        responses: {
          "200": ok("Archived", ref("MessageResponse")),
          ...errors(400, 401, 403, 404),
        },
      },
    },

    // ─── Inventory ──────────────────────────────────────────────────────────
    "/inventory": {
      get: {
        tags: ["Inventory"],
        operationId: "listInventory",
        summary: "Stock per variant (active products)",
        description: "Brand roles. Sorted by product title, or by quantity when `status` is set.",
        parameters: [
          query("page", { type: "integer", minimum: 1, default: 1 }),
          query("limit", { type: "integer", minimum: 1, maximum: 100, default: 50 }),
          query("status", { type: "string", enum: ["low", "out"] }, "`low`: at or below the threshold (includes 0). `out`: 0."),
          query("search", { type: "string" }, "Product title or SKU"),
        ],
        responses: {
          "200": ok("Rows and summary", ref("InventoryList")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/inventory/variant/{variantId}": {
      get: {
        tags: ["Inventory"],
        operationId: "getVariantInventory",
        summary: "Stock for one variant",
        description: "Brand roles.",
        parameters: [uuidParam("variantId")],
        responses: {
          "200": ok("Inventory", ref("Inventory")),
          ...errors(400, 401, 403, 404),
        },
      },
      put: {
        tags: ["Inventory"],
        operationId: "updateVariantInventory",
        summary: "Set stock for one variant",
        description: "Roles: `brand_owner`, `brand_manager`. Sets absolute values.",
        parameters: [uuidParam("variantId")],
        requestBody: jsonBody("UpdateInventoryRequest"),
        responses: {
          "200": ok("Inventory", ref("Inventory")),
          ...errors(400, 401, 403, 404),
        },
      },
    },
    "/inventory/low-stock": {
      get: {
        tags: ["Inventory"],
        operationId: "listLowStock",
        summary: "Variants at or below their threshold",
        description: "Brand roles. Active products only, lowest stock first.",
        responses: {
          "200": ok("Low-stock items", arrayOf("LowStockItem")),
          ...errors(401, 403),
        },
      },
    },

    // ─── Orders ─────────────────────────────────────────────────────────────
    "/orders": {
      get: {
        tags: ["Orders"],
        operationId: "listOrders",
        summary: "List orders",
        description: "Brand roles. Newest first, with items.",
        parameters: [
          ...pageParams,
          query("status", ref("OrderStatus")),
          query("paymentStatus", ref("PaymentStatus")),
          query("search", { type: "string" }, "Customer name or email (contains), or the start of the order id (a leading # is ignored)"),
        ],
        responses: {
          "200": ok("Orders", paginatedOf("Order")),
          ...errors(400, 401, 403),
        },
      },
      post: {
        tags: ["Orders"],
        operationId: "createOrder",
        summary: "Create an order and take its stock",
        description: [
          "Brand roles. The brand must be approved (403 otherwise).",
          "",
          "Stock is checked and taken in one transaction with row locks, so concurrent orders can't oversell.",
          "Each item stores the price at order time (the variant's override, else the product price).",
          "",
          "- 404: unknown variants (or another brand's), listed in `details.variantIds`",
          "- 409: not enough stock; `details.items` lists `{ sku, requested, available }`",
          "- 422: a product is archived",
        ].join("\n"),
        requestBody: jsonBody("CreateOrderRequest"),
        responses: {
          "201": ok("Created", ref("Order")),
          ...errors(400, 401, 403, 404, 409, 422),
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        operationId: "getOrder",
        summary: "Get an order",
        description: "Brand roles.",
        parameters: [uuidParam()],
        responses: {
          "200": ok("Order", ref("Order")),
          ...errors(400, 401, 403, 404),
        },
      },
    },
    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        operationId: "updateOrderStatus",
        summary: "Move an order to its next status",
        description: [
          "Roles: `brand_owner`, `operations_manager`. Cancelling puts the stock back.",
          "",
          "| From | To |",
          "|---|---|",
          "| `pending` | `confirmed`, `cancelled` |",
          "| `confirmed` | `shipped`, `cancelled` |",
          "| `shipped` | `delivered` |",
          "| `delivered`, `cancelled`, `refunded` | *(final)* |",
          "",
          "Refunds use `PATCH /orders/{id}/refund`.",
        ].join("\n"),
        parameters: [uuidParam()],
        requestBody: jsonBody("UpdateOrderStatusRequest"),
        responses: {
          "200": ok("Updated", withMessage("order", "Order")),
          ...errors(400, 401, 403, 404, 422),
        },
      },
    },
    "/orders/{id}/refund": {
      patch: {
        tags: ["Orders"],
        operationId: "refundOrder",
        summary: "Refund an order",
        description:
          "Roles: `brand_owner`, `operations_manager`. Sets order and payment status to `refunded` and puts the stock back, " +
          "unless the order was cancelled first (cancelling already did).",
        parameters: [uuidParam()],
        responses: {
          "200": ok("Refunded", withMessage("order", "Order")),
          ...errors(400, 401, 403, 404, 409),
        },
      },
    },

    // ─── Shipping ───────────────────────────────────────────────────────────
    "/shipping": {
      get: {
        tags: ["Shipping"],
        operationId: "listShippingRules",
        summary: "List shipping rules",
        description: "Brand roles.",
        responses: {
          "200": ok("Rules, newest first", arrayOf("ShippingRule")),
          ...errors(401, 403),
        },
      },
      post: {
        tags: ["Shipping"],
        operationId: "createShippingRule",
        summary: "Create a shipping rule",
        description: "Roles: `brand_owner`, `brand_manager`.",
        requestBody: jsonBody("CreateShippingRuleRequest"),
        responses: {
          "201": ok("Created", ref("ShippingRule")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/shipping/{id}": {
      put: {
        tags: ["Shipping"],
        operationId: "updateShippingRule",
        summary: "Update a shipping rule",
        description: "Roles: `brand_owner`, `brand_manager`.",
        parameters: [uuidParam()],
        requestBody: jsonBody("UpdateShippingRuleRequest"),
        responses: {
          "200": ok("Updated", ref("ShippingRule")),
          ...errors(400, 401, 403, 404),
        },
      },
      delete: {
        tags: ["Shipping"],
        operationId: "deleteShippingRule",
        summary: "Delete a shipping rule",
        description: "Roles: `brand_owner`.",
        parameters: [uuidParam()],
        responses: {
          "200": ok("Deleted", ref("MessageResponse")),
          ...errors(400, 401, 403, 404),
        },
      },
    },

    // ─── Analytics ──────────────────────────────────────────────────────────
    "/analytics/overview": {
      get: {
        tags: ["Analytics"],
        operationId: "getOverview",
        summary: "Orders, products and sales",
        description: "Brand roles. Sales exclude cancelled and refunded orders.",
        parameters: [rangeParam],
        responses: {
          "200": ok("Overview", ref("AnalyticsOverview")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/analytics/top-products": {
      get: {
        tags: ["Analytics"],
        operationId: "getTopProducts",
        summary: "Best sellers by units",
        description: "Brand roles. Cancelled and refunded orders don't count.",
        parameters: [query("limit", { type: "integer", minimum: 1, maximum: 20, default: 5 }), rangeParam],
        responses: {
          "200": ok("Top products", arrayOf("TopProduct")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/analytics/low-stock": {
      get: {
        tags: ["Analytics"],
        operationId: "getLowStockSummary",
        summary: "Low-stock count and items",
        description: "Brand roles. Active products only.",
        responses: {
          "200": ok("Summary", ref("LowStockSummary")),
          ...errors(401, 403),
        },
      },
    },
    "/analytics/order-status": {
      get: {
        tags: ["Analytics"],
        operationId: "getOrderStatusSummary",
        summary: "Order counts by status",
        description: "Brand roles. Statuses with no orders are left out.",
        parameters: [rangeParam],
        responses: {
          "200": ok("Counts", arrayOf("OrderStatusCount")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/analytics/inventory-turnover": {
      get: {
        tags: ["Analytics"],
        operationId: "getInventoryTurnover",
        summary: "Inventory turnover",
        description: "Brand roles. Units sold in the range divided by units in stock now.",
        parameters: [rangeParam],
        responses: {
          "200": ok("Turnover", ref("InventoryTurnover")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/analytics/conversion-rate": {
      get: {
        tags: ["Analytics"],
        operationId: "getConversionRate",
        summary: "Conversion rate from traffic data",
        description: "Brand roles. Orders placed ÷ sessions, from the figures recorded with `POST /analytics/traffic`.",
        parameters: [rangeParam],
        responses: {
          "200": ok("Conversion rate", ref("ConversionRate")),
          ...errors(400, 401, 403),
        },
      },
    },
    "/analytics/sales-series": {
      get: {
        tags: ["Analytics"],
        operationId: "getSalesSeries",
        summary: "Daily revenue and orders",
        description: "Brand roles. One point per day, oldest first, today included; days without sales are 0.",
        parameters: [query("days", { type: "integer", minimum: 1, maximum: 365, default: 30 })],
        responses: {
          "200": ok("Series", arrayOf("SalesPoint")),
          ...errors(401, 403),
        },
      },
    },
    "/analytics/traffic": {
      post: {
        tags: ["Analytics"],
        operationId: "recordTraffic",
        summary: "Record a day of marketplace traffic",
        description: "Roles: `brand_owner`, `brand_manager`. Replaces any figures already recorded for that day.",
        requestBody: jsonBody("RecordTrafficRequest"),
        responses: {
          "200": ok("Saved", ref("TrafficMetric")),
          ...errors(400, 401, 403),
        },
      },
    },

    // ─── Uploads ────────────────────────────────────────────────────────────
    "/uploads": {
      post: {
        tags: ["Uploads"],
        operationId: "uploadImage",
        summary: "Upload a product image",
        description:
          "Roles: `brand_owner`, `brand_manager`. JPEG, PNG, WebP or AVIF up to 5 MB, detected from the file's " +
          "contents. Use the returned `url` as a product `imageUrl`.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: { file: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          "201": ok("Stored", ref("UploadResponse")),
          ...errors(400, 401, 403, 413, 415),
        },
      },
    },
    "/uploads/{id}": {
      get: {
        tags: ["Uploads"],
        operationId: "getUpload",
        summary: "Get an uploaded image",
        description: "Public, cacheable forever.",
        security: [],
        parameters: [uuidParam()],
        responses: {
          "200": {
            description: "The image",
            content: {
              "image/*": { schema: { type: "string", format: "binary" } },
            },
          },
          ...errors(400, 404),
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  // Raw spec, for client type generation (openapi-typescript).
  app.get("/api-docs.json", (_req, res) => {
    res.json(swaggerDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        // Put the token from POST /auth/login into the Authorize dialog (and
        // persist it, as the dialog does), so a pasted token or Logout still
        // take effect. Runs in the browser, so it can't use anything from
        // this module.
        responseInterceptor: (response: { url?: string; text: string }) => {
          try {
            if (response.url && response.url.includes("/auth/login")) {
              const data = JSON.parse(response.text);
              if (data?.token) {
                const { ui } = window as unknown as {
                  ui: {
                    specSelectors: { specJson: () => { getIn: (path: string[]) => unknown } };
                    authActions: { authorizeWithPersistOption: (auth: object) => void };
                  };
                };
                const schema = ui.specSelectors.specJson().getIn(["components", "securitySchemes", "bearerAuth"]);
                ui.authActions.authorizeWithPersistOption({
                  bearerAuth: { name: "bearerAuth", schema, value: data.token },
                });
              }
            }
          } catch (error) {
            console.error("Swagger login response parse error:", error);
          }
          return response;
        },
      },
    }),
  );
};
