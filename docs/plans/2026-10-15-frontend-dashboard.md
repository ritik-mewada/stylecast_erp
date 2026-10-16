# Frontend — Admin Dashboard (Implementation Plan)

**Goal:** A web dashboard for StyleCast ERP so brand staff can manage products, inventory, orders and shipping, see analytics, and so a platform admin can approve brands — all on top of the existing REST API.

**Repo:** separate repo `stylecast_erp_frontend` (keeps the backend's Docker/deploy setup untouched).

**Status (2026-10-15):** design phase done and signed off. Every screen is built against an in-memory mock API (`src/api/*.ts`, `src/mocks/seed.ts`) whose functions mirror the backend endpoints and role rules. Next is API integration (Task 1 HTTP client, Task 0 type generation), which is blocked on the backend changes below. Frontend repo first commit: `15ec478`.

**Prerequisite for integration:** Step 1 merged. The UI depends on the `platform_admin` role, brand-scoped inventory, `GET /brands?status=` and `POST /orders`.

---

## Decisions (agreed 2026-10-15)

| Topic | Decision |
|---|---|
| Build | Vite + React + TypeScript (no SSR: everything sits behind a login) |
| Routing | React Router, protected routes, separate layouts for platform admin vs brand staff |
| Server state | TanStack Query (cache, invalidate after mutations, loading/error states) |
| Tables | shadcn `Table`. TanStack Table dropped: v9's API is still settling, and filtering/pagination happen server-side anyway |
| Forms | React Hook Form + Zod, mirroring the backend's class-validator DTOs |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| HTTP | Axios instance with JWT interceptor; 401 → clear session, redirect to login |
| API types | `openapi-typescript` generated from the backend's Swagger spec |
| Auth storage | JWT in `localStorage` (no refresh tokens in the API yet); decode role/brand from the token |
| Permissions | One `PERMISSIONS` table in `src/lib/domain.ts` mirroring `authorizeRoles()` on each route; used by the UI and enforced by the mock |
| Headings / logo | Geist semibold; custom SVG "S" mark on terracotta |

## Backend changes needed

Already in Step 1:

- [ ] `platform_admin` role, `GET /brands?status=`, admin-only `PATCH /brands/:id/approval`
- [ ] `POST /orders` with stock locking; restock on cancel/refund
- [ ] Brand-scoped inventory endpoints

New, needed by screens that exist in the UI:

- [ ] Serve the OpenAPI spec as JSON (`GET /api-docs.json`) for type generation
- [ ] Add the frontend origin (`http://localhost:5173`, deployed URL later) to `ALLOWED_ORIGINS`
- [ ] `user` (id, name, role, brandId) in the login response, or `GET /users/me`
- [ ] `search` query param on `GET /products` (title/SKU) and `GET /orders` (customer/email/order #); `paymentStatus` filter on `GET /orders`
- [ ] Paginated `GET /inventory?page=&limit=&status=low|out&search=` (the inventory page pages in the browser for now)
- [ ] `GET /analytics/sales-series` (daily revenue + order count for the dashboard chart)
- [ ] Platform stats for `/admin` (brand counts by status, brand user count)
- [ ] `POST /uploads` (multipart → `{ url }`) for product images
- [ ] `POST /auth/forgot-password` + reset-link flow
- [ ] `PUT /users/me` and `PUT /users/me/password` (Account page)

---

## Task 0 — Scaffold

- [x] `npm create vite@latest stylecast_erp_frontend -- --template react-ts`
- [x] Tailwind + shadcn/ui init; add base components (button, input, form, table, dialog, dropdown, badge, toast, card, select)
- [x] ESLint + Prettier, path alias `@/`
- [ ] `.env`: `VITE_API_URL=http://localhost:<backend port>`
- [ ] `npm run gen:api` → `openapi-typescript $VITE_API_URL/api-docs.json -o src/api/schema.d.ts`

## Task 1 — API layer & auth

**Files:** `src/api/client.ts`, `src/api/*.ts`, `src/auth/AuthProvider.tsx`, `src/auth/RequireRole.tsx`

- [ ] Axios client with base URL, `Authorization: Bearer` interceptor, 401 handler
- [ ] Normalize backend `AppError` responses into a single error shape for toasts and form errors
- [x] `AuthProvider`: login, logout, current user/role/brand, persisted session
- [x] `RequireRole` route guard; role-aware nav (hide actions a role can't perform, e.g. operations manager can't edit products)

## Task 2 — Auth pages

- [x] Login
- [x] Register (creates a `brand_owner` + brand; show "pending approval" state afterwards)
- [x] Pending-approval banner on every page while `brand.status !== approved`

## Task 3 — App shell

- [x] Sidebar + topbar layout, brand name, user menu, logout
- [x] Dark/light mode toggle
- [x] 404 and error boundary pages

## Task 4 — Dashboard (analytics)

Endpoints: `/analytics/overview`, `/top-products`, `/low-stock`, `/order-status`, `/inventory-turnover`, `/conversion-rate`

- [x] KPI tiles (revenue, orders, AOV, conversion rate)
- [x] Order-status breakdown chart, top products table, low-stock list, inventory turnover chart
- [x] Date-range filter (daily / weekly / monthly / all time)

## Task 5 — Products & variants

Endpoints: `GET/POST /products`, `GET/PUT/DELETE /products/:id`

- [x] Product list (search, pagination), product detail
- [x] Create/edit form with variants (size/colour/SKU/price override) and images
- [x] Delete with confirmation dialog (shadcn `AlertDialog`, not `window.confirm`)

## Task 6 — Inventory

Endpoints: `GET/PUT /inventory/variant/:variantId`, `GET /inventory/low-stock`

- [x] Stock table per variant with inline quantity edit
- [x] Low-stock filter / highlight

## Task 7 — Orders

Endpoints: `GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id/status`, `PATCH /orders/:id/refund`

- [x] Order list with status/payment filters
- [x] Order detail: items, totals, timeline
- [x] Status actions that follow the state machine (pending → confirmed → shipped → delivered; cancel; refund) — only show valid next steps
- [x] Create-order form (pick variants, quantities); surface 409 oversell and 403 unapproved-brand errors clearly

## Task 8 — Shipping rules & users

- [x] Shipping rules CRUD (`/shipping`)
- [x] Users list + invite (`/users`), role picker limited to brand roles

## Task 9 — Platform admin

- [x] Admin layout (no brand context)
- [x] Brand approval queue: `GET /brands?status=pending`, approve/reject via `PATCH /brands/:id/approval`

## Task 10 — Brand settings

- [x] Brand profile view/edit (`GET /brands/me`, `PUT /brands/profile`)

## Extras added during design

- [x] Forgot-password page, Account page (profile + password)
- [x] Product image upload UI (mocked)
- [x] First-run setup checklist on the dashboard
- [x] Route-level code splitting, inline error page, page-load progress bar

## Task 11 — Quality & deploy

- [ ] Vitest + React Testing Library for auth guard, order status actions, forms
- [ ] Playwright smoke test: login → create product → create order → cancel
- [ ] GitHub Actions: lint, typecheck, test, build
- [ ] Deploy to Vercel or Netlify, pointed at the deployed API; add the URL to backend `ALLOWED_ORIGINS`
- [ ] README with screenshots and demo credentials (from the Step 3 seed)
