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

## API and demo mode

The app runs in one of two modes, chosen at build time:

- **Real API** when `VITE_API_URL` is set: `cp .env.example .env.local` points it at the backend on `http://localhost:8080` (start that first, see [backend/README.md](../backend/README.md)). Sign in with an account from the backend's seed.
- **Demo** when it isn't: everything runs on an in-memory mock with demo-account buttons on the login page and any password accepted. The GitHub Pages build uses this until the API is deployed.

How `src/api/` is laid out:

- `src/api/<area>.ts`: what the pages import. Each file defines the input types and loads either `http/<area>.ts` or `mock/<area>.ts` on first use, so a build only downloads the one it uses. Both are typed against the http module, so the mock can't drift from the real signatures.
- `src/api/http/`: Axios calls to `/api/v1`. They map API responses to the shapes in `src/types/models.ts` (pagination envelope, `null` optional fields). `client.ts` stores the JWT, sends it on every request, turns error responses into `ApiError { status, message, details }`, and signs the user out when the API rejects the token (expired, password changed elsewhere, account removed).
- `src/api/mock/` and `src/mocks/seed.ts`: the mock backend (one approved brand, pending brands, 24 products, ~84 orders over 30 days; resets on reload). It mirrors the backend's rules: tenant scoping, the order state machine, stock checks, restock on cancel/refund, and the role rules in `PERMISSIONS` (`src/lib/domain.ts`).
