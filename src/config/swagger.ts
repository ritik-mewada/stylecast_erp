import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "StyleCast Brand Admin ERP API",
    version: "1.1.0",
    description: [
      "Interactive API documentation for the StyleCast Brand Admin ERP backend.",
      "",
      "## Base URL",
      "All routes are versioned under `/api/v1`.",
      "",
      "## Authentication",
      "Protected routes require a JWT bearer token obtained from `POST /api/v1/auth/login`.",
      "Click **Authorize** (🔒) above and paste your token.",
      "",
      "## Error Responses",
      "All errors return a consistent JSON structure:",
      "```json",
      '{ "status": "error", "message": "Human-readable description" }',
      "```",
    ].join("\n"),
  },
  servers: [
    {
      url: "http://localhost:8080/api/v1",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "System", description: "System and health endpoints" },
    { name: "Auth", description: "Authentication — register & login" },
    { name: "Brands", description: "Brand onboarding and profile management" },
    { name: "Users", description: "Brand team user management" },
    { name: "Products", description: "Product catalog management" },
    { name: "Inventory", description: "Stock level management" },
    { name: "Orders", description: "Order management and fulfilment" },
    { name: "Shipping", description: "Shipping rule configuration" },
    { name: "Analytics", description: "Brand analytics dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT obtained from POST /auth/login",
      },
    },
    schemas: {
      // ─── Shared ──────────────────────────────────────────────────────────
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Human-readable description" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: {
            type: "string",
            example: "email must be a valid email address; password must be at least 8 characters",
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 142 },
          totalPages: { type: "integer", example: 8 },
        },
      },

      // ─── Auth ─────────────────────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: [
          "brandName",
          "brandSlug",
          "firstName",
          "lastName",
          "email",
          "password",
        ],
        properties: {
          brandName: { type: "string", example: "StyleCast Demo Brand" },
          brandSlug: { type: "string", example: "stylecast-demo-brand" },
          companyInfo: { type: "string", example: "Premium fashion and beauty label" },
          website: { type: "string", example: "https://stylecast-demo.com" },
          shippingOrigin: { type: "string", example: "Toronto, Canada" },
          brandCategory: { type: "string", example: "Fashion" },
          contactEmail: { type: "string", example: "contact@stylecast-demo.com" },
          contactPhone: { type: "string", example: "+1-647-555-1234" },
          firstName: { type: "string", example: "Ritik" },
          lastName: { type: "string", example: "Mewada" },
          email: { type: "string", example: "ritik@example.com" },
          password: {
            type: "string",
            minLength: 8,
            example: "Password123",
            description: "Minimum 8 characters",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "ritik@example.com" },
          password: { type: "string", example: "Password123" },
        },
      },
      AuthUserPayload: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "d290f1ee-6c54-4b01-90e6-d701748f0851" },
          firstName: { type: "string", example: "Ritik" },
          lastName: { type: "string", example: "Mewada" },
          email: { type: "string", example: "ritik@example.com" },
          role: {
            type: "string",
            enum: ["brand_owner", "brand_manager", "operations_manager"],
            example: "brand_owner",
          },
          brandId: { type: "string", format: "uuid" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          user: { $ref: "#/components/schemas/AuthUserPayload" },
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },

      // ─── Users ────────────────────────────────────────────────────────
      CreateUserRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "password", "role"],
        properties: {
          firstName: { type: "string", example: "Alex" },
          lastName: { type: "string", example: "Manager" },
          email: { type: "string", example: "alex@example.com" },
          password: {
            type: "string",
            minLength: 8,
            example: "Password123",
            description: "Minimum 8 characters",
          },
          role: {
            type: "string",
            enum: ["brand_owner", "brand_manager", "operations_manager"],
            example: "brand_manager",
          },
        },
      },

      // ─── Brands ───────────────────────────────────────────────────────
      UpdateBrandRequest: {
        type: "object",
        description: "All fields are optional — send only what you want to change.",
        properties: {
          name: { type: "string", example: "StyleCast Premium Brand" },
          slug: { type: "string", example: "stylecast-premium-brand" },
          companyInfo: { type: "string", example: "Global premium brand" },
          website: { type: "string", example: "https://brand.com" },
          shippingOrigin: { type: "string", example: "Toronto, Canada" },
          brandCategory: { type: "string", example: "Fashion" },
          contactEmail: { type: "string", example: "team@brand.com" },
          contactPhone: { type: "string", example: "+1-647-000-1111" },
          isActive: { type: "boolean", example: true },
        },
      },
      UpdateApprovalRequest: {
        type: "object",
        required: ["approvalStatus"],
        properties: {
          approvalStatus: {
            type: "string",
            enum: ["pending", "approved", "rejected"],
            example: "approved",
          },
        },
      },

      // ─── Products ─────────────────────────────────────────────────────
      CreateVariantRequest: {
        type: "object",
        required: ["sku"],
        properties: {
          sku: { type: "string", example: "JACKET-BLK-S" },
          size: { type: "string", example: "S" },
          color: { type: "string", example: "Black" },
          material: { type: "string", example: "Leather" },
          priceOverride: { type: "number", example: 129.99 },
        },
      },
      CreateImageRequest: {
        type: "object",
        required: ["imageUrl"],
        properties: {
          imageUrl: { type: "string", format: "uri", example: "https://example.com/jacket-front.jpg" },
          altText: { type: "string", example: "Front view" },
          sortOrder: { type: "integer", minimum: 0, example: 0 },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["title", "price", "category"],
        properties: {
          title: { type: "string", example: "Classic Black Jacket" },
          description: { type: "string", example: "Premium-quality black jacket" },
          price: { type: "number", minimum: 0.01, example: 129.99 },
          category: { type: "string", example: "Outerwear" },
          variants: {
            type: "array",
            items: { $ref: "#/components/schemas/CreateVariantRequest" },
          },
          images: {
            type: "array",
            items: { $ref: "#/components/schemas/CreateImageRequest" },
          },
        },
      },
      UpdateProductRequest: {
        type: "object",
        description: "All fields optional — send only what you want to change.",
        properties: {
          title: { type: "string", example: "Classic Black Leather Jacket" },
          description: { type: "string", example: "Updated description" },
          price: { type: "number", minimum: 0.01, example: 139.99 },
          category: { type: "string", example: "Premium Outerwear" },
          status: {
            type: "string",
            enum: ["active", "archived"],
            example: "active",
          },
        },
      },

      // ─── Inventory ────────────────────────────────────────────────────
      UpdateInventoryRequest: {
        type: "object",
        description: "Both fields optional — send only what you want to change.",
        properties: {
          quantity: { type: "integer", minimum: 0, example: 40 },
          lowStockThreshold: { type: "integer", minimum: 0, example: 5 },
        },
      },

      // ─── Orders ───────────────────────────────────────────────────────
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["orderStatus"],
        properties: {
          orderStatus: {
            type: "string",
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"],
            example: "confirmed",
            description: "Must follow the valid state machine transitions.",
          },
        },
      },

      // ─── Shipping ─────────────────────────────────────────────────────
      CreateShippingRuleRequest: {
        type: "object",
        required: ["regionName", "shippingFee", "deliveryEstimate"],
        properties: {
          regionName: { type: "string", example: "North America" },
          shippingFee: { type: "number", minimum: 0, example: 10 },
          freeShippingThreshold: { type: "number", minimum: 0, example: 100 },
          deliveryEstimate: { type: "string", example: "5-7 days" },
        },
      },
      UpdateShippingRuleRequest: {
        type: "object",
        description: "All fields optional.",
        properties: {
          regionName: { type: "string", example: "Europe" },
          shippingFee: { type: "number", minimum: 0, example: 15 },
          freeShippingThreshold: { type: "number", minimum: 0, example: 120 },
          deliveryEstimate: { type: "string", example: "7-10 days" },
        },
      },

      // ─── Analytics ────────────────────────────────────────────────────
      AnalyticsOverviewResponse: {
        type: "object",
        properties: {
          range: { type: "string", example: "monthly" },
          totalOrders: { type: "integer", example: 12 },
          totalProducts: { type: "integer", example: 48 },
          totalActiveProducts: { type: "integer", example: 42 },
          totalSales: { type: "number", example: 3480 },
        },
      },
      TopProductResponse: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          title: { type: "string", example: "Classic Black Jacket" },
          unitsSold: { type: "integer", example: 18 },
          revenue: { type: "number", example: 2160 },
        },
      },
      OrderStatusSummaryResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "pending" },
          count: { type: "integer", example: 3 },
        },
      },
      InventoryTurnoverResponse: {
        type: "object",
        properties: {
          range: { type: "string", example: "monthly" },
          unitsSold: { type: "integer", example: 120 },
          currentInventoryUnits: { type: "integer", example: 80 },
          turnoverRate: { type: "number", example: 1.5 },
          note: { type: "string" },
        },
      },
      ConversionRateResponse: {
        type: "object",
        properties: {
          range: { type: "string", example: "weekly" },
          sessions: { type: "integer", example: 1500 },
          ordersPlaced: { type: "integer", example: 45 },
          conversionRate: { type: "number", example: 3.0 },
          unit: { type: "string", example: "%" },
          note: { type: "string" },
        },
      },
    },

    // ─── Reusable responses ─────────────────────────────────────────────
    responses: {
      Unauthorized: {
        description: "Missing or invalid JWT token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: "error", message: "Authorization token required" },
          },
        },
      },
      Forbidden: {
        description: "Authenticated user does not have the required role",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: "error", message: "Forbidden: insufficient permissions" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: "error", message: "Resource not found" },
          },
        },
      },
      ValidationError: {
        description: "Request body failed validation",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationError" },
          },
        },
      },
      Conflict: {
        description: "Resource already exists (duplicate field)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: "error", message: "A user with this email already exists" },
          },
        },
      },
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    // ─── System ──────────────────────────────────────────────────────────
    "/": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                example: { status: "ok", message: "StyleCast ERP API" },
              },
            },
          },
        },
      },
    },

    // ─── Auth ─────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register brand and initial owner account",
        description: "Creates a brand and a `brand_owner` user in a single operation.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Brand and owner registered successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate and receive JWT",
        description: "Returns a JWT to be sent as `Authorization: Bearer <token>` on subsequent requests.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { status: "error", message: "Invalid email or password" },
              },
            },
          },
        },
      },
    },

    // ─── Brands ───────────────────────────────────────────────────────────
    "/brands/me": {
      get: {
        tags: ["Brands"],
        summary: "Get current brand profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Brand profile fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/brands/profile": {
      put: {
        tags: ["Brands"],
        summary: "Update brand profile",
        description: "Roles: `brand_owner`, `brand_manager`. The `approvalStatus` field is ignored here — use `PATCH /brands/{id}/approval` instead.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBrandRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Brand profile updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    "/brands/{id}/approval": {
      patch: {
        tags: ["Brands"],
        summary: "Update brand approval status",
        description: "Roles: `brand_owner` only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Brand ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateApprovalRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Brand approval status updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Users ────────────────────────────────────────────────────────────
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List brand team members",
        description: "Roles: `brand_owner`, `brand_manager`.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Invite a new brand team member",
        description: "Roles: `brand_owner` only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "User created successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    // ─── Products ─────────────────────────────────────────────────────────
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products (paginated)",
        description: "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          { in: "query", name: "category", schema: { type: "string", example: "Outerwear" } },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["active", "archived"], example: "active" },
          },
        ],
        responses: {
          "200": {
            description: "Products returned with pagination metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    pagination: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product with variants and images",
        description: "Roles: `brand_owner`, `brand_manager`. An inventory record (quantity=0) is automatically created for each variant.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Product created successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "409": {
            description: "One or more SKUs already exist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { status: "error", message: "One or more SKUs already exist: JACKET-BLK-S" },
              },
            },
          },
        },
      },
    },

    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Product fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        description: "Roles: `brand_owner`, `brand_manager`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProductRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Product updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Archive product (soft delete)",
        description: "Roles: `brand_owner`, `brand_manager`. Products are never hard-deleted; archiving sets status to `archived`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Product archived successfully",
            content: {
              "application/json": {
                example: { message: "Product archived successfully" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Inventory ────────────────────────────────────────────────────────
    "/inventory/variant/{variantId}": {
      get: {
        tags: ["Inventory"],
        summary: "Get stock level for a product variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "variantId", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Inventory fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Inventory"],
        summary: "Update stock level for a product variant",
        description: "Roles: `brand_owner`, `brand_manager`. Upserts — creates an inventory record if one does not yet exist.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "variantId", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateInventoryRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Inventory updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/inventory/low-stock": {
      get: {
        tags: ["Inventory"],
        summary: "Get all low-stock variants",
        description: "Returns variants where `quantity <= lowStockThreshold`. Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Low-stock items returned" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ─── Orders ───────────────────────────────────────────────────────────
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders (paginated)",
        description:
          "Orders are created by the StyleCast marketplace. Brands view and manage them here. " +
          "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20, maximum: 100 } },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Orders returned with pagination metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    pagination: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        description: "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Order fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Advance order status",
        description: [
          "Roles: `brand_owner`, `operations_manager`.",
          "",
          "**Valid state transitions:**",
          "| From | To |",
          "|---|---|",
          "| `pending` | `confirmed`, `cancelled` |",
          "| `confirmed` | `shipped`, `cancelled` |",
          "| `shipped` | `delivered` |",
          "| `delivered`, `cancelled`, `refunded` | *(terminal — no transitions)* |",
        ].join("\n"),
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Order status updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "422": {
            description: "Invalid status transition",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { status: "error", message: "Invalid status transition: pending → delivered" },
              },
            },
          },
        },
      },
    },

    "/orders/{id}/refund": {
      patch: {
        tags: ["Orders"],
        summary: "Process refund",
        description: "Roles: `brand_owner`, `operations_manager`. Sets both `orderStatus` and `paymentStatus` to `refunded`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Refund processed successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Order has already been refunded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { status: "error", message: "This order has already been refunded" },
              },
            },
          },
        },
      },
    },

    // ─── Shipping ─────────────────────────────────────────────────────────
    "/shipping": {
      get: {
        tags: ["Shipping"],
        summary: "List shipping rules",
        description: "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Shipping rules fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Shipping"],
        summary: "Create shipping rule",
        description: "Roles: `brand_owner`, `brand_manager`.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateShippingRuleRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Shipping rule created successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/shipping/{id}": {
      put: {
        tags: ["Shipping"],
        summary: "Update shipping rule",
        description: "Roles: `brand_owner`, `brand_manager`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateShippingRuleRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Shipping rule updated successfully" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Shipping"],
        summary: "Delete shipping rule",
        description: "Roles: `brand_owner` only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Shipping rule deleted successfully",
            content: {
              "application/json": {
                example: { message: "Shipping rule deleted" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ─── Analytics ────────────────────────────────────────────────────────
    "/analytics/overview": {
      get: {
        tags: ["Analytics"],
        summary: "Dashboard overview (orders, sales, products)",
        description: "Roles: all authenticated users. Supports time ranges: `daily`, `weekly`, `monthly`. Omit `range` for all-time.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: { type: "string", enum: ["daily", "weekly", "monthly"] },
            description: "Optional time range filter",
          },
        ],
        responses: {
          "200": {
            description: "Overview fetched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnalyticsOverviewResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/analytics/top-products": {
      get: {
        tags: ["Analytics"],
        summary: "Top-selling products by units and revenue",
        description: "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 5, maximum: 20 },
            description: "Max products to return (capped at 20)",
          },
          {
            in: "query",
            name: "range",
            schema: { type: "string", enum: ["daily", "weekly", "monthly"] },
          },
        ],
        responses: {
          "200": {
            description: "Top products fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TopProductResponse" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/analytics/low-stock": {
      get: {
        tags: ["Analytics"],
        summary: "Low-stock inventory summary",
        description: "Roles: all authenticated users. Returns items where quantity ≤ threshold.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Low-stock summary fetched successfully" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/analytics/order-status": {
      get: {
        tags: ["Analytics"],
        summary: "Order counts grouped by status",
        description: "Roles: all authenticated users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: { type: "string", enum: ["daily", "weekly", "monthly"] },
          },
        ],
        responses: {
          "200": {
            description: "Order status summary fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/OrderStatusSummaryResponse" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/analytics/inventory-turnover": {
      get: {
        tags: ["Analytics"],
        summary: "Inventory turnover rate",
        description: "Roles: all authenticated users. Approximated as units sold / current inventory units.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: { type: "string", enum: ["daily", "weekly", "monthly"] },
          },
        ],
        responses: {
          "200": {
            description: "Inventory turnover fetched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryTurnoverResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    "/analytics/conversion-rate": {
      get: {
        tags: ["Analytics"],
        summary: "Conversion rate from marketplace traffic data",
        description:
          "Roles: all authenticated users. " +
          "Calculated from `traffic_metrics` records synced from the StyleCast marketplace. " +
          "Returns zero values if no traffic data has been synced yet.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: { type: "string", enum: ["daily", "weekly", "monthly"] },
          },
        ],
        responses: {
          "200": {
            description: "Conversion rate fetched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversionRateResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        responseInterceptor: (response: any) => {
          try {
            if (response.url && response.url.includes("/auth/login")) {
              const data = JSON.parse(response.text);
              if (data?.token) {
                window.localStorage.setItem("stylecast_jwt_token", data.token);
              }
            }
          } catch (error) {
            console.error("Swagger login response parse error:", error);
          }
          return response;
        },
        requestInterceptor: (req: any) => {
          const token = window.localStorage.getItem("stylecast_jwt_token");
          if (token) {
            req.headers["Authorization"] = `Bearer ${token}`;
          }
          return req;
        },
      },
    }),
  );
};
