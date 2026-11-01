// With VITE_API_URL set the app talks to the real API. Without it (the GitHub
// Pages demo until the backend is deployed) it runs on the in-memory mock in
// src/api/mock, which is only downloaded in that case.
export const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "")

export const DEMO_MODE = !API_URL

// Each src/api/<area>.ts exposes its functions through this: the first call
// loads the http or mock module, later calls reuse it. Typing every export as
// the http module's makes the mock module prove it has the same signatures.
export const lazyApi =
  <M extends Record<string, unknown>>(load: () => Promise<M>) =>
  <K extends keyof M>(name: K) =>
    (async (...args: unknown[]) => ((await load())[name] as (...a: unknown[]) => unknown)(...args)) as M[K]
