import type { BrandRole, User } from "@/types/models"
import type { InviteUserInput } from "../users"
import { http } from "./client"

export async function listUsers(): Promise<User[]> {
  return (await http.get("/users")).data
}

export async function inviteUser(input: InviteUserInput): Promise<User> {
  return (await http.post("/users", input)).data
}

// Owner only, and never on yourself (422). Applies on the member's next request.
export async function updateUserRole(id: string, role: BrandRole): Promise<User> {
  return (await http.patch(`/users/${id}/role`, { role })).data
}

// Owner only, and never yourself (422). The member is signed out at once.
export async function removeUser(id: string): Promise<void> {
  await http.delete(`/users/${id}`)
}
