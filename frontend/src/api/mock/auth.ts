import type { Brand, User } from "@/types/models"
import { ApiError, clone, db, delay, timestamp } from "./db"
import { uid } from "@/mocks/seed"
import { can, type Permission } from "@/lib/domain"
import type { RegisterInput, Session, UpdateProfileInput } from "../auth"

// Mock session. The real client will store the JWT instead of a user id.
const SESSION_KEY = "stylecast.session"

const readSession = () => {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

const writeSession = (userId: string | null) => {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage blocked: the session just won't survive a reload.
  }
}

export const currentUser = () => {
  const id = readSession()
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new ApiError(401, "Not authenticated")
  return user
}

// Mirrors authorizeRoles() on the backend routes.
export const requirePermission = (permission: Permission) => {
  if (!can(currentUser().role, permission)) throw new ApiError(403, "You don't have permission to do that")
}

export const currentBrandId = () => {
  const user = currentUser()
  if (!user.brandId) throw new ApiError(403, "This action requires a brand account")
  return user.brandId
}

const toSession = (user: User): Session => ({
  user: clone(user),
  brand: clone(db.brands.find((b) => b.id === user.brandId) ?? null),
})

export async function getSession(): Promise<Session | null> {
  await delay(120)
  try {
    return toSession(currentUser())
  } catch {
    return null
  }
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  await delay()
  const user = db.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())
  if (!user || !input.password) throw new ApiError(401, "Invalid email or password")
  writeSession(user.id)
  return toSession(user)
}

export async function register(input: RegisterInput): Promise<Session> {
  await delay()
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ApiError(409, "An account with this email already exists")
  }
  if (db.brands.some((b) => b.slug === input.brandSlug)) {
    throw new ApiError(409, "That brand URL is already taken")
  }
  const now = timestamp()
  const brand: Brand = {
    id: uid(),
    name: input.brandName,
    slug: input.brandSlug,
    companyInfo: "",
    website: "",
    shippingOrigin: "",
    brandCategory: "",
    contactEmail: input.email,
    contactPhone: "",
    approvalStatus: "pending",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
  const user: User = {
    id: uid(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    role: "brand_owner",
    brandId: brand.id,
    createdAt: now,
    updatedAt: now,
  }
  db.brands.push(brand)
  db.users.push(user)
  writeSession(user.id)
  return toSession(user)
}

export async function logout() {
  writeSession(null)
}

// Proposed POST /auth/forgot-password. Always succeeds so the response can't reveal which emails exist.
export async function requestPasswordReset(_input: { email: string }): Promise<void> {
  await delay()
}

// POST /auth/reset-password. The mock sends no email, so any non-empty token works.
export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await delay()
  if (!input.token) throw new ApiError(400, "This reset link is invalid or has expired")
  if (input.newPassword.length < 8) throw new ApiError(400, "newPassword must be at least 8 characters")
}

// Proposed PUT /users/me
export async function updateProfile(input: UpdateProfileInput): Promise<Session> {
  await delay()
  const user = currentUser()
  const taken = db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === input.email.toLowerCase())
  if (taken) throw new ApiError(409, "Another account already uses this email")
  Object.assign(user, input, { updatedAt: timestamp() })
  return toSession(user)
}

// Proposed PUT /users/me/password
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await delay()
  currentUser()
  if (!input.currentPassword) throw new ApiError(400, "Enter your current password")
  if (input.newPassword.length < 8) throw new ApiError(400, "New password must be at least 8 characters")
  if (input.newPassword === input.currentPassword) {
    throw new ApiError(400, "New password must be different from the current one")
  }
}
