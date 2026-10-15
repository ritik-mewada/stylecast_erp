# Step 1 — Correctness & Security Fixes (Implementation Plan)

**Goal:** Make the API behave correctly end to end: only a platform admin can approve brands, approved brands can create orders that reserve stock, cancelling/refunding returns stock, inventory is tenant-isolated, and the schema is managed by migrations.

**Branch:** `fix/orders-approval-migrations`

**Architecture:** Keep the existing Routes → Controllers → Services → TypeORM layering. Stock-changing work runs inside `AppDataSource.transaction()` with row locks (`pessimistic_write`) so concurrent orders can't oversell and concurrent cancel/refund can't restock twice.

---

## Decisions (agreed 2026-10-14)

| Topic | Decision |
|---|---|
| Brand approval | New `platform_admin` role. Admin users have **no brand** (`brandId = null`), are created only by a CLI script, can't register via the API, and can't call brand endpoints. |
| Who creates orders | Brand staff (owner / manager / ops) via `POST /orders`, scoped to their own brand. Returns **403 unless the brand is `approved`**, which is also what gives approval a real effect. |
| Restock rules | Cancel → restock. Refund → restock **unless the order was already cancelled** (stock is never returned twice). Assumes refunded goods come back. |
| Pricing | Each order item stores a price snapshot: `variant.priceOverride ?? product.price`. |
| Schema | `synchronize: false` everywhere. One `InitialSchema` migration generated from the entities **after** the entity changes below. |

## Extra bugs found during review (in scope)

- `GET/PUT /inventory/variant/:variantId` don't filter by brand, so any brand can read or overwrite another brand's stock.
- `RegisterDto` and `CreateUserDto` accept any `UserRole`. Once `platform_admin` exists, that would let anyone sign up as admin.

---

## Task 0 — Local environment

- [ ] Start local Postgres without registering a login service: `pg_ctl -D "$(brew --prefix)/var/postgresql@<ver>" start` (or Postgres.app).
- [ ] `npm install` (already done once; `node_modules` is present).
- [ ] `npm run typecheck` passes on the untouched code. Record any pre-existing errors before changing anything.

## Task 1 — Roles: add platform admin, lock down role inputs

**Files:** `src/utils/index.ts`, `src/dto/RegisterDto.ts`, `src/types/auth.ts`, `src/services/auth.ts`, `src/dto/CreateUserDto.ts`

- [ ] Add `PLATFORM_ADMIN = "platform_admin"` to `UserRole`.
- [ ] Export `BRAND_ROLES = [BRAND_OWNER, BRAND_MANAGER, OPERATIONS_MANAGER]`.
- [ ] Remove `role` from `RegisterDto`/`RegisterInput`. Registration always creates a `brand_owner`.
- [ ] `CreateUserDto.role`: replace `@IsEnum(UserRole)` with `@IsIn(BRAND_ROLES)`.
- [ ] **Verify:** register with `"role":"platform_admin"` → field ignored, user is `brand_owner`. Invite with `platform_admin` → 400.

## Task 2 — Brandless admin users

**Files:** `src/entity/User.ts`, `src/middleware/auth.ts`, `src/utils/jwt.ts`, new `src/utils/brand.ts`, new `src/scripts/create-admin.ts`, `package.json`, `.env.example`

