import axios, { AxiosError } from "axios"
import type { Paginated } from "@/types/models"
import { ApiError } from "../errors"
import { API_URL } from "../mode"

// JWT from login, register or a password change. The API has no refresh
// tokens; when it stops accepting this one (expired, password changed,
// account removed) the user signs in again.
const TOKEN_KEY = "stylecast.token"

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Storage blocked: the session just won't survive a reload.
    }
  },
}

// AuthProvider registers this to drop the session when the API rejects the token.
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

export const http = axios.create({ baseURL: `${API_URL}/api/v1` })

http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; details?: Record<string, unknown> }>) => {
    const response = error.response
    if (!response) {
      throw new ApiError(0, "Can't reach the server. Check your connection and try again.")
    }
    // Only a request that carried a token means "signed out": a 401 from
    // login with a wrong password must not clear anything.
    if (response.status === 401 && error.config?.headers?.Authorization) {
      tokenStore.set(null)
      onUnauthorized()
    }
    const message = response.data?.message ?? "Something went wrong. Please try again."
    throw new ApiError(response.status, message, response.data?.details)
  },
)

// The API's list envelope, mapped to the shape the pages use.
interface ApiPage<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const API_MAX_LIMIT = 100

export const toPaginated = <T, R = T>(
  page: ApiPage<T>,
  map: (row: T) => R = (row) => row as unknown as R,
): Paginated<R> => ({
  data: page.data.map(map),
  total: page.pagination.total,
  page: page.pagination.page,
  limit: page.pagination.limit,
})

// Some pages ask for more rows than the API returns at once (it caps limit at
// 100), e.g. the inventory table and the order picker. Fetch pages until the
// requested number of rows (or the end) is reached and return them as page 1.
export async function getPaginated<T, R = T>(
  path: string,
  params: Record<string, unknown> & { page?: number; limit?: number },
  map?: (row: T) => R,
): Promise<Paginated<R>> {
  const { page = 1, limit = 20, ...filters } = params
  if (limit <= API_MAX_LIMIT) {
    const { data } = await http.get<ApiPage<T>>(path, { params: { ...filters, page, limit } })
    return toPaginated(data, map)
  }
  const rows: T[] = []
  let total = 0
  for (let next = 1; rows.length < limit; next++) {
    const { data } = await http.get<ApiPage<T>>(path, { params: { ...filters, page: next, limit: API_MAX_LIMIT } })
    rows.push(...data.data)
    total = data.pagination.total
    if (next >= data.pagination.totalPages) break
  }
  return toPaginated({ data: rows.slice(0, limit), pagination: { page: 1, limit, total, totalPages: 1 } }, map)
}

// Optional text the API stores as null; the pages expect strings.
export const text = (value: string | null | undefined) => value ?? ""
