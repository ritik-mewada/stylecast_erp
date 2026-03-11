import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "StyleCast Brand Admin ERP API",
    version: "1.0.0",
    description:
      "Interactive API documentation for the StyleCast Brand Admin ERP backend.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "System", description: "System and health endpoints" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Brands", description: "Brand onboarding and profile management" },
    { name: "Users", description: "Brand team user management" },
    { name: "Products", description: "Product catalog management" },
    { name: "Inventory", description: "Inventory management" },
    { name: "Orders", description: "Order management" },
    { name: "Shipping", description: "Shipping configuration" },
    { name: "Analytics", description: "Brand analytics dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
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
          companyInfo: {
            type: "string",
            example: "Premium fashion and beauty label",
          },
          website: { type: "string", example: "https://stylecast-demo.com" },
          shippingOrigin: { type: "string", example: "Toronto, Canada" },
          brandCategory: { type: "string", example: "Fashion" },
          contactEmail: {
            type: "string",
            example: "contact@stylecast-demo.com",
          },
          contactPhone: { type: "string", example: "+1-647-555-1234" },
          firstName: { type: "string", example: "Ritik" },
          lastName: { type: "string", example: "Mewada" },
          email: { type: "string", example: "ritik@example.com" },
          password: { type: "string", example: "Password123" },
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

      LoginResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "uuid-user-id" },
              firstName: { type: "string", example: "Ritik" },
              lastName: { type: "string", example: "Mewada" },
              email: { type: "string", example: "ritik@example.com" },
              role: {
                type: "string",
                example: "brand_owner",
              },
              brandId: { type: "string", example: "uuid-brand-id" },
            },
          },
          token: {
            type: "string",
            example: "jwt_token_here",
          },
        },
      },

      CreateUserRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "password", "role"],
        properties: {
          firstName: { type: "string", example: "Alex" },
          lastName: { type: "string", example: "Manager" },
          email: { type: "string", example: "alex@example.com" },
          password: { type: "string", example: "Password123" },
          role: {
            type: "string",
            enum: ["brand_owner", "brand_manager", "operations_manager"],
            example: "brand_manager",
          },
        },
      },

      UpdateBrandRequest: {
        type: "object",
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

      CreateProductRequest: {
        type: "object",
        required: ["title", "price", "category"],
        properties: {
          title: { type: "string", example: "Classic Black Jacket" },
          description: {
            type: "string",
            example: "Premium quality black jacket",
          },
          price: { type: "number", example: 129.99 },
          category: { type: "string", example: "Outerwear" },
          variants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string", example: "JACKET-BLK-S" },
                size: { type: "string", example: "S" },
                color: { type: "string", example: "Black" },
                material: { type: "string", example: "Leather" },
                priceOverride: { type: "number", example: 129.99 },
              },
            },
          },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                imageUrl: {
                  type: "string",
                  example: "https://example.com/jacket-front.jpg",
                },
                altText: { type: "string", example: "Front view" },
                sortOrder: { type: "integer", example: 1 },
              },
            },
          },
        },
      },

      UpdateProductRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Classic Black Leather Jacket" },
          description: { type: "string", example: "Updated description" },
          price: { type: "number", example: 139.99 },
          category: { type: "string", example: "Premium Outerwear" },
          status: {
            type: "string",
            enum: ["active", "archived"],
            example: "active",
          },
        },
      },

      UpdateInventoryRequest: {
        type: "object",
        properties: {
          quantity: { type: "integer", example: 40 },
          lowStockThreshold: { type: "integer", example: 5 },
        },
      },

      UpdateOrderStatusRequest: {
        type: "object",
        required: ["orderStatus"],
        properties: {
          orderStatus: {
            type: "string",
            enum: [
              "pending",
              "confirmed",
              "shipped",
              "delivered",
              "cancelled",
              "refunded",
            ],
            example: "confirmed",
          },
        },
      },

      CreateShippingRuleRequest: {
        type: "object",
        required: ["regionName", "shippingFee", "deliveryEstimate"],
        properties: {
          regionName: { type: "string", example: "North America" },
          shippingFee: { type: "number", example: 10 },
          freeShippingThreshold: { type: "number", example: 100 },
          deliveryEstimate: { type: "string", example: "5-7 days" },
        },
      },

      UpdateShippingRuleRequest: {
        type: "object",
        properties: {
          regionName: { type: "string", example: "Europe" },
          shippingFee: { type: "number", example: 15 },
          freeShippingThreshold: { type: "number", example: 120 },
          deliveryEstimate: { type: "string", example: "7-10 days" },
        },
      },

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
          productId: { type: "string", example: "uuid-1" },
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
          note: {
            type: "string",
            example:
              "Inventory turnover is approximated as units sold divided by current inventory units for the selected period.",
          },
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
          note: {
            type: "string",
            example:
              "Conversion rate is based on marketplace traffic data synced into traffic_metrics.",
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "Test API",
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register brand and initial owner",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Brand registered successfully" },
          "400": { description: "Validation or registration error" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
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
          "400": { description: "Invalid credentials" },
        },
      },
    },

    "/brands/me": {
      get: {
        tags: ["Brands"],
        summary: "Get current brand profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Brand profile fetched successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    "/brands/profile": {
      put: {
        tags: ["Brands"],
        summary: "Update brand profile",
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
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/users": {
      get: {
        tags: ["Users"],
        summary: "List brand users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users fetched successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create brand user",
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
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", example: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", example: 20 },
          },
          {
            in: "query",
            name: "category",
            schema: { type: "string", example: "Outerwear" },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["active", "archived"],
              example: "active",
            },
          },
        ],
        responses: {
          "200": { description: "Products fetched successfully" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product with variants and images",
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
          "400": { description: "Validation error" },
        },
      },
    },

    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Product fetched successfully" },
          "404": { description: "Product not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
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
          "400": { description: "Validation error" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Archive product",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Product archived successfully" },
        },
      },
    },

    "/inventory/variant/{variantId}": {
      get: {
        tags: ["Inventory"],
        summary: "Get inventory for a variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "variantId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Inventory fetched successfully" },
          "404": { description: "Inventory not found" },
        },
      },
      put: {
        tags: ["Inventory"],
        summary: "Update inventory for a variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "variantId",
            required: true,
            schema: { type: "string" },
          },
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
          "400": { description: "Validation error" },
        },
      },
    },

    "/inventory/low-stock": {
      get: {
        tags: ["Inventory"],
        summary: "Get low stock variants",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Low stock items fetched successfully" },
        },
      },
    },

    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "List incoming orders",
        description:
          "Orders are created by the StyleCast customer marketplace. The Brand Admin ERP allows brands to view and manage them.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", example: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", example: 20 },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
              ],
              example: "pending",
            },
          },
        ],
        responses: {
          "200": { description: "Orders fetched successfully" },
        },
      },
    },

    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by id",
        description:
          "Returns order details for an order created by the StyleCast marketplace system.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Order fetched successfully" },
          "404": { description: "Order not found" },
        },
      },
    },

    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status",
        description:
          "Updates the fulfillment status of an order received from the StyleCast marketplace.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateOrderStatusRequest",
              },
            },
          },
        },
        responses: {
          "200": { description: "Order status updated successfully" },
          "400": { description: "Invalid transition" },
        },
      },
    },

    "/orders/{id}/refund": {
      patch: {
        tags: ["Orders"],
        summary: "Process refund",
        description:
          "Processes a refund for an order created by the StyleCast marketplace.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Refund processed successfully" },
          "400": { description: "Refund error" },
        },
      },
    },

    "/shipping": {
      get: {
        tags: ["Shipping"],
        summary: "List shipping rules",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Shipping rules fetched successfully" },
        },
      },
      post: {
        tags: ["Shipping"],
        summary: "Create shipping rule",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateShippingRuleRequest",
              },
            },
          },
        },
        responses: {
          "201": { description: "Shipping rule created successfully" },
        },
      },
    },

    "/shipping/{id}": {
      put: {
        tags: ["Shipping"],
        summary: "Update shipping rule",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateShippingRuleRequest",
              },
            },
          },
        },
        responses: {
          "200": { description: "Shipping rule updated successfully" },
        },
      },
      delete: {
        tags: ["Shipping"],
        summary: "Delete shipping rule",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Shipping rule deleted successfully" },
        },
      },
    },

    "/analytics/overview": {
      get: {
        tags: ["Analytics"],
        summary: "Get analytics overview",
        description:
          "Returns high-level brand analytics including total orders, total sales, total products, and total active products. Supports time ranges: daily, weekly, monthly.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              example: "monthly",
            },
            description: "Optional analytics time range",
          },
        ],
        responses: {
          "200": {
            description: "Overview analytics fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AnalyticsOverviewResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/analytics/top-products": {
      get: {
        tags: ["Analytics"],
        summary: "Get top-selling products",
        description:
          "Returns top-selling products for the authenticated brand based on total units sold and revenue. Supports time ranges: daily, weekly, monthly.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", example: 5 },
            description: "Maximum number of products to return",
          },
          {
            in: "query",
            name: "range",
            schema: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              example: "weekly",
            },
            description: "Optional analytics time range",
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
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/analytics/low-stock": {
      get: {
        tags: ["Analytics"],
        summary: "Get low stock summary",
        description:
          "Returns inventory items where quantity is less than or equal to the configured low stock threshold.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Low stock analytics fetched successfully",
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/analytics/order-status": {
      get: {
        tags: ["Analytics"],
        summary: "Get order status summary",
        description:
          "Returns counts of orders grouped by order status for the authenticated brand. Supports time ranges: daily, weekly, monthly.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              example: "daily",
            },
            description: "Optional analytics time range",
          },
        ],
        responses: {
          "200": {
            description: "Order status analytics fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/OrderStatusSummaryResponse",
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/analytics/inventory-turnover": {
      get: {
        tags: ["Analytics"],
        summary: "Get inventory turnover",
        description:
          "Returns an inventory turnover approximation for the authenticated brand. Supports time ranges: daily, weekly, monthly.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              example: "monthly",
            },
            description: "Optional analytics time range",
          },
        ],
        responses: {
          "200": {
            description: "Inventory turnover fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InventoryTurnoverResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },

    "/analytics/conversion-rate": {
      get: {
        tags: ["Analytics"],
        summary: "Get conversion rate",
        description:
          "Returns conversion rate for the authenticated brand using marketplace traffic data synced into traffic_metrics. Supports time ranges: daily, weekly, monthly. If no traffic data exists, zero values will be returned.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            schema: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              example: "weekly",
            },
            description: "Optional analytics time range",
          },
        ],
        responses: {
          "200": {
            description: "Conversion rate fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversionRateResponse",
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
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
