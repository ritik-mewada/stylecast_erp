# StyleCast ERP — Backend

Multi-tenant REST API for StyleCast ERP. Independent fashion brands use it to manage products, variants and stock, take and fulfil orders, set shipping rates and track sales. A platform admin reviews and approves new brands.

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (TypeScript) |
| Framework | Express 5 |
| ORM | TypeORM 0.3 (migrations) |
| Database | PostgreSQL 14+ |
| Auth | JWT (`jsonwebtoken`), `bcrypt` |
| Validation | `class-validator` + `class-transformer` DTOs |
| Security | `helmet`, CORS allow-list, `express-rate-limit` |
| Uploads / email | `multer`, `nodemailer` |
| API docs | OpenAPI 3.0 + Swagger UI |

---

## Getting started

**Prerequisites:** Node.js 22 and a running PostgreSQL.

```bash
cd backend
npm install
cp .env.example .env          # then set JWT_SECRET and the DB_* (or DATABASE_URL) values
createdb stylecast_erp        # or CREATE DATABASE stylecast_erp; in psql
npm run migration:run         # create the schema
npm run seed                  # optional: demo data (see below)
npm run dev                   # http://localhost:3000, restarts on change
```

- Swagger UI: <http://localhost:3000/api-docs>
- OpenAPI JSON: <http://localhost:3000/api-docs.json>
- Health: <http://localhost:3000/health>

All API routes are under `/api/v1`.

> **Upgrading a database made by an older version?** Earlier versions built the schema with `synchronize`. Drop and recreate that database, then run `npm run migration:run`.

### Demo data

`npm run seed` creates the same accounts and catalog the dashboard's demo uses. Every account's password is `password` (set `SEED_PASSWORD` to change it):

| Email | Role |
|---|---|
| `camille@maisonondine.example` | Brand owner, Maison Ondine (approved) |
| `jordan@maisonondine.example` | Brand manager |
| `priya@maisonondine.example` | Operations manager |
| `admin@stylecast.example` | Platform admin |

It also adds 24 products (167 variants, some low or out of stock), 60 orders over the last 30 days, shipping rules, 30 days of traffic, and three other brands (two pending review, one rejected). It won't run twice; `npm run seed -- --reset` wipes all data first and is refused when `NODE_ENV=production`.

### Platform admins

Admins can't sign up through the API. Create one (or reset an admin's password) with:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
```

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with nodemon + ts-node |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm run start:prod` | Run pending migrations, then start (for deploys) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run migration:run` / `migration:revert` / `migration:show` | Apply / undo the last / list migrations |
| `npm run migration:generate -- src/migrations/Name` | Generate a migration from entity changes |
| `npm run migration:run:prod` | Apply migrations from the compiled `dist/` |
| `npm run seed` / `seed:prod` | Load demo data (ts-node / compiled) |
| `npm run create-admin` | Create or reset a platform admin |

### Changing the schema

`synchronize` is off. After editing an entity, run `npm run migration:generate -- src/migrations/DescribeTheChange`, read the generated SQL, then `npm run migration:run`. Commit the migration with the entity change.

---

## Configuration

All settings are environment variables (see [`.env.example`](.env.example)). With `NODE_ENV=production` the server refuses to start unless `ALLOWED_ORIGINS` and database credentials (`DATABASE_URL` or `DB_PASSWORD`) are set and `JWT_SECRET` is at least 32 characters; development falls back to the defaults below.

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | *(required)* | Signs tokens. The app won't start without it; production needs 32+ characters (`openssl rand -base64 48`). |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `PORT`, `NODE_ENV` | `3000`, `development` | |
| `DATABASE_URL` | | Full connection string; wins over `DB_*`. Add `?sslmode=require` for TLS. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | `localhost`, `5432`, `postgres`, `root`, `stylecast_erp` | The `root` password default is development-only |
| `ALLOWED_ORIGINS` | `*` in development | Comma-separated CORS origins (e.g. `http://localhost:5173`). Required in production. |
| `TRUST_PROXY` | off | Proxy hops to trust (`1` behind a load balancer) for client IP and protocol |
| `LOGIN_RATE_LIMIT` | `10` | Failed sign-ins allowed per IP per 15 minutes |
| `REGISTER_RATE_LIMIT` | `10` | Sign-ups allowed per IP per hour |
| `PUBLIC_URL` | request host | Base URL used in uploaded-image links |
| `APP_URL` | `http://localhost:5173` | Dashboard URL used in password-reset emails |
| `SMTP_URL`, `MAIL_FROM` | | Outgoing email. Without `SMTP_URL`, development prints emails to the console and production skips them. |

---

## Roles

| Role | Can |
|---|---|
| `platform_admin` | List brands and approve or reject them. Has no brand, so brand endpoints return 403. |
| `brand_owner` | Everything in the brand, including managing the team (invite, change roles, remove) and deleting shipping rules |
| `brand_manager` | Catalog, stock, shipping, brand profile, traffic, team list, creating orders |
| `operations_manager` | Reading the catalog; creating, fulfilling and refunding orders |

Registration always creates a `brand_owner` for a new brand in `pending` status. Invites and role changes can only assign brand roles. An owner can't change their own role or remove themselves, so a brand always keeps an owner.

Rejecting a brand (or revoking its approval) marks it inactive (`isActive: false`). It keeps its data and its users can still sign in, but only approved brands can take orders. Approving it again reactivates it. Brands can't change `isActive` themselves.

---

## Endpoints

