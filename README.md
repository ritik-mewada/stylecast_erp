# StyleCast Brand Admin ERP — Backend

A multi-tenant SaaS backend for the StyleCast Brand Admin ERP system.
Brands onboard onto the StyleCast marketplace and use this API to manage their products, inventory, orders, shipping rules, and view analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (TypeScript) |
| Framework | Express.js |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| API Docs | Swagger UI (OpenAPI 3.0) |

---

## Architecture Overview

This system follows a standard layered architecture:

```
Routes → Controllers → Services → TypeORM Repositories → PostgreSQL
```

- **Multi-tenancy**: Every entity that belongs to a brand includes a `brandId` column. All service methods are scoped to the authenticated user's `brandId` — brand A can never read or modify brand B's data.
- **Authentication**: JWT tokens issued on login/register. Tokens contain `userId`, `brandId`, `role`, and `email`. The `authenticate` middleware verifies the token on every protected route.
- **Authorization**: The `authorizeRoles` middleware checks the user's role against the allowed roles for each endpoint. Roles: `brand_owner`, `brand_manager`, `operations_manager`.

---

## Prerequisites

- Node.js v18+
- PostgreSQL 14+

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

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
PORT=8080
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=stylecast_erp

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

### 4. Create the database

In your PostgreSQL client:

```sql
CREATE DATABASE stylecast_erp;
```

### 5. Start the server

```bash
npm run dev
```

The server will start at `http://localhost:8080`.

> The database schema is automatically synchronized on startup via TypeORM's `synchronize: true` setting — no manual migrations needed for development.

---

## API Documentation

Interactive Swagger UI is available once the server is running:

```
http://localhost:8080/api-docs
```

---

## API Endpoints Summary

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register brand + owner account | No |
| POST | `/auth/login` | Login, receive JWT token | No |

### Brands
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/brands/me` | Get current brand profile | Any |
| PUT | `/brands/profile` | Update brand profile | Owner, Manager |
| PATCH | `/brands/:id/approval` | Approve or reject a brand | Owner only |

### Users
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/users` | Create a new team member | Owner |
| GET | `/users` | List brand team members | Owner, Manager |

### Products
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/products` | Create product with variants/images | Owner, Manager |
| GET | `/products` | List products (paginated, filterable) | Owner, Manager, Ops |
| GET | `/products/:id` | Get product details | Owner, Manager, Ops |
| PUT | `/products/:id` | Update product | Owner, Manager |
| DELETE | `/products/:id` | Archive product | Owner, Manager |

### Inventory
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/inventory/variant/:variantId` | Get stock for a variant | Any |
| PUT | `/inventory/variant/:variantId` | Update stock for a variant | Owner, Manager |
| GET | `/inventory/low-stock` | Get low stock items | Any |

### Orders
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/orders` | List orders (paginated, filterable) | Owner, Manager, Ops |
| GET | `/orders/:id` | Get order details | Owner, Manager, Ops |
| PATCH | `/orders/:id/status` | Update order status | Owner, Ops |
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
| GET | `/analytics/overview` | Sales overview (supports `?range=daily\|weekly\|monthly`) | All |
| GET | `/analytics/top-products` | Top selling products | All |
| GET | `/analytics/low-stock` | Low stock summary | All |
| GET | `/analytics/order-status` | Order status breakdown | All |
| GET | `/analytics/inventory-turnover` | Inventory turnover rate | All |
| GET | `/analytics/conversion-rate` | Conversion rate from traffic data | All |

---

## Multi-Tenant Data Isolation

Every data table includes a `brandId` column. All service layer queries filter by `brandId` extracted from the authenticated JWT token — meaning:

- A brand owner can only see their own products, orders, inventory, and analytics.
- It is architecturally impossible to access another brand's data through the API.
- The `brandId` is never taken from the request body — it always comes from the verified JWT.

---

## Order Status Lifecycle

Orders follow a strict state machine:

```
pending → confirmed → shipped → delivered
pending → cancelled
confirmed → cancelled
any → refunded (via dedicated /refund endpoint)
```

Invalid transitions are rejected with a `400` error.

---

## Scalability Notes

- All high-traffic columns (`brandId`, `status`, `createdAt`) are indexed using TypeORM `@Index()` decorators.
- Product and order listings use pagination with configurable `page` and `limit` parameters.
- The architecture is stateless — the server can be horizontally scaled behind a load balancer.
- JWT-based auth avoids database lookups on every request.

---

## Available Scripts

```bash
npm run dev       # Start server in development mode (ts-node)
npm run build     # Compile TypeScript to dist/
npm run start     # Run compiled build
npm run lint      # Run ESLint
```
