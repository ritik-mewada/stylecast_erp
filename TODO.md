# StyleCast ERP — Road to "Complete"

Work through these one at a time. Each step gets its own branch and PR.

## Step 1 — Correctness & security fixes
Detailed plan: [docs/plans/2026-10-14-step1-correctness-fixes.md](docs/plans/2026-10-14-step1-correctness-fixes.md)

- [x] 0. Local environment ready (Postgres running, typecheck baseline)
- [x] 1. Add `platform_admin` role; stop register/invite from setting arbitrary roles
- [x] 2. Brandless admin users + `create-admin` script; brand routes reject admin tokens
- [x] 3. Brand approval restricted to platform admin; `GET /brands?status=` for admins
- [x] 4. Scope inventory endpoints to the caller's brand
- [x] 5. `POST /orders` with locked stock check and decrement (approved brands only)
- [x] 6. Restock on cancel, and on refund unless already cancelled
- [x] 7. `synchronize: false` + `InitialSchema` migration + prod migration script
- [x] 8. Update Swagger and README
- [x] 9. Typecheck/build clean, manual smoke run
- [ ] Open the PR

## Step 2 — Automated tests
Detailed plan: [docs/plans/2026-10-31-backend-test-suite.md](docs/plans/2026-10-31-backend-test-suite.md)

- [ ] Jest + ts-jest + Supertest, separate test database, migrations run before the suite
- [ ] Auth: register, login, invalid token, role checks
- [ ] Tenant isolation: brand B can't see brand A's products, inventory or orders
- [ ] Orders: create, oversell 409, concurrent last-unit order, status machine, cancel/refund restock once
- [ ] Brand approval: admin-only, pending brand can't create orders
- [ ] GitHub Actions: typecheck + tests on every push/PR (Postgres service container)

## Step 3 — Seed, Docker, deploy
- [x] `npm run seed`: an admin, one approved demo brand, products/variants/stock, ~50 orders over 30 days, traffic metrics
- [x] `POST /analytics/traffic` so conversion-rate has data
- [ ] Dockerfile (multi-stage) + `docker-compose.yml` with Postgres; `docker compose up` works from scratch *(deferred for now)*
- [x] `/health` checks the DB connection
- [x] Login rate limiting (`express-rate-limit`)
- [x] Deploy-ready: `DATABASE_URL`, `TRUST_PROXY`, `npm run start:prod` runs migrations on start (see [backend/README.md](backend/README.md#deploying))
- [ ] Deploy to Render or Railway with managed Postgres (needs an account: create the service with the settings in the backend README, then `npm run seed:prod` or `create-admin`)
- [ ] Live Swagger link at `/api-docs` (served locally already; link once deployed)

## Step 3.5 — Frontend dashboard (`frontend/`)
Detailed plan: [docs/plans/2026-10-15-frontend-dashboard.md](docs/plans/2026-10-15-frontend-dashboard.md)

- [x] Design phase: every screen built on a mock API, reviewed and signed off (frontend `15ec478`)
- [x] Backend endpoints the UI needs (spec JSON, CORS, search/filters, paginated inventory, sales series, admin stats, uploads, password flows, `/users/me`)
- [x] API integration: Axios client + JWT, `src/api/http/*` for every area; the mock stays as a demo mode for Pages until the API is deployed (then remove it and the demo accounts)
  - [x] Store the new `token` returned by `PUT /users/me/password`; treat a 401 as signed out
  - [ ] Team page: change a member's role (`PATCH /users/:id/role`) and remove a member (`DELETE /users/:id`)
  - [ ] Add the `/reset-password?token=…` page that the reset email links to (calls `POST /auth/reset-password`)
- [x] GitHub Actions CI: lint, typecheck, build (frontend and backend)
- [x] Mock-API demo deployed to GitHub Pages (`deploy-pages.yml`)
- [ ] Re-enable automatic CI triggers (paused during development; manual runs only). Deploy already runs on merge.
- [ ] Tests (Vitest, Playwright smoke), added to CI
- [ ] Once integrated, point the Pages build at the deployed API (`VITE_API_URL`) and add `https://ritik-mewada.github.io` to `ALLOWED_ORIGINS`

## Step 4 — Polish
- [x] Rename `TrafficMatric.ts` → `TrafficMetric.ts`
- [x] ESLint config + `npm run lint` in CI (backend; the frontend uses oxlint)
- [x] Backend README: setup, demo credentials, roles, design decisions (multi-tenancy, locking, state machine)
- [ ] Root README: live link, screenshots, architecture diagram
- [ ] Mark the project "Complete" on the portfolio and pin the repo on GitHub