Base path `/api/v1`. Swagger has the request and response schemas and every error code.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Account | `GET /users/me`, `PUT /users/me`, `PUT /users/me/password` |
| Team | `GET /users`, `POST /users`, `PATCH /users/:id/role`, `DELETE /users/:id` |
| Brands | `GET /brands/me`, `PUT /brands/profile`; admin: `GET /brands?status=`, `GET /brands/stats`, `PATCH /brands/:id/approval` |
| Products | `GET /products?search=&category=&status=`, `POST /products`, `GET/PUT/DELETE /products/:id` (DELETE archives) |
| Inventory | `GET /inventory?status=low\|out&search=`, `GET/PUT /inventory/variant/:variantId`, `GET /inventory/low-stock` |
| Orders | `GET /orders?status=&paymentStatus=&search=`, `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `PATCH /orders/:id/refund` |
| Shipping | `GET /shipping`, `POST /shipping`, `PUT/DELETE /shipping/:id` |
| Analytics | `GET /analytics/overview`, `top-products`, `low-stock`, `order-status`, `inventory-turnover`, `conversion-rate`, `sales-series`; `POST /analytics/traffic` |
| Uploads | `POST /uploads` (multipart `file`), `GET /uploads/:id` (public) |
| System | `GET /` (liveness), `GET /health` (checks the database; 503 if it's down) |

Lists take `page` and `limit` (max 100) and return `{ data, pagination: { page, limit, total, totalPages } }`. Analytics take `?range=daily|weekly|monthly|all_time`.

Errors are `{ "status": "error", "message": "…" }`, sometimes with `details`. For example, a 409 on `POST /orders` lists `{ sku, requested, available }` for each short item.

---

## Design decisions

**Layering.** Routes → Controllers → Services → TypeORM. Routes declare the auth and validation middleware, controllers translate HTTP, and services hold the rules and throw `AppError(status, message, details?)`. One error handler turns those into responses. It also maps Postgres unique violations to 409 and invalid input to 400.

**Sessions.** A JWT carries only the user id and a `tokenVersion`. On every request the auth middleware loads the user (one primary-key lookup), so role, brand and email always come from the database. Changing or resetting a password bumps `tokenVersion`, which ends every session at once; changing your own password returns a fresh token for the session that made the change. A removed account's tokens stop working immediately.

**Multi-tenancy.** Every brand-scoped query filters by the signed-in user's `brandId` (loaded from the database, never taken from the request). Inventory, which has no `brandId` of its own, is scoped through `variant → product → brand`. Another brand's ids get the same 404 as missing ones, so ids don't leak. Platform admins have a null `brandId`. Brand routes reject them by role, and `getBrandId()` refuses a brandless token as a second check.

**Stock and concurrency.** `POST /orders` runs in one transaction. It checks that the brand is approved, merges repeated variants, locks the inventory rows (`SELECT … FOR UPDATE`) sorted by `variantId`, checks stock, decrements it, and saves the order with a price snapshot. Concurrent orders for the last unit queue on the row lock, so exactly one succeeds and the others get 409. The fixed lock order prevents deadlocks between orders that share variants.

**Order state machine.** `pending → confirmed → shipped → delivered`, with `cancelled` reachable from `pending` and `confirmed`. Anything else is 422. Cancelling restocks. Refunding (from any status except refunded) restocks unless the order was already cancelled. Both lock the order row first, so stock is never returned twice, even with concurrent requests.

**Analytics.** Sales, best sellers and turnover leave out cancelled and refunded orders, since neither brought in money and both returned their stock. Conversion rate uses daily traffic recorded through `POST /analytics/traffic` (one row per brand per day).

**Uploads.** Images are stored in Postgres (`bytea`, max 5 MB) rather than on disk, so they survive redeploys on hosts with ephemeral filesystems, with no object store needed. The type comes from the file's magic bytes; only JPEG, PNG, WebP and AVIF are accepted (no SVG). Images are served publicly by unguessable id and cached forever. At larger scale this would move to S3 or similar.

**Emails, slugs and brand names.** Account emails are case-insensitive: sign-up, sign-in, invites, profile edits and password resets trim and lowercase the address, and a database check constraint keeps stored emails lowercase, so the unique constraint can't be dodged by case. Brand slugs work the same way and must be 2–60 lowercase letters, numbers and single hyphens. Brand names keep their display case but are unique ignoring it (a unique index on `lower(name)`).

**Password reset.** Links are single use and expire after an hour, and only a SHA-256 hash of the token is stored. `forgot-password` answers the same way whether or not the email exists, and sends the email after responding, so neither the message nor the timing reveals accounts. Login checks a dummy password hash when the email is unknown, so a wrong email takes as long as a wrong password. Per IP, login allows 10 failed attempts per 15 minutes, reset requests 5 per 15 minutes, and sign-ups 10 per hour.

**Schema.** Migrations only (`synchronize: false`). Prices are `numeric(10,2)` columns, returned as JSON numbers.

---

## Deploying

The API runs on any Node host with managed Postgres (Render, Railway, Fly, …):

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm ci && npm run build` |
| Start command | `npm run start:prod` (applies pending migrations, then starts; SIGTERM shuts down gracefully) |
| Health check path | `/health` |
| Environment | `NODE_ENV=production`, `JWT_SECRET` (32+ random characters), `DATABASE_URL`, `ALLOWED_ORIGINS` (dashboard origin), `TRUST_PROXY=1`, `APP_URL`, optionally `SMTP_URL` |

After the first deploy, create an admin with `npm run create-admin`, or load the demo with `npm run seed:prod`, from the host's shell. Seeded accounts, including the admin, share one known password (`SEED_PASSWORD`, default `password`). Only seed a public demo, never a real production database.

On SIGTERM (a redeploy) the server stops taking connections, finishes in-flight requests, closes the database pool and exits, within 10 seconds at most.

Rate-limit counters are kept in memory, so they're per instance. Running several instances would need a shared store such as Redis.
