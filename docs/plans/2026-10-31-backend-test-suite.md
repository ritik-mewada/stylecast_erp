# Step 2 — Backend Test Suite (Implementation Plan)

**Goal:** Prove the backend's rules with automated tests that run against a real Postgres: auth and roles, tenant isolation, stock that can't be oversold or restocked twice, the order state machine, and responses that match the OpenAPI spec. This is what lets us call the backend done.

**Branch:** `test/backend-suite` (one PR per task group below if it gets large).

**Status (2026-10-31):** planned. CI comes last (Task 9), after the suite is green locally.

**Architecture:** Integration-first. Most tests drive the Express `app` (exported from `src/app.ts`, no listening server) through Supertest against a dedicated test database that the real migrations build. Pure helpers (pagination, analytics ranges, config validation, slug rules) get small unit tests. No mocking of TypeORM or services: the risky code is the SQL, the locks and the transactions, and mocks would hide exactly that.

---

## Decisions (to confirm)

| Topic | Proposal | Why |
|---|---|---|
| Runner | **Jest + ts-jest + Supertest** | Entities and DTOs depend on `emitDecoratorMetadata`. Vitest (esbuild) doesn't emit it, so TypeORM and class-transformer would misbehave. ts-jest runs the real TypeScript compiler. |
| Database | Separate `stylecast_erp_test` database, built by `migration:run` in Jest `globalSetup` | Tests the real migrations too. Never touches the dev data. |
| Isolation between tests | `TRUNCATE … RESTART IDENTITY CASCADE` on every table (except `migrations`) before each test file, and fresh data per test via factories | Simple and fast enough at this size. Transaction rollback doesn't work because the code under test opens its own transactions. |
| Parallelism | `--runInBand` (one worker) | One shared database; the concurrency tests need to control their own parallelism. |
| Rate limits | `LOGIN_RATE_LIMIT` / `REGISTER_RATE_LIMIT` set high in the test env. One dedicated file sets them low to test the 429s | Jest gives each file its own module registry, so `Config` and the in-memory limiter stores reset per file. |
| Email | `jest.spyOn` the mailer's send function and read the reset link from the call | No SMTP. Lets the reset-password flow be tested end to end. |
| Coverage bar | 80% lines on `src/services` and `src/middleware`, reported always and enforced once Task 8 is done | High enough to mean something without chasing trivial lines. |

---

## Task 0 — Harness