- [ ] `User.brandId` → `@Column({ type: "uuid", nullable: true }) brandId!: string | null`. Also make the relation nullable.
- [ ] `AuthRequest.user.brandId: string | null`.
- [ ] Add `getBrandId(req)` helper that throws `AppError(403, "This action requires a brand account")` when `brandId` is null. Replace every `req.user!.brandId` in controllers with it (defence in depth).
- [ ] Every brand route lists roles explicitly. Change the routes that use only `authenticate` (`GET /brands/me`, `GET /inventory/variant/:id`, `GET /inventory/low-stock`, `GET /shipping`) to `authorizeRoles(...BRAND_ROLES)`.
- [ ] `src/scripts/create-admin.ts`: reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` from env, hashes the password, and upserts a `platform_admin` user with `brandId: null`. Script: `"create-admin": "ts-node src/scripts/create-admin.ts"`.
- [ ] **Verify:** an admin token calling `GET /products` → 403, and admin login works.

## Task 3 — Brand approval (admin only)

**Files:** `src/routes/brand.ts`, `src/controllers/brand.ts`, `src/services/brand.ts`, new `src/dto/UpdateBrandApprovalDto.ts`

- [ ] `PATCH /brands/:id/approval` → `authorizeRoles(UserRole.PLATFORM_ADMIN)` + `validate(UpdateBrandApprovalDto)` (`@IsEnum(BrandApprovalStatus)`). Remove the manual check in the controller.
- [ ] Validate `:id` is a UUID (400, not a Postgres 500).
- [ ] New `GET /brands?status=pending` (admin only, paginated like orders) so an admin can find brands to review.
- [ ] Drop `approvalStatus` from `UpdateBrandDto`/`UpdateBrandInput`, so the destructure-and-ignore workaround in `updateBrandProfile` can go.
- [ ] **Verify:** a brand owner calling approval → 403. Admin approves → 200, and `GET /brands/me` shows `approved`.

## Task 4 — Tenant-scope inventory

**Files:** `src/services/inventory.ts`, `src/controllers/inventory.ts`

- [ ] `getInventoryByVariant(variantId, brandId)` and `updateInventory(variantId, brandId, data)` first load the variant with `innerJoin product` and `product.brandId = :brandId`. If none is found → 404 (not 403, so it doesn't reveal other brands' IDs).
- [ ] **Verify:** brand B reading or updating brand A's variant → 404, and brand A still works.

## Task 5 — `POST /orders` with stock reservation

**Files:** new `src/dto/CreateOrderDto.ts`, `src/types/order.ts`, `src/services/order.ts`, `src/controllers/order.ts`, `src/routes/order.ts`

- [ ] `CreateOrderDto`: `customerName`, `customerEmail` (`IsEmail`), `shippingCountry`, `shippingCity`, `shippingPostalCode`, optional `shippingAddressLine1/2`, `shippingStateOrProvince`, `items: CreateOrderItemDto[]` (`ArrayMinSize(1)`, `ArrayMaxSize(50)`). Item: `variantId` (`IsUUID`), `quantity` (`IsInt`, `Min(1)`).
- [ ] `OrderService.createOrder(brandId, input)` inside `AppDataSource.transaction(async (m) => …)`:
  1. Load the brand. If it isn't `approved` → `403 "Brand must be approved before taking orders"`.
  2. Merge duplicate `variantId`s by summing their quantities.
  3. Load the variants joined to their product, where `product.brandId = :brandId`. Any missing → 404 listing the IDs. Any `product.status = archived` → 422.
  4. Lock the inventory rows: `m.getRepository(Inventory).createQueryBuilder("i").setLock("pessimistic_write").where("i.variantId IN (:...ids)").orderBy("i.variantId")`. A **sorted** lock order avoids deadlocks.
  5. Any `quantity < requested` → `409 "Insufficient stock"` with `{ sku, requested, available }[]`.
  6. Decrement stock, then save the `Order` and its `OrderItem`s with the price snapshot.
- [ ] Route: `POST /orders`, `authorizeRoles(...BRAND_ROLES)`, `validate(CreateOrderDto)`, responds 201.
- [ ] **Verify:** a pending brand gets 403. Approved brand: create → stock drops. Over-ordering gets 409 and stock is unchanged (rollback). Two simultaneous orders for the last unit → exactly one succeeds.

## Task 6 — Restock on cancel / refund

**Files:** `src/services/order.ts`

- [ ] Private `restock(m: EntityManager, orderId)`: loads the items, locks the inventory rows (sorted), and increments the quantities.
- [ ] `updateOrderStatus`: run in a transaction, lock the order row (`pessimistic_write`), keep the state machine, and call `restock` when `newStatus === CANCELLED`.
- [ ] `processRefund`: run in a transaction, lock the order row, and remember `previousStatus`. Restock if `previousStatus !== CANCELLED`, then set it to refunded.
- [ ] **Verify:** cancel → stock restored. Cancel then refund → restored once only. Two refunds at once → one returns 409, restored once.

## Task 7 — Switch to migrations

**Files:** `src/data-source.ts`, `package.json`, new `src/migrations/<ts>-InitialSchema.ts`, `README.md`

- [ ] `synchronize: false`. Fix the stale header comment.
- [ ] Make the globs work from both `src` and `dist`: `entities` (keep the imports) and `migrations: [__dirname + "/migrations/*.{ts,js}"]`.
- [ ] Scripts:
  - `"migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts"` (usage: `npm run migration:generate -- src/migrations/InitialSchema`)
  - `"migration:run"` (existing), `"migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/data-source.ts"`
  - `"migration:run:prod": "typeorm migration:run -d dist/data-source.js"`
- [ ] Generate `InitialSchema` against an **empty** DB (`createdb stylecast_erp_fresh`), **after** Tasks 1–6 so it includes nullable `brandId` and the new enum value. Read the SQL before committing.
- [ ] The existing local DB was built by `synchronize`, so drop and recreate it, then run `npm run migration:run`.
- [ ] **Verify:** fresh DB + `migration:run` + `npm run dev` starts. Running `migration:generate` again produces "No changes".

## Task 8 — Docs

**Files:** `src/config/swagger.ts`, `README.md`, `.env.example`

- [ ] Swagger: add `POST /orders` (201/400/403/404/409/422), `GET /brands`, the approval endpoint now admin-only, `platform_admin` in the role list, and remove `role` from register.
- [ ] README: role table, admin setup (`npm run create-admin`), migration workflow, stock/restock rules, and an updated endpoint table.

## Task 9 — Final check

- [ ] `npm run typecheck` and `npm run build` are clean.
- [ ] Manual smoke run of all the **Verify** items above (curl or Swagger). Step 2 will turn these into automated tests.
- [ ] Commit per task (small, focused commits), then open a PR.

---

## Out of scope (later steps)

Automated tests (step 2), seed data / Docker / deploy (step 3), README polish (step 4), traffic-metric ingestion and the `TrafficMatric.ts` filename typo, login rate limiting.
