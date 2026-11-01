import type { User } from "@/types/models"
import { uid } from "@/mocks/seed"
import { currentBrandId, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./db"
import type { InviteUserInput } from "../users"

// GET /users
export async function listUsers(): Promise<User[]> {
  await delay()
  requirePermission("viewTeam")
  const brandId = currentBrandId()
  return clone(db.users.filter((u) => u.brandId === brandId))
}

// POST /users
export async function inviteUser(input: InviteUserInput): Promise<User> {
  await delay()
  requirePermission("manageUsers")
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ApiError(409, "A user with this email already exists")
  }
  const now = timestamp()
  const { password: _password, ...fields } = input
  const user: User = { id: uid(), ...fields, brandId: currentBrandId(), createdAt: now, updatedAt: now }
  db.users.push(user)
  return clone(user)
}
