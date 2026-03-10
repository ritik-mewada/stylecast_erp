import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "StyleCast Brand Admin ERP API",
    version: "1.0.0",
    description: "API documentation for the StyleCast Brand Admin ERP backend.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local development server",
    },
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
          "200": { description: "Login successful" },
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
        summary: "List orders",
        description:
          "Orders are created by the StyleCast customer marketplace. The Brand Admin ERP only allows brands to view and manage orders.",
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
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
