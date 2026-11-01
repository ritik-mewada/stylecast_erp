import type { BrandRole, User } from "@/types/models"
import { uid } from "@/mocks/seed"
import { currentBrandId, currentUser, requirePermission } from "./auth"
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

// Same rules as the API: your brand only (404 otherwise), never yourself (422).
const findTeamMember = (id: string, action: string) => {
  requirePermission("manageUsers")
  const user = db.users.find((u) => u.id === id && u.brandId === currentBrandId())
  if (!user) throw new ApiError(404, "User not found")
  if (user.id === currentUser().id) throw new ApiError(422, `You can't ${action}`)
  return user
}

// PATCH /users/:id/role
export async function updateUserRole(id: string, role: BrandRole): Promise<User> {
  await delay()
  const user = findTeamMember(id, "change your own role")
  user.role = role
  user.updatedAt = timestamp()
  return clone(user)
}

// DELETE /users/:id
export async function removeUser(id: string): Promise<void> {
  await delay()
  const user = findTeamMember(id, "remove yourself")
  db.users = db.users.filter((u) => u.id !== user.id)
}
