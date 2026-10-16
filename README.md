# StyleCast ERP

A multi-tenant ERP for independent fashion brands selling on the StyleCast marketplace. Brands manage products, variants and stock, take and fulfil orders, set shipping rates, and track sales. A platform admin reviews and approves new brands.

| App | Stack | Docs |
|---|---|---|
| [`backend/`](backend) | Node.js · Express 5 · TypeScript · TypeORM · PostgreSQL · JWT · Swagger | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend) | React 19 · Vite · TypeScript · TanStack Query · Tailwind CSS 4 · shadcn/ui · Recharts | [frontend/README.md](frontend/README.md) |

## Quick start

Each app has its own dependencies and runs on its own.

```bash
git clone https://github.com/ritik-mewada/stylecast_erp.git
cd stylecast_erp

# API on http://localhost:3000 (needs PostgreSQL and backend/.env; see backend/README.md)
cd backend && npm install && npm run dev

# Dashboard on http://localhost:5173 (in a second terminal)
cd frontend && npm install && npm run dev
```

The dashboard currently runs on a built-in mock API, so it works without the backend. Use the demo-account buttons on the login page to try each role.

## Repository layout

```
backend/     REST API
frontend/    Admin dashboard
docs/plans/  Implementation plans
TODO.md      Roadmap
```

## Status

The API covers brands, products, inventory, orders, shipping and analytics. Correctness and security fixes, including order creation with stock locking, are next. The dashboard design is done on mock data. Connecting it to the API is next. See [TODO.md](TODO.md).
