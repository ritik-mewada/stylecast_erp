# StyleCast ERP — Frontend

Admin dashboard for the [StyleCast ERP API](../backend).

**Stack:** Vite · React 19 · TypeScript · React Router 7 · TanStack Query · React Hook Form + Zod · Tailwind CSS 4 · shadcn/ui (Base UI) · Recharts

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run format     # Prettier, no semicolons, 120 cols
npm run build
```

## Design phase: mock API

Every screen runs against an in-memory mock of the backend, so the UI can be built and reviewed before API integration.

- `src/mocks/seed.ts`: deterministic demo data (one approved brand, pending brands, 24 products, ~84 orders over 30 days). Resets on reload.
- `src/api/*.ts`: one module per backend resource. Each function is named after and shaped like its endpoint (`// GET /orders`, `// PATCH /orders/:id/status`, …) and mirrors the backend's rules: tenant scoping, order state machine, stock checks, restock on cancel/refund.
- `src/types/models.ts`: mirrors the TypeORM entities.

**API integration** = replace each function body in `src/api/` with an HTTP call. Pages and hooks don't change.

Sign in with the demo-account buttons on the login page to see each role (owner, manager, operations, platform admin). Any password works in mock mode. The mock enforces the same role rules as the backend's `authorizeRoles()`, defined once in `PERMISSIONS` (`src/lib/domain.ts`).

## Needs backend work before integration

- `GET /brands?status=` and `platform_admin` role (Step 1)
- `POST /orders` with stock locking (Step 1)
- `GET /analytics/sales-series` (daily revenue for the dashboard chart; not in the API yet)
- Admin platform stats (brand/user counts for `/admin`; not in the API yet)
- `search` query param on `GET /products` (title/SKU) and `GET /orders` (customer/email/order #), plus `paymentStatus` on orders
- `GET /inventory?page=&limit=&status=low|out&search=`: paginated variant stock list. The inventory page currently loads every product and pages in the browser.
- `POST /uploads` (multipart → `{ url }`): product image upload. The mock stores images as data URLs.
- `POST /auth/forgot-password` plus a reset-link flow
- `PUT /users/me` and `PUT /users/me/password`: the Account page
- `GET /api-docs.json` for generating API types
