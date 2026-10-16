# StyleCast Brand Admin ERP — Backend

A multi-tenant SaaS backend for the StyleCast Brand Admin ERP system.
Brands onboard onto the StyleCast marketplace and use this API to manage their products, inventory, orders, shipping rules, and view analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (TypeScript) |
| Framework | Express.js 5 |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL 14+ |
| Auth | JWT (`jsonwebtoken`) |
| Password Hashing | `bcrypt` |
| Validation | `class-validator` + `class-transformer` |
| Security | `helmet`, CORS |
| API Docs | Swagger UI (OpenAPI 3.0) |

---

## Architecture

```
Routes → Controllers → Services → TypeORM Repositories → PostgreSQL
```

- **Multi-tenancy** — Every entity includes a `brandId` column. All service queries filter by the `brandId` from the authenticated JWT. Brand A can never read or modify Brand B's data.
- **Authentication** — JWT tokens issued on login/register, containing `userId`, `brandId`, `role`, and `email`. The `authenticate` middleware verifies the token on every protected route.
- **Authorization** — The `authorizeRoles` middleware checks the user's role against the allowed roles per endpoint.
- **Validation** — Every mutation endpoint validates the request body against a typed DTO class using `class-validator`. Invalid payloads receive a structured `400` error before reaching the controller.
- **Error handling** — All errors propagate to a centralized global error handler. Services throw `AppError(statusCode, message)` instances; unexpected errors are logged and return a generic `500` in production.

---

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** 14 or later

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd stylecast_erp_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (you can copy the example below):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=stylecast_erp

# JWT  (required — the app will NOT start if this is missing)
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=1d

# CORS  (comma-separated origins, or * for development)
ALLOWED_ORIGINS=*
```

> **JWT_SECRET is required.** The app will exit immediately at startup if it is not set.

### 4. Create the database

In your PostgreSQL client:

```sql
CREATE DATABASE stylecast_erp;
```

### 5. Start the development server

```bash
npm run dev
```

The server starts at `http://localhost:3000` (or whatever `PORT` you set).

---

## API Documentation

Interactive Swagger UI is available once the server is running:

```
http://localhost:3000/api-docs
```

All API routes are prefixed with `/api/v1`.

---

## API Endpoints Summary

> **Base path:** `/api/v1`
>
> **Roles:** `brand_owner` · `brand_manager` · `operations_manager`

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register brand + owner account | Public |
| POST | `/auth/login` | Login, receive JWT | Public |

### Brands
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/brands/me` | Get current brand profile | Any |
| PUT | `/brands/profile` | Update brand profile | Owner, Manager |
| PATCH | `/brands/:id/approval` | Approve or reject a brand | Owner |

### Users
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/users` | Invite a new team member | Owner |
| GET | `/users` | List brand team members | Owner, Manager |

### Products
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/products` | Create product with variants/images | Owner, Manager |
| GET | `/products` | List products (paginated, filterable) | Owner, Manager, Ops |
| GET | `/products/:id` | Get product details | Owner, Manager, Ops |
| PUT | `/products/:id` | Update product | Owner, Manager |
| DELETE | `/products/:id` | Archive product (soft delete) | Owner, Manager |

### Inventory
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/inventory/variant/:variantId` | Get stock for a variant | Any |
| PUT | `/inventory/variant/:variantId` | Update stock for a variant | Owner, Manager |
| GET | `/inventory/low-stock` | Get all low-stock items | Any |

### Orders
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/orders` | List orders (paginated, filterable) | Owner, Manager, Ops |
| GET | `/orders/:id` | Get order details | Owner, Manager, Ops |
| PATCH | `/orders/:id/status` | Advance order status | Owner, Ops |
| PATCH | `/orders/:id/refund` | Process refund | Owner, Ops |

### Shipping
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/shipping` | Create shipping rule | Owner, Manager |
| GET | `/shipping` | List shipping rules | Any |
| PUT | `/shipping/:id` | Update shipping rule | Owner, Manager |
| DELETE | `/shipping/:id` | Delete shipping rule | Owner |

### Analytics
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/analytics/overview` | Sales overview | All |
| GET | `/analytics/top-products` | Top-selling products | All |
| GET | `/analytics/low-stock` | Low-stock summary | All |
| GET | `/analytics/order-status` | Orders by status | All |
| GET | `/analytics/inventory-turnover` | Inventory turnover rate | All |
| GET | `/analytics/conversion-rate` | Conversion rate from traffic data | All |

Analytics endpoints accept an optional `?range=daily|weekly|monthly` query parameter.

---

## Error Response Shape

All errors return a consistent JSON structure:

```json
{
  "status": "error",
  "message": "Human-readable description"
}
```

Validation failures (400) concatenate all field errors into a single message string.

---

## Order Status State Machine

Orders follow a strict state machine. Invalid transitions return `422 Unprocessable Entity`.

```
pending ──► confirmed ──► shipped ──► delivered
   │              │
   └──────────────┴──► cancelled

(any status) ──► refunded  (via PATCH /orders/:id/refund)
```

---

## Multi-Tenant Data Isolation

- Every data table has a `brandId` column.
- All service queries are scoped to the `brandId` from the verified JWT — never from the request body.
- It is architecturally impossible to access another brand's data through the API.

---

## Scalability Notes

- High-traffic columns (`brandId`, `status`, `createdAt`) are indexed via TypeORM `@Index()` decorators.
- Product and order listings are paginated with `?page` and `?limit` (max 100) query params, returning a `pagination` metadata object alongside `data`.
- The server is stateless and can be horizontally scaled behind a load balancer.
- JWT-based auth avoids database lookups on every authenticated request.

---
