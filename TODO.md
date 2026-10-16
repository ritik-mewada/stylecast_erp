# StyleCast ERP — Road to "Complete"

Work through these one at a time. Each step gets its own branch and PR.

## Step 1 — Correctness & security fixes
Detailed plan: [docs/plans/2026-10-14-step1-correctness-fixes.md](docs/plans/2026-10-14-step1-correctness-fixes.md)

- [ ] 0. Local environment ready (Postgres running, typecheck baseline)
- [ ] 1. Add `platform_admin` role; stop register/invite from setting arbitrary roles
- [ ] 2. Brandless admin users + `create-admin` script; brand routes reject admin tokens
- [ ] 3. Brand approval restricted to platform admin; `GET /brands?status=` for admins
- [ ] 4. Scope inventory endpoints to the caller's brand
- [ ] 5. `POST /orders` with locked stock check and decrement (approved brands only)
- [ ] 6. Restock on cancel, and on refund unless already cancelled
- [ ] 7. `synchronize: false` + `InitialSchema` migration + prod migration script
- [ ] 8. Update Swagger and README
- [ ] 9. Typecheck/build clean, manual smoke run, PR

## Step 2 — Automated tests
- [ ] Jest + ts-jest + Supertest, separate test database, migrations run before the suite
- [ ] Auth: register, login, invalid token, role checks
- [ ] Tenant isolation: brand B can't see brand A's products, inventory or orders
- [ ] Orders: create, oversell 409, concurrent last-unit order, status machine, cancel/refund restock once
- [ ] Brand approval: admin-only, pending brand can't create orders
- [ ] GitHub Actions: typecheck + tests on every push/PR (Postgres service container)

## Step 3 — Seed, Docker, deploy
- [ ] `npm run seed`: an admin, one approved demo brand, products/variants/stock, ~50 orders over 30 days, traffic metrics
- [ ] `POST /analytics/traffic` (or a seed-only path) so conversion-rate has data
- [ ] Dockerfile (multi-stage) + `docker-compose.yml` with Postgres; `docker compose up` works from scratch
- [ ] `/health` checks the DB connection
- [ ] Login rate limiting (`express-rate-limit`)
- [ ] Deploy to Render or Railway with managed Postgres; migrations run on release
- [ ] Live Swagger link at `/api-docs`

## Step 3.5 — Frontend dashboard (`frontend/`)
Detailed plan: [docs/plans/2026-10-15-frontend-dashboard.md](docs/plans/2026-10-15-frontend-dashboard.md)

- [x] Design phase: every screen built on a mock API, reviewed and signed off (frontend `15ec478`)
- [ ] Backend endpoints the UI needs (list in the plan: spec JSON, CORS, search/filters, paginated inventory, sales series, admin stats, uploads, password flows, `/users/me`)
- [ ] API integration: Axios client + JWT, generated types, swap `src/api/*` mock bodies for HTTP, remove demo accounts and mocks
- [ ] Tests (Vitest, Playwright smoke), GitHub Actions
- [ ] Deploy to Vercel/Netlify; add the URL to `ALLOWED_ORIGINS`

## Step 4 — Polish
- [ ] Rename `TrafficMatric.ts` → `TrafficMetric.ts`
- [ ] ESLint config + `npm run lint` in CI
- [ ] README: live link, demo credentials, architecture diagram, design decisions (multi-tenancy, locking, state machine)
- [ ] Mark the project "Complete" on the portfolio and pin the repo on GitHub
