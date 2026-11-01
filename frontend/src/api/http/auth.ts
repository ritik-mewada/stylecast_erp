import type { User } from "@/types/models"
import type { RegisterInput, Session, UpdateProfileInput } from "../auth"
import { type ApiBrand, toBrand } from "./brand"
import { http, tokenStore } from "./client"

const toSession = (data: { user: User; brand: ApiBrand | null }): Session => ({
  user: data.user,
  brand: data.brand && toBrand(data.brand),
})

// GET /users/me: login and register return the user and token but not the brand.
const fetchSession = async () => toSession((await http.get("/users/me")).data)

export async function getSession(): Promise<Session | null> {
  if (!tokenStore.get()) return null
  try {
    return await fetchSession()
  } catch {
    // A rejected token was already cleared by the client.
    return null
  }
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  const { data } = await http.post<{ token: string }>("/auth/login", input)
  tokenStore.set(data.token)
  return fetchSession()
}

export async function register(input: RegisterInput): Promise<Session> {
  const { data } = await http.post<{ token: string }>("/auth/register", input)
  tokenStore.set(data.token)
  return fetchSession()
}

export async function logout() {
  tokenStore.set(null)
}

export async function requestPasswordReset(input: { email: string }): Promise<void> {
  await http.post("/auth/forgot-password", input)
}

// The link's token works once. Success ends every session for the account.
export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await http.post("/auth/reset-password", input)
}

export async function updateProfile(input: UpdateProfileInput): Promise<Session> {
  return toSession((await http.put("/users/me", input)).data)
}

// A password change ends every session, this one included; the response
// carries the token that replaces it.
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  const { data } = await http.put<{ token: string }>("/users/me/password", input)
  tokenStore.set(data.token)
}