- Dev deps: `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`.
- `jest.config.ts`: `preset: ts-jest`, `testEnvironment: node`, `roots: ["<rootDir>/test"]`, `globalSetup`, `setupFilesAfterEnv`, coverage from `src/**` (excluding `migrations`, `scripts`, `server.ts`).
- `.env.test` (committed, no secrets): `NODE_ENV=test`, `DB_NAME=stylecast_erp_test`, a 32+ char `JWT_SECRET`, high rate limits.
- `test/global-setup.ts`: create the test database if missing, run migrations once.
- `test/setup.ts`: initialise `AppDataSource` per file, truncate all tables, destroy the connection after the file.
- Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`.

**Verify:** a single `GET /health` test passes. `npm test` twice in a row passes (no state leaking between runs).

## Task 1 — Factories and helpers (`test/helpers/`)

- `createBrand({ approvalStatus })`, `createUser({ brand, role })`, `createAdmin()`, `createProduct({ brand, variants, stock })`, `createOrder(...)`, `createShippingRule(...)`. Insert straight through repositories, so tests don't depend on the endpoints they aren't testing.
- `tokenFor(user)`: signs a JWT the same way `services/auth.ts` does.
- `api(token?)`: Supertest wrapper that sets `Authorization`.
- `expectError(res, status, messagePattern?)`: checks the `{ status: "error", message }` shape.

## Task 2 — Auth and accounts (`auth.test.ts`, `users.test.ts`)

- Register: creates a pending brand plus a `brand_owner`; the returned token works; slug is trimmed and lowercased; an invalid slug gives 400; a duplicate brand name or slug (ignoring case) gives 409; a duplicate email (ignoring case) gives 409; `role` in the body is ignored, so nobody can register as admin.
- Login: right password → 200 with token; wrong password and unknown email → the same 401; mixed-case email logs in.
- JWT: missing, malformed, expired, or signed with another secret → 401. After a password change or reset, older tokens → 401 and the token returned by the change works. A role change applies on the next request with the same token.
- Forgot/reset password: always 200 (even for unknown emails); the emailed token resets the password; the token works once only; an expired token gives 400; the old password stops working.
- `/users/me`: GET for a brand user and for an admin (`brand: null`); PUT changes the name; changing to an email already taken (any case) gives 409.
- `/users/me/password`: wrong current password → 400 and the old password still works; success → new password works.
- `/users`: the owner can invite with a brand role; an invite with `platform_admin` → 400; a manager or ops user can't invite (403); the list contains only the caller's brand.

## Task 3 — Roles and tenant isolation (`rbac.test.ts`, `tenancy.test.ts`)

Table-driven, so adding an endpoint means adding one row.

- **Role matrix:** for every brand endpoint × {owner, manager, ops, admin}, assert allowed (2xx or a validation 4xx) versus 403. The source of truth is the role table in the Swagger intro.
- **Admin:** gets 403 on every brand endpoint; only an admin can list brands, read stats or set approval.
- **Tenant isolation:** brand A's user, given brand B's product, variant, order or shipping-rule ids, gets **404** on GET/PUT/PATCH/DELETE. List endpoints never include brand B rows (including search and filters). Analytics for A ignore B's orders.

## Task 4 — Brands and approval (`brands.test.ts`)

- Approve → the brand can create orders. Reject → `isActive` is false, the brand can still sign in, and orders give 403. Re-approve → active again.
- `GET /brands?status=` filters and paginates; `/brands/stats` counts match the fixtures.
- Profile update: name or slug clashes (any case) → 409; `approvalStatus` and `isActive` in the body are ignored.

## Task 5 — Catalog and stock (`products.test.ts`, `inventory.test.ts`)

- Create with variants and images: every variant starts at 0 stock; a duplicate SKU → 409.
- Update with a variant list: entries with an id update, entries without are added, left-out variants are removed; removing a variant that has orders → 409; images are replaced in order.
- Archive (DELETE): the status becomes `archived`, the row stays, and it drops out of inventory lists.
- List: pagination, category and status filters, search by title or SKU (case-insensitive).
- Inventory: set quantity and threshold; negative or non-integer → 400; `?status=low|out` and the `summary` counts are correct; low-stock lists active products only, lowest first.

## Task 6 — Orders: the important one (`orders.test.ts`, `orders.concurrency.test.ts`)

- Create: stock goes down; each item stores the price at order time (`priceOverride ?? price`), and a later price change doesn't alter old orders; repeated variants are merged.
- Errors: over stock → 409 with `details.items` `{ sku, requested, available }` and **no stock taken**, even for the items that had enough; unknown or other-brand variant → 404 with `details.variantIds`; archived product → 422; pending or rejected brand → 403.
- State machine: table-driven over every from → to pair. Allowed pairs → 200; everything else → 422. Final states stay final.
- Cancel puts stock back once. Refund puts stock back. Refund after cancel doesn't restock again. A second refund → 409.
- **Concurrency** (real parallel requests with `Promise.all`):
  - N = 10 orders for the last unit → exactly one 201, nine 409, stock ends at 0.
  - Two orders that lock overlapping variants in opposite item order → both finish with no deadlock (checks the variantId lock ordering).
  - 5 parallel refunds of one order → stock returned exactly once.
  - Parallel cancel and refund on one order → stock returned exactly once.

## Task 7 — Shipping, analytics, uploads, system

- `shipping.test.ts`: CRUD; a $0 fee is allowed; `freeShippingThreshold: null` clears it; only the owner can delete.
- `analytics.test.ts`, using fixed orders at known dates:
  - Overview totals for each `range`; cancelled and refunded orders are left out of sales.
  - Top products respect `limit` (clamped 1–20).
  - Sales series: zero-filled days, oldest first, today included; `days` clamped.
  - Conversion rate from recorded traffic; recording the same day twice replaces it.
  - Turnover math.
- `uploads.test.ts`: PNG, JPEG, WebP and AVIF are accepted, detected from file contents; a text file renamed `.png` → 415; over 5 MB → 413; `GET /uploads/:id` is public and sets the cache headers; an unknown id → 404.
- `system.test.ts`: `/` and `/health` (200 and `database: "up"`); unknown route → 404 JSON; a body that isn't valid JSON → 400 in the error shape; a non-UUID id → 400.
- `rate-limit.test.ts`: low limits; login 429 after N failures (a success doesn't count); register and forgot-password 429.

## Task 8 — Units and the contract test

- Unit: `utils/pagination` (clamping), analytics range start dates, `dto/normalize` (slug and email normalisation), and `config` (with `NODE_ENV=production`, a missing or short `JWT_SECRET`, a default DB password or missing `ALLOWED_ORIGINS` throws). Config tests use `jest.isolateModules` with a controlled `process.env`.
- `contract.test.ts`: validates the JSON responses produced by the other suites against `swaggerDocument`, using Ajv on the dereferenced schemas. It also fails on fields the API returns but the spec doesn't list, on undocumented status codes, and on any operation no test called. This is the check run by hand for PR #10, made permanent, so the spec can't drift again.
- Turn on the coverage threshold.

## Task 9 — CI (last)

- In `.github/workflows/ci.yml`: re-enable the `push` and `pull_request` triggers. Give the backend job a `postgres:16` service container and set the test env, then run `npm test -- --coverage` after lint, typecheck and build.
- Upload the coverage report as an artifact.
- Mark Step 2 done in `TODO.md`.

**Verify:** a PR shows the backend job running the tests against Postgres and going red when a test fails.

---

## Out of scope

- Load or performance testing beyond the concurrency cases above.
- Exact timing of the unknown-email login path (equal-timing is a security property; a timing test would be flaky in CI).
- Graceful shutdown (process signals); manual check only.
- Frontend tests (separate plan item in Step 3.5).
