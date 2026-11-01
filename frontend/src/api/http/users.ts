import type { User } from "@/types/models"
import type { InviteUserInput } from "../users"
import { http } from "./client"

export async function listUsers(): Promise<User[]> {
  return (await http.get("/users")).data
}

export async function inviteUser(input: InviteUserInput): Promise<User> {
  return (await http.post("/users", input)).data
}
